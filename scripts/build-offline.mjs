import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dist=path.resolve('dist');
const photos=JSON.parse(fs.readFileSync('src/photo-manifest.json','utf8'));
const photoPaths=[...new Set(Object.values(photos).map(p=>p.src.replace(/^\.\//,'')))];
for(const photo of photoPaths)if(!fs.existsSync(path.join(dist,photo))||fs.statSync(path.join(dist,photo)).size<1000)throw new Error(`Missing or empty photograph: ${photo}`);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(dist).filter(f=>!f.endsWith('/sw.js')&&!f.endsWith('/offline-manifest.json')).map(f=>path.relative(dist,f).split(path.sep).join('/')).sort();
for(const file of files)if(fs.statSync(path.join(dist,file)).size===0)throw new Error(`Cannot publish an empty asset: ${file}`);
const digest=crypto.createHash('sha256');digest.update(fs.readFileSync('scripts/build-offline.mjs'));for(const f of files){digest.update(f);digest.update(fs.readFileSync(path.join(dist,f)));}const version=digest.digest('hex').slice(0,12);
const bytes=files.reduce((n,f)=>n+fs.statSync(path.join(dist,f)).size,0);
fs.writeFileSync(path.join(dist,'offline-manifest.json'),JSON.stringify({version,files,bytes,scenePhotos:photoPaths.length,sceneSheets:Object.keys(photos).length},null,2));
const manifest=[...files,'offline-manifest.json'];
const source=`/* Fieldframe offline cache. Generated from the exact production output. */
const VERSION=${JSON.stringify(version)};
const CACHE='fieldframe-'+VERSION;
const FILES=${JSON.stringify(manifest)};
const ROOT=self.registration.scope;
const key=(p)=>new URL(p,ROOT).href;
let pending;
async function tell(data,target){const message={app:'fieldframe',version:VERSION,total:FILES.length,...data};if(target){target.postMessage(message);return;}for(const c of await self.clients.matchAll({includeUncontrolled:true,type:'window'}))c.postMessage(message);}
async function fetchAsset(f){
 let response;
 for(let attempt=0;attempt<3;attempt++){
  response=undefined;
  try{response=await fetch(key(f),{cache:'reload',credentials:'same-origin'});}catch(error){if(attempt===2)throw error;}
  if(response?.ok)return response;
  if(response&&![429,500,502,503,504].includes(response.status))break;
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
 }
 throw Error('Could not save '+f+(response?' ('+response.status+')':''));
}
async function cacheAll(){
 if(pending)return pending;
 pending=(async()=>{
  const cache=await caches.open(CACHE);let done=0,next=0;
  await tell({status:'downloading',done,message:'Downloading every sheet and essential visual…'});
  async function runner(){while(next<FILES.length){const f=FILES[next++];const response=await fetchAsset(f);const type=response.headers.get('content-type')||'';if((/\\.(js|css|json|svg|png|webp|jpg|jpeg|pdf|webmanifest)$/.test(f))&&type.includes('text/html'))throw Error('A sign-in page was returned instead of '+f);if(f==='index.html'&&!(await response.clone().text()).includes('Fieldframe'))throw Error('The app page was not returned; sign in to the host and retry');if((await response.clone().arrayBuffer()).byteLength===0)throw Error('Empty response for '+f);await cache.put(key(f),response);done++;await tell({status:'downloading',done,message:'Saving the complete library and its visuals…'});}}
  const results=await Promise.allSettled(Array.from({length:4},runner));
  const failed=results.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  await cache.put(key('__fieldframe_complete__'),new Response(VERSION));
  await tell({status:'ready',done:FILES.length,message:'All sheets, photographs and tools are saved on this device.'});
 })().catch(async error=>{await tell({status:'error',message:error.message+'. Reconnect and retry.'});throw error;}).finally(()=>{pending=undefined;});
 return pending;
}
async function status(target,verify=false){
 const cache=await caches.open(CACHE);let done=0;
 for(const f of FILES){const r=await cache.match(key(f));if(r&&(!verify||(await r.clone().arrayBuffer()).byteLength>0))done++;}
 const rehearsal=!!(await cache.match(key('__fieldframe_rehearsal__')));
 const ready=done===FILES.length&&!!(await cache.match(key('__fieldframe_complete__')));
 await tell({status:ready?'ready':pending?'downloading':'error',done,rehearsal,message:ready?(rehearsal?'Offline rehearsal active. All app files are served from cache.':verify?'Verified every saved file, including all scene photographs.':'All sheets, photographs and tools are saved on this device.'):'Offline files are incomplete. Use Download / retry while online.'},target);
}
self.addEventListener('install',event=>event.waitUntil(cacheAll().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const old=(await caches.keys()).filter(name=>name.startsWith('fieldframe-')&&name!==CACHE);for(const name of old)await caches.delete(name);await self.clients.claim();await status();if(old.length)for(const client of await self.clients.matchAll({type:'window'})){if(client.url?.startsWith(ROOT)&&typeof client.navigate==='function')void client.navigate(client.url).catch(()=>{});}})()));
self.addEventListener('message',event=>{event.waitUntil((async()=>{const type=event.data?.type;if(type==='CACHE_ALL'){await cacheAll();await status(event.source);}else if(type==='STATUS'||type==='VERIFY')await status(event.source,type==='VERIFY');else if(type==='REHEARSAL_ON'||type==='REHEARSAL_OFF'){const cache=await caches.open(CACHE);if(type==='REHEARSAL_ON')await cache.put(key('__fieldframe_rehearsal__'),new Response('1'));else await cache.delete(key('__fieldframe_rehearsal__'));await status(event.source);}})().catch(error=>tell({status:'error',message:error.message},event.source)));});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||!event.request.url.startsWith(ROOT)||u.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const appNavigation=event.request.mode==='navigate'&&(u.pathname===new URL(ROOT).pathname||u.pathname===new URL('index.html',ROOT).pathname);
  const requested=appNavigation?key('index.html'):u.origin+u.pathname;
  const saved=await cache.match(requested);
  if(saved)return saved;
  if(await cache.match(key('__fieldframe_rehearsal__')))return new Response('Offline rehearsal: this resource was not saved.',{status:503,headers:{'Content-Type':'text/plain'}});
  try{return await fetch(event.request);}catch{return new Response('This file is unavailable offline. Reconnect and download the full library.',{status:503,headers:{'Content-Type':'text/plain'}});}
 })());
});
`;
fs.writeFileSync(path.join(dist,'sw.js'),source);
console.log(`Offline ${version}: ${manifest.length} files, ${(bytes/1024/1024).toFixed(2)} MB; ${photoPaths.length} real photographs.`);
