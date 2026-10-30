/** Original, scene-specific teaching diagrams. No capture metadata is asserted. */
export function drawPeopleCity(s,label,index,h){
 const {rect:R,p:P,circle:C,text:T,person:person,focus:F,mountains,starfield}=h;
 const id=s.id,second=index===1;
 const ink='#17352f',cream='#e5dac0',skin='#d8b38a',blue='#244452',light='#e6cf91';
 const filterId=`pc-${id}-${index}`;
 const defs=`<defs><filter id="${filterId}-motion" x="-35%" width="170%"><feGaussianBlur stdDeviation="5 0.5"/></filter><filter id="${filterId}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter><clipPath id="${filterId}-face"><ellipse cx="210" cy="119" rx="52" ry="64"/></clipPath></defs>`;
 const g=(a,attrs='')=>`<g ${attrs}>${a}</g>`;
 const blurred=(a,motion=false)=>motion?[-10,-5,0,5,10].map((dx,i)=>g(a,`transform="translate(${dx} 0)" opacity="${[.12,.18,.4,.18,.12][i]}" filter="url(#${filterId}-motion)"`)).join(''):g(a,`filter="url(#${filterId}-soft)"`);
 const line=(d,color=cream,w=2,attrs='')=>P(d,'none',color,w,attrs);
 const bg=(color='url(#day)')=>R(0,0,420,265,color);
 const edgeFrame=()=>R(0,0,420,265,'none',18,'stroke="#183a35" stroke-width="17"');
 const arrows=(x1,y1,x2,y2,color=light)=>line(`M${x1} ${y1}L${x2} ${y2}`,color,2)+P(`M${x2-7} ${y2-5}L${x2} ${y2}L${x2-7} ${y2+5}`,'none',color,2);
 function skyline(night=true,y=190){let a='';for(let i=0;i<10;i++){const height=54+i*29%96,x=i*47-10;a+=R(x,y-height,35,height,i%2?'#42675f':'#34564e');for(let k=0;k<2;k++)for(let j=0;j<4;j++)a+=R(x+6+k*13,y-height+11+j*20,5,8,night?'#ddc48b':'#a4b7a0',0,`opacity="${night?.8:.5}"`);}return a;}
 function road(night=true){return bg(night?'url(#night)':'url(#day)')+skyline(night)+R(0,190,420,75,night?'#203b39':'#6a8a78')+P('M105 265 191 190H233L332 265Z',night?'#182e30':'#48695c')+line('M212 201v11m0 11v13m0 11v18','#cabd8d',2);}
 function face({x=210,y=119,scale=1,shadow='none',dark=false,blow=false}={}){
  const c=dark?'#203d37':blow?'#f8f0cd':skin;
  let a=P('M121 265C125 206 157 184 210 181 264 180 297 218 300 265Z','#456858')+P('M188 163v29q23 18 46 0v-29Z',dark?'#203d37':'#ad8b6d')+`<ellipse cx="210" cy="119" rx="52" ry="64" fill="${c}"/>`;
  if(shadow==='hard')a+=g(P('M210 51H268V189H210L219 149 202 134 215 111Z','#795f4a'),`clip-path="url(#${filterId}-face)"`);
  if(shadow==='side')a+=g(P('M219 54Q177 109 226 184H272V48Z','#987658'),`clip-path="url(#${filterId}-face)" opacity=".55"`);
  if(shadow==='deep')a+=g(P('M209 50Q192 120 224 186H271V50Z','#4a5948'),`clip-path="url(#${filterId}-face)" opacity=".9"`);
  if(shadow==='dapple')a+=g(P('M151 75H274V99H151Z M140 133 277 111V130L140 151Z','#6f7255'),`clip-path="url(#${filterId}-face)" opacity=".7"`);
  a+=P('M156 103Q147 49 209 49 272 39 264 119L247 83Q218 93 180 75Z','#314a3d');
  if(!dark&&!blow)a+=line('M182 119h12m31 0h12 M205 153q12 6 23-2','#505443',2.5)+line('M214 121 208 140h8','#9a7355',2)+C(188,118,1.8,'#fff1c6')+C(231,118,1.5,'#e2d3ac');
  return g(a,`transform="translate(${x-210*scale} ${y-119*scale}) scale(${scale})"`);
 }
 const lightSource=(x=24,y=51,w=45,hh=116)=>R(x,y,w,hh,'#d5dfbd',3)+line(`M${x+w/2} ${y}v${hh} M${x} ${y+hh/2}h${w}`,'#5d7b65',3);
 const rays=(x,y)=>P(`M${x} ${y}L176 84V166L${x} ${y+90}Z`,'#ded5a1','none',1,'opacity=".16"');
 const bokeh=(large=true)=>Array.from({length:12},(_,i)=>C((i*79+18)%420,(i*53+11)%245,large?10+(i%4)*4:3,['#d6b179','#86afa0','#c58b83'][i%3],.37)).join('');
 function flame(x,y,scale=1){return g(P('M0 0C-19-17-11-38 2-53 0-32 20-20 12-8Q7 3 0 0Z','#e4a864')+P('M1-3C-5-12-1-24 4-30 6-19 13-8 1-3Z','#f6d6a0'),`transform="translate(${x} ${y}) scale(${scale})"`);}
 function treeLine(){let a='';for(let i=0;i<9;i++)a+=P(`M${i*53-14} 180l29-86 31 86Z`,i%2?'#345a45':'#52785d');return a;}
 function planeWindow(){return edgeFrame()+P('M12 232 359 155 286 197 72 253Z','#ced4c4')+line('M25 229 337 162','#879f98',2);}
 function aerial(){return bg('#94b9b6')+P('M0 103Q91 82 146 144T285 169T420 91V265H0Z','#78977d')+P('M0 143Q80 144 130 182T299 220T420 153V265H0Z','#a8b58b')+P('M0 222Q131 188 210 248T420 216V265H0Z','#678f79')+line('M0 172Q98 107 185 166T420 174','#cfcca5',3)+P('M250 0Q203 73 289 121T333 265H420V0Z','#5e9299');}
 function museumObject(){return P('M159 208H264V227H159Z','#8b9a83')+P('M181 146C145 119 164 58 207 58 251 57 272 115 239 146L246 203H174Z','#c6b88e')+P('M181 88Q206 73 234 91M180 103Q205 122 238 104M184 137Q210 149 235 135','none','#877b5f',3)+R(174,174,69,6,'#a08d66')+F(208,104);}
 let a=null;
 switch(id){
 case 'daylight-street':{
  const subject=person(198,218,1.15,skin,'run');a=road(false)+(second?blurred(subject,true):subject)+F(197,154);break;}
 case 'night-street':{
  a=road(true)+R(38,106,65,84,'#e0cc8c')+P('M39 191 113 191 225 265H45Z','#d0ba7c','none',1,'opacity=".20"');const subject=person(157,218,1.1,skin,'run');if(second)a+=R(0,0,420,265,'#cdd3ad',0,'opacity=".13"')+blurred(subject,true);else a+=subject;a+=F(157,157);break;}
 case 'neon-signs':{
  a=bg('#1d323b');for(let y=20;y<265;y+=29)a+=line(`M0 ${y}h420`,'#344b4a',1);const color=second?'#fff9e1':'#e0a0b2';a+=R(57,63,306,117,'none',12,`stroke="${color}" stroke-width="${second?9:4}"`)+T(210,143,'OPEN',53,color,'text-anchor="middle" letter-spacing="6"')+line('M101 201h217',second?'#fff9e1':'#8fbeb2',second?8:3)+F(123,118);break;}
 case 'traffic-light-trails':{
  a=road(true);const paths=second?['M139 261 163 240','M186 219 198 206','M265 244 292 264','M233 209 247 228']:['M137 265Q196 225 204 192','M285 265Q229 224 222 192'];paths.forEach((d,i)=>a+=line(d,i%2?'#bc6f6d':'#edce9d',4));a+=F(285,127);break;}
 case 'blue-hour-skyline':{
  a=bg(second?'#0c1926':'#355d88')+skyline(true,195)+R(0,195,420,70,'#29474e');for(let i=0;i<18;i++)a+=line(`M${i*23} ${204+i%4*11}h${10+i%3*3}`,i%3?'#c2ac7e':'#7497a1',2,'opacity=".6"');a+=F(285,127);break;}
 case 'vertical-architecture':{
  a=bg();if(second){a+=P('M85 244 158 33H263L338 244Z','#657a6a');for(let j=0;j<7;j++){const y=58+j*26,spread=22+j*4;for(let i=-1;i<=1;i++)a+=R(205+i*spread,y,12+j*.8,13,'#b8c8aa');}a+=line('M85 244 158 33 M338 244 263 33','#e4c78f',2,'stroke-dasharray="5 5"');}else{a+=R(111,30,198,214,'#657a6a');for(let j=0;j<7;j++)for(let i=0;i<5;i++)a+=R(128+i*35,48+j*27,14,15,'#b8c8aa');a+=line('M110 20v231 M310 20v231','#e4c78f',2,'stroke-dasharray="5 5"');}a+=F(212,133);break;}
 case 'cathedral-interior':{
  a=bg(second?'#293d3c':'#8b9380')+P('M0 265 90 209H330L420 265Z',second?'#48594c':'#b4b397');for(let i=0;i<4;i++)a+=line(`M${44+i*31} 248V${97+i*11}Q210 ${-84+i*46} ${376-i*31} ${97+i*11}V248`,second?'#626e5d':'#d0cbae',8-i);a+=R(185,101,50,83,second?'#7792a3':'#f2edd4',16);if(second){a+=P('M188 133H232V147H188Z','#cda18a')+line('M210 102v80 M188 160h45','#d7c586',3)+C(210,122,7,'#c3ad75');}a+=F(128,171);break;}
 case 'bridge-at-night':{
  a=bg('url(#night)')+R(0,171,420,94,'#2e535b');a+=line('M14 160H407 M86 161V54 M334 161V54 M86 65Q210 176 334 65 M14 145 86 65 M334 65 407 145','#e5ca95',3);for(let i=0;i<11;i++){const x=45+i*32;a+=line(`M${x} 162v12`,'#dfbf84',2);if(second){for(let k=0;k<4;k++)a+=line(`M${x-5+(k%2?4:-4)} ${185+k*17}h${7+k%2*5}`,'#bca779',2,'opacity=".65"');}else a+=line(`M${x} 183q-8 32 0 68`,'#c0ad7d',6,'opacity=".45"');}a+=F(334,81);break;}
 case 'festive-lights':{
  a=bg('url(#night)')+P('M210 29 136 169H284Z','#355f49');for(let i=0;i<20;i++)a+=C(143+i*37%139,58+i*23%109,second?9+i%3*3:3,['#dbc17c','#a7c39b','#b37b76'][i%3],second?.7:1);if(second)a+=R(0,0,420,265,'#142b30',0,'opacity=".15"');const x=second?165:210,y=second?161:150,r=second?51:24;a+=line(`M${x} ${y-r-28}v28`,'#cfb986',2)+C(x,y,r,'#bb8f67')+line(`M${x-r*.6} ${y}q${r*.6} ${r*.7} ${r*1.2} 0`,'#e2c793',3)+C(x-r*.3,y-r*.3,r*.14,'#ead7a4')+F(x,y);break;}
 case 'rainy-pavement':{
  a=bg('url(#night)')+skyline(true,142)+R(0,142,420,123,'#274a4c')+R(54,63,91,38,'none',4,'stroke="#ca8a99" stroke-width="3"')+T(100,89,'OPEN',18,'#dda3b0','text-anchor="middle"');if(second){for(let i=0;i<16;i++)a+=line(`M${38+i%4*11} ${150+i*7}q${35+i%3*15} -8 ${73+i%2*21} 0`,i%2?'#c18d9a':'#8fbcb0',3,'opacity=".8"');}else{a+=g(R(54,63,91,38,'none',4,'stroke="#b47e91" stroke-width="3"')+T(100,89,'OPEN',18,'#ca91a0','text-anchor="middle"'), 'transform="translate(0 286) scale(1 -1)" opacity=".8"');a+=person(246,132,.85,skin,'run')+g(person(246,132,.85,'#ad987a','run'),'transform="translate(0 287) scale(1 -1)" opacity=".6"');}a+=F(second?100:246,second?193:85);break;}
 case 'subway-motion':{
  a=bg('#425d57')+R(0,198,420,67,'#8e9d86')+line('M0 222H420','#e6c877',4);let train=R(19,66,401,125,'#aab4a5',8);for(let i=0;i<7;i++)train+=R(35+i*61,84,43,55,'#4c7067',5);if(!second){a+=blurred(train,true);for(let i=0;i<5;i++)a+=line(`M0 ${83+i*23}h420`,'#bfc8b1',2,'opacity=".6"');}else a+=train;a+=R(364,0,17,224,'#657b67')+person(116,220,1.1,skin)+F(116,159);break;}
 case 'interior-window-balance':{
  a=bg(second?'#364d44':'#a8b09a')+P('M0 265 75 199H340L420 265Z',second?'#536455':'#c5c4a8')+R(250,37,116,133,second?'#8eaba8':'#fff3cf')+line('M307 39v129 M252 104h112',second?'#455f54':'#a7b39a',4);if(second){a+=P('M254 126 274 88 297 127 325 78 362 119V166H254Z','#52785f')+C(338,59,12,'#d5d5ae');}a+=R(48,149,149,65,second?'#4b6050':'#918b69',8)+R(60,131,122,42,second?'#58705b':'#b3a680',7)+line('M63 211v20 M183 211v20','#334e40',5)+F(130,154);break;}
 case 'fireworks':return null;
 case 'indoor-concert':case 'theatre-performance':case 'spotlit-speaker':{
  a=bg('url(#night)')+R(0,224,420,41,'#344e48')+P('M55 0 118 224H278L83 0Z','#e2c9a1','none',1,'opacity=".14"')+P('M335 0 207 224H351L359 0Z','#b79cbe','none',1,'opacity=".12"');
  if(id==='theatre-performance'){const near=person(147,210,1.45,skin),far=person(288,190,1.1,skin);a+=near+(second?far:blurred(far));a+=F(147,130);}
  else{let body=person(207,198,1.5,second&&id==='spotlit-speaker'?'#fff0cb':skin);if(id==='indoor-concert'){a+=body+P('M177 149 224 128 256 154 213 180Z','#b68d63');a+=second?blurred(line('M205 151 250 127',skin,9),true):line('M205 151 250 127',skin,9);}else{a+=body+R(236,156,55,68,'#4c6555')+line('M240 154v-24l-17-11','#b6bfa4',3);if(second)a+=C(207,115,15,'#fff2cc');}a+=F(207,115);}break;}
 case 'indoor-reception':{
  a=bg('#3f544b')+bokeh(true)+R(0,225,420,40,'#786c50');a+=face({x:129,y:126,scale:.62});const far=face({x:286,y:123,scale:.63});a+=second?blurred(far):far;a+=line('M180 230h70','#d6bf8e',3)+F(117,125);break;}
 case 'wedding-ceremony':{
  a=bg('#899c83')+P('M48 251V110Q210-55 372 110V251','none','#c4cbae',7)+person(146,194,1.5,'#d8d2b1')+person(273,194,1.5,'#49635b');let hands=line('M149 167 194 184 228 177 M269 167 238 179 209 184',skin,10)+C(213,182,5,'none')+`<circle cx="213" cy="182" r="5" fill="none" stroke="#ead38d" stroke-width="2"/>`;a+=second?blurred(hands):hands;a+=second?F(335,105):F(213,182);break;}
 case 'first-dance':case 'dance-floor-flash':{
  a=bg('url(#night)')+bokeh(false)+R(0,222,420,43,'#3e5750');const dancers=person(183,200,1.35,skin)+person(256,202,1.35,'#b9ba9a')+line('M181 159 220 140 255 160',skin,6);
  if(id==='first-dance')a+=second?blurred(dancers,true):dancers;
  else{a+=line('M12 63Q90 154 181 71T407 87','#ba90b0',5)+line('M0 124Q90 44 178 119T407 119','#d6b67d',5);a+=g(dancers,'opacity=".18" transform="translate(-17 2)"')+g(dancers,'opacity=".13" transform="translate(16 -2)"')+(second?blurred(dancers,true):dancers);}
  a+=F(184,126);break;}
 case 'candlelight-portrait':case 'campfire-people':{
  a=bg('#1e2f32');if(id==='candlelight-portrait'){a+=face({x:248,y:126,scale:.82,shadow:second?'none':'side',dark:second})+R(73,180,16,65,'#b9b39a')+R(102,198,13,47,'#bbb49c')+flame(81,181,.58)+flame(109,199,.43)+C(82,154,57,'#e5b96d',.07);a+=F(228,125);}else{a+=person(105,211,1.6,second?'#243c36':skin)+person(307,212,1.6,second?'#243c36':'#d2b68d')+line('M158 239 261 223 M166 220 253 243','#846a4e',9)+flame(208,234,1.8)+flame(180,238,.8)+F(105,122);if(second)for(let i=0;i<9;i++)a+=C(170+i*31%82,84+i*23%86,1.5,'#e7bd77');}break;}
 case 'open-shade-portrait':{
  a=bg('url(#portrait)')+bokeh(true)+face({shadow:second?'dapple':'none'})+P('M0 0H420V33Q210 74 0 33Z','#adc5ae','none',1,'opacity=".35"')+F(188,118);break;}
 case 'harsh-sun-portrait':{
  a=bg('#93a990')+face({shadow:'hard'})+C(47,39,22,'#f2d58e');if(second)a+=g(P('M205 125 247 148 219 162 207 148Z','#755d4c'),`clip-path="url(#${filterId}-face)"`);a+=P('M68 43 165 95 155 133 62 68Z','#ead391','none',1,'opacity=".18"')+F(188,118);break;}
 case 'backlit-portrait':{
  a=bg('url(#sunset)')+C(257,91,44,'#e6ca8b',.35)+face({dark:second})+line('M161 142Q142 75 185 57 M252 75Q281 122 252 170','#f0d294',4);if(!second)a+=R(28,148,33,63,'#d9dfbf',5)+P('M61 148 161 92V174L61 211Z','#e2dbb0','none',1,'opacity=".13"');a+=F(188,118);break;}
 case 'window-light-portrait':{
  a=bg('#5a7461')+lightSource()+rays(70,50)+face({shadow:second?'deep':'side'})+F(188,118);break;}
 case 'group-portrait':{
  a=bg('url(#portrait)');let back='';for(let i=0;i<3;i++)back+=person(111+i*98,164,1.05,'#c1ae8a');a+=second?blurred(back):back;for(let i=0;i<3;i++)a+=person(76+i*126,231,1.18,skin);a+=line('M33 252h355','#9eac8c',2)+F(208,107);break;}
 case 'environmental-portrait':{
  a=bg('#7f9581')+R(0,224,420,41,'#6e785f')+R(212,177,179,17,'#c5ad7f')+line('M224 193v57 M379 193v57','#536c53',7)+person(142,208,1.7,skin)+line('M168 163 238 175',skin,8)+R(230,147,13,37,'#a28960')+R(216,142,45,11,'#4e6252');if(second){for(let i=0;i<24;i++)a+=R(i*71%400,i*47%170+15,20+i%4*8,12+i%3*14,['#c7b88b','#5b7560','#a38b64'][i%3],2);a+=person(142,208,1.7,skin);}a+=F(142,115);break;}
 case 'moving-children':{
  a=bg()+treeLine()+R(0,180,420,85,'#75946b');const child=person(211,210,1.6,skin,'run');a+=second?blurred(child,true):child;a+=P('M42 225h60','none','#dfd5a6',3)+F(211,122);break;}
 case 'single-light-studio':{
  a=bg('#314b42')+face({shadow:second?'hard':'side'});if(second)a+=R(33,46,18,25,'#ece2b9',3)+P('M51 47 169 87 161 119 51 71Z','#e5d9aa','none',1,'opacity=".12"');else a+=R(17,30,55,119,'#e0dfbc',5)+rays(72,34);a+=line('M44 151v95 M27 250 44 232 62 250','#8b9e7e',3)+F(188,118);break;}
 case 'night-ambient-portrait':{
  a=bg('url(#night)')+bokeh(true)+face({x:239,y:126,scale:.9,dark:second})+lightSource(13,59,52,126);if(!second)a+=rays(65,62);a+=F(219,125);break;}
 case 'self-portrait-timer':{
  a=bg('#6f8d78')+R(0,223,420,42,'#a8b594')+R(29,139,48,32,'#304e40',5)+C(72,155,12,'#bdc7a8')+line('M51 173v58 M27 249 51 218 76 249','#304e40',4)+P('M85 151 211 91V207L85 161Z','#d9c995','none',1,'opacity=".16"')+line('M211 66v167','#e3c783',2,'stroke-dasharray="5 5"')+T(211,48,'FOCUS PLANE',11,cream,'text-anchor="middle"');a+=person(second?296:211,216,1.8,skin)+F(211,117);if(second)a+=arrows(218,245,288,245);break;}
 case 'aircraft-window':{
  a=aerial()+planeWindow();if(second)a+=R(275,26,101,47,'#d9d6b4',6,'opacity=".25"')+P('M120 265Q101 163 143 138 183 159 185 265Z','#ded7b7','none',1,'opacity=".23"');a+=F(174,131);break;}
 case 'moving-vehicle-travel':{
  let landscape=bg()+mountains()+R(0,225,420,40,'#74926f');a=second?blurred(landscape,true):landscape;for(let i=0;i<4;i++)a+=second?blurred(line(`M${i*126+12} 41v224`,'#395c48',9),true):line(`M${i*126+12} 41v224`,'#395c48',8);a+=edgeFrame()+F(214,127);break;}
 case 'crowded-monument':{
  a=bg()+R(0,223,420,42,'#a2ad8c')+R(177,77,68,145,'#a6ab8a')+P('M164 78 211 38 257 78Z','#c4c1a0')+R(196,157,31,65,'#66775d',15);const n=second?10:1;for(let i=0;i<n;i++)a+=person(second?i*43+14:116,226,.8+(i%3)*.13,second?'#49644e':skin);a+=F(211,116);break;}
 case 'market-travel':{
  a=bg('#8da68e')+P('M35 80 88 30H333L387 80Z','#ac805e');for(let i=0;i<8;i++)a+=R(36+i*44,80,29,20,'#d7b987');a+=R(48,187,322,52,'#8d8d62');if(second){for(let i=0;i<36;i++)a+=C(61+i*47%290,118+i*31%102,10+(i%3)*3,['#b59061','#9aa16b','#c2ad72'][i%3]);}else{a+=person(207,164,1.2,skin)+line('M202 143 261 170 297 150',skin,8)+R(245,153,28,21,'#c2b78a',3);for(let i=0;i<6;i++)a+=C(76+i*48,197,12,['#b58d5d','#a6aa70','#c1ab70'][i%3]);}a+=F(second?212:207,second?164:99);break;}
 case 'museum-object':{
  a=bg('#3a534c')+R(102,25,217,223,'#91aa95',4,'opacity=".25"')+line('M102 25H319V248H102Z','#9eb6a0',2)+museumObject();if(second)a+=R(119,46,76,24,'#ece9cf',7,'opacity=".6"')+R(231,109,69,24,'#ece9cf',7,'opacity=".55"')+line('M311 36 227 226','#cadbc3',8,'opacity=".24"');break;}
 case 'underwater-natural-light':{
  a=bg('#316c79');for(let i=0;i<5;i++)a+=P(`M${40+i*82} 0l-66 230`,'none','#c2dcd1',18,'opacity=".07"');a+=P('M0 265 30 203 75 252 116 197 168 257 209 215 253 265Z','#47746b');let fish=P('M107 132Q208 44 299 132 210 223 107 132L58 101V170Z',second?'#6d9e9c':'#d7bd83')+P('M172 95 206 65 239 100 M173 176 211 206 245 174Z',second?'#629196':'#b49763')+C(271,124,5,second?'#4b7780':'#1f494b')+line('M158 111q20 27 0 51',second?'#83aaa1':'#f0d7a0',2);a+=second?g(blurred(fish),'opacity=".55" transform="translate(91 55) scale(.56)"'):fish;if(second)a+=R(0,0,420,265,'#5f99a3',0,'opacity=".22"');a+=F(second?241:271,second?125:124);break;}
 case 'ferry-wake':{
  const sea=bg('#8eafb0')+R(0,93,420,172,'#4c8990')+line('M0 93H420','#d1d9b8',2)+P('M210 108 75 265H346Z','#87b8b1');let foam='';for(let i=0;i<45;i++){const y=124+i*29%139,width=(y-100)*.56,x=210+((i*47%100)/50-1)*width;foam+=P(`M${x-4} ${y}q8-5 15 1`,'none','#d7e6cc',2+i%3*.6);}let wake=sea+foam;if(second)wake=blurred(wake,true)+g(wake,'transform="translate(5 2)" opacity=".2"');a=wake+P('M0 243H420V265H0Z','#a4b3a1')+line('M8 244 85 265 M412 244 337 265','#526f61',4)+F(211,172);break;}
 case 'overlook-through-glass':{
  a=bg()+skyline(false,224)+edgeFrame();if(second)a+=R(40,33,95,28,'#f0e6c8',8,'opacity=".65"')+R(241,79,95,28,'#f0e6c8',8,'opacity=".6"')+line('M354 22 269 238','#ccddc6',7,'opacity=".28"');a+=F(211,137);break;}
 default:return null;
 }
 return defs+a;
}
