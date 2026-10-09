export function repositoryFor(location,configured){
 if(location.hostname.endsWith('.github.io')){
  const owner=location.hostname.split('.')[0],repo=decodeURIComponent(location.pathname.split('/').filter(Boolean)[0]||'');
  if(/^[\w.-]+$/.test(owner)&&/^[\w.-]+$/.test(repo))return `${owner}/${repo}`;
 }
 return configured;
}
export function communityFor(entries,id){
 const found=entries.filter(e=>e.recordId===id);
 return {comments:found.filter(e=>e.type==='comment'),tags:[...new Set(found.filter(e=>e.type==='tag').map(e=>e.text))],stars:new Set(found.filter(e=>e.type==='star').map(e=>e.author)).size};
}
export function submissionUrl(repository,record,type,text){
 if(!/^[\w.-]+\/[\w.-]+$/.test(repository))throw Error('Configure the community repository first.');
 const payload={recordId:record.id,type,text};
 const body='Public atlas contribution. A maintainer reviews this before it appears on the map. Do not include private information.\n\n```json\n'+JSON.stringify(payload,null,2)+'\n```';
 return `https://github.com/${repository}/issues/new?`+new URLSearchParams({title:`[Atlas ${type}] ${record.area||record.name}`,body});
}
