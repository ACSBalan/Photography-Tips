import { describe, expect, it } from 'vitest';
import { normalise, searchScenes } from '../src/search';
import { scenes } from '../src/data';

describe('Field search across the complete content library', () => {
  it('returns the whole library for blank search without mutating it', () => {
    const before=scenes.map(s=>s.id);
    expect(searchScenes(scenes,'   ')).toHaveLength(120);
    expect(scenes.map(s=>s.id)).toEqual(before);
  });
  it('normalises accents, case, punctuation and repeated spaces', () => {
    expect(normalise('  CAFÉ — Window-Light!  ')).toBe('cafe window light');
  });
  it.each([
    ['bird in flight','bird-in-flight'],
    ['milkyway','milky-way'],
    ['hdr','exposure-bracketing'],
    ['bokeh','bokeh-lights'],
    ['panning','cycling-pan'],
    ['jewellery','jewellery-detail'],
    ['dog','indoor-pet'],
  ])('finds %s as %s', (query,id) => {
    expect(searchScenes(scenes,query).map(s=>s.id)).toContain(id);
  });
  it('puts an exact title match ahead of sheets that only mention the technique', () => {
    expect(searchScenes(scenes,'bird in flight')[0]?.id).toBe('bird-in-flight');
  });
  it('searches the desired effect and correction context, not just the title', () => {
    expect(searchScenes(scenes,'reflections glass').map(s=>s.id)).toContain('aquarium-fish');
    expect(searchScenes(scenes,'rolling shutter').map(s=>s.id)).toContain('cyclist-freeze');
  });
  it('requires all query concepts and reports no false results for an absent subject', () => {
    expect(searchScenes(scenes,'purple underwater wedding elephant')).toHaveLength(0);
  });
  it('works on a category subset without leaking scenes from other categories', () => {
    const result=searchScenes(scenes.filter(s=>s.category==='wildlife'),'bird');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(s=>s.category==='wildlife')).toBe(true);
  });
});

describe('Technical search precision and complete phone guidance',()=>{
 it('treats AF-C as a focus term, not unrelated occurrences of af and c',()=>{
  const results=searchScenes(scenes,'AF-C');
  expect(results.map(s=>s.id)).toContain('bird-in-flight');
  expect(results.map(s=>s.id)).not.toContain('traffic-light-trails');
  expect(results.slice(0,10).some(s=>s.setup.focus.includes('AF-C'))).toBe(true);
 });
 it('does not confuse 1/250 with 1/2500',()=>{
  const cycling=scenes.find(s=>s.id==='cyclist-freeze')!;
  expect(searchScenes([cycling],'1/2500').map(s=>s.id)).toEqual(['cyclist-freeze']);
  expect(searchScenes([cycling],'1/250')).toEqual([]);
 });
 it('finds scene-relevant phone techniques and preserves useful typing completion',()=>{
  expect(searchScenes(scenes,'phone macro').map(s=>s.id)).toContain('perched-insect');
  expect(searchScenes(scenes,'milky w')[0]?.id).toBe('milky-way');
  expect(searchScenes(scenes,'waterf').some(s=>s.tags.includes('waterfall'))).toBe(true);
 });
 it('does not treat petals as pets or the verb falls as a waterfall',()=>{
  expect(searchScenes(scenes,'dog').map(s=>s.id)).not.toContain('still-flower');
  expect(searchScenes(scenes,'waterfall').map(s=>s.id)).not.toContain('food-window-light');
 });
 it('indexes added phone explanations, steps, equipment and corrections',()=>{
  const source=scenes.find(s=>s.id==='perched-insect')!;
  const amended={...source,phone:{...source.phone,
    why:['Diffusiondiamond reduces specular glare.'],steps:['Use a steadycontrol before capture.'],
    pack:{essential:['Mountmark support'],optional:['Soft flag']},
    problems:[{symptom:'Checkerblur',cause:'Focus shifted',fix:'Retarget the eye'}],
  }};
  for(const query of ['diffusiondiamond','steadycontrol','mountmark','checkerblur'])expect(searchScenes([amended],query)).toHaveLength(1);
 });
});
