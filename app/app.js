const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const icons = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/>',
  sparkles: '<path d="m12 3-1.1 3.5L7.5 8l3.4 1.5L12 13l1.1-3.5L16.5 8l-3.4-1.5L12 3Z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13Zm13-1-.8 2.2-2.2.8 2.2.8L18 19l.8-2.2L21 16l-2.2-.8L18 12Z"/>',
  box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Zm8 4v10"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
  files: '<path d="M14 2H6a2 2 0 0 0-2 2v12"/><path d="M14 2v5h5M8 7h2"/><rect x="7" y="6" width="13" height="16" rx="2"/><path d="M10 12h7m-7 4h7m-7 4h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 18v3h16v-3"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .9-7L20 12"/>',
  wand: '<path d="m15 4 5 5L8 21l-5-5L15 4Z"/><path d="m6 14 5 5M6 3v3M4.5 4.5h3M19 16v4m-2-2h4"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  presentation: '<path d="M3 4h18v12H3V4Zm4 17 5-5 5 5M12 16v5"/><path d="m8 12 3-3 2 2 3-4"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3m-6 0 3 3"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
  activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  package: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/><path d="m9 15 2 2 4-4"/>',
  paint: '<path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-3 3h-2a2 2 0 0 0-2 2v1a4 4 0 0 1-3 4Z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="6.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.6-4.8A7 7 0 0 1 3 13V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7Z"/>',
  power: '<path d="M12 2v10"/><path d="M6.3 5.7a8 8 0 1 0 11.4 0"/>',
};

const svgIcon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;

function hydrateIcons(scope = document) {
  $$('[data-icon]', scope).forEach((el) => {
    const name = el.dataset.icon;
    el.innerHTML = svgIcon(name);
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function svgData(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const kidsCategories = [
  { name: 'Teepee 三角帐', key: 'teepee', signal: '蒙氏阅读角 · 家居融合', platforms: 'Etsy · Wayfair · Walmart' },
  { name: '房屋 / 游戏屋帐篷', key: 'playhouse', signal: '小屋、商店、厨房角色扮演', platforms: 'Target · Wayfair · Etsy' },
  { name: '主题弹开帐篷', key: 'popup', signal: '城堡、恐龙、火箭、独角兽', platforms: 'Target · Walmart' },
  { name: '隧道 / 球池组合', key: 'tunnel', signal: '2–8 合 1 模块化运动游戏', platforms: 'Walmart · Target · Wayfair' },
  { name: '床帐 / 顶篷', key: 'canopy', signal: '睡眠私密、阅读与梦幻装饰', platforms: 'IKEA · Wayfair · Etsy' },
  { name: '室内外露营帐', key: 'camp', signal: '后院露营、堡垒与亲子游戏', platforms: 'Target · Walmart · IKEA' },
  { name: '婴幼儿防晒帐', key: 'nursery', signal: '低龄看护、网纱与 UV 防护', platforms: 'Target · Wayfair' },
  { name: '睡衣派对 A 字帐', key: 'aframe', signal: '派对套装、定制姓名与拍照', platforms: 'Etsy · Wayfair' },
];

const kidsScenes = [
  { name: '室内游戏房', key: 'playroom' },
  { name: '儿童卧室', key: 'bedroom' },
  { name: '亲子阅读角', key: 'reading' },
  { name: '家庭后院', key: 'backyard' },
  { name: '梦境草甸', key: 'meadow' },
  { name: '沙滩与公园', key: 'beach' },
];

const kidsMaterials = [
  { name: '柔软聚酯纤维 + 透气网纱', short: '柔软聚酯 + 网纱', key: 'mesh' },
  { name: '天然棉帆布 + 木杆', short: '棉帆布 + 木杆', key: 'canvas' },
  { name: '可水洗涂层布 + 玻纤杆', short: '可水洗涂层布', key: 'coated' },
  { name: '防晒银胶布 + 软质骨架', short: '防晒银胶布', key: 'silver' },
];

const kidsThemes = [
  { name: '森林动物', key: 'animals' }, { name: '恐龙伙伴', key: 'dinosaurs' },
  { name: '星星月亮', key: 'stars' }, { name: '花朵蝴蝶', key: 'florals' },
  { name: '彩虹云朵', key: 'rainbows' }, { name: '海洋生物', key: 'ocean' },
  { name: '交通工具', key: 'vehicles' }, { name: '水果甜点', key: 'treats' },
];

const kidsStyles = [
  { name: '柔光童话', key: 'storybook' }, { name: '北欧简约', key: 'nordic' },
  { name: '活力卡通', key: 'cartoon' }, { name: '蒙氏自然', key: 'montessori' },
  { name: '星夜微光', key: 'glow' }, { name: '电商白底', key: 'commerce' },
];

const choiceImage = (group, key) => `/assets/choices/${group}-${key}.png?v=0.9`;

function sceneVisual(key) {
  const scenes = {
    playroom: ['#f7e8ff', '#f7cde8', '<rect x="24" y="68" width="54" height="54" rx="8" fill="#ffd75e"/><circle cx="268" cy="86" r="30" fill="#72d8c6"/><rect x="246" y="116" width="50" height="18" rx="5" fill="#fff"/>'],
    bedroom: ['#e9e8ff', '#d4d0ff', '<rect x="205" y="84" width="92" height="48" rx="12" fill="#fff"/><rect x="215" y="73" width="38" height="22" rx="9" fill="#ffbdc9"/><circle cx="45" cy="42" r="18" fill="#ffe47b"/>'],
    reading: ['#e6f8ef', '#bde9d3', '<rect x="236" y="78" width="48" height="62" rx="5" fill="#fff"/><path d="M241 91h38M241 104h38M241 117h28" stroke="#7467de" stroke-width="5"/><circle cx="278" cy="45" r="21" fill="#7bc79d"/>'],
    party: ['#fff0e5', '#ffd0bb', '<path d="M20 42h280M32 42l18 24 18-24 18 24 18-24 18 24 18-24 18 24 18-24 18 24 18-24 18 24 18-24 18 24 18-24" fill="#ff8fa4"/><circle cx="267" cy="108" r="20" fill="#ffe06c"/>'],
    backyard: ['#dff4ff', '#83c986', '<circle cx="268" cy="42" r="24" fill="#ffe06c"/><rect y="116" width="320" height="64" fill="#9bd58e"/><path d="M45 121V71m-23 28c0-38 46-54 60-16 22 7 12 43-16 40Z" fill="#64b079"/>'],
    beach: ['#dff5ff', '#f6d68b', '<circle cx="264" cy="40" r="25" fill="#ffcf54"/><path d="M0 114c45-18 83 17 129 0s88 17 133 0 58 7 58 7v59H0Z" fill="#67c8df"/><path d="M0 142c57-14 105 14 163 0s103 14 157 0v38H0Z" fill="#f4d68e"/>'],
    upload: ['#eeeaf8', '#d8d2ea', '<rect x="105" y="48" width="110" height="78" rx="12" fill="#fff" stroke="#7467de" stroke-width="5" stroke-dasharray="9 7"/><path d="m160 66-19 22h13v21h12V88h13Z" fill="#7467de"/>'],
  };
  const [top, bottom, detail] = scenes[key] || scenes.playroom;
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="320" height="180" rx="18" fill="url(#b)"/>${detail}<ellipse cx="150" cy="151" rx="78" ry="12" fill="#4b4670" opacity=".13"/><path d="M80 145c8-68 35-104 75-112 42 9 68 45 76 112Z" fill="#7467de" stroke="#4a436f" stroke-width="5"/><path d="M130 145c2-37 11-60 25-68 15 8 23 31 25 68Z" fill="#fff3d3"/></svg>`);
}

function materialVisual(key) {
  const materials = {
    mesh: ['#8d81ea', '<pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#fff" opacity=".75"/></pattern>', '<path d="M54 49h218v86H54Z" fill="url(#p)"/><path d="M72 59h70v66H72Z" fill="#ffb6c3" opacity=".78"/>'],
    canvas: ['#e8cfa7', '<pattern id="p" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 1h8M1 0v8" stroke="#9e7950" stroke-width=".8" opacity=".3"/></pattern>', '<rect x="50" y="44" width="220" height="94" rx="8" fill="url(#p)"/><path d="M63 124h194" stroke="#fff7e5" stroke-width="4" stroke-dasharray="7 5"/>'],
    coated: ['#ff9e88', '<linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb49f"/><stop offset="1" stop-color="#e87570"/></linearGradient>', '<rect x="50" y="44" width="220" height="94" rx="14" fill="url(#p)"/><g fill="#dff7ff" stroke="#fff" stroke-width="2"><path d="M105 67c18 23 19 35 0 35s-18-12 0-35Z"/><path d="M198 74c15 19 16 30 0 30s-15-11 0-30Z"/></g>'],
    silver: ['#bfc7d8', '<linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fbff"/><stop offset=".4" stop-color="#9ba9bd"/><stop offset=".66" stop-color="#edf4fb"/><stop offset="1" stop-color="#acb7c6"/></linearGradient>', '<rect x="50" y="44" width="220" height="94" rx="14" fill="url(#p)"/><circle cx="242" cy="66" r="15" fill="#ffe16b"/><path d="M70 121 247 55" stroke="#fff" stroke-width="8" opacity=".42"/>'],
  };
  const [bg, defs, detail] = materials[key] || materials.mesh;
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs>${defs}</defs><rect width="320" height="180" rx="18" fill="#fffaf1"/><ellipse cx="160" cy="146" rx="118" ry="14" fill="#4a436f" opacity=".12"/>${detail}<path d="M50 53c62-22 155-18 220 0" fill="none" stroke="${bg}" stroke-width="5" opacity=".65"/></svg>`);
}

function themeVisual(key) {
  const themes = {
    forest: ['#dff4df', '<path d="M48 140 78 60l30 80m-18 0 40-105 40 105m20 0 30-78 30 78" fill="#68b889"/><circle cx="244" cy="75" r="18" fill="#ffca72"/><circle cx="230" cy="61" r="8" fill="#ffca72"/><circle cx="258" cy="61" r="8" fill="#ffca72"/>'],
    dino: ['#e1f4ce', '<ellipse cx="158" cy="102" rx="64" ry="44" fill="#7dcf87"/><path d="M100 103 68 77l11 47m125-27 42-37-12 63" fill="#7dcf87"/><circle cx="181" cy="91" r="5" fill="#3e5060"/><path d="m124 69 14-22 13 23 16-24 10 31" fill="#ffcf5b"/>'],
    space: ['#35366f', '<circle cx="250" cy="42" r="24" fill="#ffe372"/><path d="M142 136c-11-48 7-84 48-108 35 32 40 73 17 110Z" fill="#f9f7ff"/><circle cx="185" cy="69" r="16" fill="#6fcddd"/><path d="m151 128-24 29 35-11m37-13 18 28-34-13" fill="#ff8f70"/><g fill="#fff"><circle cx="62" cy="50" r="4"/><circle cx="95" cy="87" r="5"/><circle cx="268" cy="105" r="4"/></g>'],
    castle: ['#f7dff0', '<path d="M76 142V70h38V49h25v21h42V45h28v25h38v72Z" fill="#bd83d6"/><path d="M133 142v-36c0-18 12-29 28-29s28 11 28 29v36Z" fill="#fff1d1"/><path d="M61 70h202l-18-25-22 25-21-28-22 28-20-28-22 28-22-25Z" fill="#ff97ad"/>'],
    rainbow: ['#fff0f5', '<path d="M71 137a89 89 0 0 1 178 0" fill="none" stroke="#ff8fa4" stroke-width="24"/><path d="M91 137a69 69 0 0 1 138 0" fill="none" stroke="#ffd45f" stroke-width="20"/><path d="M110 137a50 50 0 0 1 100 0" fill="none" stroke="#6ed4c5" stroke-width="18"/><circle cx="71" cy="137" r="25" fill="#fff"/><circle cx="249" cy="137" r="25" fill="#fff"/>'],
    ocean: ['#dff6ff', '<path d="M0 112c45-30 76 26 121 0s78 28 125 0 74 10 74 10v58H0Z" fill="#62c2dc"/><path d="M0 140c43-21 77 20 120 0s82 20 125 0 75 8 75 8v32H0Z" fill="#408fbd"/><path d="M102 76c27-23 58-22 83 0-25 23-56 23-83 0Zm83 0 29-21v42Z" fill="#ff9a82"/><circle cx="120" cy="73" r="4" fill="#3f3c66"/>'],
    vehicle: ['#e8efff', '<rect x="62" y="84" width="202" height="55" rx="18" fill="#ff8f70"/><path d="m110 84 30-35h62l35 35Z" fill="#6d66d5"/><rect x="149" y="56" width="44" height="28" rx="5" fill="#c9f0f3"/><circle cx="111" cy="140" r="23" fill="#454166"/><circle cx="220" cy="140" r="23" fill="#454166"/><circle cx="111" cy="140" r="9" fill="#fff"/><circle cx="220" cy="140" r="9" fill="#fff"/>'],
    cafe: ['#fff1dc', '<rect x="65" y="61" width="190" height="94" rx="8" fill="#fff"/><path d="M55 61h210l-18-35H73Z" fill="#ff8fa4"/><path d="M73 26v35m35-35v35m35-35v35m35-35v35m35-35v35m34-35v35" stroke="#fff" stroke-width="14"/><rect x="91" y="85" width="65" height="70" fill="#78cdbc"/><path d="M184 94h43v38h-43Z" fill="#ffe078"/><path d="M193 104c0 17 24 17 24 0" fill="none" stroke="#7c5d48" stroke-width="5"/>'],
  };
  const [bg, detail] = themes[key] || themes.forest;
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" rx="18" fill="${bg}"/>${detail}</svg>`);
}

function styleVisual(key) {
  const styles = {
    storybook: ['#f3e7ff', '#8b6fd6', '#ff9eaa', '8'], nordic: ['#edf2ed', '#789a8b', '#d8b78b', '3'],
    cartoon: ['#fff0c8', '#ff6f70', '#30bfc5', '11'], montessori: ['#f4ead8', '#b88c62', '#789b76', '4'],
    glow: ['#34345f', '#887cff', '#ffe879', '6'], commerce: ['#ffffff', '#7467de', '#ff8f70', '2'],
  };
  const [bg, main, accent, stroke] = styles[key] || styles.storybook;
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" rx="18" fill="${bg}"/><ellipse cx="160" cy="148" rx="104" ry="14" fill="#4a436f" opacity=".12"/><path d="M70 142 143 43h36l72 99Z" fill="${main}" stroke="#4a436f" stroke-width="${stroke}"/><path d="M137 142c2-37 10-58 23-69 14 11 22 32 24 69Z" fill="${accent}"/><path d="M99 89h122" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 18" opacity=".75"/></svg>`);
}

const categoryShape = (category = '') => kidsCategories.find((item) => item.name === category)?.key || 'playhouse';

function tentImage(color = '#7c6ee6', accent = '#ff8f70', label = 'TENTFLOW KIDS', shape = 'playhouse', transparent = false) {
  const safeLabel = String(label).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  const shared = transparent ? `<ellipse cx="450" cy="484" rx="310" ry="42" fill="#312e68" opacity=".18"/>` : `<ellipse cx="450" cy="484" rx="310" ry="42" fill="#534d83" opacity=".12"/><circle cx="110" cy="112" r="28" fill="#ffd85c"/><path d="M680 104c30-39 82-13 73 26 50-4 57 63 7 70h-124c-48-12-34-75 14-71 2-10 12-19 30-25Z" fill="#fff" opacity=".84"/><g fill="#fff" opacity=".9"><path d="m172 124 7 14 15 2-11 11 3 15-14-7-14 7 3-15-11-11 15-2Z"/><circle cx="783" cy="282" r="9"/><circle cx="123" cy="302" r="7"/></g>`;
  const shapes = {
    teepee: `<path d="M248 452 438 132l26 4 200 316Z" fill="${color}" stroke="#4a436f" stroke-width="10" stroke-linejoin="round"/><path d="M451 127 314 475M451 127l150 348" fill="none" stroke="#a77955" stroke-width="11" stroke-linecap="round"/><path d="M391 452c9-96 30-145 64-164 37 21 59 70 68 164Z" fill="#fff4d7" stroke="${accent}" stroke-width="8"/><path d="M367 221c28 17 57 26 88 27 31-2 62-11 92-29" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="3 26"/>`,
    playhouse: `<path d="m236 278 214-151 214 151v183H236Z" fill="${color}" stroke="#4a436f" stroke-width="10" stroke-linejoin="round"/><path d="m206 290 244-173 244 173" fill="none" stroke="${accent}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path d="M365 461V326c0-30 26-54 58-54h54c32 0 58 24 58 54v135Z" fill="#fff4d7"/><path d="M273 315h61v61h-61Zm293 0h61v61h-61Z" fill="#bceaf2" stroke="#fff" stroke-width="8"/><path d="M298 315v61m293-61v61" stroke="#fff" stroke-width="6"/>`,
    popup: `<path d="M260 459V257c0-82 70-149 156-149h68c86 0 156 67 156 149v202Z" fill="${color}" stroke="#4a436f" stroke-width="10"/><path d="M316 459V205l36-34 36 34v254m124 0V205l36-34 36 34v254" fill="${accent}" stroke="#4a436f" stroke-width="8"/><path d="M389 459V334c0-36 27-66 61-66s61 30 61 66v125Z" fill="#fff4d7"/><path d="m450 153 12 24 27 4-20 19 5 27-24-13-24 13 5-27-20-19 27-4Z" fill="#ffd85c"/>`,
    tunnel: `<circle cx="322" cy="353" r="135" fill="${color}" stroke="#4a436f" stroke-width="10"/><path d="M322 218 214 116m108 102 104-102" stroke="#a77955" stroke-width="10" stroke-linecap="round"/><path d="M395 326h226c67 0 91 115 18 134H382" fill="${accent}" stroke="#4a436f" stroke-width="10"/><circle cx="322" cy="369" r="70" fill="#fff4d7"/><path d="M559 449h159v19c0 34-28 61-62 61h-35c-34 0-62-27-62-61Z" fill="#bceaf2" stroke="#4a436f" stroke-width="8"/><g fill="#ff8f70"><circle cx="596" cy="465" r="15"/><circle cx="649" cy="480" r="17"/><circle cx="693" cy="460" r="14"/></g>`,
    canopy: `<path d="M450 92v354" stroke="#4a436f" stroke-width="9"/><ellipse cx="450" cy="132" rx="116" ry="34" fill="${accent}" stroke="#4a436f" stroke-width="8"/><path d="M340 139c-24 102-61 201-87 308h394c-26-107-63-206-87-308-59 38-161 38-220 0Z" fill="${color}" opacity=".9" stroke="#4a436f" stroke-width="9"/><path d="M450 158c-42 76-70 173-80 289h160c-10-116-38-213-80-289Z" fill="#fff8e8"/><ellipse cx="450" cy="455" rx="148" ry="42" fill="#ffd8d2"/>`,
    camp: `<path d="M216 455c22-174 103-269 234-301 131 32 212 127 234 301Z" fill="${color}" stroke="#4a436f" stroke-width="10"/><path d="M280 455c18-118 74-194 170-228 96 34 152 110 170 228M450 154v301" fill="none" stroke="${accent}" stroke-width="10"/><path d="M378 455c4-90 28-144 72-166 44 22 68 76 72 166Z" fill="#fff4d7"/><path d="M272 336h68v53h-78" fill="#bceaf2" stroke="#fff" stroke-width="8"/>`,
    nursery: `<path d="M221 448c17-139 107-230 229-230s212 91 229 230Z" fill="${color}" stroke="#4a436f" stroke-width="10"/><path d="M450 218v230M293 448c8-100 64-164 157-190 93 26 149 90 157 190" fill="none" stroke="${accent}" stroke-width="9"/><path d="M355 448c5-78 36-126 95-145 59 19 90 67 95 145Z" fill="#dff7f4" opacity=".86" stroke="#fff" stroke-width="7"/><circle cx="420" cy="365" r="8" fill="#4a436f"/><circle cx="480" cy="365" r="8" fill="#4a436f"/><path d="M426 397c15 14 33 14 48 0" fill="none" stroke="#4a436f" stroke-width="7" stroke-linecap="round"/>`,
    aframe: `<path d="M240 458 390 164h120l150 294Z" fill="${color}" stroke="#4a436f" stroke-width="10"/><path d="m390 164 60 294 60-294M390 164 334 115m176 49 56-49" fill="none" stroke="#a77955" stroke-width="10" stroke-linecap="round"/><path d="M393 458c5-83 24-132 57-149 33 17 52 66 57 149Z" fill="#fff4d7"/><path d="M349 224h202" stroke="${accent}" stroke-width="18" stroke-dasharray="20 12"/>`,
  };
  const labelTag = safeLabel ? `<rect x="335" y="520" width="230" height="42" rx="21" fill="#fff" opacity=".88"/><text x="450" y="548" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="20" fill="#4a436f" font-weight="700" text-anchor="middle">${safeLabel}</text>` : '';
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="room" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff9ef"/><stop offset=".58" stop-color="#f0ecff"/><stop offset="1" stop-color="#dff7f4"/></linearGradient></defs>${transparent ? '' : '<rect width="900" height="600" rx="34" fill="url(#room)"/>'}${shared}${shapes[shape] || shapes.playhouse}${labelTag}</svg>`);
}

const nowLabel = () => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const seedState = {
  schemaVersion: 4,
  credits: 2680,
  products: [
    { id: 'p-starlab', name: '星球探险游戏屋', sku: 'TK-P03', category: '主题弹开帐篷', market: '北美', age: '3–6 岁', theme: '星星月亮', image: tentImage('#7467de', '#ff9072', 'STAR LAB', 'popup'), concepts: 4, assets: 18, status: '设计中', updated: '今天 13:42' },
    { id: 'p-forest', name: '森林朋友 Teepee', sku: 'TK-T01', category: 'Teepee 三角帐', market: '欧洲', age: '3–6 岁', theme: '森林动物', image: tentImage('#68bfa8', '#ffcf5b', 'FOREST FRIENDS', 'teepee'), concepts: 3, assets: 12, status: '已确认', updated: '昨天 17:08' },
    { id: 'p-rainbow', name: '彩虹隧道乐园', sku: 'TK-C08', category: '隧道 / 球池组合', market: '全球通用', age: '18个月–6岁', theme: '彩虹云朵', image: tentImage('#ff8fa4', '#6fd4df', 'RAINBOW PLAY', 'tunnel'), concepts: 3, assets: 23, status: '已交付', updated: '09月03日' },
  ],
  concepts: [
    { id: 'c-1', productId: 'p-starlab', title: '月球小基地', scene: 'space', palette: '#7467de', note: '星球紫 · 软圆舷窗 · 北美玩具零售', status: '待确认', created: '今天 13:44' },
    { id: 'c-2', productId: 'p-starlab', title: '糖果火箭站', scene: 'candy', palette: '#ff8fa4', note: '糖果粉 · 彩色星轨 · 电商主图', status: '已确认', created: '今天 13:46' },
    { id: 'c-3', productId: 'p-starlab', title: '薄荷宇航营', scene: 'mint', palette: '#68bfa8', note: '薄荷绿 · 安静阅读角 · 欧洲家居', status: '待确认', created: '今天 13:47' },
    { id: 'c-4', productId: 'p-starlab', title: '星夜发光舱', scene: 'night', palette: '#4a4f86', note: '星夜蓝 · 柔和发光元素 · 社交传播', status: '待确认', created: '今天 13:48' },
  ],
  stores: [
    { id: 's-1', name: 'Little Sprout Playroom', city: 'Vancouver', country: 'Canada', type: '儿童家居与玩具店', score: 94, contact: '+1 604 *** 0192', source: '演示地图数据', x: 22, y: 35 },
    { id: 's-2', name: 'Wonder Nest Kids', city: 'Seattle', country: 'United States', type: '精品玩具零售', score: 90, contact: '+1 206 *** 7741', source: '演示地图数据', x: 37, y: 58 },
    { id: 's-3', name: 'Tiny Trails Family Store', city: 'Portland', country: 'United States', type: '亲子户外用品店', score: 86, contact: '+1 503 *** 2286', source: '演示地图数据', x: 62, y: 43 },
    { id: 's-4', name: 'Cloudberry Nursery', city: 'Calgary', country: 'Canada', type: '母婴与儿童空间店', score: 81, contact: '+1 403 *** 6105', source: '演示地图数据', x: 76, y: 64 },
  ],
  schemes: [],
  deliveries: [
    { id: 'd-1', name: '星球探险游戏屋｜北美玩具渠道提案', type: 'PPT 提纲', status: '已生成', updated: '今天 13:50' },
    { id: 'd-2', name: 'TK-P03 全球网站素材包', type: '网站', status: '已生成', updated: '今天 13:51' },
  ],
  outreach: [],
  activities: [
    { icon: 'check', title: '概念方案已确认', detail: '星球探险游戏屋 · 糖果火箭站', time: '6 分钟前' },
    { icon: 'files', title: '交付物生成完成', detail: '北美玩具渠道提案 · PPT 提纲', time: '18 分钟前' },
    { icon: 'globe', title: '发现 4 家儿童渠道门店', detail: '玩具、儿童家居与母婴渠道', time: '42 分钟前' },
  ],
  settings: { provider: 'demo', model: '图像模型（待接入）', keyConfigured: false, keyLast4: '', autoUpdate: true, reviewBeforeSend: true, localOnly: true },
  ui: { selectedProductId: 'p-starlab', selectedStoreId: 's-1', route: 'dashboard', customSceneImage: '', lastGeneration: null, params: { market: '北美', category: '主题弹开帐篷', age: '3–6 岁', scene: '室内游戏房', material: '柔软聚酯纤维 + 透气网纱', color: '#7467de', style: '柔光童话', theme: '星星月亮', count: 4, prompt: '圆角安全结构、网纱观察窗、可拆洗布套；使用通用原创装饰元素，避免未经授权的角色 IP' } },
};

let state = structuredClone(seedState);
let saveTimer;
let uploadImageData = '';

function migrateCreativeSelections() {
  const scenes = { '睡衣派对': '梦境草甸' };
  const themes = { '恐龙世界': '恐龙伙伴', '太空火箭': '星星月亮', '城堡童话': '花朵蝴蝶', '彩虹独角兽': '彩虹云朵', '彩虹乐园': '彩虹云朵', '海洋朋友': '海洋生物', '车辆城市': '交通工具', '咖啡小店': '水果甜点' };
  const styles = { '童话插画': '柔光童话', '北欧童趣': '北欧简约', '梦幻发光': '星夜微光', '电商清爽': '电商白底' };
  state.ui.params.scene = scenes[state.ui.params.scene] || state.ui.params.scene;
  state.ui.params.theme = themes[state.ui.params.theme] || state.ui.params.theme;
  state.ui.params.style = styles[state.ui.params.style] || state.ui.params.style;
  state.products.forEach((product) => { product.theme = themes[product.theme] || product.theme; });
  state.schemaVersion = 4;
}

async function loadState() {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (!response.ok) throw new Error('state unavailable');
    const saved = await response.json();
    if (saved && Array.isArray(saved.products)) {
      const isLegacyDemo = !saved.schemaVersion && saved.products.some((product) => ['p-alpine', 'p-dune', 'p-roof'].includes(product.id));
      state = isLegacyDemo ? structuredClone(seedState) : { ...structuredClone(seedState), ...saved, schemaVersion: 4, credits: Number.isFinite(saved.credits) ? saved.credits : seedState.credits, ui: { ...seedState.ui, ...(saved.ui || {}), params: { ...seedState.ui.params, ...(saved.ui?.params || {}) } }, settings: { ...seedState.settings, ...(saved.settings || {}) } };
    }
  } catch {
    const cached = localStorage.getItem('tentflow-state');
    if (cached) {
      try {
        const saved = JSON.parse(cached);
        state = saved?.schemaVersion >= 2 ? { ...structuredClone(seedState), ...saved, schemaVersion: 4, credits: Number.isFinite(saved.credits) ? saved.credits : seedState.credits, ui: { ...seedState.ui, ...(saved.ui || {}), params: { ...seedState.ui.params, ...(saved.ui?.params || {}) } } } : structuredClone(seedState);
      } catch { /* keep seed */ }
    }
  }
  migrateCreativeSelections();
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    localStorage.setItem('tentflow-state', JSON.stringify(state));
    try {
      await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
    } catch { /* localStorage remains the fallback */ }
  }, 180);
}

const routeMeta = {
  dashboard: ['项目概览', '工作台'],
  studio: ['儿童产品创意生产链', '儿童帐篷设计'],
  library: ['全球类目与本地素材', '款式与素材库'],
  global: ['儿童渠道获客与交付链', '全球儿童渠道'],
  deliveries: ['网站 · PPT · 手册', '交付中心'],
  settings: ['本地安全与连接', '模型与设置'],
};

function setRoute(route, push = true) {
  if (!routeMeta[route]) route = 'dashboard';
  state.ui.route = route;
  if (push) history.replaceState(null, '', `#${route}`);
  const [kicker, title] = routeMeta[route];
  $('#route-kicker').textContent = kicker;
  $('#route-title').textContent = title;
  $$('.nav-item').forEach((item) => {
    const active = item.dataset.route === route;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  document.body.classList.remove('nav-open');
  render();
  if (push) requestAnimationFrame(() => $('#main-content')?.focus({ preventScroll: true }));
  saveState();
}

function selectedProduct() {
  return state.products.find((p) => p.id === state.ui.selectedProductId) || state.products[0];
}

function selectedStore() {
  return state.stores.find((s) => s.id === state.ui.selectedStoreId) || state.stores[0];
}

function pageHeading(kicker, title, copy, actions = '') {
  return `<div class="page-heading"><div><span class="eyebrow">${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
}

function statusChip(label, tone = 'gray') {
  return `<span class="status-chip status-chip--${tone}">${escapeHtml(label)}</span>`;
}

function renderDashboard() {
  const approved = state.concepts.filter((c) => c.status === '已确认').length;
  const sent = state.outreach.length;
  return `<section class="view">
    <div class="hero">
      <div class="hero-copy">
        <span class="hero-kicker">TENTFLOW KIDS · V0.3</span>
        <h2>把童趣灵感，变成全球热卖的儿童帐篷</h2>
        <p>覆盖 Teepee、游戏屋、主题弹开、隧道球池、床帐等主流款式，从概念图、白底图一路生成渠道方案与交付素材。</p>
        <div class="hero-actions">
          <button class="button button--primary" data-action="new-design"><span data-icon="sparkles"></span>开始产品设计</button>
          <button class="button button--secondary" data-route="global"><span data-icon="globe"></span>寻找儿童渠道</button>
        </div>
      </div>
      <div class="hero-visual">
        <img src="/assets/dashboard-kids-playing-hero-v1.png" alt="孩子们在梦幻儿童帐篷旁快乐玩耍">
        <div class="hero-tag"><span data-icon="sparkles"></span>童趣场景 · 真实灵感</div>
      </div>
    </div>
    <div class="metrics-grid">
      ${metric('box', '儿童帐篷 / SKU', state.products.length, '8 大主流结构')}
      ${metric('sparkles', '概念方案', state.concepts.length, `${approved} 个已确认`)}
      ${metric('files', '交付物', state.deliveries.length, '网站、PPT、手册')}
      ${metric('users', '儿童渠道门店', state.stores.length, sent ? `${sent} 次触达` : '玩具 · 家居 · 母婴')}
    </div>
    <div class="dashboard-grid">
      <article class="card">
        <div class="card-header"><div><h3>产品到成交的工作流</h3><p>从产品资产开始，每一步都保留版本和记录</p></div><button class="button button--ghost card-action" data-route="studio">进入设计 <span data-icon="chevron"></span></button></div>
        <div class="card-body stage-list">
          ${stage(1, '儿童帐篷款式建档', '结构、年龄、主题、材质与市场', '已完成', 'green')}
          ${stage(2, '童趣概念图与人工确认', '装饰元素、配色、角色扮演场景', approved ? '进行中' : '待开始', approved ? 'blue' : 'gray')}
          ${stage(3, '白底图与全球素材', '标准商品图、尺寸与安全卖点', approved ? '可生成' : '等待确认', approved ? 'amber' : 'gray')}
          ${stage(4, '网站 · PPT · 产品手册', '模板化合成交付', state.deliveries.length ? '已有交付' : '待开始', state.deliveries.length ? 'green' : 'gray')}
          ${stage(5, '儿童渠道与 WhatsApp', '玩具/家居/母婴三套方案与跟进', sent ? '已触达' : '演示就绪', sent ? 'green' : 'amber')}
        </div>
      </article>
      <article class="card">
        <div class="card-header"><div><h3>最近动态</h3><p>生成、确认、交付与触达统一记录</p></div>${statusChip('本地保存', 'green')}</div>
        <div class="card-body activity-list">
          ${state.activities.slice(0, 5).map((a) => `<div class="activity"><div class="activity-icon">${svgIcon(a.icon)}</div><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.detail)}</p><time>${escapeHtml(a.time)}</time></div></div>`).join('')}
        </div>
      </article>
    </div>
  </section>`;
}

function metric(icon, label, value, note) {
  return `<article class="metric-card"><div class="metric-top"><span class="metric-icon">${svgIcon(icon)}</span>${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-note">${escapeHtml(note)}</div></article>`;
}

function stage(index, title, copy, status, tone) {
  return `<div class="stage-row"><span class="stage-index">${index}</span><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></div>${statusChip(status, tone)}</div>`;
}

function renderLibrary() {
  return `<section class="view">
    ${pageHeading('KIDS TENT TAXONOMY', '款式与素材库', '根据 Target、Walmart、Wayfair、IKEA 与 Etsy 的常见商品组织方式，归并为 8 个可直接用于设计生产的结构类目。', `<button class="button button--primary" data-action="open-import"><span data-icon="upload"></span>导入产品</button>`)}
    <article class="taxonomy-panel">
      <div class="taxonomy-heading"><div><span class="eyebrow">MARKET CATEGORY MAP</span><h3>国外平台主要儿童帐篷分类</h3><p>先选结构，再叠加森林动物、恐龙、星月、花朵、彩虹等原创帐篷装饰元素。</p></div>${statusChip('2026.09 市场整理', 'blue')}</div>
      <div class="taxonomy-grid">${kidsCategories.map((item, index) => `<button class="taxonomy-card taxonomy-card--${(index % 4) + 1}" data-category-pick="${escapeHtml(item.name)}" aria-label="筛选 ${escapeHtml(item.name)}"><span class="taxonomy-copy"><span class="taxonomy-index">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.signal)}</small><em>${escapeHtml(item.platforms)}</em></span><img src="${choiceImage('tent', item.key)}" alt="${escapeHtml(item.name)}真实产品图" loading="lazy" decoding="async"></button>`).join('')}</div>
      <div class="taxonomy-foot"><span>常用元素：森林动物 · 恐龙 · 星星月亮 · 花朵蝴蝶 · 彩虹云朵 · 海洋生物 · 交通工具 · 水果甜点</span><span>设计边界：优先原创通用图形，避免未经授权的角色 IP</span></div>
    </article>
    <div class="toolbar">
      <label class="search-field"><span data-icon="search"></span><input id="product-search" type="search" placeholder="搜索产品名称、SKU 或市场" aria-label="搜索产品"></label>
      <select class="select-control" id="category-filter" aria-label="按类别筛选"><option>全部类别</option>${kidsCategories.map((item) => `<option>${escapeHtml(item.name)}</option>`).join('')}</select>
      <select class="select-control" id="market-filter" aria-label="按市场筛选"><option>全部市场</option><option>全球通用</option><option>北美</option><option>欧洲</option><option>澳新</option><option>中东</option></select>
    </div>
    <div class="product-grid" id="product-grid">${state.products.map(productCard).join('')}</div>
  </section>`;
}

function productCard(product) {
  const tone = product.status === '已交付' ? 'green' : product.status === '设计中' ? 'amber' : 'blue';
  return `<article class="product-card" data-product-card data-search="${escapeHtml(`${product.name} ${product.sku} ${product.market} ${product.category}`).toLowerCase()}" data-category="${escapeHtml(product.category)}" data-market="${escapeHtml(product.market)}">
    <div class="product-image"><img src="${product.image}" alt="${escapeHtml(product.name)}产品图">${statusChip(product.status, tone)}</div>
    <div class="product-info"><div class="product-meta"><span>${escapeHtml(product.sku)}</span><span>${escapeHtml(product.updated)}</span></div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.category)} · ${escapeHtml(product.market)} · ${product.assets} 个素材</p><div class="product-footer"><button class="button button--primary" data-action="design-product" data-id="${product.id}"><span data-icon="sparkles"></span>开始设计</button><button class="button button--secondary" data-action="download-product" data-id="${product.id}" aria-label="下载${escapeHtml(product.name)}"><span data-icon="download"></span></button></div></div>
  </article>`;
}

function renderStudio() {
  const product = selectedProduct();
  const concepts = state.concepts.filter((c) => c.productId === product.id);
  const p = state.ui.params;
  const approved = concepts.some((c) => c.status === '已确认');
  const generationCost = Number(p.count || 4) * 12;
  const latest = state.ui.lastGeneration;
  return `<section class="view">
    ${pageHeading('KIDS PRODUCT DESIGN STUDIO', '儿童帐篷设计工作台', '按结构、年龄、主题和使用场景生成童趣概念图；确认后进入白底图与全球素材生产。', `<button class="button button--secondary" data-action="open-import"><span data-icon="upload"></span>新增 SKU</button>`)}
    <div class="studio-layout">
      <aside class="card control-panel">
        <div class="card-header"><div><h3>童趣生成控制台</h3><p>点击图片即可选择，所见即所得</p></div>${statusChip('演示生成', 'amber')}</div>
        <div class="control-section control-section--basics">
          <label class="field"><span>当前产品</span><select id="studio-product">${state.products.map((item) => `<option value="${item.id}" ${item.id === product.id ? 'selected' : ''}>${escapeHtml(item.sku)} · ${escapeHtml(item.name)}</option>`).join('')}</select></label>
          <label class="field"><span>目标市场</span><select data-param="market">${['北美','欧洲','澳新','中东','东南亚','全球通用'].map((v) => `<option ${p.market === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="field"><span>适用年龄</span><select data-param="age">${['18个月–3岁','3–6 岁','7–12 岁','全年龄亲子'].map((v) => `<option ${p.age === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        </div>
        <div class="control-columns">
          <div class="control-column">
        <div class="control-section"><div class="control-title"><h4>结构类目</h4><span>8 种主流款式</span></div><div class="visual-choice-grid visual-choice-grid--structure">${kidsCategories.map((item) => `<button class="visual-choice ${product.category === item.name ? 'is-active' : ''}" data-choice-param="category" data-value="${escapeHtml(item.name)}" aria-pressed="${product.category === item.name}"><img src="${choiceImage('tent', item.key)}" alt="${escapeHtml(item.name)}真实产品图" loading="lazy" decoding="async"><span>${escapeHtml(item.name)}</span></button>`).join('')}</div></div>
        <div class="control-section"><div class="control-title"><h4>材质</h4><span>真实材质白底图</span></div><div class="visual-choice-grid visual-choice-grid--materials">${kidsMaterials.map((item) => `<button class="visual-choice ${p.material === item.name ? 'is-active' : ''}" data-choice-param="material" data-value="${escapeHtml(item.name)}" aria-pressed="${p.material === item.name}"><img src="${choiceImage('material', item.key)}" alt="${escapeHtml(item.short)}材质白底图" loading="lazy" decoding="async"><span>${escapeHtml(item.short)}</span></button>`).join('')}</div></div>
        <div class="control-section"><h4>主色</h4><div class="swatches">${['#7467de','#ff8fa4','#68bfa8','#ff9072','#ffd05e','#67bfe5','#b68ad6','#4a4f86'].map((color) => `<button class="swatch ${p.color === color ? 'is-active' : ''}" style="--swatch:${color}" data-color="${color}" aria-label="选择颜色 ${color}" aria-pressed="${p.color === color}"></button>`).join('')}</div></div>
          </div>
          <div class="control-column">
        <div class="control-section"><div class="control-title"><h4>使用场景</h4><span>支持本地图片融合</span></div><div class="visual-choice-grid visual-choice-grid--scenes">${kidsScenes.map((item) => `<button class="visual-choice ${p.scene === item.name ? 'is-active' : ''}" data-choice-param="scene" data-value="${escapeHtml(item.name)}" aria-pressed="${p.scene === item.name}"><img src="${choiceImage('scene', item.key)}" alt="${escapeHtml(item.name)}高端场景图" loading="lazy" decoding="async"><span>${escapeHtml(item.name)}</span></button>`).join('')}<button class="visual-choice visual-choice--upload ${p.scene === '本地上传场景' ? 'is-active' : ''}" data-action="upload-scene" aria-pressed="${p.scene === '本地上传场景'}">${state.ui.customSceneImage ? `<img src="${state.ui.customSceneImage}" alt="已上传场景预览">` : '<span class="upload-plus" aria-hidden="true">+</span>'}<span>${state.ui.customSceneImage ? '更换本地场景' : '上传本地场景'}</span><small>${state.ui.customSceneImage ? '已选择并参与融合' : 'JPG · PNG · WebP'}</small></button></div><input id="scene-upload" type="file" accept="image/png,image/jpeg,image/webp" hidden></div>
        <div class="control-section"><div class="control-title"><h4>帐篷装饰元素</h4><span>印花 · 贴布 · 绣花灵感</span></div><div class="visual-choice-grid visual-choice-grid--large visual-choice-grid--elements">${kidsThemes.map((item) => `<button class="visual-choice visual-choice--large ${p.theme === item.name ? 'is-active' : ''}" data-choice-param="theme" data-value="${escapeHtml(item.name)}" aria-pressed="${p.theme === item.name}"><img src="${choiceImage('element', item.key)}" alt="${escapeHtml(item.name)}帐篷装饰实物效果" loading="lazy" decoding="async"><span>${escapeHtml(item.name)}</span></button>`).join('')}</div></div>
        <div class="control-section"><div class="control-title"><h4>视觉风格</h4><span>真实帐篷摄影参考</span></div><div class="visual-choice-grid visual-choice-grid--large visual-choice-grid--styles">${kidsStyles.map((item) => `<button class="visual-choice visual-choice--large ${p.style === item.name ? 'is-active' : ''}" data-choice-param="style" data-value="${escapeHtml(item.name)}" aria-pressed="${p.style === item.name}"><img src="${choiceImage('style', item.key)}" alt="${escapeHtml(item.name)}真实帐篷视觉参考" loading="lazy" decoding="async"><span>${escapeHtml(item.name)}</span></button>`).join('')}</div></div>
          </div>
        </div>
        <div class="control-section"><label class="field"><span>补充要求</span><textarea data-param="prompt">${escapeHtml(p.prompt)}</textarea></label></div>
        <div class="generate-panel"><div class="cost-line"><span>预计生成 ${p.count || 4} 张</span><strong>将扣除 ${generationCost} 积分</strong></div><button class="button button--primary" data-action="generate-concepts" ${state.credits < generationCost ? 'disabled' : ''}><span data-icon="wand"></span>${state.credits < generationCost ? '积分不足' : '生成概念方案'}</button></div>
      </aside>
      <div class="studio-main">
        <div class="studio-stepper"><div class="step is-done"><span>1</span>产品建档</div><i class="step-line"></i><div class="step ${concepts.length ? 'is-done' : 'is-active'}"><span>2</span>概念出图</div><i class="step-line"></i><div class="step ${approved ? 'is-done' : 'is-active'}"><span>3</span>人工确认</div><i class="step-line"></i><div class="step ${approved ? 'is-active' : ''}"><span>4</span>白底图</div><i class="step-line"></i><div class="step"><span>5</span>全球素材</div></div>
        <div class="concept-toolbar"><p><strong>${escapeHtml(product.name)}</strong> · ${escapeHtml(product.category)} · ${concepts.length} 个概念方案</p><div class="generation-meta"><span>${svgIcon('clock')} ${latest ? `生成于 ${escapeHtml(latest.time)}` : '尚未开始新生成'}</span><strong>${latest ? `-${latest.cost} 积分` : `${generationCost} 积分 / 次`}</strong></div><div class="view-toggle"><button class="is-active" aria-label="网格视图" aria-pressed="true"><span data-icon="grid"></span></button><button aria-label="列表视图尚未开放" disabled><span data-icon="list"></span></button></div></div>
        ${concepts.length ? `<div class="concept-grid">${concepts.map((c, index) => conceptCard(c, product, index)).join('')}</div>` : `<div class="empty-state">${svgIcon('sparkles')}<div><h3>还没有童趣概念方案</h3><p>在左侧选择结构、年龄、装饰元素、颜色和风格，然后生成第一批方案。</p><button class="button button--primary" data-action="generate-concepts">生成概念方案</button></div></div>`}
      </div>
    </div>
  </section>`;
}

const sceneStyles = {
  space: ['radial-gradient(circle at 80% 18%,#ffe978 0 6%,transparent 6.4%),linear-gradient(155deg,#655fba,#a99eea 56%,#433d7d)', 'saturate(1.05)'],
  candy: ['radial-gradient(circle at 20% 22%,#fff 0 5%,transparent 5.4%),linear-gradient(155deg,#ffc4d0,#fff0cf 58%,#ff9bb1)', 'saturate(1.06)'],
  mint: ['linear-gradient(155deg,#c9f1e8,#fff6d9 58%,#8ed9cb)', 'saturate(.96)'],
  night: ['radial-gradient(circle at 78% 20%,#fff4a9 0 5%,transparent 5.5%),linear-gradient(155deg,#383b74,#777bc0 58%,#282a55)', 'brightness(.88) saturate(.9)'],
  forest: ['linear-gradient(155deg,#bfe5cc,#fff1cc 58%,#75b890)', 'saturate(.98)'],
};

function conceptCard(concept, product, index) {
  const [background, filter] = sceneStyles[concept.scene] || sceneStyles.space;
  const approved = concept.status === '已确认';
  const productVisual = concept.sceneImage && product.image.startsWith('data:image/svg+xml') ? tentImage(concept.palette || '#7467de', '#ffcf5b', '', categoryShape(product.category), true) : product.image;
  const rasterFusion = concept.sceneImage && !product.image.startsWith('data:image/svg+xml');
  return `<article class="concept-card ${approved ? 'is-approved' : ''}">
    <div class="concept-preview" style="--scene-bg:${background};--image-filter:${filter}">${concept.sceneImage ? `<img class="concept-scene-image" src="${concept.sceneImage}" alt=""><span class="scene-fusion-badge">本地场景融合</span>` : ''}<img class="concept-product-image ${rasterFusion ? 'is-raster-fusion' : ''}" src="${productVisual}" alt="${escapeHtml(concept.title)}概念效果"><span class="concept-tag">${escapeHtml(concept.theme || product.theme || '原创童趣')}</span><span class="concept-number">KIDS CONCEPT ${String(index + 1).padStart(2, '0')}</span></div>
    <div class="concept-card-body"><div class="concept-title-row"><div><h3>${escapeHtml(concept.title)}</h3><p>${escapeHtml(concept.note)}</p></div>${statusChip(concept.status, approved ? 'green' : 'amber')}</div>
      <div class="concept-actions"><button class="button ${approved ? 'button--secondary' : 'button--primary'}" data-action="approve-concept" data-id="${concept.id}">${svgIcon(approved ? 'package' : 'check')}${approved ? '生成白底图' : '确认方案'}</button><button class="button button--secondary" data-action="refresh-concept" data-id="${concept.id}" aria-label="重新生成">${svgIcon('refresh')}</button><button class="button button--secondary" data-action="download-concept" data-id="${concept.id}" aria-label="下载方案">${svgIcon('download')}</button></div>
    </div>
  </article>`;
}

function renderGlobal() {
  const store = selectedStore();
  const schemes = state.schemes.filter((s) => s.storeId === store?.id);
  return `<section class="view">
    ${pageHeading('GLOBAL KIDS RETAIL OUTREACH', '全球儿童渠道与本地化方案', '寻找玩具、儿童家居、母婴和亲子户外门店，结合当地年龄层与审美形成三套提案，再进入 WhatsApp 审核与触达。', `<button class="button button--secondary" data-action="open-compliance"><span data-icon="shield"></span>合规说明</button>`)}
    <div class="global-grid">
      <article class="card map-card">
        <div class="map-toolbar"><select class="select-control" id="store-country"><option>加拿大</option><option>美国</option><option>澳大利亚</option><option>德国</option><option>英国</option><option>阿联酋</option></select><input class="input-control" id="store-city" value="Vancouver" aria-label="城市或地区"><button class="button button--primary" data-action="search-stores"><span data-icon="search"></span>寻找儿童渠道</button></div>
        <div class="map-surface" aria-label="演示门店地图">${state.stores.map((s) => `<button class="map-pin ${s.id === store?.id ? 'is-active' : ''}" style="left:${s.x}%;top:${s.y}%" data-action="select-store" data-id="${s.id}" aria-label="选择${escapeHtml(s.name)}">${svgIcon('pin')}</button>`).join('')}<span class="map-label" style="left:12%;top:18%">PACIFIC NORTHWEST</span><span class="map-label" style="left:58%;top:22%">ROCKY MOUNTAINS</span><div class="map-legend"><strong>演示地图</strong> · 尚未连接 Google Earth / 商户数据接口</div></div>
      </article>
      <article class="card">
        <div class="card-header"><div><h3>候选儿童渠道</h3><p>${state.stores.length} 家 · 按品类与审美适配度排序</p></div>${statusChip('演示数据', 'amber')}</div>
        <div class="store-list">${state.stores.map((s) => `<button class="store-item ${s.id === store?.id ? 'is-active' : ''}" data-action="select-store" data-id="${s.id}"><div class="store-item-top"><strong>${escapeHtml(s.name)}</strong><span class="store-score">${s.score}%</span></div><p>${escapeHtml(s.city)}, ${escapeHtml(s.country)} · ${escapeHtml(s.type)}</p><div class="store-meta"><span>${escapeHtml(s.contact)}</span><span>${escapeHtml(s.source)}</span></div></button>`).join('')}</div>
      </article>
    </div>
    <div class="scheme-section">
      <div class="card-header" style="padding-left:0;padding-right:0"><div><h3>${store ? escapeHtml(store.name) : '选择一家门店'} · 三套本地化方案</h3><p>${store ? `${escapeHtml(store.city)}，结合气候、客群和渠道生成差异化提案` : '选择门店后生成方案'}</p></div><button class="button button--primary card-action" data-action="generate-schemes" ${store ? '' : 'disabled'}><span data-icon="sparkles"></span>${schemes.length ? '重新生成三套方案' : '生成三套方案'}</button></div>
      ${schemes.length ? `<div class="scheme-grid">${schemes.map((scheme, i) => schemeCard(scheme, i)).join('')}</div>` : `<div class="empty-state" style="min-height:230px">${svgIcon('globe')}<div><h3>等待生成本地化方案</h3><p>选择目标门店后，系统会给出三套主题、视觉方向、产品组合和沟通话术。</p></div></div>`}
    </div>
  </section>`;
}

function schemeCard(scheme, index) {
  const backgrounds = ['linear-gradient(135deg,#6d5fd4,#9a8df0)','linear-gradient(135deg,#ed7791,#ffb3a4)','linear-gradient(135deg,#3cae9c,#77d6c4)'];
  const sent = state.outreach.some((o) => o.schemeId === scheme.id);
  return `<article class="scheme-card"><div class="scheme-cover" style="--scheme-bg:${backgrounds[index % backgrounds.length]}"><span>方案 ${String.fromCharCode(65 + index)}</span><h3>${escapeHtml(scheme.title)}</h3></div><div class="scheme-body"><p>${escapeHtml(scheme.summary)}</p><div class="scheme-points">${scheme.points.map((point) => `<div class="scheme-point">${escapeHtml(point)}</div>`).join('')}</div><div class="scheme-actions"><button class="button button--secondary" data-action="export-scheme" data-id="${scheme.id}"><span data-icon="file"></span>提案</button><button class="button ${sent ? 'button--secondary' : 'button--primary'}" data-action="send-whatsapp" data-id="${scheme.id}"><span data-icon="send"></span>${sent ? '再次触达' : 'WhatsApp'}</button></div></div></article>`;
}

function renderDeliveries() {
  return `<section class="view">
    ${pageHeading('KIDS RETAIL DELIVERY COMPOSER', '交付中心', '把已确认的儿童帐篷与三套渠道方案组合成网站素材包、PPT 提纲和可打印产品手册。')}
    <div class="delivery-grid">
      ${deliveryCard('monitor', '网站素材包', '生成独立 HTML 产品页，可直接预览、发送或继续接入独立站。', 'HTML · 本地可打开', 'export-website')}
      ${deliveryCard('presentation', '儿童渠道 PPT', '导出结构化提案大纲，包含年龄层、结构类目、三套童趣方案与行动建议。', 'Markdown · 可复制', 'export-ppt')}
      ${deliveryCard('book', '儿童产品手册', '生成包含材质、通风、结构与使用场景的图文产品手册。', '打印 · PDF', 'print-manual')}
    </div>
    <article class="card" style="margin-top:18px"><div class="card-header"><div><h3>最近交付</h3><p>所有导出都保留产品和方案版本</p></div>${statusChip(`${state.deliveries.length} 个文件`, 'blue')}</div><div class="card-body"><table class="delivery-table"><thead><tr><th>名称</th><th>类型</th><th>状态</th><th>更新时间</th></tr></thead><tbody>${state.deliveries.map((d) => `<tr><td><strong>${escapeHtml(d.name)}</strong></td><td>${escapeHtml(d.type)}</td><td>${statusChip(d.status, 'green')}</td><td>${escapeHtml(d.updated)}</td></tr>`).join('')}</tbody></table></div></article>
  </section>`;
}

function deliveryCard(icon, title, copy, meta, action) {
  return `<article class="card delivery-card"><div class="delivery-icon">${svgIcon(icon)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p><div class="delivery-meta"><span>${escapeHtml(meta)}</span><span>·</span><span>基于当前产品</span></div><button class="button button--primary" data-action="${action}"><span data-icon="download"></span>生成并导出</button></article>`;
}

function renderSettings() {
  const s = state.settings;
  return `<section class="view">
    ${pageHeading('LOCAL-FIRST SETTINGS', '模型与设置', '首版优先保护客户产品资产和 API 凭据；真实外部连接需通过服务端安全适配器。')}
    <div class="settings-grid">
      <article class="card"><div class="card-header"><div><h3>模型与 API</h3><p>配置只保留状态和密钥后四位，本原型不保存完整密钥</p></div>${statusChip(s.keyConfigured ? '已配置' : '未连接', s.keyConfigured ? 'green' : 'amber')}</div><div class="settings-section">
        <div class="settings-row"><div><strong>服务提供方</strong><p>真实版本可按任务连接不同图片与文本模型</p></div><select class="select-control" id="provider-select"><option value="demo" ${s.provider === 'demo' ? 'selected' : ''}>演示适配器</option><option value="custom" ${s.provider === 'custom' ? 'selected' : ''}>自定义服务端代理</option></select></div>
        <div class="settings-row"><div><strong>默认模型</strong><p>用于概念图与全球化素材生产</p></div><select class="select-control" id="model-select"><option>图像模型（待接入）</option><option>企业自建模型</option><option>多模型自动路由</option></select></div>
        <div class="settings-row"><div><strong>API 密钥</strong><p>${s.keyConfigured ? `已保存配置状态 · 尾号 ${escapeHtml(s.keyLast4)}` : '完整密钥不会进入本地状态文件'}</p></div><div class="key-field"><input class="input-control" id="api-key" type="password" autocomplete="new-password" placeholder="输入后仅记录配置状态"><button class="button button--primary" data-action="save-key">保存</button></div></div>
      </div></article>
      <div style="display:grid;gap:18px;align-content:start">
        <article class="card"><div class="card-header"><div><h3>本地与更新</h3><p>桌面版运行策略</p></div></div><div class="settings-section">
          ${settingToggle('数据仅保存在本机', '产品图、生成记录和交付物不进入公共仓库', 'localOnly', s.localOnly)}
          ${settingToggle('启动时检查更新', '后续接入签名安装包与版本回滚', 'autoUpdate', s.autoUpdate)}
          ${settingToggle('发送前人工审核', '默认阻止未经确认的 WhatsApp 批量触达', 'reviewBeforeSend', s.reviewBeforeSend)}
        </div></article>
        <div class="security-note"><strong>安全边界</strong>当前前端不会发起真实 AI、Google Earth 或 WhatsApp 请求。生产版应把密钥放在本地安全凭据库或服务端代理中，禁止在界面、日志和导出文件中回显。</div>
      </div>
    </div>
  </section>`;
}

function settingToggle(title, copy, key, on) {
  return `<div class="settings-row"><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div><div style="text-align:right"><button class="toggle ${on ? 'is-on' : ''}" data-action="toggle-setting" data-key="${key}" role="switch" aria-checked="${on}" aria-label="${escapeHtml(title)}"></button></div></div>`;
}

function render() {
  const route = state.ui.route || 'dashboard';
  const views = { dashboard: renderDashboard, studio: renderStudio, library: renderLibrary, global: renderGlobal, deliveries: renderDeliveries, settings: renderSettings };
  $('#app-view').innerHTML = (views[route] || renderDashboard)();
  const balance = $('#points-balance');
  if (balance) balance.textContent = new Intl.NumberFormat('zh-CN').format(state.credits ?? 0);
  hydrateIcons($('#app-view'));
}

function showToast(title, detail, icon = 'check') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${svgIcon(icon)}</div><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div><button aria-label="关闭通知">${svgIcon('x')}</button>`;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  $('#toast-stack').append(toast);
  setTimeout(() => toast.remove(), 4400);
}

function showProgress(title, detail, done) {
  const overlay = document.createElement('div');
  overlay.className = 'progress-overlay';
  overlay.innerHTML = `<div class="progress-box"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p><div class="progress-track"><div class="progress-bar"></div></div><div class="progress-meta"><span>本地演示任务</span><strong>8%</strong></div></div>`;
  document.body.append(overlay);
  const bar = $('.progress-bar', overlay);
  const pct = $('.progress-meta strong', overlay);
  let progress = 8;
  const timer = setInterval(() => {
    progress = Math.min(96, progress + 12 + Math.floor(Math.random() * 12));
    bar.style.width = `${progress}%`;
    pct.textContent = `${progress}%`;
  }, 300);
  setTimeout(() => {
    clearInterval(timer);
    bar.style.width = '100%';
    pct.textContent = '100%';
    setTimeout(() => { overlay.remove(); done(); }, 260);
  }, 1900);
}

function addActivity(icon, title, detail) {
  state.activities.unshift({ icon, title, detail, time: '刚刚' });
  state.activities = state.activities.slice(0, 12);
}

function generateConcepts() {
  const product = selectedProduct();
  if (!product) return;
  const theme = state.ui.params.theme || product.theme || '原创童趣';
  const count = Number(state.ui.params.count || 4);
  const cost = count * 12;
  if ((state.credits ?? 0) < cost) { showToast('积分不足', `本次生成需要 ${cost} 积分，当前剩余 ${state.credits ?? 0} 积分`, 'shield'); return; }
  const sceneImage = state.ui.params.scene === '本地上传场景' ? state.ui.customSceneImage : '';
  const names = [
    [`${theme} · 故事乐园`, 'space', `${state.ui.params.color} · 大图形识别 · 玩具渠道`],
    [`${theme} · 糖果配色`, 'candy', `柔和撞色 · 圆角细节 · 电商主图`],
    [`${theme} · 自然之家`, 'mint', `低饱和薄荷色 · 亲子阅读 · 家居渠道`],
    [`${theme} · 星夜发光`, 'night', `夜间氛围 · 星点装饰 · 社交传播`],
  ];
  showProgress('正在生成概念方案', `${product.name} · ${state.ui.params.scene} · 本次扣除 ${cost} 积分`, () => {
    product.category = state.ui.params.category || product.category;
    product.age = state.ui.params.age;
    product.theme = theme;
    if (product.image.startsWith('data:image/svg+xml')) product.image = tentImage(state.ui.params.color, '#ffcf5b', product.sku, categoryShape(product.category));
    state.concepts = state.concepts.filter((c) => c.productId !== product.id || c.status === '已确认');
    const generatedAt = nowLabel();
    names.slice(0, count).forEach(([title, scene, note]) => state.concepts.push({ id: uid('concept'), productId: product.id, title, scene, sceneImage, theme, material: state.ui.params.material, palette: state.ui.params.color, note, status: '待确认', created: generatedAt }));
    state.credits -= cost;
    state.ui.lastGeneration = { time: generatedAt, cost, count, productId: product.id };
    product.concepts = state.concepts.filter((c) => c.productId === product.id).length;
    product.status = '设计中';
    product.updated = '刚刚';
    addActivity('sparkles', '新概念生成完成', `${product.name} · ${count} 套方案 · 扣除 ${cost} 积分`);
    saveState(); render(); showToast('概念方案已生成', `生成 ${count} 套方案，已扣除 ${cost} 积分`, 'sparkles');
  });
}

function approveConcept(id) {
  const concept = state.concepts.find((c) => c.id === id);
  if (!concept) return;
  const product = state.products.find((p) => p.id === concept.productId);
  if (concept.status === '已确认') {
    downloadWhiteBackground(product, concept);
    return;
  }
  state.concepts.filter((c) => c.productId === concept.productId).forEach((c) => { if (c.status === '已确认') c.status = '待确认'; });
  concept.status = '已确认';
  if (product) { product.assets += 1; product.status = '已确认'; product.updated = '刚刚'; }
  addActivity('check', '概念方案已确认', `${product?.name || ''} · ${concept.title}`);
  saveState(); render(); showToast('方案已确认', '现在可以输出白底图，并进入全球素材生产', 'check');
}

function refreshConcept(id) {
  const concept = state.concepts.find((c) => c.id === id);
  if (!concept) return;
  const variants = ['space', 'candy', 'mint', 'night', 'forest'];
  concept.scene = variants[(variants.indexOf(concept.scene) + 1) % variants.length];
  concept.note = `${state.ui.params.theme} · ${state.ui.params.style} · ${state.ui.params.market}`;
  concept.created = '刚刚';
  saveState(); render(); showToast('已生成一个新变体', '保留产品结构，更新了场景与视觉方向', 'refresh');
}

function downloadWhiteBackground(product, concept) {
  if (!product) return;
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="100%" height="100%" fill="white"/><image href="${product.image}" x="80" y="80" width="1440" height="960" preserveAspectRatio="xMidYMid meet"/><text x="80" y="1140" font-family="Arial" font-size="28" fill="#263c34">${escapeHtml(product.sku)} · ${escapeHtml(concept.title)} · 白底商品图</text></svg>`;
  downloadBlob(new Blob([content], { type: 'image/svg+xml' }), `${product.sku}_${concept.title}_白底图.svg`);
  addActivity('download', '白底图已导出', `${product.name} · ${concept.title}`);
  saveState();
  showToast('白底图已导出', '当前输出为可缩放 SVG 演示文件', 'download');
}

function generateSchemes() {
  const store = selectedStore();
  const product = selectedProduct();
  if (!store || !product) return;
  showProgress('正在分析当地市场', `${store.city} · ${store.type} · 自动形成三套方案`, () => {
    state.schemes = state.schemes.filter((s) => s.storeId !== store.id);
    const schemes = [
      { title: '亲子阅读角增长包', summary: `面向 ${store.city} 的年轻家庭，突出舒适陪伴、家居融合与安静阅读。`, points: [`主推 ${product.category} + 软垫组合`, '北欧简约配色 + 家居场景视觉', '门店陈列图 + 30 秒家长卖点'] },
      { title: '主题角色扮演系列', summary: `围绕 ${product.theme || state.ui.params.theme} 建立故事世界，用原创图形提升儿童吸引力。`, points: ['强化大图形识别与互动窗口', '三套可替换主题花型', '年龄分层产品页 + 安全信息页'] },
      { title: '睡衣派对社交套装', summary: `以派对、生日与亲子活动内容，为门店社交账号和节日促销引流。`, points: ['场景图 + 姓名定制展示', '节日短文案 + 套装销售结构', '网站素材包 + WhatsApp 首触话术'] },
    ];
    schemes.forEach((scheme) => state.schemes.push({ id: uid('scheme'), storeId: store.id, productId: product.id, ...scheme, created: '刚刚' }));
    addActivity('globe', '三套本地化方案已生成', `${store.name} · ${store.city}`);
    saveState(); render(); showToast('三套方案已完成', `已结合 ${store.city} 的演示市场信息生成`, 'globe');
  });
}

function searchStores() {
  const city = ($('#store-city')?.value || '目标城市').trim();
  const country = $('#store-country')?.selectedOptions[0]?.textContent || '目标国家';
  showProgress('正在寻找儿童用品渠道', `${country} · ${city} · 演示地图数据`, () => {
    const names = ['Wonder Nest Kids', 'Little Sprout Playroom', 'Tiny Trails Family Store', 'Cloudberry Nursery'];
    state.stores = names.map((name, index) => ({ id: uid('store'), name, city, country, type: ['精品玩具零售','儿童家居与玩具店','亲子户外用品店','母婴与儿童空间店'][index], score: 95 - index * 5, contact: `+** *** *** ${String(1820 + index * 137).slice(-4)}`, source: '演示地图数据', x: [18,42,66,78][index], y: [32,61,38,67][index] }));
    state.ui.selectedStoreId = state.stores[0].id;
    state.schemes = [];
    addActivity('search', '儿童渠道搜索完成', `${city} · 找到 ${state.stores.length} 家演示门店`);
    saveState(); render(); showToast('找到 4 家儿童渠道门店', '当前为演示数据，生产版需连接官方商户接口', 'pin');
  });
}

function sendWhatsapp(schemeId) {
  const scheme = state.schemes.find((s) => s.id === schemeId);
  const store = selectedStore();
  if (!scheme || !store) return;
  const message = `您好，${store.name} 团队：\n\n我们根据 ${store.city} 当地儿童用品市场，为贵店准备了“${scheme.title}”儿童帐篷合作方案。方案包含年龄分层、原创童趣视觉和销售素材，希望与您安排一次简短沟通。\n\n— TentFlow Kids 项目组`;
  if (state.settings.reviewBeforeSend) {
    const confirmed = window.confirm(`发送前审核（演示模式，不会真实发送）：\n\n${message}\n\n确认记录本次触达？`);
    if (!confirmed) return;
  }
  state.outreach.push({ id: uid('outreach'), schemeId, storeId: store.id, message, status: '演示已记录', sentAt: nowLabel() });
  addActivity('message', 'WhatsApp 触达已记录', `${store.name} · ${scheme.title}`);
  saveState(); render(); showToast('触达记录已保存', '演示模式未连接 WhatsApp，不会真实发送', 'send');
}

function catalogHtml() {
  const product = selectedProduct();
  const store = selectedStore();
  const schemes = state.schemes.filter((s) => s.storeId === store?.id);
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${escapeHtml(product?.name || 'TentFlow Kids')} 产品提案</title><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;margin:0;color:#35305f;background:#f7f5ff}main{max-width:960px;margin:auto;padding:56px}header{padding:48px;background:linear-gradient(135deg,#4d42a7,#7467de);color:white;border-radius:24px}h1{font-size:44px;margin:8px 0}.meta{color:#e7e3ff}.product{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;margin:32px 0;background:white;padding:28px;border-radius:20px}.product img{width:100%}.schemes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.scheme{background:white;padding:20px;border-radius:16px}.scheme span{color:#6254c8;font-weight:bold;font-size:12px}li{margin:8px 0}@media(max-width:700px){main{padding:18px}.product,.schemes{grid-template-columns:1fr}}</style><main><header><div>TENTFLOW KIDS · LOCAL PROPOSAL</div><h1>${escapeHtml(product?.name || '儿童帐篷产品')}</h1><p class="meta">${escapeHtml(store?.name || '全球儿童渠道')} · ${escapeHtml(store?.city || '')}</p></header><section class="product"><img src="${product?.image || ''}" alt="儿童帐篷产品图"><div><h2>${escapeHtml(product?.sku || '')}</h2><p>${escapeHtml(product?.category || '')} · ${escapeHtml(product?.age || '')} · ${escapeHtml(product?.market || '')}</p><p>从童趣概念、白底图到全球化营销素材，统一生成并可追溯。</p><p><strong>装饰元素：</strong>${escapeHtml(product?.theme || '通用童趣')}</p></div></section><h2>三套本地化方案</h2><section class="schemes">${(schemes.length ? schemes : [{title:'方案待生成',summary:'请先在全球儿童渠道页面生成三套方案。',points:[]}]).map((s,i)=>`<article class="scheme"><span>方案 ${String.fromCharCode(65+i)}</span><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.summary)}</p><ul>${s.points.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul></article>`).join('')}</section></main></html>`;
}

function exportWebsite() {
  const product = selectedProduct();
  downloadBlob(new Blob([catalogHtml()], { type: 'text/html;charset=utf-8' }), `${product?.sku || 'TentFlow'}_网站素材页.html`);
  recordDelivery(`${product?.name || '帐篷产品'}｜网站素材页`, '网站 HTML');
}

function exportPptOutline() {
  const product = selectedProduct();
  const store = selectedStore();
  const schemes = state.schemes.filter((s) => s.storeId === store?.id);
  const text = `# ${product?.name || '儿童帐篷产品'}｜儿童渠道合作提案\n\n## 1. 项目与产品\n- SKU：${product?.sku || ''}\n- 结构类目：${product?.category || ''}\n- 适用年龄：${product?.age || state.ui.params.age || ''}\n- 装饰元素：${product?.theme || state.ui.params.theme || ''}\n- 目标市场：${store?.city || '全球'}\n\n## 2. 当地市场洞察\n- 目标渠道：${store?.type || '儿童用品门店'}\n- 核心机会：年龄分层产品组合与统一童趣营销素材\n\n## 3. 三套方案\n${schemes.map((s,i)=>`### 方案 ${String.fromCharCode(65+i)}｜${s.title}\n${s.summary}\n${s.points.map(p=>`- ${p}`).join('\n')}`).join('\n\n') || '- 请先生成三套本地化方案'}\n\n## 4. 交付内容\n- 儿童帐篷概念图与白底图\n- 网站素材包与年龄/安全卖点\n- 产品手册与销售话术\n\n## 5. 下一步\n- 确认主推方案与原创图形\n- 确认样品、测试标准与报价\n- 安排首次沟通\n`;
  downloadBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), `${product?.sku || 'TentFlow'}_PPT提纲.md`);
  recordDelivery(`${product?.name || '帐篷产品'}｜经销商提案`, 'PPT 提纲');
}

function printManual() {
  const blobUrl = URL.createObjectURL(new Blob([catalogHtml()], { type: 'text/html;charset=utf-8' }));
  const win = window.open(blobUrl, '_blank', 'noopener');
  if (!win) { showToast('浏览器阻止了打印窗口', '请允许弹出窗口后重试', 'file'); return; }
  setTimeout(() => { try { win.print(); } finally { setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); } }, 600);
  recordDelivery(`${selectedProduct()?.name || '帐篷产品'}｜产品手册`, '打印 / PDF');
}

function recordDelivery(name, type) {
  state.deliveries.unshift({ id: uid('delivery'), name, type, status: '已生成', updated: '刚刚' });
  addActivity('files', '交付物生成完成', `${name} · ${type}`);
  saveState(); render(); showToast('交付物已生成', '文件已下载，并记录到交付中心', 'files');
}

function exportScheme(id) {
  const scheme = state.schemes.find((s) => s.id === id);
  const store = selectedStore();
  if (!scheme) return;
  const content = `# ${scheme.title}\n\n目标门店：${store?.name || ''}\n地区：${store?.city || ''}, ${store?.country || ''}\n\n${scheme.summary}\n\n${scheme.points.map((point) => `- ${point}`).join('\n')}\n\n生成时间：${nowLabel()}\n数据状态：演示市场数据\n`;
  downloadBlob(new Blob([content], { type: 'text/markdown;charset=utf-8' }), `${store?.name || '门店'}_${scheme.title}.md`);
  showToast('方案提案已导出', '已生成可复制的 Markdown 文件', 'download');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.replace(/[\\/:*?"<>|]/g, '_');
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadProduct(id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return;
  const anchor = document.createElement('a');
  anchor.href = product.image;
  anchor.download = `${product.sku}_${product.name}.svg`;
  anchor.click();
}

function openImport() {
  $('#import-modal').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#import-form input[name="name"]')?.focus(), 50);
}

function closeImport() {
  $('#import-modal').hidden = true;
  document.body.style.overflow = '';
  $('#import-form').reset();
  uploadImageData = '';
  $('#upload-preview').hidden = true;
}

async function shutdownApp() {
  if (!window.confirm('确认退出 TentFlow Studio？已保存的数据不会丢失。')) return;
  try {
    await fetch('/api/shutdown', { method: 'POST' });
    document.body.innerHTML = '<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#eff4f0;font-family:Segoe UI,Microsoft YaHei,sans-serif"><section style="max-width:520px;padding:42px;text-align:center;background:white;border:1px solid #dce4df;border-radius:20px"><h1 style="margin:0 0 8px;color:#173f33">TentFlow Studio 已退出</h1><p style="margin:0;color:#5f7069">本地数据已经保存，可以安全关闭此页面。</p></section></main>';
  } catch {
    showToast('暂时无法退出服务', '请关闭启动软件时打开的窗口后重试', 'power');
  }
}

function handleImport(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const color = '#7467de';
  const category = form.get('category');
  const product = { id: uid('product'), name: form.get('name'), sku: form.get('sku'), category, market: form.get('market'), age: '3–6 岁', theme: '森林动物', image: uploadImageData || tentImage(color, '#ffcf5b', String(form.get('sku')).slice(0, 10), categoryShape(category)), concepts: 0, assets: 1, status: '已建档', updated: '刚刚' };
  state.products.unshift(product);
  state.ui.selectedProductId = product.id;
  state.ui.params = { ...state.ui.params, category, age: product.age, theme: product.theme, color };
  addActivity('box', '新产品已导入', `${product.sku} · ${product.name}`);
  saveState(); closeImport(); setRoute('studio'); showToast('产品已加入素材库', '现在可以配置变量并生成概念方案', 'box');
}

function filterProducts() {
  const query = ($('#product-search')?.value || '').toLowerCase().trim();
  const category = $('#category-filter')?.value || '全部类别';
  const market = $('#market-filter')?.value || '全部市场';
  $$('[data-product-card]').forEach((card) => {
    const matches = (!query || card.dataset.search.includes(query)) && (category === '全部类别' || card.dataset.category === category) && (market === '全部市场' || card.dataset.market === market);
    card.hidden = !matches;
  });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button, [data-route]');
  if (!button) return;
  const route = button.dataset.route;
  if (route) { setRoute(route); return; }
  if (button.dataset.categoryPick) {
    const filter = $('#category-filter');
    if (filter) { filter.value = button.dataset.categoryPick; filterProducts(); filter.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  const action = button.dataset.action;
  if (!action) return;
  const id = button.dataset.id;
  const actions = {
    'open-import': openImport,
    'close-modal': closeImport,
    'new-design': () => setRoute('studio'),
    'design-product': () => { const product = state.products.find((item) => item.id === id); state.ui.selectedProductId = id; if (product) state.ui.params = { ...state.ui.params, category: product.category, age: product.age || '3–6 岁', theme: product.theme || '森林动物', market: product.market }; setRoute('studio'); },
    'download-product': () => downloadProduct(id),
    'generate-concepts': generateConcepts,
    'approve-concept': () => approveConcept(id),
    'refresh-concept': () => refreshConcept(id),
    'download-concept': () => { const c = state.concepts.find((item) => item.id === id); const p = state.products.find((item) => item.id === c?.productId); if (c && p) downloadWhiteBackground(p, c); },
    'upload-scene': () => $('#scene-upload')?.click(),
    'search-stores': searchStores,
    'select-store': () => { state.ui.selectedStoreId = id; saveState(); render(); },
    'generate-schemes': generateSchemes,
    'send-whatsapp': () => sendWhatsapp(id),
    'export-scheme': () => exportScheme(id),
    'export-website': exportWebsite,
    'export-ppt': exportPptOutline,
    'print-manual': printManual,
    'open-compliance': () => showToast('合规边界', '地图商户数据与 WhatsApp 需使用官方接口、授权、模板审批和退订机制', 'shield'),
    'shutdown-app': shutdownApp,
    'toggle-setting': () => { const key = button.dataset.key; state.settings[key] = !state.settings[key]; saveState(); render(); },
    'save-key': () => { const value = $('#api-key')?.value.trim(); if (!value) { showToast('没有保存', '请输入密钥或服务端访问令牌', 'key'); return; } state.settings.keyConfigured = true; state.settings.keyLast4 = value.slice(-4); $('#api-key').value = ''; saveState(); render(); showToast('配置状态已保存', '为安全起见，原型没有保存完整密钥', 'shield'); },
  };
  actions[action]?.();
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.id === 'studio-product') {
    state.ui.selectedProductId = target.value;
    const product = selectedProduct();
    state.ui.params = { ...state.ui.params, category: product.category, age: product.age || '3–6 岁', theme: product.theme || '森林动物', market: product.market };
    saveState(); render(); return;
  }
  if (target.dataset.param) {
    state.ui.params[target.dataset.param] = target.value;
    if (target.dataset.param === 'category') {
      const product = selectedProduct();
      product.category = target.value;
      if (product.image.startsWith('data:image/svg+xml')) product.image = tentImage(state.ui.params.color, '#ffcf5b', product.sku, categoryShape(product.category));
      render();
    }
    saveState();
  }
  if (['product-search','category-filter','market-filter'].includes(target.id)) filterProducts();
  if (target.id === 'product-image') {
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { uploadImageData = reader.result; const preview = $('#upload-preview'); preview.src = uploadImageData; preview.hidden = false; };
    reader.readAsDataURL(file);
  }
  if (target.id === 'scene-upload') {
    const file = target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('场景图片过大', '请选择 10MB 以内的 JPG、PNG 或 WebP 图片', 'image'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.ui.customSceneImage = reader.result;
      state.ui.params.scene = '本地上传场景';
      saveState(); render(); showToast('本地场景已加入', '下一次生成会把产品融合到该场景中', 'image');
    };
    reader.readAsDataURL(file);
  }
  if (target.id === 'provider-select') { state.settings.provider = target.value; saveState(); }
  if (target.id === 'model-select') { state.settings.model = target.value; saveState(); }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.dataset.param) { state.ui.params[target.dataset.param] = target.value; saveState(); }
  if (target.id === 'product-search') filterProducts();
});

document.addEventListener('click', (event) => {
  const swatch = event.target.closest('[data-color]');
  if (swatch) {
    state.ui.params.color = swatch.dataset.color;
    const product = selectedProduct();
    if (product?.image.startsWith('data:image/svg+xml')) product.image = tentImage(state.ui.params.color, '#ffcf5b', product.sku, categoryShape(product.category));
    saveState(); render();
  }
  const visualChoice = event.target.closest('[data-choice-param]');
  if (visualChoice) {
    const key = visualChoice.dataset.choiceParam;
    const value = visualChoice.dataset.value;
    state.ui.params[key] = value;
    const product = selectedProduct();
    if (key === 'category' && product) {
      product.category = value;
      if (product.image.startsWith('data:image/svg+xml')) product.image = tentImage(state.ui.params.color, '#ffcf5b', product.sku, categoryShape(value));
    }
    if (key === 'theme' && product) product.theme = value;
    saveState(); render();
    return;
  }
  const chip = event.target.closest('[data-style]');
  if (chip) { state.ui.params.style = chip.dataset.style; saveState(); render(); }
  const theme = event.target.closest('[data-theme]');
  if (theme) { state.ui.params.theme = theme.dataset.theme; saveState(); render(); }
});

$('#mobile-menu').addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  $('#mobile-menu').setAttribute('aria-expanded', String(open));
});
$('#import-form').addEventListener('submit', handleImport);
$('#import-modal').addEventListener('click', (event) => { if (event.target.id === 'import-modal') closeImport(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#import-modal').hidden) closeImport(); });
window.addEventListener('hashchange', () => setRoute(location.hash.slice(1), false));

async function boot() {
  hydrateIcons();
  await loadState();
  setRoute(location.hash.slice(1) || state.ui.route || 'dashboard', false);
}

boot();
