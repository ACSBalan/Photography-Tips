import { describe, expect, it } from 'vitest';
import {
  actualFocal, adaptSetup, cropFor, distanceLabel, equivalentFocal,
  ndExposure, npfExposure, rule500, shutterLabel,
  type NPFInputs, ISO_STEPS, SHUTTER_STEPS, selectableISO, selectableShutter,
  bracketSequence, adaptedExposureNote, roughStarExposure,
} from '../src/calculators';
import { defaults, sceneSchema, type Preferences, type Scene } from '../src/schema';
import actionRaw from '../src/data/action-creative.json';
import natureRaw from '../src/data/nature.json';

const fixtures = [...actionRaw, ...natureRaw];
function scene(id: string): Scene {
  const raw = fixtures.find(s => s.id === id);
  if (!raw) throw new Error(`Missing calculator fixture ${id}`);
  return sceneSchema.parse(raw);
}
const prefs = (patch: Partial<Preferences> = {}): Preferences => ({...defaults, ...patch});
const exposureProxy = (s: {iso:number; shutter:number; aperture:number}) => s.iso * s.shutter / s.aperture ** 2;
const anchor: NPFInputs = {aperture:2.8, focalLength:24, sensorWidth:36, imageWidth:6000, declination:0, tolerance:1};

describe('ND exposure: independent numerical anchors', () => {
  it('six stops converts 1/125 s into exactly 0.512 s', () => {
    expect(ndExposure(1/125,6)).toBeCloseTo(0.512,12);
  });
  it('ten stops converts 1/30 s into 34.133333 seconds', () => {
    expect(ndExposure(1/30,10)).toBeCloseTo(34.1333333333,9);
  });
  it('zero stops leaves exposure unchanged', () => expect(ndExposure(0.008,0)).toBe(0.008));
  it('fractional stops scale by the appropriate light factor', () => {
    expect(ndExposure(2,0.5)).toBeCloseTo(2*Math.SQRT2,12);
  });
  it.each([0,-1,NaN,Infinity])('rejects invalid base exposure %s', n => expect(()=>ndExposure(n,6)).toThrow(RangeError));
  it.each([-1,21,NaN,Infinity])('rejects invalid stop value %s', n => expect(()=>ndExposure(1,n)).toThrow(RangeError));
});

describe('Field-of-view conversion', () => {
  it.each([[16,1.5,24],[15,1.6,24],[12,2,24],[24,1,24]])('%s mm at %s× matches %s mm equivalent', (a,c,e) => {
    expect(equivalentFocal(a,c)).toBeCloseTo(e,12);
    expect(actualFocal(e,c)).toBeCloseTo(a,12);
  });
  it('uses the selected APS-C crop and the fixed MFT factor', () => {
    expect(cropFor('aps-c',1.5)).toBe(1.5);
    expect(cropFor('aps-c',1.6)).toBe(1.6);
    expect(cropFor('mft')).toBe(2);
    expect(cropFor('full-frame')).toBe(1);
  });
  it.each([0,-1,NaN,Infinity])('rejects invalid focal length or crop %s', n => {
    expect(()=>actualFocal(n,1.5)).toThrow(RangeError);
    expect(()=>equivalentFocal(24,n)).toThrow(RangeError);
  });
  it('applies crop exactly once to the rough 500 rule', () => {
    expect(rule500(16,1.5)).toBeCloseTo(500/24,12);
  });
});

describe('Full NPF: physical geometry, declination and tolerance', () => {
  it('matches the published full-formula numerical anchor', () => {
    // p=36*1000/6000=6 µm; (47.32 + 2.4 + 82.2)/24 = 5.496666...
    const result=npfExposure(anchor);
    expect(result.pixelPitch).toBe(6);
    expect(result.seconds).toBeCloseTo(5.496666666666667,12);
  });
  it('uses physical APS-C geometry without another crop multiplication', () => {
    // A 24 mm equivalent view on an idealised 1.5× sensor uses 16 mm ACTUAL.
    // p=24*1000/6000=4 µm; (47.32+1.6+54.8)/16=6.4825 s.
    const result=npfExposure({...anchor,focalLength:actualFocal(24,1.5),sensorWidth:24});
    expect(result.pixelPitch).toBe(4);
    expect(result.seconds).toBeCloseTo(6.4825,12);
    expect(result.seconds).not.toBeCloseTo(6.4825/1.5,4);
  });
  it('accepts an explicitly known small sensor without pretending it is full frame', () => {
    const result=npfExposure({...anchor,sensorWidth:2.4,imageWidth:2400,focalLength:4});
    expect(result.pixelPitch).toBe(1);
    expect(result.seconds).toBeCloseTo(15.355,12);
  });
  it('a denser pixel grid gives a shorter permitted exposure', () => {
    const denser=npfExposure({...anchor,imageWidth:12000});
    expect(denser.pixelPitch).toBe(3);
    expect(denser.seconds).toBeCloseTo(3.7841666666666667,12);
    expect(denser.seconds).toBeLessThan(npfExposure(anchor).seconds);
  });
  it('60 degree declination doubles the equatorial estimate', () => {
    expect(npfExposure({...anchor,declination:60}).seconds).toBeCloseTo(10.993333333333334,12);
  });
  it('north/south declinations with the same absolute value agree', () => {
    expect(npfExposure({...anchor,declination:45}).seconds).toBe(npfExposure({...anchor,declination:-45}).seconds);
  });
  it('tolerance scales the full formula linearly', () => {
    expect(npfExposure({...anchor,tolerance:3}).seconds).toBeCloseTo(16.49,12);
  });
  it('a longer ACTUAL lens shortens the estimate even at the same pixel pitch', () => {
    expect(npfExposure({...anchor,focalLength:48}).seconds).toBeLessThan(npfExposure(anchor).seconds);
  });
  it.each([
    {aperture:0},{aperture:NaN},{focalLength:-24},{focalLength:Infinity},
    {sensorWidth:0},{sensorWidth:NaN},{imageWidth:0},{imageWidth:6000.5},
    {declination:86},{declination:-86},{declination:NaN},
    {tolerance:0.99},{tolerance:3.01},{tolerance:Infinity},
  ])('rejects invalid physical or tolerance input %j', patch => {
    expect(()=>npfExposure({...anchor,...patch})).toThrow(RangeError);
  });
});

describe('Scene exposure adaptation', () => {
  it.each(['full-frame','aps-c','mft'] as const)('format %s changes framing guidance without arbitrary exposure changes', format => {
    const s=scene('runner-stride');
    const r=adaptSetup(s,prefs({format}));
    expect(r.aperture).toBe(s.setup.aperture);
    expect(r.shutter).toBe(s.setup.shutter);
    expect(r.iso).toBe(s.setup.iso);
    expect(r.focalLength).toBeCloseTo(s.setup.focalLength/cropFor(format),8);
  });
  it('ignores camera lens-limit adaptation for phone guidance', () => {
    const s=scene('runner-stride');
    const r=adaptSetup(s,prefs({format:'phone',gearEnabled:true,maxAperture:'8',focalLength:'500',isoLimit:'100'}));
    expect(r.changed).toBe(false);
    expect(r.shutter).toBe(s.setup.shutter);
  });
  it('retains action shutter and adds two ISO stops when f/4 is limited to f/8', () => {
    const s=scene('runner-stride');
    const r=adaptSetup(s,prefs({gearEnabled:true,maxAperture:'8'}));
    expect(r.aperture).toBe(8);
    expect(r.shutter).toBe(s.setup.shutter);
    expect(r.iso).toBe(1600);
    expect(exposureProxy(r)).toBeCloseTo(exposureProxy(s.setup),12);
  });
  it('reports exactly one unrecovered stop when the required ISO exceeds the cap by 2×', () => {
    const s=scene('runner-stride');
    const r=adaptSetup(s,prefs({gearEnabled:true,maxAperture:'8',isoLimit:'800'}));
    expect(r.iso).toBe(800);
    expect(r.shutter).toBe(s.setup.shutter);
    expect(r.unresolvedStops).toBeCloseTo(1,12);
    expect(exposureProxy(r)/exposureProxy(s.setup)).toBeCloseTo(0.5,12);
  });
  it('preserves the panning shutter even if a longer handheld lens is selected', () => {
    const s=scene('cycling-pan');
    const r=adaptSetup(s,prefs({gearEnabled:true,focalLength:'200'}));
    expect(r.shutter).toBe(1/60);
    expect(r.iso).toBe(s.setup.iso);
  });
  it('preserves an intentional-camera-movement exposure at a longer focal length', () => {
    const s=scene('intentional-camera-movement');
    const r=adaptSetup(s,prefs({gearEnabled:true,focalLength:'100'}));
    expect(r.shutter).toBe(0.25);
  });
  it('does compensate shake for a non-effect handheld static subject with a longer lens', () => {
    const s=scene('still-flower');
    const r=adaptSetup(s,prefs({gearEnabled:true,focalLength:'200'}));
    expect(r.shutter).toBeLessThan(s.setup.shutter);
    expect(Math.abs(Math.log2(exposureProxy(r)/exposureProxy(s.setup)))).toBeLessThan(1/6);
  });
  it('keeps base ISO and lengthens exposure for a supported static product', () => {
    const s=scene('reflective-product');
    const r=adaptSetup(s,prefs({gearEnabled:true,maxAperture:'16'}));
    expect(r.aperture).toBe(16);
    expect(r.iso).toBe(100);
    expect(r.shutter).toBe(2);
    expect(exposureProxy(r)).toBeCloseTo(exposureProxy(s.setup),12);
  });
  it('honours an ISO ceiling even when there is no aperture or focal-length change', () => {
    const s=scene('runner-stride');
    const r=adaptSetup(s,prefs({gearEnabled:true,isoLimit:'200'}));
    expect(r.iso).toBe(200);
    expect(r.shutter).toBe(s.setup.shutter);
    expect(r.unresolvedStops).toBeCloseTo(1,12);
  });
  it('honours a lower ISO ceiling when supported depth scenes can lengthen shutter', () => {
    const s=scene('reflective-product');
    const r=adaptSetup(s,prefs({gearEnabled:true,maxAperture:'16',isoLimit:'50'}));
    expect(r.iso).toBeLessThanOrEqual(50);
    expect(r.shutter).toBe(4);
    expect(exposureProxy(r)).toBeCloseTo(exposureProxy(s.setup),12);
  });
  it('a longer star lens shortens shutter and pays for the lost light with ISO', () => {
    const s=scene('milky-way');
    const r=adaptSetup(s,prefs({gearEnabled:true,focalLength:String(s.setup.focalLength*2),isoLimit:'204800'}));
    expect(r.shutter).toBeCloseTo(s.setup.shutter/2,12);
    expect(r.iso).toBeCloseTo(s.setup.iso*2,12);
    expect(exposureProxy(r)).toBeCloseTo(exposureProxy(s.setup),12);
  });
  it('matching APS-C actual focal length does not trigger a spurious star crop penalty', () => {
    const s=scene('milky-way');
    const r=adaptSetup(s,prefs({format:'aps-c',crop:1.5,gearEnabled:true,focalLength:String(s.setup.focalLength/1.5)}));
    expect(r.shutter).toBe(s.setup.shutter);
    expect(r.iso).toBe(s.setup.iso);
  });
});

describe('Field-facing numeric labels', () => {
  it('converts metres to feet without altering the stored distance', () => expect(distanceLabel(3,'imperial')).toBe('9.8 ft'));
  it('keeps exact seconds visible for the ND anchor', () => expect(shutterLabel(0.512)).toBe('0.51 s'));
  it('carries rounded seconds into the next minute', () => expect(shutterLabel(119.99)).toBe('2m'));
  it('does not display invalid shutter values as numbers', () => expect(shutterLabel(NaN)).toBe('—'));
});


describe('Field-tested gear adaptation regressions',()=>{
  it('uses selectable ISO 2000 rather than ISO 1925 for the f/1.8 to f/2.8 bokeh lens limit',()=>{
    const s=scene('bokeh-lights'),p=prefs({gearEnabled:true,maxAperture:'2.8'}),r=adaptSetup(s,p);
    expect(r.iso).toBe(2000);expect(r.shutter).toBe(1/125);
    expect(Math.abs(r.exposureDeltaStops)).toBeLessThan(1/6);
    expect(r.notes.join(' ')).toMatch(/0.05 stops brighter/);
    expect(r.exposureChanged).toBe(true);
  });
  it('rounds a handheld 135 mm shake target faster, then recalculates selectable ISO',()=>{
    const s=scene('still-flower'),r=adaptSetup(s,prefs({gearEnabled:true,focalLength:'135'}));
    expect(r.shutter).toBe(1/320);expect(r.shutter).toBeLessThanOrEqual(1/270);
    expect(r.iso).toBe(1000);expect(Math.abs(r.exposureDeltaStops)).toBeLessThan(1/6);
  });
  it('never rounds an arbitrary ISO ceiling upward',()=>{
    const r=adaptSetup(scene('bokeh-lights'),prefs({gearEnabled:true,maxAperture:'2.8',isoLimit:'1950'}));
    expect(r.iso).toBe(1600);expect(r.isoRange[1]).toBe(1600);
    expect(r.unresolvedStops).toBeGreaterThan(0.25);
    expect(r.notes.join(' ')).toMatch(/ceiling below your limit/);
    expect(selectableISO(900,950)).toBe(800);
  });
  it('keeps star motion within the original proportional limit after rounding',()=>{
    const s=scene('milky-way'),focal=s.setup.focalLength*1.7;
    const r=adaptSetup(s,prefs({gearEnabled:true,focalLength:String(focal),isoLimit:'204800'}));
    expect(r.shutter).toBeLessThanOrEqual(s.setup.shutter/1.7);
    expect(SHUTTER_STEPS).toContain(r.shutter);expect(ISO_STEPS).toContain(r.iso);
    expect(Math.abs(r.exposureDeltaStops)).toBeLessThan(1/6);
  });
  it('reports extended timing, diffraction and original-range tradeoffs instead of silently promising a usable stack',()=>{
    const r=adaptSetup(scene('focus-stacking'),prefs({gearEnabled:true,maxAperture:'64',isoLimit:'25'}));
    expect(r.shutter).toBeGreaterThan(30);expect(Number.isInteger(r.shutter)).toBe(true);
    expect(r.notes.join(' ')).toMatch(/Bulb\/Time/);
    expect(r.notes.join(' ')).toMatch(/diffraction/);
    expect(r.notes.join(' ')).toMatch(/outside this sheet’s original range/);
    expect(r.notes.join(' ')).toMatch(/extended setting or unavailable/);
  });
  it('keeps the revised HDR sequence and its instructions consistent with the revised centre exposure',()=>{
    const s=scene('exposure-bracketing'),p=prefs({gearEnabled:true,maxAperture:'16'}),r=adaptSetup(s,p);
    expect(r.shutter).toBe(1/30);
    expect(r.bracket?.map(frame=>frame.shutter)).toEqual([1/125,1/30,1/8]);
    expect(r.bracket?.every(frame=>Math.abs(frame.actualEv-frame.ev)<1/6)).toBe(true);
    const note=adaptedExposureNote(s,p,r);
    expect(note).toContain('f/16');expect(note).toContain('1/125 s');expect(note).toContain('1/8 s');
    expect(note).not.toContain('f/8');expect(note).not.toContain('1/500 s');
  });
  it('preserves the original technique note when no exposure adaptation is needed',()=>{
    const s=scene('timelapse-clouds');
    expect(adaptedExposureNote(s,prefs())).toBe(s.setup.exposureNote);
  });
  it('does not silently widen an Auto ISO range merely because the global cap is higher',()=>{
    const s=scene('runner-stride'),r=adaptSetup(s,prefs({gearEnabled:true,isoLimit:'12800'}));
    expect(r.isoRange).toEqual(s.setup.isoRange);expect(r.exposureChanged).toBe(false);
  });
  it('rejects invalid gear inputs with notes and retains finite, usable starting values',()=>{
    const s=scene('still-flower'),r=adaptSetup(s,prefs({gearEnabled:true,maxAperture:'999',isoLimit:'1',focalLength:'-5'}));
    expect(r.aperture).toBe(s.setup.aperture);expect(r.iso).toBe(s.setup.iso);
    expect(r.shutter).toBe(s.setup.shutter);expect(r.notes.filter(n=>n.includes('must be between'))).toHaveLength(3);
  });
  it('rounds a conventional bracket without inventing precise camera dial speeds',()=>{
    expect(bracketSequence(1/125).map(frame=>frame.shutter)).toEqual([1/500,1/125,1/30]);
    expect(selectableShutter(1/270,'faster')).toBe(1/320);
    expect(selectableShutter(130.6)).toBe(131);
  });
  it('withholds the rough 500 rule for phone while retaining the correct physical NPF estimate',()=>{
    expect(roughStarExposure(4,'phone')).toBeUndefined();
    expect(roughStarExposure(16,'aps-c',1.5)).toBeCloseTo(500/24,12);
    expect(npfExposure({aperture:1.8,focalLength:4,sensorWidth:5.6,imageWidth:4000,declination:0,tolerance:1}).seconds).toBeCloseTo(12.5,12);
  });
  it('reports unresolved exposure exactly while preserving motion and flash requirements across practical limits',()=>{
    for(const id of ['runner-stride','cycling-pan','perched-insect','timelapse-clouds','focus-stacking','milky-way']){
      const s=scene(id);
      for(const format of ['full-frame','aps-c','mft'] as const)for(const aperture of ['4','8','16'])for(const cap of ['100','800','12800']){
        const r=adaptSetup(s,prefs({format,gearEnabled:true,maxAperture:aperture,isoLimit:cap}));
        expect(ISO_STEPS).toContain(r.iso);
        expect(r.iso).toBeLessThanOrEqual(Number(cap));
        expect(r.unresolvedStops).toBeCloseTo(Math.max(0,-Math.log2(exposureProxy(r)/exposureProxy(s.setup))),12);
        if(s.setup.priority==='motion'||s.setup.priority==='effect'||s.setup.lighting==='flash')expect(r.shutter).toBe(s.setup.shutter);
      }
    }
  });
});
