import { defaults, type Preferences } from './schema';
export function readJSON<T>(key:string,fallback:T):T{try{const value=localStorage.getItem(`fieldframe:${key}`);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
export function saveJSON(key:string,value:unknown):boolean{try{localStorage.setItem(`fieldframe:${key}`,JSON.stringify(value));return true}catch{return false}}
export function loadPreferences():Preferences{
 const p=readJSON<Partial<Preferences>>('preferences',{});
 return {...defaults,...p,
  format:['full-frame','aps-c','mft','phone'].includes(p.format??'')?p.format!:defaults.format,
  crop:p.crop===1.6?1.6:1.5,
  theme:['light','dark','red'].includes(p.theme??'')?p.theme!:defaults.theme,
  units:p.units==='imperial'?'imperial':'metric'};
}
