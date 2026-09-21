import {blankProgress,validateProgress} from './model.js';
const PREFIX='field-atlas.v1.';
const ITERATIONS=600000;
const enc=new TextEncoder(),dec=new TextDecoder();
const to64=a=>btoa(String.fromCharCode(...a));
const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export function normalizeName(name) {
  const n=name.trim().toLowerCase();
  if(!/^[a-z0-9][a-z0-9 _-]{2,31}$/.test(n)) throw Error('Use 3–32 letters, numbers, spaces, underscores or hyphens.');
  return n;
}
export function validateEnvelope(v) {
  if(!v||v.format!=='field-atlas-encrypted'||v.version!==1||normalizeName(v.name)!==v.name||v.iterations!==ITERATIONS||!Number.isSafeInteger(v.revision)||v.revision<1||typeof v.salt!=='string'||typeof v.iv!=='string'||typeof v.cipher!=='string'||v.cipher.length>7000000) throw Error('Unsupported or damaged encrypted backup.');
  if(from64(v.salt).length!==16||from64(v.iv).length!==12||from64(v.cipher).length<16) throw Error('Damaged encrypted backup.');
  return v;
}
async function derive(password,salt) {
  const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function aad(v) {return enc.encode(`${v.format}:${v.version}:${v.name}:${v.revision}`);}
async function seal(progress,key,base) {
  const v={...base,iv:to64(crypto.getRandomValues(new Uint8Array(12)))};
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv:from64(v.iv),additionalData:aad(v)},key,enc.encode(JSON.stringify(validateProgress(progress))));
  // Avoid spreading a large ciphertext into a function call.
  let binary=''; for(const b of new Uint8Array(cipher)) binary+=String.fromCharCode(b);
  v.cipher=btoa(binary); return v;
}
async function open(v,password) {
  validateEnvelope(v);
  const key=await derive(password,from64(v.salt));
  let clear;
  try {clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(v.iv),additionalData:aad(v)},key,from64(v.cipher));}
  catch {throw Error('Incorrect passphrase, or this backup is damaged.');}
  return {key,progress:validateProgress(JSON.parse(dec.decode(clear)))};
}
export class LocalVault {
  constructor(storage=localStorage) {this.storage=storage;this.session=null;this.validate=validateProgress;}
  list() {return Object.keys(this.storage).filter(k=>k.startsWith(PREFIX)).map(k=>k.slice(PREFIX.length)).sort();}
  async create(name,password) {
    name=normalizeName(name);
    if(password.length<12||password.length>256) throw Error('Use a passphrase of 12–256 characters.');
    if(this.storage.getItem(PREFIX+name)) throw Error('That local profile already exists. Log in instead.');
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const key=await derive(password,salt),progress=blankProgress();
    const v=await seal(progress,key,{format:'field-atlas-encrypted',version:1,name,iterations:ITERATIONS,salt:to64(salt),revision:1});
    if(this.storage.getItem(PREFIX+name)) throw Error('Profile was created in another tab. Log in instead.');
    this.storage.setItem(PREFIX+name,JSON.stringify(v));
    this.session={key,envelope:v};return progress;
  }
  async login(name,password) {
    name=normalizeName(name);
    const raw=this.storage.getItem(PREFIX+name);
    if(!raw) throw Error('No such profile on this browser. Sign up or restore a backup.');
    const envelope=validateEnvelope(JSON.parse(raw));
    const {key,progress}=await open(envelope,password);
    this.validate(progress);
    this.session={key,envelope};return progress;
  }
  async save(progress) {
    const s=this.session;
    if(!s) throw Error('Log in to save your progress.');
    const raw=this.storage.getItem(PREFIX+s.envelope.name);
    if(raw!==JSON.stringify(s.envelope)) throw Error('Profile changed in another tab. Lock and log in again before saving.');
    const v=await seal(progress,s.key,{...s.envelope,revision:s.envelope.revision+1});
    if(this.session!==s||this.storage.getItem(PREFIX+s.envelope.name)!==raw) throw Error('Session changed while saving. Please log in again.');
    this.storage.setItem(PREFIX+v.name,JSON.stringify(v));
    s.envelope=v;
  }
  export() {if(!this.session) throw Error('Log in first.');return JSON.stringify(this.session.envelope,null,2);}
  async restore(raw,password,overwrite=false) {
    if(raw.length>7500000) throw Error('Backup is too large.');
    const envelope=validateEnvelope(JSON.parse(raw));
    const {key,progress}=await open(envelope,password);
    this.validate(progress);
    if(this.storage.getItem(PREFIX+envelope.name)&&!overwrite) throw Error('Profile exists. Tick the replace checkbox to restore over it.');
    this.storage.setItem(PREFIX+envelope.name,JSON.stringify(envelope));
    this.session={key,envelope};return progress;
  }
  delete() {if(!this.session) throw Error('Log in first.');this.storage.removeItem(PREFIX+this.session.envelope.name);this.lock();}
  lock() {this.session=null;}
}
