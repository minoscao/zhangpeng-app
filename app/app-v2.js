const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const Core = globalThis.DesignFlowCore;
if (!Core) throw new Error('DesignFlowCore 未加载。');

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
const FOUR_K_DIMENSIONS = Object.freeze({ '1:1': [4096, 4096], '3:4': [3072, 4096], '4:3': [4096, 3072], '9:16': [2304, 4096], '16:9': [4096, 2304] });
const MAX_BATCH_SIZE = 24;
const QWEN_POLL_INTERVAL = 8000;
const QWEN_TASK_TIMEOUT_MS = 10 * 60 * 1000;
const QWEN_KEY_STORAGE = 'designflow-qwen-api-key';
const OPENAI_KEY_STORAGE = 'designflow-openai-api-key';
const MAX_REFERENCE_IMAGE_BYTES = 8 * 1024 * 1024;
const referenceImageCache = new Map();
const CURRENT_SCHEMA_VERSION = 12;
const PUBLIC_PROMPT_TEMPLATES = [
  { id: 'brief', name: '需求优先 · 商业场景', prompt: '优先满足本张产品结构、产品配色、当地背景和其他要求。输入参考图只定义帐篷产品，必须替换其原有白底、透明底、摄影棚或旧场景；不能用漂亮但无关的通用背景代替指定环境。要求的城市地标或地域建筑必须清楚可辨，不可用过度虚化隐藏。没有明确要求人物时不要自行添加人物，避免无意义地增加画面复杂度。' },
  { id: 'skyline', name: '城市天际线', prompt: '帐篷位于城市水岸公园或开阔露台，远景必须清楚呈现所选城市可识别的天际线与至少一个当地建筑线索。地域规则中的住宅或庭院是备选，不得替代本模板要求的城市天际线。地标尺度与视角可信，帐篷在前景完整可见。' },
  { id: 'cabin', name: '木屋自然庭院', prompt: '帐篷位于开阔自然庭院，后方必须有清楚可辨的真实小木屋、木质立面和自然植被。采用所选地区的住宅与景观风格，不要求城市地标；地域规则中的天际线是备选，不得替代本模板指定的小木屋。' },
  { id: 'family', name: '亲子生活摄影', prompt: '只安排一名与产品适用年龄一致的儿童在帐篷入口旁进行简单、静止、自然的阅读或整理靠垫动作；人物和帐篷位于同一地面与清晰焦平面，三分之四侧脸的眼睛、鼻子、嘴和脸部轮廓清楚自然。帐篷关键开口与支架完整可见，必须落实所选城市背景与产品面料配色。禁止多人拥挤、奔跑、挥手、遮脸或双手抓握复杂支架。' },
  { id: 'white', name: '白底电商精修', backgroundMode: 'none', prompt: '输出纯白背景真实产品摄影，帐篷完整居中且比例准确、面料纹理与接触阴影清晰。不出现人物、建筑、城市景观或道具；此模板不使用当地背景规则，只落实产品配色和产品细节。' },
];
const LEGACY_UNIVERSAL_PROMPT = '保持参考图中儿童帐篷的结构、比例、开口与支架准确，真实高端商业摄影，童趣但不幼稚，主体完整，画面干净，不添加文字、商标与水印。';
const DEFAULT_UNIVERSAL_PROMPT = '保持参考图中儿童帐篷的结构、比例、开口与支架准确。成片必须呈现精修过的真实商业摄影质感：自然可信、大气克制、光线高级、材质纹理清晰，童趣但不幼稚。主体完整，不添加文字、商标与水印。';
const VISUAL_STYLE_OPTIONS = [
  {
    "id": "style-nordic",
    "label": "北欧自然",
    "category": "家居自然",
    "description": "亲子家居 · 干净自然、温润织物",
    "prompt": "光线：室内采用大面积窗侧柔和日光；室外采用方向一致的柔和天光，阴影轻而有层次，不凭空添加窗户。\n色彩：环境采用中性低饱和色，白平衡自然，不给产品套米白滤镜。\n材质：突出棉麻纤维、木杆纹理、细致缝线与柔软但有张力的面料。\n构图：平视或轻微俯视，帐篷完整、空间舒展，保留当地背景的可识别细节。\n避免：避免灰蒙、过曝、样板间式空洞感。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  },
  {
    "id": "style-soft",
    "label": "轻奢柔光",
    "category": "品牌柔光",
    "description": "品牌广告 · 柔和光线、立体高级质感",
    "prompt": "光线：宽大柔光主光配克制轮廓光，面料明暗过渡细腻，接触阴影清楚。\n色彩：环境温润中性，产品主色准确，儿童肤色自然，避免整体金色滤镜。\n材质：棉帆布、包边和支架有真实细节，精修但不抹掉纤维与褶皱。\n构图：帐篷突出且完整，画面留白克制，景深保留地标与指定背景可辨识。\n避免：避免镀金装饰、虚假光晕、塑料感或浓重商业滤镜。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  },
  {
    "id": "style-commerce",
    "label": "明亮电商",
    "category": "电商清晰",
    "description": "电商详情 · 清晰、准确、易辨识",
    "prompt": "光线：均匀明亮的真实摄影布光，曝光准确，无死白高光和黑色死影。\n色彩：白平衡中性，产品配色忠实，不改变当地背景的自然颜色。\n材质：面料织纹、包边、接缝和连接件清晰，边缘干净，阴影真实。\n构图：帐篷完整不裁切，正面或三分之四视角，重点突出开口与结构；是否白底由公共模板决定。\n避免：避免因电商风格擅自去除当地背景、虚假锐化、悬浮或添加参数文字。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  },
  {
    "id": "style-documentary",
    "label": "户外纪实",
    "category": "户外纪实",
    "description": "户外生活 · 可信自然、环境有地域感",
    "prompt": "光线：采用与所选地区和场景一致的自然天光，太阳方向和地面阴影一致。\n色彩：保持植物、建筑与肤色真实，色彩清透克制，不做橙青电影调色。\n材质：保留户外使用中合理的布料张力和微褶皱，产品干净且高级。\n构图：自然平视、真实透视与尺度，产品在前景完整，当地地标清楚但不抢主体；人物只按模板要求出现。\n避免：避免过度虚化背景、脏旧产品、极端广角、旅游明信片式地标拼贴。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  },
  {
    "id": "style-dream",
    "label": "梦幻童趣",
    "category": "梦幻童趣",
    "description": "儿童品牌 · 梦幻氛围、真实摄影",
    "prompt": "光线：可信的柔和侧光或逆光，轻盈明亮，保留布料与地面的真实受光。\n色彩：环境色彩轻柔通透，梦幻感来自协调色彩和光线，产品仍遵循所选配色。\n材质：棉麻纤维、印花边界与支架材质清楚可见，不做玩具塑胶质感。\n构图：儿童视角、舒展构图，帐篷完整；梦幻感来自现有场景，不凭空增加动物、城堡或星球，印花元素只按所选元素要求出现。\n避免：避免插画、3D 卡通、仙境替代城市、漂浮物、霓虹或虚假发光。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  },
  {
    "id": "style-editorial",
    "label": "高端画册",
    "category": "高端画册",
    "description": "产品手册 · 大气留白、设计感构图",
    "prompt": "光线：有方向的柔和主光，控制对比，亮部与暗部都保留织物细节。\n色彩：环境色调克制自然，帐篷配色准确，以真实材质对比形成层次。\n材质：高级商业精修，纤维、缝线、包边和支架都真实，不用过度磨皮。\n构图：产品完整，留出适合后续排版的干净空间，不直接生成文字；背景线索仍清楚可辨，不因留白删掉指定地标。\n避免：避免海报字样、伪品牌标识、重滤镜、空洞影棚感或产品裁切。\n约束：仅调整摄影视觉语言，不改变帐篷结构、参考产品材质、产品配色、图案元素或所选地区。当地背景与公共模板优先，白底模板始终保持纯白且不添加场景。必须为精修真实商业摄影。",
    "selected": false,
    "quantity": 1
  }
];
const CORE_PROMPT_GROUPS = Object.freeze({
  'group-style': { id: 'group-style', name: '视觉风格', enabled: true, options: VISUAL_STYLE_OPTIONS },
  'group-location': Object.freeze({
    id: 'group-location', name: '当地背景', enabled: true,
    options: Object.freeze([
      Object.freeze({ id: 'melbourne', label: '澳大利亚·墨尔本', description: '雅拉河水岸、弗林德斯街车站与 CBD', prompt: '地点锁定为澳大利亚墨尔本 Melbourne。必须采用雅拉河 Yarra River 水岸公园视角，并让弗林德斯街车站 Flinders Street Station 黄赭色立面、绿色穹顶和墨尔本 CBD 天际线中的至少一个成为清楚可辨的地域锚点；禁止改成悉尼地标、普通草坪或无名住宅。建筑透视、尺度、日光方向与帐篷所在岸边空间必须真实一致', selected: false, quantity: 1 }),
      Object.freeze({ id: 'sydney', label: '澳大利亚·悉尼', description: '歌剧院、海港水岸与明亮自然光', prompt: '地点锁定为澳大利亚悉尼 Sydney。采用悉尼海港沿岸开阔公园视角，只把悉尼歌剧院 Sydney Opera House 的白色帆形屋顶作为主地域锚点，放在中远景并保持真实尺度；海港水面、滨水步道与清透明亮的日光负责补充悉尼气候和空间感。不要同时强塞海港大桥，禁止用普通现代住宅、无名草坪或其他城市天际线代替', selected: true, quantity: 1 }),
      Object.freeze({ id: 'dubai', label: '阿联酋·迪拜', description: '哈利法塔、浅色石材与棕榈庭院', prompt: '地点锁定为阿联酋迪拜 Dubai。必须在浅色石材与棕榈组成的开放式家庭庭院或公园中，清楚呈现哈利法塔 Burj Khalifa 独特的逐级收分尖塔轮廓作为地域锚点；使用干燥通透的暖日光和可信城市尺度。禁止只给沙漠、普通豪宅或泛化现代天际线，禁止混入其他海湾城市地标', selected: true, quantity: 2 }),
      Object.freeze({ id: 'suzhou', label: '中国·苏州', description: '金鸡湖、东方之门与现代江南', prompt: '地点锁定为中国苏州 Suzhou。必须采用金鸡湖 Jinji Lake 岸边开放绿地视角，清楚呈现东方之门 Gate of the Orient 的拱门形轮廓作为现代苏州地域锚点，并以少量白墙黛瓦或江南园林植被补充层次。禁止只用泛化中式庭院、古镇布景或其他城市天际线代替', selected: false, quantity: 1 }),
      Object.freeze({ id: 'california', label: '美国·加利福尼亚', description: '加州工匠屋、耐旱植物与海岸阳光', prompt: '地点锁定为美国加利福尼亚 California。必须呈现可辨认的加州家庭住宅语言：低坡屋顶的 Craftsman 工匠屋、灰泥或木板立面、龙舌兰等耐旱植物，并保留棕榈与干燥山丘或海岸光线中的至少一项；采用明亮干燥的午后日光。禁止改成普通欧式草坪、英式花园或无地域样板房', selected: false, quantity: 1 }),
      Object.freeze({ id: 'london', label: '英国·伦敦', description: '塔桥、泰晤士河岸与英式花园', prompt: '地点锁定为英国伦敦 London。必须采用泰晤士河岸开放公园或露台视角，让伦敦塔桥 Tower Bridge 的双塔与蓝色悬索结构成为清楚可辨的地域锚点，并保留浅砖联排住宅、修剪绿篱或柔和阴天天光中的一项。禁止用普通英式花园完全替代塔桥，禁止混入其他欧洲城市地标', selected: false, quantity: 1 }),
      Object.freeze({ id: 'paris', label: '法国·巴黎', description: '埃菲尔铁塔、浅石立面与法式花园', prompt: '地点锁定为法国巴黎 Paris。必须采用塞纳河岸公园或开阔城市露台视角，让埃菲尔铁塔 Eiffel Tower 的铁格构轮廓成为清楚可辨且透视可信的地域锚点，并保留奥斯曼浅石立面、铁艺栏杆或法式花园中的一项。禁止只用泛化法式住宅代替地标，避免贴纸式地标拼贴和其他城市建筑', selected: false, quantity: 1 }),
    ]),
  }),
  'group-color': Object.freeze({
    id: 'group-color', name: '产品配色', enabled: true,
    options: Object.freeze([
      Object.freeze({ id: 'red', label: '暖陶红帐篷', description: '只改变帐篷面料主色，背景保持自然', prompt: '将帐篷主体面料主色调整为高级、低饱和的暖陶红；只改变产品织物颜色，保持支架、连接件、地面和环境本来的真实颜色，不给整张图片添加红色色调', selected: true, quantity: 1 }),
      Object.freeze({ id: 'blue', label: '冰川蓝帐篷', description: '清透低饱和蓝，保留真实材质层次', prompt: '将帐篷主体面料主色调整为清透、低饱和的冰川蓝；只改变产品织物颜色，保留面料纹理、缝线、支架和背景的自然色彩，不把整幅画面染成蓝色', selected: true, quantity: 1 }),
      Object.freeze({ id: 'cream', label: '奶油白帐篷', description: '温润象牙白，避免过曝和廉价塑料感', prompt: '将帐篷主体面料主色调整为温润的奶油白或浅象牙白；只改变产品织物颜色，保留织物纤维和明暗层次，避免纯白过曝、塑料感或背景整体泛白', selected: false, quantity: 1 }),
      Object.freeze({ id: 'sage', label: '鼠尾草绿帐篷', description: '自然低饱和绿，适配室内外场景', prompt: '将帐篷主体面料主色调整为自然、低饱和的鼠尾草绿；仅调整产品织物，不改变木杆、金属件、人物肤色和环境色彩，保持高级户外家居质感', selected: false, quantity: 1 }),
      Object.freeze({ id: 'blush', label: '柔雾粉帐篷', description: '柔和高级粉，童趣但不甜腻', prompt: '将帐篷主体面料主色调整为低饱和柔雾粉；仅改变产品织物颜色，保持环境中性自然，避免整图粉色滤镜、荧光粉或廉价甜腻感', selected: false, quantity: 1 }),
      Object.freeze({ id: 'lavender', label: '星云紫帐篷', description: '梦幻灰紫，保留真实摄影与织物质感', prompt: '将帐篷主体面料主色调整为克制梦幻的灰调星云紫；仅改变产品织物颜色，保留真实面料纹理与自然环境色，避免全画面紫色调和虚假发光效果', selected: false, quantity: 1 }),
    ]),
  }),
  'group-canvas': Object.freeze({
    id: 'group-canvas', name: '画布尺寸', enabled: true,
    options: Object.freeze([
      Object.freeze({ id: 'canvas-4-3', label: '横版 4:3', description: '电商主图与产品手册常用横版', prompt: '采用 4:3 横版画布，主体完整，左右空间舒展，适合电商主图和产品手册', ratio: '4:3', selected: true, quantity: 1 }),
      Object.freeze({ id: 'canvas-16-9', label: '宽横版 16:9', description: '网站横幅与大场景展示', prompt: '采用 16:9 宽横版画布，扩大环境横向层次，帐篷保持完整且不贴边，适合网站横幅', ratio: '16:9', selected: false, quantity: 1 }),
      Object.freeze({ id: 'canvas-3-4', label: '竖版 3:4', description: '电商竖图与画册整页', prompt: '采用 3:4 竖版画布，帐篷完整居中并保留上下环境层次，适合电商竖图和画册整页', ratio: '3:4', selected: false, quantity: 1 }),
      Object.freeze({ id: 'canvas-9-16', label: '长竖版 9:16', description: '手机海报与短视频封面', prompt: '采用 9:16 长竖版画布，围绕帐篷组织前中后景，主体完整，不裁切顶部或底部，适合手机海报', ratio: '9:16', selected: false, quantity: 1 }),
      Object.freeze({ id: 'canvas-1-1', label: '方形 1:1', description: '平台方形主图', prompt: '采用 1:1 方形画布，帐篷完整突出，四周留白均衡，适合平台方形主图', ratio: '1:1', selected: false, quantity: 1 }),
    ]),
  }),
  'group-shot': Object.freeze({
    id: 'group-shot', name: '镜头景别', enabled: true,
    options: Object.freeze([
      Object.freeze({ id: 'shot-close', label: '近景', description: '帐篷占 80%–95% · 产品细节主导', prompt: '景别必须是明显的产品近景特写，摄影机距离约 1–2 米，使用 65–85mm 等效焦段的紧凑透视。帐篷主体占画面面积 80%–95%，入口、面料纹理、包边、缝线和支架连接清晰可见；帐篷轮廓贴近画面边缘，允许极少量外轮廓自然越界，但不得裁掉入口和关键结构。环境只占 5%–20%，主地域锚点在画面边缘或远景保留可辨轮廓，其余背景采用自然景深。严禁拉远成完整环境展示，严禁帐篷占比低于 75%，不要中景或广角全景', selected: false, quantity: 1 }),
      Object.freeze({ id: 'shot-medium', label: '中景', description: '帐篷占 45%–60% · 产品环境平衡', prompt: '景别必须是标准产品中景，摄影机距离约 3–5 米，使用 45–55mm 等效标准焦段和平视透视。帐篷完整呈现，占画面面积 45%–60%，四周保留约半个帐篷宽度的环境空间；产品结构和使用场景同等清楚，人物如出现应与帐篷形成真实互动。严禁贴边特写，也严禁帐篷缩小到画面 35% 以下；不要近景裁切或远景全景', selected: true, quantity: 1 }),
      Object.freeze({ id: 'shot-wide', label: '远景', description: '帐篷占 12%–25% · 地域环境主导', prompt: '景别必须是明显的环境远景或建立镜头，摄影机距离约 10–20 米，使用 24–35mm 等效广角焦段。帐篷完整置于画面下三分之一附近，占画面面积 12%–25%；环境占 75%–88%，必须清楚展示大面积前景、完整场地、天空或建筑天际线，让地域地标和空间尺度成为主要视觉信息，同时帐篷仍可辨认。帐篷四周至少保留一至两个帐篷宽度的环境空间。严禁把帐篷放大到 30% 以上，严禁返回近景或常规中景', selected: false, quantity: 1 }),
    ]),
  }),
  'group-scene': Object.freeze({
    id: 'group-scene', name: '使用场景', enabled: true,
    options: Object.freeze([
      Object.freeze({ id: 'scene-nursery', label: '儿童房', description: '真实住宅尺度 · 窗边活动区', prompt: '真实高端住宅儿童房的窗边活动区，帐篷完整落在平整地毯上；墙面、窗框和家具遵循同一透视，家具尺寸与帐篷相符。只保留地毯、矮书架两类简单陈设，不堆玩具，不做样板间或影棚布景', selected: false, quantity: 1 }),
      Object.freeze({ id: 'scene-reading', label: '阅读角', description: '安静自然 · 简洁坐垫与书本', prompt: '帐篷入口形成真实阅读角，只放一只坐垫和一本打开的书；物件完整落地且不穿插帐篷，空间留白充足。若要求人物，只安排一名儿童静坐阅读，避免复杂手势、遮脸和多人互动', selected: false, quantity: 1 }),
      Object.freeze({ id: 'scene-backyard', label: '后院草地', description: '开阔真实 · 连续地面与自然植被', prompt: '真实家庭后院或开放庭院，连续平整草地从前景延伸至建筑，帐篷支脚稳定落地；仅保留一棵树和一组低矮灌木作为空间层次，不出现杂乱派对道具、假草皮、巨型植物或不合理围墙', selected: true, quantity: 1 }),
      Object.freeze({ id: 'scene-open-field', label: '开阔自然地', description: '梦幻空旷 · 真实户外尺度', prompt: '开阔、安静且真实的自然草甸或缓坡，视野通透，地形连续，天空和远景具有自然空气透视；帐篷落在可承重的平整草地上，只保留少量野花和远处树线，不出现奇幻漂浮物、舞台布景或不合比例的山体', selected: false, quantity: 1 }),
      Object.freeze({ id: 'scene-campsite', label: '露营营地', description: '规范营位 · 克制户外陈设', prompt: '真实合规的家庭露营营位，帐篷位于平整营位中央，地钉、风绳和通道位置合理；只保留折叠椅与小型露营灯两类道具，不出现明火、车辆穿插、密集装备或多个帐篷抢主体', selected: false, quantity: 1 }),
    ]),
  }),
});
const PROVIDERS = Object.freeze({
  openai: Object.freeze({
    name: 'ChatGPT / OpenAI', shortName: 'OpenAI', keyStorage: OPENAI_KEY_STORAGE, keyLabel: 'OpenAI API Key', avatar: 'AI',
    profiles: Object.freeze({
      fast: Object.freeze({ name: '快速草图', model: 'GPT Image 2', code: 'gpt-image-2', detail: 'Low 质量，快速确认构图', submitLimit: 5, concurrency: 2 }),
      quality: Object.freeze({ name: '精细成片', model: 'GPT Image 2.5', code: 'gpt-image-2.5-sunburst', detail: 'High 质量，适合白底图与交付素材', submitLimit: 5, concurrency: 2 }),
    }),
  }),
  qwen: Object.freeze({
    name: '阿里千问', shortName: '千问', keyStorage: QWEN_KEY_STORAGE, keyLabel: '千问 API Key', avatar: 'Q',
    profiles: Object.freeze({
      fast: Object.freeze({ name: '快速出图', model: 'Qwen Image 3.0', code: 'qwen-image-3.0', detail: '关闭深度思考，优先缩短等待', submitLimit: 20, concurrency: 5 }),
      quality: Object.freeze({ name: '精细出图', model: 'Qwen Image 3.0 Pro', code: 'qwen-image-3.0-pro', detail: '2048 长边精细输出，强化场景空间与人物清晰度', submitLimit: 5, concurrency: 5 }),
      wan: Object.freeze({ name: '万相 · 产品一致性', model: 'Wan 2.6 Image', code: 'wan2.6-image', detail: '参考图编辑 · 关闭扩写，保留明确需求', submitLimit: 5, concurrency: 2 }),
    }),
  }),
});

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
  schemaVersion: CURRENT_SCHEMA_VERSION,
  credits: 2680,
  products: productDefinitions.map(seedProduct),
  savedAssets: seedSavedAssets.map((asset) => ({ ...asset, demo: true, tags: [...asset.tags, '演示图 · 非实际生成'] })),
  templates: [
    { id: 'tpl-tent', name: '帐篷批量创作', tag: '行业模板', image: RESULT_IMAGES[0], description: '按 SKU 与提示词组合批量生产创意素材', fields: 8 },
    { id: 'tpl-product', name: '通用商品图', tag: '通用模板', image: RESULT_IMAGES[1], description: '适配不同品类的电商主图与细节展示', fields: 4 },
    { id: 'tpl-scene', name: '场景换图', tag: '图像编辑', image: RESULT_IMAGES[2], description: '保留产品主体，快速替换使用环境', fields: 3 },
  ],
  projects: [
    { id: 'pr-1', name: '三款帐篷区域素材批次', type: '演示批次 · 非实际生成', image: RESULT_IMAGES[0], updated: '示例' },
    { id: 'pr-2', name: '儿童帐篷多配色方案', type: '演示批次 · 非实际生成', image: RESULT_IMAGES[1], updated: '示例' },
  ],
  promptGroups: [
    structuredClone(CORE_PROMPT_GROUPS['group-location']),
    structuredClone(CORE_PROMPT_GROUPS['group-color']),
    structuredClone(CORE_PROMPT_GROUPS['group-canvas']),
    structuredClone(CORE_PROMPT_GROUPS['group-shot']),
  ],
  promptLibrary: [
    { id: 'group-scene', name: '使用场景', options: structuredClone(CORE_PROMPT_GROUPS['group-scene'].options) },
    { id: 'group-purpose', name: '页面用途', options: ['产品主图', '亲子生活图', '电商详情图'] },
    { id: 'group-style', name: '视觉风格', options: VISUAL_STYLE_OPTIONS.map((option) => option.label) },
    { id: 'group-canvas', name: '画布尺寸', options: CORE_PROMPT_GROUPS['group-canvas'].options.map((option) => option.label) },
    { id: 'group-shot', name: '镜头景别', options: CORE_PROMPT_GROUPS['group-shot'].options.map((option) => option.label) },
  ],
  publicPrompts: PUBLIC_PROMPT_TEMPLATES,
  batchHistory: [],
  studio: { selectedProductIds: ['p-1', 'p-2', 'p-3'], templateId: 'tpl-tent', publicPromptId: 'brief', requirements: '', otherRequirements: '', universalPrompt: DEFAULT_UNIVERSAL_PROMPT, provider: 'openai', generationMode: 'quality', model: 'gpt-image-2.5-sunburst', ratio: '4:3' },
  batch: { id: '', status: 'idle', results: [], plannedTotal: 18, startedAt: '', savedAt: '' },
  ui: { route: 'products', productSearch: '', productCategory: '全部品类', drawerProductId: '', drawerTab: 'info', assetFilter: '全部', productPickerOpen: false, promptDialogGroupId: '', confirmBatch: false, exportScope: 'all', exportTarget: '', exportFormat: 'original' },
  connection: { provider: 'openai', userKeyRequired: true, authenticated: { openai: false, qwen: false }, model: 'gpt-image-2' },
};

let state = structuredClone(seedState);
let uploadImageData = '';
let saveTimer;
let activeGenerationId = '';
let lastFocusedElement = null;
let keyDialogOpen = false;
let keyDialogError = '';
let pendingKeyAction = '';
let keyDialogProvider = 'openai';
let imagePreview = null;
let cityPlannerBusy = false;
let cityDraft = '';
let cityPlannerError = '';
let regionPreviewId = '';
let stylePreviewId = '';
let stylePromptDraft = '';
let stylePromptError = '';
let promptReview = null;
let confirmedPromptReviews = { batch: null, comparison: null };
let promptReviewIndex = 0;
let promptReviewEditing = false;
let promptReviewDraft = '';
let promptReviewError = '';
let comparisonRequested = false;
let durableStateDb;
let storageWarningShown = false;
let generationStarting = false;
let hostStateWritable = false;
const exportRuntime = { busy: false, message: '', error: '' };

function stateDatabase() {
  durableStateDb ||= new Promise((resolve, reject) => {
    const request = indexedDB.open('designflow-images', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return durableStateDb;
}

async function persistDurableState(snapshot) {
  const db = await stateDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('state', 'readwrite');
    transaction.objectStore('state').put(snapshot, 'current');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function upgradeCorePromptGroups(groups) {
  if (!Array.isArray(groups)) return structuredClone(seedState.promptGroups);
  const upgradedGroups = groups.map((group) => {
    const template = CORE_PROMPT_GROUPS[group.id];
    if (group.id === 'group-style') return upgradeVisualStyleGroup(group);
    if (!template) return group;
    const existingOptions = Array.isArray(group.options) ? group.options : [];
    const templateIds = new Set(template.options.map((option) => option.id));
    const templateLabels = new Set(template.options.map((option) => option.label));
    const upgradedOptions = template.options.map((option) => {
      const existing = existingOptions.find((item) => item.id === option.id || item.label === option.label);
      return { ...structuredClone(option), selected: existing?.selected ?? option.selected, quantity: Math.max(1, Number(existing?.quantity) || option.quantity) };
    });
    const customOptions = existingOptions.filter((option) => !templateIds.has(option.id) && !templateLabels.has(option.label)).map((option) => ({ ...option, prompt: option.prompt || option.label, description: option.description || '自定义选项' }));
    return { ...structuredClone(template), enabled: group.enabled !== false, options: [...upgradedOptions, ...customOptions] };
  });
  for (const id of ['group-canvas', 'group-shot']) {
    if (!upgradedGroups.some((group) => group.id === id)) upgradedGroups.push(structuredClone(CORE_PROMPT_GROUPS[id]));
  }
  return upgradedGroups;
}

function upgradePublicPrompts(prompts) {
  const existing = Array.isArray(prompts) ? prompts : [];
  const builtInIds = new Set(PUBLIC_PROMPT_TEMPLATES.map((template) => template.id));
  return [
    ...structuredClone(PUBLIC_PROMPT_TEMPLATES),
    ...existing.filter((template) => !builtInIds.has(template.id)),
  ];
}

function upgradeVisualStyleGroup(group) {
  const options = Array.isArray(group.options) ? group.options : [];
  const upgraded = options.map((option) => {
    const definition = VISUAL_STYLE_OPTIONS.find((item) => item.id === option.id || item.label === option.label);
    if (!definition) return { ...option, prompt: option.prompt || `光线：真实柔和摄影光线。\n色彩：保持产品配色与自然环境色。\n材质：面料与支架细节清晰。\n构图：产品完整，指定背景可辨识。\n风格要求：${option.label}。\n约束：真实商业摄影，不覆盖产品结构、当地背景或公共模板。` };
    return { ...structuredClone(definition), ...option, description: definition.description, category: definition.category, prompt: option.prompt && option.prompt !== option.label ? option.prompt : definition.prompt };
  });
  for (const definition of VISUAL_STYLE_OPTIONS) {
    if (!upgraded.some((option) => option.id === definition.id || option.label === definition.label)) upgraded.push(structuredClone(definition));
  }
  return { ...group, options: upgraded };
}

function openStylePrompt(option) {
  stylePreviewId = option.id; stylePromptDraft = option.prompt || option.label; stylePromptError = '';
}

function saveStylePrompt() {
  const option = state.promptGroups.find((group) => group.id === 'group-style')?.options.find((item) => item.id === stylePreviewId);
  const draft = stylePromptDraft.trim();
  if (!draft || draft.length > 1600) { stylePromptError = '请输入 1–1600 字的风格提示词。'; render(); $('#style-prompt-text')?.focus(); return; }
  if (option) { option.prompt = draft; markRecipeCustomized(); saveState(); }
  stylePreviewId = ''; stylePromptError = ''; render(); focusOverlay();
}

function applySavedState(saved) {
  if (![6, 7, 8, 9, 10, 11, CURRENT_SCHEMA_VERSION].includes(saved?.schemaVersion) || !Array.isArray(saved.products)) return;
  state = { ...structuredClone(seedState), ...saved, studio: { ...seedState.studio, ...(saved.studio || {}) }, batch: { ...seedState.batch, ...(saved.batch || {}) }, ui: { ...seedState.ui, ...(saved.ui || {}) }, connection: { ...seedState.connection, ...(saved.connection || {}) } };
  if (saved.schemaVersion < CURRENT_SCHEMA_VERSION) {
    state.schemaVersion = CURRENT_SCHEMA_VERSION;
    state.promptGroups = upgradeCorePromptGroups(state.promptGroups);
    state.publicPrompts = upgradePublicPrompts(state.publicPrompts);
    const sceneLibrary = state.promptLibrary.find((group) => group.id === 'group-scene');
    if (sceneLibrary) sceneLibrary.options = structuredClone(CORE_PROMPT_GROUPS['group-scene'].options);
    if (!saved.studio?.universalPrompt || saved.studio.universalPrompt === LEGACY_UNIVERSAL_PROMPT) state.studio.universalPrompt = DEFAULT_UNIVERSAL_PROMPT;
    if (saved.schemaVersion === 6) { state.studio.generationMode = 'quality'; state.studio.model = providerConfig(state.studio.provider).profiles.quality.code; }
  }
  state.promptGroups = state.promptGroups.map((group) => group.id === 'group-style' ? upgradeVisualStyleGroup(group) : group);
  const styleLibrary = state.promptLibrary.find((group) => group.id === 'group-style');
  if (styleLibrary) styleLibrary.options = [...new Set([...VISUAL_STYLE_OPTIONS.map((option) => option.label), ...(Array.isArray(styleLibrary.options) ? styleLibrary.options : [])])];
  if (!saved.studio?.generationMode) state.studio.generationMode = 'quality';
  if (!saved.studio?.provider || !PROVIDERS[state.studio.provider]) state.studio.provider = 'openai';
  if (!saved.batch?.generationMode && saved.batch?.results?.length) state.batch.generationMode = 'quality';
  if (saved.batch?.results?.length && !PROVIDERS[state.batch.provider]) state.batch.provider = 'qwen';
  state.batch.results?.forEach((item) => {
    const hadEvaluation = item.evaluation && typeof item.evaluation === 'object';
    if (item.status === 'upscaling') { item.status = 'failed'; item.error = '页面在 4K 处理期间关闭，请点击重试，原图不会受影响。'; }
    item.evaluation = { ...Core.emptyEvaluation(), ...(item.evaluation || {}) };
    item.review = hadEvaluation ? Core.deriveReview(item.evaluation) : 'pending';
  });
  if (!state.connection.authenticated || typeof state.connection.authenticated !== 'object' || Array.isArray(state.connection.authenticated)) state.connection.authenticated = { openai: false, qwen: Boolean(state.connection.authenticated) };
  state.savedAssets.forEach((asset) => { if (seedSavedAssets.some((sample) => sample.id === asset.id)) { asset.demo = true; if (!asset.tags.includes('演示图 · 非实际生成')) asset.tags.push('演示图 · 非实际生成'); } });
  state.projects.forEach((project) => { if (['pr-1', 'pr-2'].includes(project.id)) project.type = '演示批次 · 非实际生成'; });
  state.publicPrompts = Array.isArray(state.publicPrompts) ? state.publicPrompts : structuredClone(PUBLIC_PROMPT_TEMPLATES);
  state.batchHistory = Array.isArray(state.batchHistory) ? state.batchHistory : [];
  if (!providerConfig().profiles[state.studio.generationMode]) state.studio.generationMode = 'quality';
}

function loadLocalState() {
  try { applySavedState(JSON.parse(localStorage.getItem('designflow-state') || 'null')); } catch { /* use seed */ }
}

async function loadState() {
  try {
    const db = await stateDatabase();
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction('state').objectStore('state').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (saved && (saved.updatedAtMs || 0) >= (state.updatedAtMs || 0)) applySavedState(saved);
  } catch { /* small-state fallback remains available */ }
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      hostStateWritable = true;
      applySavedState(await response.json());
    }
  } catch { /* local seed remains usable */ }
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const config = await response.json();
      state.connection.provider = config.provider || 'openai';
      state.connection.userKeyRequired = config.userKeyRequired !== false;
      state.connection.model = config.model || 'gpt-image-2';
    }
  } catch { /* connection is optional */ }
}

function saveState() {
  state.updatedAtMs = Date.now();
  try {
    const serialized = JSON.stringify(state);
    if (serialized.length < 1_500_000) localStorage.setItem('designflow-state', serialized);
    else localStorage.removeItem('designflow-state');
  } catch { /* private mode or quota may reject; IndexedDB remains primary */ }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const snapshot = structuredClone(state);
    try {
      await persistDurableState(snapshot);
      if (hostStateWritable) {
        const response = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot) });
        if (!response.ok) throw new Error('HOST_STATE_WRITE_FAILED');
      }
    }
    catch { if (!storageWarningShown) { storageWarningShown = true; showToast('状态保存不完整', '请及时导出素材；浏览器存储、磁盘空间或本地主机写入可能受限。', 'info'); } }
  }, 180);
}

function markRecipeCustomized() {
  state.studio.templateId = '';
  confirmedPromptReviews = { batch: null, comparison: null };
}

function providerConfig(provider = state.studio.provider) { return PROVIDERS[provider] || PROVIDERS.openai; }

function getProviderApiKey(provider = state.studio.provider) {
  try { return sessionStorage.getItem(providerConfig(provider).keyStorage) || ''; } catch { return ''; }
}

function setProviderApiKey(provider, value) {
  try { sessionStorage.setItem(providerConfig(provider).keyStorage, value); return true; } catch { return false; }
}

function clearProviderApiKey(provider = state.studio.provider) {
  try { sessionStorage.removeItem(providerConfig(provider).keyStorage); } catch { /* restricted browser storage */ }
  state.connection.authenticated[provider] = false;
}

function normalizeApiKey(value) {
  return String(value || '').replace(/\\([_.-])/g, '$1').replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
}

function isProviderApiKey(value) {
  return /^sk-[A-Za-z0-9._-]{16,512}$/.test(value);
}

const routeMeta = { home: ['工作台总览', '首页'], studio: ['批量素材生产', '创建设计'], products: ['SKU 与真实底图', '产品库'], templates: ['复用生产规则', '模板中心'], assets: ['全部二维图片', '素材库'], exports: ['交付与下载', '导出中心'], connections: ['生成服务', '模型连接'] };
function productById(id) { return state.products.find((item) => item.id === id); }
function selectedProducts() { return Core.selectedProducts(state); }
function selectedOptions(group) { return Core.selectedOptions(group); }
function groupFactor(group) { return Core.groupFactor(group); }
function enabledGroups() { return Core.enabledGroups(state); }
function plannedTotal(forComparison = comparisonRequested) { return Core.plannedTotal(state, forComparison, Object.keys(providerConfig().profiles).length); }
function formulaText(forComparison = comparisonRequested) { return Core.formulaText(state, forComparison, Object.keys(providerConfig().profiles).length); }
function batchCost() { return plannedTotal() * CREDIT_PER_IMAGE; }
function refundResultCredit(item) { if (item && !item.creditRefunded && !item.is4k) { item.creditRefunded = true; state.credits += CREDIT_PER_IMAGE; } }
function generationProfile(mode = state.studio.generationMode, provider = state.studio.provider) { const profiles = providerConfig(provider).profiles; return profiles[mode] || profiles.fast; }
function batchGenerationProfile() { return generationProfile(state.batch.generationMode || state.studio.generationMode, state.batch.provider || state.studio.provider); }
function estimatedDuration(total, mode = state.studio.generationMode, provider = state.studio.provider) {
  if (!total) return '—';
  if (provider === 'openai') {
    const base = Math.max(1, Math.ceil(total / 2));
    return `约 ${base}–${base * (mode === 'quality' ? 2 : 1) + 2} 分钟`;
  }
  const base = mode === 'quality' ? Math.max(3, Math.ceil(total / 3)) : Math.max(1, Math.ceil(total / 8));
  return `约 ${base}–${base + (mode === 'quality' ? 4 : 2)} 分钟`;
}
function productAssets(id) { return state.savedAssets.filter((asset) => asset.productId === id); }
function batchReadyCount() { return state.batch.results.filter((item) => item.status === 'ready').length; }
function batchApprovedCount() { return state.batch.results.filter((item) => item.status === 'ready' && item.review === 'pass').length; }
function batchFailedCount() { return state.batch.results.filter((item) => item.status === 'failed').length; }
function batchDelayedCount() { return state.batch.results.filter((item) => item.status === 'delayed').length; }
function batchSettledCount() { return batchReadyCount() + batchFailedCount() + batchDelayedCount(); }
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
    $('#topbar-actions').innerHTML = `<button class="button button--secondary" data-action="open-product-picker">${svgIcon('plus')}选择产品</button>${state.batch.results.length ? `<button class="button button--primary" data-action="save-batch" ${batchApprovedCount() ? '' : 'disabled'}>${svgIcon('folder')}保存已验收素材</button>` : ''}`;
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
    <div class="product-table" role="table" aria-label="儿童帐篷产品库"><div class="table-row table-row--head" role="row"><span role="columnheader">SKU</span><span role="columnheader">底图</span><span role="columnheader">产品名称</span><span role="columnheader">品类</span><span role="columnheader">历史素材</span><span role="columnheader">设计批次</span><span role="columnheader">状态</span><span role="columnheader">更新时间</span><span role="columnheader">操作</span></div>${filtered.length ? filtered.map((product) => `<div class="table-row table-row--interactive" role="row" data-action="open-product-drawer" data-id="${product.id}"><span role="cell" class="table-sku">${escapeHtml(product.sku)}</span><span role="cell" class="base-thumb"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}白底产品图"></span><span role="cell"><strong>${escapeHtml(product.name)}</strong><small>真实产品底图已归档</small></span><span role="cell">${escapeHtml(product.category)}</span><span role="cell">${productAssets(product.id).length} 张</span><span role="cell">${product.versions} 个</span><span role="cell">${statusChip(product.status)}</span><span role="cell">${escapeHtml(product.updated)}</span><span role="cell"><button class="button row-action" data-action="open-product-drawer" data-id="${product.id}" aria-label="打开${escapeHtml(product.name)}详情">${svgIcon('chevron')}</button></span></div>`).join('') : '<div class="empty-state" role="row"><span role="cell">没有符合筛选条件的产品</span></div>'}</div>
  </section>`;
}

function renderSelectedProducts() {
  const products = selectedProducts();
  return `<div class="selected-products" aria-label="已选择产品">${products.map((product, index) => `<article class="selected-product-card"><button class="selected-product-main" data-action="open-product-drawer" data-id="${product.id}"><span class="product-order">${index + 1}</span><img src="${escapeHtml(product.image)}" alt=""><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></span></button><button class="icon-button remove-product" data-action="remove-selected-product" data-id="${product.id}" aria-label="移除${escapeHtml(product.name)}">${svgIcon('x')}</button></article>`).join('')}<button class="add-product-card" data-action="open-product-picker">${svgIcon('plus')}<span>添加产品</span></button></div>`;
}

function renderPromptGroups() {
  if (!state.promptGroups.length) return '<div class="empty-inline">还没有提示词组。<button class="button button--secondary" data-action="open-location">添加当地背景</button></div>';
  return `<div class="prompt-group-list">${state.promptGroups.map((group) => {
    const options = selectedOptions(group);
    return `<article class="prompt-group-row ${group.enabled ? '' : 'is-disabled'}"><div class="prompt-group-name"><span>${svgIcon('layers')}</span><div><strong>${escapeHtml(group.name)}</strong><small>${options.length ? `${groupFactor(group)} 个组合值` : '未选择选项'}</small></div></div><div class="prompt-chip-list">${options.length ? options.map((option) => `<span class="prompt-chip"${option.description ? ` title="${escapeHtml(option.description)}"` : ''}>${escapeHtml(group.id === 'group-shot' ? `${option.label} · ${option.description.split(' · ')[0]}` : option.label)} <b>×${option.quantity}</b></span>`).join('') : '<span class="muted-copy">点击编辑选择词条</span>'}</div><div class="prompt-row-actions"><button class="toggle-control" data-action="toggle-prompt-group" data-id="${group.id}" aria-pressed="${group.enabled}"><span></span>${group.enabled ? '启用' : '停用'}</button><button class="button button--quiet" data-action="edit-prompt-group" data-id="${group.id}">${svgIcon('edit')}编辑</button><button class="icon-button button--quiet" data-action="delete-prompt-group" data-id="${group.id}" aria-label="删除${escapeHtml(group.name)}">${svgIcon('trash')}</button></div></article>`;
  }).join('')}</div>${state.promptGroups.some((group) => group.id === 'group-location') ? '' : '<button class="button button--secondary" data-action="open-location">添加当地背景</button>'}`;
}

function variantLabel(index) { const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; return index < 26 ? alphabet[index] : `${alphabet[index % 26]}${Math.floor(index / 26) + 1}`; }

function renderPublicPromptArea() {
  const template = state.publicPrompts.find((item) => item.id === state.studio.publicPromptId) || state.publicPrompts[0];
  return `<div class="public-prompt-area"><label for="public-prompt-template">公共提示词模板</label><select id="public-prompt-template" class="select-control">${state.publicPrompts.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === template.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select><details class="template-rules"><summary>查看或修改模板要求</summary><label for="public-prompt-content">模板要求 · 每张图共用</label><textarea id="public-prompt-content" maxlength="800">${escapeHtml(template.prompt)}</textarea><div class="public-prompt-actions"><input id="public-prompt-name" class="input-control" maxlength="40" aria-label="另存模板名称" placeholder="新模板名称"><button class="button button--secondary" data-action="save-public-prompt">另存模板</button></div></details></div>`;
}

function renderLocationEditor(group) {
  return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-editor location-editor" role="dialog" aria-modal="true" aria-labelledby="location-editor-title"><div class="modal-header"><div><h2 id="location-editor-title">当地背景</h2><p>选择多个城市参与批量组合；城市选择、背景补全与规则编辑都在这里完成。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭当地背景">${svgIcon('x')}</button></div><div class="city-planner"><label for="city-name">添加城市</label><div class="public-prompt-actions"><input id="city-name" class="input-control" maxlength="80" value="${escapeHtml(cityDraft)}" placeholder="国家或城市，例如：澳大利亚·墨尔本" aria-describedby="city-planner-help${cityPlannerError ? ' city-planner-error' : ''}" aria-invalid="${Boolean(cityPlannerError)}"><button class="button button--secondary" data-action="plan-city" ${cityPlannerBusy ? 'disabled' : ''}>${cityPlannerBusy ? '正在补全背景…' : '添加并补全背景'}</button></div>${cityPlannerError ? `<p id="city-planner-error" class="field-error" role="alert">${escapeHtml(cityPlannerError)}</p>` : ''}<p id="city-planner-help">已有城市直接选用，不重复调用 AI。新城市由当前模型通道的文字 AI 补全背景，API 按量计费，推荐未经联网核验。添加不会取消其他城市。</p></div><div class="option-editor-list">${group.options.map((option) => `<div class="location-option"><div class="option-editor ${option.selected ? 'is-selected' : ''}"><button class="option-toggle" data-action="toggle-prompt-option" data-group-id="${group.id}" data-id="${option.id}" aria-pressed="${option.selected}" ${cityPlannerBusy ? 'disabled' : ''}><span class="option-check">${option.selected ? svgIcon('check') : ''}</span><span class="option-copy"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.description || '展开查看背景规则')}</small></span></button><div class="quantity-control" aria-label="${escapeHtml(option.label)}数量"><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="-1" aria-label="减少${escapeHtml(option.label)}数量" ${cityPlannerBusy ? 'disabled' : ''}>−</button><span>×${option.quantity}</span><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="1" aria-label="增加${escapeHtml(option.label)}数量" ${cityPlannerBusy ? 'disabled' : ''}>＋</button></div></div><details class="location-rule"><summary>${escapeHtml(option.label)} · 查看或修改背景规则</summary><label for="region-${escapeHtml(option.id)}">生图背景要求</label><textarea id="region-${escapeHtml(option.id)}" data-region-prompt="${escapeHtml(option.id)}" maxlength="1600">${escapeHtml(option.prompt || option.label)}</textarea></details></div>`).join('')}</div><div class="modal-actions"><span class="selection-count">已选 ${selectedOptions(group).length} 个城市 · ${groupFactor(group)} 个组合值</span><button class="button button--primary" data-action="finish-prompt-editor">完成</button></div></section></div>`;
}

async function enrichCity(label) {
  if (cityPlannerBusy) return;
  cityDraft = String(label || '').trim();
  cityPlannerError = '';
  if (!cityDraft || cityDraft.length > 80) { cityPlannerError = '请输入 1–80 字的国家或城市名称。'; render(); requestAnimationFrame(() => $('#city-name')?.focus()); return; }
  label = cityDraft;
  const provider = state.studio.provider;
  let group = state.promptGroups.find((item) => item.id === 'group-location');
  if (!group) { group = structuredClone(CORE_PROMPT_GROUPS['group-location']); state.promptGroups.push(group); }
  label = label.trim();
  let option = group.options.find((item) => item.id === label.toLowerCase() || item.label === label || item.label.includes(label) || item.label.toLowerCase().includes(label.toLowerCase()));
  if (!option?.prompt || option.prompt === option.label) {
    if (!getProviderApiKey(provider)) { openApiKeyDialog(provider, `city:${label}`); return; }
    cityPlannerBusy = true;
    render();
    try {
      const output = await apiJson(`/api/${provider}/plan-city`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city: label }) });
      if (option) Object.assign(option, { prompt: output.prompt, description: 'AI 推荐地域线索 · 未联网核验' });
      else { option = { id: uid('city'), label, prompt: output.prompt, description: 'AI 推荐地域线索 · 未联网核验', selected: true, quantity: 1 }; group.options.push(option); }
    } catch (error) { cityPlannerError = `${error.message}。已保留城市输入和原有选项，可重试。`; return; }
    finally { cityPlannerBusy = false; render(); }
  }
  group.enabled = true;
  option.selected = true;
  markRecipeCustomized();
  cityDraft = '';
  regionPreviewId = option.id;
  saveState(); render();
  showToast('城市已加入当地背景', `${option.label} 已选中，其他城市与数量保持不变；可展开查看背景规则。`, 'check');
}

function evaluationOption(value, current, label) { return `<option value="${value}" ${current === value ? 'selected' : ''}>${label}</option>`; }

function renderResultEvaluation(item) {
  const evaluation = { ...Core.emptyEvaluation(), ...(item.evaluation || {}) };
  const binaryOptions = (current, allowNA = false) => `${evaluationOption('pending', current, '待检查')}${evaluationOption('pass', current, '通过')}${evaluationOption('fail', current, '不通过')}${allowNA ? evaluationOption('na', current, '不适用') : ''}`;
  return `<fieldset class="quality-rubric"><legend>交付验收 · ${item.review === 'pass' ? '可保存' : item.review === 'fail' ? '需重做' : '待完成'}</legend><label>产品结构保真<select class="select-control" data-result-evaluation="${escapeHtml(item.id)}" data-field="structure">${[0, 1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${Number(evaluation.structure) === score ? 'selected' : ''}>${score ? `${score} / 5` : '待评分'}</option>`).join('')}</select></label><label>地域线索<select class="select-control" data-result-evaluation="${escapeHtml(item.id)}" data-field="location">${binaryOptions(evaluation.location, true)}</select></label><label>镜头景别<select class="select-control" data-result-evaluation="${escapeHtml(item.id)}" data-field="shot">${binaryOptions(evaluation.shot, true)}</select></label><label>明显缺陷<select class="select-control" data-result-evaluation="${escapeHtml(item.id)}" data-field="defects">${binaryOptions(evaluation.defects)}</select></label><label>可直接交付<select class="select-control" data-result-evaluation="${escapeHtml(item.id)}" data-field="deliverable">${binaryOptions(evaluation.deliverable)}</select></label></fieldset>`;
}

function renderBatchTools() {
  return `<div class="batch-tools"><p>当前结果：${batchReadyCount()} 张完成 · ${batchApprovedCount()} 张通过验收 · ${batchFailedCount()} 张失败 · ${batchDelayedCount()} 张待查询。点击图片放大检查；“4K 尺寸版”仅扩大像素尺寸，不会增加模型细节，也不扣积分。</p>${state.batchHistory.length ? `<label for="batch-history">历史实际批次</label><select id="batch-history" class="select-control"><option value="">选择历史批次</option>${state.batchHistory.map((batch) => `<option value="${escapeHtml(batch.id)}">${escapeHtml(batch.id)} · ${batch.results.length} 张 · ${escapeHtml(batch.startedAt)}</option>`).join('')}</select>` : ''}<details open><summary>本批次提示词与交付验收</summary>${state.batch.results.map((item, index) => `<div class="result-audit"><strong>${variantLabel(index)} · ${escapeHtml(item.productSnapshot?.sku || productById(item.productId)?.sku)} · ${escapeHtml(item.model || item.generationMode || '旧批次')}</strong><p>${escapeHtml(item.tags.join(' · '))}</p>${item.status === 'ready' ? renderResultEvaluation(item) : ''}<details class="result-prompt-details"><summary>查看实际提示词</summary><pre>${escapeHtml(item.prompt || '旧批次未保存完整提示词；新批次会记录。')}</pre></details></div>`).join('')}</details></div>`;
}

function renderResultGroups() {
  if (!state.batch.results.length) return `<div class="result-empty"><span>${svgIcon('image')}</span><strong>生成结果会按 SKU 分组</strong><p>确认任务后，这里会先出现对应数量的加载卡片。</p></div>`;
  const batchProducts = [...new Set(state.batch.results.map((item) => item.productId))].map((id) => state.batch.results.find((item) => item.productId === id)?.productSnapshot || productById(id)).filter(Boolean);
  return batchProducts.map((product) => {
    const items = state.batch.results.filter((item) => item.productId === product.id);
    const completed = items.filter((item) => item.status === 'ready').length;
    const failed = items.filter((item) => item.status === 'failed').length;
    return `<section class="result-product-group"><header><div><img src="${escapeHtml(product.image)}" alt=""><span><strong>${escapeHtml(product.sku)}</strong><small>${completed}/${items.length} 已完成${failed ? ` · ${failed} 张需重试` : ''}</small></span></div></header><div class="result-grid">${items.map((item, index) => {
      const label = variantLabel(index);
      const ratio = /^\d+:\d+$/.test(item.ratio || '') ? item.ratio.replace(':', ' / ') : '4 / 3';
      if (item.status === 'delayed') return `<article class="result-card is-delayed"><div class="result-error" style="aspect-ratio:${ratio}"><strong>${label} 等待时间较长</strong><p>${escapeHtml(item.error || '原任务已保留，可继续查询且不会重复扣分。')}</p><button data-action="check-result" data-id="${item.id}">${svgIcon('refresh')}查询结果</button></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      if (item.status === 'failed') return `<article class="result-card is-failed"><div class="result-error" style="aspect-ratio:${ratio}"><strong>${label} ${item.is4k ? '4K 尺寸处理失败' : '生成失败'}</strong><p>${escapeHtml(item.error || '模型暂时无法完成这张图片。')}</p><button data-action="${item.is4k ? 'generate-4k-result' : 'regenerate-result'}" data-id="${item.is4k ? item.sourceResultId : item.id}">${svgIcon('refresh')}重试</button></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      if (item.status !== 'ready') return `<article class="result-card is-loading"><div class="result-skeleton" style="aspect-ratio:${ratio}"><span>${label}</span><small>${item.status === 'upscaling' ? '4K 尺寸处理中' : item.status === 'queued' ? '正在提交' : item.remoteStatus === 'PENDING' ? '模型排队中' : `生成中 · ${elapsedMinutes(item.submittedAt)} 分钟`}</small></div><div class="result-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
      return `<article class="result-card"><button class="image-preview-button result-preview-trigger" data-action="preview-result" data-id="${item.id}" aria-label="查看${escapeHtml(product.name)}创意素材 ${label} 大图"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(product.name)}创意素材 ${label}" style="aspect-ratio:${ratio}"></button><span class="result-code">${item.is4k ? '4K 尺寸' : label}</span><div class="result-model">${escapeHtml(item.model || item.generationMode || '旧批次')} · ${item.review === 'pass' ? '验收通过' : item.review === 'fail' ? '需重做' : '待验收'}</div><div class="result-actions">${item.is4k ? '' : `<button class="result-4k-button" data-action="generate-4k-result" data-id="${item.id}" aria-label="生成素材 ${label} 的 4K 尺寸版，不增加细节，不扣积分" title="4K 尺寸导出 · 浏览器插值，不增加模型细节">4K 尺寸</button>`}<button data-action="download-result" data-id="${item.id}" aria-label="下载素材 ${label}">${svgIcon('download')}</button>${item.is4k ? '' : `<button data-action="regenerate-result" data-id="${item.id}" aria-label="重新生成素材 ${label}">${svgIcon('refresh')}</button>`}<button data-action="delete-result" data-id="${item.id}" aria-label="删除素材 ${label}">${svgIcon('trash')}</button></div><div class="result-tags">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
    }).join('')}</div></section>`;
  }).join('');
}

function setStudioProvider(provider) {
  if (!PROVIDERS[provider] || state.batch.status === 'generating') return;
  state.studio.provider = provider;
  if (!PROVIDERS[provider].profiles[state.studio.generationMode]) state.studio.generationMode = 'quality';
  state.studio.model = generationProfile(state.studio.generationMode, provider).code;
  saveState(); render(); $('#studio-provider')?.focus();
  showToast('生成通道已切换', `接下来将使用 ${providerConfig(provider).name}。`, 'check');
}

function setStudioQuality(mode) {
  if (!providerConfig().profiles[mode] || state.batch.status === 'generating') return;
  state.studio.generationMode = mode;
  state.studio.model = providerConfig().profiles[mode].code;
  saveState(); render(); $('#studio-quality')?.focus();
}

function renderStudioSettings(batchRunning) {
  const profile = generationProfile();
  return `<div class="studio-settings-row" role="group" aria-label="模型与成片质量"><div><label for="studio-provider">模型服务</label><select id="studio-provider" class="select-control" ${batchRunning ? 'disabled' : ''}>${Object.entries(PROVIDERS).map(([provider, item]) => `<option value="${provider}" ${state.studio.provider === provider ? 'selected' : ''}>${escapeHtml(item.shortName)}</option>`).join('')}</select></div><div><label for="studio-quality">成片质量</label><select id="studio-quality" class="select-control" title="${escapeHtml(`${profile.model} · ${profile.detail}`)}" ${batchRunning ? 'disabled' : ''}>${Object.entries(providerConfig().profiles).map(([mode, item]) => `<option value="${mode}" ${state.studio.generationMode === mode ? 'selected' : ''}>${escapeHtml(mode === 'wan' ? '万相一致性' : item.name)}</option>`).join('')}</select></div></div>`;
}

function renderFinalPromptSection(batchRunning) {
  const product = selectedProducts()[0];
  return `<section class="final-prompt-section" aria-labelledby="final-prompt-title">${product ? renderInlineFinalPrompt(batchRunning) : '<p class="final-prompt-empty">先选择参考产品，即可查看并确认最终提示词。</p>'}</section>`;
}

function renderStudio() {
  const total = plannedTotal();
  const progress = batchProgress();
  const batchActive = state.batch.results.length > 0;
  const batchRunning = state.batch.status === 'generating';
  const profile = batchActive ? batchGenerationProfile() : generationProfile();
  const activeProvider = batchActive ? (state.batch.provider || 'qwen') : state.studio.provider;
  const activeProviderConfig = providerConfig(activeProvider);
  const durationValue = batchActive ? `${elapsedMinutes(state.batch.startedAtMs, state.batch.finishedAtMs)} 分钟` : estimatedDuration(total);
  return `<section class="page page--batch"><div class="batch-layout"><div class="batch-main">
    <div class="batch-title"><div><h2>批量创作配方</h2><p>选择多张产品参考图与提示词组合，确认后按 SKU 批量生产素材。</p></div><span class="draft-badge">自动保存</span></div>
    ${renderStudioSettings(batchRunning)}
    <section class="workflow-section"><div class="workflow-heading"><span class="step-badge">1</span><div><h3>选择参考产品图</h3><p>可同时选择多个 SKU 的图片参与创作，生成过程不锁定产品规格。</p></div></div>${renderSelectedProducts()}</section>
    <section class="workflow-section"><div class="workflow-heading"><span class="step-badge">2</span><div><h3>选择提示词组合</h3><p>当地背景会生成地域环境线索；产品配色只改变帐篷面料。</p></div></div>${renderPublicPromptArea()}${renderPromptGroups()}<button class="add-group-button" data-action="open-prompt-library">${svgIcon('plus')}添加提示词组</button></section>
    <section class="other-requirements"><label for="studio-other-requirements">其他要求</label><textarea id="studio-other-requirements" maxlength="1200" rows="4" aria-describedby="other-requirements-help" placeholder="例如：帐篷上出现小恐龙与星星；孩子在入口旁阅读；保留当地地标，画面不要文字或水印。">${escapeHtml(state.studio.otherRequirements || '')}</textarea><p id="other-requirements-help">填写其他提示词、元素、构图或禁止项，会合并到每张图的总提示词，不增加生成数量。修改后需重新确认总提示词。</p></section>
    ${renderFinalPromptSection(batchRunning)}
    <div class="formula-bar"><div><span>本次生成计划</span><strong>${escapeHtml(formulaText())}</strong></div>${renderGenerationControls(false, batchRunning || generationStarting || !total || total > MAX_BATCH_SIZE)}</div>${total > MAX_BATCH_SIZE ? `<p class="inline-error">单批最多 ${MAX_BATCH_SIZE} 张，请减少产品或提示词组合。</p>` : ''}
  </div><aside class="run-panel" aria-label="生成计划与结果">
    <div class="run-panel-head"><div><h3>生成计划</h3><p>${batchActive ? `批次 ${escapeHtml(state.batch.id)} · ${activeProviderConfig.shortName} · ${profile.name}` : `${activeProviderConfig.shortName} · ${profile.model} · ${profile.name}`}</p></div>${batchActive ? statusChip(batchStatusLabel()) : ''}</div>
    <div class="estimate-grid"><div>${svgIcon('database')}<span><small>预计消耗</small><strong>${batchActive ? state.batch.results.length * CREDIT_PER_IMAGE : batchCost()} 积分</strong></span></div><div>${svgIcon('clock')}<span><small>${batchActive ? (batchRunning ? '已耗时' : '生成用时') : '预计耗时'}</small><strong>${durationValue}</strong></span></div></div>
    <div class="progress-block"><div class="progress-copy"><span>生成进度</span><strong>${batchActive ? `${batchSettledCount()} / ${state.batch.results.length}` : '尚未开始'}</strong></div><div class="progress-track"><span style="width:${progress}%"></span></div><ol class="progress-steps"><li class="${batchActive ? 'is-active' : ''}"><b>1</b>创建任务</li><li class="${progress > 0 ? 'is-active' : ''}"><b>2</b>生成素材</li><li class="${state.batch.status === 'ready' || state.batch.status === 'saved' ? 'is-active' : ''}"><b>3</b>确认保存</li></ol></div>
    ${batchActive || state.batchHistory.length ? renderBatchTools() : ''}<div class="result-scroll" aria-live="polite">${renderResultGroups()}</div>${batchActive ? `<div class="run-footer"><button class="button button--primary" data-action="save-batch" ${batchApprovedCount() ? '' : 'disabled'}>${svgIcon('folder')}${state.batch.status === 'saved' ? '已保存到产品库' : `保存 ${batchApprovedCount()} 张已验收素材`}</button><p>${activeProvider === 'qwen' ? '千问 / 万相结果链接仅保留 24 小时，请生成后及时下载；' : 'OpenAI 图片保存在当前浏览器，请及时下载备份；'}只有完成交付验收的图片会写回 SKU，并保留完整提示词和评分。</p></div>` : ''}
  </aside></div></section>`;
}

function renderHome() {
  return `<section class="page">${pageHeading('让每一张素材都有明确的产品归属', '从真实底图开始，组合词库、批量生成并把结果自动归档回 SKU。')}<div class="quick-start"><button class="quick-card" data-route="products"><span class="source-icon">${svgIcon('box')}</span><span><strong>进入产品库</strong><span>查看真实底图与产品素材历史</span></span></button><button class="quick-card" data-route="studio"><span class="source-icon">${svgIcon('layers')}</span><span><strong>建立批量配方</strong><span>选择多个产品和提示词组合</span></span></button><button class="quick-card" data-route="assets"><span class="source-icon">${svgIcon('image')}</span><span><strong>查看全部素材</strong><span>按 SKU 与标签管理二维图片</span></span></button></div><div class="home-grid"><article class="surface surface-pad"><div class="section-title"><div><h3>最近批次</h3><p>继续处理未保存的素材任务</p></div><button class="text-button" data-route="studio">进入创作</button></div><div class="recent-list">${state.projects.map((project) => `<div class="recent-row"><img src="${project.image}" alt="${escapeHtml(project.name)}"><div><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.type)}</span></div><span>${escapeHtml(project.updated)}</span></div>`).join('')}</div></article><article class="surface surface-pad"><div class="section-title"><div><h3>产品资产概况</h3><p>所有图片按 SKU 与标签归档</p></div></div><div class="metric-list"><div><span>产品 SKU</span><strong>${state.products.length}</strong></div><div><span>二维图片素材</span><strong>${state.savedAssets.length}</strong></div><div><span>可用积分</span><strong>${state.credits}</strong></div></div></article></div></section>`;
}

function renderTemplates() {
  return `<section class="page">${pageHeading('模板中心', '模板会真实切换公共场景、启用词组和输出规则，不改变产品参考图。')}<div class="card-grid">${state.templates.map((template) => { const active = state.studio.templateId === template.id; return `<article class="template-card ${active ? 'is-active' : ''}"><img src="${template.image}" alt="${escapeHtml(template.name)}示例"><div class="card-body"><h3>${escapeHtml(template.name)}</h3><p>${escapeHtml(template.description)}</p><div class="card-meta"><span class="tag">${escapeHtml(template.tag)} · ${template.fields} 项规则</span><button class="button ${active ? 'button--secondary' : 'button--quiet'}" data-action="use-template" data-id="${template.id}" aria-pressed="${active}">${active ? '当前模板' : '应用模板'}</button></div></div></article>`; }).join('')}</div></section>`;
}

function renderAssets() {
  const assets = state.savedAssets;
  return `<section class="page">${pageHeading('素材库', '所有文件以二维图片形式保存，并保留 SKU、组合标签与批次信息。')}<div class="asset-library-grid">${assets.length ? assets.map((asset) => { const product = productById(asset.productId); return `<article class="asset-card"><button class="image-preview-button" data-action="preview-asset" data-id="${asset.id}" aria-label="查看${escapeHtml(product?.name || '产品')}生成素材大图"><img src="${escapeHtml(asset.image)}" alt="${escapeHtml(product?.name || '产品')}生成素材"></button><div class="card-body"><h3>${escapeHtml(product?.sku || '未关联 SKU')}</h3><p>${asset.tags.map(escapeHtml).join(' · ')}</p><div class="card-meta"><span class="tag">${escapeHtml(asset.batchId)}</span><button class="button button--quiet" data-action="download-asset" data-image="${escapeHtml(asset.image)}" data-name="${escapeHtml(product?.sku || '设计素材')}">${svgIcon('download')}下载</button></div></div></article>`; }).join('') : '<div class="empty-state">还没有已保存素材，请先完成一个批量任务。</div>'}</div></section>`;
}

function exportTargets() {
  if (state.ui.exportScope === 'sku') return state.products.filter((product) => productAssets(product.id).length).map((product) => ({ value: product.id, label: `${product.sku} · ${product.name}` }));
  if (state.ui.exportScope === 'batch') return [...new Set(state.savedAssets.map((asset) => asset.batchId).filter(Boolean))].map((batchId) => ({ value: batchId, label: batchId }));
  return [];
}

function selectedExportAssets() {
  if (state.ui.exportScope === 'sku') return state.savedAssets.filter((asset) => asset.productId === state.ui.exportTarget);
  if (state.ui.exportScope === 'batch') return state.savedAssets.filter((asset) => asset.batchId === state.ui.exportTarget);
  return state.savedAssets;
}

function renderExports() {
  const targets = exportTargets();
  if (targets.length && !targets.some((target) => target.value === state.ui.exportTarget)) state.ui.exportTarget = targets[0].value;
  const assets = selectedExportAssets();
  return `<section class="page">${pageHeading('导出中心', '把已保存素材与提示词清单打包为真正可交付的 ZIP 文件。')}<div class="export-workspace"><section class="surface surface-pad export-config" aria-labelledby="export-config-title"><div class="section-title"><div><h3 id="export-config-title">建立导出包</h3><p>按全部素材、SKU 或批次筛选；压缩包会附带 manifest.json 追溯清单。</p></div></div><div class="export-form"><label>导出范围<select id="export-scope" class="select-control"><option value="all" ${state.ui.exportScope === 'all' ? 'selected' : ''}>全部已保存素材</option><option value="sku" ${state.ui.exportScope === 'sku' ? 'selected' : ''}>指定 SKU</option><option value="batch" ${state.ui.exportScope === 'batch' ? 'selected' : ''}>指定批次</option></select></label>${state.ui.exportScope === 'all' ? '' : `<label>${state.ui.exportScope === 'sku' ? '选择 SKU' : '选择批次'}<select id="export-target" class="select-control">${targets.map((target) => `<option value="${escapeHtml(target.value)}" ${target.value === state.ui.exportTarget ? 'selected' : ''}>${escapeHtml(target.label)}</option>`).join('')}</select></label>`}<label>图片格式<select id="export-format" class="select-control"><option value="original" ${state.ui.exportFormat === 'original' ? 'selected' : ''}>保留原格式（推荐）</option><option value="jpeg" ${state.ui.exportFormat === 'jpeg' ? 'selected' : ''}>统一 JPG</option><option value="png" ${state.ui.exportFormat === 'png' ? 'selected' : ''}>统一 PNG</option><option value="webp" ${state.ui.exportFormat === 'webp' ? 'selected' : ''}>统一 WebP</option></select></label></div><div class="export-summary"><div><strong>${assets.length}</strong><span>张素材将被打包</span></div><div><strong>${new Set(assets.map((asset) => asset.productId)).size}</strong><span>个 SKU</span></div><div><strong>${new Set(assets.map((asset) => asset.batchId)).size}</strong><span>个批次</span></div></div>${exportRuntime.error ? `<p class="field-error" role="alert">${escapeHtml(exportRuntime.error)}</p>` : ''}${exportRuntime.message ? `<p class="export-success" role="status">${escapeHtml(exportRuntime.message)}</p>` : ''}<button class="button button--primary export-submit" data-action="export-assets" ${exportRuntime.busy || !assets.length ? 'disabled' : ''}>${svgIcon('download')}${exportRuntime.busy ? '正在整理压缩包…' : `导出 ${assets.length} 张素材`}</button></section><aside class="surface surface-pad export-notes"><h3>压缩包内容</h3><ul><li>图片按 SKU 文件夹整理</li><li>文件名包含批次编号和序号</li><li>清单保留模型、提示词、标签与验收结果</li><li>格式转换在本地浏览器完成，不会调用模型或扣积分</li></ul><p>若临时模型图片地址已经失效，系统会停止导出并指出原因，不会生成缺文件的压缩包。</p></aside></div></section>`;
}

function renderConnections() {
  const providerCards = Object.entries(PROVIDERS).map(([provider, item]) => {
    const hasKey = Boolean(getProviderApiKey(provider));
    const authenticated = Boolean(state.connection.authenticated[provider]);
    const status = authenticated ? '密钥已验证 · 本标签页可用' : hasKey ? '已输入 · 等待验证' : '首次使用时输入密钥';
    const isActive = state.studio.provider === provider;
    return `<article class="connection-card ${isActive ? 'connection-card--primary' : ''}"><div class="connection-head"><span class="model-avatar ${provider === 'qwen' ? 'model-avatar--qwen' : 'model-avatar--openai'}">${item.avatar}</span><div><h3>${item.name}</h3><p>${escapeHtml(status)}</p></div></div><div class="connection-trust">${svgIcon('check')}仅保存于当前浏览器标签页 · 关闭后自动清除</div><div class="capability-list"><span class="tag">${item.profiles.fast.model}</span><span class="tag">${item.profiles.quality.model}</span><span class="tag">参考图生成</span></div><button class="button ${hasKey ? 'button--secondary' : 'button--primary'}" data-action="authorize-provider" data-provider="${provider}">${hasKey ? '更换或检查密钥' : `输入${item.shortName}密钥`}</button>${hasKey ? `<button class="button button--quiet connection-clear" data-action="clear-provider-key" data-provider="${provider}">清除本标签页密钥</button>` : ''}<button class="text-button connection-use" data-action="set-provider" data-provider="${provider}" ${isActive ? 'disabled' : ''}>${isActive ? '当前生成通道' : '设为生成通道'}</button><p class="connection-note">${provider === 'openai' ? '需要 OpenAI API 平台密钥；ChatGPT 网页会员不等于 API 授权。' : '图片按量计费；结果地址 24 小时有效，请及时下载。'}</p></article>`;
  }).join('');
  return `<section class="page">${pageHeading('模型连接', 'OpenAI 与千问都可直接连接；密钥仅在当前标签页临时使用。')}<div class="connection-grid connection-grid--models">${providerCards}<article class="connection-card"><div class="connection-head"><span class="model-avatar">临时</span><div><h3>密钥保存方式</h3><p>不写入项目与云端配置</p></div></div><div class="capability-list"><span class="tag">不进 GitHub</span><span class="tag">不存 Cloudflare Secret</span></div><p class="connection-copy">密钥只存在当前标签页的临时会话中，请求时经 HTTPS 交给无状态 Worker 转发到当前选择的模型服务。</p></article></div></section>`;
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

function renderStyleEditor(group) {
  return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-editor location-editor" role="dialog" aria-modal="true" aria-labelledby="style-editor-title"><div class="modal-header"><div><h2 id="style-editor-title">视觉风格</h2><p>按成片方向选择；每种风格统一规定光线、色彩、材质、构图和避免项。选中后自动展示提示词，可修改。多选会分别生成，不把不同风格混到一张图。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭视觉风格">${svgIcon('x')}</button></div><div class="option-editor-list">${group.options.map((option) => `<div class="location-option"><div class="option-editor ${option.selected ? 'is-selected' : ''}"><button class="option-toggle" data-action="toggle-prompt-option" data-group-id="${group.id}" data-id="${escapeHtml(option.id)}" aria-pressed="${option.selected}"><span class="option-check">${option.selected ? svgIcon('check') : ''}</span><span class="option-copy"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.description || '自定义风格')}</small></span></button><div class="quantity-control" aria-label="${escapeHtml(option.label)}数量"><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${escapeHtml(option.id)}" data-delta="-1" aria-label="减少${escapeHtml(option.label)}数量">−</button><span>×${option.quantity}</span><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${escapeHtml(option.id)}" data-delta="1" aria-label="增加${escapeHtml(option.label)}数量">＋</button></div></div><details class="location-rule style-rule" ${option.selected ? 'open' : ''}><summary>${escapeHtml(option.label)} · 对应提示词</summary><pre>${escapeHtml(option.prompt)}</pre><button class="button button--secondary" data-action="view-style-prompt" data-id="${escapeHtml(option.id)}">查看或修改提示词</button></details></div>`).join('')}</div><div class="new-option-form"><label for="new-option-label">新增自定义风格</label><div><input id="new-option-label" class="input-control" maxlength="40" placeholder="输入风格名称"><button class="button button--secondary" data-action="add-prompt-option" data-group-id="${group.id}">添加</button></div></div><div class="modal-actions"><span class="selection-count">已选 ${selectedOptions(group).length} 种风格 · ${groupFactor(group)} 个组合值</span><button class="button button--primary" data-action="finish-prompt-editor">完成</button></div></section></div>`;
}

function renderStylePreview() {
  const option = state.promptGroups.find((group) => group.id === 'group-style')?.options.find((item) => item.id === stylePreviewId);
  if (!option) return '';
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel region-reference style-reference" role="dialog" aria-modal="true" aria-labelledby="style-reference-title"><div class="modal-header"><div><h2 id="style-reference-title">${escapeHtml(option.label)} · 风格提示词</h2><p>${escapeHtml(option.description || '自定义视觉风格')}。确认保存后，本风格的规则会进入最终实际提示词。</p></div><button class="icon-button overlay-close" data-action="back-styles" aria-label="返回风格选择">${svgIcon('x')}</button></div><div class="location-rule"><label for="style-prompt-text">光线 / 色彩 / 材质 / 构图 / 避免项</label><textarea id="style-prompt-text" maxlength="1600" aria-describedby="style-prompt-help${stylePromptError ? ' style-prompt-error' : ''}" aria-invalid="${Boolean(stylePromptError)}">${escapeHtml(stylePromptDraft)}</textarea>${stylePromptError ? `<p id="style-prompt-error" class="field-error" role="alert">${escapeHtml(stylePromptError)}</p>` : ''}</div><p id="style-prompt-help" class="confirm-note">仅影响摄影视觉语言，不覆盖当地背景、产品配色或公共模板。保存后仍需在最终预览确认整批提示词；此处不调用生图或扣分。</p><div class="modal-actions"><button class="button button--secondary" data-action="back-styles">返回选择</button><button class="button button--primary" data-action="save-style-prompt">确认风格提示词</button></div></section></div>`;
}

function renderPromptDialog() {
  if (stylePreviewId) return renderStylePreview();
  if (regionPreviewId) return renderRegionPreview();
  const dialogId = state.ui.promptDialogGroupId;
  if (!dialogId) return '';
  if (dialogId === 'library') {
    return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-library" role="dialog" aria-modal="true" aria-labelledby="prompt-library-title"><div class="modal-header"><div><h2 id="prompt-library-title">添加提示词组</h2><p>选择一个词组加入当前配方，之后可继续编辑词条。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭词组库">${svgIcon('x')}</button></div><div class="library-group-list">${state.promptLibrary.map((group) => `<button data-action="add-library-group" data-id="${group.id}" ${state.promptGroups.some((item) => item.id === group.id) ? 'disabled' : ''}><span>${svgIcon('layers')}</span><span><strong>${escapeHtml(group.name)}</strong><small>${group.options.map((option) => escapeHtml(typeof option === 'string' ? option : option.label)).join('、')}</small></span>${state.promptGroups.some((item) => item.id === group.id) ? '<em>已添加</em>' : svgIcon('chevron')}</button>`).join('')}</div><div class="custom-group-form"><label for="custom-group-name">自定义词组名称</label><div><input id="custom-group-name" class="input-control" placeholder="例如：节日主题"><button class="button button--secondary" data-action="create-custom-group">创建词组</button></div></div></section></div>`;
  }
  const group = state.promptGroups.find((item) => item.id === dialogId);
  if (!group) return '';
  if (group.id === 'group-location') return renderLocationEditor(group);
  if (group.id === 'group-style') return renderStyleEditor(group);
  return `<div class="modal-backdrop dynamic-overlay" data-action="close-overlay"><section class="modal overlay-panel prompt-editor" role="dialog" aria-modal="true" aria-labelledby="prompt-editor-title"><div class="modal-header"><div><h2 id="prompt-editor-title">编辑“${escapeHtml(group.name)}”</h2><p>${group.id === 'group-location' ? '每个地点会自动加入可识别的当地环境线索，地标只作远景，不会抢产品主体。' : group.id === 'group-color' ? '配色只改变帐篷面料，不会给人物、背景或整张画面套色。' : group.id === 'group-shot' ? '三种景别按帐篷画面占比严格区分；可同时勾选，批量生成明显不同的构图。' : '勾选词条并设置数量；数量会参与最终组合计算。'}</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭词组编辑">${svgIcon('x')}</button></div><div class="option-editor-list">${group.options.map((option) => `<div class="option-editor ${option.selected ? 'is-selected' : ''}"><button class="option-toggle" data-action="toggle-prompt-option" data-group-id="${group.id}" data-id="${option.id}" aria-pressed="${option.selected}"><span class="option-check">${option.selected ? svgIcon('check') : ''}</span><span class="option-copy"><strong>${escapeHtml(option.label)}</strong>${option.description ? `<small>${escapeHtml(option.description)}</small>` : ''}</span></button><div class="quantity-control" aria-label="${escapeHtml(option.label)}数量"><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="-1" aria-label="减少${escapeHtml(option.label)}数量">−</button><span>×${option.quantity}</span><button data-action="change-option-quantity" data-group-id="${group.id}" data-id="${option.id}" data-delta="1" aria-label="增加${escapeHtml(option.label)}数量">＋</button></div></div>`).join('')}</div><div class="new-option-form"><label for="new-option-label">新增词条</label><div><input id="new-option-label" class="input-control" placeholder="输入新的提示词选项"><button class="button button--secondary" data-action="add-prompt-option" data-group-id="${group.id}">添加</button></div></div><div class="modal-actions"><span class="selection-count">当前 ${groupFactor(group)} 个组合值</span><button class="button button--primary" data-action="finish-prompt-editor">完成</button></div></section></div>`;
}

function renderRegionPreview() {
  const option = state.promptGroups.find((group) => group.id === 'group-location')?.options.find((item) => item.id === regionPreviewId);
  if (!option) return '';
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel region-reference" role="dialog" aria-modal="true" aria-labelledby="region-reference-title"><div class="modal-header"><div><h2 id="region-reference-title">${escapeHtml(option.label)} · 背景提示词</h2><p>地标、建筑与景观线索供参考，可直接修改。最终预览会包含当前配方对应地区的这些内容。</p></div><button class="icon-button overlay-close" data-action="back-regions" aria-label="返回地区选择">${svgIcon('x')}</button></div><div class="location-rule"><label for="region-${escapeHtml(option.id)}">地区地标与背景规则</label><textarea id="region-${escapeHtml(option.id)}" data-region-prompt="${escapeHtml(option.id)}" maxlength="1600">${escapeHtml(option.prompt || option.label)}</textarea></div><p class="confirm-note">${option.description?.includes('AI') ? 'AI 推荐未经联网核验。' : '内置地区参考规则。'}白底模板不使用城市背景；其他模板按各自场景要求选择地标或住宅线索。</p><div class="modal-actions"><button class="button button--primary" data-action="back-regions">确认地区提示词</button></div></section></div>`;
}

function reviewFingerprint(forComparison = comparisonRequested) {
  return Core.reviewFingerprint(state, forComparison, Object.keys(providerConfig().profiles).length);
}

function hasConfirmedPromptReview(forComparison = false) {
  return confirmedPromptReviews[forComparison ? 'comparison' : 'batch']?.fingerprint === reviewFingerprint(forComparison);
}

function promptConfirmationText(forComparison = false) {
  return hasConfirmedPromptReview(forComparison) ? '最终提示词已确认，可以生成；修改后需重新确认。' : '请先在上方确认最终提示词，再生成素材。';
}

function renderGenerationControls(forComparison, blocked) {
  const mode = forComparison ? 'comparison' : 'batch';
  return `<div class="generation-controls"><p data-confirmation-status="${mode}" role="status">${promptConfirmationText(forComparison)}</p><div class="generation-control-actions"><button class="button button--primary" data-action="generate-${mode}" ${blocked || !hasConfirmedPromptReview(forComparison) ? 'disabled' : ''}>${svgIcon('sparkles')}${forComparison ? '生成对比图' : '生成素材'}</button></div></div>`;
}

function syncPromptConfirmationControls() {
  for (const mode of ['batch', 'comparison']) {
    const comparison = mode === 'comparison';
    const button = document.querySelector(`[data-action="generate-${mode}"]`);
    if (button) button.disabled = generationStarting || state.batch.status === 'generating' || !selectedProducts().length || (!comparison && (!plannedTotal() || plannedTotal() > MAX_BATCH_SIZE)) || !hasConfirmedPromptReview(comparison);
    const status = document.querySelector(`[data-confirmation-status="${mode}"]`);
    if (status) status.textContent = promptConfirmationText(comparison);
  }
  const inlineStatus = document.querySelector('[data-inline-prompt-status]');
  if (inlineStatus) inlineStatus.textContent = promptConfirmationText(false);
  const inlineBadge = document.querySelector('[data-inline-prompt-badge]');
  if (inlineBadge) { inlineBadge.textContent = hasConfirmedPromptReview(false) ? '已确认' : '待确认'; inlineBadge.classList.toggle('is-confirmed', hasConfirmedPromptReview(false)); }
  const inlineButton = document.querySelector('[data-action="confirm-inline-prompts"]');
  if (inlineButton) inlineButton.disabled = generationStarting || state.batch.status === 'generating' || !promptReview?.entries.length;
}

function validatePromptReview(inline = false) {
  const invalidIndex = promptReview.entries.findIndex((entry) => !entry.prompt.trim() || entry.prompt.length > promptReviewLimit());
  if (invalidIndex < 0) return promptReview.entries.length > 0;
  promptReviewIndex = invalidIndex; promptReviewEditing = !inline; promptReviewDraft = promptReview.entries[invalidIndex].prompt;
  promptReviewError = promptReview.entries[invalidIndex].prompt.trim() ? `当前模型提示词上限为 ${promptReviewLimit()} 字，请精简后确认；尚未提交或扣分。` : '最终提示词不能为空，请填写后再确认。';
  if (!inline) state.ui.confirmBatch = true;
  render(); $('#final-prompt-text')?.focus(); return false;
}

function confirmCurrentPromptReview(inline = false) {
  if ((!inline && promptReviewEditing) || !promptReview) return;
  if (promptReview.fingerprint !== reviewFingerprint()) { preparePromptReview(); render(); showToast('选项已变更', '请重新检查并确认提示词。'); return; }
  if (!validatePromptReview(inline)) return;
  confirmedPromptReviews[comparisonRequested ? 'comparison' : 'batch'] = structuredClone(promptReview);
  if (inline) { promptReviewError = ''; render(); requestAnimationFrame(() => $('[data-action="generate-batch"]')?.focus()); }
  else closeOverlay();
  showToast('最终提示词已确认', '未调用生图或扣分，现在可以在最下方点击生成素材。');
}

function promptReviewLimit() { return state.studio.provider === 'qwen' && (state.studio.generationMode === 'wan' || comparisonRequested) ? 2000 : 6000; }

function preparePromptReview() {
  const combos = comparisonRequested ? buildCombinations().slice(0, 1) : buildCombinations();
  const products = comparisonRequested ? selectedProducts().slice(0, 1) : selectedProducts();
  promptReview = hasConfirmedPromptReview(comparisonRequested) ? structuredClone(confirmedPromptReviews[comparisonRequested ? 'comparison' : 'batch']) : { fingerprint: reviewFingerprint(), entries: products.flatMap((product) => combos.map((combo, comboIndex) => ({ key: `${product.id}:${comboIndex}`, label: `${product.sku} · ${combo.tags.join(' / ') || '默认配方'}`, prompt: generationPrompt(product, combo.tags, combo.promptDetails, combo.ratio) }))) };
  promptReviewIndex = 0; promptReviewEditing = false; promptReviewDraft = ''; promptReviewError = '';
}

function ensureInlinePromptReview() {
  const previousComparison = comparisonRequested;
  comparisonRequested = false;
  if (!promptReview || promptReview.fingerprint !== reviewFingerprint(false)) preparePromptReview();
  promptReviewIndex = Math.max(0, Math.min(promptReviewIndex, Math.max(0, promptReview.entries.length - 1)));
  comparisonRequested = previousComparison;
}

function refreshInlinePromptReview() {
  const previousIndex = promptReviewIndex;
  const previousComparison = comparisonRequested;
  comparisonRequested = false;
  confirmedPromptReviews.batch = null;
  preparePromptReview();
  promptReviewIndex = Math.max(0, Math.min(previousIndex, Math.max(0, promptReview.entries.length - 1)));
  comparisonRequested = previousComparison;
  const entry = promptReview.entries[promptReviewIndex];
  const textarea = $('#final-prompt-text');
  if (textarea && entry) textarea.value = entry.prompt;
  const recipe = $('.review-current-recipe');
  if (recipe && entry) recipe.textContent = entry.label;
  syncPromptConfirmationControls();
}

function renderInlineFinalPrompt(batchRunning) {
  ensureInlinePromptReview();
  const entry = promptReview.entries[promptReviewIndex];
  if (!entry) return '<p class="final-prompt-empty">当前没有可确认的提示词配方。</p>';
  const confirmed = hasConfirmedPromptReview(false);
  return `<div class="inline-final-prompt"><div class="final-prompt-heading"><div><h4 id="final-prompt-title">最终提示词</h4><p>汇总上方所有选项和要求。可切换检查每个产品与配方，并直接修改最终内容。</p></div><span class="final-prompt-badge ${confirmed ? 'is-confirmed' : ''}" data-inline-prompt-badge>${confirmed ? '已确认' : '待确认'}</span></div><label for="prompt-review-entry">当前配方</label><select id="prompt-review-entry" class="select-control" ${batchRunning ? 'disabled' : ''}>${promptReview.entries.map((item, index) => `<option value="${index}" ${index === promptReviewIndex ? 'selected' : ''}>${index + 1}. ${escapeHtml(item.label)}</option>`).join('')}</select><p class="review-current-recipe">${escapeHtml(entry.label)}</p><label for="final-prompt-text">最终提示词 · 可直接修改</label><textarea id="final-prompt-text" maxlength="${Math.max(promptReviewLimit(), entry.prompt.length)}" aria-describedby="prompt-review-help${promptReviewError ? ' prompt-review-error' : ''}" aria-invalid="${promptReviewError ? 'true' : 'false'}" ${batchRunning ? 'disabled' : ''}>${escapeHtml(entry.prompt)}</textarea>${promptReviewError ? `<p id="prompt-review-error" class="field-error" role="alert">${escapeHtml(promptReviewError)}</p>` : ''}<p id="prompt-review-help">修改只作用于当前配方；切换后可逐一检查。确认不会调用生图或扣分，当前模型上限为 ${promptReviewLimit()} 字。</p><div class="inline-prompt-confirm"><p data-inline-prompt-status role="status">${promptConfirmationText(false)}</p><button class="button button--primary" data-action="confirm-inline-prompts" ${batchRunning || generationStarting ? 'disabled' : ''}>${svgIcon('check')}确认最终提示词</button></div></div>`;
}

function reviewedPrompt(product, combo, comboIndex) {
  const entry = promptReview?.fingerprint === reviewFingerprint() ? promptReview.entries.find((item) => item.key === `${product.id}:${comboIndex}`) : null;
  return entry?.prompt || generationPrompt(product, combo.tags, combo.promptDetails, combo.ratio);
}

function renderPromptReview() {
  if (!promptReview || promptReview.fingerprint !== reviewFingerprint()) preparePromptReview();
  const entry = promptReview.entries[promptReviewIndex];
  if (!entry) return '';
  return `<div class="final-prompt-review"><h3>预览首张图的实际提示词</h3><p>总提示词汇总参考产品、公共模板、当前配方的当地背景、产品配色、画布尺寸、镜头景别、视觉风格、其他要求及真实摄影标准。默认显示首张图，可切换检查其他配方；修改仅作用于当前配方，同配方模型对比共用修改后的提示词。</p><label for="prompt-review-entry">当前预览配方</label><select id="prompt-review-entry" class="select-control" ${promptReviewEditing ? 'disabled' : ''}>${promptReview.entries.map((item, index) => `<option value="${index}" ${index === promptReviewIndex ? 'selected' : ''}>${index + 1}. ${escapeHtml(item.label)}</option>`).join('')}</select><p class="review-current-recipe">${escapeHtml(entry.label)}</p>${promptReviewEditing ? `<label for="final-prompt-text">修改实际提示词</label><textarea id="final-prompt-text" maxlength="${Math.max(promptReviewLimit(), promptReviewDraft.length)}" aria-describedby="prompt-review-help${promptReviewError ? ' prompt-review-error' : ''}">${escapeHtml(promptReviewDraft)}</textarea>${promptReviewError ? `<p id="prompt-review-error" class="field-error" role="alert">${escapeHtml(promptReviewError)}</p>` : ''}<div class="public-prompt-actions"><button class="button button--primary" data-action="save-reviewed-prompt">保存修改</button><button class="button button--secondary" data-action="cancel-reviewed-prompt">取消修改</button></div>` : `<pre>${escapeHtml(entry.prompt)}</pre><button class="button button--secondary" data-action="edit-reviewed-prompt">${svgIcon('edit')}修改</button>`}<p id="prompt-review-help">检查与修改不调用生图接口；保存并确认后，才可在工作台点击生成，当前模型上限为 ${promptReviewLimit()} 字。返回修改上方选项后，会重新整理整批提示词。</p></div>`;
}

function renderConfirmDialog() {
  if (!state.ui.confirmBatch) return '';
  const total = plannedTotal();
  const profile = comparisonRequested ? { name: '同配方模型配置对比', model: Object.values(providerConfig().profiles).map((item) => item.model).join(' / ') } : generationProfile();
  const provider = providerConfig();
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">确认提示词 · ${provider.shortName} / ${total} 张素材</h2><p>${comparisonRequested ? '只取首个 SKU 和首个提示词组合，每个模型配置生成一张，结果记录具体型号。' : '系统会以每个 SKU 的产品图为参考，按提示词组合创建真实付费任务。'}本次仅确认提示词，不调用生图、不扣分。确认后返回工作台点击生成，首次生成时再输入对应密钥。</p>${renderPromptReview()}<details class="generation-summary" open><summary>生成计划与费用 · ${total} 张 / ${batchCost()} 积分</summary><div class="confirm-summary"><div><span>通道</span><strong>${provider.name}</strong></div><div><span>模式</span><strong>${profile.name}</strong></div><div><span>模型</span><strong>${escapeHtml(profile.model)}</strong></div><div><span>产品</span><strong>${(comparisonRequested ? selectedProducts().slice(0, 1) : selectedProducts()).map((product) => escapeHtml(product.sku)).join('、')}</strong></div><div><span>组合公式</span><strong>${escapeHtml(formulaText())}</strong></div><div><span>平台积分</span><strong>${batchCost()} 积分</strong></div><div><span>模型计费</span><strong>由对应 API 平台按实际请求结算</strong></div><div><span>预计耗时</span><strong>${estimatedDuration(total)}</strong></div></div></details><p class="confirm-note">实际耗时受模型服务实时负载影响；同配方对比包含模型、质量和扩写配置差异，不等同于仅替换模型的严格实验。</p><div class="modal-actions"><button class="button button--secondary" data-action="close-overlay">返回修改</button><button class="button button--primary" data-action="confirm-prompts" ${generationStarting || promptReviewEditing ? 'disabled' : ''}>${svgIcon('check')}确认提示词</button></div></section></div>`;
}

function renderApiKeyDialog() {
  if (!keyDialogOpen) return '';
  const provider = providerConfig(keyDialogProvider);
  return `<div class="modal-backdrop dynamic-overlay"><section class="modal overlay-panel key-dialog" role="dialog" aria-modal="true" aria-labelledby="key-dialog-title" aria-describedby="key-dialog-help"><div class="modal-header"><div><h2 id="key-dialog-title">输入${provider.keyLabel}</h2><p id="key-dialog-help">支持 sk- 开头的完整密钥，仅用于当前浏览器标签页。</p></div><button class="icon-button overlay-close" data-action="close-overlay" aria-label="关闭密钥输入窗口">${svgIcon('x')}</button></div><label class="key-field" for="provider-api-key"><span>API Key</span><input id="provider-api-key" class="input-control" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="粘贴完整的 sk- 开头密钥" value="${escapeHtml(getProviderApiKey(keyDialogProvider))}"></label>${keyDialogError ? `<p class="field-error" role="alert">${escapeHtml(keyDialogError)}</p>` : ''}<div class="key-privacy">${svgIcon('check')}不会写入 GitHub、Cloudflare Secret 或应用长期状态；关闭标签页后自动清除。</div>${keyDialogProvider === 'openai' ? '<p class="key-help">请使用 OpenAI API 平台创建的密钥；ChatGPT 登录或会员本身不能作为 API Key。</p>' : ''}<div class="modal-actions"><button class="button button--secondary" data-action="close-overlay">取消</button><button class="button button--primary" data-action="save-provider-key">验证并使用</button></div></section></div>`;
}

function renderImagePreview() {
  if (!imagePreview) return '';
  return `<div class="image-preview-backdrop" data-action="close-image-preview"><section class="image-preview-panel overlay-panel" role="dialog" aria-modal="true" aria-labelledby="image-preview-title"><header><div><h2 id="image-preview-title">${escapeHtml(imagePreview.title)}</h2><p>${escapeHtml(imagePreview.meta)}</p></div><div class="image-preview-actions"><button class="button button--secondary" data-action="download-preview">${svgIcon('download')}下载原图</button><button class="icon-button overlay-close" data-action="close-image-preview" aria-label="关闭大图预览">${svgIcon('x')}</button></div></header><div class="image-preview-stage"><img src="${escapeHtml(imagePreview.image)}" alt="${escapeHtml(imagePreview.title)}大图"></div><p class="image-preview-hint">点击遮罩空白处或按 Esc 关闭</p></section></div>`;
}

function renderOverlays() {
  const root = $('#overlay-root');
  root.innerHTML = renderImagePreview() || renderApiKeyDialog() || renderProductDrawer() || renderProductPicker() || renderPromptDialog() || renderConfirmDialog();
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
  regionPreviewId = ''; stylePreviewId = ''; stylePromptDraft = ''; stylePromptError = '';
  comparisonRequested = false;
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
  return Core.buildCombinations(state);
}

function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

async function apiJson(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (path.startsWith('/api/qwen/')) {
    const apiKey = getProviderApiKey('qwen');
    if (!apiKey) {
      const error = new Error('请先输入千问 API Key。');
      error.code = 'KEY_REQUIRED';
      throw error;
    }
    headers.set('X-Qwen-Api-Key', apiKey);
  }
  if (path.startsWith('/api/openai/')) {
    const apiKey = getProviderApiKey('openai');
    if (!apiKey) {
      const error = new Error('请先输入 OpenAI API Key。');
      error.code = 'KEY_REQUIRED';
      throw error;
    }
    headers.set('X-OpenAI-Api-Key', apiKey);
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

async function checkProviderAuthorization(provider = state.studio.provider, showFailure = true) {
  if (!getProviderApiKey(provider)) return false;
  try {
    const session = await apiJson(`/api/${provider}/validate`, { method: 'POST' });
    state.connection.authenticated[provider] = Boolean(session.valid);
    saveState(); render();
    return state.connection.authenticated[provider];
  } catch (error) {
    state.connection.authenticated[provider] = false;
    if (error.code === 'KEY_REQUIRED' || error.code === 'KEY_INVALID') clearProviderApiKey(provider);
    saveState(); render();
    if (showFailure) showToast('密钥验证失败', error.message, 'info');
    return false;
  }
}

function openApiKeyDialog(provider = state.studio.provider, action = '') {
  rememberFocus();
  keyDialogProvider = provider;
  pendingKeyAction = action;
  keyDialogError = '';
  keyDialogOpen = true;
  render();
  requestAnimationFrame(() => $('#provider-api-key')?.focus());
}

function generationPrompt(product, tags, promptDetails = [], ratio = state.studio.ratio) {
  return Core.compilePrompt(state, product, tags, promptDetails, ratio);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('无法读取参考产品图，请重新上传后再试。'));
    reader.readAsDataURL(blob);
  });
}

async function referenceImageForModel(product) {
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
  const product = result.productSnapshot || productById(result.productId);
  if (!product) throw new Error('找不到对应产品。');
  const referenceImage = await referenceImageForModel(product);
  result.requestId ||= uid('request');
  const task = await apiJson('/api/qwen/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Request-Id': result.requestId },
    body: JSON.stringify({ requestId: result.requestId, prompt: result.prompt || generationPrompt(product, result.tags, result.promptDetails, result.ratio), referenceImages: [referenceImage], ratio: result.ratio || state.studio.ratio, generationMode: result.generationMode || state.studio.generationMode }),
  });
  result.taskId = task.taskId;
  result.model = task.model;
  result.status = 'loading';
  result.submittedAt = Date.now();
  result.remoteStatus = task.taskStatus || 'PENDING';
  result.error = '';
}

async function submitOpenAiResult(result) {
  const product = result.productSnapshot || productById(result.productId);
  if (!product) throw new Error('找不到对应产品。');
  const referenceImage = await referenceImageForModel(product);
  result.status = 'loading';
  result.submittedAt = Date.now();
  result.remoteStatus = 'RUNNING';
  saveState(); render();
  result.requestId ||= uid('request');
  const output = await apiJson('/api/openai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Request-Id': result.requestId },
    body: JSON.stringify({ requestId: result.requestId, prompt: result.prompt || generationPrompt(product, result.tags, result.promptDetails, result.ratio), referenceImages: [referenceImage], ratio: result.ratio || state.studio.ratio, generationMode: result.generationMode || state.studio.generationMode }),
  });
  result.image = output.imageUrl;
  result.model = output.model;
  result.status = 'ready';
  result.completedAt = Date.now();
  result.remoteStatus = 'SUCCEEDED';
  result.error = '';
}

async function submitQwenBatch(results, batchId) {
  const profile = generationProfile(state.batch.generationMode, 'qwen');
  for (let offset = 0; offset < results.length && activeGenerationId === batchId; offset += profile.submitLimit) {
    if (offset > 0) {
      state.batch.nextSubmissionAt = Date.now() + 60000;
      saveState(); render();
      await sleep(60000);
    }
    state.batch.nextSubmissionAt = 0;
    const windowItems = results.slice(offset, offset + profile.submitLimit);
    await runWithConcurrency(windowItems, Math.min(profile.concurrency, windowItems.length), submitQwenResult);
  }
}

async function submitOpenAiBatch(results, batchId) {
  const profile = generationProfile(state.batch.generationMode, 'openai');
  for (let offset = 0; offset < results.length && activeGenerationId === batchId; offset += profile.submitLimit) {
    if (offset > 0) {
      state.batch.nextSubmissionAt = Date.now() + 60000;
      saveState(); render();
      await sleep(60000);
    }
    state.batch.nextSubmissionAt = 0;
    const windowItems = results.slice(offset, offset + profile.submitLimit);
    await runWithConcurrency(windowItems, Math.min(profile.concurrency, windowItems.length), submitOpenAiResult);
  }
  finishBatch(batchId);
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
        refundResultCredit(item);
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
        refundResultCredit(item);
      } else if (Date.now() - item.submittedAt >= QWEN_TASK_TIMEOUT_MS) {
        item.status = 'delayed';
        item.error = '已等待 10 分钟，原任务仍被保留。点击“查询结果”继续查看，不会重复提交或扣分。';
      }
    });
    if (activeGenerationId !== batchId) break;
    if (state.batch.results.some((item) => item.status === 'loading')) await sleep(QWEN_POLL_INTERVAL);
  }
  finishBatch(batchId);
}

function finishBatch(batchId) {
  if (state.batch.id !== batchId) return;
  activeGenerationId = '';
  state.batch.finishedAtMs = Date.now();
  state.batch.status = batchDelayedCount() ? 'delayed' : batchReadyCount() ? 'ready' : 'failed';
  saveState(); render();
  const provider = providerConfig(state.batch.provider || 'qwen');
  if (batchDelayedCount()) showToast('千问任务等待时间较长', `${batchDelayedCount()} 张保留了原任务，可点击“查询结果”，不会重复扣分。`, 'info');
  else if (batchReadyCount()) showToast('批量生成完成', `${provider.shortName} 已生成 ${batchReadyCount()} 张素材${batchFailedCount() ? `，${batchFailedCount()} 张可重试` : ''}。请及时下载。`, 'sparkles');
  else showToast('本批次未生成图片', '请查看失败原因并逐张重试。', 'info');
}

async function startBatchGeneration() {
  if (generationStarting || promptReviewEditing || state.batch.status === 'generating' || activeGenerationId) return;
  const requestedComparison = comparisonRequested;
  if (!hasConfirmedPromptReview(requestedComparison)) { syncPromptConfirmationControls(); showToast('请先确认最终提示词', '请在上方“最终提示词”区域检查并确认后再生成。'); return; }
  const approvedReview = confirmedPromptReviews[requestedComparison ? 'comparison' : 'batch'];
  promptReview = structuredClone(approvedReview);
  if (!validatePromptReview()) return;
  generationStarting = true;
  try {
  const total = plannedTotal();
  if (!total || total > MAX_BATCH_SIZE) return;
  const cost = batchCost();
  if (state.credits < cost) { closeOverlay(); showToast('积分不足', `本次需要 ${cost} 积分，请减少组合数量。`, 'database'); return; }
  const provider = state.studio.provider;
  if (!getProviderApiKey(provider)) { openApiKeyDialog(provider, 'generate'); return; }
  const authorized = await checkProviderAuthorization(provider, false);
  if (!authorized) { openApiKeyDialog(provider, 'generate'); keyDialogError = '密钥无效、无模型权限或 API 额度不可用，请检查后重新输入。'; render(); return; }
  if (comparisonRequested !== requestedComparison || confirmedPromptReviews[requestedComparison ? 'comparison' : 'batch'] !== approvedReview || !hasConfirmedPromptReview(requestedComparison) || approvedReview.fingerprint !== reviewFingerprint(requestedComparison)) {
    syncPromptConfirmationControls(); showToast('选项已变更', '请重新确认提示词，尚未提交或扣分。'); return;
  }
  promptReview = structuredClone(approvedReview);
  const isComparison = requestedComparison;
  const combinations = isComparison ? buildCombinations().slice(0, 1) : buildCombinations();
  const generationMode = providerConfig(provider).profiles[state.studio.generationMode] ? state.studio.generationMode : 'fast';
  const products = isComparison ? selectedProducts().slice(0, 1) : selectedProducts();
  const modes = isComparison ? Object.keys(providerConfig(provider).profiles) : [generationMode];
  const results = products.flatMap((product, productIndex) => combinations.flatMap((combo, comboIndex) => modes.map((mode) => ({ id: uid(`result-${productIndex}-${comboIndex}`), requestId: uid('request'), productId: product.id, productSnapshot: structuredClone(product), prompt: reviewedPrompt(product, combo, comboIndex), ratio: combo.ratio || state.studio.ratio, image: '', tags: isComparison ? [...combo.tags, `模型：${providerConfig(provider).profiles[mode].model}`] : combo.tags, promptDetails: combo.promptDetails, provider, generationMode: mode, model: providerConfig(provider).profiles[mode].code, evaluation: Core.emptyEvaluation(), review: 'pending', status: 'queued', taskId: '', submittedAt: 0, remoteStatus: '', error: '', saved: false, creditRefunded: false }))));
  if (state.batch.results.length) state.batchHistory.unshift(structuredClone(state.batch));
  confirmedPromptReviews[isComparison ? 'comparison' : 'batch'] = null;
  comparisonRequested = false;
  state.credits -= cost;
  state.batch = { id: `B-${Date.now()}`, status: 'generating', comparison: isComparison, provider, generationMode, results, plannedTotal: total, startedAt: nowLabel(), startedAtMs: Date.now(), finishedAtMs: 0, nextSubmissionAt: 0, savedAt: '' };
  activeGenerationId = state.batch.id;
  state.ui.confirmBatch = false;
  saveState(); render();
  if (provider === 'openai') await submitOpenAiBatch(results, state.batch.id);
  else {
    await submitQwenBatch(results, state.batch.id);
    if (activeGenerationId === state.batch.id) await pollQwenBatch(state.batch.id);
  }
  } finally { generationStarting = false; syncPromptConfirmationControls(); }
}

async function regenerateResult(id) {
  if (activeGenerationId || state.batch.status === 'generating') return;
  const item = state.batch.results.find((result) => result.id === id);
  if (!item || item.status === 'loading' || item.status === 'queued') return;
  if (state.credits < CREDIT_PER_IMAGE) { showToast('积分不足', '无法重新生成当前素材。', 'database'); return; }
  const provider = state.studio.provider;
  if (!getProviderApiKey(provider)) { openApiKeyDialog(provider, `regenerate:${id}`); return; }
  const authorized = await checkProviderAuthorization(provider, false);
  if (!authorized) { openApiKeyDialog(provider, `regenerate:${id}`); keyDialogError = '密钥无效、无模型权限或 API 额度不可用，请检查后重新输入。'; render(); return; }
  state.credits -= CREDIT_PER_IMAGE;
  item.previousAttempts ||= [];
  item.previousAttempts.push({ prompt: item.prompt, model: item.model, review: item.review, error: item.error });
  item.provider = provider; item.generationMode = state.studio.generationMode; item.status = 'queued'; item.taskId = ''; item.requestId = uid('request'); item.error = ''; item.saved = false; item.review = 'pending'; item.evaluation = Core.emptyEvaluation(); item.creditRefunded = false;
  item.prompt ||= generationPrompt(item.productSnapshot || productById(item.productId), item.tags.filter((tag) => !tag.startsWith('模型：')), item.promptDetails, item.ratio);
  state.batch.provider = provider;
  activeGenerationId = state.batch.id;
  saveState(); render();
  try {
    if (provider === 'openai') {
      await submitOpenAiResult(item);
      finishBatch(state.batch.id);
    } else {
      await submitQwenResult(item);
      await pollQwenBatch(state.batch.id);
    }
    if (item.status === 'ready') showToast('单张素材已更新', '其他结果保持不变，请及时下载。', 'refresh');
  } catch (error) {
    activeGenerationId = '';
    item.status = 'failed'; item.error = error.message;
    refundResultCredit(item);
    saveState(); render(); showToast('重新生成失败', error.message, 'info');
  }
}

async function checkExistingResult(id) {
  const item = state.batch.results.find((result) => result.id === id);
  if (!item?.taskId || item.status === 'loading' || item.status === 'queued') return;
  if (!getProviderApiKey('qwen')) { openApiKeyDialog('qwen', `check-result:${id}`); return; }
  const authorized = await checkProviderAuthorization('qwen', false);
  if (!authorized) { openApiKeyDialog('qwen', `check-result:${id}`); keyDialogError = '请输入原任务使用的有效千问密钥。'; render(); return; }
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
  const interrupted = state.batch.results.filter((item) => ['queued', 'loading'].includes(item.status) && !item.taskId);
  interrupted.forEach((item) => { item.status = 'failed'; item.error = '页面在请求期间中断，未取得可查询任务编号。原请求可能已计费；请先检查平台记录，再决定是否重新生成。'; });
  const pending = state.batch.results.filter((item) => item.status === 'loading' && item.taskId);
  if (!pending.length) {
    state.batch.finishedAtMs ||= Date.now();
    state.batch.status = batchReadyCount() ? 'ready' : 'failed';
    saveState(); render();
    return;
  }
  if ((state.batch.provider || 'qwen') !== 'qwen') {
    pending.forEach((item) => { item.status = 'failed'; item.error = 'OpenAI 同步请求已因页面关闭而中断，请重新生成此图片。'; });
    state.batch.finishedAtMs ||= Date.now();
    state.batch.status = batchReadyCount() ? 'ready' : 'failed';
    saveState(); render();
    return;
  }
  if (!getProviderApiKey('qwen')) { openApiKeyDialog('qwen', 'resume'); return; }
  const authorized = await checkProviderAuthorization('qwen', false);
  if (!authorized) { openApiKeyDialog('qwen', 'resume'); keyDialogError = '请输入原任务使用的有效密钥以继续查询，不会创建新任务。'; render(); return; }
  activeGenerationId = state.batch.id;
  pending.forEach((item) => { item.submittedAt ||= Date.now(); });
  await pollQwenBatch(state.batch.id);
}

function saveBatch() {
  if (activeGenerationId || state.batch.status === 'generating') { showToast('批次仍在生成', '请等本批次结束后归档，已完成的单张图片可先下载。', 'info'); return; }
  const unsaved = state.batch.results.filter((item) => item.status === 'ready' && item.review === 'pass' && !item.saved);
  if (!unsaved.length) { showToast('没有可保存的素材', '请先展开“交付验收”，完成结构、地域、景别、缺陷和交付检查。', 'info'); return; }
  unsaved.forEach((result) => { state.savedAssets.unshift({ id: uid('asset'), productId: result.productId, image: result.image, tags: result.tags.map((tag) => tag.split('：')[1] || tag), prompt: result.prompt, model: result.model, evaluation: structuredClone(result.evaluation), review: result.review, demo: false, batchId: state.batch.id, createdAt: '刚刚' }); result.saved = true; });
  new Set(unsaved.map((item) => item.productId)).forEach((productId) => { const product = productById(productId); if (product) { product.references = productAssets(productId).length; product.versions += 1; product.status = '已有素材'; product.updated = '刚刚'; } });
  state.batch.status = state.batch.results.some((item) => item.status === 'ready' && !item.saved) ? 'ready' : 'saved'; state.batch.savedAt = nowLabel();
  state.projects.unshift({ id: uid('project'), name: `${new Set(state.batch.results.map((item) => item.productId)).size} 个 SKU 批量素材`, type: '批量创作', image: state.batch.results.find((item) => item.status === 'ready')?.image || RESULT_IMAGES[0], updated: '刚刚' });
  saveState(); render(); showToast('素材已归档', `${unsaved.length} 张图片已回写到对应 SKU。`, 'folder');
}

function upscaleImageTo4K(source, ratio = '4:3') {
  const [width, height] = FOUR_K_DIMENSIONS[ratio] || FOUR_K_DIMENSIONS['4:3'];
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!source.startsWith('data:image/')) image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('当前浏览器无法创建高清画布。');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('4K 尺寸版导出失败，请重试。')); return; }
          try { resolve(await blobToDataUrl(blob)); } catch (error) { reject(error); }
        }, 'image/jpeg', 0.95);
      } catch { reject(new Error('原图不允许浏览器进行 4K 尺寸处理，请先下载原图后重试。')); }
    };
    image.onerror = () => reject(new Error('无法读取原图，请检查图片链接是否仍然有效。'));
    image.src = source;
  });
}

async function generate4KResult(sourceId) {
  const source = state.batch.results.find((item) => item.id === sourceId);
  if (!source?.image || source.status !== 'ready') { showToast('暂时不能创建 4K 尺寸版', '请等待原图生成完成后再试。', 'info'); return; }
  if (state.batch.results.some((item) => item.sourceResultId === sourceId && ['upscaling', 'ready'].includes(item.status))) { showToast('4K 尺寸版已在队列中', '无需重复创建，可直接等待或下载已有文件。', 'info'); return; }
  const [width, height] = FOUR_K_DIMENSIONS[source.ratio] || FOUR_K_DIMENSIONS['4:3'];
  const task = {
    ...structuredClone(source), id: uid('result-4k'), image: '', status: 'upscaling', remoteStatus: 'LOCAL_4K', submittedAt: Date.now(), completedAt: 0,
    is4k: true, sourceResultId: source.id, saved: false, review: source.review, taskId: '', error: '',
    model: `${source.model || '原图'} · 4K 尺寸导出`, tags: [...source.tags.filter((tag) => !tag.startsWith('输出：')), `输出：4K 尺寸 ${width}×${height} · 插值放大`],
  };
  const sourceIndex = state.batch.results.indexOf(source);
  state.batch.results.splice(sourceIndex + 1, 0, task);
  if (state.batch.status === 'saved') state.batch.status = 'ready';
  saveState(); render();
  try {
    task.image = await upscaleImageTo4K(source.image, source.ratio);
    task.status = 'ready'; task.completedAt = Date.now(); task.remoteStatus = 'SUCCEEDED';
    saveState(); render(); showToast('4K 尺寸版已完成', `${width} × ${height}，属于插值导出，不增加模型细节，也不扣积分。`, 'sparkles');
  } catch (error) {
    task.status = 'failed'; task.error = error.message;
    saveState(); render(); showToast('4K 尺寸处理失败', error.message, 'info');
  }
}

function downloadImage(image, name = '设计图片') {
  const anchor = document.createElement('a');
  const extension = /^data:image\/jpe?g/i.test(image) || /\.jpe?g(?:\?|$)/i.test(image) ? 'jpg' : 'png';
  anchor.href = image; anchor.download = `${name.replace(/[\\/:*?"<>|]/g, '_')}.${extension}`;
  document.body.append(anchor); anchor.click(); anchor.remove();
  showToast('已开始导出', `${name} 正在下载。`, 'download');
}

async function exportSelectedAssets() {
  if (exportRuntime.busy || !globalThis.DesignFlowExport) return;
  const assets = selectedExportAssets();
  if (!assets.length) { exportRuntime.error = '当前范围没有可导出的素材。'; render(); return; }
  exportRuntime.busy = true; exportRuntime.error = ''; exportRuntime.message = ''; render();
  try {
    const suffix = state.ui.exportScope === 'all' ? '全部素材' : state.ui.exportTarget;
    const result = await globalThis.DesignFlowExport.exportAssetsZip({ assets, products: state.products, format: state.ui.exportFormat, archiveName: `创想设计平台-${suffix}` });
    exportRuntime.message = `已导出 ${result.count} 张素材，压缩包包含图片和完整追溯清单。`;
  } catch (error) {
    exportRuntime.error = error.message || '导出失败，请检查图片是否仍然有效。';
  } finally {
    exportRuntime.busy = false; render();
  }
}

document.addEventListener('click', async (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { setRoute(routeButton.dataset.route); return; }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'back-styles') { stylePreviewId = ''; stylePromptError = ''; render(); focusOverlay(); return; }
  if (action === 'save-style-prompt') { saveStylePrompt(); return; }
  if (action === 'view-style-prompt') { const option = state.promptGroups.find((group) => group.id === 'group-style')?.options.find((item) => item.id === button.dataset.id); if (option) openStylePrompt(option); render(); focusOverlay(); return; }
  if (action === 'back-regions') { regionPreviewId = ''; render(); focusOverlay(); return; }
  if (action === 'edit-reviewed-prompt') {
    confirmedPromptReviews[comparisonRequested ? 'comparison' : 'batch'] = null; promptReviewDraft = promptReview.entries[promptReviewIndex].prompt; promptReviewEditing = true; promptReviewError = ''; render(); $('#final-prompt-text')?.focus(); return; }
  if (action === 'cancel-reviewed-prompt') { promptReviewEditing = false; promptReviewError = ''; render(); return; }
  if (action === 'save-reviewed-prompt') {
    const draft = promptReviewDraft.trim();
    if (!draft || draft.length > promptReviewLimit()) { promptReviewError = `请输入 1–${promptReviewLimit()} 字的提示词后保存。`; render(); $('#final-prompt-text')?.focus(); return; }
    promptReview.entries[promptReviewIndex].prompt = draft; promptReviewEditing = false; promptReviewError = ''; render(); showToast('提示词已修改', '当前配方将使用保存后的完整提示词生成。', 'check'); return;
  }
  if (action === 'open-location') { if (!state.promptGroups.some((group) => group.id === 'group-location')) state.promptGroups.push(structuredClone(CORE_PROMPT_GROUPS['group-location'])); state.ui.promptDialogGroupId = 'group-location'; rememberFocus(); saveState(); render(); focusOverlay(); return; }
  if (action === 'plan-city') { await enrichCity($('#city-name')?.value.trim()); return; }
  if (action === 'save-public-prompt') {
    const name = $('#public-prompt-name')?.value.trim();
    if (!name) { $('#public-prompt-name')?.focus(); return; }
    const source = state.publicPrompts.find((item) => item.id === state.studio.publicPromptId) || state.publicPrompts[0];
    const template = { ...source, id: uid('public'), name, prompt: $('#public-prompt-content').value };
    state.publicPrompts.push(template); state.studio.publicPromptId = template.id; markRecipeCustomized(); saveState(); render(); return;
  }
  if (action === 'review-comparison') {
    if (state.batch.status === 'generating') return;
    if (!selectedProducts().length) { showToast('请先选择产品', '至少选择一个 SKU 才能进行小样模型对比。', 'box'); return; }
    comparisonRequested = true; preparePromptReview(); state.ui.confirmBatch = true; rememberFocus(); render(); focusOverlay(); return;
  }
  if (action === 'close-overlay' && event.target !== button && button.matches('.drawer-backdrop, .modal-backdrop')) return;
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
    markRecipeCustomized();
    saveState(); render();
  }
  if (action === 'open-prompt-library') { rememberFocus(); state.ui.promptDialogGroupId = 'library'; render(); focusOverlay(); }
  if (action === 'edit-prompt-group') { rememberFocus(); state.ui.promptDialogGroupId = button.dataset.id; render(); focusOverlay(); }
  if (action === 'toggle-prompt-group') { const group = state.promptGroups.find((item) => item.id === button.dataset.id); if (group) { group.enabled = !group.enabled; markRecipeCustomized(); } saveState(); render(); }
  if (action === 'delete-prompt-group') { state.promptGroups = state.promptGroups.filter((item) => item.id !== button.dataset.id); markRecipeCustomized(); saveState(); render(); }
  if (action === 'add-library-group') {
    const source = state.promptLibrary.find((item) => item.id === button.dataset.id);
    if (source && !state.promptGroups.some((item) => item.id === source.id)) {
      if (CORE_PROMPT_GROUPS[source.id]) { const group = structuredClone(CORE_PROMPT_GROUPS[source.id]); if (source.id === 'group-style') group.options[0].selected = true; state.promptGroups.push(group); }
      else state.promptGroups.push({ id: source.id, name: source.name, enabled: true, options: source.options.map((label, index) => ({ id: `${source.id}-${index}`, label, selected: index < 2, quantity: 1 })) });
    }
    state.ui.promptDialogGroupId = source?.id || '';
    if (source?.id === 'group-style') openStylePrompt(state.promptGroups.find((group) => group.id === source.id).options.find((option) => option.selected) || state.promptGroups.find((group) => group.id === source.id).options[0]);
    markRecipeCustomized(); saveState(); render(); focusOverlay();
  }
  if (action === 'create-custom-group') {
    const input = $('#custom-group-name'); const name = input?.value.trim();
    if (!name) { input?.focus(); return; }
    const id = uid('group-custom'); state.promptGroups.push({ id, name, enabled: true, options: [] }); state.ui.promptDialogGroupId = id; markRecipeCustomized();
    saveState(); render(); focusOverlay();
  }
  if (action === 'toggle-prompt-option') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const option = group?.options.find((item) => item.id === button.dataset.id);
    if (option) option.selected = !option.selected;
    if (group?.id === 'group-location' && option?.selected) regionPreviewId = option.id;
    if (group?.id === 'group-style' && option?.selected) openStylePrompt(option);
    markRecipeCustomized(); saveState(); render(); focusOverlay();
  }
  if (action === 'change-option-quantity') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const option = group?.options.find((item) => item.id === button.dataset.id);
    if (option) { option.quantity = Math.max(1, Math.min(9, option.quantity + Number(button.dataset.delta))); markRecipeCustomized(); }
    saveState(); render(); focusOverlay();
  }
  if (action === 'add-prompt-option') {
    const group = state.promptGroups.find((item) => item.id === button.dataset.groupId); const input = $('#new-option-label'); const label = input?.value.trim();
    if (group?.id === 'group-location' && label) { await enrichCity(label); return; }
    if (group && label) { group.options.push({ id: uid('option'), label, prompt: label, description: '自定义选项', selected: true, quantity: 1 }); if (group.id === 'group-style') { const upgraded = upgradeVisualStyleGroup(group); group.options = upgraded.options; openStylePrompt(group.options.find((option) => option.label === label)); } markRecipeCustomized(); saveState(); render(); focusOverlay(); } else input?.focus();
  }
  if (action === 'finish-prompt-editor') closeOverlay();
  if (action === 'set-provider') {
    setStudioProvider(button.dataset.provider);
  }
  if (action === 'set-generation-mode') {
    setStudioQuality(button.dataset.mode);
  }
  if (action === 'review-batch') {
    if (state.batch.status === 'generating') return;
    comparisonRequested = false;
    if (!selectedProducts().length) { showToast('请先选择产品', '至少选择一个 SKU 才能开始生成。', 'box'); return; }
    preparePromptReview(); rememberFocus(); state.ui.confirmBatch = true; render(); focusOverlay();
  }
  if (action === 'confirm-inline-prompts') {
    comparisonRequested = false;
    promptReviewEditing = false;
    promptReviewDraft = '';
    confirmCurrentPromptReview(true);
    return;
  }
  if (action === 'confirm-prompts') confirmCurrentPromptReview();
  if (action === 'generate-batch' || action === 'generate-comparison') {
    comparisonRequested = action === 'generate-comparison';
    await startBatchGeneration();
  }
  if (action === 'regenerate-result') await regenerateResult(button.dataset.id);
  if (action === 'generate-4k-result') await generate4KResult(button.dataset.id);
  if (action === 'check-result') await checkExistingResult(button.dataset.id);
  if (action === 'delete-result') { if (activeGenerationId || state.batch.status === 'generating') { showToast('批次仍在生成', '请等本批次结束后删除结果。', 'info'); return; } state.batch.results = state.batch.results.filter((item) => item.id !== button.dataset.id); if (!state.batch.results.some((item) => item.status === 'loading')) state.batch.status = 'ready'; saveState(); render(); }
  if (action === 'save-batch') saveBatch();
  if (action === 'use-template') {
    const recipe = Core.applyTemplate(state, button.dataset.id);
    if (!recipe) { showToast('模板不可用', '找不到对应配方，请刷新页面后重试。', 'info'); return; }
    promptReview = null; confirmedPromptReviews = { batch: null, comparison: null };
    saveState(); setRoute('studio'); showToast('模板已应用到配方', recipe.summary, 'grid');
  }
  if (action === 'export-assets') await exportSelectedAssets();
  if (action === 'download-asset') downloadImage(button.dataset.image, button.dataset.name);
  if (action === 'download-result') { const result = state.batch.results.find((item) => item.id === button.dataset.id); const product = result ? productById(result.productId) : null; if (result?.image) downloadImage(result.image, `${product?.sku || 'Qwen'}-${state.batch.id}`); }
  if (action === 'authorize-provider') {
    openApiKeyDialog(button.dataset.provider, 'check');
  }
  if (action === 'clear-provider-key') {
    const provider = button.dataset.provider;
    clearProviderApiKey(provider);
    saveState(); render();
    showToast(`${providerConfig(provider).shortName}密钥已清除`, '下次使用该模型时会重新弹出输入窗口。', 'check');
  }
  if (action === 'save-provider-key') {
    const provider = keyDialogProvider;
    const input = $('#provider-api-key');
    const apiKey = normalizeApiKey(input?.value);
    if (!isProviderApiKey(apiKey)) {
      keyDialogError = `请输入完整的${providerConfig(provider).keyLabel}，应以 sk- 开头。`;
      render(); requestAnimationFrame(() => $('#provider-api-key')?.focus()); return;
    }
    if (!setProviderApiKey(provider, apiKey)) {
      keyDialogError = '浏览器禁止了标签页临时存储，请关闭隐私限制后重试。';
      render(); return;
    }
    button.disabled = true;
    button.textContent = '正在验证…';
    const nextAction = pendingKeyAction;
    if (!(await checkProviderAuthorization(provider, false))) {
      keyDialogOpen = true;
      pendingKeyAction = nextAction;
      keyDialogProvider = provider;
      keyDialogError = '密钥验证失败，请确认密钥来自正确的 API 平台、仍然有效并具有模型权限。';
      render(); requestAnimationFrame(() => $('#provider-api-key')?.focus()); return;
    }
    keyDialogOpen = false;
    keyDialogError = '';
    pendingKeyAction = '';
    render();
    showToast(`${providerConfig(provider).shortName}密钥有效`, '基础身份验证已通过；所选图像模型的权限和额度会在首次生成时确认。', 'check');
    if (nextAction === 'generate') await startBatchGeneration();
    if (nextAction.startsWith('regenerate:')) await regenerateResult(nextAction.slice('regenerate:'.length));
    if (nextAction.startsWith('check-result:')) await checkExistingResult(nextAction.slice('check-result:'.length));
    if (nextAction === 'resume') await resumePendingBatch();
    if (nextAction.startsWith('city:')) await enrichCity(nextAction.slice('city:'.length));
  }
  if (action === 'shutdown-app') { button.disabled = true; showToast('正在退出', '产品、词组与生成状态已保存。', 'power'); try { await fetch('/api/shutdown', { method: 'POST' }); } catch { /* desktop host may close */ } }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'studio-other-requirements') { state.studio.otherRequirements = event.target.value; saveState(); refreshInlinePromptReview(); }
  if (event.target.id === 'style-prompt-text') { stylePromptDraft = event.target.value; stylePromptError = ''; }
  if (event.target.id === 'final-prompt-text') {
    promptReviewDraft = event.target.value;
    if (!promptReviewEditing && promptReview?.entries[promptReviewIndex]) {
      promptReview.entries[promptReviewIndex].prompt = event.target.value;
      promptReviewError = '';
      confirmedPromptReviews.batch = null;
      syncPromptConfirmationControls();
    }
  }
  if (event.target.id === 'city-name') { cityDraft = event.target.value; cityPlannerError = ''; }
  if (event.target.dataset.regionPrompt) { const option = state.promptGroups.find((group) => group.id === 'group-location')?.options.find((item) => item.id === event.target.dataset.regionPrompt); if (option) { option.prompt = event.target.value; markRecipeCustomized(); saveState(); refreshInlinePromptReview(); } }
  if (event.target.id === 'public-prompt-content') { const template = state.publicPrompts.find((item) => item.id === state.studio.publicPromptId) || state.publicPrompts[0]; template.prompt = event.target.value; markRecipeCustomized(); saveState(); refreshInlinePromptReview(); }
  if (event.target.id === 'product-search') {
    state.ui.productSearch = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = $('#product-search'); input?.focus(); input?.setSelectionRange(position, position);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'prompt-review-entry' && !promptReviewEditing) { const index = Number(event.target.value); if (Number.isInteger(index) && promptReview?.entries[index]) { promptReviewIndex = index; promptReviewError = ''; render(); $('#prompt-review-entry')?.focus(); } return; }
  if (event.target.id === 'studio-provider') { setStudioProvider(event.target.value); return; }
  if (event.target.id === 'studio-quality') { setStudioQuality(event.target.value); return; }
  if (event.target.id === 'public-prompt-template') { state.studio.publicPromptId = event.target.value; markRecipeCustomized(); saveState(); render(); }
  if (event.target.dataset.resultEvaluation) {
    const item = state.batch.results.find((result) => result.id === event.target.dataset.resultEvaluation);
    if (item) {
      item.evaluation = { ...Core.emptyEvaluation(), ...(item.evaluation || {}) };
      item.evaluation[event.target.dataset.field] = event.target.dataset.field === 'structure' ? Number(event.target.value) : event.target.value;
      item.review = Core.deriveReview(item.evaluation);
      saveState(); render();
    }
    return;
  }
  if (event.target.id === 'export-scope') { state.ui.exportScope = event.target.value; state.ui.exportTarget = ''; exportRuntime.error = ''; exportRuntime.message = ''; saveState(); render(); return; }
  if (event.target.id === 'export-target') { state.ui.exportTarget = event.target.value; exportRuntime.error = ''; exportRuntime.message = ''; saveState(); render(); return; }
  if (event.target.id === 'export-format') { state.ui.exportFormat = event.target.value; exportRuntime.error = ''; exportRuntime.message = ''; saveState(); render(); return; }
  if (event.target.id === 'batch-history' && event.target.value && state.batch.status !== 'generating') {
    const index = state.batchHistory.findIndex((batch) => batch.id === event.target.value);
    if (index >= 0) { const chosen = state.batchHistory.splice(index, 1)[0]; if (state.batch.results.length) state.batchHistory.unshift(structuredClone(state.batch)); state.batch = chosen; saveState(); render(); }
  }
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
  Object.keys(PROVIDERS).forEach((provider) => { if (!getProviderApiKey(provider)) state.connection.authenticated[provider] = false; });
  const initialRoute = location.hash.slice(1);
  setRoute(routeMeta[initialRoute] ? initialRoute : (state.ui.route || 'products'), false, false);
  await loadState();
  const refreshedRoute = location.hash.slice(1);
  setRoute(routeMeta[refreshedRoute] ? refreshedRoute : (state.ui.route || 'products'), false, false);
  await resumePendingBatch();
})();
