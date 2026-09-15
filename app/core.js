(function exposeDesignFlowCore(global) {
  'use strict';

  const VARIANT_DIRECTIONS = [
    '主视角版本：保持构图稳定，人物动作和场景陈设简洁自然。',
    '侧向变化版本：在不改变产品结构、配色、景别和指定地标的前提下，改变摄影机水平位置、人物动作或道具布局，必须与主视角明显不同。',
    '光线变化版本：保持全部硬性需求，改变自然光方向和前后景组织，不得只做轻微色调变化。',
    '生活动作版本：保持产品与地域线索，使用另一种可信的儿童互动动作和环境细节布局。',
    '编辑构图版本：保持所选景别的产品占比，改变留白方向和视觉动线，输出可辨别的新方案。',
    '环境层次版本：保持产品完整，改变前景与远景元素的空间关系，不得复制上一版构图。',
    '机位高度版本：保持所选景别与焦段区间，适度改变相机高度和观察角度，产品结构仍需准确。',
    '陈设变化版本：只变化非产品道具与人物站位，不改变帐篷、地标、配色或画幅。',
    '备选导演版本：在全部硬性条件内给出明显不同但同等可交付的摄影方案。',
  ];

  const TEMPLATE_RECIPES = Object.freeze({
    'tpl-tent': Object.freeze({
      publicPromptId: 'brief',
      enable: ['group-location', 'group-color', 'group-canvas', 'group-shot'],
      disable: [],
      add: [],
      summary: '已启用地域、产品配色、画布和镜头景别的批量帐篷配方。',
    }),
    'tpl-product': Object.freeze({
      publicPromptId: 'white',
      enable: ['group-color', 'group-canvas', 'group-shot'],
      disable: ['group-location', 'group-scene'],
      add: [],
      summary: '已切换白底电商精修，并停用地域与场景背景。',
    }),
    'tpl-scene': Object.freeze({
      publicPromptId: 'family',
      enable: ['group-location', 'group-color', 'group-canvas', 'group-shot', 'group-scene'],
      disable: [],
      add: ['group-scene'],
      summary: '已启用亲子生活摄影、当地背景和使用场景配方。',
    }),
  });

  function selectedProducts(state) {
    const byId = new Map(state.products.map((product) => [product.id, product]));
    return state.studio.selectedProductIds.map((id) => byId.get(id)).filter(Boolean);
  }

  function selectedOptions(group) {
    return group.options.filter((option) => option.selected && option.quantity > 0);
  }

  function groupFactor(group) {
    return group.enabled ? selectedOptions(group).reduce((sum, option) => sum + option.quantity, 0) : 1;
  }

  function enabledGroups(state) {
    return state.promptGroups.filter((group) => group.enabled && groupFactor(group) > 0);
  }

  function variantDirection(index, total) {
    if (total <= 1) return '';
    return `同组选项变体 ${index + 1}/${total}：${VARIANT_DIRECTIONS[index % VARIANT_DIRECTIONS.length]}`;
  }

  function buildCombinations(state) {
    let combinations = [{ tags: [], promptDetails: [], ratio: state.studio.ratio }];
    enabledGroups(state).forEach((group) => {
      const expanded = selectedOptions(group).flatMap((option) => Array.from({ length: option.quantity }, (_, index) => ({
        label: option.quantity > 1 ? `${option.label} · 变体 ${index + 1}/${option.quantity}` : option.label,
        prompt: [option.prompt || option.label, variantDirection(index, option.quantity)].filter(Boolean).join('；'),
        ratio: option.ratio,
      })));
      combinations = combinations.flatMap((combo) => expanded.map((option) => ({
        tags: [...combo.tags, `${group.name}：${option.label}`],
        promptDetails: [...combo.promptDetails, `${group.name}：${option.prompt}`],
        ratio: option.ratio || combo.ratio,
      })));
    });
    return combinations;
  }

  function plannedTotal(state, comparison, profileCount) {
    const products = selectedProducts(state).length;
    if (comparison) return products ? profileCount : 0;
    return products ? enabledGroups(state).reduce((total, group) => total * groupFactor(group), products) : 0;
  }

  function formulaText(state, comparison, profileCount) {
    const total = plannedTotal(state, comparison, profileCount);
    if (comparison) return `首个 SKU × 首个组合 × ${total} 个模型配置 = ${total} 张对比图`;
    return [`${selectedProducts(state).length} 个产品`, ...enabledGroups(state).map((group) => `${groupFactor(group)} 个${group.name}`)].join(' × ') + ` = ${total} 张素材`;
  }

  function ruleValue(rules, name) {
    return rules.find((rule) => rule.startsWith(`${name}：`))?.replace(new RegExp(`^${name}：`), '') || '';
  }

  function locationDirective(locationRule, shotRule) {
    if (!locationRule) return '';
    const visibility = /环境远景|建立镜头/.test(shotRule)
      ? '环境占画面 75%–88%，城市地标或地域建筑占画面 25%–45%，轮廓与关键特征清晰可辨。'
      : /产品近景|近景特写/.test(shotRule)
        ? '即使是近景，至少保留一个占画面 15% 以上、特征可辨的地域锚点；不得把它虚化成无法识别的色块。'
        : '背景环境占画面 40%–55%，至少一个城市地标或地域建筑占画面 20%–35%，名称对应的关键特征清晰可辨。';
    return [
      '【地域场景硬约束｜不可省略】输入参考图只用于锁定帐篷产品，不代表成片背景；必须彻底移除参考图原有的白底、透明底、摄影棚或旧场景，并重新生成所选地区的真实环境。',
      `目标地域：${locationRule}。`,
      `可见性验收：${visibility}`,
      '不得用普通草坪、无名住宅、纯色背景、摄影棚或无法辨认的背景虚化代替目标地域；不得出现其他城市的地标。若所选使用场景与户外地域冲突，将“儿童房、阅读角”等理解为面向该地标的开放露台或庭院活动区；先删除非必要道具，也不能删除地域锚点。',
    ].join('\n');
  }

  function compilePrompt(state, product, tags, promptDetails = [], ratio = state.studio.ratio) {
    const template = state.publicPrompts.find((item) => item.id === state.studio.publicPromptId) || state.publicPrompts[0];
    const sourceRules = promptDetails.length ? promptDetails : tags;
    const rules = template?.id === 'white' || template?.backgroundMode === 'none'
      ? sourceRules.filter((tag) => !tag.startsWith('当地背景：'))
      : sourceRules;
    const locationRule = ruleValue(rules, '当地背景');
    const shotRule = ruleValue(rules, '镜头景别');
    const wideShot = /环境远景|建立镜头/.test(shotRule);
    const combination = rules
      .filter((rule) => !rule.startsWith('当地背景：') && !rule.startsWith('镜头景别：'))
      .map((tag) => tag.replace('：', '要求为').replace(/[。；\s]+$/, ''))
      .join('；');
    return [
      '请基于输入参考图生成一张精修完成、真实大气的儿童帐篷商业摄影成片。成片必须像专业摄影团队实景拍摄并经过高端广告后期，而不是插画、3D 渲染、平面示意图或低成本影棚合成。',
      wideShot ? `参考产品为“${product.name}”（SKU ${product.sku}），帐篷是画面中唯一的商业产品；本张为远景，环境必须主导画面面积，禁止为了突出产品而放大成中景。` : `参考产品为“${product.name}”（SKU ${product.sku}），帐篷是画面唯一核心产品。`,
      '严格保留参考图中帐篷的真实结构、轮廓、开口、支架、缝线和比例，不改变产品类型，不凭空增加门窗或配件。',
      locationDirective(locationRule, shotRule),
      shotRule ? `镜头景别硬性约束（不得自动折中成中景）：${shotRule}。若占比不符即视为生成失败。` : '',
      `场景任务：${template?.prompt || ''}`,
      locationRule
        ? '冲突优先级：帐篷结构与地域场景硬约束 > 镜头景别与画布构图 > 产品配色和其他明确要求 > 场景模板 > 摄影美感。所有“必须”元素都要可辨识。'
        : '优先级：帐篷结构与明确要求 > 镜头景别与画布构图 > 场景模板 > 摄影美感。所有“必须”元素都要可辨识。',
      combination ? `其余创作规则：${combination}。产品配色只作用于帐篷面料；视觉风格不能覆盖产品结构、${locationRule ? '地域场景硬约束、' : ''}配色或场景模板。` : '',
      `画幅比例：${ratio}。画布方向与构图必须遵循所选尺寸。`,
      state.studio.otherRequirements?.trim() ? `其他要求：\n${state.studio.otherRequirements.trim()}` : '',
      state.studio.universalPrompt,
      '摄影与产品质感：真实全画幅商业摄影，光线自然有方向，曝光和白平衡准确；织物纤维、包边、缝线、褶皱张力、支架材质和接触阴影清晰可信。避免夸张 HDR、浓重滤镜、塑料感、结构变形和悬浮感。',
      '适合国际儿童用品品牌、电商主视觉与高端产品手册；人物动作自然、比例正确且不得遮挡帐篷关键结构。',
    ].filter(Boolean).join('\n');
  }

  function reviewFingerprint(state, comparison, profileCount) {
    const activePublicPrompt = state.publicPrompts.find((item) => item.id === state.studio.publicPromptId) || null;
    const products = selectedProducts(state).map(({ id, sku, name, image, specs }) => ({ id, sku, name, image, specs }));
    return JSON.stringify([
      products,
      buildCombinations(state),
      state.studio.templateId,
      activePublicPrompt,
      state.studio.universalPrompt,
      state.studio.otherRequirements,
      state.studio.provider,
      state.studio.generationMode,
      state.studio.ratio,
      comparison,
      comparison ? profileCount : 1,
    ]);
  }

  function addPromptGroupFromLibrary(state, groupId) {
    if (state.promptGroups.some((group) => group.id === groupId)) return;
    const source = state.promptLibrary.find((group) => group.id === groupId);
    if (!source) return;
    state.promptGroups.push({
      id: source.id,
      name: source.name,
      enabled: true,
      options: source.options.map((label, index) => ({ id: `${source.id}-${index}`, label, prompt: label, selected: index === 0, quantity: 1 })),
    });
  }

  function applyTemplate(state, templateId) {
    const recipe = TEMPLATE_RECIPES[templateId];
    if (!recipe) return null;
    recipe.add.forEach((groupId) => addPromptGroupFromLibrary(state, groupId));
    state.studio.templateId = templateId;
    state.studio.publicPromptId = recipe.publicPromptId;
    state.promptGroups.forEach((group) => {
      if (recipe.enable.includes(group.id)) group.enabled = true;
      if (recipe.disable.includes(group.id)) group.enabled = false;
    });
    return recipe;
  }

  function emptyEvaluation() {
    return { structure: 0, location: 'pending', shot: 'pending', defects: 'pending', deliverable: 'pending' };
  }

  function deriveReview(evaluation) {
    const value = { ...emptyEvaluation(), ...(evaluation || {}) };
    if (value.structure > 0 && value.structure < 4) return 'fail';
    if ([value.location, value.shot, value.defects, value.deliverable].includes('fail')) return 'fail';
    if (value.structure >= 4 && [value.location, value.shot, value.defects, value.deliverable].every((item) => item === 'pass' || item === 'na')) return 'pass';
    return 'pending';
  }

  global.DesignFlowCore = Object.freeze({
    TEMPLATE_RECIPES,
    selectedProducts,
    selectedOptions,
    groupFactor,
    enabledGroups,
    buildCombinations,
    plannedTotal,
    formulaText,
    locationDirective,
    compilePrompt,
    reviewFingerprint,
    applyTemplate,
    emptyEvaluation,
    deriveReview,
  });
})(globalThis);
