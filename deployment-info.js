export function deploymentLabel(version,meta){
 if(meta?.version!==version)return `V${version} · Update date unavailable`;
 if(meta.kind==='deployment'&&typeof meta.builtAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(meta.builtAt)&&Number.isFinite(Date.parse(meta.builtAt)))return `V${version} · Site updated ${new Date(meta.builtAt).toISOString().slice(0,10)} (UTC)`;
 if(meta.kind==='package'&&/^\d{4}-\d{2}-\d{2}$/.test(meta.packagedOn||''))return `V${version} · Packaged ${meta.packagedOn}`;
 return `V${version} · Update date unavailable`;
}
export async function loadDeploymentInfo(version,element,fetcher=globalThis.fetch){
 try{const response=await fetcher('deployment.json?v='+encodeURIComponent(version),{cache:'no-store'});if(!response.ok)throw Error();const info=await response.json();element.textContent=deploymentLabel(version,info);element.title=info.kind==='deployment'?'UTC build time of the currently published deployment: '+info.builtAt:'Package creation date. GitHub Actions replaces this with the deployment build date when publishing.';}catch{element.textContent=deploymentLabel(version,null);element.title='Deployment metadata could not be loaded. This does not affect map data.';}
}
