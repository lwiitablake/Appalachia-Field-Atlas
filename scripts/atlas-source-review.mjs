import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const atlas=await read('data/atlas.json'),details=await read('data/details.json'),registry=await read('data/source-watch.json');
const lines=['# Atlas Source Review',`Run: ${new Date().toISOString()}`,`Bundled game: ${atlas.meta.gameVersion}; release: ${atlas.meta.release}`,'','## Upstream release'];
try{
 const response=await fetch('https://api.github.com/repos/AHeroicLlama/Mappalachia/releases/latest',{headers:{'User-Agent':'Appalachia-Field-Atlas-source-review','Accept':'application/vnd.github+json'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 const release=await response.json();lines.push(`${release.tag_name===atlas.meta.release?'MATCH':'REVIEW NEEDED'}: ${release.tag_name}`,release.html_url,`Published: ${release.published_at}`);
}catch(error){lines.push(`CHECK FAILED: ${error.message}. No conclusion about freshness is possible.`);process.exitCode=1;}
lines.push('','## Content inventory');
const counts={};for(const r of atlas.records)counts[r.category]=(counts[r.category]||0)+1;
for(const [category,count] of Object.entries(counts))lines.push(`- ${category}: ${count}`);
lines.push('','## Missing documentation');
for(const category of Object.keys(counts)){
 const records=atlas.records.filter(r=>r.category===category);lines.push(`- ${category}: ${records.filter(r=>!details[r.id]?.photos?.length).length} without a spot photograph.`);
}
lines.push('','## Sources to inspect manually');
for(const s of registry.sources)lines.push(`- [${s.name}](${s.url}): ${s.use}`);
lines.push('','## Review gates','Follow ATLAS-SOURCE-REVIEW.md. Check existing item categories as well as new ones. Record source revision, exact record ID/space, permission evidence, credit and original URL. Do not auto-publish scraped prose or images. This report does not establish permission or verify that every placement is current.');
const out=path.join(root,'review-output');await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'atlas-source-review.md'),lines.join('\n')+'\n');
if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
console.log(lines.join('\n'));
