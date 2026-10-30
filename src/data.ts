import { sceneSchema, type Scene } from './schema';
const files=import.meta.glob('./data/*.json',{eager:true,import:'default'});
export const scenes:Scene[]=Object.values(files).flatMap(raw=>(raw as unknown[]).map(row=>sceneSchema.parse(row)));
const featured=['milky-way','waterfall-silk','fireworks','bird-in-flight','sunset-silhouettes','night-street','mountain-vista','open-shade-portrait','cycling-pan','still-flower','aircraft-window','light-painting'];
const rank=new Map(featured.map((id,i)=>[id,i]));
scenes.sort((a,b)=>(rank.get(a.id)??100)-(rank.get(b.id)??100));
export const byId=new Map(scenes.map(s=>[s.id,s]));
