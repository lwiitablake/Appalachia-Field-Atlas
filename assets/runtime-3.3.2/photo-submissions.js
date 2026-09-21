export const PHOTO_LIMIT=8;
export const PHOTO_TAGS=['Bobblehead','Magazine','Caps stash','Power armor','Fusion core','Landmark','Entrance','Route','Interior','Other'];
export function validatePhotoMetadata(photo){
 if(typeof photo.alt!=='string'||!photo.alt.trim()||photo.alt.length>500)throw Error('Add alt text of 1–500 characters for every photo.');
 if(!Array.isArray(photo.tags)||!photo.tags.length||photo.tags.length>PHOTO_TAGS.length||new Set(photo.tags).size!==photo.tags.length||photo.tags.some(t=>!PHOTO_TAGS.includes(t)))throw Error('Choose what each photo shows using the tags.');
}

export function validatePhotoFiles(list){
 const files=Array.from(list);
 if(!files.length||files.length>PHOTO_LIMIT||files.some(f=>f.size>8*1024*1024||!['image/png','image/jpeg','image/webp'].includes(f.type)))throw Error('Use 1–8 PNG, JPEG or WebP files, at most 8 MB each.');
 return files;
}
export function makeSubmission(record,photos,notes){
 if(!record||!photos.length||photos.length>PHOTO_LIMIT)throw Error('Choose 1–8 photos.');
 if(photos.some(p=>!p.caption?.trim()||p.caption.length>300))throw Error('Give every image a caption of 1–300 characters.');
 photos.forEach(validatePhotoMetadata);
 if(notes.length>2000)throw Error('Keep the location notes under 2,000 characters.');
 return {schema:2,type:'photos',recordId:record.id,notes,rights:'Own in-game screenshots; underlying game rights retained by Bethesda / ZeniMax. Submitted for credited, noncommercial reference use.',photos:photos.map((p,i)=>({order:i+1,view:p.view,caption:p.caption.trim(),alt:p.alt.trim(),tags:[...p.tags],filename:p.filename}))};
}
export function submissionMarkdown(record,photos,notes){return '# Photo set: '+record.area+'\n\nPublic submission for moderator review. Nothing appears on the map until approved.\n\n```json\n'+JSON.stringify(makeSubmission(record,photos,notes),null,2)+'\n```\n\n## Attach photos below IN THE SAME ORDER as the list above\nDrag the selected screenshots into this GitHub editor. Do not submit until every image has uploaded. Moderators: check the order against the captions.\n';}
export function submissionEditor(record,repository,modal){
 modal('<h2 id="modal-title">Submit location photos</h2><p>Add an overview, approach, close-up and extra views. This draft stays on this device until you attach the files and submit on GitHub. GitHub submissions are public, including before approval.</p><form id="photo-form"><section id="photo-drop" class="photo-drop" aria-label="Photo selection" aria-describedby="photo-drop-help"><strong>Drag and drop screenshots here</strong><p id="photo-drop-help">PNG, JPEG or WebP · up to 8 photos · 8 MB each. Add photos in one or several batches. Existing captions and tags are kept. All photos in this set belong to this location.</p><label class="photo-browse">Browse files<input id="photo-files" type="file" accept="image/png,image/jpeg,image/webp" multiple aria-describedby="photo-drop-help photo-error"></label><p id="photo-selection-status" role="status" aria-live="polite">No photos selected.</p></section><div id="photo-drafts"></div><label>Location notes<textarea id="photo-notes" maxlength="2000" placeholder="Where to stand, what to look for, and which photo shows the item"></textarea></label><label class="checkline"><input type="checkbox" id="photo-rights" required> I took these in-game screenshots and consent to credited, noncommercial reference publication. I have removed private information.</label><p id="photo-error" role="alert"></p><button type="submit">Prepare GitHub submission</button></form><div id="photo-next"></div>');
 let drafts=[];const $=s=>document.querySelector(s);
 const invalidate=()=>$('#photo-next').replaceChildren();
 const announce=()=>{$('#photo-selection-status').textContent=`${drafts.length} of ${PHOTO_LIMIT} photos selected. Add tags, captions and alt text below.`;};
 function renderDrafts(focusIndex){
  const box=$('#photo-drafts');box.replaceChildren();announce();
  drafts.forEach((d,i)=>{
   const row=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=`Photo ${i+1}: ${d.file.name}`;row.append(legend);
   const im=document.createElement('img');im.src=d.url;im.alt=d.alt||`Preview of ${d.file.name}`;row.append(im);
   const label=document.createElement('label');label.textContent='View / distance';const select=document.createElement('select');
   for(const value of ['Overview / far away','Approach / closer','Detail / up close','Additional view']){const o=document.createElement('option');o.value=o.textContent=value;select.append(o);}select.value=d.view;select.onchange=()=>{d.view=select.value;invalidate();};label.append(select);row.append(label);
   const tags=document.createElement('fieldset'),tagLegend=document.createElement('legend');tagLegend.textContent='What does this photo show? Choose at least one.';tags.append(tagLegend);tags.className='photo-tags';
   for(const tag of PHOTO_TAGS){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=d.tags.includes(tag);c.onchange=()=>{d.tags=c.checked?[...d.tags,tag]:d.tags.filter(t=>t!==tag);invalidate();};l.append(c,document.createTextNode(tag));tags.append(l);}row.append(tags);
   for(const [key,title,max,placeholder] of [['caption','Caption (required)',300,'A visible caption: where to look or what this view explains.'],['alt','Alt text (required)',500,'Alt text describes the important visual details for someone who cannot see the photo.']]){
    const l=document.createElement('label'),input=document.createElement('textarea');l.textContent=title;input.required=true;input.maxLength=max;input.rows=3;input.value=d[key];input.placeholder=placeholder;
    if(key==='alt'){const help=document.createElement('p');help.id=`photo-alt-help-${i}`;help.textContent='Describe the item and its position, such as “Bobblehead on the stone wall beside the tower stairs.”';input.setAttribute('aria-describedby',help.id);l.append(input,help);}else l.append(input);
    input.oninput=()=>{d[key]=input.value;if(key==='alt')im.alt=input.value||`Preview of ${d.file.name}`;invalidate();};row.append(l);
   }
   const actions=document.createElement('div');actions.className='photo-draft-actions';
   for(const [text,delta] of [['Move earlier',-1],['Move later',1]]){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',`${text}: photo ${i+1}`);b.disabled=i+delta<0||i+delta>=drafts.length;b.onclick=()=>{[drafts[i],drafts[i+delta]]=[drafts[i+delta],drafts[i]];invalidate();renderDrafts(i+delta);};actions.append(b);}
   const remove=document.createElement('button');remove.type='button';remove.textContent='Remove photo';remove.setAttribute('aria-label',`Remove photo ${i+1}: ${d.file.name}`);remove.onclick=()=>{URL.revokeObjectURL(d.url);drafts.splice(i,1);invalidate();renderDrafts(Math.min(i,drafts.length-1));};actions.append(remove);row.append(actions);box.append(row);
  });
  if(focusIndex!==undefined){const row=box.children[focusIndex];if(row){row.tabIndex=-1;row.focus();}else $('#photo-files').focus();}
 }
 const selectFiles=list=>{let selected;try{selected=validatePhotoFiles(list);if(drafts.length+selected.length>PHOTO_LIMIT)throw Error(`This set can hold ${PHOTO_LIMIT} photos. Remove a photo before adding more.`);}catch(error){$('#photo-error').textContent=error.message;return;}
  for(const file of selected){drafts.push({file,url:URL.createObjectURL(file),caption:'',alt:'',tags:[],view:['Overview / far away','Approach / closer','Detail / up close','Additional view'][Math.min(drafts.length,3)]});}
  $('#photo-error').textContent='';invalidate();renderDrafts();
 };
 $('#photo-files').onchange=e=>{if(e.target.files.length)selectFiles(e.target.files);e.target.value='';};
 const drop=$('#photo-drop');let dragDepth=0;
 drop.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;drop.classList.add('is-dragging');});
 drop.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
 drop.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;drop.classList.remove('is-dragging');}});
 drop.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();dragDepth=0;drop.classList.remove('is-dragging');selectFiles(e.dataTransfer?.files||[]);});
 // Prevent an accidental drop elsewhere in the dialog from navigating away.
 const form=$('#photo-form');form.addEventListener('dragover',e=>e.preventDefault());form.addEventListener('drop',e=>{e.preventDefault();$('#photo-error').textContent='Drop your screenshots in the outlined photo area.';});
 $('#photo-form').onsubmit=e=>{e.preventDefault();if(!drafts.length){$('#photo-error').textContent='Choose or drop at least one photo first.';$('#photo-files').focus();return;}try{const photos=drafts.map(d=>({filename:d.file.name,view:d.view,caption:d.caption.trim(),alt:d.alt.trim(),tags:d.tags}));const body=submissionMarkdown(record,photos,$('#photo-notes').value.trim());const next=$('#photo-next');next.replaceChildren();const explanation=document.createElement('p');explanation.textContent='1. Download the draft text for your records. 2. Open GitHub. 3. Drag the original images into the issue in the listed order. 4. Submit. Approval happens separately.';next.append(explanation);const download=document.createElement('button');download.textContent='Download submission notes';download.onclick=()=>{const url=URL.createObjectURL(new Blob([body],{type:'text/markdown'})),a=document.createElement('a');a.href=url;a.download=record.id+'-submission.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};const link=document.createElement('a');link.href=`https://github.com/${repository}/issues/new?`+new URLSearchParams({title:`[Atlas photos] ${record.area}`,body});link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open GitHub to attach photos & submit';if(link.href.length>7000){link.href=`https://github.com/${repository}/issues/new?`+new URLSearchParams({title:`[Atlas photos] ${record.area}`});const label=document.createElement('label');label.textContent='Copy this complete draft into the GitHub issue before attaching photos';const draft=document.createElement('textarea');draft.readOnly=true;draft.value=body;draft.rows=8;label.append(draft);next.append(label);}next.append(download,link);}catch(error){$('#photo-error').textContent=error.message;}};
 $('#photo-notes').addEventListener('input',invalidate);$('#photo-rights').addEventListener('change',invalidate);
 document.querySelector('#modal').addEventListener('close',()=>drafts.forEach(d=>URL.revokeObjectURL(d.url)),{once:true});
}
