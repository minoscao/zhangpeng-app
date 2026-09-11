import assert from 'node:assert/strict';
import worker from '../worker.js';

const apiKey = 'sk-test-openai-1234567890';
let editRequest;

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

console.log('Worker OpenAI integration tests passed.');
