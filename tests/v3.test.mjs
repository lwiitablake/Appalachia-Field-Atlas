import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {evidenceFor,coordinates} from '../editorial.js';
import {repositoryFor,communityFor,submissionUrl} from '../community.js';
import {validateContribution} from '../scripts/community-import.mjs';
import {icon} from '../icons.js';
import {termsFor} from '../glossary.js';
const atlas=JSON.parse(readFileSync(new URL('../data/atlas.json',import.meta.url)));
test('source-quality terrain quadrants cover the map without changing coordinates',()=>{
 const tiles=atlas.spaces['2480661'].backgrounds.native.tiles;
 assert.equal(tiles.length,4);const positions=new Set();
 for(const t of tiles){assert.ok(existsSync(new URL('../'+t.image,import.meta.url)));assert.equal(t.bounds[1][0]-t.bounds[0][0],2048);assert.equal(t.bounds[1][1]-t.bounds[0][1],2048);positions.add(t.bounds[0].join(','));}
 assert.deepEqual([...positions].sort(),['0,0','0,2048','2048,0','2048,2048']);
});
test('NAR and power armor explain names without treating the train number as a level',()=>{
 const t=termsFor({area:'98 NAR Regional',name:'Bobblehead'});assert.equal(t.length,1);assert.match(t[0].name,/New Appalachian Railroad/);assert.match(t[0].text,/not a level/);assert.ok(t[0].url);
 assert.equal(termsFor({name:'Power armor'})[0].name,'PA · Power armor');
});
test('evidence does not mistake an overhead map for a sourced spot photo',()=>{
 const r={id:'test',area:'Place',category:'bobblehead'};
 assert.equal(evidenceFor(r,{}).classes,'');
 assert.equal(evidenceFor(r,{Place:{bobblehead:['Guide']}}).classes,'has-text');
 const d={test:{photos:[{path:'assets/photos/example.webp',source:'https://example.com/source',credit:'Creator',license:'CC0',alt:'Spot'}],description:'Detailed text',source:'https://example.com/text',credit:'Creator',license:'CC0'}};
 assert.equal(evidenceFor(r,{},d).classes,'has-photo has-text');
 d.test.photos[0].path='assets/photos/../../secret';assert.equal(evidenceFor(r,{},d).photos.length,0);
});
test('world coordinates retain source axes and omit unavailable elevation',()=>{
 assert.equal(coordinates({x:12.345,y:-4,z:9}),'X 12.35 · Y -4.00 · Z 9.00');
 assert.equal(coordinates({x:0,y:0}),'X 0.00 · Y 0.00');
});
test('community links follow a renamed Pages repository and encode text safely',()=>{
 assert.equal(repositoryFor({hostname:'owner.github.io',pathname:'/New-Atlas/'},'old/repo'),'owner/New-Atlas');
 assert.equal(repositoryFor({hostname:'localhost',pathname:'/'},'old/repo'),'old/repo');
 const u=new URL(submissionUrl('owner/repo',{id:'ref-00000001',name:'Place'},'comment','Hello & # world'));
 assert.ok(u.searchParams.get('body').includes('Hello & # world'));
 assert.throws(()=>submissionUrl('bad/repo/extra',{},'star',''));
});
test('community stars count one per author per location, separately from comments and tags',()=>{
 const entries=[{recordId:'a',type:'star',author:'one'},{recordId:'a',type:'star',author:'one'},{recordId:'a',type:'tag',text:'Route'},{recordId:'b',type:'star',author:'two'}];
 assert.deepEqual(communityFor(entries,'a'),{stars:1,tags:['Route'],comments:[]});
});
test('issue import validates IDs, types, lengths and GitHub identity without executing input',()=>{
 const issue={number:1,user:{login:'tester'},html_url:'https://github.com/owner/repo/issues/1',created_at:'2026-09-20',body:'```json\n'+JSON.stringify({recordId:'a',type:'comment',text:'<script>alert(1)</script>'})+'\n```'};
 const r=validateContribution(issue,new Set(['a']));assert.equal(r.author,'tester');assert.match(r.text,/<script>/);
 assert.throws(()=>validateContribution(issue,new Set(['other'])));
 assert.throws(()=>validateContribution({...issue,pull_request:{}},new Set(['a'])));
 assert.throws(()=>validateContribution({...issue,body:'```json\n{"recordId":"a","type":"tag","text":"'+'x'.repeat(41)+'"}\n```'},new Set(['a'])));
});
test('editorial assets have source attribution and complete data files exist',()=>{
 const details=JSON.parse(readFileSync(new URL('../data/details.json',import.meta.url)));
 for(const [id,d] of Object.entries(details)){
  assert.ok(atlas.records.some(r=>r.id===id));
  for(const p of d.photos||[]){assert.ok(existsSync(new URL('../'+p.path,import.meta.url)));assert.ok(p.credit&&p.license&&p.source&&p.alt);}
 }
 for(const category of ['bobblehead','magazine','caps','armor','fusion','location','area','region','interior','custom'])assert.ok(icon(category).length>10);
});
