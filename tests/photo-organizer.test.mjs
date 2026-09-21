import test from 'node:test';import assert from 'node:assert/strict';
import {fileKey,validateAssignments} from '../photo-organizer.js';
test('photo identities survive reselection but distinguish paths and revisions',()=>{
 const f={name:'one.jpg',webkitRelativePath:'Photos/one.jpg',size:100,lastModified:123};
 assert.equal(fileKey(f),fileKey({...f}));assert.notEqual(fileKey(f),fileKey({...f,webkitRelativePath:'Photos/other/one.jpg'}));assert.notEqual(fileKey(f),fileKey({...f,lastModified:124}));
});
test('assignment backups preserve record links and reject unknown targets before import',()=>{
 const ids=new Set(['ref-one']),data={schema:1,assignments:[{key:'photo-key',recordId:'ref-one'}]};
 assert.deepEqual(validateAssignments(JSON.parse(JSON.stringify(data)),ids),{'photo-key':'ref-one'});
 assert.throws(()=>validateAssignments(data,new Set()));assert.throws(()=>validateAssignments({schema:2,assignments:[]},ids));assert.throws(()=>validateAssignments({schema:1,assignments:[{key:4,recordId:'ref-one'}]},ids));
});
