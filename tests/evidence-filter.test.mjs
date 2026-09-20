import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesEvidence} from '../editorial.js';
const r={id:'one',area:'Area',category:'bobblehead'};
const photo={path:'assets/photos/test.webp',source:'https://example.org/source',credit:'Author',license:'License',alt:'Photo'};
test('source filters select either checked evidence type and include combined evidence',()=>{
 for(const hasPhoto of [false,true])for(const hasGuide of [false,true]){
  const d=hasPhoto?{one:{photos:[photo]}}:{};
  const g=hasGuide?{Area:{bobblehead:['Guide']}}:{};
  assert.equal(Boolean(matchesEvidence(r,g,d,false,false)),true);
  assert.equal(Boolean(matchesEvidence(r,g,d,true,false)),hasPhoto);
  assert.equal(Boolean(matchesEvidence(r,g,d,false,true)),hasGuide);
  assert.equal(Boolean(matchesEvidence(r,g,d,true,true)),hasPhoto||hasGuide);
 }
});
test('yellow filter includes exact descriptions, not just area guides',()=>{
 assert.ok(matchesEvidence(r,{}, {one:{description:'Directions',source:'https://example.org',credit:'Author',license:'License'}},false,true));
});
