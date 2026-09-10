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
  refresh: '<path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .9-7L20 12"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  filter: '<path d="M4 5h16l-6 7v5l-4 2v-7Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  folder: '<path d="M3 6h7l2 2h9v11H3Z"/>',
};

const svgIcon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowLabel = () => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
const BASE_IMAGES = ['/assets/choices/tent-camp.png', '/assets/choices/tent-nursery.png', '/assets/choices/tent-playhouse.png', '/assets/choices/tent-teepee.png', '/assets/choices/tent-aframe.png', '/assets/choices/tent-canopy.png', '/assets/choices/tent-popup.png', '/assets/choices/tent-tunnel.png'];
const RESULT_IMAGES = ['/assets/studio/tent-hero.png', '/assets/studio/tent-variant-a.png', '/assets/studio/tent-variant-b.png', '/assets/choices/scene-reading.jpg', '/assets/choices/scene-bedroom.jpg', '/assets/choices/scene-backyard.jpg'];
const CREDIT_PER_IMAGE = 3;
const MAX_BATCH_SIZE = 24;
const QWEN_POLL_INTERVAL = 10000;
const QWEN_SUBMIT_CONCURRENCY = 2;
const QWEN_TASK_TIMEOUT_MS = 10 * 60 * 1000;
const QWEN_KEY_STORAGE = 'designflow-qwen-api-key';
const MAX_REFERENCE_IMAGE_BYTES = 8 * 1024 * 1024;
const referenceImageCache = new Map();

function hydrateIcons(scope = document) {
  $$('[data-icon]', scope).forEach((el) => { el.innerHTML = svgIcon(el.dataset.icon); });
}

const productDefinitions = [
  ['三人户外露营帐篷', 'TENT-3P-001', '户外装备 / 帐篷', BASE_IMAGES[0], ['210 × 210 × 145 cm', '涤纶防水布', '米白 / 深灰', '3–4 人']],
  ['轻量双人徒步帐', 'TENT-2P-014', '户外装备 / 帐篷', BASE_IMAGES[1], ['200 × 140 × 105 cm', '轻量尼龙', '雾蓝 / 米白', '2 人']],
  ['家庭四人快开帐', 'TENT-4P-008', '户外装备 / 帐篷', BASE_IMAGES[2], ['240 × 210 × 160 cm', '牛津布', '鼠尾草绿', '4 人']],
  ['儿童室内游戏屋', 'KIDS-HOUSE-03', '儿童家居 / 游戏帐', BASE_IMAGES[2], ['120 × 120 × 150 cm', '棉帆布', '米白 / 鼠尾草绿', '3–8 岁']],
  ['棉帆布 Teepee', 'TEEPEE-CAN-09', '儿童家居 / Teepee', BASE_IMAGES[3], ['120 × 120 × 155 cm', '棉帆布', '原木 / 米白', '3–8 岁']],
  ['后院遮阳露营帐', 'SHADE-YARD-06', '户外装备 / 遮阳帐', BASE_IMAGES[5], ['直径 140 × 230 cm', '雪纺 / 棉', '杏色', '家庭']],
  ['睡衣派对 A 字帐', 'AFRAME-PAR-11', '活动用品 / 派对帐', BASE_IMAGES[4], ['130 × 110 × 125 cm', '棉帆布', '米白 / 原木', '3–10 岁']],
  ['婴幼儿便携防晒帐', 'BABY-UV-05', '母婴用品 / 防晒帐', BASE_IMAGES[1], ['110 × 75 × 65 cm', 'UPF50+ 聚酯', '冰川蓝', '0–3 岁']],
  ['双通道游戏隧道', 'PLAY-TUN-07', '儿童玩具 / 隧道', BASE_IMAGES[7], ['300 × 120 × 105 cm', '透气网纱', '薄荷 / 珊瑚', '3–8 岁']],
  ['六人家庭天幕帐', 'CAMP-6P-021', '户外装备 / 天幕帐', BASE_IMAGES[0], ['320 × 280 × 205 cm', '涤纶防水布', '卡其 / 深灰', '5–6 人']],
];

function seedProduct([name, sku, category, image, specs], index) {
  return { id: `p-${index + 1}`, name, sku, category, image, specs: { size: specs[0], material: specs[1], color: specs[2], audience: specs[3], windows: index % 2 ? '2 面透气窗' : '4 面透气窗' }, references: index < 3 ? 4 + index : 0, versions: index < 3 ? 2 : 0, status: index < 3 ? '已有素材' : '底图就绪', updated: index < 3 ? '今天' : `${index + 1} 天前` };
}

const seedSavedAssets = [
  { id: 'asset-p1-1', productId: 'p-1', image: RESULT_IMAGES[0], tags: ['悉尼', '米白', '产品主图'], batchId: 'B-240907', createdAt: '今天 14:20' },
  { id: 'asset-p1-2', productId: 'p-1', image: RESULT_IMAGES[1], tags: ['迪拜', '红色', '亲子生活图'], batchId: 'B-240907', createdAt: '今天 14:20' },
  { id: 'asset-p1-3', productId: 'p-1', image: RESULT_IMAGES[2], tags: ['苏州', '蓝色', '电商详情图'], batchId: 'B-240906', createdAt: '昨天 17:05' },
  { id: 'asset-p2-1', productId: 'p-2', image: RESULT_IMAGES[3], tags: ['悉尼', '蓝色', '阅读场景'], batchId: 'B-240905', createdAt: '2 天前' },
  { id: 'asset-p2-2', productId: 'p-2', image: RESULT_IMAGES[4], tags: ['迪拜', '米白', '卧室场景'], batchId: 'B-240905', createdAt: '2 天前' },
];

const seedState = {
  schemaVersion: 6,
  credits: 2680,
  products: productDefinitions.map(seedProduct),
  savedAssets: seedSavedAssets,
  templates: [
    { id: 'tpl-tent', name: '帐篷批量创作', tag: '行业模板', image: RESULT_IMAGES[0], description: '按 SKU 与提示词组合批量生产创意素材', fields: 8 },
    { id: 'tpl-product', name: '通用商品图', tag: '通用模板', image: RESULT_IMAGES[1], description: '适配不同品类的电商主图与细节展示', fields: 4 },
    { id: 'tpl-scene', name: '场景换图', tag: '图像编辑', image: RESULT_IMAGES[2], description: '保留产品主体，快速替换使用环境', fields: 3 },
  ],
  projects: [
    { id: 'pr-1', name: '三款帐篷区域素材批次', type: '批量创作', image: RESULT_IMAGES[0], updated: '12 分钟前' },
    { id: 'pr-2', name: '儿童帐篷多配色方案', type: '提示词组合', image: RESULT_IMAGES[1], updated: '昨天' },
  ],
  promptGroups: [
    { id: 'group-location', name: '地理位置', enabled: true, options: [{ id: 'sydney', label: '澳大利亚·悉尼', selected: true, quantity: 1 }, { id: 'dubai', label: '阿联酋·迪拜', selected: true, quantity: 2 }, { id: 'suzhou', label: '中国·苏州', selected: false, quantity: 1 }] },
    { id: 'group-color', name: '颜色组', enabled: true, options: [{ id: 'red', label: '暖陶红', selected: true, quantity: 1 }, { id: 'blue', label: '冰川蓝', selected: true, quantity: 1 }, { id: 'cream', label: '奶油白', selected: false, quantity: 1 }] },
  ],
  promptLibrary: [
    { id: 'group-scene', name: '使用场景', options: ['儿童房', '阅读角', '后院草地', '露营营地'] },
    { id: 'group-purpose', name: '页面用途', options: ['产品主图', '亲子生活图', '电商详情图'] },
    { id: 'group-style', name: '视觉风格', options: ['北欧自然', '轻奢柔光', '明亮电商', '户外纪实'] },
  ],
  studio: { selectedProductIds: ['p-1', 'p-2', 'p-3'], templateId: 'tpl-tent', universalPrompt: '保持参考图中儿童帐篷的结构、比例、开口与支架准确，真实高端商业摄影，童趣但不幼稚，主体完整，画面干净，不添加文字、商标与水印。', model: 'qwen-image-3.0-pro', ratio: '4:3' },
  batch: { id: '', status: 'idle', results: [], plannedTotal: 18, startedAt: '', savedAt: '' },
  ui: { route: 'products', productSearch: '', productCategory: '全部品类', drawerProductId: '', drawerTab: 'info', assetFilter: '全部', productPickerOpen: false, promptDialogGroupId: '', confirmBatch: false },
  connection: { provider: 'qwen', userKeyRequired: true, authenticated: false, model: 'qwen-image-3.0-pro' },
};

let state = structuredClone(seedState);
let uploadImageData = '';
let saveTimer;
let generationTimer;
let activeGenerationId = '';
let lastFocusedElement = null;
let keyDialogOpen = false;
let keyDialogError = '';
let pendingKeyAction = '';
let imagePreview = null;

function applySavedState(saved) {
  if (saved?.schemaVersion !== 6 || !Array.isArray(saved.products)) return;
  state = { ...structuredClone(seedState), ...saved, studio: { ...seedState.studio, ...(saved.studio || {}) }, batch: { ...seedState.batch, ...(saved.batch || {}) }, ui: { ...seedState.ui, ...(saved.ui || {}) }, connection: { ...seedState.connection, ...(saved.connection || {}) } };
}

function loadLocalState() {
  try { applySavedState(JSON.parse(localStorage.getItem('designflow-state') || 'null')); } catch { /* use seed */ }
}

async function loadState() {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) applySavedState(await response.json());
  } catch { /* local seed remains usable */ }
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const config = await response.json();
      state.connection.provider = config.provider || 'qwen';
      state.connection.userKeyRequired = config.userKeyRequired !== false;
      state.connection.model = config.model || 'qwen-image-3.0-pro';
    }
  } catch { /* connection is optional */ }
}

function saveState() {
  try { localStorage.setItem('designflow-state', JSON.stringify(state)); } catch { /* private mode may reject */ }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) }); } catch { /* local app remains functional */ }
  }, 180);
}

function getQwenApiKey() {
  try { return sessionStorage.getItem(QWEN_KEY_STORAGE) || ''; } catch { return ''; }
}

function setQwenApiKey(value) {
  try { sessionStorage.setItem(QWEN_KEY_STORAGE, value); return true; } catch { return false; }
}

function clearQwenApiKey() {
  try { sessionStorage.removeItem(QWEN_KEY_STORAGE); } catch { /* restricted browser storage */ }
  state.connection.authenticated = false;
}

function normalizeQwenApiKey(value) {
  return String(value || '').replace(/\\([_.-])/g, '$1').replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
}

function isQwenApiKey(value) {
  return /^sk-[A-Za-z0-9._-]{16,512}$/.test(value);
}

const routeMeta = { home: ['工作台总览', '首页'], studio: ['批量素材生产', '创建设计'], products: ['SKU 与真实底图', '产品库'], templates: ['复用生产规则', '模板中心'], assets: ['全部二维图片', '素材库'], exports: ['交付与下载', '导出中心'], connections: ['生成服务', '模型连接'] };
function productById(id) { return state.products.find((item) => item.id === id); }
function selectedProducts() { return state.studio.selectedProductIds.map(productById).filter(Boolean); }
function selectedOptions(group) { return group.options.filter((option) => option.selected && option.quantity > 0); }
function groupFactor(group) { return group.enabled ? selectedOptions(group).reduce((sum, option) => sum + option.quantity, 0) : 1; }
function enabledGroups() { return state.promptGroups.filter((group) => group.enabled && groupFactor(group) > 0); }
function plannedTotal() { const products = selectedProducts().length; return products ? enabledGroups().reduce((total, group) => total * groupFactor(group), products) : 0; }
function formulaText() { return [`${selectedProducts().length} 个产品`, ...enabledGroups().map((group) => `${groupFactor(group)} 个${group.name}`)].join(' × ') + ` = ${plannedTotal()} 张素材`; }
function batchCost() { return plannedTotal() * CREDIT_PER_IMAGE; }
function productAssets(id) { return state.savedAssets.filter((asset) => asset.productId === id); }
function batchReadyCount() { return state.batch.results.filter((item) => item.status === 'ready').length; }
function batchFailedCount() { return state.batch.results.filter((item) => item.status === 'failed').length; }
function batchDelayedCount() { return state.batch.results.filter((item) => item.status === 'delayed').length; }
function batchSettledCount() { return batchReadyCount() + batchFailedCount(); }
function batchProgress() { return state.batch.results.length ? Math.round((batchSettledCount() / state.batch.results.length) * 100) : 0; }
function elapsedMinutes(startedAt, finishedAt = 0) { return startedAt ? Math.max(1, Math.ceil(((finishedAt || Date.now()) - startedAt) / 60000)) : 0; }
function batchStatusLabel() {
  if (state.batch.status === 'generating') return '生成中';
  if (state.batch.status === 'delayed') return '等待超时';
  if (state.batch.status === 'saved') return '已完成';
  if (batchFailedCount() && !batchReadyCount()) return '生成失败';
  return '待保存';
}

function setRoute(route, focus = true, persist = true) {
  if (!routeMeta[route]) route = 'home';
  state.ui.route = route;
  history.replaceState(null, '', `#${route}`);
  $$('.nav-item[data-route]').forEach((item) => { const active = item.dataset.route === route; item.classList.toggle('is-active', active); if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current'); });
  const [kicker, title] = routeMeta[route];
  $('#route-kicker').textContent = kicker;
  $('#route-title').textContent = title;
  document.body.classList.remove('nav-open');
  render();
  if (persist) saveState();
  if (focus) requestAnimationFrame(() => $('#main-content')?.focus({ preventScroll: true }));
}

function showToast(title, detail, icon = 'check') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${svgIcon(icon)}</div><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div><button aria-label="关闭通知">${svgIcon('x')}</button>`;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  $('#toast-stack').append(toast);
  setTimeout(() => toast.remove(), 4200);
}

function pageHeading(title, copy, action = '') { return `<div class="page-heading"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div>${action}</div>`; }
function statusChip(status) { const style = status === '已完成' || status === '已有素材' ? '' : status === '生成中' ? 'blue' : 'amber'; return `<span class="status-chip ${style}">${escapeHtml(status)}</span>`; }

function renderTopbar() {
  const route = state.ui.route;
  $('#topbar-context').innerHTML = route === 'studio' ? `<div class="batch-context">${svgIcon('layers')}<span>${selectedProducts().length} 个产品 · ${plannedTotal()} 张计划素材</span></div>` : '';
  if (route === 'studio') {
    $('#topbar-actions').innerHTML = `<button class="button button--secondary" data-action="open-product-picker">${svgIcon('plus')}选择产品</button>${state.batch.results.length ? `<button class="button button--primary" data-action="save-batch" ${batchReadyCount() ? '' : 'disabled'}>${svgIcon('folder')}保存批次</button>` : ''}`;
  } else if (route === 'products') {
    $('#topbar-actions').innerHTML = `<button class="button button--primary" data-action="open-import">${svgIcon('upload')}导入产品</button>`;
  } else {
    $('#topbar-actions').innerHTML = `<button class="button button--primary" data-action="open-product-picker">${svgIcon('plus')}新建批次</button>`;
  }
}

function renderProducts() {
  const query = state.ui.productSearch.trim().toLowerCase();
  const filtered = state.products.filter((product) => (!query || `${product.name}${product.sku}${product.category}`.toLowerCase().includes(query)) && (state.ui.productCategory === '全部品类' || product.category === state.ui.productCategory));
  const categories = ['全部品类', ...new Set(state.products.map((item) => item.category))];
  return `<section class="page">${pageHeading('产品库', '以 SKU 和真实白底产品图为起点，集中维护产品资料与生成历史。', `<button class="button button--primary" data-action="open-import">${svgIcon('upload')}导入产品</button>`)}
    <div class="library-summary"><div><strong>${state.products.length}</strong><span>产品 SKU</span></div><div><strong>${state.savedAssets.length}</strong><span>历史素材</span></div><p>${svgIcon('info')}点击任意产品行，在右侧查看产品规格和已生成素材。</p></div>
    <div class="toolbar"><label class="search-wrap">${svgIcon('search')}<input class="input-control" id="product-search" type="search" placeholder="搜索产品名称、SKU 或品类" value="${escapeHtml(state.ui.productSearch)}" aria-label="搜索产品"></label><select class="select-control" id="category-filter" aria-label="按品类筛选">${categories.map((item) => `<option ${item === state.ui.productCategory ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
    <div class="product-table"><div class="table-row table-row--head"><span>SKU</span><span>底图</span><span>产品名称</span><span>品类</span><span>历史素材</span><span>设计批次</span><span>状态</span><span>更新时间</span><span></span></div>${filtered.length ? filtered.map((product) => `<div class="table-row table-row--interactive" role="button" tabindex="0" data-action="open-product-drawer" data-id="${product.id}" aria-label="查看${escapeHtml(product.name)}详情"><span class="table-sku">${escapeHtml(product.sku)}</span><span class="base-thumb"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}白底产品图"></span><span><strong>${escapeHtml(product.name)}</strong><small>真实产品底图已归档</small></span><span>${escapeHtml(product.category)}</span><span>${productAssets(product.id).length} 张</span><span>${product.versions} 个</span>${statusChip(product.status)}<span>${escapeHtml(product.updated)}</span><button class="button row-action" data-action="open-product-drawer" data-id="${product.id}" aria-label="打开${escapeHtml(product.name)}详情">${svgIcon('chevron')}</button></div>`).join('') : '<div class="empty-state">没有符合筛选条件的产品</div>'}</div>
  </section>`;
}

function renderSelectedProducts() {
  const products = selectedProducts();
  return `<div class="selected-products" aria-label="已选择产品">${products.map((product, index) => `<article class="selected-product-card"><button class="selected-product-main" data-action="open-product-drawer" data-id="${product.id}"><span class="product-order">${index + 1}</span><img src="${escapeHtml(product.image)}" alt=""><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></span></button><button class="icon-button remove-product" data-action="remove-selected-product" data-id="${product.id}" aria-label="移除${escapeHtml(product.name)}">${svgIcon('x')}</button></article>`).join('')}<button class="add-product-card" data-action="open-product-picker">${svgIcon('plus')}<span>添加产品</span></button></div>`;
}

function renderPromptGroups() {
  if (!state.promptGroups.length) return '<div class="empty-inline">还没有提示词组。添加地点、颜色或场景后，系统会自动计算组合数量。</div>';
  return `<div class="prompt-group-list">${state.promptGroups.map((group) => {
    const options = selectedOptions(group);
    return `<article class="prompt-group-row ${group.enabled ? '' : 'is-disabled'}"><div class="prompt-group-name"><span>${svgIcon('layers')}</span><div><strong>${escapeHtml(group.name)}</strong><small>${options.length ? `${groupFactor(group)} 个组合值` : '未选择选项'}</small></div></div><div class="prompt-chip-list">${options.length ? options.map((option) => `<span class="prompt-chip">${escapeHtml(option.label)} <b>×${option.quantity}</b></span>`).join('') : '<span class="muted-copy">点击编辑选择词条</span>'}</div><div class="prompt-row-actions"><button class="toggle-control" data-action="toggle-prompt-group" data-id="${group.id}" aria-pressed="${group.enabled}"><span></span>${group.enabled ? '启用' : '停用'}</button><button class="button button--quiet" data-action="edit-prompt-group" data-id="${group.id}">${svgIcon('edit')}编辑</button><button class="icon-button button--quiet" data-action="delete-prompt-group" data-id="${group.id}" aria-label="删除${escapeHtml(group.name)}">${svgIcon('trash')}</button></div></article>`;
  }).join('')}</div>`;
}

function variantLabel(index) { const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; return index < 26 ? alphabet[index] : `${alphabet[index % 26]}${Math.floor(index / 26) + 1}`; }

function renderResultGroups() {
  if (!state.batch.results.length) return `<div class="result-empty"><span>${svgIcon('image')}</span><strong>生成结果会按 SKU 分组</strong><p>确认任务后，这里会先出现对应数量的加载卡片。</p></div>`;
  return selectedProducts().map((product) => {
    const items = state.batch.results.filter((item) => item.productId === product.id);
    const completed = items.filter((item) => item.status === 'ready').length;
    const failed = items.filter((item) => item.status === 'failed').length;
    return `<section class="result-product-group"><header><div><img src="${escapeHtml(product.image)}" alt=""><span><strong>${escapeHtml(product.sku)}</strong><small>${completed}/${items.length} 已完成${failed ? ` · ${failed} 张需重试` : ''}</small></span></div></header><div class="result-grid">${items.map((item, index) => {
      const label = variantLabel(index);
      if (item.status === 'delayed') return `<article class="result-card is-delayed"><div class="result-error"><strong>${label} 等待时间较长</strong><p>${escapeHtml(item.error || '原任务已保留，可继续查询且不会重复扣分。')}</p><button data-action="check-result" data-id="${item.id}">${svgIcon('refresh')}查询结果</button></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      if (item.status === 'failed') return `<article class="result-card is-failed"><div class="result-error"><strong>${label} 生成失败</strong><p>${escapeHtml(item.error || '模型暂时无法完成这张图片。')}</p><button data-action="regenerate-result" data-id="${item.id}">${svgIcon('refresh')}重试</button></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      if (item.status !== 'ready') return `<article class="result-card is-loading"><div class="result-skeleton"><span>${label}</span><small>${item.status === 'queued' ? '正在提交' : item.remoteStatus === 'PENDING' ? '模型排队中' : `生成中 · ${elapsedMinutes(item.submittedAt)} 分钟`}</small></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      return `<article class="result-card"><button class="image-preview-button result-preview-trigger" data-action="preview-result" data-id="${item.id}" aria-label="查看${escapeHtml(product.name)}创意素材 ${label} 大图"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(product.name)}创意素材 ${label}"></button><span class="result-code">${label}</span><div class="result-actions"><button data-action="download-result" data-id="${item.id}" aria-label="下载素材 ${label}">${svgIcon('download')}</button><button data-action="regenerate-result" data-id="${item.id}" aria-label="重新生成素材 ${label}">${svgIcon('refresh')}</button><button data-action="delete-result" data-id="${item.id}" aria-label="删除素材 ${label}">${svgIcon('trash')}</button></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
    }).join('')}</div></section>`;
  }).join('');
}

function renderStudio() {
  const total = plannedTotal();
  const progress = batchProgress();
  const batchActive = state.batch.results.length > 0;
  const batchRunning = state.batch.status === 'generating';
  const durationValue = batchActive ? `${elapsedMinutes(state.batch.startedAtMs, state.batch.finishedAtMs)} 分钟` : `${Math.max(1, Math.ceil(total / 12))} 分钟`;
  return `<section class="page page--batch"><div class="batch-layout"><div class="batch-main">
    <div class="batch-title"><div><h2>批量创作配方</h2><p>选择多张产品参考图与提示词组合，确认后按 SKU 批量生产素材。</p></div><span class="draft-badge">自动保存</span></div>
    <section class="workflow-section"><div class="workflow-heading"><span class="step-badge">1</span><div><h3>选择参考产品图</h3><p>可同时选择多个 SKU 的图片参与创作，生成过程不锁定产品规格。</p></div></div>${renderSelectedProducts()}</section>
    <section class="workflow-section"><div class="workflow-heading"><span class="step-badge">2</span><div><h3>选择提示词组合</h3><p>只展示已选摘要，详细词条在编辑窗口中维护。</p></div></div>${renderPromptGroups()}<button class="add-group-button" data-action="open-prompt-library">${svgIcon('plus')}添加提示词组</button></section>
    <section class="workflow-section"><div class="workflow-heading"><span class="step-badge">3</span><div><h3>通用提示词</h3><p>对本批次所有参考图与组合生效。</p></div></div><textarea id="universal-prompt" maxlength="800">${escapeHtml(state.studio.universalPrompt)}</textarea></section>
    <div class="formula-bar"><div><span>本次生成计划</span><strong>${escapeHtml(formulaText())}</strong></div><button class="button button--primary formula-action" data-action="review-batch" ${!total || total > MAX_BATCH_SIZE ? 'disabled' : ''}>${svgIcon('sparkles')}确认并生成</button></div>${total > MAX_BATCH_SIZE ? `<p class="inline-error">单批最多 ${MAX_BATCH_SIZE} 张，请减少产品或提示词组合。</p>` : ''}
  </div><aside class="run-panel" aria-label="生成计划与结果">
    <div class="run-panel-head"><div><h3>生成计划</h3><p>${batchActive ? `批次 ${escapeHtml(state.batch.id)}` : 'Qwen Image 3.0 Pro · 首次使用输入密钥'}</p></div>${batchActive ? statusChip(batchStatusLabel()) : ''}</div>
    <div class="estimate-grid"><div>${svgIcon('database')}<span><small>预计消耗</small><strong>${batchActive ? state.batch.results.length * CREDIT_PER_IMAGE : batchCost()} 积分</strong></span></div><div>${svgIcon('clock')}<span><small>${batchActive ? (batchRunning ? '已耗时' : '生成用时') : '预计耗时'}</small><strong>${durationValue}</strong></span></div></div>
    <div class="progress-block"><div class="progress-copy"><span>生成进度</span><strong>${batchActive ? `${batchSettledCount()} / ${state.batch.results.length}` : '尚未开始'}</strong></div><div class="progress-track"><span style="width:${progress}%"></span></div><ol class="progress-steps"><li class="${batchActive ? 'is-active' : ''}"><b>1</b>创建任务</li><li class="${progress > 0 ? 'is-active' : ''}"><b>2</b>生成素材</li><li class="${state.batch.status === 'ready' || state.batch.status === 'saved' ? 'is-active' : ''}"><b>3</b>确认保存</li></ol></div>
    <div class="result-scroll" aria-live="polite">${renderResultGroups()}</div>${batchActive ? `<div class="run-footer"><button class="button button--primary" data-action="save-batch" ${batchReadyCount() ? '' : 'disabled'}>${svgIcon('folder')}${state.batch.status === 'saved' ? '已保存到产品库' : `保存 ${batchReadyCount()} 张素材`}</button><p>千问结果链接仅保留 24 小时，请生成后及时下载；保存会保留 SKU 与提示词记录。</p></div>` : ''}
  </aside></div></section>`;
}

function renderHome() {
  return `<section class="page">${pageHeading('让每一张素材都有明确的产品归属', '从真实底图开始，组合词库、批量生成并把结果自动归档回 SKU。')}<div class="quick-start"><button class="quick-card" data-route="products"><span class="source-icon">${svgIcon('box')}</span><span><strong>进入产品库</strong><span>查看真实底图与产品素材历史</span></span></button><button class="quick-card" data-route="studio"><span class="source-icon">${svgIcon('layers')}</span><span><strong>建立批量配方</strong><span>选择多个产品和提示词组合</span></span></button><button class="quick-card" data-route="assets"><span class="source-icon">${svgIcon('image')}</span><span><strong>查看全部素材</strong><span>按 SKU 与标签管理二维图片</span></span></button></div><div class="home-grid"><article class="surface surface-pad"><div class="section-title"><div><h3>最近批次</h3><p>继续处理未保存的素材任务</p></div><button class="text-button" data-route="studio">进入创作</button></div><div class="recent-list">${state.projects.map((project) => `<div class="recent-row"><img src="${project.image}" alt="${escapeHtml(project.name)}"><div><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.type)}</span></div><span>${escapeHtml(project.updated)}</span></div>`).join('')}</div></article><article class="surface surface-pad"><div class="section-title"><div><h3>产品资产概况</h3><p>所有图片按 SKU 与标签归档</p></div></div><div class="metric-list"><div><span>产品 SKU</span><strong>${state.products.length}</strong></div><div><span>二维图片素材</span><strong>${state.savedAssets.length}</strong></div><div><span>可用积分</span><strong>${state.credits}</strong></div></div></article></div></section>`;
}

function renderTemplates() {
  return `<section class="page">${pageHeading('模板中心', '模板保存提示词结构和生产规则，不改变产品真实底图。')}<div class="card-grid">${state.templates.map((template) => `<article class="template-card"><img src="${template.image}" alt="${escapeHtml(template.name)}示例"><div class="card-body"><h3>${escapeHtml(template.name)}</h3><p>${escapeHtml(template.description)}</p><div class="card-meta"><span class="tag">${escapeHtml(template.tag)} · ${template.fields} 项规则</span><button class="button button--quiet" data-action="use-template" data-id="${template.id}">使用模板</button></div></div></article>`).join('')}</div></section>`;
}

function renderAssets() {
  const assets = state.savedAssets;
  return `<section class="page">${pageHeading('素材库', '所有文件以二维图片形式保存，并保留 SKU、组合标签与批次信息。')}<div class="asset-library-grid">${assets.length ? assets.map((asset) => { const product = productById(asset.productId); return `<article class="asset-card"><button class="image-preview-button" data-action="preview-asset" data-id="${asset.id}" aria-label="查看${escapeHtml(product?.name || '产品')}生成素材大图"><img src="${escapeHtml(asset.image)}" alt="${escapeHtml(product?.name || '产品')}生成素材"></button><div class="card-body"><h3>${escapeHtml(product?.sku || '未关联 SKU')}</h3><p>${asset.tags.map(escapeHtml).join(' · ')}</p><div class="card-meta"><span class="tag">${escapeHtml(asset.batchId)}</span><button class="button button--quiet" data-action="download-asset" data-image="${escapeHtml(asset.image)}" data-name="${escapeHtml(product?.sku || '设计素材')}">${svgIcon('download')}下载</button></div></div></article>`; }).join('') : '<div class="empty-state">还没有已保存素材，请先完成一个批量任务。</div>'}</div></section>`;
}

function renderExports() {
  return `<section class="page">${pageHeading('导出中心', '按 SKU 或批次下载已确认的二维图片素材。')}<div class="export-grid"><article class="export-card">${svgIcon('folder')}<h3>按 SKU 导出</h3><p>将同一产品的全部素材打包下载。</p><button class="button button--quiet" data-route="products">选择产品</button></article><article class="export-card">${svgIcon('layers')}<h3>按批次导出</h3><p>保留提示词组合标签和任务编号。</p><button class="button button--quiet" data-route="assets">查看素材</button></article><article class="export-card">${svgIcon('download')}<h3>平台规格</h3><p>PNG、JPG、WebP 与常用电商画幅。</p><button class="button button--quiet" data-route="templates">选择预设</button></article></div></section>`;
}

function renderConnections() {
  const hasKey = Boolean(getQwenApiKey());
  const status = state.connection.authenticated ? '密钥已验证 · 本标签页可用' : hasKey ? '已输入 · 等待验证' : '首次生成时输入密钥';
  return `<section class="page">${pageHeading('模型连接', '无需配置 Cloudflare Access 或云端 Secret；首次使用时输入自己的千问密钥。')}<div class="connection-grid"><article class="connection-card connection-card--primary"><div class="connection-head"><span class="model-avatar model-avatar--qwen">Q</span><div><h3>千问图像 3.0 Pro</h3><p>${escapeHtml(status)}</p></div></div><div class="connection-trust">${svgIcon('check')}仅保存于当前浏览器标签页 · 关闭后自动清除</div><div class="capability-list"><span class="tag">真实产品图参考</span><span class="tag">图生图</span><span class="tag">批量任务</span><span class="tag">最高 2K</span></div><button class="button ${hasKey ? 'button--secondary' : 'button--primary'}" data-action="authorize-qwen">${hasKey ? '更换或检查密钥' : '输入千问密钥'}</button>${hasKey ? '<button class="button button--quiet connection-clear" data-action="clear-qwen-key">清除本标签页密钥</button>' : ''}<p class="connection-note">图片按量计费；结果地址 24 小时有效，请及时下载。</p></article><article class="connection-card"><div class="connection-head"><span class="model-avatar">临时</span><div><h3>密钥保存方式</h3><p>不写入项目与云端配置</p></div></div><div class="capability-list"><span class="tag">不进 GitHub</span><span class="tag">不存 Cloudflare Secret</span></div><p class="connection-copy">密钥只存在当前标签页的临时会话中，请求时经 HTTPS 交给无状态 Worker 转发到阿里千问。</p></article><article class="connection-card"><div class="connection-head"><span class="model-avatar">24h</span><div><h3>结果保存提醒</h3><p>阿里临时图片地址限制</p></div></div><div class="capability-list"><span class="tag">逐张下载</span><span class="tag">SKU 归档</span></div><p class="connection-copy">生成完成后请先下载原图。后续接入对象存储后可升级为长期云端归档。</p></article></div></section>`;
}

function renderProductDrawer() {
  const product = productById(state.ui.drawerProductId);
  if (!product) return '';
  const assets = productAssets(product.id);
  const filterOptions = ['全部', ...new Set(assets.flatMap((asset) => asset.tags))];
  const filtered = state.ui.assetFilter === '全部' ? assets : assets.filter((asset) => asset.tags.includes(state.ui.assetFilter));
  const info = `<div class="drawer-info"><div class="base-image-stage"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}真实白底图"><span>${svgIcon('check')}真实产品底图</span></div><dl class="spec-list"><div><dt>SKU</dt><dd>${escapeHtml(product.sku)}</dd></div><div><dt>产品品类</dt><dd>${escapeHtml(product.category)}</dd></div><div><dt>尺寸</dt><dd>${escapeHtml(product.specs.size)}</dd></div><div><dt>面料</dt><dd>${escapeHtml(product.specs.material)}</dd></div><div><dt>颜色</dt><dd>${escapeHtml(product.specs.color)}</dd></div><div><dt>适用范围</dt><dd>${escapeHtml(product.specs.audience)}</dd></div><div><dt>透气结构</dt><dd>${escapeHtml(product.specs.windows)}</dd></div></dl></div>`;
  const history = `<div class="drawer-assets"><div class="drawer-dashboard"><div><strong>${assets.length}</strong><span>历史素材</span></div><div><strong>${new Set(assets.map((asset) => asset.batchId)).size}</strong><span>生成批次</span></div><div><strong>${product.updated}</strong><span>最近更新</span></div></div><div class="drawer-filter"><label>${svgIcon('filter')}<select id="asset-filter" aria-label="筛选素材标签">${filterOptions.map((item) => `<option ${item === state.ui.assetFilter ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></label><span>${filtered.length} 张结果</span></div><div class="drawer-asset-grid">${filtered.length ? filtered.map((asset) => `<article><button class="image-preview-button" data-action="preview-asset" data-id="${asset.id}" aria-label="查看${escapeHtml(product.name)}素材大图"><img src="${escapeHtml(asset.image)}" alt="${escapeHtml(product.name)}素材"></button><strong>${asset.tags.map(escapeHtml).join(' · ')}</strong><span>${escapeHtml(asset.batchId)} · ${escapeHtml(asset.createdAt)}</span></article>`).join('') : '<div class="empty-inline">当前筛选条件下没有素材。</div>'}</div></div>`;
  return `<div class="drawer-backdrop" data-action="close-overlay"><aside class="product-drawer overlay-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><header class="drawer-header"><div><span>${escapeHtml(product.sku)}</span><h2 id="drawer-title">${escapeHtml(product.name)}</h2></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭产品详情">${svgIcon('x')}</button></header><div class="drawer-tabs" role="tablist" aria-label="产品详情"><button role="tab" aria-selected="${state.ui.drawerTab === 'info'}" data-action="set-drawer-tab" data-tab="info">产品信息</button><button role="tab" aria-selected="${state.ui.drawerTab === 'assets'}" data-action="set-drawer-tab" data-tab="assets">已生成素材 <span>${assets.length}</span></button></div><div class="drawer-body">${state.ui.drawerTab === 'info' ? info : history}</div><footer class="drawer-footer"><button class="button button--secondary" data-action="set-drawer-tab" data-tab="assets">查看历史素材</button><button class="button button--primary" data-action="drawer-generate" data-id="${product.id}">${svgIcon('sparkles')}用此产品生成素材</button></footer></aside></div>`;
}

function renderProductPicker() {
  if (!state.ui.productPickerOpen) return '';
  const selected = new Set(state.studio.selectedProductIds);
  return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel product-picker" role="dialog" aria-modal="true" aria-labelledby="product-picker-title"><div class="modal-header"><div><h2 id="product-picker-title">选择批量产品</h2><p>可同时选择多个 SKU；每个产品使用自己的真实底图。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭产品选择">${svgIcon('x')}</button></div><div class="picker-grid">${state.products.map((product) => `<button class="picker-product ${selected.has(product.id) ? 'is-selected' : ''}" data-action="toggle-picker-product" data-id="${product.id}" aria-pressed="${selected.has(product.id)}"><span class="picker-check">${selected.has(product.id) ? svgIcon('check') : ''}</span><img src="${escapeHtml(product.image)}" alt=""><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></span></button>`).join('')}</div><div class="modal-actions"><span class="selection-count">已选择 ${selected.size} 个产品</span><button class="button button--primary" data-action="finish-product-picker" ${selected.size ? '' : 'disabled'}>完成选择</button></div></section></div>`;
}

function renderPromptDialog() {
  const dialogId = state.ui.promptDialogGroupId;
  if (!dialogId) return '';
  if (dialogId === 'library') {
    return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-library" role="dialog" aria-modal="true" aria-labelledby="prompt-library-title"><div class="modal-header"><div><h2 id="prompt-library-title">添加提示词组</h2><p>选择一个词组加入当前配方，之后可继续编辑词条。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭词组库">${svgIcon('x')}</button></div><div class="library-group-list">${state.promptLibrary.map((group) => `<button data-action="add-library-group" data-id="${group.id}" ${state.promptGroups.some((item) => item.id === group.id) ? 'disabled' : ''}><span>${svgIcon('layers')}</span><span><strong>${escapeHtml(group.name)}</strong><small>${group.options.map(escapeHtml).join('、')}</small></span>${state.promptGroups.some((item) => item.id === group.id) ? '<em>已添加</em>' : svgIcon('chevron')}</button>`).join('')}</div><div class="custom-group-form"><label for="custom-group-name">自定义词组名称</label><div><input id="custom-group-name" class="input-control" placeholder="例如：节日主题"><button class="button button--secondary" data-action="create-custom-group">创建词组</button></div></div></section></div>`;
  }
  const group = state.promptGroups.find((item) => item.id === dialogId);
  if (!group) return '';
  return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-editor" role="dialog" aria-modal="true" aria-labelledby="prompt-editor-title"><div class="modal-header"><div><h2 id="prompt-editor-title">编辑“${escapeHtml(group.name)}”</h2><p>勾选词条并设置数量；数量会参与最终组合计算。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭词组编辑">${svgIcon('x')}</button></div><div class="option-editor-list">${group.options.map((option) => `<div class="option-editor ${option.selected ? 'is-selected' : ''}"><button class="option-toggle" data-action="toggle-prompt-option" data-group-id="${group.id}" data-id="${option.id}" aria-pressed="${option.selected}"><span>${option.selected ? svgIcon('check') : ''}</span><strong>${escapeHtml(option.label)}</strong></button><div class="quantity-control" aria-label="${escapeHtml(option.label)}数量"><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="-1" aria-label="减少${escapeHtml(option.label)}数量">−</button><span>×${option.quantity}</span><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="1" aria-label="增加${escapeHtml(option.label)}数量">＋</button></div></div>`).join('')}</div><div class="new-option-form"><label for="new-option-label">新增词条</label><div><input id="new-option-label" class="input-control" placeholder="输入新的提示词选项"><button class="button button--secondary" data-action="add-prompt-option" data-group-id="${group.id}">添加</button></div></div><div class="modal-actions"><span class="selection-count">当前 ${groupFactor(group)} 个组合值</span><button class="button button--primary" data-action="finish-prompt-editor">完成</button></div></section></div>`;
}

function renderConfirmDialog() {
  if (!state.ui.confirmBatch) return '';
  const total = plannedTotal();
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div class="confirm-icon">${svgIcon('sparkles')}</div><h2 id="confirm-title">确认调用千问生成 ${total} 张素材？</h2><p>系统会以每个 SKU 的产品图为参考，按提示词组合创建真实付费任务；首次使用会先提示输入密钥。</p><div class="confirm-summary"><div><span>模型</span><strong>Qwen Image 3.0 Pro</strong></div><div><span>产品</span><strong>${selectedProducts().map((product) => product.sku).join('、')}</strong></div><div><span>组合公式</span><strong>${escapeHtml(formulaText())}</strong></div><div><span>平台积分</span><strong>${batchCost()} 积分</strong></div><div><span>阿里计费</span><strong>按实际成功图片数量结算</strong></div><div><span>预计耗时</span><strong>约 ${Math.max(2, Math.ceil(total / 4))} 分钟</strong></div></div><div class="modal-actions"><button class="button button--secondary" data-action="close-overlay">返回修改</button><button class="button button--primary" data-action="confirm-batch">${svgIcon('sparkles')}开始生成</button></div></section></div>`;
}

function renderQwenKeyDialog() {
  if (!keyDialogOpen) return '';
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel key-dialog" role="dialog" aria-modal="true" aria-labelledby="key-dialog-title" aria-describedby="key-dialog-help"><div class="modal-header"><div><h2 id="key-dialog-title">输入千问 API Key</h2><p id="key-dialog-help">支持 sk- 和 sk-ws- 格式，仅用于当前浏览器标签页。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭密钥输入窗口">${svgIcon('x')}</button></div><label class="key-field" for="qwen-api-key"><span>API Key</span><input id="qwen-api-key" class="input-control" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="粘贴完整的 sk- 或 sk-ws- 密钥" value="${escapeHtml(getQwenApiKey())}"></label>${keyDialogError ? `<p class="field-error" role="alert">${escapeHtml(keyDialogError)}</p>` : ''}<div class="key-privacy">${svgIcon('check')}不会写入 GitHub、Cloudflare Secret 或应用长期状态；关闭标签页后自动清除。</div><div class="modal-actions"><button class="button button--secondary" data-action="close-overlay">取消</button><button class="button button--primary" data-action="save-qwen-key">验证并使用</button></div></section></div>`;
}

function renderImagePreview() {
  if (!imagePreview) return '';
  return `<div class="image-preview-backdrop" data-action="close-image-preview"><section class="image-preview-panel overlay-panel" role="dialog" aria-modal="true" aria-labelledby="image-preview-title"><header><div><h2 id="image-preview-title">${escapeHtml(imagePreview.title)}</h2><p>${escapeHtml(imagePreview.meta)}</p></div><div class="image-preview-actions"><button class="button button--secondary" data-action="download-preview">${svgIcon('download')}下载原图</button><button class="icon-button overlay-close" data-action="close-image-preview" aria-label="关闭大图预览">${svgIcon('x')}</button></div></header><div class="image-preview-stage"><img src="${escapeHtml(imagePreview.image)}" alt="${escapeHtml(imagePreview.title)}大图"></div><p class="image-preview-hint">点击遮罩空白处或按 Esc 关闭</p></section></div>`;
}

function renderOverlays() {
  const root = $('#overlay-root');
  root.innerHTML = renderImagePreview() || renderQwenKeyDialog() || renderProductDrawer() || renderProductPicker() || renderPromptDialog() || renderConfirmDialog();
  document.body.classList.toggle('overlay-open', Boolean(root.innerHTML) || !$('#import-modal').hidden);
  hydrateIcons(root);
}

function render() {
  renderTopbar();
  const views = { home: renderHome, studio: renderStudio, products: renderProducts, templates: renderTemplates, assets: renderAssets, exports: renderExports, connections: renderConnections };
  $('#app-view').innerHTML = (views[state.ui.route] || renderHome)();
  hydrateIcons($('#app-view'));
  renderOverlays();
}

function rememberFocus() { lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null; }
function focusOverlay() { requestAnimationFrame(() => $('.overlay-panel .overlay-close, .overlay-panel button, .overlay-panel input')?.focus()); }
function closeOverlay() {
  imagePreview = null;
  keyDialogOpen = false;
  keyDialogError = '';
  pendingKeyAction = '';
  state.ui.drawerProductId = '';
  state.ui.productPickerOpen = false;
  state.ui.promptDialogGroupId = '';
  state.ui.confirmBatch = false;
  render();
  requestAnimationFrame(() => lastFocusedElement?.focus());
}

function closeImagePreview() {
  imagePreview = null;
  render();
  focusOverlay();
}

function previewResult(id) {
  const result = state.batch.results.find((item) => item.id === id && item.status === 'ready' && item.image);
  if (!result) return;
  const product = productById(result.productId);
  const productResults = state.batch.results.filter((item) => item.productId === result.productId);
  const label = variantLabel(Math.max(0, productResults.indexOf(result)));
  rememberFocus();
  imagePreview = { image: result.image, title: `${product?.name || '生成素材'} · 方案 ${label}`, meta: `${product?.sku || '未关联 SKU'} · ${result.tags.join(' · ')}`, downloadName: `${product?.sku || 'Qwen'}-${state.batch.id}-${label}` };
  render(); focusOverlay();
}

function previewAsset(id) {
  const asset = state.savedAssets.find((item) => item.id === id);
  if (!asset?.image) return;
  const product = productById(asset.productId);
  rememberFocus();
  imagePreview = { image: asset.image, title: product?.name || '已生成素材', meta: `${product?.sku || '未关联 SKU'} · ${asset.tags.join(' · ')} · ${asset.batchId}`, downloadName: `${product?.sku || '设计素材'}-${asset.batchId}` };
  render(); focusOverlay();
}

function openProductDrawer(id) {
  rememberFocus();
  state.ui.drawerProductId = id;
  state.ui.drawerTab = 'info';
  state.ui.assetFilter = '全部';
  render();
  focusOverlay();
}

function openImport() {
  $('#import-modal').hidden = false;
  document.body.classList.add('overlay-open');
  hydrateIcons($('#import-modal'));
  requestAnimationFrame(() => $('#import-form input[name="name"]')?.focus());
}

function closeImport() {
  $('#import-modal').hidden = true;
  document.body.classList.remove('overlay-open');
  uploadImageData = '';
  $('#import-form')?.reset();
  const preview = $('#upload-preview');
  if (preview) { preview.hidden = true; preview.removeAttribute('src'); }
}

function buildCombinations() {
  let combinations = [{ tags: [] }];
  enabledGroups().forEach((group) => {
    const expanded = selectedOptions(group).flatMap((option) => Array.from({ length: option.quantity }, () => option.label));
    combinations = combinations.flatMap((combo) => expanded.map((label) => ({ tags: [...combo.tags, `${group.name}：${label}`] })));
  });
  return combinations;
}

function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

async function apiJson(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (path.startsWith('/api/qwen/')) {
    const apiKey = getQwenApiKey();
    if (!apiKey) {
      const error = new Error('请先输入千问 API Key。');
      error.code = 'KEY_REQUIRED';
      throw error;
    }
    headers.set('X-Qwen-Api-Key', apiKey);
  }
  let response;
  try {
    response = await fetch(path, { cache: 'no-store', ...options, headers });
  } catch {
    const error = new Error('网络连接失败，请检查网络后重试。');
    error.code = 'NETWORK_ERROR';
    throw error;
  }
  const contentType = response.headers.get('content-type') || '';
  if (response.redirected || !contentType.includes('application/json')) {
    const error = new Error('生成服务返回了无法识别的内容，请刷新页面后重试。');
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || '请求失败，请稍后重试。');
    error.code = data?.error?.code || `HTTP_${response.status}`;
    throw error;
  }
  return data;
}

async function checkQwenAuthorization(showFailure = true) {
  if (!getQwenApiKey()) return false;
  try {
    const session = await apiJson('/api/qwen/validate', { method: 'POST' });
    state.connection.authenticated = Boolean(session.valid);
    saveState(); render();
    return state.connection.authenticated;
  } catch (error) {
    state.connection.authenticated = false;
    if (error.code === 'KEY_REQUIRED' || error.code === 'KEY_INVALID') clearQwenApiKey();
    saveState(); render();
    if (showFailure) showToast('密钥验证失败', error.message, 'info');
    return false;
  }
}

function openQwenKeyDialog(action = '') {
  rememberFocus();
  pendingKeyAction = action;
  keyDialogError = '';
  keyDialogOpen = true;
  render();
  requestAnimationFrame(() => $('#qwen-api-key')?.focus());
}

function generationPrompt(product, tags) {
  const combination = tags.map((tag) => tag.replace('：', '为')).join('；');
  return [
    '请基于输入参考图生成一张高端、写实的儿童帐篷商业产品摄影。',
    `参考产品为“${product.name}”（SKU ${product.sku}），帐篷是画面唯一核心产品。`,
    '严格保留参考图中帐篷的真实结构、轮廓、开口、支架、缝线和比例，不改变产品类型，不凭空增加门窗或配件。',
    combination ? `本张创作组合：${combination}。` : '',
    state.studio.universalPrompt,
    '画面须自然可信、空间尺度合理、材质纹理清晰，适合国际儿童用品电商与品牌手册。',
  ].filter(Boolean).join('\n');
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('无法读取参考产品图，请重新上传后再试。'));
    reader.readAsDataURL(blob);
  });
}

async function referenceImageForQwen(product) {
  if (product.image.startsWith('data:image/')) return product.image;
  if (referenceImageCache.has(product.image)) return referenceImageCache.get(product.image);

  const imageDataPromise = (async () => {
    let response;
    try {
      response = await fetch(new URL(product.image, location.origin), { cache: 'force-cache' });
    } catch {
      throw new Error('无法读取参考产品图，请检查网络后重试。');
    }
    if (!response.ok) throw new Error('参考产品图加载失败，请刷新页面或重新上传底图。');

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('参考产品图格式无效，请重新上传图片。');
    if (blob.size > MAX_REFERENCE_IMAGE_BYTES) throw new Error('参考产品图超过 8MB，请压缩后重新上传。');
    return blobToDataUrl(blob);
  })();

  referenceImageCache.set(product.image, imageDataPromise);
  try {
    return await imageDataPromise;
  } catch (error) {
    referenceImageCache.delete(product.image);
    throw error;
  }
}

async function submitQwenResult(result) {
  const product = productById(result.productId);
  if (!product) throw new Error('找不到对应产品。');
  const referenceImage = await referenceImageForQwen(product);
  const task = await apiJson('/api/qwen/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: generationPrompt(product, result.tags), referenceImages: [referenceImage], ratio: state.studio.ratio }),
  });
  result.taskId = task.taskId;
  result.status = 'loading';
  result.submittedAt = Date.now();
  result.remoteStatus = task.taskStatus || 'PENDING';
  result.error = '';
}

async function runWithConcurrency(items, concurrency, operation) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      try {
        await operation(item);
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        if (error.code === 'KEY_REQUIRED' || error.code === 'KEY_INVALID') activeGenerationId = '';
      }
      saveState(); render();
      if (!activeGenerationId) return;
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

async function pollQwenBatch(batchId) {
  while (activeGenerationId === batchId) {
    const pending = state.batch.results.filter((item) => item.taskId && item.status === 'loading');
    if (!pending.length) break;
    await runWithConcurrency(pending, 4, async (item) => {
      const task = await apiJson(`/api/qwen/tasks/${encodeURIComponent(item.taskId)}`);
      item.submittedAt ||= Date.now();
      item.remoteStatus = task.taskStatus;
      if (task.taskStatus === 'SUCCEEDED') {
        if (task.imageUrls?.length) {
          item.image = task.imageUrls[0];
          item.status = 'ready';
          item.error = '';
        } else {
          item.status = 'failed';
          item.error = '千问任务已完成，但响应中没有图片，请重试。';
        }
      } else if (['FAILED', 'CANCELED', 'UNKNOWN'].includes(task.taskStatus)) {
        item.status = 'failed';
        item.error = task.error?.message || '模型未能完成这张图片，请重试。';
      } else if (Date.now() - item.submittedAt >= QWEN_TASK_TIMEOUT_MS) {
        item.status = 'delayed';
        item.error = '已等待 10 分钟，原任务仍被保留。点击“查询结果”继续查看，不会重复提交或扣分。';
      }
    });
    if (activeGenerationId !== batchId) break;
    if (state.batch.results.some((item) => item.status === 'loading')) await sleep(QWEN_POLL_INTERVAL);
  }
  if (state.batch.id !== batchId) return;
  activeGenerationId = '';
  state.batch.finishedAtMs = Date.now();
  state.batch.status = batchDelayedCount() ? 'delayed' : batchReadyCount() ? 'ready' : 'failed';
  saveState(); render();
  if (batchDelayedCount()) showToast('千问任务等待时间较长', `${batchDelayedCount()} 张保留了原任务，可点击“查询结果”，不会重复扣分。`, 'info');
  else if (batchReadyCount()) showToast('批量生成完成', `${batchReadyCount()} 张素材已生成${batchFailedCount() ? `，${batchFailedCount()} 张可重试` : ''}。请在 24 小时内下载。`, 'sparkles');
  else showToast('本批次未生成图片', '请查看失败原因并逐张重试。', 'info');
}

async function startBatchGeneration() {
  const total = plannedTotal();
  if (!total || total > MAX_BATCH_SIZE) return;
  const cost = batchCost();
  if (state.credits < cost) { closeOverlay(); showToast('积分不足', `本次需要 ${cost} 积分，请减少组合数量。`, 'database'); return; }
  if (!getQwenApiKey()) { openQwenKeyDialog('generate'); return; }
  const authorized = await checkQwenAuthorization(false);
  if (!authorized) { openQwenKeyDialog('generate'); keyDialogError = '密钥无效或已失效，请重新输入。'; render(); return; }
  clearInterval(generationTimer);
  const combinations = buildCombinations();
  const results = selectedProducts().flatMap((product, productIndex) => combinations.map((combo, comboIndex) => ({ id: uid(`result-${productIndex}-${comboIndex}`), productId: product.id, image: '', tags: combo.tags, status: 'queued', taskId: '', submittedAt: 0, remoteStatus: '', error: '', saved: false })));
  state.credits -= cost;
  state.batch = { id: `B-${String(Date.now()).slice(-6)}`, status: 'generating', results, plannedTotal: total, startedAt: nowLabel(), startedAtMs: Date.now(), finishedAtMs: 0, savedAt: '' };
  activeGenerationId = state.batch.id;
  state.ui.confirmBatch = false;
  saveState(); render();
  await runWithConcurrency(results, QWEN_SUBMIT_CONCURRENCY, submitQwenResult);
  if (activeGenerationId === state.batch.id) await pollQwenBatch(state.batch.id);
}

async function regenerateResult(id) {
  const item = state.batch.results.find((result) => result.id === id);
  if (!item || item.status === 'loading' || item.status === 'queued') return;
  if (state.credits < CREDIT_PER_IMAGE) { showToast('积分不足', '无法重新生成当前素材。', 'database'); return; }
  if (!getQwenApiKey()) { openQwenKeyDialog(`regenerate:${id}`); return; }
  const authorized = await checkQwenAuthorization(false);
  if (!authorized) { openQwenKeyDialog(`regenerate:${id}`); keyDialogError = '密钥无效或已失效，请重新输入。'; render(); return; }
  state.credits -= CREDIT_PER_IMAGE;
  item.status = 'queued'; item.taskId = ''; item.error = ''; item.saved = false;
  activeGenerationId = state.batch.id;
  saveState(); render();
  try {
    await submitQwenResult(item);
    await pollQwenBatch(state.batch.id);
    if (item.status === 'ready') showToast('单张素材已更新', '其他结果保持不变，请及时下载。', 'refresh');
  } catch (error) {
    activeGenerationId = '';
    item.status = 'failed'; item.error = error.message;
    saveState(); render(); showToast('重新生成失败', error.message, 'info');
  }
}

async function checkExistingResult(id) {
  const item = state.batch.results.find((result) => result.id === id);
  if (!item?.taskId || item.status === 'loading' || item.status === 'queued') return;
  if (!getQwenApiKey()) { openQwenKeyDialog(`check-result:${id}`); return; }
  const authorized = await checkQwenAuthorization(false);
  if (!authorized) { openQwenKeyDialog(`check-result:${id}`); keyDialogError = '密钥无效或已失效，请重新输入。'; render(); return; }
  item.status = 'loading';
  item.submittedAt = Date.now();
  state.batch.status = 'generating';
  state.batch.finishedAtMs = 0;
  activeGenerationId = state.batch.id;
  saveState(); render();
  await pollQwenBatch(state.batch.id);
}

async function resumePendingBatch() {
  if (state.batch.status !== 'generating') return;
  state.batch.startedAtMs ||= Date.now();
  const interrupted = state.batch.results.filter((item) => item.status === 'queued' && !item.taskId);
  interrupted.forEach((item) => { item.status = 'failed'; item.error = '页面在任务提交期间中断，请重新生成此图片。'; });
  const pending = state.batch.results.filter((item) => item.status === 'loading' && item.taskId);
  if (!pending.length) {
    state.batch.finishedAtMs ||= Date.now();
    state.batch.status = batchReadyCount() ? 'ready' : 'failed';
    saveState(); render();
    return;
  }
  if (!getQwenApiKey()) { openQwenKeyDialog('resume'); return; }
  const authorized = await checkQwenAuthorization(false);
  if (!authorized) { openQwenKeyDialog('resume'); keyDialogError = '请输入原任务使用的有效密钥以继续查询，不会创建新任务。'; render(); return; }
  activeGenerationId = state.batch.id;
  pending.forEach((item) => { item.submittedAt ||= Date.now(); });
  await pollQwenBatch(state.batch.id);
}

function saveBatch() {
  const unsaved = state.batch.results.filter((item) => item.status === 'ready' && !item.saved);
  if (!unsaved.length) { showToast('没有待保存素材', '当前批次已经保存或仍在生成。', 'info'); return; }
  unsaved.forEach((result) => { state.savedAssets.unshift({ id: uid('asset'), productId: result.productId, image: result.image, tags: result.tags.map((tag) => tag.split('：')[1] || tag), batchId: state.batch.id, createdAt: '刚刚' }); result.saved = true; });
  new Set(unsaved.map((item) => item.productId)).forEach((productId) => { const product = productById(productId); if (product) { product.references = productAssets(productId).length; product.versions += 1; product.status = '已有素材'; product.updated = '刚刚'; } });
  state.batch.status = 'saved'; state.batch.savedAt = nowLabel();
  state.projects.unshift({ id: uid('project'), name: `${selectedProducts().length} 个 SKU 批量素材`, type: '批量创作', image: state.batch.results.find((item) => item.status === 'ready')?.image || RESULT_IMAGES[0], updated: '刚刚' });
  saveState(); render(); showToast('素材已归档', `${unsaved.length} 张图片已回写到对应 SKU。`, 'folder');
}

function downloadImage(image, name = '设计图片') {
  const anchor = document.createElement('a');
  anchor.href = image; anchor.download = `${name.replace(/[\\/:*?"<>|]/g, '_')}.png`;
  document.body.append(anchor); anchor.click(); anchor.remove();
  showToast('已开始导出', `${name} 正在下载。`, 'download');
}

document.addEventListener('click', async (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { setRoute(routeButton.dataset.route); return; }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'close-overlay' && event.target !== button && button.classList.contains('drawer-backdrop')) return;
  if (action === 'close-image-preview' && event.target !== button && button.classList.contains('image-preview-backdrop')) return;
  if (action === 'open-import') openImport();
  if (action === 'close-modal') closeImport();
  if (action === 'open-product-drawer') openProductDrawer(button.dataset.id);
  if (action === 'close-overlay') closeOverlay();
  if (action === 'close-image-preview') closeImagePreview();
  if (action === 'preview-result') previewResult(button.dataset.id);
  if (action === 'preview-asset') previewAsset(button.dataset.id);
  if (action === 'download-preview' && imagePreview) downloadImage(imagePreview.image, imagePreview.downloadName);
  if (action === 'set-drawer-tab') { state.ui.drawerTab = button.dataset.tab; state.ui.assetFilter = '全部'; render(); }
  if (action === 'drawer-generate') {
    if (!state.studio.selectedProductIds.includes(button.dataset.id)) state.studio.selectedProductIds.push(button.dataset.id);
    closeOverlay(); setRoute('studio'); showToast('产品已加入批次', '可以继续选择产品或编辑提示词组合。', 'link');
  }
  if (action === 'open-product-picker') { rememberFocus(); state.ui.productPickerOpen = true; render(); focusOverlay(); }
  if (action === 'toggle-picker-product') {
    const id = button.dataset.id;
    state.studio.selectedProductIds = state.studio.selectedProductIds.includes(id) ? state.studio.selectedProductIds.filter((item) => item !== id) : [...state.studio.selectedProductIds, id];
    render();
  }
  if (action === 'finish-product-picker') { closeOverlay(); setRoute('studio'); }
  if (action === 'remove-selected-product') {
    state.studio.selectedProductIds = state.studio.selectedProductIds.filter((id) => id !== button.dataset.id);
    state.batch = { ...seedState.batch, plannedTotal: plannedTotal() };
    saveState(); render();
  }
  if (action === 'open-prompt-library') { rememberFocus(); state.ui.promptDialogGroupId = 'library'; render(); focusOverlay(); }
  if (action === 'edit-prompt-group') { rememberFocus(); state.ui.promptDialogGroupId = button.dataset.id; render(); focusOverlay(); }
  if (action === 'toggle-prompt-group') { const group = state.promptGroups.find((item) => item.id === button.dataset.id); if (group) group.enabled = !group.enabled; saveState(); render(); }
  if (action === 'delete-prompt-group') { state.promptGroups = state.promptGroups.filter((item) => item.id !== button.dataset.id); saveState(); render(); }
  if (action === 'add-library-group') {
    const source = state.promptLibrary.find((item) => item.id === button.dataset.id);
    if (source && !state.promptGroups.some((item) => item.id === source.id)) state.promptGroups.push({ id: source.id, name: source.name, enabled: true, options: source.options.map((label, index) => ({ id: `${source.id}-${index}`, label, selected: index < 2, quantity: 1 })) });
    state.ui.promptDialogGroupId = source?.id || '';
    saveState(); render(); focusOverlay();
  }
  if (action === 'create-custom-group') {
    const input = $('#custom-group-name'); const name = input?.value.trim();
    if (!name) { input?.focus(); return; }
    const id = uid('group-custom'); state.promptGroups.push({ id, name, enabled: true, options: [] }); state.ui.promptDialogGroupId = id;
    saveState(); render(); focusOverlay();
  }
  if (action === 'toggle-prompt-option') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const option = group?.options.find((item) => item.id === button.dataset.id);
    if (option) option.selected = !option.selected;
    saveState(); render(); focusOverlay();
  }
  if (action === 'change-option-quantity') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const option = group?.options.find((item) => item.id === button.dataset.id);
    if (option) option.quantity = Math.max(1, Math.min(9, option.quantity + Number(button.dataset.delta)));
    saveState(); render(); focusOverlay();
  }
  if (action === 'add-prompt-option') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const input = $('#new-option-label'); const label = input?.value.trim();
    if (group && label) { group.options.push({ id: uid('option'), label, selected: true, quantity: 1 }); saveState(); render(); focusOverlay(); } else input?.focus();
  }
  if (action === 'finish-prompt-editor') closeOverlay();
  if (action === 'review-batch') {
    if (!selectedProducts().length) { showToast('请先选择产品', '至少选择一个 SKU 才能开始生成。', 'box'); return; }
    rememberFocus(); state.ui.confirmBatch = true; render(); focusOverlay();
  }
  if (action === 'confirm-batch') await startBatchGeneration();
  if (action === 'regenerate-result') await regenerateResult(button.dataset.id);
  if (action === 'check-result') await checkExistingResult(button.dataset.id);
  if (action === 'delete-result') { state.batch.results = state.batch.results.filter((item) => item.id !== button.dataset.id); if (!state.batch.results.some((item) => item.status === 'loading')) state.batch.status = 'ready'; saveState(); render(); }
  if (action === 'save-batch') saveBatch();
  if (action === 'use-template') { state.studio.templateId = button.dataset.id; setRoute('studio'); showToast('模板已加载', '提示词结构和输出规格已准备好。', 'grid'); }
  if (action === 'download-asset') downloadImage(button.dataset.image, button.dataset.name);
  if (action === 'download-result') { const result = state.batch.results.find((item) => item.id === button.dataset.id); const product = result ? productById(result.productId) : null; if (result?.image) downloadImage(result.image, `${product?.sku || 'Qwen'}-${state.batch.id}`); }
  if (action === 'authorize-qwen') {
    openQwenKeyDialog('check');
  }
  if (action === 'clear-qwen-key') {
    clearQwenApiKey();
    saveState(); render();
    showToast('本标签页密钥已清除', '下次生成时会重新弹出输入窗口。', 'check');
  }
  if (action === 'save-qwen-key') {
    const input = $('#qwen-api-key');
    const apiKey = normalizeQwenApiKey(input?.value);
    if (!isQwenApiKey(apiKey)) {
      keyDialogError = '请输入完整的千问 API Key，支持 sk- 和 sk-ws- 开头的密钥。';
      render(); requestAnimationFrame(() => $('#qwen-api-key')?.focus()); return;
    }
    if (!setQwenApiKey(apiKey)) {
      keyDialogError = '浏览器禁止了标签页临时存储，请关闭隐私限制后重试。';
      render(); return;
    }
    button.disabled = true;
    button.textContent = '正在验证…';
    const nextAction = pendingKeyAction;
    if (!(await checkQwenAuthorization(false))) {
      keyDialogOpen = true;
      pendingKeyAction = nextAction;
      keyDialogError = '密钥验证失败，请检查密钥是否完整且仍然有效。';
      render(); requestAnimationFrame(() => $('#qwen-api-key')?.focus()); return;
    }
    keyDialogOpen = false;
    keyDialogError = '';
    pendingKeyAction = '';
    render();
    showToast('千问连接正常', `密钥已验证，当前模型为 ${state.connection.model}。`, 'check');
    if (nextAction === 'generate') await startBatchGeneration();
    if (nextAction.startsWith('regenerate:')) await regenerateResult(nextAction.slice('regenerate:'.length));
    if (nextAction.startsWith('check-result:')) await checkExistingResult(nextAction.slice('check-result:'.length));
    if (nextAction === 'resume') await resumePendingBatch();
  }
  if (action === 'shutdown-app') { button.disabled = true; showToast('正在退出', '产品、词组与生成状态已保存。', 'power'); try { await fetch('/api/shutdown', { method: 'POST' }); } catch { /* desktop host may close */ } }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'universal-prompt') { state.studio.universalPrompt = event.target.value; saveState(); }
  if (event.target.id === 'product-search') {
    state.ui.productSearch = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = $('#product-search'); input?.focus(); input?.setSelectionRange(position, position);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'category-filter') { state.ui.productCategory = event.target.value; render(); saveState(); }
  if (event.target.id === 'asset-filter') { state.ui.assetFilter = event.target.value; render(); }
  if (event.target.id === 'product-image') {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { uploadImageData = String(reader.result); const preview = $('#upload-preview'); preview.src = uploadImageData; preview.hidden = false; };
    reader.readAsDataURL(file);
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.table-row--interactive')) { event.preventDefault(); openProductDrawer(event.target.dataset.id); }
  if (event.key === 'Escape') { if (imagePreview) closeImagePreview(); else if (!$('#import-modal').hidden) closeImport(); else if ($('#overlay-root').innerHTML) closeOverlay(); }
  if (event.key === 'Tab' && $('.overlay-panel')) {
    const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]', $('.overlay-panel')).filter((item) => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

$('#import-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const product = { id: uid('product'), name: String(form.get('name')), sku: String(form.get('sku')), category: String(form.get('category')), status: String(form.get('status')), image: uploadImageData || BASE_IMAGES[state.products.length % BASE_IMAGES.length], specs: { size: '待补充', material: '待补充', color: '待补充', audience: '待补充', windows: '待补充' }, references: 0, versions: 0, updated: '刚刚' };
  state.products.unshift(product);
  closeImport(); setRoute('products'); showToast('产品已加入产品库', '请打开产品详情补充规格，或直接加入批量任务。', 'box');
});

$('#mobile-menu').addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  $('#mobile-menu').setAttribute('aria-expanded', String(open));
});

(async function init() {
  hydrateIcons(); loadLocalState();
  if (!getQwenApiKey()) state.connection.authenticated = false;
  const initialRoute = location.hash.slice(1);
  setRoute(routeMeta[initialRoute] ? initialRoute : (state.ui.route || 'products'), false, false);
  await loadState();
  const refreshedRoute = location.hash.slice(1);
  setRoute(routeMeta[refreshedRoute] ? refreshedRoute : (state.ui.route || 'products'), false, false);
  await resumePendingBatch();
})();
