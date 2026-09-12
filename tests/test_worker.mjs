import assert from 'node:assert/strict';
import worker from '../worker.js';

const apiKey = 'sk-test-openai-1234567890';
let editRequest;
let cityRequest;
let wanRequest;

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url.endsWith('/models')) {
    assert.equal(init.headers.Authorization, `Bearer ${apiKey}`);
    return Response.json({ data: [] });
  }
  if (url.endsWith('/images/edits')) {
    editRequest = init;
    assert.equal(init.headers.Authorization, `Bearer ${apiKey}`);
    assert.ok(init.body instanceof FormData);
    assert.equal(init.body.get('model'), 'gpt-image-2');
    assert.equal(init.body.get('quality'), 'low');
    assert.equal(init.body.get('size'), '1536x1152');
    assert.equal(init.body.getAll('image[]').length, 1);
    return Response.json({ data: [{ b64_json: 'aW1hZ2U=' }] });
  }
  if (url.endsWith('/chat/completions')) {
    cityRequest = JSON.parse(init.body);
    assert.ok(init.signal);
    return Response.json({ choices: [{ message: { content: '墨尔本城市背景：雅拉河水岸公园与 CBD 天际线；木屋方案采用维州木质庭院。' } }] });
  }
  if (url.endsWith('/image-generation/generation')) {
    wanRequest = JSON.parse(init.body);
    assert.equal(wanRequest.model, 'wan2.6-image');
    assert.equal(wanRequest.parameters.enable_interleave, false);
    assert.equal(wanRequest.parameters.prompt_extend, false);
    assert.equal(wanRequest.parameters.enable_thinking, undefined);
    assert.equal(wanRequest.parameters.n, 1);
    return Response.json({ output: { task_id: 'task-test-wan-123', task_status: 'PENDING' } });
  }
  throw new Error(`Unexpected upstream request: ${url}`);
};

const env = { ASSETS: { fetch: async () => new Response('asset') } };
const configResponse = await worker.fetch(new Request('https://app.example/api/config'), env);
const config = await configResponse.json();
assert.deepEqual(config.providers, ['openai', 'qwen']);
assert.equal(config.model, 'gpt-image-2');

const validateResponse = await worker.fetch(new Request('https://app.example/api/openai/validate', {
  method: 'POST',
  headers: { 'X-OpenAI-Api-Key': apiKey },
}), env);
assert.equal(validateResponse.status, 200);
assert.equal((await validateResponse.json()).valid, true);

const generateResponse = await worker.fetch(new Request('https://app.example/api/openai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-OpenAI-Api-Key': apiKey },
  body: JSON.stringify({
    prompt: '生成儿童帐篷产品图',
    referenceImages: ['data:image/png;base64,iVBORw0KGgo='],
    ratio: '4:3',
    generationMode: 'fast',
  }),
}), env);
const result = await generateResponse.json();
assert.equal(generateResponse.status, 200);
assert.equal(result.imageUrl, 'data:image/jpeg;base64,aW1hZ2U=');
assert.equal(result.provider, 'openai');
assert.ok(editRequest);

for (const provider of ['openai', 'qwen']) {
  const cityResponse = await worker.fetch(new Request(`https://app.example/api/${provider}/plan-city`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', [provider === 'openai' ? 'X-OpenAI-Api-Key' : 'X-Qwen-Api-Key']: apiKey }, body: JSON.stringify({ city: '澳大利亚墨尔本' }),
  }), env);
  assert.equal(cityResponse.status, 200);
  assert.equal((await cityResponse.json()).verified, false);
  assert.equal(cityRequest.model, provider === 'openai' ? 'gpt-4.1-mini' : 'qwen-plus');
}
const missingKey = await worker.fetch(new Request('https://app.example/api/openai/plan-city', { method: 'POST' }), env);
assert.equal(missingKey.status, 401);
const invalidCity = await worker.fetch(new Request('https://app.example/api/openai/plan-city', { method: 'POST', headers: { 'X-OpenAI-Api-Key': apiKey }, body: JSON.stringify({ city: 'a'.repeat(81) }) }), env);
assert.equal(invalidCity.status, 400);
for (const prompt of ['生成真实帐篷产品场景', 'a'.repeat(2001)]) {
  const wanResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', { method: 'POST', headers: { 'X-Qwen-Api-Key': apiKey }, body: JSON.stringify({ prompt, referenceImages: ['data:image/png;base64,iVBORw0KGgo='], generationMode: 'wan', ratio: '4:3' }) }), env);
  assert.equal(wanResponse.status, prompt.length > 2000 ? 400 : 202);
}
assert.ok(wanRequest);

console.log('Worker OpenAI integration tests passed.');
