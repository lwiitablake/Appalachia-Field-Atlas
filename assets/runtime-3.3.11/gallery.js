import {zoomButton} from './photo-viewer.js';
export function swipeDirection(dx,dy){return Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0;}
export function shouldMinimize(dx,dy){return dy>=75&&dy>Math.abs(dx)*1.5;}
export function dotIndices(total,current,max=7){const start=Math.max(0,Math.min(total-max,current-Math.floor(max/2)));return Array.from({length:Math.min(total,max)},(_,i)=>start+i);}
export function mountGallery(root,photos,fallback){
 let images=[...photos],index=0;
 function move(delta,focus){index=(index+delta+images.length)%images.length;draw();if(focus)root.querySelector(focus)?.focus({preventScroll:true});}
 function button(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.onclick=fn;return b;}
 function draw(){
  root.replaceChildren();if(!images.length){fallback(root);return;}
  const photo=images[index],figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  figure.className='screenshot-slide';img.src=photo.path;img.alt=photo.alt;img.draggable=false;
  img.onerror=()=>{images=images.filter(x=>x!==photo);index=Math.max(0,Math.min(index,images.length-1));draw();};
  if(photo.caption){const card=document.createElement('div');card.className='photo-caption-card';const h=document.createElement('strong'),p=document.createElement('p');h.textContent='PHOTO NOTES';p.textContent=photo.caption;card.append(h,p);if(photo.tags?.length){const tags=document.createElement('p');tags.className='photo-tags';tags.textContent='Shows: '+photo.tags.join(' · ');card.append(tags);}caption.append(card);}
  const credits=document.createElement('div');credits.className='photo-credits';const credit=document.createElement('a');credit.href=photo.source;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent=photo.credit+' · Source ↗';credits.append(credit,document.createElement('br'),document.createTextNode(photo.license));
  if(photo.scope){const scope=document.createElement('p');scope.textContent=photo.scope;credits.append(scope);}caption.append(credits);
  figure.append(img,caption);root.append(figure);zoomButton(root,photo.path,photo.alt);
  if(images.length<2)return;
  const viewport=root.querySelector('.inline-image-viewport'),frame=document.createElement('div');frame.className='gallery-frame';viewport.before(frame);frame.append(viewport);
  for(const [delta,label,glyph,side] of [[-1,'Previous image','‹','left'],[1,'Next image','›','right']]){const b=button(glyph,label,()=>move(delta,`.gallery-edge-${side}`));b.className=`gallery-edge gallery-edge-${side}`;frame.append(b);}
  const controls=document.createElement('div');controls.className='gallery-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Choose photograph');
  const previous=button('‹','Previous photograph',()=>move(-1,'.gallery-controls button:first-child')),next=button('›','Next photograph',()=>move(1,'.gallery-controls button:last-child')),dots=document.createElement('div'),status=document.createElement('span');dots.className='gallery-dots';
  for(const n of dotIndices(images.length,index)){const dot=button('',`Show image ${n+1}`,()=>{index=n;draw();root.querySelector(`[aria-label="Show image ${n+1}"]`)?.focus({preventScroll:true});});dot.className='gallery-dot';dot.setAttribute('aria-current',String(n===index));dots.append(dot);}
  status.textContent=`${index+1} / ${images.length}`;status.setAttribute('aria-live','polite');controls.append(previous,dots,status,next);frame.after(controls);
 }
 root.tabIndex=0;root.setAttribute('role','region');root.setAttribute('aria-label','Location image gallery');
 root.onkeydown=e=>{if(images.length>1&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);root.focus({preventScroll:true});}};draw();
}
