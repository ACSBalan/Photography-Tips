import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';
const worker=fs.readFileSync('dist/sw.js','utf8');
const photos=JSON.parse(fs.readFileSync('src/photo-manifest.json','utf8'));
const photoPath=id=>photos[id].src.slice(2);
const manifest=JSON.parse(fs.readFileSync('dist/offline-manifest.json','utf8'));
function harness({badFile,loginHTML=false,emptyBody=false}={}){
 const root='https://fieldframe.example/subpath/',handlers={},messages=[],stores=new Map();let network=true,fetchCount=0,claimed=false,skipped=false;
 const url=k=>typeof k==='string'?k:k.url;
 const cache={async put(k,v){stores.set(url(k),v.clone());},async match(k){return stores.get(url(k))?.clone();},async delete(k){return stores.delete(url(k));},async keys(){return [...stores.keys()];}};
 const names=new Set(['fieldframe-previous','unrelated-app']);
 const caches={async open(name){names.add(name);return cache;},async keys(){return [...names];},async delete(name){return names.delete(name);}};
 const client={postMessage:m=>messages.push(m)};
 const self={registration:{scope:root},location:{origin:'https://fieldframe.example'},clients:{matchAll:async()=>[client],claim:async()=>{claimed=true;}},skipWaiting:async()=>{skipped=true;},addEventListener:(n,f)=>{handlers[n]=f;}};
 const fetch=async input=>{fetchCount++;if(!network)throw Error('Network disabled by test');const f=url(input).slice(root.length);if(f===badFile&&emptyBody)return new Response('',{headers:{'content-type':'image/webp'}});if(f===badFile)return loginHTML?new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}}):new Response('missing',{status:404});if(f==='index.html')return new Response('<html><title>Fieldframe</title><div id="root"></div></html>',{headers:{'content-type':'text/html'}});return new Response(fs.existsSync('dist/'+f)?fs.readFileSync('dist/'+f):'asset',{headers:{'content-type':f.endsWith('.webp')?'image/webp':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.js')?'text/javascript':'application/octet-stream'}});};
 vm.runInNewContext(worker,{self,caches,fetch,Response,URL,console});
 const fire=async(name,data={})=>{let promise;handlers[name]({...data,waitUntil:p=>{promise=p;}});await promise;};
 const request=async(path,mode='cors')=>{let promise;handlers.fetch({request:{url:root+path,method:'GET',mode},respondWith:p=>{promise=p;}});return promise;};
 return {root,fire,request,stores,messages,names,disableNetwork(){network=false;},get fetchCount(){return fetchCount;},get claimed(){return claimed;},get skipped(){return skipped;}};
}
describe('Built service worker: complete offline behavior',()=>{
 it('includes every real scene photograph and the public sample, but no paid guide',()=>{
  expect(manifest.scenePhotos).toBe(120);expect(manifest.sceneSheets).toBe(120);
  expect(manifest.files.filter(f=>f.startsWith('photos/'))).toHaveLength(120);
  for(const p of Object.values(photos))expect(manifest.files).toContain(p.src.slice(2));
  for(const f of ['index.html','icon-192.png','icon-512.png','manifest.webmanifest','downloads/fieldframe-sample.pdf'])expect(manifest.files).toContain(f);
  expect(manifest.files.some(f=>f.includes('complete-field-guide'))).toBe(false);
  expect(manifest.files.some(f=>f.startsWith('visuals/')||f.startsWith('thumbnails/'))).toBe(false);
 });
 it('only reports ready after all assets are saved; serves an unvisited scene visual with the network unavailable',async()=>{
  const h=harness();await h.fire('install');expect(h.skipped).toBe(true);
  await h.fire('activate');expect(h.claimed).toBe(true);
  expect(h.names.has('fieldframe-previous')).toBe(false);expect(h.names.has('unrelated-app')).toBe(true);
  const status=h.messages.filter(m=>m.status==='ready').at(-1);expect(status.done).toBe(manifest.files.length+1);expect(status.done).toBe(status.total);
  h.disableNetwork();const before=h.fetchCount;
  const shell=await h.request('', 'navigate');expect(await shell.text()).toContain('Fieldframe');
  const image=await h.request(photoPath('partial-solar-eclipse'));expect(image.status).toBe(200);expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  const sample=await h.request('downloads/fieldframe-sample.pdf');expect(sample.status).toBe(200);expect((await sample.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  const bundle=manifest.files.find(f=>f.endsWith('.js'));const js=await h.request(bundle);expect((await js.text()).length).toBeGreaterThan(10000);
  expect(h.fetchCount).toBe(before);
 });
 it('a failed asset leaves the library unready instead of falsely claiming completion',async()=>{
  const h=harness({badFile:photoPath('milky-way')});await expect(h.fire('install')).rejects.toThrow();
  expect(h.skipped).toBe(false);expect(h.stores.has(h.root+'__fieldframe_complete__')).toBe(false);
  expect(h.messages.some(m=>m.status==='error')).toBe(true);expect(h.messages.some(m=>m.status==='ready')).toBe(false);
 });
 it('rejects a host sign-in page masquerading as an image',async()=>{
  const h=harness({badFile:photoPath('milky-way'),loginHTML:true});await expect(h.fire('install')).rejects.toThrow(/sign-in/);
  expect(h.messages.some(m=>m.status==='ready')).toBe(false);
 });
 it('does not report offline readiness when a response has an empty body',async()=>{
  const h=harness({badFile:photoPath('milky-way'),emptyBody:true});await expect(h.fire('install')).rejects.toThrow(/Empty response/);
  expect(h.skipped).toBe(false);expect(h.messages.some(m=>m.status==='ready')).toBe(false);
 });
 it('re-verifies the cache and detects eviction of a single visual',async()=>{
  const h=harness();await h.fire('install');h.stores.delete(h.root+photoPath('milky-way'));
  await h.fire('message',{data:{type:'VERIFY'},source:{postMessage:m=>h.messages.push(m)}});
  const s=h.messages.at(-1);expect(s.status).toBe('error');expect(s.done).toBe(s.total-1);
 });
 it('offline rehearsal blocks network fallbacks and can be turned off',async()=>{
  const h=harness();await h.fire('install');await h.fire('message',{data:{type:'REHEARSAL_ON'},source:{postMessage:m=>h.messages.push(m)}});
  expect(h.messages.at(-1).rehearsal).toBe(true);const before=h.fetchCount;
  const absent=await h.request('not-saved.txt');expect(absent.status).toBe(503);expect(h.fetchCount).toBe(before);
  await h.fire('message',{data:{type:'REHEARSAL_OFF'},source:{postMessage:m=>h.messages.push(m)}});expect(h.messages.at(-1).rehearsal).toBe(false);
 });
});
