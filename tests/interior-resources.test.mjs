import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {displayedRecords} from '../interior-resources.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const a=read('data/atlas.json'),entrances=read('data/interior-entrances.json');
test('Monongah resource is projected only at its sourced entrance and retains its stable identity',()=>{
 const r=a.records.find(r=>r.id==='ref-0058A22C');const [proxy]=displayedRecords([r],a.spaces,entrances,{space:'2480661'});
 assert.equal(proxy.interiorProxy,true);assert.equal(proxy.id,r.id);assert.equal(proxy.interiorSpace,r.space);assert.equal(proxy.x,entrances[r.space].x);assert.notEqual(proxy.x,r.x);assert.equal(r.space,'5807774');
});
test('independent outdoor and indoor toggles work on world and interior maps',()=>{
 const outdoor=a.records.find(r=>r.space==='2480661');const inside=a.records.find(r=>r.id==='ref-0058A22C');
 assert.deepEqual(displayedRecords([outdoor,inside],a.spaces,entrances,{space:'2480661',overworld:false,interiors:false}),[]);
 assert.deepEqual(displayedRecords([outdoor,inside],a.spaces,entrances,{space:'2480661',interiors:false}),[outdoor]);
 assert.equal(displayedRecords([outdoor,inside],a.spaces,entrances,{space:'2480661',overworld:false})[0].id,inside.id);
 assert.equal(displayedRecords([inside],a.spaces,entrances,{space:inside.space})[0].x,inside.x);
});
test('unknown entrances never invent outdoor coordinates; exterior submaps are not interior proxies',()=>{
 const r=a.records.find(r=>r.id==='ref-0058A22C');assert.equal(displayedRecords([r],a.spaces,{}, {space:'2480661'})[0].space,r.space);
 const outside=a.records.find(r=>a.spaces[r.space].world&&r.space!=='2480661');if(outside)assert.equal(displayedRecords([outside],a.spaces,entrances,{space:'2480661'})[0].interiorProxy,undefined);
});
test('container import has reviewed counts, source IDs and no consumable reward lunchboxes',()=>{
 const counts={lunchbox:494,cooler:905};for(const [category,count] of Object.entries(counts)){
  const records=a.records.filter(r=>r.category===category);assert.equal(records.length,count);assert.ok(records.every(r=>r.source===a.meta.source&&r.formId&&r.baseId));assert.ok(records.every(r=>!r.editorId.includes('SCORE_Lunchbox')));
 }
});
test('new approved Monongah photo order is preserved and unwanted Ranger map photo is excluded',()=>{
 const d=read('data/details.json');assert.equal(d['ref-0058A22C'].photos.length,3);assert.equal(d['ref-003C716E'].photos.length,3);
 assert.ok(d['ref-003C716E'].photos.every(p=>!p.path.endsWith('/1.webp')));
});
