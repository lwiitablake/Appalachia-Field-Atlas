// The credential stays in this closure. Never persist or include it in errors.
export const OWNER_REPOSITORY='lwiitablake/Appalachia-Field-Atlas';
export const OWNER_LOGIN='lwiitablake';
const encodeText=s=>{const bytes=new TextEncoder().encode(s);let raw='';for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(raw);};
const decodeJSON=b=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g,'')),c=>c.charCodeAt(0))));
export function createOwnerClient(fetcher=globalThis.fetch){
 let token='',identity=null,pending=null,busy=false;
 const api=async(path,method='GET',body)=>{
  if(!token)throw Error('Connect your owner token first.');
  let res;try{res=await fetcher('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:body===undefined?undefined:JSON.stringify(body),redirect:'error',cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(90000)});}catch{throw Error('GitHub could not be reached. Keep this tab open and retry.');}
  if(!res.ok){const error=Error(res.status===401?'Token expired or invalid. Disconnect and reconnect.':res.status===403?'GitHub denied access or rate-limited this request. Check Contents and Pull requests permissions.':`GitHub request failed (${res.status}). Keep this tab open; review any saved branch before retrying.`);error.status=res.status;throw error;}
  return res.json();
 };
 const repoPath='/repos/'+OWNER_REPOSITORY;
 async function finishPR(){
  try{await api(repoPath+'/git/ref/heads/'+pending.branch);}catch(error){if(error.status!==404)throw error;await api(repoPath+'/git/refs','POST',{ref:'refs/heads/'+pending.branch,sha:pending.sha});}
  const q=new URLSearchParams({state:'all',head:OWNER_LOGIN+':'+pending.branch,base:pending.base});
  const existing=await api(repoPath+'/pulls?'+q);
  const pr=existing[0]||await api(repoPath+'/pulls','POST',{title:pending.title,head:pending.branch,base:pending.base,body:pending.body});
  if(!new RegExp('^https://github\\.com/'+OWNER_REPOSITORY+'/pull/\\d+$','i').test(pr.html_url||''))throw Error('Unexpected pull request URL. Review your branch on GitHub.');
  pending=null;return {url:pr.html_url};
 }
 return {
  get connected(){return !!identity;},get uploading(){return busy;},get pendingBranch(){return pending?`https://github.com/${OWNER_REPOSITORY}/tree/${pending.branch}`:null;},
  disconnect(){if(busy)throw Error('Wait for the current upload to finish before disconnecting.');token='';identity=null;pending=null;},
  async connect(value){if(busy||pending)throw Error('Finish the pending upload or disconnect first.');token=String(value).trim();identity=null;if(!token||/\s/.test(token)){token='';throw Error('Enter a valid token without spaces.');}try{const user=await api('/user'),repo=await api(repoPath);if(user.login?.toLowerCase()!==OWNER_LOGIN||repo.owner?.login?.toLowerCase()!==OWNER_LOGIN||!repo.permissions?.push)throw Error('Only the repository owner with write access may connect.');identity=user.login;return identity;}catch(error){token='';throw error;}},
  async submit({record,submission,images},status=()=>{}){
   if(!identity)throw Error('Connect your owner token first.');if(busy)throw Error('An upload is already running.');busy=true;
   try{
    if(pending){status('Recovering the existing upload branch…');return await finishPR();}
    if(!/^(ref-[A-Fa-f0-9]{8}|place-[a-f0-9]{16})$/.test(record.id)||submission.recordId!==record.id||images.length!==submission.photos.length||!images.length||images.length>8)throw Error('Invalid photo set.');
    if(images.some(x=>!x.base64||x.base64.length>12*1024*1024||!/^[A-Za-z0-9+/]+=*$/.test(x.base64)))throw Error('Invalid or oversized encoded image.');
    status('Reading the latest repository data…');const repo=await api(repoPath),base=repo.default_branch;
    const head=await api(repoPath+'/git/ref/heads/'+encodeURIComponent(base));const commit=await api(repoPath+'/git/commits/'+head.object.sha);
    const listing=await api(repoPath+'/git/trees/'+commit.tree.sha+'?recursive=1');if(listing.truncated)throw Error('Repository tree is too large; use the existing review workflow.');
    async function readJSON(path){const file=listing.tree.find(f=>f.path===path&&f.type==='blob');if(!file)throw Error('Required repository file missing: '+path);const blob=await api(repoPath+'/git/blobs/'+file.sha);if(blob.encoding!=='base64')throw Error('Unexpected GitHub file encoding.');return decodeJSON(blob.content);}
    const atlas=await readJSON('data/atlas.json');let valid=atlas.records.some(r=>r.id===record.id);if(!valid)valid=(await readJSON('data/interactable-ids.json')).includes(record.id);if(!valid)throw Error('This location no longer exists in the latest repository. Reload the atlas and check it.');
    const details=await readJSON('data/details.json'),community=await readJSON('data/community.json');const old=details[record.id]||{};
    if((old.photos?.length||0)+images.length>40)throw Error('This location would exceed 40 photos. Curate its existing gallery first.');
    const id=crypto.randomUUID(),branch='atlas-photos/'+id,folder='assets/photos/community/upload-'+id,source=`https://github.com/${OWNER_REPOSITORY}/tree/${branch}/${folder}`;
    const photos=submission.photos.map((p,i)=>({path:`${folder}/${i+1}.webp`,alt:p.alt,caption:p.caption,tags:p.tags,scope:p.view+' · Owner submission; publication requires pull-request merge',source,credit:identity+' / community screenshot',license:'Contributor consent for noncommercial reference; game imagery © Bethesda / ZeniMax',upload:id}));
    details[record.id]={...old,photos:[...(old.photos||[]),...photos]};if(submission.notes.trim())community.entries.push({upload:id,recordId:record.id,type:'comment',text:submission.notes.trim(),author:identity,url:source,date:new Date().toISOString()});
    const tree=[];for(let i=0;i<images.length;i++){status(`Uploading photo ${i+1} of ${images.length}…`);const blob=await api(repoPath+'/git/blobs','POST',{content:images[i].base64,encoding:'base64'});tree.push({path:photos[i].path,mode:'100644',type:'blob',sha:blob.sha});}
    // Persist credits at an immutable commit URL once the commit exists would require
    // another commit. Use the stable upload folder on the default branch instead;
    // the PR body provides preview links to its review branch before merge.
    const publishedSource=`https://github.com/${OWNER_REPOSITORY}/tree/${encodeURIComponent(base)}/${folder}`;
    for(const photo of photos)photo.source=publishedSource;
    if(submission.notes.trim())community.entries.at(-1).url=publishedSource;
    for(const [path,obj] of [['data/details.json',details],['data/community.json',community]]){const blob=await api(repoPath+'/git/blobs','POST',{content:encodeText(JSON.stringify(obj,null,2)+'\n'),encoding:'base64'});tree.push({path,mode:'100644',type:'blob',sha:blob.sha});}
    const newTree=await api(repoPath+'/git/trees','POST',{base_tree:commit.tree.sha,tree});const created=await api(repoPath+'/git/commits','POST',{message:'Add owner photo submission for '+record.id,tree:newTree.sha,parents:[head.object.sha]});
    pending={branch,base,title:'[Atlas photos] '+String(record.area||record.name).slice(0,150),body:`Owner photo submission for **${record.id}**. Review images, captions, alt text, tags, location and consent before merging. Nothing is published on the map until merge.\n\n[View all uploaded images](${source})\n\n`+photos.map((p,i)=>`Photo ${i+1}: ${p.caption.replace(/[\r\n]/g,' ')}\n\n![Photo ${i+1}](https://github.com/${OWNER_REPOSITORY}/blob/${branch}/${p.path}?raw=true)\n\nAlt text: ${p.alt.replace(/[\r\n]/g,' ')}\n\n`).join('')};
    pending.sha=created.sha;status('Creating the review branch and pull request…');return await finishPR();
   }finally{busy=false;}
  }
 };
}
export const ownerClient=createOwnerClient();
export async function prepareOwnerImage(file){
 let bitmap;try{bitmap=await createImageBitmap(file);if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>50000000)throw Error();const ratio=Math.min(1,3072/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));if(!blob||blob.type!=='image/webp'||blob.size>8*1024*1024)throw Error();const bytes=new Uint8Array(await blob.arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));return {base64:btoa(raw)};}catch{throw Error('A photo could not be safely decoded. Use PNG, JPEG or WebP, at most 50 megapixels and 8 MB.');}finally{bitmap?.close();}
}
export function ownerConnectionDialog(modal){
 modal('<h2 id="modal-title">Owner GitHub upload connection</h2><p>For lwiitablake / Appalachia-Field-Atlas only. This is separate from your local journal login. Your token goes directly to GitHub and stays in memory until disconnect or reload.</p><p>Use a fine-grained token for this repository with Contents and Pull requests: Read and write. Uploads create public review branches; merging publishes them.</p><form id="owner-connect-form"><label for="owner-token">Personal access token</label><input id="owner-token" type="password" autocomplete="off" spellcheck="false" autocapitalize="off" required><button type="submit">Verify owner connection</button></form><button id="owner-disconnect" type="button">Disconnect and clear token</button><p id="owner-status" role="status"></p>');
 const form=document.querySelector('#owner-connect-form'),input=document.querySelector('#owner-token'),status=document.querySelector('#owner-status');status.textContent=ownerClient.connected?'Owner connected. Open a location and choose Submit photos & notes.':'Not connected.';
 form.onsubmit=async e=>{e.preventDefault();const secret=input.value;input.value='';form.querySelector('button').disabled=true;status.textContent='Verifying with GitHub…';try{await ownerClient.connect(secret);status.textContent='Owner connected. Close this window, open a location, and choose Submit photos & notes.';}catch(error){status.textContent=error.message;}finally{form.querySelector('button').disabled=false;}};
 document.querySelector('#owner-disconnect').onclick=()=>{try{ownerClient.disconnect();input.value='';status.textContent='Disconnected. Token cleared.';}catch(error){status.textContent=error.message;}};
 if(ownerClient.pendingBranch){form.hidden=true;const retry=document.createElement('button'),link=document.createElement('a');retry.textContent='Finish the existing upload review';link.href=ownerClient.pendingBranch;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Inspect uploaded branch';status.after(retry,link);status.textContent='A previous upload has a saved review branch. Finish it before starting another set. Disconnecting forgets this recovery state but does not delete the branch.';retry.onclick=async()=>{retry.disabled=true;try{const result=await ownerClient.submit({},text=>status.textContent=text);status.textContent='Review request ready. Merge on GitHub to publish.';link.href=result.url;link.textContent='Open pull request';}catch(error){status.textContent=error.message;retry.disabled=false;}};}
}
