import test from 'node:test';import assert from 'node:assert/strict';
import {authorizedModerator,bodyHash,validatePhotos} from '../scripts/photo-review.mjs';
import {makeSubmission} from '../photo-submissions.js';import {clampZoom} from '../photo-gestures.js';
const p=makeSubmission({id:'ref-0073BD97'},[{filename:'one.png',view:'Overview / far away',caption:'Tower approach'}],'Go up the stairs');
const issue={number:5,user:{login:'test-user'},body:'```json\n'+JSON.stringify(p)+'\n```\n![Photo](https://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc)'};
test('moderator publication requires both trusted identity and repository permission',()=>{assert.ok(authorizedModerator('Lwiitablake',['lwiitablake'],'admin'));assert.equal(authorizedModerator('attacker',['lwiitablake'],'admin'),false);assert.equal(authorizedModerator('lwiitablake',['lwiitablake'],'read'),false);});
test('photo review parses known IDs and rejects missing attachments and arbitrary download hosts',()=>{assert.equal(validatePhotos(issue,new Set([p.recordId])).urls.length,1);assert.throws(()=>validatePhotos(issue,new Set()));assert.throws(()=>validatePhotos({...issue,body:issue.body.replace('github.com/user-attachments/assets','evil.example/assets')},new Set([p.recordId])));});
test('review digest changes when the approved submission changes',()=>{assert.notEqual(bodyHash(issue.body),bodyHash(issue.body+' edited'));});
test('photo drafts and zoom have bounded sizes',()=>{assert.throws(()=>makeSubmission({id:'a'},[],'test'));assert.equal(clampZoom(.1),1);assert.equal(clampZoom(12),4);assert.equal(clampZoom(2),2);});
