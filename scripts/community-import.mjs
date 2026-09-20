import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateContribution(issue,ids){
 if(issue.pull_request)throw Error('Use an issue, not a pull request.');
 const match=(issue.body||'').match(/```json\s*([\s\S]*?)\s*```/);
 if(!match)throw Error('Missing JSON contribution block.');
 const value=JSON.parse(match[1]);
 if(!ids.has(value.recordId)||!['comment','tag','star'].includes(value.type))throw Error('Unknown location or contribution type.');
 const text=typeof value.text==='string'?value.text.trim():'';
 if(value.type!=='star'&&(!text||text.length>(value.type==='tag'?40:1000)))throw Error('Invalid contribution length.');
 if(!/^[\w-]+$/.test(issue.user?.login||''))throw Error('Missing GitHub author.');
 return {issue:issue.number,recordId:value.recordId,type:value.type,text:value.type==='star'?'':text,author:issue.user.login,url:issue.html_url,date:issue.created_at};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const number=process.env.ISSUE_NUMBER,repo=process.env.GITHUB_REPOSITORY;
 if(!/^\d+$/.test(number||''))throw Error('Issue number must be numeric.');
 const res=await fetch(`https://api.github.com/repos/${repo}/issues/${number}`,{headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json'}});
 if(!res.ok)throw Error(`GitHub returned ${res.status}`);
 const atlas=JSON.parse(readFileSync('data/atlas.json','utf8')),issue=await res.json();
 const entry=validateContribution(issue,new Set(atlas.records.map(r=>r.id)));
 const data=JSON.parse(readFileSync('data/community.json','utf8'));
 data.entries=data.entries.filter(e=>e.issue!==entry.issue);data.entries.push(entry);data.updated=new Date().toISOString();
 writeFileSync('data/community.json',JSON.stringify(data,null,2)+'\n');
}
