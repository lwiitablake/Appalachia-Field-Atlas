import {zoomButton} from './photo-viewer.js';
export function swipeDirection(dx,dy){return Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0;}
export function shouldMinimize(dx,dy){return dy>=75&&dy>Math.abs(dx)*1.5;}
export function dotIndices(total,current,max=7){const start=Math.max(0,Math.min(total-max,current-Math.floor(max/2)));return Array.from({length:Math.min(total,max)},(_,i)=>start+i);}
export function mountGallery(root,photos,fallback){
 let images=[...photos],index=0,start=null;
 function draw(){
  root.replaceChildren();
  if(!images.length){fallback(root);return;}
  const photo=images[index],figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  figure.className='screenshot-slide';img.src=photo.path;img.alt=photo.alt;img.draggable=false;
  img.onerror=()=>{images=images.filter(x=>x!==photo);index=Math.min(index,images.length-1);draw();};
  const credit=document.createElement('a');credit.href=photo.source;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent=photo.credit+' · Source ↗';
  caption.append(credit,document.createElement('br'),document.createTextNode(photo.license));
  if(photo.scope){const scope=document.createElement('p');scope.textContent=photo.scope;caption.append(scope);}
  figure.append(img,caption);root.append(figure);zoomButton(root,photo.path,photo.alt);
  if(images.length<2)return;
  const controls=document.createElement('div');controls.className='gallery-controls';
  const previous=document.createElement('button'),next=document.createElement('button'),dots=document.createElement('div'),status=document.createElement('span');
  previous.textContent='‹';previous.setAttribute('aria-label','Previous image');next.textContent='›';next.setAttribute('aria-label','Next image');
  const move=delta=>{index=(index+delta+images.length)%images.length;draw();};
  previous.onclick=()=>{move(-1);root.querySelector('[aria-label="Previous image"]').focus({preventScroll:true});};
  next.onclick=()=>{move(1);root.querySelector('[aria-label="Next image"]').focus({preventScroll:true});};
  dots.className='gallery-dots';
  for(const n of dotIndices(images.length,index)){const dot=document.createElement('button');dot.setAttribute('aria-label',`Show image ${n+1}`);dot.setAttribute('aria-current',String(n===index));dot.className='gallery-dot';dot.onclick=()=>{index=n;draw();root.querySelector(`[aria-label="Show image ${n+1}"]`)?.focus({preventScroll:true});};dots.append(dot);}
  status.textContent=`${index+1} / ${images.length}`;status.setAttribute('aria-live','polite');controls.append(previous,dots,status,next);root.append(controls);
  img.style.touchAction='pan-y';img.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};img.setPointerCapture?.(e.pointerId);};img.onpointerup=e=>{if(!start)return;const direction=swipeDirection(e.clientX-start.x,e.clientY-start.y);start=null;if(direction)move(direction);};img.onpointercancel=()=>start=null;
 }
 root.tabIndex=0;root.setAttribute('role','region');root.setAttribute('aria-label','Location image gallery');
 root.onkeydown=e=>{if(images.length>1&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();index=(index+(e.key==='ArrowRight'?1:-1)+images.length)%images.length;draw();root.focus({preventScroll:true});}};
 draw();
}
