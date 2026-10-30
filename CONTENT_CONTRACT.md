# Fieldframe content contract

Store arrays of scenes in `src/data/<group>.json`. Each scene must be fully original, genuinely distinct and satisfy all keys below. Write practical concise prose, not repeated generic filler. No runtime generation of advice.

```ts
type Scene = {
 id: string; // unique kebab-case
 title: string;
 category: 'night-sky'|'sunrise-sunset'|'landscape-weather'|'water-motion'|'city-street'|'events-low-light'|'people'|'action-sport'|'wildlife'|'close-up'|'travel'|'creative';
 difficulty: 'Easy'|'Intermediate'|'Advanced';
 tags: string[]; // >=4, include subject, conditions and desired effect
 conditions: string; // actual assumed illumination and subject behavior
 intent: string;
 setup: {
   mode: 'M'|'M + Auto ISO'; // deliberately consistent: all core settings chosen in M, optional Auto ISO
   aperture: number;
   shutter: number; // seconds, numeric
   iso: number; // fixed ISO or initial Auto ISO expectation, clearly label auto in UI
   autoISO: boolean; // true only for M + Auto ISO
   isoRange: [number,number];
   apertureRange: [number,number];
   shutterRange: [number,number]; // ascending numeric seconds
   focalLength: number; // full-frame reference ACTUAL mm; UI divides by crop for matching field of view
   focalRange: [number,number]; // full-frame reference mm
   focus: string; // concise main field, e.g. 'AF-C · eye tracking'
   focusTarget: string; // actionable focus instruction
   whiteBalance: string;
   support: 'Handheld'|'Tripod'|'Supported';
   stabilization: string;
   metering: string;
   exposureNote: string; // how and when to change within ranges; no claims of exact universal exposure
   priority: 'motion'|'depth'|'effect'|'stars'; // preserve shutter for motion/effect/stars, aperture for depth
 };
 phone: {
   mode: string;
   iso: string; aperture: string; shutter: string; focus: string;
   focal: string; // use lens designation / labelled 35mm-equivalent if specifying mm
   whiteBalance: string; support: string;
   guidance: string; limitation: string;
 };
 why: string[]; // 3–6 distinct reasons tied to selected scene
 steps: string[]; // 4–8 steps incl composition/light, focus, test, inspect, correction
 pack: {essential:string[]; optional:string[]};
 problems: {symptom:string;cause:string;fix:string}[]; // 4–6, distinguish shake / motion / focus
 alternatives: {name:string;aperture:number;shutter:number;iso:number;mode:'M'|'M + Auto ISO';effect:string;requirements:string}[]; // 2–3 meaningful variants
 tip: string;
 startingPoint: string;
 safety: string[]; // [] fine when no actual need
 sources: {title:string;url:string}[]; // >=1 verified primary manufacturer / specialist original source; this is supporting basis, not claimed exact recipe
 related: string[]; // same file known ids, 2–4
 visual: {
   subject: string; // concise exact subject
   kind: 'stars'|'trails'|'moon'|'aurora'|'sun'|'landscape'|'water'|'city'|'fireworks'|'stage'|'portrait'|'action'|'wildlife'|'macro'|'travel'|'creative';
   title: string;
   caption: string; // describe exact educational diagram, not a photo or fabricated EXIF
   points: [string,string,string]; // three SHORT annotations explaining expected effect, composition/focus and adjustment (<=65 chars each)
   comparison: [string,string]; // concise contrasting result labels; renderer will support exact subject and exposure contrasts
 };
 distance?: {m:number;label:string}; // optional practical illustrative working distance, not focus prescription
};
```

Every scene gets an original schematic visual, explicitly labelled diagram. Prefer imagery of actual effect where possible, but no invented EXIF. Source links are a verified technical basis; recipe settings are original test starting points. No arbitrary sensor-dependent exposure changes. Phone fixed aperture and unavailable controls must be explicit. Solar photography MUST require an appropriate FRONT-mounted solar filter; never recommend an ND filter or unfiltered optical viewing. Lightning work must be from enclosed shelter, not exposed ground. Never use generic infinity focus for stars.
