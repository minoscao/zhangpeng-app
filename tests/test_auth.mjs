import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker from '../worker.js';
import { __authTest } from '../auth.js';

class D1Statement {
  constructor(database, sql, params = []) {
    this.database = database;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) { return new D1Statement(this.database, this.sql, params); }
  async first() { return this.database.prepare(this.sql).get(...this.params) || null; }
  async run() { return this.database.prepare(this.sql).run(...this.params); }
  async all() { return { results: this.database.prepare(this.sql).all(...this.params) }; }
}

class D1Database {
  constructor() {
    this.database = new DatabaseSync(':memory:');
    this.database.exec(readFileSync(new URL('../migrations/0001_auth.sql', import.meta.url), 'utf8'));
  }

  prepare(sql) { return new D1Statement(this.database, sql); }
  async batch(statements) {
    this.database.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

const sentEmails = [];
const env = {
  AUTH_DB: new D1Database(),
  AUTH_EMAIL_FROM: 'accounts@example.com',
  EMAIL: { send: async (message) => { sentEmails.push(message); } },
  ASSETS: { fetch: async () => new Response('asset') },
};

assert.equal(__authTest.PASSWORD_ITERATIONS, 100_000, 'Cloudflare Workers PBKDF2 limit must not be exceeded');

async function jsonRequest(path, method = 'GET', body, cookie = '') {
  const headers = { Origin: 'https://app.example', 'CF-Connecting-IP': '203.0.113.7' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  return worker.fetch(new Request(`https://app.example${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), env);
}

const configResponse = await jsonRequest('/api/config');
const config = await configResponse.json();
assert.deepEqual(config.auth, { required: true, registrationEnabled: true, passwordResetEnabled: true });

const blockedResponse = await jsonRequest('/api/openai/validate', 'POST');
assert.equal(blockedResponse.status, 401);
assert.equal((await blockedResponse.json()).error.code, 'AUTH_REQUIRED');

const registerResponse = await jsonRequest('/api/auth/register', 'POST', {
  name: '测试设计师',
  email: 'designer@example.com',
  password: 'Strong!Password2026',
});
assert.equal(registerResponse.status, 201);
const registered = await registerResponse.json();
assert.equal(registered.user.email, 'designer@example.com');
const firstCookie = registerResponse.headers.get('set-cookie').split(';')[0];
assert.match(registerResponse.headers.get('set-cookie'), /Secure; HttpOnly; SameSite=Strict/);

const sessionResponse = await jsonRequest('/api/auth/session', 'GET', undefined, firstCookie);
assert.equal((await sessionResponse.json()).user.name, '测试设计师');

const profileResponse = await jsonRequest('/api/auth/profile', 'PATCH', { name: '帐篷设计师' }, firstCookie);
assert.equal(profileResponse.status, 200);
assert.equal((await profileResponse.json()).user.name, '帐篷设计师');

const duplicateResponse = await jsonRequest('/api/auth/register', 'POST', {
  name: '另一个人', email: 'designer@example.com', password: 'Another!Password2026',
});
assert.equal(duplicateResponse.status, 409);

const wrongLogin = await jsonRequest('/api/auth/login', 'POST', { email: 'designer@example.com', password: 'wrong-password' });
assert.equal(wrongLogin.status, 401);

const forgotResponse = await jsonRequest('/api/auth/forgot-password', 'POST', { email: 'designer@example.com' });
assert.equal(forgotResponse.status, 200);
assert.equal(sentEmails.length, 1);
assert.equal(sentEmails[0].to, 'designer@example.com');
const resetToken = /token=([A-Za-z0-9_-]+)/.exec(sentEmails[0].text)?.[1];
assert.ok(resetToken);

const resetResponse = await jsonRequest('/api/auth/reset-password', 'POST', { token: resetToken, password: 'Reset!Password2026' });
assert.equal(resetResponse.status, 200);

const expiredSession = await jsonRequest('/api/auth/session', 'GET', undefined, firstCookie);
assert.equal((await expiredSession.json()).authenticated, false);

const reusedReset = await jsonRequest('/api/auth/reset-password', 'POST', { token: resetToken, password: 'Third!Password2026' });
assert.equal(reusedReset.status, 400);

const loginResponse = await jsonRequest('/api/auth/login', 'POST', { email: 'designer@example.com', password: 'Reset!Password2026' });
assert.equal(loginResponse.status, 200);
const secondCookie = loginResponse.headers.get('set-cookie').split(';')[0];

const changeResponse = await jsonRequest('/api/auth/change-password', 'POST', {
  currentPassword: 'Reset!Password2026', newPassword: 'Final!Password2026',
}, secondCookie);
assert.equal(changeResponse.status, 200);
assert.match(changeResponse.headers.get('set-cookie'), /__Host-designflow_session=/);

const logoutResponse = await jsonRequest('/api/auth/logout', 'POST', {}, changeResponse.headers.get('set-cookie').split(';')[0]);
assert.equal(logoutResponse.status, 200);
assert.match(logoutResponse.headers.get('set-cookie'), /Max-Age=0/);

const brokenAuthEnv = {
  AUTH_DB: { prepare() { throw new DOMException('simulated account binding failure', 'NotSupportedError'); } },
  ASSETS: env.ASSETS,
};
const brokenAuthResponse = await worker.fetch(new Request('https://app.example/api/auth/register', {
  method: 'POST',
  headers: { Origin: 'https://app.example', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '异常测试', email: 'broken@example.com', password: 'Strong!Password2026' }),
}), brokenAuthEnv);
const brokenAuth = await brokenAuthResponse.json();
assert.equal(brokenAuthResponse.status, 500);
assert.equal(brokenAuth.error.code, 'AUTH_SERVICE_ERROR');
assert.match(brokenAuth.error.message, /账户服务/);
assert.doesNotMatch(brokenAuth.error.message, /生图任务/);

console.log('Cloudflare account authentication tests passed.');
