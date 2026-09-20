export function openPhoto(src,alt){
 const dialog=document.createElement('dialog');dialog.className='photo-viewer';dialog.setAttribute('aria-label','Zoom image');
 dialog.innerHTML='<div class="photo-toolbar"><strong>Image viewer</strong><button type="button" class="photo-reset">Reset image</button><button type="button" class="photo-close" aria-label="Close image viewer">×</button></div><p>Pinch or use the wheel to zoom. Drag to pan. Keyboard: arrow keys to pan, + / − to zoom.</p><div class="photo-map" tabindex="0" aria-label="Zoomable image"></div>';
 const back=document.activeElement;document.body.append(dialog);dialog.showModal();
 const node=dialog.querySelector('.photo-map');const map=L.map(node,{crs:L.CRS.Simple,minZoom:-5,maxZoom:4,attributionControl:false,scrollWheelZoom:true,touchZoom:true,zoomSnap:.25});
 const im=new Image();im.onload=()=>{const bounds=[[0,0],[im.height,im.width]];L.imageOverlay(src,bounds,{alt}).addTo(map);map.fitBounds(bounds);const reset=()=>map.fitBounds(bounds,{animate:false});dialog.querySelector('.photo-reset').onclick=reset;};im.onerror=()=>{node.textContent='Image unavailable. Close this viewer and try another image.';};im.src=src;
 dialog.querySelector('.photo-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{map.remove();dialog.remove();back?.focus?.({preventScroll:true});},{once:true});
 dialog.querySelector('.photo-close').focus();
}
export function zoomButton(root,source,alt){
 const media=root.querySelector('img,canvas'),viewport=document.createElement('div');viewport.className='inline-image-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Image: use zoom buttons, then scroll to pan');
 media.before(viewport);viewport.append(media);let scale=1;
 const controls=document.createElement('div');controls.className='inline-image-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Image zoom controls');
 const plus=document.createElement('button'),minus=document.createElement('button'),reset=document.createElement('button'),status=document.createElement('output'),expand=document.createElement('button');
 plus.textContent='+';plus.setAttribute('aria-label','Zoom image in');minus.textContent='−';minus.setAttribute('aria-label','Zoom image out');reset.textContent='Reset';reset.setAttribute('aria-label','Reset inline image zoom');expand.textContent='Expand image';
 for(const b of [plus,minus,reset,expand])b.type='button';status.setAttribute('aria-live','polite');
 function draw(){media.style.transform=`scale(${scale})`;media.style.transformOrigin='top left';status.textContent=Math.round(scale*100)+'%';minus.disabled=scale<=1;plus.disabled=scale>=4;if(scale===1){viewport.scrollTop=0;viewport.scrollLeft=0;}}
 plus.onclick=()=>{scale=Math.min(4,scale+.5);draw();};minus.onclick=()=>{scale=Math.max(1,scale-.5);draw();};reset.onclick=()=>{scale=1;draw();};expand.onclick=()=>openPhoto(typeof source==='function'?source():source,alt);
 viewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();scale=Math.max(1,Math.min(4,scale+(e.deltaY<0?.25:-.25)));draw();},{passive:false});
 controls.append(minus,status,plus,reset,expand);viewport.after(controls);draw();
}
