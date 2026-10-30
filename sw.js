/* Fieldframe offline cache. Generated from the exact production output. */
const VERSION="be5772e94d36";
const FILES=["asset-credits.json","assets/index-BDVeKfgd.css","assets/index-BfZGASkc.js","downloads/fieldframe-sample.pdf","downloads/sample-preview-cover.webp","downloads/sample-preview-scene.webp","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest","photos/commons-11023060.webp","photos/commons-11901243.webp","photos/commons-161443792.webp","photos/commons-162211673.webp","photos/commons-170825653.webp","photos/commons-197832875.webp","photos/commons-2880974.webp","photos/commons-29584111.webp","photos/commons-4557818.webp","photos/commons-68393224.webp","photos/commons-78367567.webp","photos/commons-79981670.webp","photos/commons-eclipse-vienna.webp","photos/commons-light-painted-car.webp","photos/pexels-10147535.webp","photos/pexels-11605791.webp","photos/pexels-12584892.webp","photos/pexels-1271147.webp","photos/pexels-12719831.webp","photos/pexels-12841258.webp","photos/pexels-13592442.webp","photos/pexels-13975775.webp","photos/pexels-1429900.webp","photos/pexels-14577973.webp","photos/pexels-14776509.webp","photos/pexels-149594.webp","photos/pexels-1503520.webp","photos/pexels-15170758.webp","photos/pexels-15845337.webp","photos/pexels-16108227.webp","photos/pexels-1692689.webp","photos/pexels-1699588.webp","photos/pexels-17273353.webp","photos/pexels-17923070.webp","photos/pexels-18508975.webp","photos/pexels-18867525.webp","photos/pexels-19193225.webp","photos/pexels-19215108.webp","photos/pexels-19815200.webp","photos/pexels-19916712.webp","photos/pexels-20464631.webp","photos/pexels-23522359.webp","photos/pexels-2526268.webp","photos/pexels-2689912.webp","photos/pexels-28945726.webp","photos/pexels-28965748.webp","photos/pexels-29319273.webp","photos/pexels-29559268.webp","photos/pexels-29708270.webp","photos/pexels-29920213.webp","photos/pexels-29957517.webp","photos/pexels-30049696.webp","photos/pexels-30372298.webp","photos/pexels-30561190.webp","photos/pexels-31252461.webp","photos/pexels-31446152.webp","photos/pexels-32050400.webp","photos/pexels-3218443.webp","photos/pexels-32196368.webp","photos/pexels-33411954.webp","photos/pexels-33469720.webp","photos/pexels-33522092.webp","photos/pexels-33679554.webp","photos/pexels-33832070.webp","photos/pexels-34178496.webp","photos/pexels-34232700.webp","photos/pexels-34414223.webp","photos/pexels-34921744.webp","photos/pexels-34993666.webp","photos/pexels-35135977.webp","photos/pexels-35625685.webp","photos/pexels-358010.webp","photos/pexels-36103492.webp","photos/pexels-36326590.webp","photos/pexels-36836423.webp","photos/pexels-36955801.webp","photos/pexels-37146841.webp","photos/pexels-3731845.webp","photos/pexels-37423340.webp","photos/pexels-37606687.webp","photos/pexels-37786636.webp","photos/pexels-37927156.webp","photos/pexels-38340424.webp","photos/pexels-38351370.webp","photos/pexels-38626301.webp","photos/pexels-39038018.webp","photos/pexels-39133754.webp","photos/pexels-39831962.webp","photos/pexels-39879527.webp","photos/pexels-40573912.webp","photos/pexels-4511315.webp","photos/pexels-4589064.webp","photos/pexels-4992650.webp","photos/pexels-4996846.webp","photos/pexels-51365.webp","photos/pexels-533787.webp","photos/pexels-543223.webp","photos/pexels-5463569.webp","photos/pexels-5472742.webp","photos/pexels-5737315.webp","photos/pexels-5836095.webp","photos/pexels-5895397.webp","photos/pexels-6219619.webp","photos/pexels-6235455.webp","photos/pexels-62499.webp","photos/pexels-6266941.webp","photos/pexels-6321128.webp","photos/pexels-6345056.webp","photos/pexels-636388.webp","photos/pexels-6457.webp","photos/pexels-712392.webp","photos/pexels-7703038.webp","photos/pexels-8063134.webp","photos/pexels-8132066.webp","photos/pexels-8395910.webp","photos/pexels-8656064.webp","photos/pexels-8869381.webp","photos/pexels-9280240.webp","photos/pexels-9503307.webp","photos/pexels-9606024.webp","social-preview.jpg","offline-manifest.json"];
const ROOT=new URL(self.registration.scope).href;
const CACHE_PREFIX='fieldframe:'+encodeURIComponent(ROOT)+':';
const CACHE=CACHE_PREFIX+VERSION;
const key=(p)=>new URL(p,ROOT).href;
const CURRENT_SCRIPTS=new Set(FILES.filter(file=>file.startsWith('assets/')&&file.endsWith('.js')).map(key));
const currentClients=new Set();
let pending;
const inScope=url=>typeof url==='string'&&url.startsWith(ROOT);
async function tell(data,target){
 const message={app:'fieldframe',scope:ROOT,version:VERSION,total:FILES.length,...data};
 if(target){if(inScope(target.url))target.postMessage(message);return;}
 for(const client of await self.clients.matchAll({includeUncontrolled:true,type:'window'}))if(inScope(client.url))client.postMessage(message);
}
async function removeOldCaches(){
 let changed=false;
 for(const name of await caches.keys()){
  if(name.startsWith(CACHE_PREFIX)&&name!==CACHE){await caches.delete(name);changed=true;continue;}
  // Older editions used one origin-wide namespace. Remove only this deployment's
  // exact manifest entries, never a sibling deployment's cache or files.
  if(!name.startsWith('fieldframe-'))continue;
  const legacy=await caches.open(name),saved=await legacy.match(key('offline-manifest.json'));
  if(!saved)continue;
  let oldManifest;try{oldManifest=await saved.json();}catch{continue;}
  if(!Array.isArray(oldManifest.files))continue;
  const ownKeys=new Set([...oldManifest.files.filter(file=>typeof file==='string').map(key),key('offline-manifest.json'),key('__fieldframe_complete__'),key('__fieldframe_rehearsal__')]);
  for(const request of await legacy.keys())if(ownKeys.has(request.url)){await legacy.delete(request);changed=true;}
  if(!(await legacy.keys()).length)await caches.delete(name);
 }
 return changed;
}
async function hasPreviousCache(){
 for(const name of await caches.keys()){
  if(name.startsWith(CACHE_PREFIX)&&name!==CACHE)return true;
  if(name.startsWith('fieldframe-')&&await (await caches.open(name)).match(key('offline-manifest.json')))return true;
 }
 return false;
}
async function pruneForCurrentClients(){
 const cache=await caches.open(CACHE),marker=await cache.match(key('__fieldframe_complete__'));
 if(!marker||(await marker.text())!==VERSION)return;
 const clients=(await self.clients.matchAll({type:'window'})).filter(client=>inScope(client.url));
 if(clients.length&&clients.every(client=>currentClients.has(client.id)))await removeOldCaches();
}
async function previousResponse(requested){
 for(const name of (await caches.keys()).reverse()){
  if(name===CACHE||!(name.startsWith(CACHE_PREFIX)||name.startsWith('fieldframe-')))continue;
  const cache=await caches.open(name);
  if(!await cache.match(key('__fieldframe_complete__')))continue;
  // Legacy caches can be shared: the manifest confirms this deployment has entries here.
  if(name.startsWith('fieldframe-')&&!await cache.match(key('offline-manifest.json')))continue;
  const response=await cache.match(requested);if(response?.ok)return response;
 }
}
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
  async function runner(){while(next<FILES.length){const f=FILES[next++];const response=await fetchAsset(f);const type=response.headers.get('content-type')||'';if((/\.(js|css|json|svg|png|webp|jpg|jpeg|pdf|webmanifest)$/.test(f))&&type.includes('text/html'))throw Error('A sign-in page was returned instead of '+f);if(f==='index.html'&&!(await response.clone().text()).includes('Fieldframe'))throw Error('The app page was not returned; sign in to the host and retry');if((await response.clone().arrayBuffer()).byteLength===0)throw Error('Empty response for '+f);await cache.put(key(f),response);done++;await tell({status:'downloading',done,message:'Saving the complete library and its visuals…'});}}
  const results=await Promise.allSettled(Array.from({length:4},runner));
  const failed=results.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  await cache.put(key('__fieldframe_complete__'),new Response(VERSION));
  await tell({status:'ready',done:FILES.length,message:'All sheets, photographs and tools are saved on this device.'});
 })().catch(async error=>{await tell({status:'error',message:error.message+'. Reconnect and retry.'});throw error;}).finally(()=>{pending=undefined;});
 return pending;
}
async function status(target,verify=false){
 const cache=await caches.open(CACHE);let done=0;
 for(const f of FILES){const r=await cache.match(key(f));if(r?.ok&&(!verify||(await r.clone().arrayBuffer()).byteLength>0))done++;}
 const rehearsal=!!(await cache.match(key('__fieldframe_rehearsal__')));
 const marker=await cache.match(key('__fieldframe_complete__'));
 const ready=done===FILES.length&&!!marker&&(await marker.text())===VERSION;
 await tell({status:ready?'ready':pending?'downloading':'error',done,rehearsal,message:ready?(rehearsal?'Offline rehearsal active. All app files are served from cache.':verify?'Verified every saved file, including all scene photographs.':'All sheets, photographs and tools are saved on this device.'):'Offline files are incomplete. Use Download / retry while online.'},target);
}
self.addEventListener('install',event=>event.waitUntil(cacheAll().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const changed=await hasPreviousCache();await self.clients.claim();await status();if(changed)for(const client of await self.clients.matchAll({type:'window'})){if(client.url?.startsWith(ROOT)&&typeof client.navigate==='function')void client.navigate(client.url).catch(()=>{});}})()));
self.addEventListener('message',event=>{if(!inScope(event.source?.url)||(event.data?.scope&&event.data.scope!==ROOT))return;event.waitUntil((async()=>{if(CURRENT_SCRIPTS.has(event.data?.assetUrl)&&event.source.id)currentClients.add(event.source.id);const type=event.data?.type;if(type==='CACHE_ALL'){await cacheAll();await status(event.source);}else if(type==='STATUS'||type==='VERIFY')await status(event.source,type==='VERIFY');else if(type==='REHEARSAL_ON'||type==='REHEARSAL_OFF'){const cache=await caches.open(CACHE);if(type==='REHEARSAL_ON')await cache.put(key('__fieldframe_rehearsal__'),new Response('1'));else await cache.delete(key('__fieldframe_rehearsal__'));await status(event.source);}await pruneForCurrentClients();})().catch(error=>tell({status:'error',message:error.message},event.source)));});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||!event.request.url.startsWith(ROOT)||u.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const appNavigation=event.request.mode==='navigate'&&(u.pathname===new URL(ROOT).pathname||u.pathname===new URL('index.html',ROOT).pathname);
  const requested=appNavigation?key('index.html'):u.origin+u.pathname;
  const saved=await cache.match(requested);
  if(saved)return saved;
  const previous=await previousResponse(requested);if(previous)return previous;
  if(await cache.match(key('__fieldframe_rehearsal__')))return new Response('Offline rehearsal: this resource was not saved.',{status:503,headers:{'Content-Type':'text/plain'}});
  try{return await fetch(event.request);}catch{return new Response('This file is unavailable offline. Reconnect and download the full library.',{status:503,headers:{'Content-Type':'text/plain'}});}
 })());
});
