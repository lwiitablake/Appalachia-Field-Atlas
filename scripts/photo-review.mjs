import {validatePhotoMetadata} from '../photo-submissions.js';
import fs from 'node:fs';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
export const bodyHash=body=>crypto.createHash('sha256').update(body||'').digest('hex');
export function validatePhotos(issue,ids){
 if(issue.pull_request||!Number.isSafeInteger(issue.number)||!/^[a-z0-9-]+$/i.test(issue.user?.login||''))throw Error('Invalid issue identity.');
 const match=(issue.body||'').match(/```json\s*([\s\S]*?)\s*```/);if(!match)throw Error('Missing submission JSON.');const p=JSON.parse(match[1]);
 if(p.type!=='photos'||![1,2].includes(p.schema)||!ids.has(p.recordId)||!Array.isArray(p.photos)||p.photos.length<1||p.photos.length>8)throw Error('Invalid photo submission.');
 if(typeof p.notes!=='string'||p.notes.length>2000||p.rights!=='Own in-game screenshots; underlying game rights retained by Bethesda / ZeniMax. Submitted for credited, noncommercial reference use.')throw Error('Invalid notes or consent statement.');
 const urls=[...new Set((issue.body||'').match(/https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]{36}/gi)||[])];
 if(urls.length!==p.photos.length)throw Error('Attach exactly one GitHub image URL per photo, in the declared order.');
 p.photos.forEach((photo,i)=>{if(photo.order!==i+1||typeof photo.caption!=='string'||!photo.caption.trim()||photo.caption.length>300||!['Overview / far away','Approach / closer','Detail / up close','Additional view'].includes(photo.view))throw Error('Invalid photo caption or order.');});
 if(p.schema===2)p.photos.forEach(validatePhotoMetadata);
 return {...p,urls};
}
export function authorizedModerator(actor,users,permission){return users.some(u=>u.toLowerCase()===actor.toLowerCase())&&['admin','maintain','write'].includes(permission);}
export function allowedDownload(url){
 let u;try{u=new URL(url);}catch{return false;}
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')return false;
 return u.hostname==='github.com'&&u.pathname.startsWith('/user-attachments/assets/')
  ||u.hostname.endsWith('.githubusercontent.com')
  ||u.hostname==='github-production-user-asset-6210df.s3.amazonaws.com'
  ||/^github-production-user-asset-\d+\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$/.test(u.hostname);
}
export async function download(url){for(let i=0;i<5;i++){if(!allowedDownload(url))throw Error('Attachment redirect host not allowed: '+new URL(url).hostname);const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000)});if(r.status>=300&&r.status<400){url=new URL(r.headers.get('location'),url).href;continue;}if(!r.ok)throw Error('Attachment download failed.');const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>8*1024*1024)throw Error('Image exceeds 8 MB.');chunks.push(chunk);}return Buffer.concat(chunks);}throw Error('Too many redirects.');}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const repo=process.env.GITHUB_REPOSITORY,actor=process.env.GITHUB_ACTOR,num=process.env.ISSUE_NUMBER;
 if(!/^[\w.-]+\/[\w.-]+$/.test(repo||'')||!/^\d+$/.test(num||'')||!/^[\w-]+$/.test(actor||''))throw Error('Invalid workflow context.');
 const api=async path=>{const r=await fetch(`https://api.github.com/repos/${repo}/${path}`,{headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json'}});if(!r.ok)throw Error(`GitHub API ${r.status}`);return r.json();};
 const users=JSON.parse(fs.readFileSync('moderators.json')).githubUsers,perm=await api(`collaborators/${actor}/permission`);
 if(!authorizedModerator(actor,users,perm.permission))throw Error('Moderator allowlist and repository write access are both required.');
 const issue=await api(`issues/${num}`),atlas=JSON.parse(fs.readFileSync('data/atlas.json')),p=validatePhotos(issue,new Set(atlas.records.map(r=>r.id))),hash=bodyHash(issue.body);
 const summary=`Photo review for issue #${num}\n\nOpen https://github.com/${repo}/issues/${num} and inspect every image, caption, location, consent and private-information risk.\n\nPhotos: ${p.photos.length}\n\nReview hash: \`${hash}\`\n\nTo publish this exact issue body, rerun with publish=true and this review hash. A changed body is rejected.\n`;
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);console.log(summary);
 if(process.env.PUBLISH!=='true')process.exit(0);
 if(process.env.REVIEW_HASH!==hash)throw Error('Issue changed or review hash missing. Preview and review again.');
 const dir=`assets/photos/community/issue-${num}`;fs.mkdirSync(dir,{recursive:true});const photos=[];
 for(let i=0;i<p.photos.length;i++){const raw=`${dir}/${i+1}.input`,out=`${dir}/${i+1}.webp`;fs.writeFileSync(raw,await download(p.urls[i]));const converted=spawnSync('python',['scripts/sanitize-photo.py',raw,out],{encoding:'utf8'});fs.unlinkSync(raw);if(converted.status!==0)throw Error('Image verification/re-encoding failed: '+converted.stderr);photos.push({path:out,alt:p.photos[i].alt||p.photos[i].caption,caption:p.photos[i].caption,tags:p.photos[i].tags||[],scope:p.photos[i].view+' · Community submission; approved by '+actor,source:`https://github.com/${repo}/issues/${num}`,credit:issue.user.login+' / community screenshot',license:'Contributor consent for noncommercial reference; game imagery © Bethesda / ZeniMax',issue:Number(num)});}
 const details=JSON.parse(fs.readFileSync('data/details.json'));const entry=details[p.recordId]??={};entry.photos=[...(entry.photos||[]).filter(x=>x.issue!==Number(num)),...photos];if(entry.photos.length>40)throw Error('Location exceeds 40 photos; curate existing images first.');
 fs.writeFileSync('data/details.json',JSON.stringify(details,null,2)+'\n');
 const community=JSON.parse(fs.readFileSync('data/community.json'));community.entries=community.entries.filter(x=>!(x.issue===Number(num)&&x.type==='comment'));if(p.notes.trim())community.entries.push({issue:Number(num),recordId:p.recordId,type:'comment',text:p.notes.trim(),author:issue.user.login,url:`https://github.com/${repo}/issues/${num}`,date:issue.created_at});fs.writeFileSync('data/community.json',JSON.stringify(community,null,2)+'\n');
}
