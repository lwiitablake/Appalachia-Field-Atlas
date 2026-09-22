export const CATEGORIES = {
  bobblehead: {name:'Bobbleheads',singular:'Bobblehead',symbol:'B',color:'#ae542a'},
  magazine: {name:'Magazines',singular:'Magazine',symbol:'M',color:'#31727a'},
  lunchbox: {name:'Lunch pails',singular:'Lunch pail',symbol:'L',color:'#78582d'},
  cooler: {name:'Coolers',singular:'Cooler',symbol:'C',color:'#326686'},
  caps: {name:'Caps stashes',singular:'Caps stash',symbol:'¢',color:'#b93228'},
  armor: {name:'Power armor',singular:'Power armor',symbol:'A',color:'#67528a'},
  fusion: {name:'Fusion cores',singular:'Fusion core',symbol:'F',color:'#49773c'},
  location: {name:'Map destinations',singular:'Map destination',symbol:'◇',color:'#475455'},
  area: {name:'Other named areas',singular:'Named area',symbol:'○',color:'#6f6847'},
  region: {name:'Regions',singular:'Region',symbol:'▧',color:'#667553'},
  interior: {name:'Interior maps',singular:'Map directory entry',symbol:'▣',color:'#556c80'},
  custom: {name:'My markers',singular:'My marker',symbol:'⚑',color:'#9b4569'},
};
export const TAGS = ['Want','Farm route','Revisit','Danger','C.A.M.P.','Note'];
export const LOCATION_CATEGORIES=['location','area','region','interior'];
export function backgroundFor(space,preferred='satellite') {
  const key=Object.hasOwn(space.backgrounds||{},preferred)?preferred:'satellite';
  return {key,...(space.backgrounds?.[key]||{name:'Satellite / terrain',image:space.image,note:''})};
}
export const blankProgress=()=>({items:{},custom:[],categoryStars:[]});
export function mapPoint(record,space) {
  return [(record.y-(space.cy-space.range/2))/space.range*4096,(record.x-(space.cx-space.range/2))/space.range*4096];
}
export function worldPoint(latlng,space) {
  return {x:space.cx-space.range/2+latlng.lng/4096*space.range,y:space.cy-space.range/2+latlng.lat/4096*space.range};
}
export function matches(r,{query='',space='all',categories=[],view='all',tag='',guided=false},progress,guides={}) {
  if(space!=='all'&&r.space!==space) return false;
  if(categories.length&&!categories.includes(r.category)) return false;
  const p=progress.items[r.id]||{};
  if(view==='stars'&&!p.star) return false;
  if(view==='categories'&&!progress.categoryStars.includes(r.category)) return false;
  if(view==='unchecked'&&p.done) return false;
  if(view==='checked'&&!p.done) return false;
  if(tag&&!(p.tags||[]).includes(tag)) return false;
  if(guided&&!guides[r.area]?.[r.category]?.length) return false;
  const hay=[r.name,r.area,r.category,CATEGORIES[r.category]?.name,r.formId,r.editorId,r.directions,p.note,...(p.tags||[])].join(' ').toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every(word=>hay.includes(word));
}
export function validateProgress(p) {
  if(!p||typeof p!=='object'||!p.items||typeof p.items!=='object'||Array.isArray(p.items)||!Array.isArray(p.custom)||!Array.isArray(p.categoryStars)) throw Error('Invalid progress structure.');
  if(Object.keys(p.items).length>20000||p.custom.length>2000) throw Error('Backup exceeds supported limits.');
  const clean=blankProgress();
  for(const [id,v] of Object.entries(p.items)) {
    if(!/^(ref-[A-F0-9]{8}|loc-[A-F0-9]{8}|space-[A-F0-9]{8}|place-[a-f0-9]{16}|custom-[a-f0-9-]{36})$/.test(id)||!v||typeof v!=='object') throw Error('Invalid item record.');
    if(!Array.isArray(v.tags)||v.tags.length>12||v.tags.some(t=>typeof t!=='string'||t.length>40)||typeof v.note!=='string'||v.note.length>2000) throw Error('Invalid tags or notes.');
    clean.items[id]={star:!!v.star,done:!!v.done,tags:[...new Set(v.tags)],note:v.note};
  }
  const ids=new Set();
  for(const r of p.custom) {
    if(!r||!/^custom-[a-f0-9-]{36}$/.test(r.id)||ids.has(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>100||!/^\d+$/.test(r.space)||!Number.isFinite(r.x)||!Number.isFinite(r.y)||Math.abs(r.x)>1e7||Math.abs(r.y)>1e7||typeof r.directions!=='string'||r.directions.length>2000) throw Error('Invalid custom marker.');
    ids.add(r.id);
    clean.custom.push({id:r.id,name:r.name,area:'Personal marker',space:r.space,x:r.x,y:r.y,directions:r.directions,category:'custom'});
  }
  clean.categoryStars=[...new Set(p.categoryStars.filter(c=>Object.hasOwn(CATEGORIES,c)))];
  return clean;
}
