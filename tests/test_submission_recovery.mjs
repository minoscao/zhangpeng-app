import assert from 'node:assert/strict';
import worker from '../worker.js';

const apiKey = 'sk-test-qwen-recovery-1234567890';
const env = { ASSETS: { fetch: async () => new Response('asset') } };
const submittedAt = Date.now();
let mode = 'disconnect';
let submitAttempts = 0;
let taskPollAttempts = 0;

globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.endsWith('/image-generation/generation')) {
    submitAttempts += 1;
    throw new TypeError('Network connection lost');
  }
  if (url.includes('/tasks?')) {
    if (mode === 'ambiguous') {
      return Response.json({ data: [
        { task_id: 'task-recovery-candidate-1', task_status: 'RUNNING', model_name: 'qwen-image-3.0-pro', gmt_create: new Date(submittedAt).toISOString() },
        { task_id: 'task-recovery-candidate-2', task_status: 'PENDING', model_name: 'qwen-image-3.0-pro', gmt_create: new Date(submittedAt + 1000).toISOString() },
      ] });
    }
    return Response.json({ data: [
      { task_id: 'task-recovery-unique-1', task_status: 'RUNNING', model_name: 'qwen-image-3.0-pro', gmt_create: new Date(submittedAt).toISOString() },
      { task_id: 'task-already-bound-0001', task_status: 'SUCCEEDED', model_name: 'qwen-image-3.0-pro', gmt_create: new Date(submittedAt).toISOString() },
    ] });
  }
  if (url.endsWith('/tasks/task-retry-safe-1')) {
    taskPollAttempts += 1;
    if (taskPollAttempts === 1) throw new TypeError('temporary connection loss');
    return Response.json({ output: { task_status: 'RUNNING' } });
  }
  throw new Error(`Unexpected upstream request: ${url}`);
};

const uncertainResponse = await worker.fetch(new Request('https://app.example/api/qwen/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey, 'X-Client-Request-Id': 'request-recovery-001' },
  body: JSON.stringify({ prompt: '生成儿童帐篷产品图', referenceImages: [], generationMode: 'quality', ratio: '4:3' }),
}), env);
const uncertain = await uncertainResponse.json();
assert.equal(uncertainResponse.status, 502);
assert.equal(uncertain.error.code, 'QWEN_SUBMISSION_UNCERTAIN');
assert.equal(uncertain.error.uncertain, true);
assert.equal(uncertain.error.stage, 'submit');
assert.equal(uncertain.error.model, 'qwen-image-3.0-pro');
assert.equal(uncertain.error.requestId, 'request-recovery-001');
assert.equal(submitAttempts, 1, 'billable submission POST must never be retried');

mode = 'unique';
const recoveryResponse = await worker.fetch(new Request('https://app.example/api/qwen/recover-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ submittedAt, model: 'qwen-image-3.0-pro', generationMode: 'quality', knownTaskIds: ['task-already-bound-0001'] }),
}), env);
const recovery = await recoveryResponse.json();
assert.equal(recoveryResponse.status, 200);
assert.equal(recovery.recovered, true);
assert.equal(recovery.taskId, 'task-recovery-unique-1');
assert.equal(recovery.taskStatus, 'RUNNING');

mode = 'ambiguous';
const ambiguousResponse = await worker.fetch(new Request('https://app.example/api/qwen/recover-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Qwen-Api-Key': apiKey },
  body: JSON.stringify({ submittedAt, model: 'qwen-image-3.0-pro', generationMode: 'quality', knownTaskIds: [] }),
}), env);
const ambiguous = await ambiguousResponse.json();
assert.equal(ambiguousResponse.status, 409);
assert.equal(ambiguous.error.code, 'QWEN_RECOVERY_AMBIGUOUS');
assert.equal(ambiguous.error.candidateCount, 2);

const pollResponse = await worker.fetch(new Request('https://app.example/api/qwen/tasks/task-retry-safe-1', {
  headers: { 'X-Qwen-Api-Key': apiKey },
}), env);
assert.equal(pollResponse.status, 200);
assert.equal((await pollResponse.json()).taskStatus, 'RUNNING');
assert.equal(taskPollAttempts, 2, 'safe task polling GET should retry transient connection errors');

console.log('Qwen submission recovery tests passed.');
