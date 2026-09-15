import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const element = {
  addEventListener() {},
  classList: { toggle() {}, remove() {}, add() {} },
  querySelectorAll: () => [],
  focus() {},
  innerHTML: '',
  hidden: true,
};
const document = {
  querySelector: () => element,
  querySelectorAll: () => [],
  addEventListener() {},
  body: element,
};
const session = new Map();
const context = vm.createContext({
  document,
  structuredClone,
  console,
  URL,
  Intl,
  Date,
  Math,
  setTimeout,
  clearTimeout,
  clearInterval,
  Headers,
  Request,
  Response,
  location: { origin: 'https://app.example', hash: '' },
  sessionStorage: {
    getItem: (key) => session.get(key) || '',
    setItem: (key, value) => session.set(key, value),
    removeItem: (key) => session.delete(key),
  },
  localStorage: { getItem: () => null, setItem() {} },
  requestAnimationFrame: (fn) => fn(),
  history: { replaceState() {} },
});

vm.runInContext(readFileSync(new URL('../../app/core.js', import.meta.url), 'utf8'), context);
const source = readFileSync(new URL('../../app/app-v2.js', import.meta.url), 'utf8')
  .replace(/\(async function init\(\)[\s\S]*$/, '');
vm.runInContext(source, context);
vm.runInContext('render = () => {}; saveState = () => {}; showToast = () => {};', context);
const run = (code) => vm.runInContext(code, context);

const results = [];
function record(id, hypothesis, passed, evidence) {
  results.push({ id, hypothesis, passed, evidence });
}

// A1 — Template selection should change the production recipe.
run('state = structuredClone(seedState);');
const promptBeforeTemplate = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
const fingerprintBeforeTemplate = run('reviewFingerprint(false)');
run("Core.applyTemplate(state, 'tpl-scene');");
const promptAfterTemplate = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
const fingerprintAfterTemplate = run('reviewFingerprint(false)');
record(
  'A1',
  '切换“模板中心”模板应改变最终提示词并使既有确认失效',
  promptBeforeTemplate !== promptAfterTemplate && fingerprintBeforeTemplate !== fingerprintAfterTemplate,
  `prompt_changed=${promptBeforeTemplate !== promptAfterTemplate}; fingerprint_changed=${fingerprintBeforeTemplate !== fingerprintAfterTemplate}`,
);

// A2 — Quantity should create differentiated variants, not identical paid requests.
run('state = structuredClone(seedState);');
const comboCount = run('buildCombinations().length');
const uniqueComboCount = run('new Set(buildCombinations().map((combo) => generationPrompt(selectedProducts()[0], combo.tags, combo.promptDetails, combo.ratio))).size');
const plannedCount = run('plannedTotal()');
const uniqueBatchPromptCount = run('new Set(selectedProducts().flatMap((product) => buildCombinations().map((combo) => generationPrompt(product, combo.tags, combo.promptDetails, combo.ratio)))).size');
record(
  'A2',
  '词条数量 ×N 应产生 N 个可辨别的生成意图',
  comboCount === uniqueComboCount && plannedCount === uniqueBatchPromptCount,
  `per_product_combos=${comboCount}; per_product_unique_prompts=${uniqueComboCount}; planned_tasks=${plannedCount}; batch_unique_prompts=${uniqueBatchPromptCount}`,
);

// A3 — Location rules should causally enter the prompt.
run('state = structuredClone(seedState);');
const promptWithLocation = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
run("state.promptGroups.find((group) => group.id === 'group-location').enabled = false;");
const promptWithoutLocation = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
record(
  'A3',
  '启用当地背景应把可识别地域线索加入最终提示词',
  promptWithLocation !== promptWithoutLocation && /悉尼歌剧院|海港大桥/.test(promptWithLocation) && !/悉尼歌剧院|海港大桥/.test(promptWithoutLocation),
  `changed=${promptWithLocation !== promptWithoutLocation}; landmark_on=${/悉尼歌剧院|海港大桥/.test(promptWithLocation)}; landmark_off=${/悉尼歌剧院|海港大桥/.test(promptWithoutLocation)}`,
);

// A4 — Shot choices should encode mutually exclusive framing constraints.
run('state = structuredClone(seedState);');
const shotPrompts = run(`(() => {
  const group = state.promptGroups.find((item) => item.id === 'group-shot');
  return group.options.map((option) => {
    group.options.forEach((item) => { item.selected = item.id === option.id; });
    const combo = buildCombinations()[0];
    return generationPrompt(selectedProducts()[0], combo.tags, combo.promptDetails, combo.ratio);
  });
})()`);
record(
  'A4',
  '近景、中景、远景应形成互斥且可测的构图约束',
  new Set(shotPrompts).size === 3 && /80%–95%/.test(shotPrompts[0]) && /45%–60%/.test(shotPrompts[1]) && /12%–25%/.test(shotPrompts[2]),
  `unique_prompts=${new Set(shotPrompts).size}; occupancy_targets=80–95%,45–60%,12–25%`,
);

// A5 — White-background mode should suppress location content.
run("state = structuredClone(seedState); state.studio.publicPromptId = 'white';");
const whitePrompt = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
record(
  'A5',
  '白底模板应消融所有地域背景线索',
  !/悉尼歌剧院|海港大桥|当地背景要求为/.test(whitePrompt) && /纯白背景/.test(whitePrompt),
  `contains_landmark=${/悉尼歌剧院|海港大桥/.test(whitePrompt)}; contains_white_rule=${/纯白背景/.test(whitePrompt)}`,
);

// A6 — Other requirements should enter the final prompt and invalidate approval.
run('state = structuredClone(seedState);');
const baseFingerprint = run('reviewFingerprint(false)');
run("state.studio.otherRequirements = '帐篷入口旁必须有一只红色风筝';");
const customPrompt = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
const customFingerprint = run('reviewFingerprint(false)');
record(
  'A6',
  '其他要求应进入最终提示词并使既有确认失效',
  customPrompt.includes('红色风筝') && baseFingerprint !== customFingerprint,
  `requirement_in_prompt=${customPrompt.includes('红色风筝')}; fingerprint_changed=${baseFingerprint !== customFingerprint}`,
);

// A7 — Public prompt templates are real recipe inputs (control for A1).
run('state = structuredClone(seedState);');
const briefPrompt = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
run("state.studio.publicPromptId = 'cabin';");
const cabinPrompt = run('generationPrompt(selectedProducts()[0], buildCombinations()[0].tags, buildCombinations()[0].promptDetails)');
record(
  'A7',
  '公共提示词模板应真实改变最终提示词',
  briefPrompt !== cabinPrompt && cabinPrompt.includes('小木屋'),
  `changed=${briefPrompt !== cabinPrompt}; cabin_rule_present=${cabinPrompt.includes('小木屋')}`,
);

for (const result of results) {
  const status = result.passed ? 'PASS' : 'FAIL';
  console.log(`${result.id}\t${status}\t${result.hypothesis}\t${result.evidence}`);
}

const failed = results.filter((result) => !result.passed);
console.log(`SUMMARY\t${results.length - failed.length}/${results.length} passed\tfailed=${failed.map((result) => result.id).join(',') || 'none'}`);

// The script intentionally exits successfully: a failed hypothesis is an audit
// result, not a broken test harness.
assert.equal(results.length, 7);
