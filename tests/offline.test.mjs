import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const dist=process.env.FIELDFRAME_TEST_DIST||'dist';
const worker=fs.readFileSync(path.join(dist,'sw.js'),'utf8');
const photos=JSON.parse(fs.readFileSync(process.env.FIELDFRAME_TEST_PHOTOS||'src/photo-manifest.json','utf8'));
const photoPath=id=>photos[id].src.slice(2);
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'offline-manifest.json'),'utf8'));
const mainScript=manifest.files.find(file=>file.startsWith('assets/')&&file.endsWith('.js'));
const cacheName=(root,version=manifest.version)=>'fieldframe:'+encodeURIComponent(root)+':'+version;
function cacheStorage(){
 const stores=new Map();
 const url=input=>typeof input==='string'?input:input.url;
 return {stores,async open(name){
  if(!stores.has(name))stores.set(name,new Map());
  const entries=stores.get(name);
  return {
   async put(key,response){entries.set(url(key),response.clone());},
   async match(key){return entries.get(url(key))?.clone();},
   async delete(key){return entries.delete(url(key));},
   async keys(){return [...entries.keys()].map(key=>new Request(key));},
  };
 },async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);}};
}
function harness({root='https://fieldframe.example/subpath/',storage=cacheStorage(),version=manifest.version,badFile,loginHTML=false,emptyBody=false,pendingNavigation=false,transientFile,transientFailures=2,extraClients=[]}={}){
 const handlers={},messages=[],navigations=[];let network=true,fetchCount=0,claimed=false,skipped=false,transientAttempts=0;
 const client={id:root+'main-client',url:root,postMessage:m=>messages.push(m),navigate:url=>{navigations.push(url);return pendingNavigation?new Promise(()=>{}):Promise.resolve({url});}};
 const clients=[client,...extraClients];
 const self={registration:{scope:root},location:{origin:new URL(root).origin},clients:{
  matchAll:async options=>options?.includeUncontrolled?clients:clients.filter(c=>c.url.startsWith(root)&&c.controlled!==false),
  claim:async()=>{claimed=true;},
 },skipWaiting:async()=>{skipped=true;},addEventListener:(name,handler)=>{handlers[name]=handler;}};
 const fetch=async input=>{
  fetchCount++;if(!network)throw Error('Network disabled by test');
  const url=new URL(typeof input==='string'?input:input.url);
  const file=url.pathname.slice(new URL(root).pathname.length);
  if(file===transientFile&&++transientAttempts<=transientFailures)return new Response('Temporarily unavailable',{status:503});
  if(file===badFile&&emptyBody)return new Response('',{headers:{'content-type':'image/webp'}});
  if(file===badFile)return loginHTML?new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}}):new Response('missing',{status:404});
  const filename=path.join(dist,file);
  if(!fs.existsSync(filename)||!fs.statSync(filename).isFile())return new Response('missing',{status:404});
  const types={'.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.js':'text/javascript','.css':'text/css','.json':'application/json','.pdf':'application/pdf'};
  return new Response(fs.readFileSync(filename),{headers:{'content-type':types[path.extname(file)]||'application/octet-stream'}});
 };
 const source=worker.replace(`const VERSION=${JSON.stringify(manifest.version)};`,`const VERSION=${JSON.stringify(version)};`);
 vm.runInNewContext(source,{self,caches:storage,fetch,Response,Request,URL,console,setTimeout});
 const fire=async(name,data={})=>{let promise;handlers[name]({...data,waitUntil:p=>{promise=p;}});await promise;};
 const message=async(type,{current=false,source=client,...data}={})=>fire('message',{source,data:{type,scope:root,...(current?{assetUrl:root+mainScript}:{}),...data}});
 const request=async(file,mode='cors')=>{let promise;handlers.fetch({request:{url:new URL(file,root).href,method:'GET',mode},respondWith:p=>{promise=p;}});return promise;};
 return {root,fire,message,request,storage,client,clients,messages,navigations,
  get stores(){return storage.stores.get(cacheName(root,version));},
  disableNetwork(){network=false;},enableNetwork(){network=true;},setBadFile(file){badFile=file;},
  get transientAttempts(){return transientAttempts;},get fetchCount(){return fetchCount;},get claimed(){return claimed;},get skipped(){return skipped;}};
}
async function seedOldCache(storage,root,{legacy=false,siblingRoot}={}){
 const name=legacy?'fieldframe-legacy-version':cacheName(root,'previous-version');
 const cache=await storage.open(name);
 const oldFiles=['index.html','assets/old-build.js','photos/replaced-photo.webp'];
 await cache.put(root+'index.html',new Response('<title>Fieldframe previous edition</title>'));
 await cache.put(root+'assets/old-build.js',new Response('/* previous Fieldframe app */'));
 await cache.put(root+'photos/replaced-photo.webp',new Response(fs.readFileSync(path.join(dist,photoPath('milky-way')))));
 await cache.put(root+'offline-manifest.json',new Response(JSON.stringify({files:oldFiles})));
 await cache.put(root+'__fieldframe_complete__',new Response('previous-version'));
 if(siblingRoot){
  await cache.put(siblingRoot+'index.html',new Response('<title>Fieldframe sibling edition</title>'));
  await cache.put(siblingRoot+'offline-manifest.json',new Response(JSON.stringify({files:['index.html']})));
  await cache.put(siblingRoot+'__fieldframe_complete__',new Response('previous-version'));
 }
 return name;
}

describe('Built service worker: real production files and isolated caches',()=>{
 it('includes every scene photograph and the public sample, but no paid guide',()=>{
  expect(manifest.scenePhotos).toBe(120);expect(manifest.sceneSheets).toBe(120);
  expect(manifest.files.filter(file=>file.startsWith('photos/'))).toHaveLength(120);
  for(const photo of Object.values(photos))expect(manifest.files).toContain(photo.src.slice(2));
  for(const file of ['index.html','icon-192.png','icon-512.png','manifest.webmanifest','downloads/fieldframe-sample.pdf'])expect(manifest.files).toContain(file);
  expect(manifest.files.some(file=>file.includes('complete-field-guide'))).toBe(false);
 });
 it('saves the exact production bytes before readiness, then serves a new scene, script and photograph without network',async()=>{
  const h=harness();await h.fire('install');await h.fire('activate');
  expect(h.skipped).toBe(true);expect(h.claimed).toBe(true);
  const status=h.messages.filter(message=>message.status==='ready').at(-1);
  expect(status.scope).toBe(h.root);expect(status.done).toBe(manifest.files.length+1);expect(status.done).toBe(status.total);
  expect(h.stores.size).toBe(manifest.files.length+2);
  h.disableNetwork();const before=h.fetchCount;
  const shell=await h.request('index.html?trip=1#/scene/focus-stacking','navigate');
  expect(await shell.text()).toBe(fs.readFileSync(path.join(dist,'index.html'),'utf8'));
  const script=await h.request(mainScript);expect(await script.text()).toBe(fs.readFileSync(path.join(dist,mainScript),'utf8'));
  const image=await h.request(photoPath('underwater-natural-light'));
  expect(Buffer.from(await image.arrayBuffer())).toEqual(fs.readFileSync(path.join(dist,photoPath('underwater-natural-light'))));
  const sample=await h.request('downloads/fieldframe-sample.pdf');expect((await sample.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  expect(h.fetchCount).toBe(before);
 });
 it('does not await a client navigation that itself needs the newly activating worker',async()=>{
  const h=harness({pendingNavigation:true});await seedOldCache(h.storage,h.root);
  await h.fire('install');await h.fire('activate');
  expect(h.claimed).toBe(true);expect(h.navigations).toEqual([h.root]);expect(h.messages.at(-1).status).toBe('ready');
 });
 it('recovers from two transient errors but stops after the third failed attempt',async()=>{
  const recovering=harness({transientFile:photoPath('milky-way')});await recovering.fire('install');
  expect(recovering.transientAttempts).toBe(3);expect(recovering.messages.at(-1).status).toBe('ready');
  const failed=harness({transientFile:photoPath('milky-way'),transientFailures:10});
  await expect(failed.fire('install')).rejects.toThrow(/503/);
  expect(failed.transientAttempts).toBe(3);expect(failed.skipped).toBe(false);expect(failed.messages.at(-1).status).toBe('error');
 });
 it.each([{loginHTML:false,emptyBody:false,error:/404/},{loginHTML:true,emptyBody:false,error:/sign-in/},{loginHTML:false,emptyBody:true,error:/Empty response/}])('rejects incomplete or substituted assets without false readiness: %j',async options=>{
  const h=harness({badFile:photoPath('milky-way'),...options});
  await expect(h.fire('install')).rejects.toThrow(options.error);
  expect(h.skipped).toBe(false);expect(h.stores.has(h.root+'__fieldframe_complete__')).toBe(false);
  expect(h.messages.some(message=>message.status==='ready')).toBe(false);
 });
 it('detects an evicted file and repairs it from the real distribution when online again',async()=>{
  const h=harness();await h.fire('install');h.stores.delete(h.root+mainScript);
  await h.message('VERIFY');expect(h.messages.at(-1).status).toBe('error');expect(h.messages.at(-1).done).toBe(h.messages.at(-1).total-1);
  await h.message('CACHE_ALL');expect(h.messages.at(-1).status).toBe('ready');
  h.disableNetwork();expect((await h.request(mainScript)).status).toBe(200);
 });
 it('does not accept a stale completion marker or a cached empty body during verification',async()=>{
  const h=harness();await h.fire('install');
  h.stores.set(h.root+'__fieldframe_complete__',new Response('another-version'));
  await h.message('VERIFY');expect(h.messages.at(-1).status).toBe('error');
  h.stores.set(h.root+'__fieldframe_complete__',new Response(manifest.version));
  h.stores.set(h.root+mainScript,new Response(''));
  await h.message('VERIFY');expect(h.messages.at(-1).status).toBe('error');
 });
 it('cached-only rehearsal blocks network fallbacks and can be turned off',async()=>{
  const h=harness();await h.fire('install');await h.message('REHEARSAL_ON');
  expect(h.messages.at(-1).rehearsal).toBe(true);const before=h.fetchCount;
  expect((await h.request('not-saved.txt')).status).toBe(503);expect(h.fetchCount).toBe(before);
  await h.message('REHEARSAL_OFF');expect(h.messages.at(-1).rehearsal).toBe(false);
  expect((await h.request('not-saved.txt')).status).toBe(404);expect(h.fetchCount).toBe(before+1);
 });
 it('keeps sibling deployments offline when a different version activates and cleans its own caches',async()=>{
  const storage=cacheStorage(),a=harness({root:'https://fieldframe.example/Photography-Tips/',storage});
  await a.fire('install');await a.fire('activate');
  const b=harness({root:'https://fieldframe.example/Other-Fieldframe/',storage,version:'sibling-version'});
  const bOld=await seedOldCache(storage,b.root);await b.fire('install');await b.fire('activate');await b.message('STATUS',{current:true});
  expect(storage.stores.has(bOld)).toBe(false);expect(storage.stores.has(cacheName(a.root))).toBe(true);
  a.disableNetwork();expect((await a.request('', 'navigate')).status).toBe(200);expect((await a.request(mainScript)).status).toBe(200);
 });
 it('does not broadcast or accept control messages from a sibling scope',async()=>{
  const siblingMessages=[];
  const sibling={id:'other',url:'https://fieldframe.example/other/',postMessage:message=>siblingMessages.push(message)};
  const h=harness({extraClients:[sibling]});await h.fire('install');
  expect(siblingMessages).toEqual([]);
  await h.message('REHEARSAL_ON',{source:sibling,scope:sibling.url});await h.message('STATUS');
  expect(h.messages.at(-1).rehearsal).toBe(false);expect(siblingMessages).toEqual([]);
 });
 it('retains old photos and code while any old tab remains, then removes them once every client runs the current script',async()=>{
  const second={id:'second-tab',url:'https://fieldframe.example/subpath/#/scene/light-painting',postMessage:()=>{}};
  const h=harness({extraClients:[second]}),old=await seedOldCache(h.storage,h.root);
  await h.fire('install');await h.fire('activate');h.disableNetwork();
  expect((await h.request('photos/replaced-photo.webp')).status).toBe(200);
  expect(await (await h.request('assets/old-build.js')).text()).toContain('previous Fieldframe');
  await h.message('STATUS',{current:true});expect(h.storage.stores.has(old)).toBe(true);
  await h.message('STATUS',{source:second,current:true});expect(h.storage.stores.has(old)).toBe(false);
  expect((await h.request(mainScript)).status).toBe(200);expect((await h.request('photos/replaced-photo.webp')).status).toBe(503);
 });
 it('migrates only this deployment’s legacy manifest entries and preserves siblings in a shared old cache',async()=>{
  const h=harness(),sibling='https://fieldframe.example/other/';
  const legacy=await seedOldCache(h.storage,h.root,{legacy:true,siblingRoot:sibling});
  await h.fire('install');await h.fire('activate');await h.message('STATUS',{current:true});
  const remaining=h.storage.stores.get(legacy);
  expect(remaining.has(sibling+'index.html')).toBe(true);expect(remaining.has(sibling+'__fieldframe_complete__')).toBe(true);
  expect([...remaining.keys()].some(url=>url.startsWith(h.root))).toBe(false);
 });
 it('a failed new-version install cannot delete or declare readiness for the previous working library',async()=>{
  const storage=cacheStorage(),old=harness({storage,version:'working-previous'});await old.fire('install');await old.fire('activate');
  const failed=harness({storage,badFile:photoPath('milky-way')});await expect(failed.fire('install')).rejects.toThrow(/404/);
  expect(storage.stores.has(cacheName(old.root,'working-previous'))).toBe(true);
  expect(failed.messages.some(message=>message.status==='ready')).toBe(false);expect(failed.skipped).toBe(false);
  old.disableNetwork();expect((await old.request('', 'navigate')).status).toBe(200);
 });
});
