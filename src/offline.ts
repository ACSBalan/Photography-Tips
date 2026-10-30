import { useCallback, useEffect, useState } from 'react';
export type OfflineState={status:'checking'|'downloading'|'ready'|'error'|'unsupported';done:number;total:number;message:string;version:string;rehearsal:boolean};
const initial:OfflineState={status:'checking',done:0,total:0,message:'Checking offline files…',version:'',rehearsal:false};
export function useOffline(){
 const [state,setState]=useState(initial);
 const request=useCallback(async(type='STATUS')=>{
  try{
   if(!('serviceWorker'in navigator)||!window.isSecureContext){setState(v=>({...v,status:'unsupported',message:'Offline access needs a supported browser and HTTPS.'}));return;}
   if(import.meta.env.DEV){setState(v=>({...v,status:'unsupported',message:'Offline downloads activate in the production build.'}));return;}
   const registration=await navigator.serviceWorker.register(new URL('sw.js',document.baseURI),{scope:'./',updateViaCache:'none'});
   const worker=registration.active??registration.waiting??registration.installing;
   if(worker)worker.postMessage({type});
   registration.addEventListener('updatefound',()=>setState(v=>({...v,status:'downloading',message:'Downloading all sheets and visuals…'})));
   navigator.serviceWorker.ready.then(r=>r.active?.postMessage({type:'STATUS'}));
  }catch(error){setState(v=>({...v,status:'error',message:`Offline download failed. ${error instanceof Error?error.message:'Please retry while online.'}`}));}
 },[]);
 useEffect(()=>{
  const handler=(event:MessageEvent)=>{if(event.data?.app!=='fieldframe')return;const d=event.data;setState(v=>({...v,status:d.status??v.status,done:d.done??v.done,total:d.total??v.total,message:d.message??v.message,version:d.version??v.version,rehearsal:d.rehearsal??v.rehearsal}));};
  navigator.serviceWorker?.addEventListener('message',handler);
  const control=()=>void request();navigator.serviceWorker?.addEventListener('controllerchange',control);
  void request();
  return()=>{navigator.serviceWorker?.removeEventListener('message',handler);navigator.serviceWorker?.removeEventListener('controllerchange',control);};
 },[request]);
 return {state,retry:()=>request('CACHE_ALL'),verify:()=>request('VERIFY'),toggleRehearsal:()=>request(state.rehearsal?'REHEARSAL_OFF':'REHEARSAL_ON')};
}
