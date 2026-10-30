import type { Scene } from './schema';
import { shutterLabel } from './calculators';

export function normalise(s:string):string {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
const aliases:Record<string,string>={
  astro:'star',astrophotography:'star',stars:'star',kids:'children',kid:'children',
  dog:'pet',dogs:'pet',cat:'pet',cats:'pet',pets:'pet',birds:'bird',waterfalls:'waterfall',
  hdr:'bracketing',moonlight:'moon',silky:'silk',blurry:'blur',panned:'panning',pan:'panning',
  flowers:'flower',insects:'insect',droplets:'droplet',reflections:'reflection',
  lenses:'lens',skies:'sky',portraits:'portrait',lights:'light',trails:'trail',
};
function terms(value:string):string[] {
  const prepared=value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/\baf[\s-]+([cs])\b/g,'af$1')
    .replace(/\bmilkyway\b/g,'milky way').replace(/\blongexposure\b/g,'long exposure')
    .replace(/(\d)\s*\/\s*(\d)/g,'$1/$2');
  // Fractions and decimal values stay whole: 1/250 must never match 1/2500.
  return (prepared.match(/\d+(?:\.\d+)?\/\d+(?:\.\d+)?|\d+(?:\.\d+)?|[a-z]+/g)??[])
    .map(word=>aliases[word]??word);
}
function strings(value:unknown):string[] {
  if(typeof value==='string')return [value];
  if(Array.isArray(value))return value.flatMap(strings);
  if(value&&typeof value==='object')return Object.values(value).flatMap(strings);
  return [];
}
function exposureTerms(value:{iso:number;aperture:number;shutter:number}):string {
  return `ISO ${value.iso} f/${value.aperture} ${shutterLabel(value.shutter)}`;
}
type SearchField={words:string[];weight:number};
const indexes=new WeakMap<Scene,SearchField[]>();
function indexFor(scene:Scene):SearchField[]{
  const cached=indexes.get(scene);
  if(cached)return cached;
  const fields=[
      {words:terms(scene.title),weight:12},
      {words:terms(scene.tags.join(' ')),weight:7},
      {words:terms([...strings(scene.setup),exposureTerms(scene.setup),`${scene.setup.focalLength} mm equivalent`].join(' ')),weight:6},
      // Includes phone steps, explanations, pack lists and corrections without field-name assumptions.
      {words:terms(['phone',...strings(scene.phone)].join(' ')),weight:3},
      {words:terms([scene.conditions,scene.intent,scene.tip,...scene.why,...scene.steps,
        ...strings(scene.pack),...strings(scene.problems),...strings(scene.alternatives),
        ...scene.alternatives.map(exposureTerms)].join(' ')),weight:2},
  ];
  indexes.set(scene,fields);
  return fields;
}
export function searchScenes(scenes:Scene[],query:string):Scene[]{
  const tokens=terms(query).map(word=>word==='falls'?'waterfall':word);
  if(!tokens.length)return scenes;
  const last=tokens.at(-1)!;
  const allowCompletion=(/^[a-z]{3,}$/.test(last)||(tokens.length>1&&/^[a-z]+$/.test(last)))&&!['afc','afs'].includes(last);
  const rank=(completeLast:boolean)=>scenes.map(scene=>{
    const fields=indexFor(scene);
    let score=0;
    for(let i=0;i<tokens.length;i++){
      const token=tokens[i];
      const matches=(word:string)=>word===token||(i===tokens.length-1&&completeLast&&word.startsWith(token));
      const best=Math.max(0,...fields.filter(field=>field.words.some(matches)).map(field=>field.weight));
      if(!best)return {scene,score:0};
      score+=best;
    }
    if(fields[0].words.join(' ')===tokens.join(' '))score+=30;
    return {scene,score};
  }).filter(result=>result.score>0).sort((a,b)=>b.score-a.score).map(result=>result.scene);
  const exact=rank(false);
  return exact.length||!allowCompletion?exact:rank(true);
}
