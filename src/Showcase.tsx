import { useEffect, useRef, useState } from 'react';
import { byId } from './data';
import { categories, type Preferences } from './schema';
import { ExposureStrip, Photo, PhotoCredit } from './Photography';
import { Icon } from './icons';

const sequence=['milky-way','waterfall-silk','bird-in-flight','indoor-concert','night-street','mountain-vista','window-light-portrait','surfing-from-shore'];
export function Showcase({prefs}:{prefs:Preferences}) {
  const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[message,setMessage]=useState('');
  const frame=useRef<HTMLElement>(null);
  const scene=byId.get(sequence[index])!;
  const move=(amount:number)=>setIndex(i=>(i+amount+sequence.length)%sequence.length);
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setIndex(i=>(i+1)%sequence.length),6500);return()=>clearInterval(timer);},[playing]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes((e.target as HTMLElement).tagName))return;if(e.key==='ArrowRight'){e.preventDefault();setIndex(i=>(i+1)%sequence.length);}if(e.key==='ArrowLeft'){e.preventDefault();setIndex(i=>(i-1+sequence.length)%sequence.length);}if(e.key===' '){e.preventDefault();setPlaying(p=>!p);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
  async function fullscreen(){try{if(!document.fullscreenElement&&frame.current?.requestFullscreen)await frame.current.requestFullscreen();else if(document.fullscreenElement)await document.exitFullscreen();else setMessage('Use your browser’s full-screen option.');}catch{setMessage('Full screen is not available in this browser.');}}
  return <section className="showcase" ref={frame} aria-label="Fieldframe presentation"><Photo id={scene.id} className="showcase-image" eager/><div className="showcase-shade"/><div className="showcase-top"><a href="#/" className="showcase-brand"><Icon name="focus" size={30}/>fieldframe<span>120 SCENES. ONE GREAT START.</span></a><a className="showcase-exit" href="#/" aria-label="Exit presentation"><Icon name="close" size={22}/><span>Exit</span></a></div><div className="showcase-content" aria-live={playing?'off':'polite'}><div className="eyebrow">{categories.find(c=>c.id===scene.category)?.name}</div><h1>{scene.title}</h1><p>{scene.intent}</p><ExposureStrip scene={scene} prefs={prefs}/><a className="showcase-sheet" href={`#/scene/${scene.id}`}>Open the scene sheet <Icon name="arrow" size={20}/></a></div><div className="showcase-bottom"><PhotoCredit id={scene.id}/><div className="showcase-controls"><button aria-label="Previous photograph" onClick={()=>move(-1)}><Icon name="back"/></button><span>{String(index+1).padStart(2,'0')} / {String(sequence.length).padStart(2,'0')}</span><button aria-label="Next photograph" onClick={()=>move(1)}><Icon name="arrow"/></button><button className="play-button" aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?'Pause':'Play tour'}</button><button className="fullscreen-button" aria-label="Toggle full screen" onClick={()=>void fullscreen()}><Icon name="focus"/></button></div></div>{message&&<p className="showcase-message" role="status">{message}</p>}<span className="showcase-note">Suggested starting settings · reference photography</span></section>;
}
