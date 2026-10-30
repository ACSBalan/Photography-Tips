import type { Scene } from './schema';
export function normalise(s:string){return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
const aliases:Record<string,string>={astro:'stars',astrophotography:'stars',kids:'children',dog:'pet',cat:'pet',bird:'bird',birds:'bird',falls:'waterfall',hdr:'bracketing',milkyway:'milky way',moonlight:'moon',silky:'silk',blurry:'blur',longexposure:'long exposure'};
export function searchScenes(scenes:Scene[],query:string):Scene[]{
 const tokens=normalise(query).split(' ').filter(Boolean).map(w=>aliases[w]??w);
 if(!tokens.length)return scenes;
 return scenes.map(scene=>{
  const title=normalise(scene.title),tags=normalise(scene.tags.join(' '));
  const rest=normalise([scene.conditions,scene.intent,scene.tip,...scene.why,...scene.steps,...scene.problems.flatMap(p=>[p.symptom,p.cause,p.fix]),...scene.alternatives.map(a=>a.name)].join(' '));
  const all=[title,tags,rest].join(' ');
  const matches=tokens.every(t=>all.includes(t));
  const score=tokens.reduce((v,t)=>v+(title.includes(t)?10:tags.includes(t)?5:1),0);
  return {scene,score:matches?score:0};
 }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).map(r=>r.scene);
}
