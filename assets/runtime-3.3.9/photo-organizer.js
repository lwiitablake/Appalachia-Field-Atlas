import {photoPath,mergePhotos,droppedPhotos,supportedPhoto} from './photo-drop.js';
const KEY='field-atlas.photo-assignments.v1';
export const fileKey=f=>JSON.stringify([photoPath(f),f.size,f.lastModified]);
export function validateAssignments(data,ids){
 if(data?.schema!==1||!Array.isArray(data.assignments)||data.assignments.length>20000)throw Error('Not a valid photo-assignment backup.');
 const result={};
 for(const item of data.assignments){if(typeof item.key!=='string'||item.key.length>4000||!ids.has(item.recordId))throw Error('Backup contains an invalid photo or unknown location.');result[item.key]=item.recordId;}
 return result;
}
export function createPhotoOrganizer({modal,closeModal,getSelected,pickLocation,records,submit}){
 let files=[],chosen=new Set(),assignments={},filter='unassigned',query='',urls=[];
 let warning='';
 try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data)assignments=validateAssignments(data,new Set(records().map(r=>r.id)));}catch{warning='Saved assignments could not be loaded. Import a backup if available.';}
 const $=s=>document.querySelector(s);
 const name=r=>`${r.area} · ${r.name} · ${r.id}`;
 const release=()=>{urls.forEach(URL.revokeObjectURL);urls=[];};
 function save(){try{localStorage.setItem(KEY,JSON.stringify(backup()));warning='';}catch{warning='Browser storage is unavailable or full. Export assignments before closing this page.';}}
 const backup=()=>({schema:1,assignments:Object.entries(assignments).map(([key,recordId])=>({key,recordId}))});
 function message(text){$('#organizer-status').textContent=text;}
 function draw(){
  release();const grid=$('#organizer-grid');if(!grid)return;grid.replaceChildren();const r=getSelected();$('#organizer-location').textContent=r?name(r):'No map location selected.';
  const shown=files.filter(f=>{const id=assignments[fileKey(f)];return (filter==='all'||(filter==='unassigned'?!id:filter==='assigned'?!!id:id===r?.id))&&(photoPath(f)).toLowerCase().includes(query.toLowerCase());});
  $('#organizer-count').textContent=`${files.length} photos loaded · ${files.filter(f=>!assignments[fileKey(f)]).length} unassigned · ${chosen.size} selected · ${shown.length} shown`;
  $('#organizer-assign').disabled=!r||!chosen.size;$('#organizer-unassign').disabled=!chosen.size;$('#organizer-submit').disabled=!r||!chosen.size;
  for(const file of shown){const key=fileKey(file),card=document.createElement('article'),label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=chosen.has(key);check.onchange=()=>{check.checked?chosen.add(key):chosen.delete(key);$('#organizer-count').textContent=`${files.length} photos loaded · ${files.filter(f=>!assignments[fileKey(f)]).length} unassigned · ${chosen.size} selected · ${shown.length} shown`;$('#organizer-assign').disabled=!r||!chosen.size;$('#organizer-unassign').disabled=!chosen.size;$('#organizer-submit').disabled=!r||!chosen.size;};label.append(check,document.createTextNode(photoPath(file)));
   const img=document.createElement('img');img.src=URL.createObjectURL(file);urls.push(img.src);img.alt=`Local photo preview: ${file.name}`;img.loading='lazy';const status=document.createElement('p');const assigned=records().find(r=>r.id===assignments[key]);status.textContent=assigned?'Assigned: '+name(assigned):'Unassigned';card.append(img,label,status);grid.append(card);
  }
  if(!shown.length){const empty=document.createElement('p');empty.textContent=files.length?'No photos match this filter.':'Choose your photo folder to display images here.';grid.append(empty);}
 }
 function open(){
  modal(`<h2 id="modal-title">Local photo organizer</h2><p>Choose <strong>Photos_Fallout 76 Appalachia Atlas</strong> on your computer. Photos stay local. Assignments are saved unencrypted in this browser, separately from your private journal; export a backup to keep them.</p><section id="organizer-drop" class="photo-drop" aria-label="Add local photos" aria-describedby="organizer-drop-help"><strong>Drag photos or a photo folder here</strong><p id="organizer-drop-help">PNG, JPEG and WebP. Add several batches; existing previews and assignments are kept. Folder dropping depends on your browser; both browse options remain available.</p><label>Choose photo folder<input id="organizer-folder" type="file" webkitdirectory multiple></label><label>Or choose individual photos<input id="organizer-files" type="file" accept="image/png,image/jpeg,image/webp" multiple></label></section><p>Your browser may call folder selection an upload; this organizer only reads local previews. Re-select the same folder after reloading. Renaming or editing a file changes its identity.</p><div class="organizer-tools"><label>Show photos<select id="organizer-filter"><option value="unassigned">Unassigned</option><option value="assigned">Assigned</option><option value="current">Assigned to selected location</option><option value="all">All photos</option></select></label><label>Find filename<input id="organizer-search" type="search"></label></div><p id="organizer-count" role="status"></p><h3>Assignment location</h3><p id="organizer-location"></p><div class="organizer-tools"><button id="organizer-pick">Choose location on map</button><button id="organizer-assign">Assign selected photos here</button><button id="organizer-unassign">Clear selected assignments</button><button id="organizer-clear">Clear photo selection</button><button id="organizer-submit">Prepare selected photos for publication</button></div><p>Select photos, choose a map pin or search result, then confirm Assign. Publication is a separate step and still requires GitHub attachments and approval. Maximum eight photos per publication set.</p><p id="organizer-status" role="status" aria-live="polite"></p><div id="organizer-grid" class="organizer-grid"></div><div class="organizer-tools"><button id="organizer-export">Export assignments</button><label>Import assignment backup<input id="organizer-import" type="file" accept="application/json,.json"></label></div>`);
  $('#organizer-filter').value=filter;$('#organizer-search').value=query;
  const addPhotos=incoming=>{const accepted=incoming.filter(supportedPhoto),before=files.length;files=mergePhotos(files,incoming);draw();message(`${files.length-before} new photos added; ${incoming.length-accepted.length} unsupported files skipped. ${files.length} photos loaded.`);};
  const load=e=>{addPhotos(Array.from(e.target.files));e.target.value='';};
  $('#organizer-folder').onchange=load;$('#organizer-files').onchange=load;
  const drop=$('#organizer-drop');let depth=0,busy=false;
  drop.addEventListener('dragenter',e=>{e.preventDefault();depth++;drop.classList.add('is-dragging');});
  drop.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
  drop.addEventListener('dragleave',()=>{if(--depth<=0){depth=0;drop.classList.remove('is-dragging');}});
  drop.addEventListener('drop',async e=>{e.preventDefault();e.stopPropagation();depth=0;drop.classList.remove('is-dragging');if(busy){message('Please wait for the current folder to finish loading.');return;}busy=true;message('Reading local photos…');try{const pending=droppedPhotos(e.dataTransfer);const incoming=await pending;if(document.querySelector('#organizer-drop')===drop)addPhotos(incoming);}catch(error){if(document.querySelector('#organizer-drop')===drop)message('Could not read this drop: '+error.message);}finally{busy=false;}});
  const dialog=$('#modal');const blockDrop=e=>{e.preventDefault();if(e.type==='drop')message('Drop photos in the outlined area above.');};dialog.addEventListener('dragover',blockDrop);dialog.addEventListener('drop',blockDrop);dialog.addEventListener('close',()=>{dialog.removeEventListener('dragover',blockDrop);dialog.removeEventListener('drop',blockDrop);},{once:true});
  $('#organizer-filter').onchange=e=>{filter=e.target.value;chosen.clear();draw();};$('#organizer-search').oninput=e=>{query=e.target.value;chosen.clear();draw();};
  $('#organizer-pick').onclick=()=>{closeModal();pickLocation(()=>open());};
  $('#organizer-assign').onclick=()=>{const r=getSelected();if(!r)return;for(const key of chosen)assignments[key]=r.id;save();chosen.clear();draw();message(warning||'Assignments saved in this browser. Export a backup to keep a separate copy.');};
  $('#organizer-unassign').onclick=()=>{for(const key of chosen)delete assignments[key];save();chosen.clear();draw();message(warning||'Assignments cleared; original files are unchanged.');};
  $('#organizer-clear').onclick=()=>{chosen.clear();draw();};
  $('#organizer-submit').onclick=()=>{const r=getSelected(),selected=files.filter(f=>chosen.has(fileKey(f)));if(!r||!selected.length)return;if(selected.length>8){message('Select at most eight photos for one publication set.');return;}if(selected.some(f=>assignments[fileKey(f)]!==r.id)){message('Assign all selected photos to the selected location before preparing publication.');return;}closeModal();submit(r,selected);};
  $('#organizer-export').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(backup(),null,2)],{type:'application/json'}));a.href=url;a.download='atlas-photo-assignments.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('#organizer-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error('Backup is too large.');const incoming=validateAssignments(JSON.parse(await file.text()),new Set(records().map(r=>r.id)));assignments={...assignments,...incoming};save();draw();message(warning||'Backup merged. Matching photo assignments were replaced with the imported values.');}catch(error){message(error.message);}};
  $('#modal').addEventListener('close',release,{once:true});draw();if(warning)message(warning);
 }
 return {open};
}
