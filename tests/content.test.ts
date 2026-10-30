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
 it('has an original essential visual for every scene, with no fabricated photo metadata',()=>{
  for(const s of raw){const svg=fs.readFileSync(`public/visuals/${s.id}.svg`,'utf8');expect(svg).toContain('<svg');expect(svg).toContain('TECHNIQUE DIAGRAM');expect(svg).toContain('<title');}
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
