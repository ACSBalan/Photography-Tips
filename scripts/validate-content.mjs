import fs from 'node:fs';
import { sceneSchema, categories } from '../src/schema.ts';
const files=fs.readdirSync('src/data').filter(f=>f.endsWith('.json'));
const all=files.flatMap(f=>JSON.parse(fs.readFileSync('src/data/'+f,'utf8')));
const ids=new Set(all.map(s=>s.id)),titles=new Set(all.map(s=>s.title));
let issues=[];
if(all.length<100)issues.push('At least 100 scenes required');
if(ids.size!==all.length)issues.push('Duplicate scene IDs');
if(titles.size!==all.length)issues.push('Duplicate titles');
for(const s of all){
 const v=sceneSchema.safeParse(s);if(!v.success){issues.push(...v.error.issues.map(e=>s.id+': '+e.path.join('.')+' — '+e.message));continue;}
 for(const id of s.related)if(!ids.has(id))issues.push(s.id+': missing related scene '+id);
 for(const name of ['iso','aperture','shutter']){const [a,b]=s.setup[name+'Range'];if(s.setup[name]<a||s.setup[name]>b)issues.push(s.id+': '+name+' lies outside its range');}
 if(s.setup.focalLength<s.setup.focalRange[0]||s.setup.focalLength>s.setup.focalRange[1])issues.push(s.id+': focal length outside range');
 if(new Set(s.why).size!==s.why.length||new Set(s.steps).size!==s.steps.length)issues.push(s.id+': duplicated explanation or step');
 if(s.sources.some(x=>!x.url.startsWith('https://')))issues.push(s.id+': non-HTTPS source');
 if(!s.phone.aperture.toLowerCase().includes('fix')&&!s.phone.aperture.toLowerCase().includes('auto'))issues.push(s.id+': phone aperture must state fixed/automatic capability');
 if(s.visual.points.some(t=>t.length>80))issues.push(s.id+': diagram annotation is too long');


}
for(const name of ['conditions','intent']){const unique=new Set(all.map(s=>s[name]));if(unique.size!==all.length)issues.push('Duplicate '+name+' text');}
const counts=Object.fromEntries(categories.map(c=>[c.name,all.filter(s=>s.category===c.id).length]));
for(const [name,n]of Object.entries(counts))if(n===0)issues.push('Missing category '+name);
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(JSON.stringify({status:'PASS',scenes:all.length,categories:counts,uniqueIds:ids.size,completeSheets:all.length,relatedLinks:'resolved',modeAndRanges:'consistent'},null,2));
