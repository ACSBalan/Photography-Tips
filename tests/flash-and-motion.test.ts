import {describe,it,expect} from 'vitest';
import raw from '../src/data/people-city.json';
import {adaptSetup} from '../src/calculators';
import {defaults,sceneSchema} from '../src/schema';
describe('Flash and supported people are not static ambient scenes',()=>{
 it('keeps studio flash shutter within the original sync-safe starting target with a longer lens',()=>{
  const s=sceneSchema.parse(raw.find(x=>x.id==='single-light-studio'));
  const r=adaptSetup(s,{...defaults,gearEnabled:true,focalLength:'200',maxAperture:'16'});
  expect(r.shutter).toBe(s.setup.shutter);expect(r.iso).toBe(s.setup.iso*4);
  expect(r.notes.join(' ')).toMatch(/flash power|flash and ambient|TTL/i);
 });
 it('preserves dance-floor ambient trails when the lens changes',()=>{
  const s=sceneSchema.parse(raw.find(x=>x.id==='dance-floor-flash'));
  const r=adaptSetup(s,{...defaults,gearEnabled:true,focalLength:'100'});
  expect(r.shutter).toBe(1/15);expect(r.notes.join(' ')).toMatch(/sync/i);
 });
 it('does not lengthen a tripod self-portrait shutter merely because support is available',()=>{
  const s=sceneSchema.parse(raw.find(x=>x.id==='self-portrait-timer'));
  const r=adaptSetup(s,{...defaults,gearEnabled:true,maxAperture:'11',isoLimit:'12800'});
  expect(r.shutter).toBe(s.setup.shutter);expect(r.iso).toBeGreaterThan(s.setup.iso);
 });
});
