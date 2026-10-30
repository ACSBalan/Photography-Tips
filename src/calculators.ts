import type { CameraFormat, Preferences, Scene } from './schema';
const valid=(n:number)=>Number.isFinite(n)&&n>0;
export function cropFor(format:CameraFormat,crop=1.5):number {return format==='aps-c'?crop:format==='mft'?2:1;}
export function equivalentFocal(actual:number,crop:number):number {if(!valid(actual)||!valid(crop))throw new RangeError('Focal length and crop must be positive.');return actual*crop;}
export function actualFocal(equivalent:number,crop:number):number {if(!valid(equivalent)||!valid(crop))throw new RangeError('Focal length and crop must be positive.');return equivalent/crop;}
export function ndExposure(seconds:number,stops:number):number {if(!valid(seconds)||!Number.isFinite(stops)||stops<0||stops>20)throw new RangeError('Use a positive base exposure and 0–20 ND stops.');return seconds*2**stops;}
export type NPFInputs={aperture:number;focalLength:number;sensorWidth:number;imageWidth:number;declination:number;tolerance:number};
/** Frédéric Michaud / Société Astronomique du Havre, full NPF formula.
 * Actual focal length (mm), actual physical sensor width (mm), uncropped horizontal pixels.
 * Minimum absolute declination in the frame, degrees. k=1 strict; k=3 relaxed.
 * Crop is deliberately absent: the physical pixel pitch already expresses sensor geometry. */
export function npfExposure(i:NPFInputs):{seconds:number;pixelPitch:number} {
  if(!valid(i.aperture)||!valid(i.focalLength)||!valid(i.sensorWidth)||!valid(i.imageWidth)||!Number.isInteger(i.imageWidth)||!Number.isFinite(i.declination)||Math.abs(i.declination)>85||!Number.isFinite(i.tolerance)||i.tolerance<1||i.tolerance>3)throw new RangeError('Check the positive physical inputs, whole pixel width, declination ±85° and tolerance 1–3.');
  const pixelPitch=i.sensorWidth*1000/i.imageWidth;
  const seconds=i.tolerance*(16.9*i.aperture+0.10*i.focalLength+13.7*pixelPitch)/(i.focalLength*Math.cos(i.declination*Math.PI/180));
  return {seconds,pixelPitch};
}
export function rule500(focalLength:number,crop:number):number {return 500/equivalentFocal(focalLength,crop);}
export function shutterLabel(seconds:number):string {
  if(!valid(seconds))return '—';
  if(seconds>=60){const rounded=Math.round(seconds*10)/10,m=Math.floor(rounded/60),s=+(rounded%60).toFixed(1);return `${m}m${s?` ${s}s`:''}`;}
  if(seconds>=1)return `${+seconds.toFixed(1)} s`;
  if(seconds>=0.25)return `${+seconds.toFixed(2)} s`;
  return `1/${Math.round(1/seconds)} s`;
}
const roundISO=(n:number)=>Math.max(25,Math.round(n/25)*25);
export function adaptSetup(scene:Scene,p:Preferences) {
  const base=scene.setup;
  let aperture=base.aperture,shutter=base.shutter,iso=base.iso;
  const notes:string[]=[];
  const crop=cropFor(p.format,p.crop);
  let focalLength=base.focalLength/crop;
  const flash=base.lighting==='flash'||base.lighting==='mixed';
  const isoRange:[number,number]=[...base.isoRange];
  if(!p.gearEnabled||p.format==='phone')return {aperture,shutter,iso,focalLength,notes,changed:false,unresolvedStops:0,isoRange};
  const enteredFocal=Number(p.focalLength),availableAperture=Number(p.maxAperture),isoLimit=Number(p.isoLimit);
  let multiplier=1;
  if(valid(enteredFocal)){
    focalLength=enteredFocal;
    const eq=enteredFocal*crop;
    if(eq<base.focalRange[0]||eq>base.focalRange[1])notes.push(`Your ${+enteredFocal.toFixed(1)} mm lens gives a ${+eq.toFixed(1)} mm equivalent view, outside this sheet’s suggested framing. Change position only where safe; background perspective and depth of field will change.`);
    if(base.priority==='stars'&&enteredFocal>base.focalLength/crop){
      const ratio=(base.focalLength/crop)/enteredFocal;shutter*=ratio;multiplier/=ratio;
      notes.push('A longer actual lens needs a shorter star exposure. This proportional adjustment is conservative guidance; use the NPF tool with your pixel dimensions and inspect enlarged stars.');
    } else if(base.support==='Handheld'&&base.priority!=='effect'&&!flash&&enteredFocal*crop>base.focalLength&&base.shutter>1/(2*eq)){
      const target=1/(2*eq);multiplier*=shutter/target;shutter=target;
      notes.push('The longer lens gets a faster starting shutter against camera shake (roughly 1 / twice equivalent focal length). Stabilisation and technique alter the limit; they do not freeze a moving subject.');
    } else if(enteredFocal*crop>base.focalLength&&(base.priority==='effect'||flash)){
      notes.push('Kept the effect / flash-sync shutter. With this longer lens, improve support or tracking technique instead of silently removing the intended motion.');
    }
  }
  if(valid(availableAperture)&&availableAperture>base.aperture){
    aperture=availableAperture;multiplier*=(aperture/base.aperture)**2;
    notes.push(`Your lens opens to f/${aperture}. That admits ${Math.log2((aperture/base.aperture)**2).toFixed(1)} stops less light than f/${base.aperture}; background separation also decreases.`);
  }
  const ceiling=valid(isoLimit)?isoLimit:12800;
  isoRange[0]=Math.min(base.isoRange[0],ceiling);isoRange[1]=ceiling;
  if(multiplier>1.001||base.iso>ceiling){
    const desired=base.iso*multiplier;
    iso=Math.min(roundISO(desired),ceiling);
    const unmet=Math.log2(desired/iso);
    if(base.priority==='depth'&&base.support!=='Handheld'&&base.canSlowShutter===true&&!flash){
      iso=Math.min(base.iso,ceiling);shutter=base.shutter*multiplier*(base.iso/iso);
      notes.push(`Kept the depth-of-field aperture and used ISO ${Math.round(iso)}; lengthened the exposure on a stable support. Moving leaves, water or people can blur.`);
      return {aperture,shutter,iso,focalLength,notes,changed:true,unresolvedStops:0,isoRange};
    }
    notes.push(`Kept the scene’s motion/effect shutter and used ${base.autoISO?'an Auto ISO expectation of':'ISO'} ${Math.round(iso)}.${iso>base.iso?' Expect more visible noise.':''}${base.autoISO?' The meter still decides actual Auto ISO.':' Set this ISO yourself in Manual mode.'}`);
    if(flash)notes.push('Flash and ambient need separate test checks. ISO/aperture affect both; changing shutter within normal sync mainly changes ambient. Adjust manual flash power or TTL compensation for the subject, and stay within your camera/flash sync limit.');
    if(unmet>0.05)notes.push(`At your ISO ceiling the result remains about ${unmet.toFixed(1)} stops darker. Add light, use a faster lens or accept the loss. Slowing the shutter can change this scene’s subject motion, star rendering or flash/ambient balance.`);
    return {aperture,shutter,iso,focalLength,notes,changed:true,unresolvedStops:Math.max(0,unmet),isoRange};
  }
  if(flash&&notes.length)notes.push('Keep within your flash-sync limit. Recheck flash power or TTL compensation separately from the ambient exposure.');
  return {aperture,shutter,iso,focalLength,notes,changed:notes.length>0,unresolvedStops:0,isoRange};
}
export function distanceLabel(m:number,units:Preferences['units']):string{return units==='metric'?`${m} m`:`${+(m*3.28084).toFixed(1)} ft`;}
