import type { CSSProperties } from 'react';
import manifest from './photo-manifest.json';
import { byId } from './data';
import { adaptSetup, shutterLabel } from './calculators';
import type { Preferences, Scene } from './schema';
import { Icon } from './icons';

export type PhotoRecord = {
  src: string; alt: string; author: string; source: string;
  license: string; licenseUrl: string; position?: string; title?: string;
  teachingCaption?: string;
};
export const photos = manifest as Record<string, PhotoRecord>;
export function Photo({id, className='', eager=false}: {id:string;className?:string;eager?:boolean}) {
  const photo=photos[id];
  if(!photo) return null;
  return <img className={className} src={photo.src} alt={photo.alt} loading={eager?'eager':'lazy'} decoding="async" style={{objectPosition:photo.position||'50% 50%'} as CSSProperties}/>;
}
export function PhotoCredit({id}:{id:string}) {
  const photo=photos[id];
  if(!photo) return null;
  return <span className="photo-credit">Photo: <a href={photo.source} target="_blank" rel="noreferrer">{photo.title?`${photo.title} — ${photo.author}`:photo.author}</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span>;
}
export function PhotoCaption({scene}:{scene:Scene}) {
  return <span className="photo-teaching-caption"><strong>Look for this</strong>{photos[scene.id]?.teachingCaption || scene.intent}</span>;
}

const comparisons = [
  {
    ids:['cycling-pan','cyclist-freeze'],
    labels:['Follow the rider','Freeze the action'],
    captions:[
      'A comparatively clear rider against streaked scenery suggests speed. Pan smoothly with the rider; inspect the face before trying a slower shutter.',
      'A short exposure holds the rider and scene together. Use the fast starting shutter in the frozen-cyclist sheet, then check hands and rotating wheels.'
    ],
    note:'These are different photographs, not a controlled before-and-after. Panning needs tracking skill; a faster shutter needs more light or higher ISO.'
  },
  {
    ids:['waterfall-silk','fountain-droplets'],
    labels:['Let water flow','Hold individual droplets'],
    captions:[
      'Longer exposure turns moving water into continuous ribbons. Keep the rocks still with firm support, and reduce incoming light with ND when needed.',
      'A brief exposure separates falling water into beads. Increase shutter speed first, then supply enough light or ISO to keep the exposure usable.'
    ],
    note:'Different subjects show the two effects. The sheet values are starting recipes, not these photographs’ recorded exposure settings.'
  },
  {
    ids:['backlit-grasses','sunset-silhouettes'],
    labels:['Light through the edges','Read the outline'],
    captions:[
      'Translucent hairs catch the light. Align the seed head against a quieter, darker background and keep its bright edges from washing out.',
      'An intentionally dark subject is recognised by its outline. Expose for the bright sky and leave clear space around the subject.'
    ],
    note:'Backlighting can produce either result. Background position, subject translucency and your chosen exposure determine which photograph you make.'
  }
];
export function hasComparison(id:string) { return comparisons.some(c=>c.ids.includes(id)); }
export function PhotoComparison({id}:{id:string}) {
  const comparison=comparisons.find(c=>c.ids.includes(id));
  if(!comparison)return null;
  return <div className="photo-comparison"><div className="comparison-grid">{comparison.ids.map((sceneId,i)=><figure key={sceneId}><Photo id={sceneId}/><figcaption><h3>{comparison.labels[i]}</h3><p>{comparison.captions[i]}</p><PhotoCredit id={sceneId}/><a href={`#/scene/${sceneId}`}>Open the scene sheet <Icon name="arrow" size={15}/></a></figcaption></figure>)}</div><p className="note-text">{comparison.note}</p></div>;
}
export function ExposureStrip({scene,prefs}:{scene:Scene;prefs:Preferences}) {
  const setup=adaptSetup(scene,prefs);
  if(prefs.format==='phone') return <div className="exposure-strip phone-strip"><Icon name="camera" size={14}/><span>Phone-specific setup inside</span><Icon name="arrow" size={16}/></div>;
  return <div className="exposure-strip" aria-label="Suggested starting exposure"><span><small>SHUTTER</small><b>{shutterLabel(setup.shutter)}</b></span><span><small>APERTURE</small><b>f/{+setup.aperture.toFixed(1)}</b></span><span><small>ISO{scene.setup.autoISO?' · AUTO':''}</small><b>{Math.round(setup.iso)}</b></span></div>;
}
export function FeaturedScenes({prefs}:{prefs:Preferences}) {
  const featured=[{id:'milky-way',label:'AFTER DARK',title:'A sky worth staying up for.'},{id:'waterfall-silk',label:'SLOW IT DOWN',title:'Make water flow.'},{id:'night-street',label:'CHASE THE LIGHT',title:'The city after hours.'}];
  return <section className="featured-scenes" aria-label="Featured photography scenes">{featured.map((item,i)=>{
    const scene=byId.get(item.id)!;
    return <a className={`featured-photo featured-${i}`} href={`#/scene/${item.id}`} key={item.id} aria-label={`Featured: ${scene.title}`}><Photo id={item.id} eager/><div className="featured-shade"/><div className="featured-copy"><span className="featured-label">{item.label}</span><h2>{item.title}</h2><p>{scene.title} <Icon name="arrow" size={18}/></p>{i===0&&<ExposureStrip scene={scene} prefs={prefs}/>}</div><span className="featured-open"><Icon name="arrow" size={20}/></span></a>;
  })}</section>;
}
export function PhotoCredits() {
  const unique=[...new Map(Object.values(photos).map(p=>[p.src,p])).values()];
  return <section className="credits-view"><div className="eyebrow">THE PEOPLE BEHIND THE PICTURES</div><h1>Real photographs. Real credit.</h1><p className="lede">Photographs bring the scenes to life. Each image retains its photographer and licence. Fieldframe’s suggested settings are original starting points, not a claim about the photograph’s recorded exposure.</p><div className="credits-grid">{unique.map(p=><article className="credit-card" key={p.src}><img src={p.src} alt={p.alt} loading="lazy"/><div><h2>{p.author}</h2><p>{p.title||p.alt}</p><a href={p.source} target="_blank" rel="noreferrer">Original photograph ↗</a><a href={p.licenseUrl} target="_blank" rel="noreferrer">{p.license} ↗</a><small>Resized, compressed and cropped for display.</small></div></article>)}</div></section>;
}
