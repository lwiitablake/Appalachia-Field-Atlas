const relativePaths=new WeakMap();
export const photoPath=file=>relativePaths.get(file)||file.webkitRelativePath||file.name;
export const supportedPhoto=file=>['image/png','image/jpeg','image/webp'].includes(file.type);
export function mergePhotos(current,incoming){const key=f=>JSON.stringify([photoPath(f),f.size,f.lastModified]);return [...new Map([...current,...incoming.filter(supportedPhoto)].map(f=>[key(f),f])).values()];}
// Capture entries inside the drop event: DataTransfer becomes unavailable afterwards.
export async function droppedPhotos(transfer){
 const entries=Array.from(transfer.items||[]).filter(i=>i.kind==='file').map(i=>({entry:i.webkitGetAsEntry?.(),file:i.getAsFile?.()}));
 const fallback=Array.from(transfer.files||[]),found=[];
 async function walk(entry,path=''){
  const name=path+entry.name;
  if(entry.isFile){const file=await new Promise((resolve,reject)=>entry.file(resolve,reject));relativePaths.set(file,name);found.push(file);return;}
  if(entry.isDirectory){const reader=entry.createReader();for(;;){const batch=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));if(!batch.length)break;for(const child of batch)await walk(child,name+'/');}}
 }
 if(entries.length){for(const {entry,file} of entries){if(entry)await walk(entry);else if(file){if(!file.type&&file.size===0)throw Error('This browser could not read a dropped folder. Use Choose photo folder instead.');found.push(file);}}}else found.push(...fallback);
 return found;
}
