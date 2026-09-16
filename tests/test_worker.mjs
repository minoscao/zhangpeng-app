import assert from 'node:assert/strict';
import worker from '../worker.js';

const apiKey = 'sk-test-openai-1234567890';
const googleMapsKey = 'AIzaTestGoogleMapsGroundingLiteKey123456';
let editRequest;
let cityRequest;
let inspectionRequest;
let wanRequest;
const qwenRequests = [];

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url === 'https://mapstools.googleapis.com/mcp') {
    assert.equal(init.headers['X-Goog-Api-Key'], googleMapsKey);
    const request = JSON.parse(init.body);
    assert.equal(request.method, 'tools/call');
    assert.equal(request.params.name, 'search_places');
    assert.match(request.params.arguments.textQuery, /悉尼/);
    return Response.json({ result: { structuredContent: { summary: '悉尼海港沿岸的开阔公园与歌剧院视角适合当前儿童帐篷场景。[0]', places: [{ id: 'sydney-opera-house', googleMapsLinks: { placeUrl: 'https://www.google.com/maps/place/Sydney+Opera+House' }, attribution: { title: 'Sydney Opera House · Google Maps', url: 'https://www.google.com/maps/place/Sydney+Opera+House' }, location: { latitude: -33.8568, longitude: 151.2153 } }] } } });
  }
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
    assert.ok([1, 2].includes(init.body.getAll('image[]').length));
    return Response.json({ data: [{ b64_json: 'aW1hZ2U=' }] });
  }
  if (url.endsWith('/chat/completions')) {
    const request = JSON.parse(init.body);
    if (request.model === 'qwen3-vl-flash') {
      inspectionRequest = request;
      return Response.json({ choices: [{ message: { content: JSON.stringify({ personCount: 2, childCount: 2, atTentEntrance: true, touchingTent: true, interactionVisible: true, allPeopleInteracting: true, extraPersonVisible: false, issues: [] }) } }] });
    }
    cityRequest = request;
    assert.ok(init.signal);
    return Response.json({ choices: [{ message: { content: '墨尔本城市背景：雅拉河水岸公园与 CBD 天际线；木屋方案采用维州木质庭院。' } }] });
  }
  if (url.endsWith('/image-generation/generation')) {
    const request = JSON.parse(init.body);
    qwenRequests.push(request);
    if (request.model === 'wan2.6-image') {
      wanRequest = request;
      assert.equal(wanRequest.parameters.enable_interleave, false);
    }
    assert.equal(request.parameters.prompt_extend, false);
    assert.equal(request.parameters.enable_thinking, undefined);
    assert.equal(request.parameters.n, 1);
    return Response.json({ output: { task_id: 'task-test-qwen-123', task_status: 'PENDING' } });
  }
  throw new Error(`Unexpected upstream request: ${url}`);
};

const env = { ASSETS: { fetch: async () => new Response('asset') } };
const configResponse = await worker.fetch(new Request('https://app.example/api/config'), env);
const config = await configResponse.json();
assert.deepEqual(config.providers, ['openai', 'qwen']);
assert.equal(config.model, 'gpt-image-2');

const mapsResponse = await worker.fetch(new Request('https://app.example/api/maps/ground-scene', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Google-Maps-Api-Key': googleMapsKey },
  body: JSON.stringify({ location: '澳大利亚·悉尼', description: '歌剧院与海港水岸', copy: '城市水岸公园，远景显示悉尼歌剧院，儿童帐篷位于连续草地。' }),
}), env);
const mapsGrounding = await mapsResponse.json();
assert.equal(mapsResponse.status, 200);
assert.match(mapsGrounding.grounding.summary, /悉尼海港/);
assert.equal(mapsGrounding.grounding.sources[0].placeId, 'sydney-opera-house');
assert.match(mapsGrounding.grounding.sources[0].url, /^https:\/\/www\.google\.com\/maps/);

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
assert.equal(editRequest.body.getAll('image[]').length, 1);

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

const regionalPrompt = '【地域场景硬约束｜不可省略】必须彻底移除参考图白底，并清楚显示悉尼歌剧院。\n【人物数量硬约束｜0人】画面完全无人，人物数量必须严格等于 0。';
const sceneGrounding = { verified: true, summary: mapsGrounding.grounding.summary, sources: mapsGrounding.grounding.sources, resolvedAt: mapsGrounding.grounding.resolvedAt, expiresAt: mapsGrounding.grounding.expiresAt };
const openAiSceneResponse = await worker.fetch(new Request('https://app.example/api/openai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-OpenAI-Api-Key': apiKey },
  body: JSON.stringify({ prompt: regionalPrompt, referenceImages: ['data:image/png;base64,iVBORw0KGgo='], sceneGrounding, generationMode: 'fast', ratio: '4:3' }),
}), env);
assert.equal(openAiSceneResponse.status, 200);
assert.equal(editRequest.body.getAll('image[]').length, 1);
assert.match(editRequest.body.get('prompt'), /输入图片只定义帐篷产品/);
assert.match(editRequest.body.get('prompt'), /Google Maps Grounding Lite/);
const missingSceneResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: regionalPrompt, referenceImages: ['data:image/png;base64,iVBORw0KGgo='], generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.equal(missingSceneResponse.status, 400);
assert.equal((await missingSceneResponse.json()).error.code, 'SCENE_GROUNDING_REQUIRED');
const qwenQualityResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: regionalPrompt, referenceImages: ['data:image/png;base64,iVBORw0KGgo='], sceneGrounding, generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.equal(qwenQualityResponse.status, 202);
const qualityRequest = qwenRequests.at(-1);
assert.equal(qualityRequest.model, 'qwen-image-3.0-pro');
assert.equal(qualityRequest.parameters.prompt_extend, false);
assert.equal(qualityRequest.parameters.prompt_extend_mode, undefined);
assert.equal(qualityRequest.parameters.enable_thinking, undefined);
assert.equal(qualityRequest.parameters.size, '2048*1536');
assert.match(qualityRequest.parameters.negative_prompt, /参考图白底/);
assert.match(qualityRequest.parameters.negative_prompt, /错误城市/);
assert.match(qualityRequest.parameters.negative_prompt, /模糊人脸/);
assert.match(qualityRequest.parameters.negative_prompt, /路人/);
assert.match(qualityRequest.parameters.negative_prompt, /人物剪影/);
assert.match(qualityRequest.parameters.negative_prompt, /人物倒影/);
assert.match(qualityRequest.parameters.negative_prompt, /多个消失点/);
assert.match(qualityRequest.parameters.negative_prompt, /阴影方向冲突/);
assert.match(qualityRequest.parameters.negative_prompt, /Google Maps界面/);
assert.equal(qualityRequest.input.messages[0].content.filter((item) => item.image).length, 1);
assert.match(qualityRequest.input.messages[0].content.at(-1).text, /输入图片只定义帐篷产品/);
assert.match(qualityRequest.input.messages[0].content.at(-1).text, /地域场景必须服从提示词中的 Google Maps Grounding Lite/);
assert.match(cityRequest.messages[0].content, /只选择一个最有把握/);

await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: '【人物数量硬约束｜1人】画面只允许一名儿童。', referenceImages: ['data:image/png;base64,iVBORw0KGgo='], generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /第2个人/);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /额外人物/);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /人物与帐篷无互动/);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /人物在帐篷旁边摆拍/);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /手穿透帐篷/);
assert.match(qwenRequests.at(-1).input.messages[0].content.at(-1).text, /^【最高优先级｜先完成人物数量与互动/);

await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: '【人物数量硬约束｜2人】画面只允许两名儿童。', referenceImages: ['data:image/png;base64,iVBORw0KGgo='], generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /超过2名儿童/);
assert.match(qwenRequests.at(-1).parameters.negative_prompt, /第3个人/);
assert.match(qwenRequests.at(-1).input.messages[0].content.at(-1).text, /重新只安排 2 名儿童/);

const generatedImageUrl = 'https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/output/generated.png';
const inspectionResponse = await worker.fetch(new Request('https://app.example/api/qwen/inspect-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ imageUrl: generatedImageUrl, expectedPeople: 1 }),
}), env);
const inspection = await inspectionResponse.json();
assert.equal(inspectionResponse.status, 200);
assert.equal(inspection.pass, false);
assert.equal(inspection.personCount, 2);
assert.equal(inspection.interactionVisible, true);
assert.equal(inspection.allPeopleInteracting, true);
assert.equal(inspectionRequest.response_format.type, 'json_object');
assert.equal(inspectionRequest.enable_thinking, false);
assert.equal(inspectionRequest.messages[0].content[0].image_url.url, generatedImageUrl);
assert.match(inspectionRequest.messages[0].content[1].text, /allPeopleInteracting/);

const twoPeopleInspectionResponse = await worker.fetch(new Request('https://app.example/api/qwen/inspect-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ imageUrl: generatedImageUrl, expectedPeople: 2 }),
}), env);
assert.equal(twoPeopleInspectionResponse.status, 200);
const twoPeopleInspection = await twoPeopleInspectionResponse.json();
assert.equal(twoPeopleInspection.expectedPeople, 2);
assert.equal(twoPeopleInspection.pass, true);

const unsupportedPeopleInspection = await worker.fetch(new Request('https://app.example/api/qwen/inspect-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ imageUrl: generatedImageUrl, expectedPeople: 4 }),
}), env);
assert.equal(unsupportedPeopleInspection.status, 400);

const repairResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: '【人物数量硬约束｜1人】自动修复人物互动。', repairImageUrl: generatedImageUrl, generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.equal(repairResponse.status, 202);
assert.equal(qwenRequests.at(-1).input.messages[0].content[0].image, generatedImageUrl);
assert.match(qwenRequests.at(-1).input.messages[0].content[1].text, /输入参考图中的人物不是产品结构/);

const invalidRepairResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ prompt: '【人物数量硬约束｜1人】自动修复人物互动。', repairImageUrl: 'https://example.com/untrusted.png', generationMode: 'quality', ratio: '4:3' }),
}), env);
assert.equal(invalidRepairResponse.status, 400);

console.log('Worker OpenAI integration tests passed.');
