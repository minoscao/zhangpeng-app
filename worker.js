const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';
const DEFAULT_MODEL = 'qwen-image-3.0-pro';
const MAX_PROMPT_LENGTH = 6000;
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const TASK_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const SIZE_BY_RATIO = Object.freeze({
  '1:1': '1280*1280',
  '3:4': '960*1280',
  '4:3': '1280*960',
  '9:16': '720*1280',
  '16:9': '1280*720',
});

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function publicConfig(env) {
  return {
    provider: 'qwen',
    qwenConfigured: Boolean(env.QWEN_API_KEY),
    accessConfigured: Boolean(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD),
    model: env.QWEN_MODEL || DEFAULT_MODEL,
    maxBatchSize: 24,
  };
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

function decodeJwtPart(value) {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(value)));
}

async function fetchAccessJwks(teamDomain, ctx) {
  const issuer = `https://${teamDomain}.cloudflareaccess.com`;
  const cacheKey = new Request(`${issuer}/cdn-cgi/access/certs`);
  const cache = caches.default;
  let response = await cache.match(cacheKey);
  if (!response) {
    response = await fetch(cacheKey);
    if (!response.ok) throw new Error('ACCESS_CERTS_UNAVAILABLE');
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=3600');
    ctx.waitUntil(cache.put(cacheKey, cached.clone()));
    response = cached;
  }
  return response.json();
}

function claimIncludesAudience(claim, audience) {
  return Array.isArray(claim) ? claim.includes(audience) : claim === audience;
}

async function verifyAccess(request, env, ctx) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return { ok: false, response: jsonResponse({ error: { code: 'ACCESS_NOT_CONFIGURED', message: 'Cloudflare Access 尚未完成配置。' } }, 503) };
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) {
    return { ok: false, response: jsonResponse({ error: { code: 'AUTH_REQUIRED', message: '请先完成 Cloudflare Access 授权登录。' } }, 401) };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('INVALID_JWT');
    const header = decodeJwtPart(parts[0]);
    const payload = decodeJwtPart(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN}.cloudflareaccess.com`;
    if (header.alg !== 'RS256' || !header.kid) throw new Error('INVALID_JWT_HEADER');
    if (payload.iss !== issuer || !claimIncludesAudience(payload.aud, env.ACCESS_AUD)) throw new Error('INVALID_JWT_CLAIMS');
    if (!payload.exp || payload.exp < now - 60 || (payload.nbf && payload.nbf > now + 60)) throw new Error('EXPIRED_JWT');

    const jwks = await fetchAccessJwks(env.ACCESS_TEAM_DOMAIN, ctx);
    const jwk = jwks.keys?.find((key) => key.kid === header.kid);
    if (!jwk) throw new Error('UNKNOWN_SIGNING_KEY');
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      fromBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!verified) throw new Error('INVALID_SIGNATURE');
    return { ok: true, identity: { email: payload.email || '', subject: payload.sub || '' } };
  } catch {
    return { ok: false, response: jsonResponse({ error: { code: 'AUTH_INVALID', message: '登录状态无效或已过期，请重新授权。' } }, 403) };
  }
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }
}

function validateReferenceImages(images, requestUrl) {
  if (!Array.isArray(images)) return [];
  if (images.length > 3) throw new Error('TOO_MANY_IMAGES');
  return images.map((value) => {
    if (typeof value !== 'string') throw new Error('INVALID_IMAGE');
    if (/^data:image\/(?:png|jpe?g|webp|bmp|gif|tiff);base64,/i.test(value)) {
      if (value.length > MAX_BODY_BYTES) throw new Error('IMAGE_TOO_LARGE');
      return value;
    }
    const imageUrl = new URL(value, requestUrl);
    if (imageUrl.origin !== requestUrl.origin || !imageUrl.pathname.startsWith('/assets/')) throw new Error('INVALID_IMAGE_URL');
    return imageUrl.href;
  });
}

function upstreamErrorMessage(data, status) {
  if (status === 429 || data?.code === 'Throttling') return '模型请求过于频繁，请稍后重试。';
  if (data?.code === 'DataInspectionFailed') return '提示词或参考图未通过内容安全检查，请调整后重试。';
  if (data?.code === 'InvalidApiKey') return '模型密钥无效，请联系管理员更新。';
  return data?.message ? String(data.message).slice(0, 240) : '千问模型暂时无法处理请求，请稍后重试。';
}

async function createQwenTask(request, env) {
  if (!env.QWEN_API_KEY) return jsonResponse({ error: { code: 'QWEN_NOT_CONFIGURED', message: '千问模型密钥尚未配置。' } }, 503);
  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const tooLarge = error.message === 'BODY_TOO_LARGE';
    return jsonResponse({ error: { code: error.message, message: tooLarge ? '参考图文件过大，单次请求不能超过 12MB。' : '请求内容不是有效 JSON。' } }, tooLarge ? 413 : 400);
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return jsonResponse({ error: { code: 'INVALID_PROMPT', message: `提示词长度需在 1-${MAX_PROMPT_LENGTH} 个字符之间。` } }, 400);
  }

  let referenceImages;
  try {
    referenceImages = validateReferenceImages(body.referenceImages, new URL(request.url));
  } catch (error) {
    return jsonResponse({ error: { code: error.message, message: '参考图必须来自本站素材目录，最多 3 张且单张不超过 10MB。' } }, 400);
  }

  const content = [...referenceImages.map((image) => ({ image })), { text: prompt }];
  const upstream = await fetch(`${env.DASHSCOPE_BASE_URL || DASHSCOPE_BASE_URL}/services/aigc/image-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.QWEN_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: env.QWEN_MODEL || DEFAULT_MODEL,
      input: { messages: [{ role: 'user', content }] },
      parameters: {
        negative_prompt: '文字，水印，商标，变形帐篷，错误支架，多余结构，低清晰度，模糊，过度磨皮，廉价塑料感',
        size: SIZE_BY_RATIO[body.ratio] || SIZE_BY_RATIO['4:3'],
        n: 1,
        prompt_extend: true,
        prompt_extend_mode: 'direct',
        watermark: false,
        enable_thinking: true,
      },
    }),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !data?.output?.task_id) {
    return jsonResponse({ error: { code: data?.code || 'QWEN_UPSTREAM_ERROR', message: upstreamErrorMessage(data, upstream.status) } }, upstream.status === 429 ? 429 : 502);
  }
  return jsonResponse({ taskId: data.output.task_id, taskStatus: data.output.task_status || 'PENDING' }, 202);
}

async function getQwenTask(taskId, env) {
  if (!env.QWEN_API_KEY) return jsonResponse({ error: { code: 'QWEN_NOT_CONFIGURED', message: '千问模型密钥尚未配置。' } }, 503);
  if (!TASK_ID_PATTERN.test(taskId)) return jsonResponse({ error: { code: 'INVALID_TASK_ID', message: '任务编号格式无效。' } }, 400);
  const upstream = await fetch(`${env.DASHSCOPE_BASE_URL || DASHSCOPE_BASE_URL}/tasks/${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${env.QWEN_API_KEY}` },
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return jsonResponse({ error: { code: data?.code || 'QWEN_TASK_ERROR', message: upstreamErrorMessage(data, upstream.status) } }, upstream.status === 429 ? 429 : 502);
  }
  const output = data.output || {};
  const imageUrls = Array.isArray(output.results) ? output.results.map((item) => item?.url).filter(Boolean) : [];
  return jsonResponse({
    taskId,
    taskStatus: output.task_status || 'UNKNOWN',
    imageUrls,
    error: output.message ? { code: output.code || 'GENERATION_FAILED', message: String(output.message).slice(0, 240) } : null,
  });
}

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === '/api/config' && request.method === 'GET') return jsonResponse(publicConfig(env));

  if (!url.pathname.startsWith('/api/qwen/')) return jsonResponse({ error: { code: 'NOT_FOUND', message: '接口不存在。' } }, 404);
  const authorization = await verifyAccess(request, env, ctx);
  if (!authorization.ok) return authorization.response;

  if (url.pathname === '/api/qwen/session' && request.method === 'GET') {
    const redirectTarget = url.searchParams.get('redirect');
    if (redirectTarget?.startsWith('/') && !redirectTarget.startsWith('//')) return Response.redirect(new URL(redirectTarget, url.origin), 302);
    return jsonResponse({ authenticated: true, user: authorization.identity.email || '已授权用户' });
  }
  if (url.pathname === '/api/qwen/generate' && request.method === 'POST') return createQwenTask(request, env);
  const taskMatch = url.pathname.match(/^\/api\/qwen\/tasks\/([^/]+)$/);
  if (taskMatch && request.method === 'GET') return getQwenTask(taskMatch[1], env);
  return jsonResponse({ error: { code: 'NOT_FOUND', message: '接口不存在。' } }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
