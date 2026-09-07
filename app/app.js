const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const icons = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/>',
  sparkles: '<path d="m12 3-1.1 3.5L7.5 8l3.4 1.5L12 13l1.1-3.5L16.5 8l-3.4-1.5L12 3Z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13Zm13-1-.8 2.2-2.2.8 2.2.8L18 19l.8-2.2L21 16l-2.2-.8L18 12Z"/>',
  box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Zm8 4v10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 18v3h16v-3"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
  power: '<path d="M12 2v10"/><path d="M6.3 5.7a8 8 0 1 0 11.4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M8 21H3v-5m18 0v5h-5"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .9-7L20 12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
};

const svgIcon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowLabel = () => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
const STUDIO_IMAGES = ['/assets/studio/tent-hero.png', '/assets/studio/tent-variant-a.png', '/assets/studio/tent-variant-b.png'];

function hydrateIcons(scope = document) {
  $$('[data-icon]', scope).forEach((el) => { el.innerHTML = svgIcon(el.dataset.icon); });
}

const productNames = [
  ['三人户外露营帐篷', 'TENT-3P-001', '户外装备 / 帐篷'],
  ['轻量双人徒步帐', 'TENT-2P-014', '户外装备 / 帐篷'],
  ['家庭四人快开帐', 'TENT-4P-008', '户外装备 / 帐篷'],
  ['儿童室内游戏屋', 'KIDS-HOUSE-03', '儿童家居 / 游戏帐'],
  ['棉帆布 Teepee', 'TEEPEE-CAN-09', '儿童家居 / Teepee'],
  ['后院遮阳露营帐', 'SHADE-YARD-06', '户外装备 / 遮阳帐'],
  ['睡衣派对 A 字帐', 'AFRAME-PAR-11', '活动用品 / 派对帐'],
  ['婴幼儿便携防晒帐', 'BABY-UV-05', '母婴用品 / 防晒帐'],
  ['双通道游戏隧道', 'PLAY-TUN-07', '儿童玩具 / 隧道'],
  ['六人家庭天幕帐', 'CAMP-6P-021', '户外装备 / 天幕帐'],
];

const seedState = {
  schemaVersion: 5,
  credits: 2680,
  products: productNames.map(([name, sku, category], index) => ({
    id: `p-${index + 1}`,
    name,
    sku,
    category,
    image: STUDIO_IMAGES[index % STUDIO_IMAGES.length],
    references: 6 + (index % 7),
    versions: 1 + (index % 4),
    status: ['设计中', '已完成', '资料完善'][index % 3],
    updated: index < 3 ? '今天' : `${index + 1} 天前`,
  })),
  templates: [
    { id: 'tpl-tent', name: '帐篷设计', tag: '行业模板', image: STUDIO_IMAGES[0], description: '结构、材质、场景与安全要求一体化出图', fields: 8 },
    { id: 'tpl-product', name: '通用商品图', tag: '通用模板', image: STUDIO_IMAGES[1], description: '适配不同品类的电商主图与细节展示', fields: 4 },
    { id: 'tpl-scene', name: '场景换图', tag: '图像编辑', image: STUDIO_IMAGES[2], description: '保留产品主体，快速替换使用环境', fields: 3 },
    { id: 'tpl-white', name: '电商白底图', tag: '输出预设', image: STUDIO_IMAGES[1], description: '标准白底、统一比例与平台尺寸', fields: 3 },
  ],
  projects: [
    { id: 'pr-1', name: '秋季户外帐篷场景探索', type: '帐篷设计', image: STUDIO_IMAGES[0], updated: '12 分钟前' },
    { id: 'pr-2', name: '轻量徒步帐配色方案', type: '图生图', image: STUDIO_IMAGES[1], updated: '昨天' },
    { id: 'pr-3', name: '夜间露营氛围图', type: '场景换图', image: STUDIO_IMAGES[2], updated: '2 天前' },
  ],
  generations: [
    { id: 'g-1', image: STUDIO_IMAGES[0], label: '主方案' },
    { id: 'g-2', image: STUDIO_IMAGES[1], label: '轻量版' },
    { id: 'g-3', image: STUDIO_IMAGES[2], label: '暖光版' },
  ],
  exports: [
    { id: 'ex-1', name: '三人户外露营帐篷｜主视觉', format: 'PNG · 2048 × 1536', updated: '今天 14:20', image: STUDIO_IMAGES[0] },
    { id: 'ex-2', name: '轻量双人徒步帐｜场景图', format: 'JPG · 1600 × 1200', updated: '昨天 17:05', image: STUDIO_IMAGES[1] },
  ],
  studio: {
    source: 'upload',
    linkedProductId: '',
    templateId: 'tpl-tent',
    task: 'image-to-image',
    provider: 'auto',
    model: '智能视觉 Pro',
    prompt: '极简风格的高端户外露营帐篷，米色面料，大面积开窗，前厅遮阳棚，木质平台，森林环境，柔和自然光，真实产品摄影',
    ratio: '4:3',
    count: 4,
    activeGenerationId: 'g-1',
    referenceImage: '',
  },
  ui: { route: 'studio', productSearch: '', productCategory: '全部品类', selectedAssetId: 'g-1' },
  connection: { geminiConfigured: false, keyLast4: '' },
};

let state = structuredClone(seedState);
let uploadImageData = '';
let saveTimer;
let generating = false;

function applySavedState(saved) {
  if (saved?.schemaVersion < 5 || !Array.isArray(saved.products)) return;
  state = {
    ...structuredClone(seedState),
    ...saved,
    studio: { ...seedState.studio, ...(saved.studio || {}) },
    ui: { ...seedState.ui, ...(saved.ui || {}) },
    connection: { ...seedState.connection, ...(saved.connection || {}) },
  };
}

function loadLocalState() {
  try {
    applySavedState(JSON.parse(localStorage.getItem('designflow-state') || 'null'));
  } catch { /* invalid browser cache falls back to seed data */ }
}

async function loadState() {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (response.ok) {
      applySavedState(await response.json());
    }
  } catch { /* local seed remains usable */ }
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (response.ok) {
      const config = await response.json();
      state.connection.geminiConfigured = Boolean(config.geminiConfigured);
      state.connection.keyLast4 = config.keyLast4 || '';
    }
  } catch { /* connection remains optional */ }
}

function saveState() {
  try { localStorage.setItem('designflow-state', JSON.stringify(state)); } catch { /* private browsing may reject writes */ }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) }); } catch { /* local app remains functional */ }
  }, 180);
}

const routeMeta = {
  home: ['DESIGN OVERVIEW', '首页'],
  studio: ['AI DESIGN WORKSPACE', '创建设计'],
  products: ['PRODUCT LIBRARY', '产品库'],
  templates: ['WORKFLOW TEMPLATES', '模板中心'],
  assets: ['CREATIVE ASSETS', '素材库'],
  exports: ['EXPORT HISTORY', '导出中心'],
  connections: ['MODEL PROVIDERS', '模型连接'],
};

function selectedTemplate() { return state.templates.find((item) => item.id === state.studio.templateId) || state.templates[0]; }
function selectedProduct() { return state.products.find((item) => item.id === state.studio.linkedProductId); }
function activeGeneration() { return state.generations.find((item) => item.id === state.studio.activeGenerationId) || state.generations[0]; }

function setRoute(route, focus = true, persist = true) {
  if (!routeMeta[route]) route = 'home';
  state.ui.route = route;
  history.replaceState(null, '', `#${route}`);
  $$('.nav-item[data-route]').forEach((item) => {
    const active = item.dataset.route === route;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  const [kicker, title] = routeMeta[route];
  $('#route-kicker').textContent = kicker;
  $('#route-title').textContent = title;
  document.body.classList.remove('nav-open');
  $('#mobile-menu').setAttribute('aria-expanded', 'false');
  render();
  if (persist) saveState();
  if (focus) requestAnimationFrame(() => $('#main-content')?.focus({ preventScroll: true }));
}

function renderTopbar() {
  const route = state.ui.route;
  const context = $('#topbar-context');
  const actions = $('#topbar-actions');
  context.innerHTML = route === 'studio' ? `<button class="template-selector" data-action="open-templates">${svgIcon('grid')}<span>当前模板：<strong>${escapeHtml(selectedTemplate().name)}</strong></span>${svgIcon('chevron')}</button>` : '';
  if (route === 'studio') {
    actions.innerHTML = `<button class="button button--secondary" data-action="new-design">${svgIcon('plus')}新建</button><button class="button button--secondary" data-action="trigger-studio-upload">${svgIcon('upload')}导入参考</button><button class="button button--primary" data-action="export-current">${svgIcon('download')}导出</button>`;
  } else if (route === 'products') {
    actions.innerHTML = `<button class="button button--secondary" data-action="open-import">${svgIcon('upload')}导入产品</button><button class="button button--primary" data-action="new-design">${svgIcon('plus')}新建设计</button>`;
  } else {
    actions.innerHTML = `<button class="button button--primary" data-action="new-design">${svgIcon('plus')}新建设计</button>`;
  }
}

function showToast(title, detail, icon = 'check') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${svgIcon(icon)}</div><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div><button aria-label="关闭通知">${svgIcon('x')}</button>`;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  $('#toast-stack').append(toast);
  setTimeout(() => toast.remove(), 4200);
}

function pageHeading(kicker, title, copy, action = '') {
  return `<div class="page-heading"><div><span class="eyebrow">${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div>${action}</div>`;
}

function sourceCard(type, icon, title, copy) {
  const active = state.studio.source === type;
  return `<button class="source-card ${active ? 'is-active' : ''}" data-source="${type}" aria-pressed="${active}"><span class="source-icon">${svgIcon(icon)}</span><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></span></button>`;
}

function renderStudio() {
  const product = selectedProduct();
  const generation = activeGeneration();
  const canvasImage = state.studio.referenceImage || generation?.image || STUDIO_IMAGES[0];
  const versionItems = state.generations.slice(0, 5);
  return `<section class="page page--studio">
    <div class="studio-layout">
      <aside class="studio-panel source-panel" aria-label="输入来源">
        <div class="panel-heading"><h2>输入来源</h2><p>选择本次设计从哪里开始</p></div>
        <div class="source-stack">
          ${sourceCard('blank', 'plus', '空白开始', '从零开始创作')}
          ${sourceCard('upload', 'upload', '上传图片', '上传参考图')}
          ${sourceCard('product', 'box', '从产品库选择', '关联产品（可选）')}
        </div>
        <input id="studio-file" type="file" accept="image/png,image/jpeg,image/webp" hidden>
        <div class="linked-product">
          <div class="linked-label"><span>关联产品（可选）</span>${product ? `<button class="text-button" data-action="unlink-product">取消关联</button>` : ''}</div>
          ${product ? `<article class="product-mini"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"><div><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.sku)}</span></div></article>` : `<button class="source-card" data-action="choose-product"><span class="source-icon">${svgIcon('link')}</span><span><strong>未关联产品</strong><span>生成结果不会写入产品版本</span></span></button>`}
        </div>
      </aside>

      <section class="canvas-panel" aria-label="设计画布">
        <div class="canvas-stage">
          <img src="${escapeHtml(canvasImage)}" alt="当前设计画布预览">
          <span class="canvas-badge">${escapeHtml(selectedTemplate().name)} · ${escapeHtml(generation?.label || '参考图')}</span>
          <div class="canvas-tools"><button class="icon-button" data-action="refresh-canvas" aria-label="切换预览">${svgIcon('refresh')}</button><button class="icon-button" data-action="expand-preview" aria-label="放大预览">${svgIcon('expand')}</button></div>
        </div>
        <div class="version-panel">
          <div class="version-head"><strong>版本预览</strong><span>${state.generations.length} 个设计版本</span></div>
          <div class="version-strip">${versionItems.map((item) => `<button class="version-thumb ${item.id === state.studio.activeGenerationId ? 'is-active' : ''}" data-generation-id="${item.id}" aria-label="查看${escapeHtml(item.label)}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.label)}"></button>`).join('')}</div>
        </div>
      </section>

      <aside class="studio-panel settings-panel" aria-label="生成设置">
        <div class="panel-heading"><h3>生成设置</h3><p>选择任务、模型与输出参数</p></div>
        <div class="settings-section"><div class="field-label">任务类型</div><div class="segmented"><button class="segment ${state.studio.task === 'image-to-image' ? 'is-active' : ''}" data-task="image-to-image">图生图</button><button class="segment ${state.studio.task === 'text-to-image' ? 'is-active' : ''}" data-task="text-to-image">文生图</button><button class="segment ${state.studio.task === 'multi-image' ? 'is-active' : ''}" data-task="multi-image">多图融合</button></div></div>
        <div class="settings-section"><div class="field-label">模型选择 <small>按能力自动匹配</small></div><select class="select-control" id="model-select"><option value="智能视觉 Pro" ${state.studio.model === '智能视觉 Pro' ? 'selected' : ''}>智能视觉 Pro · 细节丰富</option><option value="快速创意" ${state.studio.model === '快速创意' ? 'selected' : ''}>快速创意 · 低延迟</option><option value="结构保持" ${state.studio.model === '结构保持' ? 'selected' : ''}>结构保持 · 产品专用</option></select></div>
        <div class="settings-section"><div class="field-label">提示词 <small id="prompt-count">${state.studio.prompt.length} / 1000</small></div><textarea id="prompt-input" maxlength="1000">${escapeHtml(state.studio.prompt)}</textarea></div>
        <div class="settings-section"><div class="field-label">画面比例</div><div class="ratio-grid">${['1:1', '3:4', '4:3', '16:9', '9:16'].map((ratio) => `<button class="choice-button ${state.studio.ratio === ratio ? 'is-active' : ''}" data-ratio="${ratio}">${ratio}</button>`).join('')}</div></div>
        <div class="settings-section"><div class="field-label">生成数量</div><div class="count-grid">${[1, 2, 4, 8].map((count) => `<button class="choice-button ${state.studio.count === count ? 'is-active' : ''}" data-count="${count}">${count}</button>`).join('')}</div></div>
        <div class="generate-wrap"><button class="button button--primary generate-button" data-action="generate" ${generating ? 'disabled' : ''}>${svgIcon(generating ? 'refresh' : 'sparkles')}${generating ? '正在生成…' : '生成'}</button><p class="cost-note">预计消耗 ${state.studio.count * 12} 积分 · 当前余额 ${state.credits}</p></div>
      </aside>
    </div>
  </section>`;
}

function renderHome() {
  return `<section class="page">${pageHeading('PUBLIC DESIGN PLATFORM', '让每一次创意都有清晰的起点', '从空白、参考图或产品库开始，使用同一套工作台完成生成、比较、版本沉淀与导出。')}
    <div class="quick-start">
      <button class="quick-card" data-action="new-design"><span class="source-icon">${svgIcon('plus')}</span><span><strong>新建设计</strong><span>从空白画布或参考图开始</span></span></button>
      <button class="quick-card" data-route="products"><span class="source-icon">${svgIcon('box')}</span><span><strong>从产品开始</strong><span>选择 SKU 并关联设计版本</span></span></button>
      <button class="quick-card" data-route="templates"><span class="source-icon">${svgIcon('grid')}</span><span><strong>使用模板</strong><span>快速加载行业参数与输出规范</span></span></button>
    </div>
    <div class="home-grid"><article class="surface surface-pad"><div class="section-title"><div><h3>最近设计</h3><p>继续上次未完成的创意项目</p></div><button class="text-button" data-route="studio">进入工作台</button></div><div class="recent-list">${state.projects.map((project) => `<div class="recent-row"><img src="${project.image}" alt="${escapeHtml(project.name)}"><div><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.type)}</span></div><span>${escapeHtml(project.updated)}</span></div>`).join('')}</div></article><article class="surface surface-pad"><div class="section-title"><div><h3>工作区状态</h3><p>本地运行与模型连接</p></div></div><div class="recent-list"><div class="recent-row"><span class="source-icon">${svgIcon('database')}</span><div><strong>模型服务</strong><span>${state.connection.geminiConfigured ? '已保存 1 个连接' : '当前使用演示适配器'}</span></div><span class="status-chip ${state.connection.geminiConfigured ? 'amber' : 'blue'}">${state.connection.geminiConfigured ? '待授权' : '演示'}</span></div><div class="recent-row"><span class="source-icon">${svgIcon('box')}</span><div><strong>产品库</strong><span>${state.products.length} 个 SKU</span></div><span class="status-chip">本地</span></div></div></article></div>
  </section>`;
}

function statusChip(status) {
  const style = status === '已完成' ? '' : status === '设计中' ? 'blue' : 'amber';
  return `<span class="status-chip ${style}">${escapeHtml(status)}</span>`;
}

function renderProducts() {
  const query = state.ui.productSearch.trim().toLowerCase();
  const filtered = state.products.filter((product) => (!query || `${product.name}${product.sku}${product.category}`.toLowerCase().includes(query)) && (state.ui.productCategory === '全部品类' || product.category === state.ui.productCategory));
  const categories = ['全部品类', ...new Set(state.products.map((item) => item.category))];
  return `<section class="page">${pageHeading('PRODUCT LIBRARY', '产品库', '集中管理 SKU、基础参考图与设计版本；生图在独立工作台中完成。', `<button class="button button--primary" data-action="open-import">${svgIcon('upload')}导入产品</button>`)}
    <div class="toolbar"><label class="search-wrap">${svgIcon('search')}<input class="input-control" id="product-search" type="search" placeholder="搜索产品名称、SKU 或品类" value="${escapeHtml(state.ui.productSearch)}" aria-label="搜索产品"></label><select class="select-control" id="category-filter" aria-label="按品类筛选">${categories.map((item) => `<option ${item === state.ui.productCategory ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
    <div class="product-table"><div class="table-row table-row--head"><span>SKU</span><span>主图</span><span>产品名称</span><span>品类</span><span>参考素材</span><span>设计版本</span><span>状态</span><span>更新时间</span><span></span></div>${filtered.length ? filtered.map((product) => `<div class="table-row"><span>${escapeHtml(product.sku)}</span><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"><span><strong>${escapeHtml(product.name)}</strong><small>${product.id === 'p-1' ? '帐篷设计模板' : '可关联任意模板'}</small></span><span>${escapeHtml(product.category)}</span><span>${product.references} 张</span><span>${product.versions} 个</span>${statusChip(product.status)}<span>${escapeHtml(product.updated)}</span><button class="button row-action" data-action="design-product" data-id="${product.id}" aria-label="基于${escapeHtml(product.name)}创建设计">${svgIcon('chevron')}</button></div>`).join('') : '<div class="empty-state">没有符合筛选条件的产品</div>'}</div>
  </section>`;
}

function renderTemplates() {
  return `<section class="page">${pageHeading('WORKFLOW TEMPLATES', '模板中心', '模板只提供参数、提示词和输出预设；所有模板共用同一个设计引擎。')}
    <div class="card-grid">${state.templates.map((template) => `<article class="template-card"><img src="${template.image}" alt="${escapeHtml(template.name)}示例"><div class="card-body"><h3>${escapeHtml(template.name)}</h3><p>${escapeHtml(template.description)}</p><div class="card-meta"><span class="tag">${escapeHtml(template.tag)} · ${template.fields} 项参数</span><button class="button button--quiet" data-action="use-template" data-id="${template.id}">使用模板</button></div></div></article>`).join('')}</div>
  </section>`;
}

function renderAssets() {
  const assets = [...state.generations, ...state.generations, ...state.generations].slice(0, 8).map((item, index) => ({ ...item, id: `asset-${index}`, label: ['主视觉', '轻量版本', '暖光场景', '产品参考', '结构探索', '场景方案', '电商主图', '导出版本'][index] }));
  return `<section class="page">${pageHeading('CREATIVE ASSETS', '素材库', '统一管理参考图、生成结果和可复用视觉素材；素材可以独立存在，也可以关联产品。', `<button class="button button--secondary" data-action="trigger-studio-upload">${svgIcon('upload')}上传素材</button>`)}
    <div class="card-grid">${assets.map((asset) => `<article class="asset-card ${state.ui.selectedAssetId === asset.id ? 'is-selected' : ''}" data-asset-id="${asset.id}"><img src="${asset.image}" alt="${escapeHtml(asset.label)}"><div class="card-body"><h3>${escapeHtml(asset.label)}</h3><div class="card-meta"><span class="tag">生成图片</span><button class="button button--quiet" data-action="download-asset" data-image="${asset.image}" data-name="${escapeHtml(asset.label)}">${svgIcon('download')}下载</button></div></div></article>`).join('')}</div>
  </section>`;
}

function renderExports() {
  const formats = [
    ['image', '图片导出', 'PNG、JPG、WebP 与多种画面比例'],
    ['file', '设计提案', '按当前项目生成可分享的 HTML 提案'],
    ['download', '批量下载', '将选中版本打包为统一规格素材'],
  ];
  return `<section class="page">${pageHeading('EXPORT HISTORY', '导出中心', '导出与生成分离，按用途保存规格和历史记录。')}
    <div class="export-grid">${formats.map(([icon, title, copy]) => `<article class="export-card">${svgIcon(icon)}<h3>${title}</h3><p>${copy}</p><button class="button button--quiet" data-action="export-current">立即导出</button></article>`).join('')}</div>
    <article class="surface surface-pad" style="margin-top:18px"><div class="section-title"><div><h3>最近导出</h3><p>保留文件规格与来源版本</p></div></div><div class="recent-list">${state.exports.map((item) => `<div class="recent-row"><img src="${item.image}" alt="${escapeHtml(item.name)}"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.format)}</span></div><span>${escapeHtml(item.updated)}</span></div>`).join('')}</div></article>
  </section>`;
}

function renderConnections() {
  const geminiStatus = state.connection.geminiConfigured ? '已保存，待授权' : '未配置';
  return `<section class="page">${pageHeading('MODEL PROVIDERS', '模型连接', '服务商只负责提供能力，设计页面不依赖某一家模型。')}
    <div class="connection-grid">
      <article class="connection-card"><div class="connection-head"><span class="model-avatar">G</span><div><h3>Google Gemini</h3><p>${geminiStatus}${state.connection.keyLast4 ? ` · 尾号 ${escapeHtml(state.connection.keyLast4)}` : ''}</p></div></div><div class="capability-list"><span class="tag">文生图</span><span class="tag">图生图</span><span class="tag">多参考图</span></div><button class="button button--quiet" data-action="test-connection" data-provider="Google Gemini">测试连接</button></article>
      <article class="connection-card"><div class="connection-head"><span class="model-avatar">O</span><div><h3>OpenAI Images</h3><p>未配置</p></div></div><div class="capability-list"><span class="tag">文生图</span><span class="tag">图像编辑</span><span class="tag">透明背景</span></div><button class="button button--quiet" data-action="test-connection" data-provider="OpenAI Images">配置连接</button></article>
      <article class="connection-card"><div class="connection-head"><span class="model-avatar">+</span><div><h3>自定义模型</h3><p>通过服务端代理接入</p></div></div><div class="capability-list"><span class="tag">能力自定义</span><span class="tag">私有部署</span></div><button class="button button--quiet" data-action="test-connection" data-provider="自定义模型">添加连接</button></article>
    </div>
  </section>`;
}

function render() {
  renderTopbar();
  const views = { home: renderHome, studio: renderStudio, products: renderProducts, templates: renderTemplates, assets: renderAssets, exports: renderExports, connections: renderConnections };
  $('#app-view').innerHTML = (views[state.ui.route] || renderHome)();
  hydrateIcons($('#app-view'));
}

function openImport() {
  $('#import-modal').hidden = false;
  document.body.style.overflow = 'hidden';
  hydrateIcons($('#import-modal'));
  requestAnimationFrame(() => $('#import-form input[name="name"]')?.focus());
}

function closeImport() {
  $('#import-modal').hidden = true;
  document.body.style.overflow = '';
  uploadImageData = '';
  $('#import-form')?.reset();
  const preview = $('#upload-preview');
  if (preview) { preview.hidden = true; preview.removeAttribute('src'); }
}

function triggerStudioUpload() {
  if (state.ui.route !== 'studio') setRoute('studio', false);
  requestAnimationFrame(() => $('#studio-file')?.click());
}

function generateDesign() {
  if (generating) return;
  if (state.credits < state.studio.count * 12) { showToast('积分不足', '请减少生成数量后重试', 'database'); return; }
  generating = true;
  render();
  setTimeout(() => {
    const nextImage = STUDIO_IMAGES[state.generations.length % STUDIO_IMAGES.length];
    const item = { id: uid('generation'), image: nextImage, label: `${selectedTemplate().name} · ${nowLabel()}` };
    state.generations.unshift(item);
    state.studio.activeGenerationId = item.id;
    state.studio.referenceImage = '';
    state.credits -= state.studio.count * 12;
    state.projects.unshift({ id: uid('project'), name: state.studio.prompt.slice(0, 18) || '未命名设计', type: selectedTemplate().name, image: nextImage, updated: '刚刚' });
    generating = false;
    saveState();
    render();
    showToast('设计版本已生成', '结果已加入版本预览，可继续比较或导出', 'sparkles');
  }, 1500);
}

function downloadImage(image, name = '设计图片') {
  const anchor = document.createElement('a');
  anchor.href = image;
  anchor.download = `${name.replace(/[\\/:*?"<>|]/g, '_')}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  state.exports.unshift({ id: uid('export'), name, format: 'PNG · 原始尺寸', updated: '刚刚', image });
  saveState();
  showToast('已开始导出', `${name} 已加入导出记录`, 'download');
}

document.addEventListener('click', async (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { setRoute(routeButton.dataset.route); return; }
  const button = event.target.closest('[data-action], [data-source], [data-task], [data-ratio], [data-count], [data-generation-id], [data-asset-id]');
  if (!button) return;

  if (button.dataset.source) {
    state.studio.source = button.dataset.source;
    if (button.dataset.source === 'upload') triggerStudioUpload();
    if (button.dataset.source === 'product') setRoute('products'); else { saveState(); render(); }
    return;
  }
  if (button.dataset.task) { state.studio.task = button.dataset.task; saveState(); render(); return; }
  if (button.dataset.ratio) { state.studio.ratio = button.dataset.ratio; saveState(); render(); return; }
  if (button.dataset.count) { state.studio.count = Number(button.dataset.count); saveState(); render(); return; }
  if (button.dataset.generationId) { state.studio.activeGenerationId = button.dataset.generationId; state.studio.referenceImage = ''; saveState(); render(); return; }
  if (button.dataset.assetId) { state.ui.selectedAssetId = button.dataset.assetId; render(); return; }

  const action = button.dataset.action;
  if (action === 'new-design') {
    state.studio = { ...seedState.studio, activeGenerationId: state.generations[0]?.id || 'g-1' };
    setRoute('studio');
    showToast('已创建空白设计', '可以上传参考图或直接填写提示词', 'plus');
  }
  if (action === 'open-import') openImport();
  if (action === 'close-modal') closeImport();
  if (action === 'trigger-studio-upload') triggerStudioUpload();
  if (action === 'choose-product' || action === 'open-products') setRoute('products');
  if (action === 'open-templates') setRoute('templates');
  if (action === 'unlink-product') { state.studio.linkedProductId = ''; state.studio.source = 'upload'; saveState(); render(); }
  if (action === 'design-product') {
    state.studio.linkedProductId = button.dataset.id;
    state.studio.source = 'product';
    const product = selectedProduct();
    if (product) {
      const item = { id: uid('generation'), image: product.image, label: `${product.sku} · 产品参考` };
      state.generations.unshift(item);
      state.studio.activeGenerationId = item.id;
    }
    setRoute('studio');
    showToast('产品已关联', '生成结果将保存到该产品的设计版本中', 'link');
  }
  if (action === 'use-template') { state.studio.templateId = button.dataset.id; setRoute('studio'); showToast('模板已加载', `${selectedTemplate().name}的参数和提示词已准备好`, 'grid'); }
  if (action === 'generate') generateDesign();
  if (action === 'refresh-canvas') {
    const index = Math.max(0, state.generations.findIndex((item) => item.id === state.studio.activeGenerationId));
    state.studio.activeGenerationId = state.generations[(index + 1) % state.generations.length].id;
    state.studio.referenceImage = '';
    render();
  }
  if (action === 'expand-preview') showToast('画布预览', '当前版本已按最大工作区尺寸展示', 'expand');
  if (action === 'export-current') downloadImage(activeGeneration()?.image || STUDIO_IMAGES[0], activeGeneration()?.label || '设计图片');
  if (action === 'download-asset') downloadImage(button.dataset.image, button.dataset.name);
  if (action === 'test-connection') showToast(`${button.dataset.provider}连接检查`, button.dataset.provider === 'Google Gemini' && state.connection.geminiConfigured ? '密钥已保存，但当前 API 权限尚未开放' : '请在服务端配置访问凭据', 'database');
  if (action === 'shutdown-app') {
    button.disabled = true;
    showToast('正在退出', '设计状态已保存', 'power');
    try { await fetch('/api/shutdown', { method: 'POST' }); } catch { /* desktop host may close first */ }
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'prompt-input') {
    state.studio.prompt = event.target.value;
    const counter = $('#prompt-count');
    if (counter) counter.textContent = `${event.target.value.length} / 1000`;
    saveState();
  }
  if (event.target.id === 'product-search') {
    state.ui.productSearch = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = $('#product-search');
    input?.focus();
    input?.setSelectionRange(position, position);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'model-select') { state.studio.model = event.target.value; saveState(); }
  if (event.target.id === 'category-filter') { state.ui.productCategory = event.target.value; render(); saveState(); }
  if (event.target.id === 'studio-file') {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { state.studio.referenceImage = String(reader.result); state.studio.source = 'upload'; saveState(); render(); showToast('参考图已加入', '现在可以选择模型并生成新版本', 'image'); };
    reader.readAsDataURL(file);
  }
  if (event.target.id === 'product-image') {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { uploadImageData = String(reader.result); const preview = $('#upload-preview'); preview.src = uploadImageData; preview.hidden = false; };
    reader.readAsDataURL(file);
  }
});

$('#import-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const product = { id: uid('product'), name: String(form.get('name')), sku: String(form.get('sku')), category: String(form.get('category')), status: String(form.get('status')), image: uploadImageData || STUDIO_IMAGES[state.products.length % STUDIO_IMAGES.length], references: uploadImageData ? 1 : 0, versions: 0, updated: '刚刚' };
  state.products.unshift(product);
  closeImport();
  setRoute('products');
  showToast('产品已加入产品库', '需要生图时再从产品行进入设计工作台', 'box');
});

$('#mobile-menu').addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  $('#mobile-menu').setAttribute('aria-expanded', String(open));
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#import-modal').hidden) closeImport(); });

(async function init() {
  hydrateIcons();
  loadLocalState();
  const initialRoute = location.hash.slice(1);
  setRoute(routeMeta[initialRoute] ? initialRoute : (state.ui.route || 'studio'), false, false);
  await loadState();
  const refreshedRoute = location.hash.slice(1);
  setRoute(routeMeta[refreshedRoute] ? refreshedRoute : (state.ui.route || 'studio'), false, false);
})();
