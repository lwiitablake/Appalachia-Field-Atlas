import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {mapPoint,worldPoint,matches,blankProgress,validateProgress,backgroundFor,LOCATION_CATEGORIES} from '../model.js';
import {LocalVault,validateEnvelope} from '../vault.js';
const atlas=JSON.parse(readFileSync(new URL('../data/atlas.json',import.meta.url)));
const guides=JSON.parse(readFileSync(new URL('../data/guides.json',import.meta.url)));
const storage=()=>{const values={};return {getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=v;},removeItem:k=>delete values[k]};};
const pass='test-only-long-forest-passphrase';
test('all backgrounds are bundled and unavailable styles fall back to satellite',()=>{
  const app=atlas.spaces['2480661'];
  assert.deepEqual(Object.keys(app.backgrounds).sort(),['game','military','native','satellite']);
  for(const [id,s] of Object.entries(atlas.spaces)){
    for(const b of Object.values(s.backgrounds))assert.ok(existsSync(new URL('../'+b.image,import.meta.url)));
    assert.equal(backgroundFor(s,'game').key,id==='2480661'?'game':'satellite');
    assert.equal(backgroundFor(s,'unknown').image,s.image);
  }
});
test('location coverage accounts for the complete source export without inventing travel flags',()=>{
  const c=atlas.meta.locationCoverage;
  assert.equal(c.locationRecords,c.matchedLocationRecords+c.unnamedLocationRecords+c.additionalNamedRecords);
  for(const [cat,n] of Object.entries({location:458,area:91,region:144,interior:204})){
    const records=atlas.records.filter(r=>r.category===cat);assert.equal(records.length,n);
    assert.ok(records.every(r=>r.travelStatus==='not-exported'));
  }
  assert.equal(Object.keys(atlas.spaces).length,205);
});
test('approximate pins occupy an associated source cell; directory pins are map centers',()=>{
  for(const r of atlas.records.filter(r=>['area','region'].includes(r.category))){
    assert.equal(r.accuracy,'representative-cell');
    assert.ok(r.cells.some(([x,y])=>r.x===(x+.5)*4096&&r.y===(y+.5)*4096));
  }
  for(const r of atlas.records.filter(r=>r.category==='interior')){
    assert.equal(r.x,atlas.spaces[r.space].cx);assert.equal(r.y,atlas.spaces[r.space].cy);
    assert.equal(r.accuracy,'map-center');
  }
});
test('location-only filters exclude loot and retain search and map scope',()=>{
  const result=atlas.records.filter(r=>matches(r,{categories:LOCATION_CATEGORIES,space:'2480661'},blankProgress()));
  assert.equal(result.length,693);assert.ok(result.every(r=>LOCATION_CATEGORIES.includes(r.category)));
  assert.ok(result.some(r=>matches(r,{query:'flatwoods'},blankProgress())));
});
test('journals accept both legacy identities and newly added location identities',()=>{
  const p=blankProgress();
  for(const cat of ['bobblehead','location','area','region','interior']){
    const r=atlas.records.find(r=>r.category===cat);p.items[r.id]={star:true,done:true,tags:['Revisit'],note:'saved'};
  }
  p.categoryStars=[...LOCATION_CATEGORIES];assert.deepEqual(validateProgress(p),p);
});
test('snapshot has expected version, coverage and unique stable identities',()=>{
  assert.equal(atlas.meta.gameVersion,'1.7.26.13');assert.equal(atlas.records.length,4300);
  assert.equal(new Set(atlas.records.map(r=>r.id)).size,4300);
  assert.equal(atlas.records.filter(r=>r.category==='bobblehead').length,683);
  assert.equal(atlas.records.filter(r=>r.category==='magazine').length,718);
  assert.ok(atlas.records.some(r=>r.area.includes('Dino Peaks')));
  assert.ok(atlas.records.some(r=>r.area.includes('High Knob')));
});
test('every coordinate has a space and source-backed image or explicit null',()=>{
  for(const r of atlas.records){assert.ok(atlas.spaces[r.space]);assert.ok(Number.isFinite(r.x)&&Number.isFinite(r.y));}
  for(const s of Object.values(atlas.spaces)){assert.ok(s.range>0);if(s.image)assert.ok(existsSync(new URL('../'+s.image,import.meta.url)));}
});
test('projection matches world bounds and round-trips all records',()=>{
  const s=atlas.spaces['2480661'];assert.deepEqual(mapPoint({x:s.cx,y:s.cy},s),[2048,2048]);
  assert.deepEqual(mapPoint({x:s.cx-s.range/2,y:s.cy+s.range/2},s),[4096,0]);
  for(const r of atlas.records){const [lat,lng]=mapPoint(r,atlas.spaces[r.space]);const p=worldPoint({lat,lng},atlas.spaces[r.space]);assert.ok(Math.abs(p.x-r.x)<1e-7&&Math.abs(p.y-r.y)<1e-7);}
});
test('search supports plurals, IDs, notes, tags, and distinct progress views',()=>{
  const r=atlas.records.find(r=>r.category==='bobblehead');const p=blankProgress();
  assert.ok(matches(r,{query:'bobbleheads'},p));assert.ok(matches(r,{query:r.formId},p));
  assert.equal(matches(r,{view:'stars'},p),false);p.items[r.id]={star:true,done:true,tags:['Copper route'],note:'Behind the door'};
  assert.ok(matches(r,{view:'stars',query:'copper'},p));assert.ok(matches(r,{query:'behind door',tag:'Copper route'},p));
  assert.equal(matches(r,{view:'unchecked'},p),false);assert.ok(matches(r,{view:'checked'},p));
  p.categoryStars=['bobblehead'];assert.ok(matches(r,{view:'categories'},p));
});
test('guided filter requires a guide for the actual category',()=>{
  assert.ok(matches({category:'bobblehead',area:'Landview Lighthouse'},{guided:true},blankProgress(),guides));
  assert.equal(matches({category:'caps',area:'Landview Lighthouse'},{guided:true},blankProgress(),guides),false);
});
test('all guides contain attribution and no unsourced image URLs',()=>{
  for(const g of Object.values(guides)){assert.match(g.source,/^https:\/\/fallout\.fandom\.com\/wiki\//);assert.equal(g.license,'CC BY-SA 3.0');assert.ok(g.credit);assert.ok(g.reviewed);}
});
test('guest saves fail; encrypted profile round-trip preserves all journal fields',async()=>{
  const st=storage(),v=new LocalVault(st);await assert.rejects(()=>v.save(blankProgress()),/Log in/);
  const p=await v.create('Test Profile',pass);p.items['ref-003C757A']={star:true,done:true,tags:['Want','Farm route'],note:'private journal note'};
  p.custom.push({id:'custom-11111111-2222-3333-4444-555555555555',name:'Copper camp',space:'2480661',x:10,y:20,directions:'Below the tree',category:'custom'});
  await v.save(p);const backup=v.export();assert.equal(backup.includes('private journal'),false);assert.equal(backup.includes(pass),false);
  v.lock();assert.equal(v.session,null);const restored=await v.login('test profile',pass);assert.equal(restored.items['ref-003C757A'].note,'private journal note');assert.equal(restored.custom[0].name,'Copper camp');
});
test('wrong passphrases and authenticated ciphertext tampering are rejected',async()=>{
  const v=new LocalVault(storage());await v.create('tester',pass);const b=JSON.parse(v.export());
  await assert.rejects(()=>v.login('tester','incorrect password'),/Incorrect/);
  b.cipher=(b.cipher[0]==='A'?'B':'A')+b.cipher.slice(1);
  await assert.rejects(()=>v.restore(JSON.stringify(b),pass,true),/Incorrect/);
});
test('encrypted export restores to another device; overwrites need explicit opt-in',async()=>{
  const v=new LocalVault(storage());await v.create('tester',pass);const b=v.export();const other=new LocalVault(storage());
  await other.restore(b,pass);assert.equal(other.session.envelope.name,'tester');
  await assert.rejects(()=>other.restore(b,pass),/Profile exists/);await other.restore(b,pass,true);
});
test('conflicting tabs cannot silently overwrite a newer completed save',async()=>{
  const s=storage(),a=new LocalVault(s),b=new LocalVault(s);await a.create('tester',pass);await b.login('tester',pass);
  await a.save(blankProgress());await assert.rejects(()=>b.save(blankProgress()),/another tab/);
});
test('duplicate signup, weak passphrases and malformed envelopes are rejected',async()=>{
  const v=new LocalVault(storage());await assert.rejects(()=>v.create('tester','short'),/12/);await v.create('tester',pass);
  await assert.rejects(()=>v.create('tester',pass),/already exists/);
  const b=JSON.parse(v.export());b.iterations=1;assert.throws(()=>validateEnvelope(b),/Unsupported/);
});
test('quota errors do not report a successful save or destroy the last envelope',async()=>{
  const s=storage(),v=new LocalVault(s);await v.create('tester',pass);const b=v.export();s.setItem=()=>{throw Error('Quota exceeded');};
  await assert.rejects(()=>v.save(blankProgress()),/Quota/);assert.equal(v.export(),b);
});
test('malformed marker coordinates and prototype-like item IDs are rejected',()=>{
  const p=blankProgress();p.items=JSON.parse('{"__proto__":{"tags":[],"note":""}}');assert.throws(()=>validateProgress(p),/Invalid item/);
  const q=blankProgress();q.custom=[{id:'custom-11111111-2222-3333-4444-555555555555',name:'x',space:'2480661',x:Infinity,y:0,directions:''}];assert.throws(()=>validateProgress(q),/Invalid custom/);
});
