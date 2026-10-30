import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { scenes, byId } from '../src/data';
import { defaults } from '../src/schema';
import { adaptSetup, adaptedExposureNote, shutterLabel } from '../src/calculators';
import { selectedSceneContent, alternativeGearWarning } from '../src/sceneContent';
import { PrintSheet } from '../src/App';

const phone = { ...defaults, format:'phone' as const };
const scene = (id:string) => byId.get(id)!;
const plain = (html:string) => html.replace(/<[^>]*>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g,' ').trim();

describe('Approved field-use content corrections', () => {
  it('reconciles comparable-light alternatives without silently changing exposure', () => {
    const chosen:Record<string,number[]> = {
      'full-moon':[0], 'earthshine':[0], 'noctilucent-clouds':[0,1],
      'sunset-clouds':[0], 'sunrise-sea-mist':[1], 'golden-hour-dunes':[0,1],
      'forest-canopy':[1], 'storm-clouds':[1], 'breaking-waves':[1],
      'spotlit-speaker':[0],
    };
    for (const [id, indices] of Object.entries(chosen)) {
      const s=scene(id),base=s.setup.iso*s.setup.shutter/s.setup.aperture**2;
      for (const i of indices) {
        const a=s.alternatives[i];
        const delta=Math.log2((a.iso*a.shutter/a.aperture**2)/base);
        expect(Math.abs(delta),`${id}: ${a.name}`).toBeLessThan(0.12);
      }
    }
  });
  it('explains ND compensation and uses the shutter to correct moving hands', () => {
    expect(scene('lake-reflection').alternatives[1].requirements).toMatch(/three|3/i);
    expect(scene('lake-reflection').alternatives[1].requirements).toMatch(/ND/);
    expect(scene('stream-texture').alternatives[0].requirements).toMatch(/same ND/i);
    expect(scene('market-travel').steps.join(' ')).toMatch(/1\/500.*1\/640/);
    const smoke=scene('fireworks').problems.find(p=>/smok/i.test(p.symptom))!;
    expect(smoke.fix).toMatch(/upwind|crosswind/i);
    expect(smoke.fix).not.toMatch(/clearer downwind/i);
  });
});

describe('Selected phone workflow reaches screen and print', () => {
  it('has complete phone-specific instructions throughout all 120 scenes', () => {
    expect(scenes).toHaveLength(120);
    for (const s of scenes) {
      const content=selectedSceneContent(s,phone);
      expect(content.steps.length,s.id).toBeGreaterThanOrEqual(4);
      expect(content.problems.length,s.id).toBeGreaterThanOrEqual(4);
      expect(content.pack.essential.length,s.id).toBeGreaterThan(0);
      expect(content.why.length,s.id).toBeGreaterThanOrEqual(3);
      expect(content.steps,s.id).not.toEqual(s.steps);
      const print=plain(renderToStaticMarkup(<PrintSheet scene={s} prefs={phone} pocket={false}/>));
      expect(print,s.id).toContain(content.steps[0]);
      expect(print,s.id).toContain(content.problems[0].fix);
      expect(print,s.id).toContain(content.pack.essential[0]);
    }
  });
  it.each(['single-light-studio','dance-floor-flash','waterfall-silk','group-portrait','fireworks'])('%s pocket cards use the phone pack and fixes', id => {
    const s=scene(id),content=selectedSceneContent(s,phone);
    const print=plain(renderToStaticMarkup(<PrintSheet scene={s} prefs={phone} pocket/>));
    expect(print).toContain(content.pack.essential.join('; '));
    for(const p of content.problems.slice(0,3))expect(print).toContain(p.fix);
    expect(print).not.toContain(s.setup.exposureNote);
  });
  it('keeps continuous-light phone instructions distinct from studio flash instructions', () => {
    const s=scene('single-light-studio');
    const content=selectedSceneContent(s,phone);
    expect(content.steps.join(' ')).toMatch(/continuous light/i);
    expect(content.conditions).toMatch(/continuous/i);
    expect(content.pack.essential.join(' ')).not.toMatch(/flash trigger/i);
    expect(content.startingPoint).not.toMatch(/Set flash output/);
    expect(content.steps.join(' ')).not.toMatch(/Set ISO 100, f\/8/);
    const full=renderToStaticMarkup(<PrintSheet scene={s} prefs={phone} pocket={false}/>);
    const shoot=full.split('<h2>How to shoot</h2>')[1].split('<h2>Why these settings</h2>')[0];
    expect(plain(shoot)).toContain(content.steps[0]);
    expect(plain(shoot)).not.toContain(s.steps[2]);
    expect(plain(full)).not.toContain(s.startingPoint);
  });
});

describe('Adapted exposure is coherent in instructions and print', () => {
  it('updates the bracketing recipe and labels independent references', () => {
    const s=scene('exposure-bracketing'),prefs={...defaults,gearEnabled:true,maxAperture:'16'};
    const setup=adaptSetup(s,prefs),note=adaptedExposureNote(s,prefs,setup);
    expect(note).toContain('f/16');
    for(const frame of setup.bracket!)expect(note).toContain(shutterLabel(frame.shutter));
    const print=plain(renderToStaticMarkup(<PrintSheet scene={s} prefs={prefs} pocket={false}/>));
    expect(print).toContain(note);
    expect(print).toContain('Original camera reference');
    expect(print).toContain('independent reference setups');
  });
  it('updates the initial star trial without altering corrective shutter targets', () => {
    const s=scene('milky-way'),prefs={...defaults,gearEnabled:true,focalLength:'50',maxAperture:'4'};
    const setup=adaptSetup(s,prefs),content=selectedSceneContent(s,prefs);
    expect(setup.shutter).toBeLessThan(s.setup.shutter);
    expect(content.steps.join(' ')).toContain(shutterLabel(setup.shutter));
    expect(content.steps.join(' ')).not.toContain('10 s test');
    const cyclist=scene('cyclist-freeze');
    expect(selectedSceneContent(cyclist,prefs).steps).toContain(cyclist.steps.find(step=>step.includes('1/4000')));
  });
  it('preserves flash pulse timing while adapting its starting exposure', () => {
    const s=scene('stroboscopic-flash-sequence'),prefs={...defaults,gearEnabled:true,maxAperture:'16'};
    const steps=selectedSceneContent(s,prefs).steps.join(' ');
    expect(steps).toContain('f/16');
    expect(steps).toContain('8 flashes, 4 Hz');
    expect(steps).toContain('1/32 power');
  });
  it('flags an alternative that the entered lens cannot reach', () => {
    const s=scene('golden-hour-dunes'),prefs={...defaults,gearEnabled:true,maxAperture:'16',isoLimit:'100'};
    expect(alternativeGearWarning(s,1,prefs)).toMatch(/f\/16 limit/);
    expect(alternativeGearWarning(s,1,prefs)).toMatch(/ISO 100 ceiling/);
    expect(alternativeGearWarning(s,1,phone)).toBeUndefined();
  });
});
