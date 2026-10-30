import fs from 'node:fs';
import path from 'node:path';
import { drawPeopleCity } from './draw-people-city.mjs';
import { drawNature } from './draw-nature.mjs';
import { drawActionCreative } from './draw-action-creative.mjs';
const root=process.cwd();
const scenes=fs.readdirSync(path.join(root,'src/data')).filter(x=>x.endsWith('.json')).flatMap(x=>JSON.parse(fs.readFileSync(path.join(root,'src/data',x),'utf8')));
const out=path.join(root,'public/visuals');fs.mkdirSync(out,{recursive:true});
const thumbnailOut=path.join(root,'public/thumbnails');fs.mkdirSync(thumbnailOut,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const circle=(x,y,r,fill,opacity=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
const p=(d,fill='none',stroke='none',w=2,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill,r=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const text=(x,y,s,size=13,fill='#e7ece2',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${esc(s)}</text>`;
const focus=(x,y)=>`<g stroke="#f6d889" stroke-width="1.5" fill="none" filter="url(#focus-halo)"><path d="M${x-9} ${y-4}v-5h5m8 0h5v5m0 8v5h-5m-8 0h-5v-5"/></g>`;
const starfield=()=>Array.from({length:36},(_,i)=>circle((i*73+29)%395+8,(i*47+7)%165+9,(i%4===0?1.7:.85),'#eff3db',.3+(i%6)*.11)).join('');
const mountains=(snow=false)=>p('M0 205 66 135 120 188 207 88 288 185 349 116 420 190V260H0Z','#3c625f')+p('M0 230 82 171 163 228 266 153 352 207 420 170V260H0Z','#294a46')+(snow?p('M164 136 207 88 244 136 220 126 210 139 198 127 187 143Z','#d6e6dd')+p('M318 149 349 116 378 146 354 139 341 151Z','#d6e6dd'):'');
const tree=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${p('M0 0V-75','none','#223f34',5)+p('M-29-10 0-50 29-10H-29 M-24-32 0-70 24-32H-24 M-18-53 0-83 18-53H-18','#284c3e')}</g>`;
const bird=(x=215,y=128,spread=true)=>`<g transform="translate(${x} ${y})">${spread?p('M-8 0C-30-48-80-57-92-36-52-27-32-11-9 10C-23 25-20 34-6 21L10 11C49 8 72-14 91-30 55-33 22-23 7-7Z','#e9d8b3'):p('M-24 15C-34-1-23-35 2-32 25-31 38-6 20 15L-7 25-40 37-24 15Z','#dfc9a0')}${circle(11,-16,2.1,'#142f2b')}${p('M24-17 41-12 25-8Z','#ddaa58')}</g>`;
function person(x,y,scale=1,color='#dec19b',pose='still'){
 const run=pose==='run';
 return `<g transform="translate(${x} ${y}) scale(${scale})">${circle(0,-55,10,color)}${p(run?'M0-42-10-13 7 5 M-10-13-27 16 M-3-32 17-22 30-31 M-3-33-24-28-30-10':'M0-42V-5 M0-31-21-13 M0-31 20-13 M0-5-15 25 M0-5 15 25','none',color,7)}</g>`;
}
function sceneDrawing(s,label,index){
 const helpers={rect,p,circle,text,person,focus,mountains,starfield};
 for(const draw of [drawNature,drawPeopleCity,drawActionCreative]){const override=draw(s,label,index,helpers);if(override!==null)return override;}
 const id=(s.id+' '+s.title).toLowerCase(),l=label.toLowerCase();
 const slow=/(blur|streak|silk|smooth|long|trail|ghost|flow)/.test(l)&&!/(no |without|short)/.test(l);
 const dark=/(silhouette|dark face|underexpos)/.test(l);
 const light=dark?'#142b2b':'#e7c79c';
 const night=['stars','trails','moon','aurora','fireworks','stage'].includes(s.visual.kind)||/(night|neon|traffic|festive|blue.hour|candle|campfire)/.test(id);
 let a=rect(0,0,420,265,night?'url(#night)':'url(#day)');
 switch(s.visual.kind){
 case 'stars':case 'trails':{
  a+=starfield();
  if(/milky/.test(id))a+=p('M96-10C179 25 243 83 276 154','none','#d6cfd0',48,'opacity=".12"')+p('M99-20C177 32 218 73 275 161','none','#e1d6c5',14,'opacity=".14"');
  if(/trails/.test(id)||slow)a+=Array.from({length:10},(_,i)=>p(`M${70+i*8} ${35+i*7} A${48+i*12} ${48+i*12} 0 0 1 ${190+i*11} ${60+i*10}`,'none',i%2?'#dfd7bb':'#bdc9e7',1.4,'opacity=".8"')).join('');
  if(/meteor|comet/.test(id))a+=p('M290 27 170 132','none','#edf1e3',2.5)+p('M290 27 319 0','none','#edf1e3',1,'opacity=".35"');
  if(/noctilucent/.test(id))a+=Array.from({length:8},(_,i)=>p(`M0 ${37+i*12}Q100 ${18+i*12} 203 ${45+i*11}T420 ${26+i*16}`,'none','#93c1dc',3,'opacity=".45"')).join('');
  a+=mountains();a+=focus(283,80);break;}
 case 'aurora':{
  a+=starfield();for(let i=0;i<6;i++)a+=p(`M-10 ${53+i*9}Q92 ${109-i*4} 177 ${41+i*8}T430 ${67+i*9}`,'none',i<3?'#88cfb0':'#add7b7',19-i,'opacity=".18"');a+=mountains(true);a+=focus(277,29);break;}
 case 'moon':{
  const landscape=/landscape/.test(id);a+=starfield();const r=landscape?23:75,x=landscape?275:210,y=landscape?87:121;
  a+=circle(x,y,r,/solar/.test(id)?'#e5bb69':/eclipse/.test(id)?'#c18158':'#dedcc3');
  if(/terminator|crescent|earthshine|partial/.test(id))a+=circle(x+(/earthshine/.test(id)?-18:38),y-5,r+1,/earthshine/.test(id)?'#4a5553':'#172b36');
  if(!/solar/.test(id))for(let i=0;i<12;i++)a+=circle(x+Math.cos(i*2.4)*r*.6,y+Math.sin(i*2.4)*r*.65,3+i%4,'#8a9b95',.23);
  if(landscape)a+=mountains();if(/solar/.test(id))a+=rect(80,223,260,26,'#243a36',5)+text(210,241,'FRONT SOLAR FILTER REQUIRED',11,'#ead3a0','text-anchor="middle"');a+=focus(x-r*.3,y-r*.1);break;}
 case 'sun':{
  a=rect(0,0,420,265,'url(#sunset)');const sx=/backlit|backlight|silhou/.test(id)?200:286;
  a+=circle(sx,110,30,'#f1d9a1',.15)+circle(sx,110,20,'#ffe0aa',.85);
  a+=p('M0 171Q100 150 211 169T420 154V265H0Z','#3c625b');
  if(/water|reflect|sea|coast/.test(id)){a+=rect(0,175,420,90,'#596f69');for(let i=0;i<9;i++)a+=p(`M${sx-12-i*5} ${184+i*8}h${23+i*10}`,'none','#e8c590',2.5,'opacity=".6"');}
  if(/silhou|backlit|subject/.test(id))a+=person(205,216,1.3,'#1b3732');
  if(/sunburst/.test(id)){a+=tree(260,222,1.8);for(let i=0;i<12;i++){const t=i*Math.PI/6;a+=p(`M${sx+Math.cos(t)*15} ${110+Math.sin(t)*15}L${sx+Math.cos(t)*48} ${110+Math.sin(t)*48}`,'none','#ffe1a8',1.4);}}
  if(/cloud/.test(id))a+=p('M-10 55Q60 25 145 60T290 44T440 57','none','#d5a190',26,'opacity=".75"');
  if(/mist|fog/.test(id))a+=rect(0,177,420,50,'#dfdfbd',0,'opacity=".24"');a+=focus(133,168);break;}
 case 'landscape':{
  a+=mountains(/snow/.test(id));
  if(/desert|dune/.test(id)){a=rect(0,0,420,265,'url(#day)')+p('M0 189Q94 71 205 184T420 127V265H0Z','#c29866')+p('M0 224Q117 133 237 224T420 194V265H0Z','#d9b682')+p('M50 177Q121 147 209 185','none','#f0d5a6',2);}
  if(/forest/.test(id)){for(let i=0;i<9;i++)a+=tree(i*57-10,230,1.1+(i%3)*.35);}
  if(/lake|reflect/.test(id)){a+=rect(0,187,420,78,'#59837a')+p('M30 191 67 230 122 196 205 248 280 197 345 229 408 193','#2d544d',undefined,2,'opacity=".45"');}
  if(/fog|haze/.test(id)){a+=rect(0,100,420,160,'url(#fog)');a+=tree(65,240,1.1);}
  if(/foreground|depth/.test(id))a+=p('M0 245 66 195 123 213 139 265H0Z','#819486')+focus(87,218);
  if(/beach/.test(id)){a=rect(0,0,420,265,'url(#day)')+rect(0,135,420,130,'#66918d')+p('M0 205Q100 160 215 217T420 225V265H0Z','#cfba91')+p('M0 202Q100 157 215 214T420 222','none','#cfe3d3',3);}
  if(/rainbow/.test(id)){['#bb8471','#d8bb7d','#c9cc8d','#7fafa7','#8295bd'].forEach((c,i)=>a+=p(`M${62+i*4} 188A${149-i*4} ${149-i*4} 0 0 1 ${360-i*4} 188`,'none',c,3.5));}
  if(/lightning|storm/.test(id)){a+=p('M-10 60Q65 8 130 47 202-8 284 42 356 9 430 55V96H-10Z','#536b6c');if(/lightning/.test(id))a+=p('M228 82 208 122 231 121 191 181 207 136 186 138Z','#e4e8c6');a+=rect(0,0,420,265,'none',0,'stroke="#1e3734" stroke-width="20"');}
  a+=focus(213,157);break;}
 case 'water':{
  const waterfall=/waterfall|falls/.test(id);const rain=/rain/.test(id);
  a+=mountains();
  if(waterfall){a+=p('M62 102 156 84 161 265H25Z','#46654e')+p('M269 89 355 109 411 265H275Z','#375343');a+=p('M164 94C164 136 147 171 166 227Q215 250 272 225C253 170 270 136 260 94Z',slow?'#b9dbcf':'#659a98');for(let i=0;i<11;i++)a+=p(`M${171+i*8} 95q${i%2?-10:10} 61 ${i%2?5:-7} 124`,'none','#d3e6d8',slow?2.5:1,'opacity=".65"');}
  else{a+=p('M0 178Q92 122 195 193T420 169V265H0Z','#59918e');for(let i=0;i<7;i++)a+=p(`M${i*68-30} ${208+i%2*19}q44 -24 85 0`,'none','#b7d7c9',slow?3:1.3,'opacity=".8"');}
  if(/wave/.test(id)){a+=p('M66 236C126 227 116 172 178 170 219 172 218 204 181 208 206 183 179 186 174 211 194 242 272 222 343 243','#86bcb0');}
  if(/fountain/.test(id)){for(let i=-4;i<=4;i++)a+=p(`M210 225Q${210+i*8} 35 ${210+i*31} 203`,'none','#d1e3d8',1.7);a+=p('M100 224h220','none','#a8b5aa',10);}
  if(/boat/.test(id))a+=p('M166 166h95l-20 24h-53Z','#dec9a2')+p('M211 163V92l-40 68Z','#eee8cf');
  if(rain)for(let i=0;i<35;i++)a+=p(`M${i*53%420} ${i*37%220}l-7 20`,'none','#cadfd5',1.7,'opacity=".6"');
  if(!slow&&/droplet|fountain|wave/.test(id))for(let i=0;i<20;i++)a+=circle(i*59%410,i*31%130+81,1.5,'#eff1de',.85);
  a+=focus(115,187);break;}
 case 'city':case 'travel':{
  const interior=/interior|cathedral|church|museum/.test(id);
  if(interior){a=rect(0,0,420,265,'#8a9387')+p('M0 0 90 74H330L420 0Z','#a9af9c')+p('M90 74H330V210H90Z','#627b6e')+p('M0 265 90 210H330L420 265Z','#b3b59d');if(/cathedral|church/.test(id)){for(let i=0;i<4;i++)a+=p(`M${55+i*31} 244V${100+i*9}Q210 ${-76+i*45} ${365-i*31} ${100+i*9}V244`,'none','#c4c6ac',8-i);a+=rect(190,105,40,71,'#d7dbad',12);}else{a+=rect(258,86,57,84,index?'#c1caad':'#ede8c9')+p('M286 88v80 M259 125h55','none','#496255',3)+rect(109,162,106,49,'#b3a58a',3);}}
  else{for(let i=0;i<10;i++){const h=55+(i*37%100),x=i*47-12;a+=rect(x,193-h,36,h,['#325953','#46655e','#375550'][i%3]);for(let j=0;j<4;j++)for(let k=0;k<2;k++)a+=rect(x+7+k*13,204-h+j*21,5,9,night?'#d5be81':'#9fb0a2',0,`opacity="${.3+j*.12}"`);}a+=rect(0,195,420,70,night?'#182f30':'#628075');}
  if(/traffic|street|rainy|neon/.test(id)){a+=p('M125 265 199 191H222L326 265Z','#283f3a');if(slow||/traffic|rainy/.test(id)){a+=p('M155 264Q203 225 208 195 M279 264Q225 216 218 195','none','#deb580',4)+p('M293 264Q229 216 220 195','none','#b86860',3);}if(/street/.test(id))a+=person(158,212,.6,light);}
  if(/neon/.test(id)){a+=rect(47,80,68,40,'none',3,'stroke="#d49b9b" stroke-width="3"')+text(81,106,'OPEN',15,'#e4b0a7','text-anchor="middle"');}
  if(/festive/.test(id))for(let i=0;i<13;i++)a+=circle(i*35,85+Math.sin(i*.6)*22,index?7:3.5,['#dec28a','#b57b64','#b7c79a'][i%3],.85);
  if(/bridge/.test(id))a+=p('M10 201H410 M89 202V92 M329 202V92 M89 102Q208 208 329 102 M10 184 89 102 M329 102 410 184','none','#d7bd8e',3);
  if(/subway/.test(id)){a+=rect(25,90,390,106,'#a5aca0',8);for(let i=0;i<7;i++)a+=rect(i*62+35,109,40,45,'#4b6961',4);a+=person(95,221,.8,'#d0b78f');if(slow)for(let i=0;i<7;i++)a+=p(`M0 ${104+i*12}h420`,'none','#b8c4b2',2,'opacity=".5"');}
  if(/aircraft/.test(id))a+=p('M10 231 361 153 286 199 68 255Z','#c6d1c6')+p('M5 6H415V259H5Z','none','#1f3835',24);
  if(/vehicle|glass/.test(id))a+=rect(0,0,420,265,'none',36,'stroke="#1d3933" stroke-width="22"')+p('M354 20 266 239','none','#c1d1be',5,'opacity=".25"');
  if(/market/.test(id)){a+=rect(65,121,285,93,'#557366')+p('M53 123 89 72H331L362 123Z','#b68b66');for(let i=0;i<7;i++)a+=rect(68+i*40,122,25,13,'#d7bd89');for(let i=0;i<5;i++)a+=circle(101+i*47,193,13,'#cdad70');}
  if(/crowd|monument/.test(id)){a+=rect(183,54,54,145,'#b1b79f')+p('M169 55 210 27 251 55Z','#d1cba9');for(let i=0;i<(index?9:3);i++)a+=person(i*47+24,223,.48,'#29483e');}
  if(/underwater/.test(id)){a=rect(0,0,420,265,'#346f78');for(let i=0;i<6;i++)a+=p(`M${i*89} 0l-75 220`,'none','#b1d5c3',21,'opacity=".07"');for(let i=0;i<5;i++)a+=p(`M${80+i*60} ${70+i%3*50}q30-20 57 0-27 19-57 0l-13-12v24Z`,i%2?'#d1ba7d':'#a7c4ae');}
  a+=focus(211,135);break;}
 case 'fireworks':{
  a+=starfield();for(let j=0;j<3;j++){const x=100+j*110,y=65+(j%2)*35;for(let i=0;i<13;i++){const t=i*Math.PI*2/13,r=index?18:48;a+=p(`M${x+Math.cos(t)*11} ${y+Math.sin(t)*11}Q${x+Math.cos(t)*r} ${y+Math.sin(t)*r} ${x+Math.cos(t)*r*1.1} ${y+Math.sin(t)*r+12}`,'none',['#deb988','#a7c4b5','#b69fb6'][j],1.6);}}a+=p('M0 230 45 211 64 222 91 207 135 224 174 196 231 223 286 210 354 229 420 202V265H0Z','#17312d');break;}
 case 'stage':{
  a+=rect(0,224,420,41,'#38554d');a+=p('M75 0 114 224H250L96 0Z','#c3b39b','none',2,'opacity=".14"')+p('M334 0 202 224H355L355 0Z','#9e9ac3','none',2,'opacity=".17"');a+=person(206,185,1.5,light)+p('M240 152v80 M230 148h18','none','#bdc5ae',3);if(/concert/.test(id))a+=p('M200 154 241 140 263 160 220 178Z','#a28867');if(index&&/band/.test(l))for(let i=0;i<8;i++)a+=rect(0,i*33,420,12,'#09171a',0,'opacity=".35"');a+=focus(206,103);break;}
 case 'portrait':{
  a=rect(0,0,420,265,night?'url(#night)':'url(#portrait)');
  if(/group/.test(id)){for(let i=0;i<3;i++)a+=person(115+i*91,180,1.1,light);for(let i=0;i<2;i++)a+=person(160+i*90,242,1.1,'#b39776');a+=focus(206,119);}
  else{for(let i=0;i<9;i++)a+=circle(23+i*48,(i*43)%180+25,index?5:14,'#d0d9ac',.18);a+=p('M121 265C125 203 153 182 210 180 270 179 295 221 300 265Z',dark?'#18312d':'#405e53')+p('M187 153v38q25 20 49-1v-39Z',dark?'#18312d':'#b99b7a')+circle(211,113,58,light)+p('M153 109Q148 39 217 48 277 42 269 121L252 86Q208 101 180 75Z','#31463b');if(!dark){a+=p('M183 116h9 M230 116h9 M205 151q10 7 20-1','none','#5b5e4d',2.5)+p('M214 119 208 139h8','none','#a98568',2);a+=focus(187,115);}if(/window/.test(id))a+=rect(14,43,57,146,'#c7d9b1',3)+p('M43 44v144 M15 115h55','none','#5f8068',3);if(/backlit/.test(id))a+=p('M159 129Q139 67 192 51 M262 83Q287 130 260 164','none','#f4d28f',4);}
  break;}
 case 'action':{
  a+=rect(0,191,420,74,/snow/.test(id)?'#d7e4d8':/swim|surf/.test(id)?'#58938d':'#5e816b');
  if(slow)for(let i=0;i<12;i++)a+=p(`M${i*29%120} ${20+i*18}h${300-i%3*17}`,'none','#bac9a4',2,'opacity=".32"');
  if(/cycl/.test(id)){a+=circle(151,199,33,'none')+circle(276,199,33,'none')+`<g stroke="#d4d5b6" stroke-width="3" fill="none"><circle cx="151" cy="199" r="33"/><circle cx="276" cy="199" r="33"/></g>`+p('M151 199 184 149 229 199H151L204 156 257 152 276 199','none','#c1ab80',3)+person(217,156,.9,light,'run');}
  else if(/motor/.test(id)){a+=p('M91 175 132 132H264L307 176V207H91Z','#ae8870')+rect(151,141,98,32,'#597972',3)+circle(139,207,20,'#233f35')+circle(266,207,20,'#233f35');}
  else if(/swim/.test(id)){a+=circle(211,175,13,light)+p('M211 185 245 162 276 173','none',light,8)+p('M116 199q44-20 87 3t91-1','none','#d6dfc5',3);}
  else{a+=person(215,172,1.3,light, /dance|flash/.test(id)?'still':'run');if(/basketball/.test(id))a+=circle(274,112,14,'#d1a46e')+p('M335 81h62 M345 81l5 22h30l7-22','none','#d3cdb0',3);if(/football/.test(id))a+=circle(273,214,13,'#dae0c5');if(/skate/.test(id))a+=p('M167 221 251 205','none','#d8bd84',5)+circle(181,224,5,'#263e32')+circle(239,213,5,'#263e32');if(/ski|snow/.test(id))a+=p('M164 225 266 235 M176 214 282 222','none','#a58367',4);if(/surf/.test(id))a+=p('M163 219q50-16 113-3-62 17-113 3','#d5c8a0');}
  if(/flash|dance/.test(id)){a+=p('M28 80q70 80 145 20T395 99','none','#d5b29a',5,'opacity=".5"')+p('M8 53q82 40 137 8T365 89','none','#a3aecc',4,'opacity=".5"');}
  a+=focus(215,103);break;}
 case 'wildlife':{
  a=rect(0,0,420,265,'url(#wildlife)');for(let i=0;i<12;i++)a+=circle(i*43%421,i*41%198,12+i%4*9,'#bcc59f',.1);
  if(/bird/.test(id)){a+=bird(211,140,/flight|div|bath/.test(id));if(/perch/.test(id))a+=p('M27 216Q183 159 358 216','none','#948269',8);}
  else if(/fish|aquarium/.test(id)){a=rect(0,0,420,265,'#2f6266')+p('M98 141Q195 49 285 141 192 223 98 141L51 107V176Z','#d2bd89');a+=circle(257,132,5,'#1d3e36')+p('M162 98 187 68 213 99 M164 185 196 214 224 181Z','#a78365');}
  else{const pet=/pet/.test(id);a+=p(pet?'M135 151 132 69 174 105Q213 84 247 105L286 71 281 157Q276 218 208 228 145 222 135 151Z':'M121 125 133 74 168 105Q208 89 249 106L291 77 297 129Q300 211 212 229 121 218 121 125Z','#b59a75')+circle(173,145,5,'#18372e')+circle(254,145,5,'#18372e')+p('M195 179h34l-16 14Z','#384e3c');if(/running/.test(id))a+=p('M71 230 127 214 M287 218 349 239','none','#bd9f76',13);a+=focus(172,145);}
  if(/glass/.test(id))a+=p('M26 0 0 83 M329 0 236 265 M402 18 330 223','none','#b5d4c4',9,'opacity=".18"');
  if(/fence/.test(id)&&index){for(let i=-2;i<9;i++)a+=p(`M${i*60} 0l265 265 M${i*60} 265  ${i*60+265} 0`,'none','#8caa98',3,'opacity=".6"');}
  if(index&&/branch/.test(l))a+=p('M20 220 311 63 M136 161 111 77 M236 111 366 120','none','#48634b',8);
  if(slow)for(let i=0;i<4;i++)a+=p(`M70 ${101+i*24}h81`,'none','#c4c9a5',2,'opacity=".4"');break;}
 case 'macro':{
  a=rect(0,0,420,265,'url(#wildlife)');
  if(/flower/.test(id)){for(let i=0;i<8;i++){const t=i*Math.PI/4;a+=`<ellipse cx="${210+Math.cos(t)*40}" cy="${127+Math.sin(t)*40}" rx="33" ry="19" fill="#c3a1a0" transform="rotate(${i*45} ${210+Math.cos(t)*40} ${127+Math.sin(t)*40})"/>`;}a+=circle(210,127,22,'#d9ba78')+p('M210 175V265','none','#84986b',6);a+=focus(210,127);}
  else if(/insect/.test(id)){a+=p('M39 229Q171 164 382 204','none','#a5b686',14)+`<ellipse cx="211" cy="143" rx="25" ry="45" fill="#ad9363"/>`+circle(211,103,14,'#ccbe87')+`<ellipse cx="178" cy="124" rx="28" ry="17" fill="#c3d3b7" opacity=".65" transform="rotate(35 178 124)"/><ellipse cx="245" cy="124" rx="28" ry="17" fill="#c3d3b7" opacity=".65" transform="rotate(-35 245 124)"/>`+p('M194 142 165 162 M192 158 164 182 M228 142 257 165 M228 157 257 183','none','#c5c396',2)+focus(213,106);}
  else if(/droplet/.test(id)){a+=p('M49 238Q113 55 371 71 331 220 49 238Z','#6b9569')+p('M63 226 354 82','none','#b7c188',2);for(let i=0;i<5;i++){const x=113+i*46,y=188-i*22;a+=circle(x,y,17+i%2*5,'#a9c6a5',.65)+p(`M${x-8} ${y-6}q7-12 15-3`,'none',index?'#fff5c1':'#dce7c6',index?5:2);}a+=focus(204,143);}
  else if(/food/.test(id)){a=rect(0,0,420,265,'#a7a88c');a+=`<ellipse cx="218" cy="150" rx="114" ry="76" fill="#d3d5b9"/><ellipse cx="218" cy="150" rx="93" ry="59" fill="#536d4d"/>`;for(let i=0;i<14;i++)a+=circle(158+(i*23%115),121+(i*17%59),8+i%4,['#a4aa69','#cfa477','#b67f61'][i%3]);a+=focus(213,137);}
  else if(/jewel/.test(id)){a=rect(0,0,420,265,'#40574f')+`<ellipse cx="215" cy="171" rx="67" ry="45" fill="none" stroke="#d9bd7b" stroke-width="11"/>`+p('M184 105 214 78 247 105 214 141Z','#bfd5ce','#ebe6ba',2)+p('M184 105h63 M214 78v63','none','#e4e5c6',1)+focus(215,107);}
  else if(/glass|transparent/.test(id)){a=rect(0,0,420,265,index?'#c4c6ac':'#3e574f')+p('M166 49H254L244 171Q211 197 178 171L166 49 M211 187V230 M180 235h62','none',index?'#6c8270':'#d8dfc6',3)+p('M178 61 185 157 M242 61 238 134','none','#edf1d5',3,'opacity=".7"')+focus(242,97);}
  else if(/flat/.test(id)){a=rect(0,0,420,265,'#b3b09a')+rect(69,50,115,155,'#d8d7ba',3)+rect(85,68,83,100,'#7b9180',2)+circle(289,91,47,'#e1dfc4')+circle(289,91,32,'#88735d')+p('M246 209h94','none','#526c5b',9)+focus(284,94);}
  else{a=rect(0,0,420,265,'#a6b5a2')+rect(164,81,93,141,index?'#a1b5a3':'url(#metal)',11)+rect(174,57,73,28,'#3f5d4b',5)+rect(0,230,420,35,'#859e8d')+p('M177 93v113','none',index?'#ffffd7':'#dce6cb',index?12:4)+focus(223,145);}
  break;}
 case 'creative':{
  if(/panorama/.test(id)){a+=mountains();for(let i=0;i<3;i++)a+=rect(20+i*116,43,164,155,'none',3,`stroke="${['#d5be82','#b0c5ad','#97babb'][i]}" stroke-width="2"`);a+=text(210,230,'OVERLAP 30–40%',12,'#dce1c6','text-anchor="middle"');}
  else if(/bracket/.test(id)){a+=mountains();a+=rect(0,0,140,265,'#061c23',0,'opacity=".35"')+rect(280,0,140,265,'#e5dfba',0,'opacity=".3"')+text(63,239,'−2 EV',13)+text(195,239,'0 EV',13)+text(335,239,'+2 EV',13);}
  else if(/stack/.test(id)){a+=p('M0 254 110 173 186 202 207 265Z','#9daa87')+mountains();for(let i=0;i<3;i++)a+=focus(92+i*103,215-i*51);a+=text(210,244,'NEAR  →  MID  →  FAR',12,'#e2ddbc','text-anchor="middle"');}
  else if(/zoom/.test(id)){a=rect(0,0,420,265,'url(#night)');for(let i=0;i<26;i++){const t=i*Math.PI/13;a+=p(`M${210+Math.cos(t)*30} ${133+Math.sin(t)*30}L${210+Math.cos(t)*230} ${133+Math.sin(t)*180}`,'none',i%2?'#ccb485':'#7daea8',2,'opacity=".7"');}}
  else if(/bokeh/.test(id)){a=rect(0,0,420,265,'url(#night)');for(let i=0;i<19;i++)a+=circle((i*83+25)%420,(i*67+23)%265,index?4:14+i%4*6,['#c6b18b','#779e9c','#c08c84'][i%3],.6);}
  else if(/paint/.test(id)){a=rect(0,0,420,265,'url(#night)')+mountains()+p('M74 199C109 56 307 42 343 179 225 100 91 264 282 196','none','#ddcca0',5)+p('M74 199C109 56 307 42 343 179 225 100 91 264 282 196','none','#e9e1c6',1.5);}
  else if(/double/.test(id)){a=rect(0,0,420,265,'#b7c1a6')+circle(210,95,54,'#6e8d74')+p('M110 265Q122 162 210 160T310 265Z','#6e8d74');for(let i=0;i<6;i++)a+=tree(137+i*30,257,.8+i%2*.4);}
  else if(/time/.test(id)){a+=mountains();for(let i=0;i<5;i++)a+=circle(74+i*65,108-Math.sin(i*Math.PI/4)*60,13,'#ddc68e',.35+i*.1);a+=p('M67 142Q213 0 349 142','none','#bfc9ac',1.5,'stroke-dasharray="5 6"')+text(210,238,'LOCK FRAME • FIX INTERVAL',12,'#dce2c5','text-anchor="middle"');}
  else{for(let i=0;i<10;i++)a+=tree(i*49-10,280,2);if(slow||/movement/.test(id))for(let i=0;i<20;i++)a+=p(`M${i*23} 0v265`,'none','#c3cdb0',6,'opacity=".12"');}
  break;}
 }
 return a;
}
function wrap(str,max=48){const words=str.split(' '),lines=[];let line='';for(const w of words){if((line+' '+w).trim().length>max){lines.push(line);line=w;}else line=(line+' '+w).trim();}if(line)lines.push(line);return lines;}

// All original drawing modules retain their geometry, comparison effects and
// wording. Colour is directed here, rather than maintaining 120 separate themes.
// The former olive/celadon fills become scene-appropriate shadows and surfaces;
// named material overrides keep skin, foliage, snow, metal and glass believable.
const categoryPalettes={
 'night-sky':{hue:239,chroma:.43,accent:'#bba5ff'},
 'sunrise-sunset':{hue:267,chroma:.32,accent:'#ffb36b'},
 'landscape-weather':{hue:214,chroma:.28,accent:'#70d5a2'},
 'water-motion':{hue:199,chroma:.59,accent:'#6cceff'},
 'city-street':{hue:222,chroma:.26,accent:'#a4b9ff'},
 'events-low-light':{hue:269,chroma:.35,accent:'#ff95d0'},
 people:{hue:222,chroma:.23,accent:'#ffa5af'},
 'action-sport':{hue:215,chroma:.36,accent:'#ffad90'},
 wildlife:{hue:139,chroma:.37,accent:'#b8df73'},
 'close-up':{hue:140,chroma:.39,accent:'#dfabff'},
 travel:{hue:208,chroma:.32,accent:'#72dfe4'},
 creative:{hue:265,chroma:.48,accent:'#c7a5ff'},
};
const materials={
 '#f6d889':'#ffe483',
 // Warm, neutral skin and hair, without the previous olive cast.
 '#d8b38a':'#eab18e','#dec19b':'#e8bb98','#ad8b6d':'#b77f62',
 '#795f4a':'#8f5e4a','#987658':'#ad795d','#4a5948':'#5a403d',
 '#6f7255':'#79664f','#314a3d':'#352b30','#505443':'#49323a',
 '#9a7355':'#ae7050','#456858':'#405b92','#c99c70':'#cd9865',
 // Rocks and metal remain neutral; higher chroma is for light and living colour.
 '#667a75':'#66768b','#9da996':'#aab3bf','#425956':'#414f64',
 '#d4d6b6':'#dce5f0','#bcc9ac':'#b9c7d8',
 // Water keeps a cyan/blue cue even in a sunset or wildlife category.
 '#456f79':'#216b94','#527b87':'#3d7ca2','#8db7c4':'#8bd8f1',
 '#356d70':'#146f99','#316c79':'#0c6e98','#4c8990':'#1483af',
 '#548c8b':'#2789b3','#89b5a7':'#67bed8','#518c8d':'#268cb7',
 '#518c8b':'#217ca1','#64918f':'#4a94b8','#29474e':'#143b61',
 '#2e535b':'#224c79','#274a4c':'#183753','#94b7a6':'#94cae0',
 // Real leaves, petals and pollen retain their natural colour relationships.
 '#789b68':'#408e44','#7a9867':'#367b3c','#88a775':'#6aa64b',
 '#6e986d':'#3b9958','#bdd29a':'#a3d87c','#d0a2a0':'#f275a0',
 '#d3b674':'#ffc351','#6c7046':'#784a24',
};
function paletteFor(s){
 const id=s.id;
 const palette={
  ...categoryPalettes[s.category],
  day:['#79c3ef','#e3f4fd'],night:['#080c26','#342567'],
  sunset:['#6846a2','#e67f9b','#ffc77a'],
  portrait:['#cbd9ef','#8b9bbb'],wildlife:['#85b85f','#194b3b'],
  overrides:{...materials},preserveHue:false,
 };
 const override=colors=>Object.assign(palette.overrides,colors);
 if(s.category==='sunrise-sunset')palette.day=['#8f82cc','#ffd2a2'];
 if(s.category==='water-motion')palette.day=['#68bbe8','#d9f3fa'];
 if(s.category==='city-street')palette.day=['#95bee5','#edf2f9'];
 if(s.category==='events-low-light')palette.night=['#0e0923','#3d1949'];
 if(s.category==='people')palette.portrait=['#d8e2f4','#8f9fc7'];
 if(s.category==='wildlife')palette.wildlife=['#9bc56e','#20513d'];
 if(s.category==='close-up')palette.wildlife=['#6dad68','#153d35'];
 if(s.category==='creative')palette.night=['#100b2e','#3b1768'];

 // Place and light take precedence over the broad category colour.
 if(/forest|canopy|grass|intentional-camera/.test(id)){
  palette.hue=140;palette.chroma=.43;
  palette.day=['#b5d6bc','#f1e5ad'];palette.wildlife=['#85b961','#1b4c3a'];
 }
 if(/snow-landscape|snow-sports/.test(id)){
  palette.hue=215;palette.chroma=.35;
  palette.day=['#71b4ec','#eaf5ff'];
 }
 if(/desert|dunes|beach-patterns/.test(id)){
  palette.hue=28;palette.chroma=.31;palette.day=['#6faeda','#f4ddbb'];
 }
 if(/fog|mist|layered-ridges/.test(id)){
  palette.hue=221;palette.chroma=.21;palette.day=['#a4b9da','#f3e8e9'];
 }
 if(/blue-hour/.test(id)){
  palette.hue=230;palette.chroma=.48;palette.night=['#172451','#6657a3'];
 }
 if(/aquarium|underwater|surfing|swimming|diving-bird|ferry-wake/.test(id)){
  palette.hue=198;palette.chroma=.56;
 }
 if(/cathedral|interior-window|museum|market-travel/.test(id)){
  palette.hue=27;palette.chroma=.20;
 }
 if(/reception|wedding-ceremony/.test(id)){
  palette.hue=28;palette.chroma=.22;
 }
 if(/candlelight|campfire/.test(id)){
  palette.hue=25;palette.chroma=.22;palette.night=['#1a111e','#4c2330'];
 }
 if(/panorama|exposure-bracketing|timelapse/.test(id)){
  palette.hue=214;palette.chroma=.33;
 }
 if(id==='rainbow')palette.preserveHue=true;
 if(id==='dawn-wildlife')palette.night=['#222f56','#c5848c'];

 if(s.category==='night-sky')override({
  '#d5d3ba':'#dce2ec','#dfddc2':'#e6e9f1','#fff5d6':'#ffffff',
  '#e1dbc1':'#e9ebf2','#758983':'#818b9e','#586668':'#45536c',
  '#c3bbc4':'#dbb6ff','#d9d0be':'#f2d8ff',
 });
 if(id==='aurora')override({'#93d4af':'#6ff5a9','#9ed9b0':'#8cf7b9','#c7c2d2':'#cf9bff'});
 if(id==='lunar-eclipse')override({'#bb755b':'#c66143'});
 if(/neon|rainy-pavement/.test(id))override({
  '#e0a0b2':'#ff71ce','#8fbeb2':'#4ce5f1','#ca8a99':'#ff6ac8',
  '#dda3b0':'#ff8bdb','#b47e91':'#e95cc0','#ca91a0':'#ef6fc6',
  '#c18d9a':'#ed68bd','#8fbcb0':'#5de4ef',
 });
 if(/bokeh|zoom-burst|dance-floor/.test(id))override({
  '#cdb48a':'#ffc45e','#82aaa0':'#44cbe9','#c48c86':'#f471b9',
  '#c7a982':'#ffb85e','#81b0ac':'#42e1ef','#ba90b0':'#ec78eb',
  '#d6b67d':'#ffca6a',
 });
 if(id==='festive-lights')override({'#355f49':'#164f37','#dbc17c':'#ffce59','#a7c39b':'#67e5d6','#b37b76':'#ff747d'});
 if(id==='fireworks')override({'#deb988':'#ffc36c','#a7c4b5':'#58e6e4','#b69fb6':'#ec91fa'});
 if(s.category==='action-sport')override({
  '#5c7d64':'#4b9665','#5c7f68':'#4a946b','#557c56':'#398950',
  '#b58c70':'#ee6a43','#4f6c66':'#355575','#d5a66f':'#f18e40',
  '#c99b6b':'#ee8d40','#9e977d':'#c59a6e',
 });
 if(id==='windblown-flower')override({'#d0a2a0':'#ff927b'});
 if(id==='indoor-pet')override({'#768b79':'#bba394','#6b7d8c':'#7999bd','#dce3c0':'#f3f3ed'});
 if(id==='food-window-light')override({
  '#a0a48a':'#d9c3ac','#657661':'#877565','#d9dcc0':'#faf3e7',
  '#657c4e':'#438544','#b8955d':'#dfa940','#a2ae64':'#83b64d','#c47f56':'#e1724b',
 });
 if(id==='reflective-product')override({
  '#acb8a3':'#eaded3','#879d89':'#c9b9b0','#365548':'#334254',
  '#718a79':'#9caabd','#526b59':'#50627c','#e1e7cd':'#f2f8ff','#5c7663':'#64748b',
 });
 if(id==='jewellery-detail')override({
  '#40594e':'#19253d','#d7bb7c':'#e9be5b','#bbd5cf':'#b1e6fa',
  '#ebdec1':'#f5fbff','#e4e6d0':'#e7f7ff',
 });
 if(id==='flat-lay')override({
  '#b2b09a':'#efddd0','#d8d8be':'#fff5e9','#7d9581':'#9075c2',
  '#e1dfc5':'#fffbf2','#806c56':'#79513f','#57745d':'#c95769',
 });
 if(id==='glass-product')override({
  '#243e37':'#141d30','#d4ddc4':'#edf4fa','#3d5d4f':'#354b66','#e6eed3':'#f4faff',
 });
 return palette;
}
function toHsl(hex){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 if(!d)return [0,0,l];
 const hue=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;
 return [hue*60,d/(1-Math.abs(2*l-1)),l];
}
function fromHsl(h,s,l){
 const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
function colorFor(hex,palette){
 const color=hex.toLowerCase();
 if(palette.overrides[color])return palette.overrides[color];
 const [h,s,l]=toHsl(color);
 // Nearly white capture clipping, snow and specular highlights stay nearly white.
 if(l>.91)return fromHsl(h<65?42:215,Math.min(s,.25),Math.max(l,.965));
 if(s<.08)return fromHsl(220,.10,l);
 if(!palette.preserveHue&&h>=62&&h<=190){
  const light=l>.82?Math.min(.97,l+.055):l<.25?l*.87:l;
  const saturation=l>.82?.22:Math.min(.71,palette.chroma+s*.30);
  return fromHsl(palette.hue,saturation,light);
 }
 // Preserve colour relationships in warm materials, stars and a rainbow.
 return fromHsl(h,Math.min(.85,s*(h>310||h<20?1.5:1.23)+.035),l);
}
function colorPanel(s,markup,{thumbnail=false}={}){
 const palette=paletteFor(s);
 let result=markup.replace(/\b(fill|stroke|stop-color)="(#[\da-f]{6})"/gi,(_,attr,color)=>`${attr}="${colorFor(color,palette)}"`);
 // Labels have a neutral opposite-tone halo. They remain legible over a pale
 // sky, dark water and mixed-detail subjects without changing their positions.
 result=result.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g,(whole,attrs,content)=>{
  const size=Number(attrs.match(/font-size="([\d.]+)"/)?.[1]||13);
  if(size>16)return whole; // Neon sign lettering belongs to the scene itself.
  if(thumbnail)return '';
  const fill=attrs.match(/\bfill="(#[\da-f]{6})"/i)?.[1]||'#ffffff';
  const light=toHsl(fill)[2]>.53;
  return `<text${attrs.replace(/\bfill="[^"]*"/,`fill="${light?'#fbfcff':'#162033'}"`)} stroke="${light?'#111729':'#ffffff'}" stroke-opacity=".9" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke fill">${content}</text>`;
 });
 // Nature's top annotation backing is omitted together with its text in cards.
 if(thumbnail)result=result.replace(/<rect\b[^>]*\bx="12"[^>]*\by="10"[^>]*\bwidth="396"[^>]*\bheight="26"[^>]*\/>/g,'');
 return result;
}
function sharedDefs(s){
 const q=paletteFor(s);
 const gradient=(id,colors,direction='vertical')=>`<linearGradient id="${id}" x1="0" y1="0" x2="${direction==='vertical'?'0':'1'}" y2="${direction==='horizontal'?'0':'1'}">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
 return `<defs>${gradient('night',q.night)}${gradient('day',q.day)}${gradient('sunset',q.sunset)}${gradient('portrait',q.portrait,'diagonal')}${gradient('wildlife',q.wildlife,'diagonal')}${gradient('metal',['#48576e','#f6f8ff','#8296ae','#d9e7f3','#50647e'],'horizontal')}<linearGradient id="fog" x2="0" y2="1"><stop stop-color="#edf2f8" stop-opacity="0"/><stop offset=".7" stop-color="#edf2f8" stop-opacity=".55"/></linearGradient><filter id="focus-halo" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation=".8" flood-color="#0d1324" flood-opacity=".95"/></filter><clipPath id="left"><rect width="420" height="265" rx="7"/></clipPath><clipPath id="right"><rect width="420" height="265" rx="7"/></clipPath></defs>`;
}
function svg(s){
 const labels=s.visual.comparison;
 const accent=paletteFor(s).accent;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="590" viewBox="0 0 900 590" role="img" aria-labelledby="title desc"><title id="title">${esc(s.visual.title)}</title><desc id="desc">${esc(s.visual.caption+' '+s.visual.points.join('. '))}</desc>${sharedDefs(s)}${rect(0,0,900,590,'#111725')}${text(28,35,s.visual.subject.toUpperCase(),12,accent,'letter-spacing="1.6" font-weight="bold"')}<g transform="translate(20 54)" clip-path="url(#left)">${colorPanel(s,sceneDrawing(s,labels[0],0))}</g><g transform="translate(460 54)" clip-path="url(#right)">${colorPanel(s,sceneDrawing(s,labels[1],1))}</g>${labels.map((label,i)=>wrap(label,42).slice(0,2).map((line,j)=>text(i?470:30,344+j*20,line,14,'#f3f5fc')).join('')).join('')}${p('M30 390H870','none','#354158',1)}${s.visual.points.map((label,i)=>{const y=424+i*47;return circle(42,y-5,11,accent)+text(42,y-1,String(i+1),11,'#111725','text-anchor="middle" font-weight="bold"')+text(65,y,label,17,'#e6eaf3');}).join('')}${text(30,573,'FIELDFRAME  ·  TECHNIQUE DIAGRAM  ·  ILLUSTRATIVE, NOT CAPTURE METADATA',9,'#a9b4ca','letter-spacing="1.1"')}</svg>`;
}
function thumbnailSvg(s){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="265" viewBox="0 0 420 265" role="img" aria-labelledby="title desc"><title id="title">${esc(s.visual.subject)}</title><desc id="desc">${esc(s.visual.comparison[0]+'. Original Fieldframe technique illustration; not a photograph.')}</desc>${sharedDefs(s)}<g clip-path="url(#left)">${colorPanel(s,sceneDrawing(s,s.visual.comparison[0],0),{thumbnail:true})}</g></svg>`;
}
const current=new Set(scenes.map(s=>s.id+'.svg'));
for(const dir of [out,thumbnailOut])for(const old of fs.readdirSync(dir))if(old.endsWith('.svg')&&!current.has(old))fs.unlinkSync(path.join(dir,old));
for(const s of scenes){
 fs.writeFileSync(path.join(out,s.id+'.svg'),svg(s));
 fs.writeFileSync(path.join(thumbnailOut,s.id+'.svg'),thumbnailSvg(s));
}
fs.writeFileSync(path.join(root,'public/asset-credits.json'),JSON.stringify({creator:'Original Fieldframe artwork',license:'Original project artwork; no third-party reference-site images used.',description:'Each SVG is an original schematic rendering tied to its scene, with comparison labels and focus/composition annotations. Scene thumbnails reuse the first panel without instructional text. Diagrams and thumbnails are not photographs and carry no capture metadata.',count:scenes.length,thumbnails:scenes.length},null,2));
console.log(`Generated ${scenes.length} original scene diagrams and ${scenes.length} clean scene thumbnails.`);
