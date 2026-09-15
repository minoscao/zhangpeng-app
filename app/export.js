(function exposeDesignFlowExport(global) {
  'use strict';

  const encoder = new TextEncoder();
  const CRC_TABLE = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    CRC_TABLE[index] = value >>> 0;
  }

  function crc32(bytes) {
    let value = 0xffffffff;
    for (const byte of bytes) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
    return (value ^ 0xffffffff) >>> 0;
  }

  function concat(parts) {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    parts.forEach((part) => { output.set(part, offset); offset += part.length; });
    return output;
  }

  function zipDate(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    };
  }

  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const stamp = zipDate();

    files.forEach(({ name, data }) => {
      const nameBytes = encoder.encode(name);
      const checksum = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, stamp.time, true);
      localView.setUint16(12, stamp.date, true);
      localView.setUint32(14, checksum, true);
      localView.setUint32(18, data.length, true);
      localView.setUint32(22, data.length, true);
      localView.setUint16(26, nameBytes.length, true);
      local.set(nameBytes, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0x0800, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, stamp.time, true);
      centralView.setUint16(14, stamp.date, true);
      centralView.setUint32(16, checksum, true);
      centralView.setUint32(20, data.length, true);
      centralView.setUint32(24, data.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);
      offset += local.length + data.length;
    });

    const central = concat(centralParts);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, central.length, true);
    endView.setUint32(16, offset, true);
    return new Blob([...localParts, central, end], { type: 'application/zip' });
  }

  function safeName(value) {
    return String(value || 'asset').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, '-').slice(0, 100);
  }

  async function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (!source.startsWith('data:image/')) image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('图片来源不允许批量读取，请先保存到素材库或逐张下载。'));
      image.src = source;
    });
  }

  async function imageBlob(source, format) {
    if (format === 'original') {
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) throw new Error('有图片已失效，无法加入压缩包。');
      return response.blob();
    }
    const image = await loadImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器无法转换图片格式。');
    if (format === 'jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.drawImage(image, 0, 0);
    return new Promise((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('图片格式转换失败。')),
      `image/${format}`,
      format === 'jpeg' || format === 'webp' ? 0.92 : undefined,
    ));
  }

  function extensionFor(blob, requested) {
    if (requested !== 'original') return requested === 'jpeg' ? 'jpg' : requested;
    if (blob.type.includes('webp')) return 'webp';
    if (blob.type.includes('png')) return 'png';
    return 'jpg';
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportAssetsZip({ assets, products, format = 'original', archiveName = 'designflow-assets' }) {
    if (!assets.length) throw new Error('当前范围没有可导出的素材。');
    const productMap = new Map(products.map((product) => [product.id, product]));
    const files = [];
    const manifest = [];
    for (let index = 0; index < assets.length; index += 1) {
      const asset = assets[index];
      const product = productMap.get(asset.productId);
      const blob = await imageBlob(asset.image, format);
      const ext = extensionFor(blob, format);
      const filename = `${safeName(product?.sku || 'unassigned')}/${safeName(asset.batchId || 'batch')}-${String(index + 1).padStart(2, '0')}.${ext}`;
      files.push({ name: filename, data: new Uint8Array(await blob.arrayBuffer()) });
      manifest.push({
        file: filename,
        sku: product?.sku || '',
        product: product?.name || '',
        batchId: asset.batchId || '',
        tags: asset.tags || [],
        prompt: asset.prompt || '',
        model: asset.model || '',
        review: asset.review || 'pending',
        evaluation: asset.evaluation || null,
        createdAt: asset.createdAt || '',
      });
    }
    files.push({ name: 'manifest.json', data: encoder.encode(JSON.stringify({ exportedAt: new Date().toISOString(), count: manifest.length, assets: manifest }, null, 2)) });
    const archive = makeZip(files);
    download(archive, `${safeName(archiveName)}.zip`);
    return { count: assets.length, bytes: archive.size };
  }

  global.DesignFlowExport = Object.freeze({ makeZip, exportAssetsZip, safeName });
})(globalThis);
