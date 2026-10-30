import { z } from 'zod';
const text = z.string().min(2);
const positive = z.number().positive().finite();
const range = z.tuple([positive,positive]).refine(v=>v[0]<=v[1], 'Range must ascend');
export const categories = [
  {id:'night-sky',name:'Night & sky',icon:'moon',color:'#6845e8'},
  {id:'sunrise-sunset',name:'Sunrise & sunset',icon:'sun',color:'#bd480e'},
  {id:'landscape-weather',name:'Landscape & weather',icon:'mountain',color:'#147348'},
  {id:'water-motion',name:'Water & motion',icon:'water',color:'#076db4'},
  {id:'city-street',name:'City & street',icon:'city',color:'#3156c5'},
  {id:'events-low-light',name:'Events & low light',icon:'spark',color:'#b7247c'},
  {id:'people',name:'People',icon:'person',color:'#be4258'},
  {id:'action-sport',name:'Action & sport',icon:'motion',color:'#cf4430'},
  {id:'wildlife',name:'Animals & wildlife',icon:'bird',color:'#47751a'},
  {id:'close-up',name:'Close-up & still life',icon:'flower',color:'#9d36b9'},
  {id:'travel',name:'Travel',icon:'compass',color:'#007d8a'},
  {id:'creative',name:'Creative & multi-image',icon:'layers',color:'#7d3ccf'}
] as const;
export type CategoryId = typeof categories[number]['id'];
export const sceneSchema = z.object({
  id:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:text,
  category:z.enum(categories.map(c=>c.id) as [CategoryId,...CategoryId[]]),
  difficulty:z.enum(['Easy','Intermediate','Advanced']),tags:z.array(text).min(4),
  conditions:text,intent:text,
  setup:z.object({mode:z.enum(['M','M + Auto ISO']),aperture:positive,shutter:positive,iso:positive,autoISO:z.boolean(),isoRange:range,apertureRange:range,shutterRange:range,focalLength:positive,focalRange:range,focus:text,focusTarget:text,whiteBalance:text,support:z.enum(['Handheld','Tripod','Supported']),stabilization:text,metering:text,exposureNote:text,priority:z.enum(['motion','depth','effect','stars']),lighting:z.enum(['ambient','flash','mixed']).optional(),canSlowShutter:z.boolean().optional()}).refine(s=>s.autoISO===(s.mode==='M + Auto ISO'),'Mode / ISO automation mismatch'),
  phone:z.object({mode:text,iso:text,aperture:text,shutter:text,focus:text,focal:text,whiteBalance:text,support:text,guidance:text,limitation:text}),
  why:z.array(text).min(3).max(6),steps:z.array(text).min(4).max(8),
  pack:z.object({essential:z.array(text).min(1),optional:z.array(text).min(1)}),
  problems:z.array(z.object({symptom:text,cause:text,fix:text})).min(4).max(6),
  alternatives:z.array(z.object({name:text,aperture:positive,shutter:positive,iso:positive,mode:z.enum(['M','M + Auto ISO']),effect:text,requirements:text})).min(2).max(3),
  tip:text,startingPoint:text,safety:z.array(text),
  sources:z.array(z.object({title:text,url:z.url()})).min(1),related:z.array(text).min(2).max(4),
  visual:z.object({subject:text,kind:z.enum(['stars','trails','moon','aurora','sun','landscape','water','city','fireworks','stage','portrait','action','wildlife','macro','travel','creative']),title:text,caption:text,points:z.tuple([text,text,text]),comparison:z.tuple([text,text])}),
  distance:z.object({m:positive,label:text}).optional()
});
export type Scene=z.infer<typeof sceneSchema>;
export type CameraFormat='full-frame'|'aps-c'|'mft'|'phone';
export type Preferences={format:CameraFormat;crop:1.5|1.6;theme:'light'|'dark'|'red';units:'metric'|'imperial';focalLength:string;maxAperture:string;isoLimit:string;gearEnabled:boolean};
export const defaults:Preferences={format:'full-frame',crop:1.5,theme:'light',units:'metric',focalLength:'',maxAperture:'',isoLimit:'12800',gearEnabled:false};
