/**
 * Fieldframe nature diagrams. Original schematic artwork; never capture metadata.
 * Each 420 × 265 panel intentionally renders its comparison's actual consequence.
 * In particular: motion is applied only to moving subjects; a fixed rock/trunk stays
 * sharp, lunar illumination is masked geometrically, and reflections are mirrored.
 */
const NATURE_IDS = new Set([
  'milky-way','pinpoint-stars','star-trails','full-moon','moon-terminator',
  'moon-landscape','aurora','meteor-shower','noctilucent-clouds','lunar-eclipse',
  'partial-solar-eclipse','earthshine','sunrise-water-reflection','sunset-silhouettes',
  'backlit-grasses','blue-hour-coast','sunburst','sunrise-sea-mist','sunset-clouds',
  'golden-hour-dunes','mountain-vista','layered-ridges','forest-canopy',
  'foreground-depth','fog-layers','snow-landscape','desert-midday','beach-patterns',
  'lake-reflection','rainbow','lightning-from-shelter','storm-clouds','waterfall-silk',
  'stream-texture','fountain-droplets','breaking-waves','rain-streaks',
  'long-exposure-seascape','water-reflection-abstract','boat-on-water',
]);

export function drawNature(s, label, index, h) {
  if (!NATURE_IDS.has(s.id)) return null;
  const {rect,p,circle,text,focus,person} = h;
  const id = `nature-${s.id}-${index}`;
  const first = index === 0;
  const ink = '#142f31', cream = '#f0e4c6', gold = '#efd38b';
  const blue = '#8db7c4', water = '#456f79', pale = '#cce2dc';
  const defs = `<defs><filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter><filter id="${id}-haze"><feGaussianBlur stdDeviation="1.6"/></filter><clipPath id="${id}-bounds"><rect width="420" height="265"/></clipPath></defs>`;
  const soft = str => `<g filter="url(#${id}-soft)">${str}</g>`;
  const haze = str => `<g filter="url(#${id}-haze)">${str}</g>`;
  const group = (str,extra='') => `<g ${extra}>${str}</g>`;
  const note = (msg, x=210, y=245, color=cream) => text(x,y,msg,12,color,'text-anchor="middle"');
  const topNote = msg => rect(12,10,396,26,'#132f35',5,'opacity=".78"')+note(msg,210,28);
  const arrow = (x1,y1,x2,y2,color=gold,w=2) => {
    const a=Math.atan2(y2-y1,x2-x1),r=8;
    return p(`M${x1} ${y1}L${x2} ${y2}`,'none',color,w)+p(`M${x2-r*Math.cos(a-.5)} ${y2-r*Math.sin(a-.5)}L${x2} ${y2} ${x2-r*Math.cos(a+.5)} ${y2-r*Math.sin(a+.5)}`,'none',color,w);
  };
  const sky = (kind='day') => rect(0,0,420,265,`url(#${kind})`);
  const ridge = (color='#213e42',y=202) => p(`M0 ${y+13} 47 ${y-12} 92 ${y+3} 149 ${y-31} 202 ${y-17} 271 ${y-44} 332 ${y-8} 384 ${y-19} 420 ${y+2}V265H0Z`,color);
  const nearRock = (x=68,y=207,k=1) => group(p('M-40 24-31-5 2-23 36-8 46 25Z','#667a75')+p('M-31-5 2-23 18-6-4 7Z','#9da996')+p('M18-6 36-8 46 25 8 25Z','#425956'),`transform="translate(${x} ${y}) scale(${k})"`);
  const tree = (x,y,k=1,c='#183d37') => group(p('M0 0V-78 M0-25-29-45 M0-40 25-57 M0-55-17-72 M0-64 15-84','none',c,5)+p('M-34-37-23-53-35-62-12-64-20-80-2-75 7-94 21-75 38-67 25-52 37-39 15-38 4-31Z',c),`transform="translate(${x} ${y}) scale(${k})"`);
  const mountainScene = (near='#426665',far='#7e9990') =>
    p('M0 168 67 101 121 153 211 61 300 147 350 103 420 158V220H0Z',far)+
    p('M0 198 82 145 160 184 235 123 318 189 390 149 420 174V265H0Z',near)+
    p('M177 96 211 61 248 99 224 87 213 99 201 86 190 104Z','#d8daca');
  const starPositions = Array.from({length:32},(_,i)=>({x:15+(i*83+19)%391,y:47+(i*47+13)%142,r:i%5===0?1.6:.9,c:i%7===0?'#d9b593':i%6===0?'#a6c9e4':'#e4e6d3'}));
  const stars = (trail=false,positions=starPositions) => positions.map((q,i)=>trail?
    p(`M${q.x-4} ${q.y-2}l${8+i%3*2} ${3+i%2}`,'none',q.c,1.25,'opacity=".86"'):
    circle(q.x,q.y,q.r,q.c,.72+(i%3)*.1)).join('');
  const moon = ({x=210,y=128,r=73,phase='full',tone='#d5d3ba',detail=true,earth=false}={}) => {
    const mid=`${id}-moon-${phase}`;
    let mask = circle(x,y,r,'white');
    if(phase==='quarter') mask=rect(x,y-r,r,2*r,'white');
    if(phase==='crescent') mask+=circle(x-r*.32,y-r*.03,r,'black');
    if(phase==='partial') mask+=circle(x-r*.55,y-r*.4,r*.97,'black');
    let result=`<defs><clipPath id="${mid}-disc">${circle(x,y,r,'white')}</clipPath><mask id="${mid}-lit">${rect(x-r-2,y-r-2,2*r+4,2*r+4,'black')}${mask}</mask></defs>`;
    if(earth) result+=circle(x,y,r,'#586668');
    const terrain=detail?Array.from({length:13},(_,i)=> {
      const q=(i*2.399),cr=r*(.2+(i%4)*.15),cx=x+Math.cos(q)*cr,cy=y+Math.sin(q)*cr;
      return circle(cx,cy,(4+(i%4)*3)*r/73,'#758983',.37)+p(`M${cx-4} ${cy+1}q5 4 10-1`,'none','#e1dbc1',.8,'opacity=".35"');
    }).join(''):'';
    if(earth&&detail)result+=group(terrain,`clip-path="url(#${mid}-disc)" opacity=".32"`);
    result+=group(circle(x,y,r,tone)+terrain,`clip-path="url(#${mid}-disc)" mask="url(#${mid}-lit)"`);
    if(phase==='quarter'&&detail)result+=Array.from({length:5},(_,i)=>p(`M${x+8+i%2*3} ${y-r+27+i*23}l${12+i%3*3} -4`,'none','#4d6563',3)).join('');
    return result;
  };
  const boat = (x=210,y=183,k=1,c=cream) => group(p('M-54 0H53L35 23H-34Z',c)+rect(-18,-29,47,28,'#b5c2af',3)+rect(-10,-24,12,15,'#2c515b',2)+rect(9,-24,12,15,'#2c515b',2)+p('M-2-29V-47','none',c,2),`transform="translate(${x} ${y}) scale(${k})"`);
  const shoreWater = () => rect(0,142,420,123,water)+p('M0 150Q70 132 133 151T264 151T420 146','none','#bdc9ad',2);
  const clouds = (clip=false,storm=false) => {
    let out='';
    const colors=storm?['#607d84','#78959a','#98afb0']:['#bf8d81','#d9a187','#e5bb8d'];
    for(let i=0;i<3;i++){
      const d=`M-10 ${60+i*35}Q35 ${35+i*33} 80 ${58+i*32} 135 ${25+i*38} 189 ${54+i*34} 245 ${34+i*31} 305 ${60+i*33} 364 ${40+i*32} 435 ${67+i*35}L435 ${85+i*35}Q310 ${79+i*35} 212 ${80+i*35}T-10 ${85+i*35}Z`;
      out+=p(d,clip?(storm?'#142d37':'#ffdec0'):colors[i]);
      if(!clip)out+=p(`M10 ${65+i*35}Q110 ${42+i*35} 210 ${66+i*35}T410 ${64+i*35}`,'none',storm?'#b3c1b9':'#f4cc9a',2.5,'opacity=".65"');
    }return out;
  };
  let a=defs;
  switch(s.id){
    case 'milky-way': {
      a+=sky('night');
      a+=soft(p('M75-20Q156 70 286 172','none','#c3bbc4',43,'opacity=".2"'));
      a+=p('M98-10Q173 85 276 174','none','#d9d0be',13,'opacity=".15"');
      a+=stars(!first)+ridge();
      if(first)a+=focus(starPositions[8].x,starPositions[8].y);
      a+=topNote(first?'Check enlarged star cores':'Earth rotation stretches every star');
      a+=note('Tripod and foreground stay fixed');break;
    }
    case 'pinpoint-stars': {
      const pts=[{x:92,y:106,r:2.2,c:'#e5d8bc'},{x:155,y:81,r:1.6,c:'#a9cae4'},{x:208,y:101,r:2.4,c:'#dfb28e'},{x:253,y:141,r:1.6,c:'#dbdfd2'},{x:201,y:190,r:1.9,c:'#a9cae4'},{x:132,y:174,r:2,c:'#e8dfca'},{x:74,y:205,r:1.5,c:'#dbdfd2'},{x:319,y:75,r:1.3,c:'#dbdfd2'},{x:340,y:202,r:2,c:'#dfb28e'}];
      a+=sky('night')+stars(!first,pts);
      if(first)a+=focus(208,101);else a+=arrow(269,174,304,189,blue);
      a+=topNote(first?'Colour and small cores remain visible':'Same stars, excessive exposure time');
      a+=note(first?'Use actual focal length in the star estimator':'Shorten time; then recover brightness with ISO');break;
    }
    case 'star-trails': {
      a+=sky('night');
      for(let i=0;i<11;i++){
        const r=22+i*18;
        a+=p(`M${120+r*.94} ${103-r*.342} A${r} ${r} 0 1 1 ${120-r*.94} ${103-r*.342}`,'none',i%3===0?'#c0d3df':'#e1d8be',1.5,first?'opacity=".85"':'stroke-dasharray="13 8" opacity=".85"');
      }
      a+=circle(120,103,2,gold)+ridge('#17363c',222);
      a+=topNote(first?'Successive frames join into continuous arcs':'Gaps remove pieces of every trail');
      a+=note('Long total sequence · fixed framing and focus');break;
    }
    case 'full-moon': {
      a+=sky('night')+moon({detail:first,tone:first?'#d5d3ba':'#fff5d6'});
      if(first)a+=focus(184,110);else a+=p('M289 61l17-28 17 28Z','none',gold,2)+text(306,54,'!',16,gold,'text-anchor="middle"');
      a+=topNote(first?'Terrain remains below clipping':'Too much exposure erases the terrain');
      a+=note('Sunlit Moon against an intentionally dark sky');break;
    }
    case 'moon-terminator': {
      a+=sky('night')+moon({phase:first?'quarter':'full'});
      if(first)a+=arrow(105,130,206,130,gold)+text(104,115,'Terminator',12,gold);
      a+=topNote(first?'Low-angle sunlight casts crater shadows':'Frontal sunlight gives flatter relief');
      a+=note('Phase orientation varies with location and time');break;
    }
    case 'earthshine': {
      a+=sky('night')+moon({phase:'crescent',earth:!first,detail:!first,tone:first?'#e1dbc1':'#fff0cd'});
      a+=topNote(first?'Short exposure favours the sunlit crescent':'Longer exposure reveals the faint hemisphere');
      if(!first)a+=arrow(83,157,150,157,blue)+text(44,143,'Earthshine',12,pale);
      a+=note(first?'The faint side may disappear into the sky':'Bright crescent may clip; bracket for a blend');break;
    }
    case 'lunar-eclipse': {
      a+=sky('night');
      a+=moon(first?{tone:'#bb755b'}:{phase:'partial',tone:'#dfddc2',earth:true});
      a+=topNote(first?'Faint red light during totality':'Direct sunlight returns at the bright limb');
      a+=note(first?'More exposure; watch lunar motion':'Reduce exposure promptly as sunlight returns');break;
    }
    case 'moon-landscape': {
      a+=sky(first?'sunset':'night');
      a+=moon({x:278,y:93,r:22,tone:'#e4debe'});
      a+=ridge(first?'#6d8880':'#102832',212)+tree(246,224,.94,first?'#2c514a':'#091d26');
      if(first)a+=p('M0 242Q90 211 171 240T420 234','none','#a0ae91',2);
      a+=topNote(first?'Twilight keeps the landmark readable':'Moon and land have a larger brightness gap');
      a+=focus(255,151)+note('Keep viewpoint and lunar scale consistent');break;
    }
    case 'aurora': {
      a+=sky('night')+stars();
      let curtain='';
      for(let i=0;i<45;i++){
        const x=25+i*8.3,y=92+Math.sin(i*.17)*25;
        curtain+=p(`M${x} ${y}q${6*Math.sin(i)} -${24+i%7*4} ${3*Math.cos(i)} -${46+i%6*8}`,'none',i%4===0?'#c7c2d2':'#93d4af',first?2.5:8,`opacity="${first?.25+(i%5)*.1:.12}"`);
      }
      a+=first?curtain:soft(curtain+p('M15 98Q95 145 195 80T420 102','none','#9ed9b0',36,'opacity=".23"'));
      a+=ridge('#1e3a40',220)+topNote(first?'Short shutter retains narrow folds':'Long capture averages the moving curtains');
      a+=note('Stars can stay sharp while the aurora smears');break;
    }
    case 'meteor-shower': {
      a+=sky('night')+stars()+ridge('#233f42',220);
      if(first)a+=p('M296 54 166 148','none','#b7d1d0',1,'opacity=".45"')+p('M280 66 182 136','none','#edf0d7',2)+circle(182,136,2,'#f7e9c5');
      a+=topNote(first?'Frame with a brief meteor':'Adjacent frame: the same stars remain');
      a+=note('Repeat with minimal gaps; aperture helps transients');break;
    }
    case 'noctilucent-clouds': {
      a+=sky('night');
      for(let i=0;i<11;i++){
        const y=59+i*9;
        a+=p(`M-10 ${y}Q65 ${y-19} 144 ${y+3}T277 ${y-4}T430 ${y+8}`,'none',first?'#b4d7e4':'#eaf3e3',first?1.7:10,`opacity="${first?.7:.9}"`);
        if(first)a+=p(`M25 ${y+4}Q150 ${y-14} 284 ${y+9}T430 ${y-4}`,'none','#6f9dad',.9,'opacity=".5"');
      }
      if(!first)a+=p('M-10 59Q65 40 144 62T277 55T430 67L430 167Q277 137 144 162T-10 149Z','#edf4e5');
      a+=p('M0 191Q40 159 103 181 157 153 208 185 288 159 344 181 387 168 420 193V220H0Z','#344e59')+ridge('#173239',236);
      a+=topNote(first?'Fine silver ripples against twilight':'Overexposure erases the ripple structure');break;
    }
    case 'partial-solar-eclipse': {
      a+=sky('day');
      a+=circle(74,92,36,'#f0c47b')+circle(57,77,33,'#496a75');
      const x=254;
      a+=rect(x,130,79,54,'#274a4d',7)+rect(x+14,119,29,14,'#274a4d',3)+rect(x-42,142,43,30,'#47686a',4)+rect(x-51,133,11,48,first?'#9ac6ab':'#b77c6a',2);
      a+=p(`M${x+40} 184v37m0-8-25 30m25-30 25 30`,'none','#274a4d',3);
      a+=arrow(115,98,196,143,first?'#5e816d':'#a36658');
      if(first){a+=p('M201 146l4 5 10-12','none','#d9e3c7',2.5)+arrow(212,202,208,177,'#2d5d4d');a+=text(105,220,'Front solar filter',13,'#244e47');}
      else{a+=p('M194 135l32 43m0-43-32 43','none','#ffd4b0',5)+text(210,255,'Never aim this setup at the Sun',12,'#4b2d2c','text-anchor="middle"');}
      a+=topNote(first?'Purpose-made filter covers the front objective':'Ordinary photographic ND is NOT protection');break;
    }
    case 'sunrise-water-reflection': {
      a+=sky('sunset')+p('M0 143 74 135 133 145 202 133 271 140 343 134 420 143V151H0Z','#3b5c59');
      a+=circle(246,126,15,'#e9c990')+shoreWater();
      for(let i=0;i<16;i++){
        const y=154+i*6,x=194-i*4;
        a+=p(first?`M${x} ${y}l17-2 8 3 16-2 12 2 22-1`:`M${x-5} ${y}q58-4 104 0`,'none',i%3?'#dfba8f':'#af9ca0',first?2:5,`opacity="${first?.8:.65}"`);
      }
      a+=topNote(first?'Short exposure retains reflective facets':'Longer exposure blends small ripples');break;
    }
    case 'sunset-silhouettes': {
      a+=sky('sunset')+circle(294,124,24,'#f4d99e',.9)+ridge('#31534e',248);
      if(first){a+=person(193,191,1.35,'#163530');a+=arrow(86,161,146,148,gold);}
      else{a+=person(189,191,1.35,'#163530')+person(211,195,1.3,'#163530')+tree(250,244,1.28,'#163530');}
      a+=topNote(first?'Leave clear sky around defining edges':'Overlapping shapes become one dark mass');break;
    }
    case 'backlit-grasses': {
      a+=rect(0,0,420,265,first?'#294a41':'#64776a');
      for(let j=0;j<3;j++){
        const x=126+j*84,y=112+j%2*37,col=first?'#e7d59b':'#9f996c';
        a+=p(`M${x-12} 265Q${x+21} 183 ${x} ${y}`,'none',first?'#bca979':'#687353',2.5);
        for(let i=0;i<13;i++){
          const cy=y+i*4;
          a+=p(`M${x} ${cy+7}l${-21-i%3*4} -${13-i%3*2} M${x} ${cy+7}l${18+i%4*3} -${14-i%3}`,'none',col,first?1.3:2);
        }
      }
      a+=circle(first?70:351,62,15,first?'#f3da9e':'#cdbf92',.8);
      a+=topNote(first?'Translucent edges glow against shade':'Front light gives more uniform surfaces');
      a+=focus(210,151);break;
    }
    case 'blue-hour-coast':
    case 'long-exposure-seascape': {
      const long=s.id==='long-exposure-seascape';
      a+=sky('night')+rect(0,125,420,140,'#527b87')+p('M0 126H420','none','#9db2b8',1);
      if(first){for(let i=0;i<11;i++)a+=p(`M${-25+i*41} ${155+i%4*22}q35-18 85-1t90-4`,'none','#b2d1d5',1.7+(i%3)*.5,'opacity=".65"');}
      else{for(let i=0;i<7;i++)a+=soft(p(`M-20 ${151+i*16}q240-9 460 0`,'none','#bdd6d8',7,'opacity=".16"'));}
      a+=nearRock(99,215,1.15)+nearRock(301,181,.65);
      if(long)a+=p('M303 146h93 M321 146v71m24-71v64m24-64v56m24-56v48','none','#2c4a52',6);
      a+=focus(98,207)+topNote(first?'Water lines reveal the direction of movement':'Moving water smooths; fixed structures stay crisp');break;
    }
    case 'sunburst': {
      a+=sky('sunset')+ridge('#49685a',224);
      const x=230,y=111;
      if(first){
        a+=rect(179,0,48,265,'#28463a');
        for(let i=0;i<12;i++){const t=i*Math.PI/6;a+=p(`M${x+Math.cos(t)*5} ${y+Math.sin(t)*5}L${x+Math.cos(t)*50} ${y+Math.sin(t)*50}`,'none','#ffe5ac',1.2);}
        a+=circle(x,y,4,'#fff0c7')+p('M227 69V155','none','#6f8665',2);
      }else{a+=rect(125,0,38,265,'#28463a')+soft(circle(x,y,64,'#f1d29b',.48))+circle(x,y,26,'#ffe5b2')+circle(301,177,20,'#e3bf9a',.18);}
      a+=topNote(first?'Almost hidden source: a tiny bright gap':'A larger bright source produces more glare');
      a+=note('Brief screen framing; never look through unfiltered optics');break;
    }
    case 'sunrise-sea-mist':
    case 'layered-ridges': {
      const mist=s.id==='sunrise-sea-mist';
      a+=sky(mist?'sunset':'day');
      const cols=first?['#a8b8b3','#849e99','#5f827d','#345f59']:['#75999a','#456a72','#254d57','#103641'];
      for(let i=0;i<4;i++)a+=p(`M0 ${128+i*32} 38 ${117+i*31} 102 ${92+i*35} 165 ${122+i*31} 228 ${101+i*33} 306 ${133+i*26} 370 ${99+i*35} 420 ${115+i*32}V265H0Z`,cols[i]);
      if(mist){a+=rect(0,199,420,66,first?'#a1b1a2':'#326570');a+=boat(210,221,.48,'#274940');}
      a+=topNote(first?'Contrast fades progressively with distance':'Heavy contrast makes the layers look cut out');break;
    }
    case 'sunset-clouds': {
      a+=sky('sunset')+clouds(!first)+ridge('#274947',239);
      a+=topNote(first?'Warm colour and cloud texture survive':'Clipped colour channels flatten the cloud');
      a+=note(first?'Inspect bright red and orange cloud patches':'Lower exposure before colour detail disappears');break;
    }
    case 'golden-hour-dunes': {
      a+=sky('sunset');
      a+=p('M0 182Q107 88 230 154T420 127V265H0Z',first?'#a67c5c':'#c5a67a');
      a+=p('M0 182Q91 128 230 154L101 209Z',first?'#e3c08a':'#ceb184');
      a+=p('M0 249Q124 135 266 218T420 203V265H0Z',first?'#c3a078':'#c4a77b');
      a+=p('M0 249Q120 177 266 218L170 265H0Z',first?'#efd2a0':'#d0b587');
      if(first)a+=p('M52 207Q134 174 213 198','none','#f0d8a9',2)+arrow(50,60,130,105,gold);
      else a+=circle(209,66,14,'#e3cea3');
      a+=topNote(first?'Low side light creates long shape-defining shadows':'Frontal light weakens the shadow relief');break;
    }
    case 'mountain-vista': {
      a+=sky()+mountainScene();
      a+=p('M0 228Q100 197 204 224T420 218V265H0Z','#547b60');
      a+=p('M150 265Q225 233 193 214T226 190','none','#c3b291',first?14:8);
      if(!first)a+=tree(107,276,2.05,'#204c3c')+tree(299,292,2.4,'#214a3b')+p('M-20 217Q111 137 269 208T430 179','none','#224a3e',21);
      a+=topNote(first?'A clear foreground route leads toward the peak':'Foreground clutter competes with the mountain');break;
    }
    case 'forest-canopy': {
      a+=rect(0,0,420,265,'#6e8c72');
      for(let i=0;i<8;i++)a+=rect(i*61-13,0,14+i%3*4,265,i%2?'#3e6650':'#55735a');
      const leaves=Array.from({length:36},(_,i)=>{
        const x=(i*71)%420,y=50+(i*39)%149;
        return p(`M${x} ${y}q-12-15-23-2 13 15 23 2q12-14 25-2-14 15-25 2Z`,i%3?'#a6b88c':'#d0c58e');
      }).join('');
      a+=first?leaves:haze(group(leaves,'transform="translate(-4 0)" opacity=".6"')+leaves+group(leaves,'transform="translate(5 0)" opacity=".6"'));
      a+=p('M0 247Q155 209 420 235V265H0Z','#314e3e');
      a+=rect(193,0,27,265,'#365343')+p('M200 55v43m12 39v47m-12 18v35','none','#80917a',2);
      a+=focus(207,161)+topNote(first?'Still foliage and fixed trunks can both stay sharp':'Wind blurs leaves while the trunk stays sharp');break;
    }
    case 'foreground-depth': {
      a+=sky();
      const far=mountainScene('#537877','#88a59c');
      a+=first?far:soft(far);
      a+=nearRock(112,220,1.55)+focus(112,211);
      if(first)a+=focus(209,72)+arrow(174,176,213,109,gold);else a+=text(292,110,'Far detail soft',12,cream);
      a+=topNote(first?'Verify both the near rock and distant peak':'Near focus alone does not prove enough depth');break;
    }
    case 'fog-layers': {
      a+=rect(0,0,420,265,first?'#d3dace':'#707d7b');
      a+=tree(327,196,1.1,first?'#bccac0':'#697975')+tree(246,216,1.2,first?'#9fb4a6':'#5e746a')+tree(114,242,1.8,first?'#355c4a':'#294b3e');
      a+=p('M0 251Q150 224 420 240V265H0Z',first?'#b5c5b6':'#5f756a');
      a+=focus(117,132)+topNote(first?'Luminous fog with one distinct near anchor':'Underexposure makes the mist dull grey');break;
    }
    case 'snow-landscape': {
      a+=sky();
      a+=p('M0 170 81 102 153 172 241 81 339 173 420 125V265H0Z',first?'#e3e8dc':'#fffbe9');
      a+=p('M0 236Q80 163 186 221T420 199V265H0Z',first?'#eef0e2':'#fffbe9');
      if(first){a+=p('M81 102 114 184 160 218 92 201Z','#9fb8bb')+p('M241 81 266 160 305 197 250 173Z','#afc2c1');for(let i=0;i<6;i++)a+=p(`M${27+i*56} ${231+i%2*8}q19-7 40-4`,'none','#b8c9c7',1.5);}
      a+=tree(333,244,.82,'#345649')+topNote(first?'Bright snow still shows ridges and small shadows':'Clipped snow loses its surface texture');break;
    }
    case 'desert-midday': {
      a+=sky()+p('M0 184Q158 119 420 166V265H0Z','#d2bc8e');
      const rock=p('M137 171 150 85 188 67 251 81 275 174Z','#9c8365')+p('M188 67 206 100 205 174H137L150 85Z','#c3a880')+p('M205 174 275 174 344 215 211 198Z','#745f51');
      if(first)a+=rock;
      else{a+=haze(rock);for(let i=0;i<6;i++)a+=p(`M${137+i%2*3} ${105+i*15}q70-8 136 0`,'none','#d9c399',3,'opacity=".35"');a+=p('M126 165q9-15 2-29t2-28 M282 163q-8-15 2-29t-2-28','none','#d7b88a',2,'opacity=".6"');}
      a+=topNote(first?'Near rock and hard shadow give crisp graphic shapes':'Hot moving air distorts distant detail');
      a+=note(first?'Use the shadow as part of the composition':'A faster shutter cannot remove severe heat haze',210,245,'#473f35');break;
    }
    case 'beach-patterns': {
      a+=rect(0,0,420,265,'#c8b58f');
      for(let i=0;i<12;i++){
        const y=38+i*19,d=`M-15 ${y}Q102 ${y-22} 214 ${y+5}T435 ${y-7}`;
        a+=p(d,'none',first?'#9b875f':'#c1ae8a',first?6:1.7);
        if(first)a+=p(`M-15 ${y-4}Q102 ${y-26} 214 ${y+1}T435 ${y-11}`,'none','#ebd7ae',2);
      }
      a+=p('M239 154q-23-29-39 0l20 15Z','#e2d5b6','#9f8e73',1)+p('M220 166v-29m0 29-11-24m11 24 11-24','none','#ac9a78',1);
      a+=focus(219,153)+topNote(first?'Side light reveals the ripple relief':'Flat light gives much weaker texture');break;
    }
    case 'lake-reflection': {
      a+=sky();
      const scene=p('M0 147 72 96 128 144 211 57 302 140 359 107 420 148V153H0Z','#527b73')+p('M177 94 211 57 250 99 225 87 210 100 199 86Z','#d7dec7')+tree(324,150,.36,'#29594b');
      a+=scene+rect(0,153,420,112,'#64918f');
      if(first)a+=group(scene,'transform="translate(0 306) scale(1 -1)" opacity=".77"');
      else{
        for(let i=0;i<13;i++){
          const cid=`${id}-waterband-${i}`,y=154+i*8.6;
          a+=`<defs><clipPath id="${cid}">${rect(0,y,420,8.6,'white')}</clipPath></defs>`;
          a+=group(group(scene,`transform="translate(${Math.sin(i*1.8)*16} 306) scale(1 -1)" opacity=".75"`),`clip-path="url(#${cid})"`);
          a+=p(`M0 ${y+2}q52-5 103 0t104 0t104 0t109 0`,'none','#a3c1b7',1.4,'opacity=".5"');
        }
      }
      a+=p('M0 153H420','none','#c4d3bc',1)+focus(211,231)+topNote(first?'Still water preserves the mirrored geometry':'Wind breaks reflected shapes into ripples');break;
    }
    case 'rainbow': {
      a+=rect(0,0,420,265,first?'#3c5b6a':'#b8c5c1');
      a+=p('M0 203 45 181 104 202 158 176 216 204 274 177 335 205 385 183 420 201V265H0Z',first?'#274b47':'#6c8e7b');
      const cols=['#cf8d7a','#d9ad79','#d4cb8d','#99bd9b','#8db3c7','#aaa0c4'];
      cols.forEach((c,i)=>{const r=166-i*4;a+=p(`M${210-r} 194A${r} ${r} 0 0 1 ${210+r} 194`,'none',c,4,`opacity="${first?.85:.3}"`);});
      a+=topNote(first?'A dark background makes the arc easier to see':'A pale background reduces visible contrast');
      a+=note('Sun behind the viewpoint · rain ahead');break;
    }
    case 'lightning-from-shelter': {
      a+=rect(0,0,420,265,first?'#173340':'#708f96')+clouds(false,true);
      a+=p('M232 87 209 129 230 124 196 181 209 142 189 147Z','#f1edcf');
      a+=ridge('#223f44',232);
      a+=rect(286,178,121,71,'#203c40',5)+p('M295 229v-34h53v34Z','none','#b9c8b6',2)+person(320,224,.42,'#d9cba8')+circle(372,205,8,'none')+p('M365 200q12-12 22 0m-18 5q7-7 14 0','none',gold,1.3);
      a+=text(346,244,'REMOTE · SHELTER',9,cream,'text-anchor="middle"');
      a+=topNote(first?'Short window accumulates less sky light':'Longer window brightens ambient sky');
      a+=text(22,235,'Bolt brightness: aperture + ISO',11,cream);break;
    }
    case 'storm-clouds': {
      a+=sky('night')+clouds(!first,true);
      if(first)a+=p('M0 165Q100 131 184 163T420 154','none','#9aafb1',20,'opacity=".48"');
      else a+=p('M0 139Q100 113 184 144T420 131V211H0Z','#162e36');
      a+=ridge('#1a383c',248);
      for(let i=0;i<8;i++)a+=tree(i*57+18,253,.2,'#142f31');
      a+=topNote(first?'Layered cloud tones preserve volume and scale':'Crushed contrast hides the cloud structure');break;
    }
    case 'waterfall-silk': {
      a+=rect(0,0,420,265,'#3d5f50')+p('M0 64 131 44 159 132 139 265H0Z','#4b6853')+p('M285 47 420 71V265H282L262 144Z','#304e42');
      a+=p('M158 54Q172 119 160 194T262 245Q253 165 270 54Z','#7ca39a');
      for(let i=0;i<12;i++){
        const x=166+i*8;
        a+=p(`M${x} 56q${i%2?8:-8} 68 ${i%3*3-4} 137t${i%2?11:-11} 43`,'none',pale,first?1.9:4.5,first?'stroke-dasharray="8 4 16 7 5 4" opacity=".82"':'opacity=".5"');
      }
      a+=nearRock(304,220,1.1)+nearRock(102,194,.7)+focus(303,214);
      a+=topNote(first?'Shorter water strands retain turbulence':'Longer exposure blends the falling ribbons');break;
    }
    case 'stream-texture': {
      const channel='M138 0Q290 57 205 125T338 265H72Q65 184 137 125T90 0Z';
      a+=rect(0,0,420,265,'#446751')+p(channel,'#5e9690');
      a+=`<defs><clipPath id="${id}-channel">${p(channel,'white')}</clipPath></defs>`;
      let current='';
      for(let i=0;i<8;i++){
        current+=p(`M${110+i*8} 40Q${250+i*3} 80 ${167+i*8} 138T${136+i*16} 265`,'none',pale,first?1.6:4,first?'stroke-dasharray="9 9 4 5" opacity=".8"':'opacity=".5"');
      }
      a+=group(current,`clip-path="url(#${id}-channel)"`);
      a+=nearRock(210,165,1.15)+focus(208,157)+topNote(first?'Short separated streaks keep the current energetic':'Longer exposure blends the flow into smooth lines');break;
    }
    case 'fountain-droplets': {
      a+=rect(0,0,420,265,'#254641');
      for(let j=-4;j<=4;j++){
        const x0=210,y0=221,x1=210+j*8,y1=28+Math.abs(j)*5,x2=210+j*35,y2=216;
        if(first){for(let i=1;i<23;i++){const t=i/23,u=1-t,x=u*u*x0+2*u*t*x1+t*t*x2,y=u*u*y0+2*u*t*y1+t*t*y2;a+=circle(x,y,i%4===0?1.8:1.2,'#dbe8d1',.7+(i%3)*.1);}}
        else a+=p(`M${x0} ${y0}Q${x1} ${y1} ${x2} ${y2}`,'none','#c3dece',2.4,'opacity=".8"');
      }
      a+=p('M52 225H368L351 242H69Z','#76968c')+rect(200,213,20,12,'#aeb9a3',2)+focus(250,138);
      a+=topNote(first?'Fast shutter separates individual beads':'Slow shutter joins droplets into continuous arcs');break;
    }
    case 'breaking-waves': {
      a+=sky()+rect(0,139,420,126,'#426e79');
      const wave=p('M30 245Q112 223 137 169 162 113 215 137 254 163 215 184 232 157 203 151 182 179 179 222 278 242H420V265H30Z','#8cbcb7')+p('M97 221Q132 197 145 166 171 124 210 145 234 160 214 178','none','#dce4cf',4);
      if(first){a+=wave;for(let i=0;i<30;i++){const x=133+(i*19)%122,y=95+(i*31)%79;a+=circle(x,y,i%4===0?2:1.2,'#e9eed6',.85);}}
      else{a+=haze(wave);for(let i=0;i<7;i++)a+=p(`M${71+i*9} ${223-i*6}q50-82 115-64t${88+i*9} 58`,'none','#c8ded1',3,'opacity=".5"');}
      a+=nearRock(356,244,.62)+topNote(first?'Short shutter suspends individual spray droplets':'Longer exposure turns spray into sweeping movement');break;
    }
    case 'rain-streaks': {
      a+=rect(0,0,420,265,'#294640')+rect(284,65,68,130,'#506e59',5)+p('M40 215h341 M74 214v35m273-35v35','none','#9b9f7f',5);
      a+=p('M48 0 158 265H249L75 0Z','#d5d6ac','none',2,'opacity=".1"');
      for(let i=0;i<48;i++){const x=(i*83)%440,y=41+(i*37)%181,len=first?6:33;a+=p(`M${x} ${y}l${-len*.34} ${len}`,'none','#d1dfcd',first?1.6:1.2,`opacity="${.35+i%4*.13}"`);}
      a+=focus(300,151)+topNote(first?'Fast exposure leaves short rain dashes':'Longer time stretches drops into rain lines');
      a+=note('The supported static subject stays sharp');break;
    }
    case 'water-reflection-abstract': {
      a+=rect(0,0,420,265,'#365e68');
      const colors=['#c8af83','#a1787a','#79a69c','#d0b995','#648f9d'];
      let shapes='';
      for(let j=0;j<10;j++)for(let i=0;i<13;i++){
        const x=j*44+Math.sin(i*.9+j)*12,y=i*22;
        shapes+=p(`M${x-18} ${y}q${24+i%3*8} -7 38 2l${-8+i%3*5} 9q-18 5-38-1Z`,colors[j%5],'none',0,`opacity="${.5+j%3*.18}"`);
      }
      a+=first?shapes:soft(shapes);
      if(!first)for(let j=0;j<6;j++)a+=soft(p(`M${j*75} 0q35 98 6 265`,'none',colors[j%5],19,'opacity=".25"'));
      a+=topNote(first?'Fast capture preserves each ripple fragment':'Slower capture blends changing reflected colour');break;
    }
    case 'boat-on-water': {
      a+=sky()+rect(0,147,420,118,'#557e83');
      let background='';
      for(let i=0;i<10;i++)background+=tree(i*49+3,147,.6+i%2*.14,'#527f65');
      if(first)a+=background;else{a+=haze(background);for(let i=0;i<8;i++)a+=p(`M0 ${80+i*10}H420`,'none','#a3bba2',3,'opacity=".38"');}
      for(let i=0;i<11;i++)a+=p(`M${i*49%420-25} ${166+i%4*22}q${first?13:50} -4 ${first?29:110} 0`,'none','#aac9c1',first?1.3:2,'opacity=".6"');
      a+=p(first?'M12 202q75-17 151-1 M41 219q63-19 123-11':'M-20 205q100-12 184-2 M-20 218q110-8 184-11','none','#d4e1cd',first?2:4,'opacity=".6"');
      a+=boat(220,183,1,'#e1d1a5')+focus(222,163)+arrow(286,191,373,191,gold);
      a+=topNote(first?'Fast shutter defines boat, water and wake':'Pan with the boat: surroundings streak horizontally');
      a+=note('Keep focus on the solid boat · leave space ahead');break;
    }
    default:return null;
  }
  return `<g clip-path="url(#${id}-bounds)">${a}</g>`;
}
