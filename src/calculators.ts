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
  if(!valid(seconds)||!valid(pixelPitch))throw new RangeError('The physical inputs are outside the finite calculation range.');
  return {seconds,pixelPitch};
}
export function rule500(focalLength:number,crop:number):number {return 500/equivalentFocal(focalLength,crop);}
/** A phone’s actual focal length cannot stand in for an unknown equivalent view. */
export function roughStarExposure(focalLength:number,format:CameraFormat,crop=1.5):number|undefined {
  if(format==='phone'||!valid(focalLength))return undefined;
  return rule500(focalLength,cropFor(format,crop));
}
export function shutterLabel(seconds:number):string {
  if(!valid(seconds))return '—';
  if(seconds>=60){const rounded=Math.round(seconds*10)/10,m=Math.floor(rounded/60),s=+(rounded%60).toFixed(1);return `${m}m${s?` ${s}s`:''}`;}
  if(seconds>=1)return `${+seconds.toFixed(1)} s`;
  if(seconds>=0.25)return `${+seconds.toFixed(2)} s`;
  return `1/${Math.round(1/seconds)} s`;
}
/** Nominal one-third-stop values commonly selectable on still cameras.
 * Availability (especially extended ISO/electronic shutters) remains camera-specific. */
export const ISO_STEPS = [25,32,40,50,64,80,100,125,160,200,250,320,400,500,640,800,1000,1250,1600,2000,2500,3200,4000,5000,6400,8000,10000,12800,16000,20000,25600,32000,40000,51200,64000,80000,102400,128000,160000,204800] as const;
export const SHUTTER_STEPS = [
  ...[32000,25600,20000,16000,12800,10000,8000,6400,5000,4000,3200,2500,2000,1600,1250,1000,800,640,500,400,320,250,200,160,125,100,80,60,50,40,30,25,20,15,13,10,8,6,5,4].map(n=>1/n),
  0.3,0.4,0.5,0.6,0.8,1,1.3,1.6,2,2.5,3.2,4,5,6,8,10,13,15,20,25,30,
];
function nearestStop(target:number,values:readonly number[]):number {
  return values.reduce((best,value)=>Math.abs(Math.log2(value/target))<Math.abs(Math.log2(best/target))-1e-12?value:best);
}
/** Use a conventional shutter; a motion limit is always rounded to an equal/faster exposure.
 * Exposures above 30 s are whole-second Bulb/Time targets, not claimed dial positions. */
export function selectableShutter(seconds:number,direction:'nearest'|'faster'='nearest'):number {
  if(!valid(seconds))throw new RangeError('Use a positive exposure time.');
  if(seconds>30)return direction==='faster'?Math.floor(seconds):Math.round(seconds);
  const choices=direction==='faster'?SHUTTER_STEPS.filter(n=>n<=seconds*(1+1e-12)):SHUTTER_STEPS;
  if(!choices.length)return SHUTTER_STEPS[0];
  return nearestStop(seconds,choices);
}
export function selectableISO(iso:number,ceiling=204800):number {
  if(!valid(iso)||!valid(ceiling)||ceiling<ISO_STEPS[0])throw new RangeError('Use a positive ISO and a ceiling of at least 25.');
  return nearestStop(iso,ISO_STEPS.filter(n=>n<=ceiling));
}
export type BracketFrame={ev:number;shutter:number;actualEv:number};
export function bracketSequence(seconds:number,offsets:readonly number[]=[-2,0,2]):BracketFrame[] {
  if(!valid(seconds)||offsets.some(ev=>!Number.isFinite(ev)||Math.abs(ev)>10))throw new RangeError('Use a positive base exposure and bracket offsets within ±10 EV.');
  return offsets.map(ev=>{const shutter=selectableShutter(seconds*2**ev);return {ev,shutter,actualEv:Math.log2(shutter/seconds)};});
}
export type AdaptedSetup={
  aperture:number;shutter:number;iso:number;focalLength:number;notes:string[];changed:boolean;
  exposureChanged:boolean;exposureDeltaStops:number;unresolvedStops:number;isoRange:[number,number];
  bracket?:BracketFrame[];
};
const bracketScenes=new Set(['exposure-bracketing','interior-window-balance']);
export function adaptSetup(scene:Scene,p:Preferences):AdaptedSetup {
  const base=scene.setup;
  let aperture=base.aperture,shutter=base.shutter,iso=base.iso;
  const notes:string[]=[];
  const crop=cropFor(p.format,p.crop);
  let focalLength=base.focalLength/crop;
  const flash=base.lighting==='flash'||base.lighting==='mixed';
  const isoRange:[number,number]=[...base.isoRange];
  const result=():AdaptedSetup=>{
    const exposureChanged=aperture!==base.aperture||shutter!==base.shutter||iso!==base.iso;
    const exposureDeltaStops=Math.log2((iso*shutter/aperture**2)/(base.iso*base.shutter/base.aperture**2));
    return {aperture,shutter,iso,focalLength,notes,changed:notes.length>0||exposureChanged,
      exposureChanged,exposureDeltaStops,unresolvedStops:Math.max(0,-exposureDeltaStops),isoRange,
      ...(bracketScenes.has(scene.id)&&p.format!=='phone'?{bracket:bracketSequence(shutter)}:{})};
  };
  if(!p.gearEnabled||p.format==='phone')return result();
  const enteredFocal=Number(p.focalLength),availableAperture=Number(p.maxAperture),inputCeiling=Number(p.isoLimit);
  const usableInput=(value:string,n:number,min:number,max:number,label:string)=>{
    if(String(value).trim()==='')return false;
    if(!valid(n)||n<min||n>max){notes.push(`${label} must be between ${min} and ${max}; kept this sheet’s default for that input.`);return false;}
    return true;
  };
  const hasFocal=usableInput(p.focalLength,enteredFocal,1,2000,'Actual focal length in mm');
  const hasAperture=usableInput(p.maxAperture,availableAperture,0.7,64,'Widest available f-number');
  const hasCeiling=usableInput(p.isoLimit,inputCeiling,25,204800,'ISO ceiling');
  const requestedCeiling=hasCeiling?inputCeiling:base.isoRange[1];
  const ceiling=ISO_STEPS.filter(n=>n<=requestedCeiling).at(-1)!;
  if(hasCeiling&&ceiling!==inputCeiling)notes.push(`Used ISO ${ceiling} as the nearest conventional ceiling below your limit of ${inputCeiling}.`);
  if(hasFocal){
    focalLength=enteredFocal;
    const eq=enteredFocal*crop;
    if(eq<base.focalRange[0]||eq>base.focalRange[1])notes.push(`Your ${+enteredFocal.toFixed(1)} mm lens gives a ${+eq.toFixed(1)} mm equivalent view, outside this sheet’s suggested framing. Change position only where safe; background perspective and depth of field will change.`);
    if(base.priority==='stars'&&eq>base.focalLength){
      shutter=selectableShutter(base.shutter*base.focalLength/eq,'faster');
      notes.push('A longer actual lens needs a shorter star exposure. Rounded to an equal or faster conventional shutter; use the NPF tool with your pixel dimensions and inspect enlarged stars.');
    }else if(base.support==='Handheld'&&base.priority!=='effect'&&!flash&&eq>base.focalLength&&base.shutter>1/(2*eq)){
      shutter=selectableShutter(1/(2*eq),'faster');
      notes.push('Used an equal or faster conventional shutter than 1 / twice equivalent focal length against camera shake. Stabilisation and technique alter the limit; they do not freeze subject movement.');
    }else if(eq>base.focalLength&&(base.priority==='effect'||flash)){
      notes.push('Kept the effect / flash-sync shutter. With this longer lens, improve support or tracking technique instead of removing the intended motion.');
    }
  }
  if(hasAperture&&availableAperture>base.aperture){
    aperture=availableAperture;
    notes.push(`Your lens opens to f/${aperture}. That admits ${Math.log2((aperture/base.aperture)**2).toFixed(1)} stops less light than f/${base.aperture}; background separation also decreases.`);
  }
  const needsExposureChange=aperture!==base.aperture||shutter!==base.shutter||base.iso>ceiling;
  if(needsExposureChange){
    if(base.priority==='depth'&&base.support!=='Handheld'&&base.canSlowShutter===true&&!flash){
      iso=selectableISO(base.iso,ceiling);
      shutter=selectableShutter(base.shutter*(aperture/base.aperture)**2*base.iso/iso);
      notes.push(`Kept a low ISO of ${iso} and used ${shutterLabel(shutter)} on stable support. Moving leaves, water, steam or people can blur; use the scene’s movement alternative if they matter.`);
    }else{
      const desiredISO=base.iso*(aperture/base.aperture)**2*base.shutter/shutter;
      iso=selectableISO(desiredISO,ceiling);
      notes.push(`Kept the required motion/effect shutter and chose ${base.autoISO?'an Auto ISO expectation of':'ISO'} ${iso}.${iso>base.iso?' Expect more visible noise.':''}${base.autoISO?' The meter still decides actual Auto ISO.':' Set this conventional ISO yourself in Manual mode.'}`);
    }
    const delta=Math.log2((iso*shutter/aperture**2)/(base.iso*base.shutter/base.aperture**2));
    if(delta < -0.18&&iso===ceiling){
      notes.push(`At your ISO ceiling this reference exposure remains about ${(-delta).toFixed(1)} stops darker. Add light, use a faster lens or accept the loss; slowing the shutter can change subject motion, stars or the intended effect.`);
    }else if(Math.abs(delta)>0.005){
      notes.push(`Conventional camera steps make this reference exposure about ${Math.abs(delta).toFixed(2)} stops ${delta>0?'brighter':'darker'} than the original. Check the histogram${base.autoISO?'; Auto ISO metering may choose a different value':''}.`);
    }
  }
  // A user limit can narrow the bounds; expand beyond the recipe only when the adapted start needs it.
  isoRange[1]=Math.min(ceiling,Math.max(base.isoRange[1],iso));
  isoRange[0]=Math.min(base.isoRange[0],isoRange[1],iso);
  if(base.autoISO&&(isoRange[0]!==base.isoRange[0]||isoRange[1]!==base.isoRange[1]))notes.push(`Set Auto ISO bounds to ${isoRange[0]}–${isoRange[1]}. The starting ISO is an expectation, not a locked value.`);
  if(flash&&needsExposureChange)notes.push('Flash and ambient need separate test checks. ISO/aperture affect both; changing shutter within normal sync mainly changes ambient. Adjust manual flash power or TTL compensation for the subject, and stay within your camera/flash sync limit.');
  else if(flash&&notes.length)notes.push('Keep within your flash-sync limit and recheck flash power or TTL compensation separately from ambient exposure.');
  if(aperture>base.aperture&&(aperture>=16||(p.format==='mft'&&aperture>=11)))notes.push(`At f/${aperture}, diffraction can soften fine detail, especially at close range or with dense pixels. Inspect an enlarged frame; a different lens or setup may be needed to retain the intended detail.`);
  if(aperture<base.apertureRange[0]||aperture>base.apertureRange[1])notes.push('The adapted aperture is outside this sheet’s original useful range. Check depth, background separation and fine detail before committing.');
  if(shutter<base.shutterRange[0]||shutter>base.shutterRange[1])notes.push('The adapted shutter is outside this sheet’s original range. Confirm the intended motion rendering with a test; support cannot stop a moving subject.');
  if(iso<base.isoRange[0]||iso>base.isoRange[1])notes.push('The adapted ISO is outside this sheet’s original range. Check noise and highlight detail at the actual light level.');
  if(shutter>30)notes.push('This is a timed exposure beyond 30 seconds. Use Bulb/Time or a camera with a suitable extended timer, a remote/timer and stable support. Allow for battery use and any long-exposure processing.');
  if(shutter<1/8000)notes.push('This shutter is faster than 1/8000 s and requires a compatible camera mode. Electronic shutters can distort fast movement; if unavailable, change lens, light or framing and test again.');
  if(iso<100&&iso!==base.iso)notes.push('ISO below 100 may be an extended setting or unavailable on your camera and can reduce highlight headroom. Use its supported base ISO and re-meter if necessary.');
  const adapted=result();
  if(adapted.bracket?.some(frame=>frame.shutter>30)&&shutter<=30)notes.push('The bright bracket frame exceeds 30 seconds: use a compatible extended timer or Bulb/Time sequence. Keep aperture, ISO and focus locked.');
  return adapted;
}
/** Current instructions for the adapted headline. Original explanations/alternatives should be
 * labelled as reference recipes rather than mixed into this sentence with stale numbers. */
export function adaptedExposureNote(scene:Scene,p:Preferences,setup=adaptSetup(scene,p)):string {
  if(!setup.exposureChanged&&setup.isoRange[0]===scene.setup.isoRange[0]&&setup.isoRange[1]===scene.setup.isoRange[1])return scene.setup.exposureNote;
  const exposure=`Use ${scene.setup.autoISO?'Manual + Auto ISO':'Manual'} at f/${setup.aperture}, ${shutterLabel(setup.shutter)}, ${scene.setup.autoISO?`Auto ISO ${setup.isoRange[0]}–${setup.isoRange[1]} (about ${setup.iso} expected)`:`ISO ${setup.iso}`}.`;
  if(setup.bracket)return `${exposure} With aperture and ISO fixed, capture ${setup.bracket.map(frame=>`${frame.ev>0?'+':''}${frame.ev} EV: ${shutterLabel(frame.shutter)}`).join(' · ')}. These are conventional approximate bracket steps; inspect the darkest frame’s highlights and brightest frame’s shadows, then shift the whole sequence to the actual light.`;
  return `${exposure} Keep the scene’s focus target and support requirement. Use the gear notes for exposure, motion and equipment trade-offs; take a test frame and inspect detail and highlights. Follow the scene’s technique-specific steps and the gear notes together.`;
}
export function distanceLabel(m:number,units:Preferences['units']):string{return units==='metric'?`${m} m`:`${+(m*3.28084).toFixed(1)} ft`;}
