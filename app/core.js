(function exposeDesignFlowCore(global) {
  'use strict';

  const VARIANT_DIRECTIONS = [
    '主视角版本：保持构图稳定，场景陈设简洁自然；不得因为生成变体而新增人物。',
    '侧向变化版本：在不改变产品结构、配色、景别和指定地标的前提下，改变摄影机水平位置或道具布局，必须与主视角明显不同；不得新增人物。',
    '光线变化版本：保持全部硬性需求，改变自然光方向和前后景组织，不得只做轻微色调变化。',
    '环境细节版本：保持产品与地域线索，只改变少量环境细节与留白；不得新增人物。',
    '编辑构图版本：保持所选景别的产品占比，改变留白方向和视觉动线，输出可辨别的新方案。',
    '环境层次版本：保持产品完整，改变前景与远景元素的空间关系，不得复制上一版构图。',
    '机位高度版本：保持所选景别与焦段区间，适度改变相机高度和观察角度，产品结构仍需准确。',
    '陈设变化版本：只变化非产品道具的位置，不改变帐篷、地标、配色、画幅或人物数量。',
    '备选导演版本：在全部硬性条件内给出明显不同但同等可交付的摄影方案。',
  ];

  const TEMPLATE_RECIPES = Object.freeze({
    'tpl-tent': Object.freeze({
      publicPromptId: 'brief',
      enable: ['group-location', 'group-color', 'group-canvas', 'group-shot', 'group-people'],
      disable: [],
      add: [],
      summary: '已启用地域、产品配色、画布、镜头景别和出现人数的批量帐篷配方。',
    }),
    'tpl-product': Object.freeze({
      publicPromptId: 'white',
      enable: ['group-color', 'group-canvas', 'group-shot', 'group-people'],
      disable: ['group-location', 'group-scene'],
      add: [],
      summary: '已切换白底电商精修，并停用地域与场景背景；人物仍按出现人数生成。',
    }),
    'tpl-scene': Object.freeze({
      publicPromptId: 'family',
      enable: ['group-location', 'group-color', 'group-canvas', 'group-shot', 'group-people', 'group-scene'],
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
      ? '环境占画面 75%–88%，只保留一个主地域锚点，占画面约 12%–25%，轮廓与关键特征清晰可辨。'
      : /产品近景|近景特写/.test(shotRule)
        ? '近景只在画面边缘或远景保留一个占画面约 5%–10% 的地域锚点；保持特征可辨，但不把地标放大贴到产品后方。'
        : '背景环境占画面 40%–55%，只保留一个主地域锚点，占画面约 8%–18%，名称对应的关键特征清晰可辨。';
    return [
      '【地域场景硬约束｜不可省略】输入参考图只用于锁定帐篷产品，不代表成片背景；必须彻底移除参考图原有的白底、透明底、摄影棚或旧场景，并重新生成所选地区的真实环境。',
      `目标地域：${locationRule}。`,
      `可见性验收：${visibility}`,
      '主地标必须处于中远景并服从真实透视，不得像贴纸、布景板或巨型模型贴在帐篷后方。不得用普通草坪、无名住宅、纯色背景、摄影棚或无法辨认的背景虚化代替目标地域；不得出现其他城市的地标。若所选使用场景与户外地域冲突，将“儿童房、阅读角”等理解为面向该地标的开放露台或庭院活动区。',
    ].join('\n');
  }

  function peopleCountFromRule(peopleRule) {
    const value = String(peopleRule || '');
    const marker = value.match(/【出现人数选择｜([0-3])人】/);
    if (marker) return Number(marker[1]);
    if (/无人物|严格\s*0\s*人/.test(value)) return 0;
    const label = value.match(/([1-3])\s*名儿童/);
    return label ? Number(label[1]) : null;
  }

  function sceneRealismDirective(templatePrompt, peopleRule, shotRule, product) {
    const expectedPeople = peopleCountFromRule(peopleRule);
    const peopleRequested = Number.isInteger(expectedPeople) && expectedPeople > 0;
    const audienceSpec = String(product?.specs?.audience || '');
    const audience = /岁|儿童|婴|幼/.test(audienceSpec) ? `人物年龄与产品受众“${audienceSpec}”一致` : '儿童年龄与帐篷的安全适用范围一致';
    const exactCountRule = Number.isInteger(expectedPeople)
      ? `人物总数必须严格等于 ${expectedPeople}，不得多或少；禁止成人、路人、远景人影、局部肢体、倒影及图像内人像。`
      : '';
    const interactions = {
      1: '唯一儿童坐在帐篷入口门槛，身体一半在篷内、一半在篷外；一只手明确轻扶软质门帘边缘，头部和视线朝向帐篷内部。',
      2: '儿童 A 坐在帐篷入口门槛并用一只手轻扶软质门帘；儿童 B 坐在篷内靠近入口的位置整理一只坐垫或打开一本书。两人的脸、身体与各自动作都必须清楚可见，并共同形成正在使用帐篷的关系。',
      3: '儿童 A 坐在帐篷入口门槛并轻扶软质门帘；儿童 B 坐在篷内靠近入口的位置看一本打开的书；儿童 C 跪坐在入口外侧，把一只坐垫递向篷内。三人的位置相互错开、脸部可见，每个人都必须直接参与帐篷内外的同一项活动。',
    };
    const personRule = expectedPeople === 0
      ? '【人物数量硬约束｜0人】画面必须完全无人。不得出现儿童、成人、远景人影、路人、局部手脚、镜面或水面倒影中的人物，也不得在海报、照片或屏幕中出现人脸与人形；模型不得为了增加生活感自行添加人物。人物数量不是建议，而是验收条件：必须严格等于 0。'
      : peopleRequested
        ? `【人物数量硬约束｜${expectedPeople}人】本张只允许 ${expectedPeople} 名儿童。${exactCountRule}${audience}；使用简单静止动作，所有人的完整五官和互动处在清晰焦平面，无运动模糊。\n【人物互动硬约束｜每个人都必须可见】${interactions[expectedPeople]}禁止任何人远离、背对、忽视帐篷或只在旁边摆拍。遮挡必须正确，肢体不得穿透面料；远景仍须能辨认每个人的互动。`
        : '';
    const scale = product?.specs?.size
      ? `帐篷按标称尺寸“${product.specs.size}”与${peopleRequested ? '全部人物、' : ''}家具和建筑保持可信比例。`
      : `帐篷与${peopleRequested ? '全部人物、' : ''}家具和建筑保持可信比例。`;
    if (/纯白背景/.test(templatePrompt)) {
      return [
        '【空间质检】白底产品图只保留一个真实地面接触面和自然接触阴影；帐篷不得悬浮、倾斜或改变结构。',
        personRule,
        '不得出现任何场景道具。',
      ].filter(Boolean).join('\n');
    }
    return [
      '【真实空间与人物质检｜不可省略】整张图必须来自同一台相机、同一地面和同一个透视系统，不得使用拼贴、舞台布景或多个不一致视点。',
      `布局：先建立连续地面、水平线和单一消失点，再放置帐篷；${scale}帐篷支脚全部落地，接触阴影完整，不穿插地面、人物、家具或植物。主地标只在中远景出现。`,
      `光影：全场只有一个主光方向；帐篷、${peopleRequested ? '全部人物、' : ''}树木与建筑的受光面和投影方向一致，天空、空气透视和白平衡统一。除帐篷外最多保留两类简单道具，删除拥挤装饰。`,
      personRule,
      `成片：真实全画幅商业摄影，结构边缘和帐篷织物清晰${peopleRequested ? '，每名人物的脸部清晰自然' : ''}；景深自然但不能用虚化掩盖错误，禁止广角拉伸、悬浮、比例错乱、重复肢体、蜡像皮肤和塑料质感。`,
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
    const peopleRule = ruleValue(rules, '出现人数');
    const wideShot = /环境远景|建立镜头/.test(shotRule);
    const combination = rules
      .filter((rule) => !rule.startsWith('当地背景：') && !rule.startsWith('镜头景别：') && !rule.startsWith('出现人数：'))
      .map((tag) => tag.replace('：', '要求为').replace(/[。；\s]+$/, ''))
      .join('；');
    return [
      '请基于输入参考图生成一张精修完成、真实大气的儿童帐篷商业摄影成片。成片必须像专业摄影团队实景拍摄并经过高端广告后期，而不是插画、3D 渲染、平面示意图或低成本影棚合成。',
      wideShot ? `参考产品为“${product.name}”（SKU ${product.sku}），帐篷是画面中唯一的商业产品；本张为远景，环境必须主导画面面积，禁止为了突出产品而放大成中景。` : `参考产品为“${product.name}”（SKU ${product.sku}），帐篷是画面唯一核心产品。`,
      '严格保留参考图中帐篷的真实结构、轮廓、开口、支架、缝线和比例，不改变产品类型，不凭空增加门窗或配件。',
      locationDirective(locationRule, shotRule),
      shotRule ? `镜头景别硬性约束（不得自动折中成中景）：${shotRule}。若占比不符即视为生成失败。` : '',
      `场景任务：${template?.prompt || ''}`,
      sceneRealismDirective(template?.prompt || '', peopleRule, shotRule, product),
      locationRule
        ? '冲突优先级：出现人数与帐篷结构 > 地域场景硬约束 > 镜头景别与画布构图 > 产品配色和其他明确要求 > 场景模板 > 摄影美感。若其他文字涉及人物数量，以“出现人数”选项为唯一准则；所有“必须”元素都要可辨识。'
        : '优先级：出现人数与帐篷结构 > 镜头景别与画布构图 > 其他明确要求 > 场景模板 > 摄影美感。若其他文字涉及人物数量，以“出现人数”选项为唯一准则；所有“必须”元素都要可辨识。',
      combination ? `其余创作规则：${combination}。产品配色只作用于帐篷面料；视觉风格不能覆盖产品结构、${locationRule ? '地域场景硬约束、' : ''}配色或场景模板。` : '',
      `画幅比例：${ratio}。画布方向与构图必须遵循所选尺寸。`,
      state.studio.otherRequirements?.trim() ? `其他要求：\n${state.studio.otherRequirements.trim()}` : '',
      state.studio.universalPrompt,
      '交付标准：适合国际儿童用品品牌、电商主视觉与高端产品手册；织物纤维、包边、缝线、褶皱张力和支架材质清晰可信，不添加文字、商标或水印。',
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
      options: source.options.map((option, index) => typeof option === 'string'
        ? { id: `${source.id}-${index}`, label: option, prompt: option, selected: index === 0, quantity: 1 }
        : { ...structuredClone(option) }),
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
    return { structure: 0, location: 'pending', shot: 'pending', people: 'pending', defects: 'pending', deliverable: 'pending' };
  }

  function deriveReview(evaluation) {
    const value = { ...emptyEvaluation(), ...(evaluation || {}) };
    if (value.structure > 0 && value.structure < 4) return 'fail';
    if ([value.location, value.shot, value.people, value.defects, value.deliverable].includes('fail')) return 'fail';
    if (value.structure >= 4 && [value.location, value.shot, value.people, value.defects, value.deliverable].every((item) => item === 'pass' || item === 'na')) return 'pass';
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
    sceneRealismDirective,
    compilePrompt,
    reviewFingerprint,
    applyTemplate,
    emptyEvaluation,
    deriveReview,
  });
})(globalThis);
