export function mockGitHub({login='lwiitablake',failPR=false}={}){
 const calls=[],blobs=[],recordId='ref-003C716E';let branch=false,pr=null,failed=false;
 const docs={'data/atlas.json':{records:[{id:recordId}]},'data/details.json':{[recordId]:{description:'Preserve existing text',photos:[{path:'assets/photos/old.webp',caption:'Old photo'}]}},'data/community.json':{entries:[{type:'comment',text:'Keep me'}]}};
 async function fetcher(url,options={}){const u=new URL(url),path=u.pathname.replace('/repos/lwiitablake/Appalachia-Field-Atlas',''),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;calls.push({path,method,body,headers:options.headers});let data,status=200;
  if(path==='/user')data={login};else if(path==='')data={owner:{login:'lwiitablake'},permissions:{push:true},default_branch:'main'};
  else if(path==='/git/ref/heads/main')data={object:{sha:'base'}};
  else if(path==='/git/commits/base')data={tree:{sha:'tree'}};
  else if(path==='/git/trees/tree')data={tree:Object.keys(docs).map(path=>({path,type:'blob',sha:'doc-'+Object.keys(docs).indexOf(path)})),truncated:false};
  else if(path.startsWith('/git/blobs/doc-'))data={encoding:'base64',content:Buffer.from(JSON.stringify(Object.values(docs)[Number(path.split('doc-')[1])])).toString('base64')};
  else if(path==='/git/blobs'&&method==='POST'){blobs.push(body);data={sha:'blob-'+blobs.length};}
  else if(path==='/git/trees'&&method==='POST')data={sha:'new-tree'};
  else if(path==='/git/commits'&&method==='POST')data={sha:'new-commit'};
  else if(path.startsWith('/git/ref/heads/atlas-photos/')){data=branch?{object:{sha:'new-commit'}}:{};if(!branch)status=404;}
  else if(path==='/git/refs'&&method==='POST'){branch=true;data={ref:body.ref};}
  else if(path==='/pulls'&&method==='GET')data=pr?[pr]:[];
  else if(path==='/pulls'&&method==='POST'){if(failPR&&!failed){failed=true;status=403;data={};}else data=pr={html_url:'https://github.com/lwiitablake/Appalachia-Field-Atlas/pull/123'};}
  else throw Error('Unexpected mock request '+method+' '+path);
  return {ok:status<400,status,json:async()=>data};
 }
 return {fetcher,calls,blobs,recordId};
}
