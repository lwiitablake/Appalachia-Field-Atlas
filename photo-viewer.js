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
export function zoomButton(root,source,alt){const button=document.createElement('button');button.type='button';button.className='zoom-photo';button.textContent='Zoom image';button.onclick=()=>openPhoto(typeof source==='function'?source():source,alt);root.append(button);}
