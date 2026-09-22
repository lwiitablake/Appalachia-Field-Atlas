export const clampZoom=n=>Math.max(1,Math.min(4,n));
export function imageGestures(viewport,media,onScale){
 let scale=1,x=0,y=0,points=new Map(),last=null,pinch=null;
 const render=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;x=Math.min(0,Math.max(w-w*scale,x));y=Math.min(0,Math.max(h-h*scale,y));media.style.transformOrigin='0 0';media.style.transform=`translate(${x}px,${y}px) scale(${scale})`;onScale(scale);};
 const setScale=(next,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2)=>{next=clampZoom(next);const ratio=next/scale;x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;scale=next;render();};
 viewport.style.touchAction='none';viewport.style.overflow='hidden';viewport.style.cursor='grab';
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();e.stopPropagation();viewport.focus({preventScroll:true});viewport.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});last={x:e.clientX,y:e.clientY};if(points.size===2){const [a,b]=[...points.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}viewport.style.cursor='grabbing';},{capture:true});
 viewport.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;e.preventDefault();e.stopPropagation();points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){const [a,b]=[...points.values()],dist=Math.hypot(a.x-b.x,a.y-b.y),r=viewport.getBoundingClientRect();if(pinch>0)setScale(scale*dist/pinch,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch=dist;}else if(last){x+=e.clientX-last.x;y+=e.clientY-last.y;render();}last={x:e.clientX,y:e.clientY};},{capture:true});
 const end=e=>{if(!points.has(e.pointerId))return;e.stopPropagation();points.delete(e.pointerId);pinch=null;last=points.size?[...points.values()][0]:null;viewport.style.cursor='grab';};
 viewport.addEventListener('pointerup',end,true);viewport.addEventListener('pointercancel',end,true);
 viewport.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();const r=viewport.getBoundingClientRect();setScale(scale*(e.deltaY<0?1.15:1/1.15),e.clientX-r.left,e.clientY-r.top);},{passive:false});
 viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='+'||e.key==='=')setScale(scale+.5);else if(e.key==='-')setScale(scale-.5);else if(e.key==='0'){scale=1;x=y=0;render();}else{x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;render();}}});
 render();return {zoom:delta=>setScale(scale+delta),reset:()=>{scale=1;x=y=0;render();}};
}
