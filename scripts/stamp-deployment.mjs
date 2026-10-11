import fs from 'node:fs';import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),{version}=JSON.parse(fs.readFileSync(new URL('package.json',root),'utf8'));
const data={version,kind:'deployment',builtAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null};
fs.writeFileSync(new URL('deployment.json',root),JSON.stringify(data,null,2)+'\n');
console.log('Stamped deployment metadata:',version,data.builtAt);
