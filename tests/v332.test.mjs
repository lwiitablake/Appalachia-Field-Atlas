import test from 'node:test';import assert from 'node:assert/strict';
import {authorizedModerator,bodyHash,validatePhotos} from '../scripts/photo-review.mjs';
import {makeSubmission,validatePhotoFiles} from '../photo-submissions.js';import {clampZoom} from '../photo-gestures.js';
const p=makeSubmission({id:'ref-0073BD97'},[{filename:'one.png',view:'Overview / far away',caption:'Tower approach',alt:'Stone stairs lead up to the lookout tower.',tags:['Landmark','Route']}],'Go up the stairs');
const issue={number:5,user:{login:'test-user'},body:'```json\n'+JSON.stringify(p)+'\n```\n![Photo](https://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc)'};
test('moderator publication requires both trusted identity and repository permission',()=>{assert.ok(authorizedModerator('Lwiitablake',['lwiitablake'],'admin'));assert.equal(authorizedModerator('attacker',['lwiitablake'],'admin'),false);assert.equal(authorizedModerator('lwiitablake',['lwiitablake'],'read'),false);});
test('photo review parses known IDs and rejects missing attachments and arbitrary download hosts',()=>{assert.equal(validatePhotos(issue,new Set([p.recordId])).urls.length,1);assert.throws(()=>validatePhotos(issue,new Set()));assert.throws(()=>validatePhotos({...issue,body:issue.body.replace('github.com/user-attachments/assets','evil.example/assets')},new Set([p.recordId])));});
test('review digest changes when the approved submission changes',()=>{assert.notEqual(bodyHash(issue.body),bodyHash(issue.body+' edited'));});
test('photo drafts and zoom have bounded sizes',()=>{assert.throws(()=>makeSubmission({id:'a'},[],'test'));assert.equal(clampZoom(.1),1);assert.equal(clampZoom(12),4);assert.equal(clampZoom(2),2);});
test('browse and drop share photo type, count and size validation',()=>{const photo={type:'image/png',size:8*1024*1024};assert.equal(validatePhotoFiles([photo]).length,1);assert.equal(validatePhotoFiles(Array(8).fill(photo)).length,8);assert.throws(()=>validatePhotoFiles([]));assert.throws(()=>validatePhotoFiles(Array(9).fill(photo)));assert.throws(()=>validatePhotoFiles([{...photo,size:photo.size+1}]));assert.throws(()=>validatePhotoFiles([{type:'text/html',size:10}]));});
test('new photo submissions require independent alt text and valid tags through moderation',()=>{
 const photo=p.photos[0];
 assert.equal(p.schema,2);assert.notEqual(photo.alt,photo.caption);assert.deepEqual(photo.tags,['Landmark','Route']);
 for(const patch of [{alt:''},{alt:'   '},{alt:'x'.repeat(501)},{tags:[]},{tags:['Unknown']},{tags:['Route','Route']}]){
  assert.throws(()=>makeSubmission({id:p.recordId},[{...photo,...patch}],''));
  const changed={...p,photos:[{...photo,...patch}]};
  assert.throws(()=>validatePhotos({...issue,body:'```json\n'+JSON.stringify(changed)+'\n```\nhttps://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc'},new Set([p.recordId])));
 }
 const approved=validatePhotos(issue,new Set([p.recordId]));assert.equal(approved.photos[0].alt,photo.alt);assert.deepEqual(approved.photos[0].tags,photo.tags);
});
test('legacy pending photo submissions remain reviewable',()=>{
 const legacy={...p,schema:1,photos:p.photos.map(({alt,tags,...photo})=>photo)};
 const oldIssue={...issue,body:'```json\n'+JSON.stringify(legacy)+'\n```\nhttps://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc'};
 assert.equal(validatePhotos(oldIssue,new Set([p.recordId])).photos[0].caption,'Tower approach');
});
