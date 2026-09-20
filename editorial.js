export function evidenceFor(record,guides,details={}){
 const exact=details[record.id]||{};
 const photos=(exact.photos||[]).filter(p=>p.path?.startsWith('assets/photos/')&&!p.path.includes('..')&&/^https:\/\//.test(p.source||'')&&p.credit&&p.license&&p.alt);
 const text=typeof exact.description==='string'&&!!exact.description.trim()&&/^https:\/\//.test(exact.source||'')&&!!exact.credit&&!!exact.license;
 const area=!!guides[record.area]?.[record.category]?.length;
 return {photos,text,area,entry:exact,classes:[photos.length?'has-photo':'',(text||area)?'has-text':''].filter(Boolean).join(' '),label:[photos.length?'Sourced game screenshot':'',text?'Detailed pin description':area?'Written area guide (not pin-verified)':''].filter(Boolean).join(' · ')||'Coordinates and overhead map only'};
}
export function coordinates(record){return `X ${record.x.toFixed(2)} · Y ${record.y.toFixed(2)}${Number.isFinite(record.z)?` · Z ${record.z.toFixed(2)}`:''}`;}

export function matchesEvidence(record,guides,details,photos,guided){
 const e=evidenceFor(record,guides,details);
 return (!photos&&!guided)||(photos&&e.photos.length>0)||(guided&&(e.text||e.area));
}
