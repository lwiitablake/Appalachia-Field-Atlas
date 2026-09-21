import test from 'node:test';import assert from 'node:assert/strict';
import {droppedPhotos,mergePhotos,photoPath} from '../photo-drop.js';
const photo=(name)=>({name,type:'image/jpeg',size:123,lastModified:456});
test('photo batches append, deduplicate identities and exclude unsupported files',()=>{const a=photo('a.jpg'),b=photo('b.jpg');assert.deepEqual(mergePhotos([a],[a,b,{name:'x.txt',type:'text/plain'}]),[a,b]);});
test('folder drop reads all directory batches and preserves browse-compatible relative paths',async()=>{
 const file=photo('one.jpg'),nested=photo('two.jpg'),entry=f=>({name:f.name,isFile:true,file:resolve=>resolve(f)});
 const directory=(name,batches)=>({name,isDirectory:true,createReader:()=>{let index=0;return {readEntries:resolve=>resolve(batches[index++]||[])};}});
 const root=directory('Photos',[[entry(file)],[directory('Sub',[[entry(nested)]])]]);
 const result=await droppedPhotos({items:[{kind:'file',webkitGetAsEntry:()=>root}],files:[]});
 assert.equal(result.length,2);assert.equal(photoPath(file),'Photos/one.jpg');assert.equal(photoPath(nested),'Photos/Sub/two.jpg');
 assert.equal(mergePhotos(result,[{...file,webkitRelativePath:'Photos/one.jpg'}]).length,2);
});
test('plain file drop works without directory APIs and reports inaccessible folders',async()=>{const f=photo('one.jpg');assert.deepEqual(await droppedPhotos({files:[f]}),[f]);await assert.rejects(droppedPhotos({items:[{kind:'file',getAsFile:()=>({name:'folder',size:0,type:''})}],files:[]}));});
