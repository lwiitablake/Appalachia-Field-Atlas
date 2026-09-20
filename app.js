import {mountGallery,shouldMinimize} from './gallery.js';
import {termsFor} from './glossary.js';
import {icon as categoryIcon} from './icons.js';
import {evidenceFor,coordinates} from './editorial.js';
import {repositoryFor,communityFor,submissionUrl} from './community.js';
import {CATEGORIES,TAGS,LOCATION_CATEGORIES,backgroundFor,blankProgress,mapPoint,worldPoint,matches,validateProgress} from './model.js';
import {LocalVault} from './vault.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
let details={},community={entries:[]},siteConfig={},communityVisible={comments:true,tags:true,stars:true};
let atlas,guides,map,overlay,markers,selected=null,results=[],limit=70,progress=blankProgress(),adding=false,saveBusy=false;
let backgroundPreference='game',backgroundOpacity=1,showLocationLabels=false,areaOutline;
let vault,storageError='';
try {vault=new LocalVault();} catch {storageError='Browser storage is unavailable. You can still browse the map.';}
const filters={query:'',space:'2480661',categories:['bobblehead','magazine'],view:'all',tag:'',guided:false};
let toastTimer,lockTimer,lastActivity=Date.now(),modalReturn=null,detailReturn=null;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6000);}
function modal(html){if(!$('#modal').open)modalReturn=document.activeElement;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){if(saveBusy)return;$('#modal').close();modalReturn?.focus?.();}
$('#modal-close').onclick=closeModal;
$('#modal').addEventListener('close',()=>{$('#modal-content').replaceChildren();modalReturn?.focus?.();});
$('#modal').addEventListener('cancel',e=>{if(saveBusy)e.preventDefault();});
function failForm(e){const box=$('#form-error');if(box)box.textContent=e.message||String(e);else toast(e.message||String(e));}
function requireLogin(){if(vault?.session)return true;authDialog('login');return false;}
function updateSession(){
  const name=vault?.session?.envelope.name;
  $('#login-button').hidden=!!name;$('#signup-button').hidden=!!name;$('#profile-button').hidden=!name;
  $('#profile-button').textContent=name?`◈ ${name}`:'';
  $('#local-status').textContent=name?'Private journal encrypted on this browser. Profile name is visible.':'Browse freely. Log in locally to save.';
  clearInterval(lockTimer);
  if(name){lastActivity=Date.now();lockTimer=setInterval(()=>{if(Date.now()-lastActivity>15*60*1000&&!saveBusy)lock('Profile locked after 15 minutes of inactivity.');},15000);}
  render();
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>lastActivity=Date.now(),{passive:true});
function lock(message='Local profile locked.'){vault?.lock();progress=blankProgress();updateSession();if($('#modal').open)closeModal();toast(message);}
window.addEventListener('storage',event=>{if(vault?.session&&event.key===`field-atlas.v1.${vault.session.envelope.name}`)lock('Profile changed in another tab. Log in again to load the latest version.');});
async function mutate(change){
  if(!requireLogin()||saveBusy)return false;
  saveBusy=true;
  const next=structuredClone(progress);
  try {change(next);await vault.save(next);progress=next;render();return true;}
  catch(e){toast(`Not saved: ${e.message}`);return false;}
  finally{saveBusy=false;}
}
function itemState(p,id){return p.items[id]??=( {star:false,done:false,tags:[],note:''} );}
function authDialog(mode='login'){
  if(storageError){modal(`<h2 id="modal-title">Storage unavailable</h2><p>${esc(storageError)}</p><p>Enable site storage and reload to use local profiles.</p>`);return;}
  if(!crypto.subtle){modal('<h2 id="modal-title">A secure page is required</h2><p>Open this app on HTTPS (GitHub Pages) or localhost to use encrypted profiles. The map remains available to browse.</p>');return;}
  const signup=mode==='signup';
  modal(`<p class="eyebrow">ONLY ON YOUR DEVICE</p><h2 id="modal-title">${signup?'Start your field journal.':'Welcome back, wanderer.'}</h2><p>${signup?'Create a local profile to star discoveries, check off visits and leave your own markers.':'Unlock the journal saved in this browser.'}</p><div class="tabs"><button id="auth-login" ${!signup?'class="primary"':''}>Log in</button><button id="auth-signup" ${signup?'class="primary"':''}>Sign up</button></div><form id="auth-form"><label>Profile name<input name="name" required minlength="3" maxlength="32" autocomplete="username" placeholder="e.g. forest-wanderer" list="local-profiles"></label><datalist id="local-profiles">${vault.list().map(n=>`<option value="${esc(n)}"></option>`).join('')}</datalist><label>Passphrase<input name="passphrase" type="password" required ${signup?'minlength="12"':''} maxlength="256" autocomplete="${signup?'new-password':'current-password'}"></label>${signup?'<label>Repeat passphrase<input name="repeat" type="password" required minlength="12" maxlength="256" autocomplete="new-password"></label><label class="checkline"><input type="checkbox" name="understand" required> I understand there is no password reset or cloud recovery.</label>':''}<p id="form-error" class="form-error" role="alert"></p><button class="primary" type="submit">${signup?'Create local profile':'Unlock journal'}</button></form><p class="form-help">No email, account server or tracking. Your profile name is stored in plain text on this browser; progress is encrypted with your passphrase. A new browser needs an exported backup. ${signup?'Use a long, unique passphrase and keep it safe.':''}</p><button id="restore-open" class="text-button">Restore an encrypted backup ↗</button>`);
  $('#auth-login').onclick=()=>authDialog('login');$('#auth-signup').onclick=()=>authDialog('signup');$('#restore-open').onclick=restoreDialog;
  $('#auth-form').onsubmit=async e=>{
    e.preventDefault();if(saveBusy)return;const form=e.currentTarget,fd=new FormData(form),button=form.querySelector('[type=submit]');
    const pass=String(fd.get('passphrase'));
    if(signup&&pass!==fd.get('repeat')){failForm(Error('The passphrases do not match.'));return;}
    button.disabled=true;button.textContent='Unlocking encrypted storage…';saveBusy=true;
    try{progress=await vault[signup?'create':'login'](String(fd.get('name')),pass);saveBusy=false;closeModal();updateSession();toast(signup?'Local profile created. Back up your journal from the profile menu.':'Journal unlocked.');}
    catch(err){failForm(err);}finally{saveBusy=false;button.disabled=false;button.textContent=signup?'Create local profile':'Unlock journal';}
  };
  $('#auth-form input').focus();
}
function profileDialog(){
  if(!requireLogin())return;
  modal(`<p class="eyebrow">LOCAL JOURNAL</p><h2 id="modal-title">${esc(vault.session.envelope.name)}</h2><p>${Object.values(progress.items).filter(x=>x.star).length} starred · ${Object.values(progress.items).filter(x=>x.done).length} checked off · ${progress.custom.length} personal markers</p><p>Only this browser has your journal. Back it up before clearing browsing data, switching devices, or moving this site to another address.</p><div class="actions"><button id="export-backup" class="primary">Export encrypted backup</button><button id="restore-backup">Restore backup</button><button id="lock-profile">Lock / log out</button></div><h3>Erase this local profile</h3><p>This removes the encrypted journal from this browser. Exported backup files are separate and remain on your device.</p><button id="delete-profile" class="danger">Delete local profile…</button><p class="form-help">Unlocked profiles lock after 15 minutes without interaction, or when the page reloads. There is no email recovery.</p>`);
  $('#export-backup').onclick=()=>{const b=new Blob([vault.export()],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=`field-atlas-${vault.session.envelope.name}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Encrypted backup downloaded. Keep your passphrase separately.');};
  $('#restore-backup').onclick=restoreDialog;$('#lock-profile').onclick=()=>lock();
  $('#delete-profile').onclick=()=>{
    modal('<h2 id="modal-title">Delete this journal?</h2><p>This cannot be undone without a backup. Type DELETE to confirm.</p><form id="delete-form"><label>Confirmation<input name="confirm" required pattern="DELETE" autocomplete="off"></label><button type="submit" class="danger">Permanently delete local profile</button></form>');
    $('#delete-form').onsubmit=e=>{e.preventDefault();if(saveBusy)return;try{vault.delete();progress=blankProgress();closeModal();updateSession();toast('Profile deleted from this browser.');}catch(err){toast(err.message);}};
  };
}
function restoreDialog(){
  modal('<h2 id="modal-title">Restore your journal.</h2><p>Choose an encrypted Field Atlas backup and enter its original passphrase. The file is read on this device, never uploaded.</p><form id="restore-form"><label>Encrypted JSON backup<input name="backup" type="file" accept="application/json,.json" required></label><label>Original passphrase<input name="passphrase" type="password" autocomplete="current-password" required maxlength="256"></label><label class="checkline"><input type="checkbox" name="overwrite"> Replace an existing profile with the same name (replaces its progress).</label><p id="form-error" class="form-error" role="alert"></p><button class="primary" type="submit">Decrypt & restore</button></form>');
  $('#restore-form').onsubmit=async e=>{e.preventDefault();if(saveBusy)return;const fd=new FormData(e.currentTarget),file=fd.get('backup'),button=e.currentTarget.querySelector('[type=submit]');saveBusy=true;button.disabled=true;
    try{if(file.size>7500000)throw Error('Backup is too large (maximum 7.5 MB).');progress=await vault.restore(await file.text(),String(fd.get('passphrase')),fd.has('overwrite'));saveBusy=false;closeModal();updateSession();toast('Encrypted journal restored on this browser.');}catch(err){failForm(err);}finally{saveBusy=false;button.disabled=false;}
  };
}
function categoryUI(){
  $('#categories').innerHTML=Object.entries(CATEGORIES).map(([id,c])=>{
    const count=(id==='custom'?progress.custom:atlas.records).filter(r=>r.category===id&&(filters.space==='all'||r.space===filters.space)).length;
    return `<div class="category ${filters.categories.includes(id)?'active':''}" style="--cat:${c.color}"><button class="category-toggle" data-category="${id}" aria-pressed="${filters.categories.includes(id)}"><span class="category-symbol" aria-hidden="true">${categoryIcon(id)}</span><span>${c.name}<small>${count.toLocaleString()} points</small></span></button><button class="category-star" data-category-star="${id}" aria-label="Star ${c.name} category" aria-pressed="${progress.categoryStars.includes(id)}">${progress.categoryStars.includes(id)?'★':'☆'}</button></div>`;
  }).join('');
  $('#categories').querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{const c=b.dataset.category;filters.categories=filters.categories.includes(c)?filters.categories.filter(x=>x!==c):[...filters.categories,c];limit=70;render();});
  $('#categories').querySelectorAll('[data-category-star]').forEach(b=>b.onclick=()=>mutate(p=>{const c=b.dataset.categoryStar;p.categoryStars=p.categoryStars.includes(c)?p.categoryStars.filter(x=>x!==c):[...p.categoryStars,c];}));
}
function allRecords(){return [...atlas.records,...progress.custom];}
function render(){
  if(!atlas)return;
  categoryUI();
  const allLocations=LOCATION_CATEGORIES.every(c=>filters.categories.includes(c));
  $('#all-locations').setAttribute('aria-pressed',String(allLocations));
  $('#all-locations').textContent=allLocations?'Hide all locations':'Show all locations';
  results=allRecords().filter(r=>filters.categories.includes(r.category)&&matches(r,filters,progress,guides)).sort((a,b)=>a.area.localeCompare(b.area)||a.category.localeCompare(b.category)||a.id.localeCompare(b.id));
  $('#result-count').textContent=`${results.length.toLocaleString()} discoveries`;
  const shown=results.slice(0,limit);
  $('#results').innerHTML=shown.length?shown.map(r=>{const c=CATEGORIES[r.category],p=progress.items[r.id]||{};return `<button class="result ${selected?.id===r.id?'selected':''}" data-id="${r.id}" style="--cat:${c.color}"><span class="category-symbol" aria-hidden="true">${categoryIcon(r.category)}</span><span><strong>${esc(r.area==='Personal marker'?r.name:r.area)}</strong><small>${esc(LOCATION_CATEGORIES.includes(r.category)?CATEGORIES[r.category].singular:r.name)}${r.formId?` · ${r.formId.slice(-4)}`:''} ${filters.space==='all'?`· ${esc(atlas.spaces[r.space]?.name||'Unknown map')}`:''}</small></span><span class="status" aria-label="${p.star?'Starred ':''}${p.done?'Checked ':''}${p.tags?.length?'Tagged':''}">${p.star?'★ ':''}${p.done?'✓ ':''}${p.tags?.length?'●':''}</span></button>`;}).join(''):'<p class="empty">No discoveries match these filters. Try another map, a broader search, or All layers.</p>';
  $('#results').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>selectRecord(allRecords().find(r=>r.id===b.dataset.id),true));
  $('#more-results').hidden=results.length<=limit;
  const existing=filters.tag;
  const tags=[...new Set([...TAGS,...Object.values(progress.items).flatMap(v=>v.tags)])].sort();
  $('#tag-filter').innerHTML='<option value="">Any tag</option>'+tags.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');$('#tag-filter').value=existing;
  renderPins();
  if(selected){selected=allRecords().find(r=>r.id===selected.id);if(selected)renderDetail();else closeDetail();}
}
function activeSpace(){return atlas.spaces[map.spaceId];}
function renderBackground(){
  const s=activeSpace(),b=backgroundFor(s,backgroundPreference);
  if(overlay)overlay.remove();overlay=null;
  if(b.tiles){
    overlay=L.layerGroup().addTo(map);
    for(const tile of b.tiles){L.imageOverlay(tile.image,tile.bounds,{opacity:backgroundOpacity,alt:`${b.name}: ${s.name}. Mappalachia; © Bethesda / ZeniMax.`}).on('error',()=>toast('A source-quality terrain section failed to load. Try Satellite / terrain.')).addTo(overlay);}
    overlay.setOpacity=value=>overlay.eachLayer(layer=>layer.setOpacity(value));
  }else if(b.image){overlay=L.imageOverlay(b.image,[[0,0],[4096,4096]],{opacity:backgroundOpacity,alt:`${b.name}: ${s.name}. Mappalachia; © Bethesda / ZeniMax.`}).addTo(map);overlay.on('error',()=>toast('Background failed to load. Try another background; points remain searchable.'));}
  $('#background').value=backgroundPreference;
  $('#background-note').textContent=(b.key!==backgroundPreference?'This space uses its overhead render. Your chosen Appalachia background returns when you switch back. ': '')+(b.note||'');
  $('#map-message').hidden=!!b.image;
  if(!b.image)$('#map-message').textContent='No source image for this space. Directory and coordinate data remain available.';
}
function setMap(spaceId){
  if(map.spaceId===spaceId)return;
  const s=atlas.spaces[spaceId];if(!s)return;
  map.spaceId=spaceId;renderBackground();
  $('#map-name').textContent=s.name;
  $('#map-message').hidden=!!s.image;
  if(!s.image)$('#map-message').textContent='No upstream image for this space. Coordinates are shown on a blank map.';
  map.fitBounds([[0,0],[4096,4096]],{animate:false,padding:[15,15]});
}
function tooltip(r){
  const d=document.createElement('div'),strong=document.createElement('strong'),p=document.createElement('p'),hint=document.createElement('small');
  strong.textContent=r.area===r.name?r.name:`${r.name} · ${r.area}`;
  p.textContent=coordinates(r);hint.textContent=evidenceFor(r,guides,details).label+' · Click for details';d.append(strong,p,hint);return d;
}
function renderPins(){
  if(!map)return;markers.clearLayers();
  if(areaOutline)areaOutline.remove();areaOutline=null;
  if(selected?.space===map.spaceId&&selected.cells){areaOutline=L.layerGroup().addTo(map);for(const [x,y] of selected.cells){L.rectangle([mapPoint({x:x*4096,y:y*4096},activeSpace()),mapPoint({x:(x+1)*4096,y:(y+1)*4096},activeSpace())],{color:'#ffe29e',weight:1,fillOpacity:.08,interactive:false}).addTo(areaOutline);}}
  const onMap=results.filter(r=>r.space===map.spaceId),groups=new Map();
  for(const r of onMap){const pos=mapPoint(r,activeSpace()),px=map.project(pos,map.getZoom());const key=map.getZoom()<2?`${Math.floor(px.x/38)}:${Math.floor(px.y/38)}`:r.id;const group=groups.get(key)||[];group.push(r);groups.set(key,group);}
  for(const group of groups.values()){
    if(group.length>1){
      const points=group.map(r=>mapPoint(r,activeSpace()));const center=[points.reduce((s,p)=>s+p[0],0)/points.length,points.reduce((s,p)=>s+p[1],0)/points.length];
      const cluster=L.marker(center,{keyboard:false,icon:L.divIcon({className:'pin cluster',html:`<span style="--cat:#30483e">${group.length}</span>`,iconSize:[31,31],iconAnchor:[15.5,15.5]})}).addTo(markers);
      const text=document.createElement('span');text.textContent=`${group.length} discoveries. Click to zoom in; use the result list for individual points.`;cluster.bindTooltip(text);
      cluster.on('click',()=>map.fitBounds(L.latLngBounds(points).pad(.3),{maxZoom:Math.max(2,map.getZoom()+1.5),padding:[50,90]}));continue;
    }
    const r=group[0];
    const c=CATEGORIES[r.category],p=progress.items[r.id]||{},pos=mapPoint(r,activeSpace());
    const icon=L.divIcon({className:`pin ${evidenceFor(r,guides,details).classes} ${p.done?'checked':''} ${p.star?'starred':''} ${p.tags?.length?'tagged':''} ${selected?.id===r.id?'selected':''}`,html:`<span style="--cat:${c.color}">${categoryIcon(r.category)}</span>`,iconSize:[25,25],iconAnchor:[12.5,12.5]});
    const marker=L.marker(pos,{icon,keyboard:false,title:`${r.name} · ${r.area}`}).addTo(markers).on('click',()=>selectRecord(r,false));
    marker.bindTooltip(tooltip(r),{direction:'top',offset:[0,-15],className:'discovery-tooltip'});
    if(showLocationLabels&&LOCATION_CATEGORIES.includes(r.category)){marker.unbindTooltip();const label=document.createElement('span');label.textContent=r.name;marker.bindTooltip(label,{permanent:true,direction:'right',offset:[14,0],className:'location-label'});}
  }
}
function selectRecord(r,focus){
  if(!r)return;detailMinimized=false;$('#restore-detail').hidden=true;detailReturn=document.activeElement;selected=r;setMap(r.space);render();
  map.invalidateSize({animate:false});
  if(focus)map.setView(mapPoint(r,activeSpace()),Math.max(map.getZoom(),r.space==='2480661'?1:0),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
  $('#detail').scrollTop=0;$('#detail-close').focus({preventScroll:true});document.body.classList.remove('explorer-open');$('#mobile-explorer').setAttribute('aria-expanded','false');
}
function closeDetail(){detailMinimized=false;$('#restore-detail').hidden=true;selected=null;$('#detail').hidden=true;map?.invalidateSize({animate:false});renderPins();detailReturn?.focus?.({preventScroll:true});}
let imageGeneration=0,detailMinimized=false;
function minimizeDetail(){if(!selected)return;detailMinimized=true;$('#detail').hidden=true;$('#restore-detail').hidden=false;$('#restore-detail').textContent='Open notes · '+selected.area;map?.invalidateSize({animate:false});}

function renderDetail(){
  const r=selected,c=CATEGORIES[r.category],p=progress.items[r.id]||{},guide=guides[r.area],entries=guide?.[r.category]||[],space=atlas.spaces[r.space];
  $('#detail').hidden=detailMinimized;
  $('#detail').innerHTML=`<div class="detail-head"><button id="detail-minimize" class="minimize-button" aria-label="Minimize discovery notes">⌄</button><button id="detail-close" class="close-button" aria-label="Close discovery details">×</button><p class="eyebrow">${esc(c.singular.toUpperCase())} / FIELD NOTES</p><h2>${esc(r.area==='Personal marker'?r.name:r.area)}</h2><p class="eyebrow panel-kicker">LOCATION NOTES</p><p class="detail-subtitle">${esc(r.name)}${r.formId?` · Reference ${r.formId}`:''}</p></div><section id="image-gallery" class="image-gallery"></section><div class="detail-body"><div class="detail-actions"><button id="star-item" aria-pressed="${!!p.star}">${p.star?'★ Starred':'☆ Star'}</button><button id="check-item" aria-pressed="${!!p.done}">${p.done?'✓ Checked':'○ Check off'}</button></div><span class="badge">${r.category==='custom'?'Personal marker':r.category==='location'?'Game map marker':r.category==='area'||r.category==='region'?'Approximate area':r.category==='interior'?'Map directory':'Potential spawn'}</span>${entries.length?`<section class="directions-card"><p class="eyebrow">WHERE TO LOOK</p><h3>Written directions · this area</h3><p class="form-help">These are the area's documented search spots. The source does not link its prose to individual form IDs, so this list is not claimed to identify this exact pin.</p><ul>${entries.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p class="form-help">Adapted from ${external(guide.source,guide.credit)} · ${external('https://creativecommons.org/licenses/by-sa/3.0/',guide.license)} · checked ${guide.reviewed}.</p></section>`:r.category!=='custom'?'<p class="form-help">Room- or shelf-level written directions have not been independently matched to this pin. The directions above are calculated from the sourced coordinates.</p>':''}${glossaryHTML(r)}<h3>World coordinates</h3><p class="world-coordinates">${esc(coordinates(r))}</p><p class="form-help">${r.accuracy==='representative-cell'?'Approximate source-cell center.':r.accuracy==='map-center'?'Map render center, not an entrance.':'Coordinates from the source game records.'} Each interior uses its own coordinate space; these are not GPS coordinates or a player-facing navigation code.</p><details class="technical-details"><summary>Source placement context</summary><p>${esc(r.directions)}</p></details>${editorialHTML(r)}${LOCATION_CATEGORIES.includes(r.category)?'<p class="form-help">Fast-travel eligibility is not included in this source export. A destination marker does not guarantee that travel is currently unlocked or available.</p>':''}${r.lock?`<p>Data lock field: ${esc(r.lock)}</p>`:''}${!['custom',...LOCATION_CATEGORIES].includes(r.category)?'<p class="warning-note">A pin is a possible spawn, not a guarantee. Items may be absent or already collected. Generic bobblehead and magazine points do not guarantee a specific type or issue.</p>':''}${communityHTML(r)}<h3>Your private tags</h3><div class="tags">${[...new Set([...TAGS,...(p.tags||[])])].map(t=>`<button data-tag="${esc(t)}" aria-pressed="${(p.tags||[]).includes(t)}">${esc(t)}</button>`).join('')}</div><form id="custom-tag" class="custom-tag-row"><label class="sr-only" for="new-tag">New tag</label><input id="new-tag" name="tag" placeholder="Your own tag…" maxlength="40" required><button type="submit">Add</button></form><h3>Your notes</h3><label class="sr-only" for="item-notes">Notes for this discovery</label><textarea id="item-notes" maxlength="2000" placeholder="A route, a landmark, a reminder…">${esc(p.note||'')}</textarea><button id="save-note" class="text-button">Save note</button>${r.category==='custom'?'<button id="delete-marker" class="text-button danger">Delete marker…</button>':''}<div class="source-line">${r.category==='custom'?'Created by you. Coordinates and notes are personal, not verified game data.':`${external(atlas.meta.source,'Coordinates: Mappalachia '+atlas.meta.release)}<br>Game ${atlas.meta.gameVersion} · release ${atlas.meta.released}<br>© Bethesda / ZeniMax · ${external('SOURCES.md','rights & attribution')}`}<p class="coords">X ${r.x.toFixed(2)} · Y ${r.y.toFixed(2)}${Number.isFinite(r.z)?` · Z ${r.z.toFixed(2)}`:''}<br>${esc(space.editorId)}${r.baseId?` · Base ${r.baseId}`:''}<br>${esc(r.editorId||'')}</p></div></div>`;
  $('#detail-close').onclick=closeDetail;
  $('#detail-minimize').onclick=minimizeDetail;
  let headerStart=null;const header=$('#detail .detail-head');
  header.onpointerdown=e=>{if(e.target.closest('button,a'))return;headerStart={x:e.clientX,y:e.clientY};header.setPointerCapture?.(e.pointerId);};
  header.onpointerup=e=>{if(headerStart&&shouldMinimize(e.clientX-headerStart.x,e.clientY-headerStart.y))minimizeDetail();headerStart=null;};header.onpointercancel=()=>headerStart=null;

  $('#submit-community').onclick=()=>communityDialog(r);
  $('#star-item').onclick=()=>mutate(n=>{const s=itemState(n,r.id);s.star=!s.star;});
  $('#check-item').onclick=()=>mutate(n=>{const s=itemState(n,r.id);s.done=!s.done;});
  $('#detail').querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>mutate(n=>{const s=itemState(n,r.id),tag=b.dataset.tag;if(s.tags.includes(tag))s.tags=s.tags.filter(t=>t!==tag);else{if(s.tags.length>=12)throw Error('Each discovery can have up to 12 tags.');s.tags.push(tag);}}));
  $('#custom-tag').onsubmit=e=>{e.preventDefault();const t=String(new FormData(e.currentTarget).get('tag')).trim();if(!t)return;mutate(n=>{const s=itemState(n,r.id);if(s.tags.length>=12)throw Error('Each discovery can have up to 12 tags.');if(!s.tags.includes(t))s.tags.push(t);});};
  $('#save-note').onclick=async()=>{const note=$('#item-notes').value;if(await mutate(n=>{itemState(n,r.id).note=note;}))toast('Note saved to your encrypted journal.');};
  if(r.category==='custom')$('#delete-marker').onclick=()=>{modal(`<h2 id="modal-title">Delete this marker?</h2><p>${esc(r.name)} and its saved notes and tags will be removed.</p><button id="confirm-delete-marker" class="danger">Delete marker</button>`);$('#confirm-delete-marker').onclick=async()=>{if(await mutate(n=>{n.custom=n.custom.filter(x=>x.id!==r.id);delete n.items[r.id];})){closeModal();closeDetail();}};};
  mountGallery($('#image-gallery'),evidenceFor(r,guides,details).photos,root=>{
    root.innerHTML=`<figure class="detail-image"><canvas id="location-image" width="660" height="400" role="img" aria-label="Overhead map placeholder. Crosshair marks this point."></canvas><figcaption>No available location screenshot. Overhead map placeholder · ${external(atlas.meta.source,'Mappalachia / AHeroicLlama')}<br>Game imagery © Bethesda / ZeniMax.</figcaption></figure>`;
    drawCrop(r,space);
  });
}
function drawCrop(r,space){
  const generation=++imageGeneration,canvas=$('#location-image'),ctx=canvas.getContext('2d');ctx.fillStyle='#2b352a';ctx.fillRect(0,0,660,400);
  if(!space.image){ctx.fillStyle='#f6ecd0';ctx.font='20px sans-serif';ctx.fillText('No upstream image for this space',35,200);return;}
  const im=new Image();im.onload=()=>{if(generation!==imageGeneration)return;const [y,x]=mapPoint(r,space),cx=x/4096*im.width,cy=(1-y/4096)*im.height;
    const w=space.editorId==='APPALACHIA'?Math.max(180,im.width*.045):im.width*.6,h=w*400/660;
    ctx.drawImage(im,cx-w/2,cy-h/2,w,h,0,0,660,400);
    ctx.strokeStyle='#fff5cd';ctx.lineWidth=5;ctx.beginPath();ctx.arc(330,200,17,0,Math.PI*2);ctx.moveTo(301,200);ctx.lineTo(318,200);ctx.moveTo(342,200);ctx.lineTo(359,200);ctx.moveTo(330,171);ctx.lineTo(330,188);ctx.moveTo(330,212);ctx.lineTo(330,229);ctx.stroke();ctx.strokeStyle='#ac522b';ctx.lineWidth=2;ctx.stroke();
  };im.onerror=()=>{ctx.fillStyle='#fff';ctx.font='20px sans-serif';ctx.fillText('Image unavailable; use the coordinates below.',20,200);};im.src=space.image;
}
function addMarkerDialog(latlng){
  if(!requireLogin())return;const sid=map.spaceId,s=atlas.spaces[sid],point=worldPoint(latlng,s);
  modal(`<p class="eyebrow">LEAVE YOUR OWN SIGNPOST</p><h2 id="modal-title">A place to remember.</h2><p>${esc(s.name)} · X ${point.x.toFixed(0)}, Y ${point.y.toFixed(0)}</p><form id="marker-form"><label>Marker name<input name="name" required maxlength="100" placeholder="e.g. My copper route"></label><label>Directions or reminder<textarea name="notes" maxlength="2000"></textarea></label><label>First tag<select name="tag">${TAGS.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label><p id="form-error" class="form-error" role="alert"></p><button type="submit" class="primary">Save personal marker</button></form>`);
  $('#marker-form').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),name=String(fd.get('name')).trim();if(!name){failForm(Error('Enter a name.'));return;}
    const r={id:'custom-'+crypto.randomUUID(),category:'custom',name,area:'Personal marker',space:sid,...point,directions:String(fd.get('notes'))||'A personal location marked on the map.'};
    if(await mutate(n=>{if(n.custom.length>=2000)throw Error('The limit is 2,000 personal markers.');n.custom.push(r);const st=itemState(n,r.id);st.tags=[String(fd.get('tag'))];})){
      closeModal();if(!filters.categories.includes('custom'))filters.categories.push('custom');filters.view='all';$('#view').value='all';selectRecord(r,false);toast('Personal marker saved.');
    }
  };
}
function glossaryHTML(r){
 const entries=termsFor(r);
 return entries.length?`<details class="name-guide"><summary>What does this name mean?</summary>${entries.map(t=>`<h3>${esc(t.name)}</h3><p>${esc(t.text)}</p>${t.url?`<p class="form-help">${external(t.url,'Explanation source: Fallout Wiki contributors')}</p>`:''}`).join('')}</details>`:'';
}
function badgePreview(){
 modal(`<h2 id="modal-title">Photo & guide badge preview</h2><p>Style examples only. These samples are not real locations and do not claim photographs exist for any pin.</p><div class="badge-samples">${[['','Map only'],['has-photo','Spot photo'],['has-text','Written guide'],['has-photo has-text','Both: double outline']].map(([cl,label])=>`<div><span class="pin ${cl}" style="--cat:#ae542a"><span>${categoryIcon('bobblehead')}</span></span><strong>${label}</strong></div>`).join('')}</div><h3>Where are the screenshots?</h3><p>High Knob Lookout now includes two credited game screenshots on a documented fair-use basis. Their captions distinguish an area reference from an exact-pin match. Other locations use overhead placeholders where screenshots are unavailable.</p><p>For a real external example, the Landview Lighthouse article’s gallery shows potential bobblehead spots in the lighthouse window and upstairs in the house, plus magazine spots.</p><p>${external('https://fallout.fandom.com/wiki/Landview_Lighthouse#Gallery','View Landview Lighthouse screenshot gallery')}</p><p class="form-help">External reference only. Those photographs have not been copied into this app or assumed to share the wiki text license.</p>`);
}
function mapKey(){
 const states=[['','No source outline','Coordinates and overhead map only.'],['has-photo','Blue outline','A sourced spot photograph is included.'],['has-text','Yellow outline','Written directions are included; area guides are labeled as such.'],['has-photo has-text','Blue + yellow','Both a sourced photograph and written directions.'],['selected','White dashed ring','Currently selected discovery.'],['starred','Small star','Starred in your private journal.'],['tagged','Mint dot','Has a tag in your private journal.'],['checked','Faded marker','Checked off in your private journal.']];
 modal(`<h2 id="modal-title">Map key</h2><h3>Icons & category colors</h3><div class="key-categories">${Object.entries(CATEGORIES).map(([id,c])=>`<div><span class="category-symbol" style="--cat:${c.color}">${categoryIcon(id)}</span><span><strong>${esc(c.name)}</strong>${id==='armor'?'<small>PA = Power armor</small>':''}</span></div>`).join('')}</div><h3>Outlines & saved states</h3><p class="form-help">Outline colors describe source coverage; the marker fill identifies its category. These are style examples, not real map records.</p><div class="key-states">${states.map(([cl,title,text])=>`<div><span class="pin ${cl}" style="--cat:#ae542a"><span>${categoryIcon('bobblehead')}</span></span><span><strong>${title}</strong><small>${text}</small></span></div>`).join('')}</div><p><strong>Numbered green circle:</strong> a group of nearby discoveries. Click or tap to zoom in; the number is the count, not a level or item quantity.</p><p><strong>Pale outlined rectangles:</strong> source cells for a selected approximate area. They are not precise building boundaries.</p><p>Community stars/tags appear in the community section of the detail card. They do not change private-journal marker symbols.</p><p>Blue outlines identify included game screenshots; captions state their scope. High Knob Lookout has a two-image example. Overhead placeholders do not earn blue outlines.</p><button id="key-photo-example">Screenshot example & outline preview</button>`);
 $('#key-photo-example').onclick=badgePreview;
}
function editorialHTML(r){
 const e=evidenceFor(r,guides,details);
 const gallery=r.area==='Landview Lighthouse'?`<p class="external-gallery">${external('https://fallout.fandom.com/wiki/Landview_Lighthouse#Gallery','View external location screenshots')}<small>Fallout Wiki gallery; external reference, not verified against this exact pin.</small></p>`:'';
 return `<p class="evidence-label">${esc(e.label)}</p>${gallery}${e.text?`<section class="directions-card"><p class="eyebrow">WHERE TO LOOK</p><h3>Detailed spot description</h3><p>${esc(e.entry.description)}</p><p class="form-help">${external(e.entry.source,e.entry.credit)} · ${esc(e.entry.license)}</p></section>`:''}`;
}
function communityHTML(r){
 const c=communityFor(community.entries,r.id);
 return `<section class="community-section"><h3>Community contributions</h3><p class="form-help">Public, reviewed GitHub submissions. Separate from your private journal.</p>${communityVisible.stars?`<p>★ ${c.stars} community ${c.stars===1?'star':'stars'}</p>`:''}${communityVisible.tags?`<div class="community-tags">${c.tags.length?c.tags.map(t=>`<span>${esc(t)}</span>`).join(''):'No published community tags.'}</div>`:''}${communityVisible.comments?`<div class="community-comments">${c.comments.length?c.comments.map(e=>`<article><p>${esc(e.text)}</p><small>${external(e.url,e.author)}</small></article>`).join(''):'No published comments yet.'}</div>`:''}<button id="submit-community">Submit to community ↗</button></section>`;
}
function communityDialog(r){
 if(r.category==='custom'){toast('Personal markers stay private. Choose a sourced location to contribute.');return;}
 modal(`<h2 id="modal-title">Contribute to this location</h2><p>Your submission will be public on GitHub under your GitHub username. A maintainer reviews it before publishing it on the map. GitHub sign-in is required; your local profile is separate.</p><form id="community-form"><label>Contribution type<select name="type"><option value="comment">Comment</option><option value="tag">Tag</option><option value="star">Community star</option></select></label><label>Comment or tag<textarea name="text" maxlength="1000" placeholder="Share useful information; omit private details. Leave blank for a star."></textarea></label><p id="form-error" role="alert"></p><button type="submit">Prepare GitHub submission</button></form><div id="community-link"></div>`);
 $('#community-form').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.currentTarget),type=String(fd.get('type')),text=String(fd.get('text')).trim();if(type!=='star'&&(!text||text.length>(type==='tag'?40:1000))){failForm(Error('Enter a comment up to 1,000 characters or a tag up to 40 characters.'));return;}const repo=repositoryFor(location,siteConfig.repository);$('#community-link').innerHTML=`<p>${external(submissionUrl(repo,r,type,text),'Open GitHub to review and submit')}</p><p class="form-help">Nothing has been submitted yet. Finish by clicking Create on GitHub.</p>`;};
}
function helpDialog(){modal(`<p class="eyebrow">FIELD GUIDE / 01</p><h2 id="modal-title">Make your own way.</h2><ol><li><strong>Find something.</strong> Search a place, item category, note or reference ID. Toggle layers. Choose “All maps & interiors” to search everywhere.</li><li><strong>Inspect a point.</strong> Hover for a short description; click for the overhead image, directions, source and notes. Search results provide a keyboard-accessible alternative to map pins. Multiple floors and very close points may overlap: use the result list to select each reference.</li><li><strong>Keep a journal.</strong> Sign up with a local profile name and a passphrase of at least 12 characters. Star individual points or favorite item categories; check off visits; add several tags and notes.</li><li><strong>Add a marker.</strong> Choose Add marker, then click/tap your spot. To place one without a mouse, focus the map, pan with arrow keys and press Enter while marker mode is on. Escape cancels.</li><li><strong>Take it with you.</strong> Use the profile menu to export an encrypted backup. Restore it with the same passphrase on another browser. No automatic sync or password reset.</li></ol><h3>Backgrounds and locations</h3><p>Choose Satellite / terrain, Illustrated game map or Military map. Switching backgrounds preserves zoom, pins and journal data; the visibility slider fades only the background. Interiors use their own overhead render and restore your chosen background when you return to Appalachia.</p><p>Show all locations toggles four layers together: Map destinations, Other named areas, Regions and Interior maps. Each also has its own toggle. Location labels appear on individual pins; zoom in to split groups. Search and progress filters still apply. Choose All maps & interiors to search the complete directory.</p><p>Other areas and regions use representative source-cell centers and show their cell footprints when selected. Interior directory entries use map centers, not guessed exterior entrances. The source does not distinguish currently usable fast-travel points.</p><h3>Read the map honestly</h3><p>These are extracted positions from game ${esc(atlas.meta.gameVersion)}, not live item availability. Loot may not spawn, may be taken, or may be inaccessible because of a quest or encounter state. A generic bobblehead point is not a guaranteed Leader bobblehead.</p><p>Outdoor directions use map-marker bearings in game units; interior coordinates stay in their own map. Overhead renders can hide lower floors. Written guides cover ${Object.keys(guides).length} areas and are labeled as area guides, not verified matches to each form ID.</p><h3>Privacy in practice</h3><p>Your progress is encrypted in browser storage. No profile data is sent by this app. GitHub still serves the files and may receive ordinary request metadata, such as IP addresses. External source links open other websites when you choose them. Profiles on a shared device are separated by passphrase, but browser extensions and compromised same-origin scripts can access an unlocked journal.</p><p>Changes to notes require Save note. Stars, checks, tags and personal markers save immediately. The profile locks after 15 idle minutes or a reload. Clearing site data or losing the passphrase can permanently lose your journal.</p>`);}
function sourcesDialog(){modal(`<p class="eyebrow">PROVENANCE / NO GUESSWORK</p><h2 id="modal-title">Built on shared knowledge.</h2><p>Snapshot: <strong>game ${esc(atlas.meta.gameVersion)}</strong> · Mappalachia ${esc(atlas.meta.release)}, released ${esc(atlas.meta.released)}. Source review: ${esc(atlas.meta.reviewed)}.</p><p>${atlas.records.length.toLocaleString()} points across ${Object.keys(atlas.spaces).length} spaces. Includes Appalachia's Burning Springs and Skyline Valley geography. A dated snapshot, not an automatically current or live server map.</p><p>Location coverage: ${atlas.meta.locationCoverage.mapMarkers} map destinations, ${atlas.meta.locationCoverage.additionalNamedRecords} additional named area/region records, and ${atlas.meta.locationCoverage.spaces} source spaces. ${atlas.meta.locationCoverage.unnamedLocationRecords} unnamed Location records are not given invented names. This does not claim every community-named unmarked landmark.</p><table class="source-table"><thead><tr><th>Contribution</th><th>Credit & reuse basis</th></tr></thead><tbody><tr><td>Coordinates and map renders</td><td>${external(atlas.meta.source,'AHeroicLlama & Mappalachia contributors')}. Upstream project GPL-3.0; Bethesda game assets carry a separate stated fair-use basis.</td></tr><tr><td>Game world and imagery</td><td>Bethesda Softworks / ZeniMax Media. Copyright retained; not public domain and not covered by the project's software license.</td></tr><tr><td>Written area guides</td><td>Nukapedia / Fallout Wiki contributors, adapted under CC BY-SA 3.0. Each guide links its article and credits its contributors.</td></tr><tr><td>Interactive mapping</td><td>${external('https://leafletjs.com/','Leaflet 1.9.4')} by Volodymyr Agafonkin and contributors, BSD-2-Clause; bundled locally.</td></tr><tr><td>App, coordinate-derived directions, journal</td><td>Original implementation prepared for this project with OpenAI Codex. GPL-3.0-only; source included.</td></tr></tbody></table><h3>Written guide sources</h3><ul>${Object.entries(guides).map(([n,g])=>`<li>${external(g.source,n)} · adapted, ${g.license}</li>`).join('')}</ul><h3>Image use</h3><p>Backgrounds include Mappalachia overhead renders plus the illustrated and military map artwork distributed in the same release. Illustrated landmarks are stylized; the military artwork may predate expansions. All are credited to the upstream source and Bethesda. Detail pictures are crops with a location crosshair, not claimed screenshots of an item or exact shelf. No third-party guide screenshots are copied. The upstream fair-use position is documented, not a guarantee or an express Bethesda license.</p><p>${external('SOURCES.md','Full source register, rights notes and changes')} · ${external('DATA-MAINTENANCE.md','Data coverage and update procedure')} · ${external('PRIVACY.md','Privacy details')}</p>`);}
document.addEventListener('click',e=>{
 const dialog=$('#modal');
 if(dialog.open){if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeModal();}return;}
 if(document.body.classList.contains('explorer-open')&&!e.target.closest('#explorer-panel,#mobile-explorer')){document.body.classList.remove('explorer-open');$('#mobile-explorer').setAttribute('aria-expanded','false');}
 if(selected&&!$('#detail').hidden&&!e.target.closest('#detail,#restore-detail,.leaflet-marker-icon,#results,.category,#modal,button,input,select,textarea,a,summary,label'))minimizeDetail();
 document.querySelectorAll('details[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});
});
$('#restore-detail').onclick=()=>{detailMinimized=false;$('#detail').hidden=false;$('#restore-detail').hidden=true;map?.invalidateSize({animate:false});$('#detail-minimize').focus({preventScroll:true});};
async function start(){
  try{
    const responses=await Promise.all([fetch('data/atlas.json'),fetch('data/guides.json'),fetch('data/details.json'),fetch('data/community.json'),fetch('site-config.json')]);
    if(responses.some(r=>!r.ok))throw Error('The atlas files could not be loaded.');
    [atlas,guides,details,community,siteConfig]=await Promise.all(responses.map(r=>r.json()));
    if(vault)vault.validate=p=>{validateProgress(p);if(p.custom.some(r=>!atlas.spaces[r.space]))throw Error('This journal contains a personal marker for a map absent from this atlas edition. Use the matching edition to restore it.');return p;};
    $('#edition').textContent=`V3.2 · ${atlas.meta.released} / ${atlas.meta.gameVersion}`;
    $('#space').innerHTML='<option value="all">All maps & interiors</option>'+Object.entries(atlas.spaces).sort(([a,x],[b,y])=>a==='2480661'?-1:b==='2480661'?1:x.name.localeCompare(y.name)).map(([id,s])=>`<option value="${id}">${esc(s.name)}${s.world?'':' · interior'}${s.name==='Appalachia'?'':` (${esc(s.editorId)})`}</option>`).join('');$('#space').value=filters.space;
    map=L.map('map',{crs:L.CRS.Simple,minZoom:-4,maxZoom:5,zoomSnap:.25,preferCanvas:true,attributionControl:true});
    map.attributionControl.setPrefix(external('https://leafletjs.com/','Leaflet'));
    markers=L.layerGroup().addTo(map);setMap(filters.space);
    map.on('zoomend',renderPins);
    map.on('click',e=>{if(adding){adding=false;document.body.classList.remove('adding');$('#add-marker').textContent='＋ Add marker';$('#map-message').hidden=true;addMarkerDialog(e.latlng);}});
    $('#map').addEventListener('keydown',e=>{if(adding&&e.key==='Enter'){e.preventDefault();adding=false;document.body.classList.remove('adding');$('#add-marker').textContent='＋ Add marker';$('#map-message').hidden=true;addMarkerDialog(map.getCenter());}});
    $('#search').oninput=e=>{filters.query=e.target.value;limit=70;render();};
    $('#space').onchange=e=>{filters.space=e.target.value;if(filters.space!=='all')setMap(filters.space);limit=70;closeDetail();render();};
    $('#mobile-explorer').onclick=()=>{const open=document.body.classList.toggle('explorer-open');$('#mobile-explorer').setAttribute('aria-expanded',String(open));};
    for(const key of ['comments','tags','stars'])$('#community-'+key).onchange=e=>{communityVisible[key]=e.target.checked;if(selected)renderDetail();};
    $('#background').onchange=e=>{backgroundPreference=e.target.value;renderBackground();};
    $('#background-opacity').oninput=e=>{backgroundOpacity=Number(e.target.value)/100;$('#opacity-value').textContent=e.target.value+'%';overlay?.setOpacity(backgroundOpacity);};
    $('#location-labels').onchange=e=>{showLocationLabels=e.target.checked;renderPins();};
    $('#all-locations').onclick=()=>{const hide=LOCATION_CATEGORIES.every(c=>filters.categories.includes(c));filters.categories=filters.categories.filter(c=>!LOCATION_CATEGORIES.includes(c));if(!hide)filters.categories.push(...LOCATION_CATEGORIES);limit=70;render();};
    $('#view').onchange=e=>{filters.view=e.target.value;limit=70;render();};
    $('#tag-filter').onchange=e=>{filters.tag=e.target.value;limit=70;render();};
    $('#guided-only').onchange=e=>{filters.guided=e.target.checked;limit=70;render();};
    $('#all-layers').onclick=()=>{filters.categories=Object.keys(CATEGORIES);render();};
    $('#more-results').onclick=()=>{limit+=70;render();};
    $('#reset-map').onclick=()=>map.fitBounds([[0,0],[4096,4096]],{padding:[15,15]});
    $('#fit-results').onclick=()=>{const points=results.filter(r=>r.space===map.spaceId).map(r=>mapPoint(r,activeSpace()));if(points.length)map.fitBounds(L.latLngBounds(points).pad(.12),{maxZoom:2,padding:[40,90]});else toast('No matching points on the displayed map. Select a result to switch maps.');};
    $('#add-marker').onclick=()=>{if(!requireLogin())return;adding=!adding;document.body.classList.toggle('adding',adding);$('#add-marker').textContent=adding?'Cancel marker':'＋ Add marker';$('#map-message').hidden=!adding;$('#map-message').textContent='Click a spot, or pan the map and press Enter. Escape cancels.';if(adding)$('#map').focus();};
    $('#login-button').onclick=()=>authDialog('login');$('#signup-button').onclick=()=>authDialog('signup');$('#profile-button').onclick=profileDialog;
    $('#map-key').onclick=mapKey;$('#badge-preview').onclick=badgePreview;$('#help-button').onclick=helpDialog;$('#sources-button').onclick=sourcesDialog;
    document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('#modal').open){e.preventDefault();$('#search').focus();}if(e.key==='Escape'&&adding){adding=false;document.body.classList.remove('adding');$('#add-marker').textContent='＋ Add marker';$('#map-message').hidden=true;}});
    new ResizeObserver(()=>map.invalidateSize({animate:false})).observe($('#map'));
    render();if(storageError)toast(storageError);
  }catch(e){$('#edition').textContent='V3.2 · Setup incomplete';$('#results').innerHTML=`<p class="empty">${esc(e.message)} Check that data/, vendor/ and assets/ were uploaded as folders beside index.html. V3 also requires data/details.json, data/community.json and site-config.json.</p>`;$('#result-count').textContent='Unable to load atlas';toast('Could not load the atlas. Check the included setup instructions.');console.error(e);}
}
start();
