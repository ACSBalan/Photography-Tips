/** Original 420×265 technique diagrams. Each comparison changes the physical
 * result described by that panel, not just its caption. No capture metadata. */
export function drawActionCreative(s, label, index, h) {
  const own = ['action-sport','wildlife','close-up','creative'];
  if (!own.includes(s.category)) return null;
  const {rect,p,circle,text,person,focus,mountains} = h;
  const id=s.id, second=index===1, key=`ac-${id}-${index}`;
  const ink='#183b35', cream='#e4d2ac', warm='#c99c70', pale='#c9d8ba', gold='#e7c783';
  const g=(m,attrs='')=>`<g ${attrs}>${m}</g>`;
  const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
  let seq=0;
  const blur=(m,x,y=x)=>{const f=`${key}-blur-${seq++}`;return `<defs><filter id="${f}" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="${x} ${y}"/></filter></defs><g filter="url(#${f})">${m}</g>`;};
  const alpha=(m,o)=>g(m,`opacity="${o}"`);
  const base=(kind='day')=>rect(0,0,420,265,kind==='night'?'url(#night)':kind==='wild'?'url(#wildlife)':'url(#day)');
  const ground=(fill='#5c7d64',y=210)=>rect(0,y,420,265-y,fill);
  const arrow=(x1,y1,x2,y2,color=gold)=>p(`M${x1} ${y1}L${x2} ${y2}`,'none',color,2)+p(`M${x2-7} ${y2-4}L${x2} ${y2} ${x2-7} ${y2+4}`,'none',color,2);
  const streaks=(length=160)=>Array.from({length:10},(_,i)=>p(`M${8+(i*71)%140} ${25+i*20}h${length}`,'none',pale,2.5,'opacity=".35"')).join('');
  const tinyLabel=(x,y,v)=>text(x,y,v,11,'#f1ead0');
  const tree=(x,y,scale=1)=>g(p('M0 0V-150','none','#34533e',9)+p('M-38-80 0-150 38-80H-38 M-46-40 0-117 46-40H-46','#486c4e'),`transform="translate(${x} ${y}) scale(${scale})"`);
  const dotField=()=>Array.from({length:10},(_,i)=>circle((i*53+19)%420,(i*47+21)%170,18+i%3*7,'#b6c7a3',.10)).join('');
  const bird=(flight=false,wingBlur=false)=>{
    const wings=p('M205 129Q154 54 106 78 145 108 191 144 M219 129Q273 57 323 74 281 112 232 145','#d9c29c');
    const body=ellipse(210,145,25,39,'#c7ab81')+circle(226,111,18,'#ddc8a0')+circle(231,107,3,ink)+p('M242 111 259 116 242 120Z','#e5ad60')+p('M195 177 176 213 214 190Z','#9f8968');
    return (flight?(wingBlur?blur(wings,1,7)+alpha(wings,.35):wings):p('M192 140Q171 106 191 121 211 135 220 170Z','#a88e66'))+body;
  };
  const head=(color=warm)=>p('M133 148 131 71 169 106Q210 87 251 107L288 74 288 154Q283 220 211 230 142 218 133 148Z',color)+circle(174,145,5,ink)+circle(250,145,5,ink)+p('M193 180h35l-17 15Z',ink)+p('M211 195v12 M211 205q-16 8-24-1 M211 205q16 8 24-1','none',ink,2);
  const mammal=(running=false,legBlur=false)=>{
    const legs=p(running?'M168 170 145 194 117 218 M191 170 205 199 183 221 M246 169 269 188 286 215 M260 165 286 174 313 204':'M166 174 165 220 M193 174 195 220 M247 173 247 220 M270 170 274 218','none','#b99c73',10);
    return (legBlur?blur(legs,7,1):legs)+ellipse(214,149,72,35,warm)+p('M264 152 278 104 306 112 294 158Z',warm)+ellipse(302,111,28,17,warm)+p('M285 98 284 75 302 95Z',warm)+p('M316 109 337 119 315 124Z','#c5a47c')+circle(307,107,3,ink)+p('M144 145Q105 122 96 149','none',warm,11);
  };
  const fish=()=>p('M100 136Q199 52 291 136 201 219 100 136L52 105V173Z','#d7bc86')+p('M158 101 190 67 226 104 M164 176 198 209 229 173Z','#ab8969')+circle(263,127,5,ink)+p('M245 115q-14 22 0 44','none','#8c8063',2);
  const fence=(opacity=.75)=>alpha(Array.from({length:12},(_,i)=>p(`M${i*48-265} 0l265 265 M${i*48-265} 265l265-265`,'none','#c1c8ad',3)).join(''),opacity);
  const flower=(petalBlur=0)=>{
    const petals=Array.from({length:9},(_,i)=>{const t=i*Math.PI*2/9;return ellipse(210+Math.cos(t)*42,119+Math.sin(t)*42,35,20,'#d0a2a0',`transform="rotate(${i*40} ${210+Math.cos(t)*42} ${119+Math.sin(t)*42})"`);}).join('');
    return p('M210 165V265 M210 227Q166 184 152 223 181 242 210 227 M211 211Q264 168 269 205 238 224 211 211','#789b68','#7a9867',4)+(petalBlur?blur(petals,petalBlur):petals)+circle(210,119,24,'#d3b674')+Array.from({length:9},(_,i)=>circle(200+i%3*10,110+Math.floor(i/3)*9,2.2,'#6c7046')).join('');
  };
  const insect=(wingsBlur=0)=>{
    const wings=ellipse(186,114,43,15,'#d2dec3','transform="rotate(25 186 114)" opacity=".7"')+ellipse(236,110,43,15,'#d2dec3','transform="rotate(-25 236 110)" opacity=".7"');
    return (wingsBlur?blur(wings,1,wingsBlur):wings)+ellipse(210,145,20,35,'#bd9b5e')+p('M192 143h36 M192 158h36','none','#665b3c',7)+circle(210,108,15,'#aeaf70')+circle(201,104,4,ink)+circle(220,104,4,ink)+p('M193 143 167 163 M193 154 164 177 M227 143 251 163 M226 155 251 179','none','#d5d5a7',2);
  };
  const vase=(fill)=>p('M165 65H255L246 110Q265 140 258 223H162Q155 140 174 110Z',fill,'#5c7663',2);
  const cycle=(pan=false)=>{
    let wheels='';
    for(const x of [125,290]){
      wheels+=circle(x,202,34,'none')+`<circle cx="${x}" cy="202" r="34" fill="none" stroke="#d4d6b6" stroke-width="4"/>`;
      const spokes=Array.from({length:10},(_,i)=>{const t=i*Math.PI/5;return p(`M${x} 202l${Math.cos(t)*31} ${Math.sin(t)*31}`,'none','#bcc9ac',1);}).join('');
      wheels+=pan?alpha(blur(spokes,1.5),.35):spokes;
    }
    return wheels+p('M125 202 166 145 220 202H125L197 150 264 150 290 202 M163 141h23 M263 149l-9-22h17','none','#d5a66f',4)+p('M189 135 227 107 248 126 263 142 M188 136 210 162 195 196 M190 137 166 166 183 191','none',cream,8)+circle(239,94,12,cream)+p('M228 88q12-15 25 3','none','#456358',5);
  };
  const car=()=>p('M70 177 119 137H266L313 176V211H70Z','#b58c70')+p('M134 147H247L275 174H111Z','#4f6c66')+circle(116,208,22,ink)+circle(270,208,22,ink)+circle(116,208,11,'#b9c6ad')+circle(270,208,11,'#b9c6ad')+rect(182,180,39,18,'#e3d4af',2);
  const cloud=(x,y)=>circle(x,y,15,'#dce6d0')+circle(x+20,y-8,21,'#dce6d0')+circle(x+42,y,16,'#dce6d0')+rect(x-1,y,47,14,'#dce6d0',5);

  // SPORT: motion effects are applied to the moving parts rather than arbitrary whole-scene blur.
  if(id==='runner-stride') return base()+ground()+(second?streaks(250):'')+person(214,180,1.35,cream,'run')+(second?alpha(blur(person(214,180,1.35,cream,'run'),10,0),.5):'')+focus(214,106);
  if(id==='cyclist-freeze'||id==='cycling-pan') {
    const pan=id==='cycling-pan'||second;
    return base()+ground('#5c7f68',218)+(pan?streaks(id==='cycling-pan'&&!second?100:300):'')+cycle(pan)+focus(239,94);
  }
  if(id==='motorsport-track') return base()+ground('#677c68',206)+p('M0 243Q147 175 420 230','none','#b1b99f',4)+(second?streaks(280):'')+car()+focus(224,157)+(second?tinyLabel(18,32,'Follow the car through the exposure'):tinyLabel(18,32,'Freeze the bodywork'));
  if(id==='snow-sports') {
    let a=base()+p('M0 172 420 213V265H0Z',second?'#fff9e5':'#d6e2d4');
    if(!second) for(let i=0;i<11;i++)a+=p(`M${i*42-14} ${204+i%3*12}l49 10`,'none','#9fb9b0',1.5);
    a+=person(212,161,1.1,'#7e6455','run')+p('M161 195 262 219','none','#ab7958',5);
    for(let i=0;i<19;i++)a+=circle(106+(i*17)%84,151+(i*19)%65,i%3+1,second?'#fff9e5':'#e7eee0');
    return a+focus(212,100);
  }
  if(id==='surfing-from-shore') {
    let a=base()+rect(0,130,420,135,'#548c8b')+p('M33 249C100 224 98 127 180 95 240 85 272 121 229 146 243 115 211 110 193 137 172 186 285 230 403 233V265H33Z','#89b5a7')+p('M35 246C102 222 102 130 180 98 230 91 262 118 230 144','none','#d6e4cf',5)+person(217,193,.78,cream,'run')+p('M169 216q43-14 97-1-41 10-97 1Z','#e4d3a3');
    for(let i=0;i<19;i++){let x=90+i*12,y=142+(i*29)%62;a+=second?p(`M${x} ${y}q-12 12-18 24`,'none','#dce8d4',2):circle(x,y,1.7,'#e4ecd9');}
    return a+focus(217,150);
  }
  if(id==='indoor-basketball') {
    let a=rect(0,0,420,265,'#49635b')+ground('#9e977d',221)+p('M335 71h70 M350 71l7 25h28l7-25','none','#d7c7a4',3)+rect(330,34,72,5,'#c9d1b8');
    a+=person(212,175,1.35,cream,'run');
    const arm=p('M218 128 249 104 261 89','none',cream,9),ball=circle(267,73,16,'#c99b6b');
    return a+(second?blur(arm+ball,7,2):arm+ball)+focus(212,101);
  }
  if(id==='outdoor-football') {
    let a=base()+ground('#557c56',190)+p('M0 226h420','none','#becba3',2);
    if(second)a+=person(77,191,.8,'#d0b18a','run')+person(330,195,.8,'#a4beaa','run')+person(212,190,1,cream,'run')+circle(265,217,11,'#e1dec3');
    else a+=person(207,174,1.75,cream,'run')+circle(282,228,17,'#e1dec3');
    return a+focus(second?212:207,second?135:78);
  }
  if(id==='swimming-race') {
    let a=base()+rect(0,122,420,143,'#518c8d');
    if(!second)a+=ellipse(218,159,20,16,cream)+p('M202 152q16-17 33-1','none','#477b91',9)+circle(231,158,3,ink)+p('M165 185 211 181 252 144 278 159','none',cream,12)+focus(229,158);
    else a+=p('M130 187 192 176 238 161 275 184','none',cream,12)+ellipse(228,190,22,10,'#94b7a6');
    a+=p('M20 196q54-21 112 2t115 0t140-2','none','#b9d6c7',5);
    for(let i=0;i<15;i++)a+=circle(121+i*12,154+(i*29)%60,1.7,'#e0e9d4');
    return a;
  }
  if(id==='skateboard-trick') {
    let a=base()+ground('#60806b',236)+p('M28 234 91 198H141V239Z','#80977d');
    if(second)for(let i=0;i<13;i++)a+=rect(i*34-7,50+(i*29)%90,23,166,'#557567',0,'opacity=".8"')+p(`M0 ${60+i*13}h420`,'none','#98ab8d',1.5);
    a+=person(214,146,1.2,cream,'run')+p('M169 188 258 172','none','#d6ac74',6)+circle(183,193,5,ink)+circle(244,183,5,ink)+focus(214,80);
    return a;
  }

  // WILDLIFE: target selection, real movement, glass geometry and fence separation.
  if(id==='perched-bird') {
    const b=bird(false);return base('wild')+dotField()+p('M24 226Q207 183 391 222','none','#927d5e',10)+(second?blur(b,4):b)+focus(second?180:231,second?204:107);
  }
  if(id==='bird-in-flight') return base()+(second?streaks(260):'')+bird(true,second)+focus(231,107);
  if(id==='resting-mammal') {
    let a=base('wild')+dotField();
    if(second)a+=p('M47 249 162 65 M121 127 73 47 M265 80 352 238 M298 133 396 103','none','#3a583c',10);
    return a+head()+focus(174,145);
  }
  if(id==='running-wildlife') return base('wild')+ground('#68805b',220)+(second?streaks(270):'')+mammal(true,second)+focus(307,107);
  if(id==='indoor-pet') {
    let a=rect(0,0,420,265,second?'#6b7d8c':'#768b79')+rect(19,32,60,165,'#dce3c0',3)+p('M49 32v164 M19 115h60','none','#668170',4);
    const cid=`${key}-petclip`;a+=`<defs><clipPath id="${cid}">${head()}</clipPath></defs>`+head();
    a+=g(rect(211,20,130,235,second?'#d48543':'#463e30',0,`opacity="${second?.5:.22}"`),`clip-path="url(#${cid})"`);
    if(second)a+=circle(365,53,18,'#e9a24d')+p('M349 63h31l-7-26h-17Z','#dfae64');
    return a+circle(172,143,2,'#f1edcd')+focus(174,145);
  }
  if(id==='aquarium-fish') {
    let a=rect(0,0,420,265,'#356d70');
    if(second)a+=g(alpha(fish(),.45),'transform="translate(-9 -2)" style="filter:hue-rotate(80deg)"')+g(alpha(fish(),.4),'transform="translate(8 4)" style="filter:hue-rotate(250deg)"');
    a+=fish()+rect(18,24,384,217,'none',7,'stroke="#94b7a3" stroke-width="3" opacity=".5"');
    return a+focus(263,127)+tinyLabel(25,243,second?'Oblique thick-glass view':'Square to the glass');
  }
  if(id==='zoo-through-glass') {
    let a=base('wild')+head()+rect(20,16,380,234,'none',8,'stroke="#a0b6a1" stroke-width="3"');
    if(second)a+=alpha(person(210,220,2.5,'#dce2c6'),.35)+p('M47 25 114 242 M316 25 378 242','none','#cbd9c4',12,'opacity=".3"');
    return a+focus(174,145);
  }
  if(id==='animal-through-fence') return base('wild')+head()+ (second?fence(.8):blur(fence(.19),5))+focus(174,145)+tinyLabel(25,245,second?'Animal close to visible mesh':'Animal farther behind blurred mesh');
  if(id==='dawn-wildlife') {
    let a=base('night')+ground('#314c40',219)+alpha(mammal(false),.75);
    if(second)a+=blur(g(ellipse(302,111,28,17,warm)+circle(307,107,3,ink)+p('M316 109 337 119 315 124Z','#c5a47c'),'transform="translate(-2 0)"'),9,0);
    return a+focus(307,107);
  }
  if(id==='diving-bird') {
    let a=base()+rect(0,192,420,73,'#518c8b')+bird(true,second);
    for(let i=0;i<36;i++){const t=i*Math.PI/18,x=211+Math.cos(t)*99,y=178+Math.sin(t)*53;a+=second?p(`M${x} ${y}l${Math.cos(t)*15} ${Math.sin(t)*17}`,'none','#d7e8d4',1.6):circle(x,y,1.6,'#e3eedb');}
    return a+focus(231,107);
  }

  // CLOSE-UP: show the actual focus plane, illumination or perspective difference.
  if(id==='still-flower') return base('wild')+dotField()+flower(second?.3:3.2)+focus(210,119);
  if(id==='windblown-flower') {
    let a=base('wild')+dotField();
    if(second)a+=g(alpha(flower(),.25),'transform="translate(-16 0)"')+g(alpha(flower(),.25),'transform="translate(16 0)"')+blur(flower(),9,0);
    else a+=flower();
    return a+focus(210,119);
  }
  if(id==='perched-insect') {
    const body=ellipse(190,150,66,18,'#ae915e')+p('M147 143v15 M166 135v28 M188 132v32 M210 135v29','none','#6b6540',3)+p('M157 159 143 181 M183 166 174 191 M212 165 224 188','none','#bbbd86',3);
    return base('wild')+p('M65 199Q201 172 353 199','none','#88a775',10)+(second?blur(body,3):body)+ellipse(259,143,24,20,'#aebd78')+circle(269,135,6,ink)+focus(269,135)+tinyLabel(25,38,second?'Body recedes beyond the eye plane':'Body aligned with the eye plane');
  }
  if(id==='insect-in-flight') {
    const f=g(flower(),'transform="translate(165 84) scale(.48)"');
    return base('wild')+dotField()+f+insect(second?1:6)+focus(210,108)+p('M139 97h-44 M139 111h-33','none','#b9caa8',1.5,'opacity=".4"');
  }
  if(id==='droplets-close-up') {
    let a=base('wild')+p('M40 233Q117 48 376 61 323 222 40 233Z','#6e986d')+p('M55 225 352 78','none','#bdd29a',2);
    for(let i=0;i<4;i++){const x=111+i*66,y=190-i*29,r=20+i%2*5;a+=circle(x,y,r,'#a6c9ac',.8)+p(`M${x-10} ${y-7}q10-15 19-5`,'none','#e8efcf',second?6:2);if(second)a+=circle(x-2,y-10,6,'#fff9df');}
    return a+focus(243,132);
  }
  if(id==='food-window-light') {
    let a=rect(0,0,420,265,'#a0a48a');
    if(!second)a+=ellipse(249,174,115,68,'#657661','opacity=".55"')+p('M30 60 135 111 M30 88 127 131','none','#e6dec1',3);
    a+=ellipse(215,153,112,76,'#d9dcc0')+ellipse(215,153,90,56,'#657c4e');
    for(let i=0;i<16;i++){const x=154+(i*31)%121,y=117+(i*23)%71;a+=circle(x,y,10+i%3,['#b8955d','#a2ae64','#c47f56'][i%3]);if(!second)a+=p(`M${x-5} ${y-3}q6-7 11 0`,'none','#d8c48c',1.8);}
    return a+focus(211,150)+tinyLabel(24,245,second?'Front illumination flattens surface texture':'Broad side light reveals texture');
  }
  if(id==='reflective-product') {
    let a=rect(0,0,420,265,'#acb8a3')+ground('#879d89',227)+vase(second?'#718a79':'url(#metal)')+rect(176,45,68,21,'#365548',4);
    if(second)a+=circle(218,133,21,'#fff9dc')+blur(circle(218,133,30,'#fff5c4',.35),5);
    else a+=p('M180 91q-12 60-7 113','none','#e1e7cd',12,'opacity=".65"')+p('M245 111v97','none','#526b59',7);
    return a+focus(223,168);
  }
  if(id==='jewellery-detail') {
    const ring=ellipse(212,172,68,44,'none','stroke="#d7bb7c" stroke-width="11"'),gem=p('M181 104 212 76 246 104 212 142Z','#bbd5cf','#ebdec1',2)+p('M181 104h65 M212 76v66','none','#e4e6d0',1.4);
    return rect(0,0,420,265,'#40594e')+(second?ring:blur(ring,2.8))+gem+focus(212,104)+tinyLabel(25,245,second?'Overlapping focus planes merged':'Only the selected facet plane is sharp');
  }
  if(id==='flat-lay') {
    let a=rect(0,0,420,265,'#b2b09a');
    if(!second)a+=rect(61,46,114,164,'#d8d8be',3)+rect(77,62,81,118,'#7d9581',2)+circle(286,93,47,'#e1dfc5')+circle(286,93,32,'#806c56')+p('M235 208h110','none','#57745d',9);
    else a+=p('M89 63 184 48 173 211 47 205Z','#d8d8be')+p('M103 77 169 64 159 181 67 178Z','#7d9581')+ellipse(289,88,49,31,'#e1dfc5')+ellipse(289,88,35,21,'#806c56')+blur(p('M229 208 352 225','none','#57745d',10),2.2);
    return a+focus(second?119:120,132)+tinyLabel(22,245,second?'Tilt changes geometry and focus coverage':'Parallel sensor and tabletop');
  }
  if(id==='glass-product') {
    const outline=second?'#e6eed3':'#3d5d4f';
    return rect(0,0,420,265,second?'#243e37':'#d4ddc4')+p('M160 43H258L248 164Q211 191 171 164L160 43 M210 181V228 M176 233H246','none',outline,3)+p('M172 55 178 150 M246 54 239 148','none',outline,2,'opacity=".7"')+ellipse(209,44,49,7,'none',`stroke="${outline}" stroke-width="2"`)+focus(245,54);
  }

  // CREATIVE: the comparison is the mechanism/result stated by the sheet.
  if(id==='intentional-camera-movement') {
    const woods=Array.from({length:10},(_,i)=>tree(i*48-7,277,1.5+i%2*.2)).join('');
    return base('wild')+blur(woods,0,second?24:4)+Array.from({length:12},(_,i)=>p(`M${i*37} ${second?0:70}v${second?265:110}`,'none','#b3c39d',second?8:3,`opacity="${second?.2:.13}"`)).join('');
  }
  if(id==='zoom-burst') {
    let a=base('night')+rect(183,105,54,57,'#ad9f7e',4)+circle(210,130,13,'#e0c791');
    for(let i=0;i<24;i++){const t=i*Math.PI/12,r1=42,r2=second?220:94;a+=p(`M${210+Math.cos(t)*r1} ${132+Math.sin(t)*r1}L${210+Math.cos(t)*r2} ${132+Math.sin(t)*r2}`,'none',i%2?'#c7a982':'#81b0ac',2.2,'opacity=".8"');}
    return a;
  }
  if(id==='bokeh-lights') {
    let a=base('night');
    for(let i=0;i<18;i++){const x=(i*79+29)%420,y=(i*61+31)%265,r=second?9+i%3:19+i%4*5,c=['#cdb48a','#82aaa0','#c48c86'][i%3];if(second){const points=Array.from({length:7},(_,j)=>`${x+Math.cos(j*Math.PI*2/7)*r},${y+Math.sin(j*Math.PI*2/7)*r}`).join(' ');a+=`<polygon points="${points}" fill="${c}" opacity=".7"/>`;}else a+=circle(x,y,r,c,.62);}
    return a;
  }
  if(id==='light-painting') {
    const grad=`${key}-side`;
    let a=base('night')+ground('#243e34',229)+`<defs><linearGradient id="${grad}"><stop stop-color="#ddc995"/><stop offset=".48" stop-color="#7d8961"/><stop offset="1" stop-color="#2a4537"/></linearGradient></defs>`+vase(second?'#aaac7f':`url(#${grad})`);
    for(let i=0;i<5;i++)a+=p(`M${179+i*13} 121q-12 35-8 87`,'none',second?'#b3b385':'#9c9b6e',1.3);
    if(second)a+=blur(circle(211,150,26,'#fff6c1',.9),7)+rect(192,230,38,14,'#c7be96',3)+p('M210 229v-43','none',gold,2);
    else a+=rect(52,134,41,17,'#b9b99b',3)+p('M93 136 158 111 158 180 93 150Z','#d8ce9a','none',1,'opacity=".16"')+p('M129 92Q108 139 129 192','none',gold,2,'stroke-dasharray="5 5"');
    return a+focus(210,126);
  }
  if(id==='double-exposure') {
    const silhouette=circle(210,91,52,'#6d8b73')+p('M104 265Q117 161 210 159T316 265Z','#6d8b73'),clip=`${key}-silhouette`;
    let a=rect(0,0,420,265,'#c2ccb3')+silhouette+`<defs><clipPath id="${clip}">${silhouette}</clipPath></defs>`;
    let texture=Array.from({length:7},(_,i)=>tree(119+i*31,273,.8+i%2*.35)).join('');
    if(second)texture+=Array.from({length:14},(_,i)=>p(`M100 ${41+i*16}l230 ${i%2?75:-65}`,'none','#d1d8ac',5,'opacity=".65"')).join('');
    a+=g(texture,`clip-path="url(#${clip})"`);
    if(second)a+=p('M115 215 169 132 124 89 207 29 283 99 246 163 311 234','none','#6d8b73',9,'opacity=".6"');
    return a;
  }
  if(id==='panorama-overlap') {
    let a=base()+mountains();
    for(let i=0;i<3;i++)a+=rect(second?15+i*140:18+i*116,42,second?110:164,160,'none',3,`stroke="${['#e0c388','#b8d1b2','#99c4c4'][i]}" stroke-width="3"`);
    if(!second)a+=rect(134,46,48,152,'#e0d69a',0,'opacity=".13"')+rect(250,46,48,152,'#e0d69a',0,'opacity=".13"');
    else a+=p('M136 101v57 M276 101v57','none','#db987d',3,'stroke-dasharray="4 5"');
    return a+tinyLabel(116,239,second?'Missing shared detail':'30–40% overlap');
  }
  if(id==='exposure-bracketing') {
    let a=rect(0,0,420,265,second?'#a7c2bc':'#fff9e0');
    if(second)a+=cloud(54,53)+cloud(264,48)+mountains();
    else a+=alpha(mountains(),.2)+p('M0 215 85 150 164 221 270 160 420 211V265H0Z','#1b332c');
    if(second)a+=p('M15 248 77 209 107 220 140 264Z','#a1ad87')+text(210,242,'−2 EV  +  0 EV  +  +2 EV',12,'#e4dfc0','text-anchor="middle"');
    return a;
  }
  if(id==='focus-stacking') {
    const shell=Array.from({length:8},(_,i)=>ellipse(112+i*28,177-i*8,29,43-i*2,['#c5b68c','#b8aa7b','#d1c49a'][i%3],`transform="rotate(-18 ${112+i*28} ${177-i*8})" stroke="#788466" stroke-width="1.5"`)).join('');
    let a=base('wild')+ground('#57734e',225);
    a+=second?shell:blur(shell,3);
    if(!second)a+=ellipse(196,153,29,37,'#c5b68c','transform="rotate(-18 196 153)" stroke="#788466" stroke-width="1.5"')+rect(186,65,19,160,'#e2d595',0,'opacity=".15"');
    return a+focus(196,142)+(second?focus(113,176)+focus(291,112):'');
  }
  if(id==='timelapse-clouds') {
    let a=rect(0,0,420,265,'#496c60');
    for(let i=0;i<3;i++){
      const x=15+i*137,cx=second?12+i*30:24+i*12;
      const mini=rect(0,0,115,150,'#9fbdb1',4)+p('M0 113 30 74 55 111 78 66 115 111V150H0Z','#4e7765')+g(cloud(cx,37),'transform="scale(.8)"')+text(7,140,`FRAME ${i+1}`,9,'#dce6d0');
      a+=g(mini,`transform="translate(${x} 35)"`);
    }
    a+=p('M20 222H397','none','#9fb799',1.5);
    for(let i=0;i<(second?4:9);i++)a+=rect(25+i*(second?110:43),211,second?16:24,22,gold,2);
    return a+tinyLabel(25,255,second?'Larger jumps between captured positions':'Smaller jumps between captured positions');
  }
  if(id==='stroboscopic-flash-sequence') {
    let a=base('night')+ground('#233e34',224);
    const n=second?13:6,step=second?22:57;
    for(let i=0;i<n;i++){
      const x=second?75+i*22:58+i*57,y=153-Math.sin(i/(n-1)*Math.PI)*54;
      a+=circle(x,y,19,cream,second?.52:.88)+p(`M${x-9} ${y-8}q9-7 16 0`,'none','#f3e9c9',1.5);
    }
    a+=p('M28 224h363','none','#77957c',1.5);
    for(let i=0;i<(second?12:6);i++)a+=p(`M${42+i*(second?30:60)} 223v-15`,'none',gold,2);
    return a+tinyLabel(26,249,second?'More pulses, smaller distance between copies':'Fewer pulses, clearer separate copies');
  }
  return null;
}
