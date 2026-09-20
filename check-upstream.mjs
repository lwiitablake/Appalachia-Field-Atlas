import {readFile} from 'node:fs/promises';
const local=JSON.parse(await readFile(new URL('../data/atlas.json',import.meta.url),'utf8'));
try{
  const response=await fetch('https://api.github.com/repos/AHeroicLlama/Mappalachia/releases/latest',{headers:{Accept:'application/vnd.github+json','User-Agent':'Appalachia-Field-Atlas-release-check'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`GitHub returned ${response.status}; no files were changed.`);
  const latest=await response.json();
  console.log(`Bundled: ${local.meta.release} / game ${local.meta.gameVersion}`);
  console.log(`Upstream: ${latest.tag_name} (${latest.published_at})`);
  console.log(latest.html_url);
  console.log(latest.tag_name===local.meta.release?'The bundled release matches the latest upstream release.':'A different upstream release is available. Follow DATA-MAINTENANCE.md; nothing was changed automatically.');
}catch(e){console.error(e.message);process.exitCode=1;}
