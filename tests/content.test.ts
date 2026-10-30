import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {sceneSchema,categories} from '../src/schema';
const raw=fs.readdirSync('src/data').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync('src/data/'+f,'utf8')));
describe('Complete authored library',()=>{
 it('validates every scene independently and covers every category',()=>{
  expect(raw).toHaveLength(120);const ids=new Set(raw.map(s=>s.id));expect(ids.size).toBe(120);
  for(const s of raw){expect(()=>sceneSchema.parse(s),s.id).not.toThrow();for(const id of s.related)expect(ids.has(id),`${s.id} → ${id}`).toBe(true);}
  for(const c of categories)expect(raw.filter(s=>s.category===c.id).length,c.name).toBeGreaterThanOrEqual(8);
 });
 it('has a local licensed photograph for every scene, with complete attribution',()=>{
  const photos=JSON.parse(fs.readFileSync('src/photo-manifest.json','utf8'));
  expect(Object.keys(photos).sort()).toEqual(raw.map(s=>s.id).sort());
  for(const scene of raw){const photo=photos[scene.id];const image=fs.readFileSync('public/'+photo.src.replace(/^\.\//,''));expect(image.length,scene.id).toBeGreaterThan(1000);expect(image.toString('ascii',0,4)).toBe('RIFF');expect(image.toString('ascii',8,12)).toBe('WEBP');for(const key of ['author','alt','license'])expect(photo[key].length).toBeGreaterThan(2);for(const key of ['source','licenseUrl'])expect(new URL(photo[key]).protocol).toBe('https:');}
 });
 it('keeps source recipes inside their stated ranges and identifies automatic ISO',()=>{
  for(const {id,setup:s}of raw){for(const key of ['iso','aperture','shutter']){expect(s[key],id+' '+key).toBeGreaterThanOrEqual(s[key+'Range'][0]);expect(s[key],id+' '+key).toBeLessThanOrEqual(s[key+'Range'][1]);}expect(s.autoISO,id).toBe(s.mode==='M + Auto ISO');}
 });
 it('carries solar/lightning safety and explicit star focus instructions',()=>{
  const solar=raw.find(s=>s.id==='partial-solar-eclipse');expect(solar.safety.join(' ')).toMatch(/filter/i);expect(solar.safety.join(' ')).toMatch(/front/i);
  const lightning=raw.find(s=>s.id==='lightning-from-shelter');expect(lightning.safety.join(' ')).toMatch(/inside|enclosed|shelter/i);
  const milky=raw.find(s=>s.id==='milky-way');expect(milky.setup.focusTarget).toMatch(/magnif/i);expect(JSON.stringify(milky)).toMatch(/enlarg|100%/i);
 });
});
