const SESSION_COOKIE = '__Host-designflow_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const RESET_TTL_SECONDS = 30 * 60;
// Cloudflare Workers Web Crypto rejects PBKDF2 iteration counts above 100,000.
// Keep the exact applied value with each user so a future algorithm upgrade can
// remain backward-compatible with existing password hashes.
const PASSWORD_ITERATIONS = 100_000;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const AUTH_BODY_LIMIT = 16 * 1024;
const encoder = new TextEncoder();

function authJson(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...headers,
    },
  });
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = String(value).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(value).length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function sha256(value) {
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(String(value)))));
}

async function derivePasswordHash(password, salt, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: base64UrlToBytes(salt), iterations }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}

function constantTimeEqual(left, right) {
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  if (!a.length || !b.length) return false;
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) mismatch |= (a[index % a.length] || 0) ^ (b[index % b.length] || 0);
  return mismatch === 0;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value);
}

function validName(value) {
  const name = String(value || '').trim();
  return name.length >= 2 && name.length <= 40 ? name : '';
}

function passwordProblem(password, email = '') {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符。`;
  if (password.length > PASSWORD_MAX_LENGTH) return `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符。`;
  if (email && password.toLowerCase().includes(email.split('@')[0])) return '密码不能包含邮箱账号。';
  return '';
}

async function readAuthBody(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > AUTH_BODY_LIMIT) throw new Error('BODY_TOO_LARGE');
  const raw = await request.text();
  if (encoder.encode(raw).byteLength > AUTH_BODY_LIMIT) throw new Error('BODY_TOO_LARGE');
  const body = JSON.parse(raw || '{}');
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_JSON');
  return body;
}

function cookieValue(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  for (const entry of cookies.split(';')) {
    const [key, ...parts] = entry.trim().split('=');
    if (key === name) return decodeURIComponent(parts.join('='));
  }
  return '';
}

function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;
}

function sameOriginRequest(request) {
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite === 'cross-site') return false;
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

function authEnabled(env) {
  return Boolean(env?.AUTH_DB);
}

function recoveryEnabled(env) {
  return Boolean(env?.EMAIL && env?.AUTH_EMAIL_FROM);
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function rateLimitKey(request, scope, identity = '') {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return `${scope}:${await sha256(`${ip}:${identity}`)}`;
}

async function consumeRateLimit(db, key, maximum, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const row = await db.prepare('SELECT window_start, attempts FROM auth_rate_limits WHERE key = ?1').bind(key).first();
  if (!row || now - Number(row.window_start) >= windowSeconds) {
    await db.prepare('INSERT INTO auth_rate_limits (key, window_start, attempts) VALUES (?1, ?2, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, attempts = 1').bind(key, now).run();
    return true;
  }
  if (Number(row.attempts) >= maximum) return false;
  await db.prepare('UPDATE auth_rate_limits SET attempts = attempts + 1 WHERE key = ?1').bind(key).run();
  return true;
}

async function userSession(request, env) {
  if (!authEnabled(env)) return null;
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token || token.length > 160) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.AUTH_DB.prepare(`
    SELECT u.id, u.email, u.name, u.created_at, s.token_hash
    FROM auth_sessions s
    JOIN auth_users u ON u.id = s.user_id
    WHERE s.token_hash = ?1 AND s.expires_at > ?2 AND u.status = 'active'
  `).bind(tokenHash, now).first();
  return row ? { user: publicUser(row), tokenHash } : null;
}

async function createSession(env, userId) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  await env.AUTH_DB.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?1').bind(now).run();
  await env.AUTH_DB.prepare('INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(crypto.randomUUID(), userId, tokenHash, now, now + SESSION_TTL_SECONDS).run();
  return { token, tokenHash };
}

async function register(request, env) {
  const limitKey = await rateLimitKey(request, 'register');
  if (!await consumeRateLimit(env.AUTH_DB, limitKey, 5, 60 * 60)) return authJson({ error: { code: 'RATE_LIMITED', message: '注册尝试过于频繁，请稍后再试。' } }, 429);
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '注册信息格式无效。' } }, 400); }
  const email = normalizeEmail(body.email);
  const name = validName(body.name);
  const password = body.password;
  const passwordError = passwordProblem(password, email);
  if (!name) return authJson({ error: { code: 'INVALID_NAME', message: '姓名需要填写 2–40 个字符。' } }, 400);
  if (!validEmail(email)) return authJson({ error: { code: 'INVALID_EMAIL', message: '请输入有效的邮箱地址。' } }, 400);
  if (passwordError) return authJson({ error: { code: 'WEAK_PASSWORD', message: passwordError } }, 400);
  const existing = await env.AUTH_DB.prepare('SELECT id FROM auth_users WHERE email = ?1').bind(email).first();
  if (existing) return authJson({ error: { code: 'ACCOUNT_EXISTS', message: '该邮箱已经注册，请直接登录或找回密码。' } }, 409);
  const salt = randomToken(16);
  const passwordHash = await derivePasswordHash(password, salt);
  const userId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.AUTH_DB.prepare(`
    INSERT INTO auth_users (id, email, name, password_hash, password_salt, password_iterations, status, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'active', ?7, ?7)
  `).bind(userId, email, name, passwordHash, salt, PASSWORD_ITERATIONS, now).run();
  const session = await createSession(env, userId);
  return authJson({ authenticated: true, user: { id: userId, email, name, createdAt: now }, recoveryEnabled: recoveryEnabled(env) }, 201, { 'Set-Cookie': sessionCookie(session.token) });
}

async function login(request, env) {
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '登录信息格式无效。' } }, 400); }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const limitKey = await rateLimitKey(request, 'login', email);
  if (!await consumeRateLimit(env.AUTH_DB, limitKey, 10, 15 * 60)) return authJson({ error: { code: 'RATE_LIMITED', message: '登录尝试过于频繁，请 15 分钟后再试。' } }, 429);
  const row = validEmail(email) ? await env.AUTH_DB.prepare('SELECT * FROM auth_users WHERE email = ?1 AND status = ?2').bind(email, 'active').first() : null;
  const salt = row?.password_salt || 'AAAAAAAAAAAAAAAAAAAAAA';
  const iterations = Number(row?.password_iterations) || PASSWORD_ITERATIONS;
  const candidateHash = await derivePasswordHash(password.slice(0, PASSWORD_MAX_LENGTH), salt, iterations);
  if (!row || !constantTimeEqual(candidateHash, row.password_hash)) return authJson({ error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码不正确。' } }, 401);
  const now = Math.floor(Date.now() / 1000);
  await env.AUTH_DB.prepare('UPDATE auth_users SET last_login_at = ?1, updated_at = ?1 WHERE id = ?2').bind(now, row.id).run();
  const session = await createSession(env, row.id);
  return authJson({ authenticated: true, user: publicUser(row), recoveryEnabled: recoveryEnabled(env) }, 200, { 'Set-Cookie': sessionCookie(session.token) });
}

async function logout(request, env) {
  const session = await userSession(request, env);
  if (session) await env.AUTH_DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?1').bind(session.tokenHash).run();
  return authJson({ authenticated: false }, 200, { 'Set-Cookie': clearSessionCookie() });
}

async function sendPasswordReset(env, request, user, token) {
  if (!recoveryEnabled(env)) return false;
  const appUrl = new URL(request.url);
  const resetUrl = `${appUrl.origin}/#reset-password?token=${encodeURIComponent(token)}`;
  const safeName = String(user.name || '用户').replace(/[<>&"']/g, '');
  await env.EMAIL.send({
    to: user.email,
    from: env.AUTH_EMAIL_FROM,
    subject: '重置创想设计平台密码',
    text: `${safeName}，请在 30 分钟内打开以下链接重置密码：\n${resetUrl}\n如果不是你发起的请求，请忽略本邮件。`,
    html: `<p>${safeName}，你好：</p><p>请在 30 分钟内使用下面的安全链接重置创想设计平台密码。</p><p><a href="${resetUrl}">重置密码</a></p><p>如果不是你发起的请求，请忽略本邮件。</p>`,
  });
  return true;
}

async function forgotPassword(request, env) {
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '请求格式无效。' } }, 400); }
  const email = normalizeEmail(body.email);
  const limitKey = await rateLimitKey(request, 'forgot', email);
  if (!await consumeRateLimit(env.AUTH_DB, limitKey, 5, 60 * 60)) return authJson({ ok: true, message: '如果该邮箱已注册，系统会发送重置邮件。', recoveryEnabled: recoveryEnabled(env) });
  const user = validEmail(email) ? await env.AUTH_DB.prepare('SELECT id, email, name FROM auth_users WHERE email = ?1 AND status = ?2').bind(email, 'active').first() : null;
  if (user && recoveryEnabled(env)) {
    const token = randomToken();
    const tokenHash = await sha256(token);
    const now = Math.floor(Date.now() / 1000);
    await env.AUTH_DB.prepare('DELETE FROM auth_password_resets WHERE user_id = ?1 OR expires_at <= ?2').bind(user.id, now).run();
    await env.AUTH_DB.prepare('INSERT INTO auth_password_resets (id, user_id, token_hash, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(crypto.randomUUID(), user.id, tokenHash, now, now + RESET_TTL_SECONDS).run();
    try { await sendPasswordReset(env, request, user, token); }
    catch (error) { console.error(JSON.stringify({ event: 'auth_reset_email_failed', errorName: error?.name || 'Error' })); }
  }
  return authJson({ ok: true, message: '如果该邮箱已注册，系统会发送重置邮件。', recoveryEnabled: recoveryEnabled(env) });
}

async function resetPassword(request, env) {
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '重置请求格式无效。' } }, 400); }
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const password = body.password;
  const passwordError = passwordProblem(password);
  if (!token || token.length > 160) return authJson({ error: { code: 'INVALID_RESET_TOKEN', message: '重置链接无效或已过期，请重新申请。' } }, 400);
  if (passwordError) return authJson({ error: { code: 'WEAK_PASSWORD', message: passwordError } }, 400);
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const reset = await env.AUTH_DB.prepare(`
    SELECT r.id, r.user_id, u.email
    FROM auth_password_resets r JOIN auth_users u ON u.id = r.user_id
    WHERE r.token_hash = ?1 AND r.expires_at > ?2 AND r.used_at IS NULL AND u.status = 'active'
  `).bind(tokenHash, now).first();
  if (!reset) return authJson({ error: { code: 'INVALID_RESET_TOKEN', message: '重置链接无效或已过期，请重新申请。' } }, 400);
  const emailPasswordError = passwordProblem(password, reset.email);
  if (emailPasswordError) return authJson({ error: { code: 'WEAK_PASSWORD', message: emailPasswordError } }, 400);
  const salt = randomToken(16);
  const passwordHash = await derivePasswordHash(password, salt);
  await env.AUTH_DB.batch([
    env.AUTH_DB.prepare('UPDATE auth_users SET password_hash = ?1, password_salt = ?2, password_iterations = ?3, updated_at = ?4 WHERE id = ?5').bind(passwordHash, salt, PASSWORD_ITERATIONS, now, reset.user_id),
    env.AUTH_DB.prepare('UPDATE auth_password_resets SET used_at = ?1 WHERE id = ?2').bind(now, reset.id),
    env.AUTH_DB.prepare('DELETE FROM auth_sessions WHERE user_id = ?1').bind(reset.user_id),
  ]);
  return authJson({ ok: true, message: '密码已更新，请使用新密码登录。' });
}

async function updateProfile(request, env, session) {
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '资料格式无效。' } }, 400); }
  const name = validName(body.name);
  if (!name) return authJson({ error: { code: 'INVALID_NAME', message: '姓名需要填写 2–40 个字符。' } }, 400);
  const now = Math.floor(Date.now() / 1000);
  await env.AUTH_DB.prepare('UPDATE auth_users SET name = ?1, updated_at = ?2 WHERE id = ?3').bind(name, now, session.user.id).run();
  return authJson({ user: { ...session.user, name } });
}

async function changePassword(request, env, session) {
  let body;
  try { body = await readAuthBody(request); }
  catch { return authJson({ error: { code: 'INVALID_REQUEST', message: '密码信息格式无效。' } }, 400); }
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = body.newPassword;
  const passwordError = passwordProblem(newPassword, session.user.email);
  if (passwordError) return authJson({ error: { code: 'WEAK_PASSWORD', message: passwordError } }, 400);
  const row = await env.AUTH_DB.prepare('SELECT password_hash, password_salt, password_iterations FROM auth_users WHERE id = ?1').bind(session.user.id).first();
  const candidateHash = await derivePasswordHash(currentPassword.slice(0, PASSWORD_MAX_LENGTH), row.password_salt, Number(row.password_iterations));
  if (!constantTimeEqual(candidateHash, row.password_hash)) return authJson({ error: { code: 'INVALID_CURRENT_PASSWORD', message: '当前密码不正确。' } }, 401);
  const salt = randomToken(16);
  const passwordHash = await derivePasswordHash(newPassword, salt);
  const now = Math.floor(Date.now() / 1000);
  const nextSession = await createSession(env, session.user.id);
  await env.AUTH_DB.batch([
    env.AUTH_DB.prepare('UPDATE auth_users SET password_hash = ?1, password_salt = ?2, password_iterations = ?3, updated_at = ?4 WHERE id = ?5').bind(passwordHash, salt, PASSWORD_ITERATIONS, now, session.user.id),
    env.AUTH_DB.prepare('DELETE FROM auth_sessions WHERE user_id = ?1 AND token_hash <> ?2').bind(session.user.id, nextSession.tokenHash),
  ]);
  return authJson({ ok: true, message: '密码已更新，其他设备已退出。' }, 200, { 'Set-Cookie': sessionCookie(nextSession.token) });
}

export function authPublicConfig(env) {
  return {
    required: authEnabled(env),
    registrationEnabled: authEnabled(env),
    passwordResetEnabled: recoveryEnabled(env),
  };
}

export async function requireAuthenticatedUser(request, env) {
  if (!authEnabled(env)) return { user: null, tokenHash: '' };
  const session = await userSession(request, env);
  if (session) return session;
  return authJson({ error: { code: 'AUTH_REQUIRED', message: '登录状态已失效，请重新登录。' } }, 401, { 'Set-Cookie': clearSessionCookie() });
}

export async function handleAuthRoute(request, env) {
  if (!authEnabled(env)) return authJson({ error: { code: 'AUTH_NOT_CONFIGURED', message: '云端账户系统尚未配置。' } }, 503);
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  if (method !== 'GET' && !sameOriginRequest(request)) return authJson({ error: { code: 'CROSS_SITE_REQUEST', message: '请求来源无效，请刷新页面后重试。' } }, 403);

  if (url.pathname === '/api/auth/session' && method === 'GET') {
    const session = await userSession(request, env);
    return authJson({ authenticated: Boolean(session), user: session?.user || null, recoveryEnabled: recoveryEnabled(env) });
  }
  if (url.pathname === '/api/auth/register' && method === 'POST') return register(request, env);
  if (url.pathname === '/api/auth/login' && method === 'POST') return login(request, env);
  if (url.pathname === '/api/auth/logout' && method === 'POST') return logout(request, env);
  if (url.pathname === '/api/auth/forgot-password' && method === 'POST') return forgotPassword(request, env);
  if (url.pathname === '/api/auth/reset-password' && method === 'POST') return resetPassword(request, env);

  const session = await userSession(request, env);
  if (!session) return authJson({ error: { code: 'AUTH_REQUIRED', message: '登录状态已失效，请重新登录。' } }, 401, { 'Set-Cookie': clearSessionCookie() });
  if (url.pathname === '/api/auth/profile' && method === 'PATCH') return updateProfile(request, env, session);
  if (url.pathname === '/api/auth/change-password' && method === 'POST') return changePassword(request, env, session);
  if (url.pathname === '/api/auth/sessions/revoke-others' && method === 'POST') {
    await env.AUTH_DB.prepare('DELETE FROM auth_sessions WHERE user_id = ?1 AND token_hash <> ?2').bind(session.user.id, session.tokenHash).run();
    return authJson({ ok: true, message: '其他设备的登录状态已退出。' });
  }
  return authJson({ error: { code: 'NOT_FOUND', message: '账户接口不存在。' } }, 404);
}

export const __authTest = { derivePasswordHash, sha256, normalizeEmail, passwordProblem, sessionCookie, PASSWORD_ITERATIONS };
