import fs from 'node:fs';import {fileURLToPath} from 'node:url';import path from 'node:path';
export function restorePhotoLinks(details,community,recovery,applied=[]){
 if(applied.includes(recovery.id))return {details,community,applied,added:0};
 let added=0;for(const {recordId,photo} of recovery.photos){const entry=details[recordId]??={};entry.photos??=[];if(!entry.photos.some(p=>p.path===photo.path)){entry.photos.push(photo);added++;}}
 for(const note of recovery.comments)if(!community.entries.some(e=>e.issue===note.issue&&e.recordId===note.recordId&&e.type===note.type))community.entries.push(note);
 return {details,community,applied:[...applied,recovery.id],added};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('../',import.meta.url),read=name=>JSON.parse(fs.readFileSync(new URL('data/'+name,root),'utf8'));
 const marker=new URL('data/photo-recoveries-applied.json',root),recovery=read('photo-recovery-20261010.json');
 for(const {photo} of recovery.photos){if(!photo.path.startsWith('assets/photos/')||photo.path.includes('..')||!fs.existsSync(new URL(photo.path,root)))throw Error('Recovery image is missing or invalid.');}
 const applied=fs.existsSync(marker)?read('photo-recoveries-applied.json'):[];
 const result=restorePhotoLinks(read('details.json'),read('community.json'),recovery,applied);
 if(!applied.includes(recovery.id)){for(const [name,value] of [['details.json',result.details],['community.json',result.community],['photo-recoveries-applied.json',result.applied]])fs.writeFileSync(new URL('data/'+name,root),JSON.stringify(value,null,2)+'\n');}
 console.log(`Photo recovery: ${result.added} links restored. Existing contributions preserved.`);
}
