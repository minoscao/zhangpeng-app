import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const context = vm.createContext({
  Blob,
  DataView,
  Date,
  Map,
  TextEncoder,
  Uint8Array,
  Uint32Array,
  URL,
  console,
  document: { createElement() { throw new Error('not used by ZIP unit test'); } },
  fetch,
  setTimeout,
});

vm.runInContext(readFileSync(new URL('../app/export.js', import.meta.url), 'utf8'), context);
const Exporter = context.DesignFlowExport;

assert.equal(Exporter.safeName('TENT / 悉尼:*?'), 'TENT-_-悉尼___');

const zip = Exporter.makeZip([
  { name: 'SKU-001/image-01.jpg', data: new TextEncoder().encode('image-bytes') },
  { name: 'manifest.json', data: new TextEncoder().encode('{"count":1}') },
]);
assert.equal(zip.type, 'application/zip');
assert.ok(zip.size > 100);

const bytes = new Uint8Array(await zip.arrayBuffer());
assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
const raw = new TextDecoder().decode(bytes);
assert.match(raw, /SKU-001\/image-01\.jpg/);
assert.match(raw, /manifest\.json/);

console.log('Export ZIP tests passed.');
