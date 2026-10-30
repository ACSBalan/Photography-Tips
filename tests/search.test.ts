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
