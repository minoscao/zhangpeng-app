const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';
const DASHSCOPE_MODELS_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const QWEN_GENERATION_PROFILES = Object.freeze({
  fast: Object.freeze({ model: 'qwen-image-3.0', enableThinking: false, promptExtend: false }),
  quality: Object.freeze({ model: 'qwen-image-3.0-pro', enableThinking: true, promptExtend: true }),
});
const OPENAI_GENERATION_PROFILES = Object.freeze({
  fast: Object.freeze({ model: 'gpt-image-2', quality: 'low' }),
  quality: Object.freeze({ model: 'gpt-image-2.5-sunburst', quality: 'high' }),
});
const DEFAULT_PROFILE = 'fast';
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
const OPENAI_SIZE_BY_RATIO = Object.freeze({
  '1:1': '1024x1024',
  '3:4': '1152x1536',
  '4:3': '1536x1152',
  '9:16': '864x1536',
  '16:9': '1536x864',
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
    provider: 'openai',
    providers: ['openai', 'qwen'],
    userKeyRequired: true,
    model: OPENAI_GENERATION_PROFILES[DEFAULT_PROFILE].model,
    models: {
      openai: Object.fromEntries(Object.entries(OPENAI_GENERATION_PROFILES).map(([key, value]) => [key, value.model])),
      qwen: Object.fromEntries(Object.entries(QWEN_GENERATION_PROFILES).map(([key, value]) => [key, value.model])),
    },
    generationProfiles: Object.keys(OPENAI_GENERATION_PROFILES),
    maxBatchSize: 24,
  };
}

function qwenGenerationProfile(value) {
  return QWEN_GENERATION_PROFILES[value] || QWEN_GENERATION_PROFILES[DEFAULT_PROFILE];
}

function openAiGenerationProfile(value) {
  return OPENAI_GENERATION_PROFILES[value] || OPENAI_GENERATION_PROFILES[DEFAULT_PROFILE];
}

function qwenApiKey(request) {
  const key = (request.headers.get('X-Qwen-Api-Key') || '')
    .replace(/\\([_.-])/g, '$1')
    .replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
  return /^sk-[A-Za-z0-9._-]{16,512}$/.test(key) ? key : '';
}

function openAiApiKey(request) {
  const key = (request.headers.get('X-OpenAI-Api-Key') || '')
    .replace(/\\([_.-])/g, '$1')
    .replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
  return /^sk-[A-Za-z0-9._-]{16,512}$/.test(key) ? key : '';
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
  const detail = data?.message || data?.error?.message || '';
  if (status === 429 || data?.code === 'Throttling') return '模型请求过于频繁，请稍后重试。';
  if (data?.code === 'DataInspectionFailed') return '提示词或参考图未通过内容安全检查，请调整后重试。';
  if (status === 401 || data?.code === 'InvalidApiKey') return '密钥无效或已失效，请重新输入。';
  if (/Failed to download image URL/i.test(detail)) return '参考产品图无法被模型读取，请重新上传底图后重试。';
  return detail ? String(detail).slice(0, 240) : '千问模型暂时无法处理请求，请稍后重试。';
}

function openAiErrorMessage(data, status) {
  const detail = String(data?.error?.message || data?.message || '').slice(0, 240);
  const code = data?.error?.code || data?.error?.type || '';
  if (status === 401 || code === 'invalid_api_key') return 'OpenAI API Key 无效或已失效，请重新输入。';
  if (status === 403) return detail || '当前 OpenAI 项目没有所选图像模型的访问权限。';
  if (status === 429 && code === 'insufficient_quota') return 'OpenAI API 额度不足或尚未启用 API 计费，请检查 OpenAI API 平台账户。';
  if (status === 429) return 'OpenAI 请求频率已达上限，请稍后重试或减少单批图片数量。';
  if (status === 400) return detail || 'OpenAI 无法处理当前提示词或参考图，请调整后重试。';
  return detail || 'OpenAI 图像模型暂时无法处理请求，请稍后重试。';
}

function qwenImageUrls(output) {
  const legacyUrls = Array.isArray(output?.results) ? output.results.map((item) => item?.url) : [];
  const choiceUrls = Array.isArray(output?.choices)
    ? output.choices.flatMap((choice) => Array.isArray(choice?.message?.content) ? choice.message.content.map((item) => item?.image) : [])
    : [];
  return [...new Set([...choiceUrls, ...legacyUrls].filter((value) => typeof value === 'string' && /^https:\/\//i.test(value)))];
}

async function validateQwenKey(apiKey, env) {
  const upstream = await fetch(env.DASHSCOPE_MODELS_URL || DASHSCOPE_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (upstream.ok) return jsonResponse({ valid: true, provider: 'qwen', model: QWEN_GENERATION_PROFILES[DEFAULT_PROFILE].model });
  const data = await upstream.json().catch(() => ({}));
  const code = upstream.status === 429 ? 'QWEN_RATE_LIMITED' : 'KEY_INVALID';
  return jsonResponse({ error: { code, message: upstreamErrorMessage(data, upstream.status) } }, upstream.status === 429 ? 429 : 401);
}

async function createQwenTask(request, env, apiKey) {
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
  const profile = qwenGenerationProfile(body.generationMode);
  const parameters = {
    negative_prompt: '文字，水印，商标，变形帐篷，错误支架，多余结构，低清晰度，模糊，过度磨皮，廉价塑料感',
    size: SIZE_BY_RATIO[body.ratio] || SIZE_BY_RATIO['4:3'],
    n: 1,
    prompt_extend: profile.promptExtend,
    watermark: false,
    enable_thinking: profile.enableThinking,
  };
  if (profile.promptExtend) parameters.prompt_extend_mode = 'direct';
  const upstream = await fetch(`${env.DASHSCOPE_BASE_URL || DASHSCOPE_BASE_URL}/services/aigc/image-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: profile.model,
      input: { messages: [{ role: 'user', content }] },
      parameters,
    }),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !data?.output?.task_id) {
    if (upstream.status === 401 || data?.code === 'InvalidApiKey') return jsonResponse({ error: { code: 'KEY_INVALID', message: upstreamErrorMessage(data, upstream.status) } }, 401);
    return jsonResponse({ error: { code: data?.code || 'QWEN_UPSTREAM_ERROR', message: upstreamErrorMessage(data, upstream.status) } }, upstream.status === 429 ? 429 : 502);
  }
  return jsonResponse({ taskId: data.output.task_id, taskStatus: data.output.task_status || 'PENDING', model: profile.model }, 202);
}

async function validateOpenAiKey(apiKey, env) {
  const upstream = await fetch(`${env.OPENAI_BASE_URL || OPENAI_BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (upstream.ok) return jsonResponse({ valid: true, provider: 'openai', model: OPENAI_GENERATION_PROFILES[DEFAULT_PROFILE].model });
  const data = await upstream.json().catch(() => ({}));
  return jsonResponse(
    { error: { code: upstream.status === 429 ? 'OPENAI_RATE_LIMITED' : 'KEY_INVALID', message: openAiErrorMessage(data, upstream.status) } },
    upstream.status === 429 ? 429 : 401,
  );
}

function dataUrlToBlob(value) {
  const match = value.match(/^data:(image\/(?:png|jpe?g|webp|bmp|gif|tiff));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) throw new Error('INVALID_IMAGE');
  let binary;
  try {
    binary = atob(match[2].replace(/[\r\n]/g, ''));
  } catch {
    throw new Error('INVALID_IMAGE');
  }
  if (binary.length > MAX_BODY_BYTES) throw new Error('IMAGE_TOO_LARGE');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: match[1].toLowerCase() });
}

function imageExtension(mimeType) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  return 'jpg';
}

async function referenceImageBlob(value, requestUrl, env) {
  if (value.startsWith('data:image/')) return dataUrlToBlob(value);
  const imageUrl = new URL(value, requestUrl);
  if (imageUrl.origin !== requestUrl.origin || !imageUrl.pathname.startsWith('/assets/')) throw new Error('INVALID_IMAGE_URL');
  const response = await env.ASSETS.fetch(new Request(imageUrl));
  if (!response.ok) throw new Error('INVALID_IMAGE_URL');
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.startsWith('image/')) throw new Error('INVALID_IMAGE');
  const blob = await response.blob();
  if (blob.size > MAX_BODY_BYTES) throw new Error('IMAGE_TOO_LARGE');
  return blob;
}

async function createOpenAiImage(request, env, apiKey) {
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
  if (!referenceImages.length) return jsonResponse({ error: { code: 'REFERENCE_REQUIRED', message: '请先选择至少一张产品参考图。' } }, 400);

  const profile = openAiGenerationProfile(body.generationMode);
  const form = new FormData();
  form.append('model', profile.model);
  form.append('prompt', `${prompt}\n禁止出现文字、商标、水印、错误支架、多余结构、模糊或廉价塑料质感。`);
  form.append('quality', profile.quality);
  form.append('size', OPENAI_SIZE_BY_RATIO[body.ratio] || OPENAI_SIZE_BY_RATIO['4:3']);
  form.append('output_format', 'jpeg');
  form.append('output_compression', '90');
  try {
    for (let index = 0; index < referenceImages.length; index += 1) {
      const blob = await referenceImageBlob(referenceImages[index], new URL(request.url), env);
      form.append('image[]', blob, `reference-${index + 1}.${imageExtension(blob.type)}`);
    }
  } catch (error) {
    return jsonResponse({ error: { code: error.message, message: '参考产品图无法读取，请重新上传底图后重试。' } }, 400);
  }

  const upstream = await fetch(`${env.OPENAI_BASE_URL || OPENAI_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const status = upstream.status === 429 ? 429 : upstream.status === 401 ? 401 : 502;
    return jsonResponse({ error: { code: data?.error?.code || 'OPENAI_UPSTREAM_ERROR', message: openAiErrorMessage(data, upstream.status) } }, status);
  }
  const output = data?.data?.[0] || {};
  const imageUrl = typeof output.b64_json === 'string'
    ? `data:image/jpeg;base64,${output.b64_json}`
    : typeof output.url === 'string' ? output.url : '';
  if (!imageUrl) return jsonResponse({ error: { code: 'OPENAI_EMPTY_RESULT', message: 'OpenAI 已完成请求，但响应中没有图片，请重试。' } }, 502);
  return jsonResponse({ imageUrl, model: profile.model, quality: profile.quality, provider: 'openai' });
}

async function getQwenTask(taskId, env, apiKey) {
  if (!TASK_ID_PATTERN.test(taskId)) return jsonResponse({ error: { code: 'INVALID_TASK_ID', message: '任务编号格式无效。' } }, 400);
  const upstream = await fetch(`${env.DASHSCOPE_BASE_URL || DASHSCOPE_BASE_URL}/tasks/${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    if (upstream.status === 401 || data?.code === 'InvalidApiKey') return jsonResponse({ error: { code: 'KEY_INVALID', message: upstreamErrorMessage(data, upstream.status) } }, 401);
    return jsonResponse({ error: { code: data?.code || 'QWEN_TASK_ERROR', message: upstreamErrorMessage(data, upstream.status) } }, upstream.status === 429 ? 429 : 502);
  }
  const output = data.output || {};
  const imageUrls = qwenImageUrls(output);
  return jsonResponse({
    taskId,
    taskStatus: output.task_status || 'UNKNOWN',
    imageUrls,
    error: output.message ? { code: output.code || 'GENERATION_FAILED', message: String(output.message).slice(0, 240) } : null,
  });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/config' && request.method === 'GET') return jsonResponse(publicConfig(env));

  if (url.pathname.startsWith('/api/qwen/')) {
    const apiKey = qwenApiKey(request);
    if (!apiKey) return jsonResponse({ error: { code: 'KEY_REQUIRED', message: '请先输入有效的千问 API Key。' } }, 401);
    if (url.pathname === '/api/qwen/validate' && request.method === 'POST') return validateQwenKey(apiKey, env);
    if (url.pathname === '/api/qwen/generate' && request.method === 'POST') return createQwenTask(request, env, apiKey);
    const taskMatch = url.pathname.match(/^\/api\/qwen\/tasks\/([^/]+)$/);
    if (taskMatch && request.method === 'GET') return getQwenTask(taskMatch[1], env, apiKey);
  }

  if (url.pathname.startsWith('/api/openai/')) {
    const apiKey = openAiApiKey(request);
    if (!apiKey) return jsonResponse({ error: { code: 'KEY_REQUIRED', message: '请先输入有效的 OpenAI API Key。' } }, 401);
    if (url.pathname === '/api/openai/validate' && request.method === 'POST') return validateOpenAiKey(apiKey, env);
    if (url.pathname === '/api/openai/generate' && request.method === 'POST') return createOpenAiImage(request, env, apiKey);
  }
  return jsonResponse({ error: { code: 'NOT_FOUND', message: '接口不存在。' } }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
