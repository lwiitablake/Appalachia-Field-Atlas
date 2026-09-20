import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {within,nearbyRecords} from '../navigation.js';
import {blankProgress} from '../model.js';
const atlas=JSON.parse(fs.readFileSync(new URL('../data/atlas.json',import.meta.url)));
const regions=JSON.parse(fs.readFileSync(new URL('../data/regions.json',import.meta.url)));
test('regional selectors reference bundled maps and include both expedition groups',()=>{
 for(const r of regions){assert.ok(atlas.spaces[r.space]);for(const id of r.interiors)assert.ok(atlas.spaces[id]);if(r.bounds){assert.ok(r.bounds[0]<r.bounds[2]);assert.ok(r.bounds[1]<r.bounds[3]);}}
 assert.ok(regions.find(r=>r.name==='Burning Springs').bounds);
 assert.equal(regions.find(r=>r.id==='directory').interiors.length,Object.keys(atlas.spaces).length);
 assert.ok(regions.find(r=>r.id==='atlantic-city').interiors.length>1);assert.ok(regions.find(r=>r.id==='the-pitt').interiors.length>1);
});
test('region filter includes bleed boundary and rejects points outside it',()=>{
 assert.ok(within({x:0,y:10},[0,0,10,10]));assert.equal(within({x:11,y:10},[0,0,10,10]),false);
});
test('nearby results exclude other spaces and distant points, prioritize search and filter types',()=>{
 const o={id:'o',space:'a',x:0,y:0};const make=(id,category,x,space='a')=>({id,name:id,area:id,category,x,y:0,space});
 const rs=[make('needle','caps',100),make('b','bobblehead',10),make('m','magazine',20),make('far','bobblehead',30000),make('wrong-space','caps',1,'b')];
 const result=nearbyRecords(rs,o,{query:'needle',categories:['caps']},blankProgress(),{});
 assert.deepEqual(result.map(x=>x.record.id),['needle','b','m']);
 assert.deepEqual(nearbyRecords(rs,o,{},blankProgress(),{},'magazine').map(x=>x.record.id),['m']);
});
