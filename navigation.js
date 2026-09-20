import {matches} from './model.js';
export const within=(r,b)=>!b||(r.x>=b[0]&&r.x<=b[2]&&r.y>=b[1]&&r.y<=b[3]);
export function nearbyRecords(records,origin,filters,progress,guides,category='all',limit=12,radius=20000){
 const priority=['bobblehead','magazine','caps','armor','fusion','location','area','region','interior','custom'];
 return records.filter(r=>r.id!==origin.id&&r.space===origin.space&&(category==='all'||r.category===category))
 .map(r=>({record:r,distance:Math.hypot(r.x-origin.x,r.y-origin.y),match:matches(r,{...filters,space:'all',view:'all',tag:'',guided:false},progress,guides)}))
 .filter(x=>x.distance<=radius)
 .sort((a,b)=>Number(b.match)-Number(a.match)||(a.match&&b.match?a.distance-b.distance:priority.indexOf(a.record.category)-priority.indexOf(b.record.category))||a.distance-b.distance)
 .slice(0,limit);
}
