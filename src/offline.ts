import { useCallback, useEffect, useRef, useState } from 'react';
export type OfflineState={status:'checking'|'downloading'|'ready'|'error'|'unsupported';done:number;total:number;message:string;version:string;rehearsal:boolean};
const initial:OfflineState={status:'checking',done:0,total:0,message:'Checking offline files…',version:'',rehearsal:false};
export function offlineScope(baseURI:string):string {return new URL('./',baseURI).href;}
export function isOfflineMessageForScope(data:unknown,scope:string):data is Partial<OfflineState>&{app:string;scope:string} {
  if(!data||typeof data!=='object')return false;
  const message=data as Record<string,unknown>;
  return message.app==='fieldframe'&&message.scope===scope;
}
export function useOffline(){
 const [state,setState]=useState(initial);
 const registrationRef=useRef<ServiceWorkerRegistration|null>(null);
 const listenedRef=useRef<ServiceWorkerRegistration|null>(null);
 const scope=offlineScope(document.baseURI);
 const assetUrl=document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src;
 const updating=useCallback(()=>setState(v=>({...v,status:'downloading',message:'Downloading all sheets and photographs…'})),[]);
 const request=useCallback(async(type='STATUS')=>{
  try{
   if(!('serviceWorker'in navigator)||!window.isSecureContext){setState(v=>({...v,status:'unsupported',message:'Offline access needs a supported browser and HTTPS.'}));return;}
   if(import.meta.env.DEV){setState(v=>({...v,status:'unsupported',message:'Offline downloads activate in the production build.'}));return;}
   // An already installed app can verify its cache with no new network registration.
   let registration=registrationRef.current;
   if(!registration){
    const existing=await navigator.serviceWorker.getRegistration(scope);
    if(existing?.scope===scope)registration=existing;
    else registration=await navigator.serviceWorker.register(new URL('sw.js',scope),{scope,updateViaCache:'none'});
    registrationRef.current=registration;
    // Check for a newer version while online without turning a valid offline library into an error.
    if(existing?.scope===scope&&navigator.onLine)void registration.update().catch(()=>{});
   }
   if(listenedRef.current!==registration){
    listenedRef.current?.removeEventListener('updatefound',updating);
    registration.addEventListener('updatefound',updating);listenedRef.current=registration;
   }
   const worker=registration.active??registration.waiting??registration.installing;
   worker?.postMessage({type,scope,assetUrl});
   if(!registration.active)void navigator.serviceWorker.ready.then(ready=>{
    if(ready.scope===scope)ready.active?.postMessage({type:'STATUS',scope,assetUrl});
   });
  }catch(error){setState(v=>({...v,status:'error',message:`Offline download failed. ${error instanceof Error?error.message:'Please retry while online.'}`}));}
 },[scope,assetUrl,updating]);
 useEffect(()=>{
  const handler=(event:MessageEvent)=>{
   if(!isOfflineMessageForScope(event.data,scope))return;
   const d=event.data;
   setState(v=>({...v,status:d.status??v.status,done:d.done??v.done,total:d.total??v.total,message:d.message??v.message,version:d.version??v.version,rehearsal:d.rehearsal??v.rehearsal}));
  };
  navigator.serviceWorker?.addEventListener('message',handler);
  let previousController=navigator.serviceWorker?.controller;
  const control=()=>{
   const next=navigator.serviceWorker.controller;
   if(previousController&&next!==previousController){window.location.reload();return;}
   previousController=next;void request();
  };
  navigator.serviceWorker?.addEventListener('controllerchange',control);
  void request();
  return()=>{
   navigator.serviceWorker?.removeEventListener('message',handler);
   navigator.serviceWorker?.removeEventListener('controllerchange',control);
   listenedRef.current?.removeEventListener('updatefound',updating);listenedRef.current=null;
  };
 },[request,scope,updating]);
 return {state,retry:()=>request('CACHE_ALL'),verify:()=>request('VERIFY'),toggleRehearsal:()=>request(state.rehearsal?'REHEARSAL_OFF':'REHEARSAL_ON')};
}
