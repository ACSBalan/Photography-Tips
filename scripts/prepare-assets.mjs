import fs from 'node:fs';
import path from 'node:path';
const scenes=fs.readdirSync('src/data').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(`src/data/${f}`,'utf8')));
const photos=JSON.parse(fs.readFileSync('src/photo-manifest.json','utf8'));
const required=['src','alt','author','source','license','licenseUrl'];
for(const scene of scenes){
 const photo=photos[scene.id];
 if(!photo)throw Error(`Missing photograph: ${scene.id}`);
 for(const field of required)if(typeof photo[field]!=='string'||!photo[field].trim())throw Error(`Missing ${field}: ${scene.id}`);
 if(!/^\.\/photos\/[a-zA-Z0-9._-]+\.webp$/.test(photo.src))throw Error(`Unexpected photograph path: ${photo.src}`);
 for(const field of ['source','licenseUrl'])if(new URL(photo[field]).protocol!=='https:')throw Error(`HTTPS provenance required: ${scene.id}`);
 const file=path.join('public',photo.src.slice(2));
 const image=fs.readFileSync(file);
 if(image.length<1000||image.toString('ascii',0,4)!=='RIFF'||image.toString('ascii',8,12)!=='WEBP')throw Error(`Invalid WebP: ${file}`);
}
const expected=new Set(scenes.map(s=>s.id));
for(const id of Object.keys(photos))if(!expected.has(id))throw Error(`Photo has no scene: ${id}`);
fs.writeFileSync('public/asset-credits.json',JSON.stringify({edition:'Fieldframe 2.0 · Photographic edition',description:'Real licensed photographs, resized and compressed. Suggested scene settings are original starting points, not claimed photographic EXIF.',sceneCount:scenes.length,photographCount:new Set(Object.values(photos).map(p=>p.src)).size,photos},null,2)+'\n');
console.log(`Verified licensed local photographs for all ${scenes.length} scenes.`);
