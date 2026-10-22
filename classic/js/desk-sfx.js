
/* ============================================================
   DESK SOUND EFFECTS
   Every object has its own sound, all synthesised live with the Web Audio API (no audio files).
   - click / open  : a unique signature per object (skills each get their own, by name)
   - hover         : a very quiet note, a different pitch for every object
   - drag          : lift sound, a friction "slide" that follows your speed, and a drop sound
                     (material-based: paper, card, ceramic, metal, wood, plastic, plush ...)
   - extras        : lamp switch, dustbin, bin sweep / restore, coffee spill / wipe, laptop notification
   Sounds pan left/right with the object's position on the desk.
   Use the "Sound" button in the toolbar to mute. Nothing plays until the first click or key press.
   ============================================================ */
(function(){
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC||typeof items==='undefined')return;

let ctx=null,out=null,nbuf=null,curPan=0,vs=1,enabled=true,unlocked=false,offline=false;
try{enabled=localStorage.getItem('deskSfx')!=='off'}catch(e){}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rnd=(a,b)=>a+Math.random()*(b-a);
const H=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const gates={};const gate=(k,ms)=>{const n=performance.now();if(gates[k]&&n-gates[k]<ms)return false;gates[k]=n;return true};

/* ---------- engine ---------- */
function init(c){
 ctx=c||new AC();
 const comp=ctx.createDynamicsCompressor();
 comp.threshold.value=-16;comp.knee.value=20;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.25;
 out=ctx.createGain();out.gain.value=.85;out.connect(comp);comp.connect(ctx.destination);
 nbuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*2),ctx.sampleRate);
 const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
const ready=()=>{
 if(!enabled)return false;
 if(!ctx){if(!unlocked)return false;init()}
 if(!offline&&ctx.state==='suspended')ctx.resume();
 return true};
const unlock=()=>{unlocked=true;if(enabled){if(!ctx)init();if(!offline&&ctx.state==='suspended')ctx.resume()}};
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));

const T0=()=>ctx.currentTime+.006;
function route(n){
 if(ctx.createStereoPanner&&curPan){const p=ctx.createStereoPanner();p.pan.value=curPan;n.connect(p);p.connect(out)}
 else n.connect(out)}
function env(g,t,a,d,v){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(v,.0002),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function lfo(os,t,len,vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=vib.r;lg.gain.value=vib.d;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+len)}

function tone(o){
 const t=T0()+(o.t||0),a=o.a==null?.004:o.a,d=o.d||.15,v=(o.v==null?.2:o.v)*vs;
 const os=ctx.createOscillator();os.type=o.type||'sine';
 os.frequency.setValueAtTime(o.f,t);
 if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.glide||d));
 if(o.det)os.detune.value=o.det;
 const g=ctx.createGain();env(g,t,a,d,v);
 let n=os;if(o.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);n=f}
 n.connect(g);route(g);
 if(o.vib)lfo(os,t,a+d+.05,o.vib);
 os.start(t);os.stop(t+a+d+.05);
}
function noise(o){
 const t=T0()+(o.t||0),a=o.a==null?.003:o.a,d=o.d||.1,v=(o.v==null?.15:o.v)*vs;
 const s=ctx.createBufferSource();s.buffer=nbuf;s.loop=true;
 const f=ctx.createBiquadFilter();f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||2000,t);
 if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 f.Q.value=o.q==null?1:o.q;
 const g=ctx.createGain();env(g,t,a,d,v);
 s.connect(f);f.connect(g);route(g);
 s.start(t,Math.random()*1.5);s.stop(t+a+d+.05);
}
function bell(f,o){o=o||{};
 const t=T0()+(o.t||0),d=o.d||1,v=(o.v==null?.12:o.v)*vs,ratio=o.ratio||2.76,idx=o.idx||f*1.1;
 const c=ctx.createOscillator(),m=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();
 c.frequency.value=f;m.frequency.value=f*ratio;
 mg.gain.setValueAtTime(idx,t);mg.gain.exponentialRampToValueAtTime(1,t+d*.8);
 m.connect(mg);mg.connect(c.frequency);c.connect(g);env(g,t,.002,d,v);route(g);
 c.start(t);m.start(t);c.stop(t+d+.05);m.stop(t+d+.05);
}
/* a simple "voice": pitch and formant keyframes [[time,hz],...] */
function voice(o){
 const t=T0()+(o.t||0),d=o.d||.5,v=(o.v||.3)*vs;
 const os=ctx.createOscillator();os.type=o.type||'sawtooth';
 o.p.forEach((k,i)=>os.frequency[i?'linearRampToValueAtTime':'setValueAtTime'](k[1],t+k[0]));
 const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=o.q||4;
 o.fm.forEach((k,i)=>f.frequency[i?'linearRampToValueAtTime':'setValueAtTime'](k[1],t+k[0]));
 const g=ctx.createGain();
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+(o.a||.05));
 g.gain.setValueAtTime(v,t+d*.55);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 os.connect(f);f.connect(g);route(g);
 if(o.vib)lfo(os,t,d+.05,o.vib);
 os.start(t);os.stop(t+d+.05);
}

/* ---------- small building blocks ---------- */
const click=(t,f,v)=>noise({t,d:.012,type:'highpass',f:f||2500,v:v==null?.1:v,a:.001});
const thud=(t,f,v,d)=>tone({t,f:f*2,f2:f,d:d||.15,v:v==null?.3:v,glide:.05,a:.002});
const tick=(t,f,v)=>{f=f||1600;tone({t,f,f2:f*.7,d:.04,type:'square',v:v==null?.07:v,a:.001,lp:5000})};
const wood=(t,f,v)=>tone({t,f,f2:f*.8,d:.07,type:'triangle',v:v==null?.2:v,a:.001});
const rustle=(t,d,v,f)=>{const n=5;for(let i=0;i<n;i++)noise({t:t+i*d/n*rnd(.7,1.3),d:d/3,type:'bandpass',f:(f||4200)*rnd(.7,1.4),q:.6,v:(v||.1)*rnd(.5,1.2),a:.005})};
const whoosh=(t,d,f1,f2,v)=>noise({t,d,type:'bandpass',f:f1,f2,q:.9,v:v==null?.08:v,a:d*.35});
const mar=(f,t,v)=>{v=v==null?.2:v;tone({t,f,d:.4,v,a:.002});tone({t,f:f*4,d:.07,v:v*.25,a:.001})};
const brass=(f,t,d,v)=>tone({t,f,type:'sawtooth',d,v:v==null?.1:v,a:.03,lp:1900});
const scribble=(t,d,v)=>{const n=Math.round(d/.03);for(let i=0;i<n;i++)noise({t:t+i*.03,d:.03,type:'bandpass',f:rnd(3500,6000),q:1.5,v:(v||.06)*rnd(.6,1),a:.004})};
const drip=(t,f,v)=>tone({t,f,f2:f*2.1,d:.09,v:v==null?.14:v,a:.002});
const ding=(f,t,v,d)=>bell(f,{t,v:v==null?.1:v,d:d||1});
const PEN=[0,2,4,7,9];
const pn=i=>523.25*Math.pow(2,(PEN[i%5]+12*Math.floor(i/5))/12);
const meow=(t,f)=>voice({t,d:.6,v:.6,q:5,type:'sawtooth',p:[[0,f*.8],[.12,f*1.25],[.6,f*.7]],fm:[[0,900],[.16,2300],[.6,1000]]});

/* ---------- materials: lift / drop / slide-pitch ---------- */
const MATS={
 paper:{lift:p=>noise({type:'bandpass',f:3400*p,f2:5200*p,q:.7,d:.1,v:.08,a:.01}),
        drop:p=>{noise({type:'lowpass',f:1100*p,d:.07,v:.12});noise({t:.02,type:'bandpass',f:4200*p,q:.7,d:.08,v:.05})},sl:3200},
 card:{lift:p=>noise({type:'bandpass',f:5200*p,f2:3000*p,q:1.2,d:.05,v:.1}),
       drop:p=>{tone({f:260*p,f2:170*p,d:.05,type:'triangle',v:.16,a:.001});noise({d:.03,type:'highpass',f:3000,v:.07})},sl:4200},
 book:{lift:p=>noise({type:'lowpass',f:700*p,d:.12,v:.12,a:.02}),
       drop:p=>{thud(0,95*p,.35,.14);noise({type:'lowpass',f:900,d:.08,v:.1})},sl:900},
 ceramic:{lift:p=>bell(2300*p,{d:.12,v:.05,ratio:2.4}),
          drop:p=>{bell(1500*p,{d:.28,v:.11,ratio:2.4});thud(0,140,.18,.06)},sl:2200},
 plastic:{lift:p=>tick(0,1700*p,.07),
          drop:p=>{tone({f:420*p,f2:300*p,d:.06,type:'triangle',v:.2,a:.001});noise({d:.03,type:'bandpass',f:2400,v:.07})},sl:2000},
 metal:{lift:p=>bell(3000*p,{d:.15,v:.04,ratio:2.76}),
        drop:p=>{bell(780*p,{d:.5,v:.12,ratio:2.76,idx:600});noise({d:.04,type:'highpass',f:2500,v:.07})},sl:2600},
 wood:{lift:p=>wood(0,900*p,.1),drop:p=>{wood(0,520*p,.22);wood(.07,430*p,.1)},sl:1000},
 rubber:{lift:p=>tone({f:900*p,f2:1500*p,d:.08,v:.06,vib:{r:30,d:30}}),drop:p=>thud(0,150*p,.28,.1),sl:600},
 plush:{lift:p=>noise({type:'lowpass',f:900,d:.14,v:.07,a:.04}),
        drop:p=>{thud(0,130*p,.2,.09);noise({type:'lowpass',f:700,d:.1,v:.06})},sl:500},
 crystal:{lift:p=>bell(3600*p,{d:.2,v:.04,ratio:1.5}),drop:p=>bell(2400*p,{d:.9,v:.1,ratio:1.4}),sl:5000},
 folder:{lift:p=>noise({type:'bandpass',f:1500*p,d:.1,v:.1}),
         drop:p=>{thud(0,110*p,.25,.1);noise({type:'bandpass',f:1500,d:.08,v:.08})},sl:1500}
};
const MAT={first:'paper',resume:'paper',about:'paper',p1:'paper',p2:'paper',p3:'paper',laptop:'plastic',sticky:'paper',notes:'book',
 broke:'paper',mug:'ceramic',clock:'metal',secret:'paper',pc1:'card',pc2:'card',pc3:'card',mail:'paper',ticket:'card',stampbox:'wood',
 fieldnote:'card',transcript:'paper',timeline:'paper',freelance:'folder',letter:'paper',biz:'card',phone:'plastic',c1:'paper',c2:'paper',
 c3:'paper',pass:'card',award:'card',badge:'metal',skillcard:'paper',k1:'plush',k2:'crystal',k3:'rubber',k4:'ceramic',k5:'plush',
 s1:'card',s2:'card',i1:'paper',i2:'paper',pen:'plastic',pencil:'wood',eraser:'rubber',lamp:'metal',dustbin:'metal',j1:'paper',j2:'paper',j3:'paper'};
const matOf=it=>MAT[it.id]||(it.cat==='Skills'?'card':'paper');
const pitchOf=it=>.88+(H(it.id)%1000)/1000*.3;
const lift=it=>MATS[matOf(it)].lift(pitchOf(it));
const drop=it=>MATS[matOf(it)].drop(pitchOf(it));

/* ---------- one signature sound per object ---------- */
const postcard=k=>()=>{
 noise({d:.07,type:'bandpass',f:6000,f2:2500,q:1.2,v:.12});thud(.09,150,.2,.08);click(.09,3000,.07);
 if(k===1){ding(784,.18,.1,.8);ding(1174.7,.28,.1,1)}
 else if(k===2){rustle(.15,.2,.08,3500);ding(987.8,.38,.1,1)}
 else{drip(.2,700);ding(1174.7,.32,.1,1)}};
const OPEN={
 first:()=>{for(let i=0;i<10;i++){noise({t:i*.05,d:.045,type:'bandpass',f:i%2?2600:1600,q:2,v:.09});tone({t:i*.05,f:i%2?190:150,d:.045,type:'sawtooth',v:.04,lp:900})}whoosh(.52,.2,1500,3800,.07);ding(1568,.78,.08,.6)},
 resume:()=>{rustle(0,.16,.09);ding(659.25,.1,.1,.9);ding(830.6,.2,.1,1.1)},
 about:()=>{mar(392,0,.2);mar(523.25,.1,.2);mar(659.25,.2,.22)},
 p1:()=>{tone({f:300,f2:1800,d:.35,type:'sawtooth',v:.05,lp:3200});for(let i=0;i<4;i++)tone({t:.1+i*.07,f:900+i*160,d:.04,type:'square',v:.05,a:.001,lp:4000});tone({t:.46,f:1320,f2:1760,d:.22,v:.12})},
 p2:()=>{drip(0,420,.15);ding(1396.9,.1,.13,.9);ding(1396.9,.42,.05,.7)},
 p3:()=>{rustle(0,.22,.08,3000);drip(.18,650);drip(.34,820,.1);ding(2093,.5,.06,1.2)},
 laptop:()=>{for(let i=0;i<5;i++){click(i*.045,2200,.07);wood(i*.045,1400+i*40,.05)}[261.63,329.63,392,523.25].forEach(f=>tone({t:.28,f,type:'triangle',v:.06,a:.12,d:1.2,lp:2200}))},
 sticky:()=>{noise({d:.22,f:1500,f2:5000,q:1.5,v:.1,a:.1});thud(.25,200,.2,.08)},
 notes:()=>{for(let i=0;i<6;i++)noise({t:i*(.075-.006*i),d:.06,type:'bandpass',f:2500,f2:6500,q:.7,v:.12});scribble(.4,.25,.06)},
 broke:()=>{noise({d:.4,type:'highpass',f:3500,v:.2,a:.001});for(let i=0;i<7;i++)bell(rnd(2200,5200),{t:rnd(0,.3),d:.15,v:.05,ratio:1.7});[311,294,277].forEach((f,i)=>tone({t:.45+i*.22,f,type:'sawtooth',d:.22,v:.07,lp:900,a:.03}));tone({t:1.1,f:277,f2:208,d:.5,type:'sawtooth',v:.07,lp:800,a:.03,vib:{r:6,d:4}})},
 mug:()=>{bell(1800,{d:.3,v:.1,ratio:2.4});for(let i=0;i<4;i++)tone({t:.14+i*.085,f:260+i*30,f2:520+i*50,d:.07,v:.12,a:.002})},
 clock:()=>{[0,1,2,3].forEach(i=>wood(i*.22,i%2?1100:1500,.2));ding(1760,.95,.07,1.4)},
 secret:()=>{rustle(0,.22,.12,5000);noise({t:.2,d:.5,f:800,f2:3200,q:3,v:.05,a:.2});tone({t:.28,f:466,d:.8,v:.07,a:.12,vib:{r:5,d:4}});tone({t:.28,f:659,d:.8,v:.06,a:.12,vib:{r:5,d:4}})},
 pc1:postcard(1),pc2:postcard(2),pc3:postcard(3),
 mail:()=>{for(let i=0;i<9;i++)noise({t:i*.022,d:.03,type:'bandpass',f:rnd(1800,3200),q:2,v:.1});tone({t:.22,f:200,f2:600,d:.05,v:.12});ding(1480,.34,.1,.9);ding(1976,.46,.08,1)},
 ticket:()=>{tone({f:900,f2:300,d:.05,type:'square',v:.1,a:.001,lp:3000});click(0,2500,.12);thud(.01,200,.2,.05);tone({t:.14,f:988,d:.07,type:'square',v:.07,a:.001,lp:3500});tone({t:.21,f:1319,d:.4,type:'square',v:.07,a:.001,lp:3500});noise({t:.25,d:.6,f:1300,f2:2600,q:.5,v:.035,a:.25})},
 stampbox:()=>{thud(0,110,.45,.14);noise({d:.08,type:'lowpass',f:600,v:.12});for(let i=0;i<6;i++)noise({t:.18+i*.05,d:.04,type:'bandpass',f:rnd(3000,6000),q:2,v:.05});ding(1568,.55,.05,.5)},
 fieldnote:()=>{for(let i=0;i<5;i++){click(i*.07,1800,.1);wood(i*.07,rnd(250,330),.1)}bell(2349,{t:.42,d:.9,v:.08,ratio:3.2});noise({t:.55,d:.22,f:1500,f2:3500,q:1,v:.07,a:.04})},
 transcript:()=>{rustle(0,.3,.1,3500);wood(.34,500,.12);wood(.42,500,.1);tone({t:.58,f:2200,f2:1500,d:.03,type:'square',v:.07,a:.001});thud(.58,200,.25,.06)},
 timeline:()=>{[0,1,2,3,4].forEach(i=>mar(pn(i),i*.075,.18));ding(1568,.4,.07,1)},
 freelance:()=>{noise({d:.1,f:1300,f2:900,q:1,v:.13});thud(.05,120,.2,.1);bell(3136,{t:.16,d:.4,v:.06});rustle(.2,.18,.07)},
 letter:()=>{rustle(0,.15,.06);[349.23,440,523.25,659.25].forEach((f,i)=>{tone({t:.12+i*.03,f,type:'sawtooth',v:.04,a:.18,d:1.1,lp:900,det:-6});tone({t:.12+i*.03,f,type:'sawtooth',v:.04,a:.18,d:1.1,lp:900,det:6})})},
 biz:()=>{noise({d:.08,f:5000,f2:3000,q:1.2,v:.1});bell(2637,{t:.1,d:.5,v:.09});bell(3322,{t:.16,d:.4,v:.04})},
 phone:()=>{tone({f:1046.5,d:.12,v:.13,a:.003});tone({t:.16,f:1318.5,d:.2,v:.13,a:.003});for(let i=0;i<7;i++)tone({t:.4+i*.055,f:88,d:.04,type:'square',v:.08,a:.002,lp:380})},
 c1:()=>{noise({d:.3,f:1400,f2:2600,q:.8,v:.07,a:.12});[[261.63,0],[329.63,.16],[392,.32],[523.25,.5]].forEach(([f,t],i)=>brass(f,t+.15,i===3?.8:.18,.09));ding(2093,.68,.05,1.2)},
 c2:()=>{[329.63,493.88,659.25,830.61,987.77].forEach((f,i)=>{tone({t:i*.07,f,type:'triangle',d:.5,v:.1,a:.003});tone({t:i*.07+.2,f,type:'triangle',d:.4,v:.04,a:.003})});noise({d:.5,f:6000,f2:3000,q:.4,v:.03,a:.2})},
 c3:()=>{noise({d:.38,type:'highpass',f:5000,v:.1,a:.08});tone({t:.32,f:392,f2:523.25,d:.14,type:'square',v:.06,a:.003,lp:2500});tone({t:.46,f:587.33,f2:784,d:.22,type:'square',v:.06,a:.003,lp:2500})},
 pass:()=>{for(let i=0;i<7;i++)bell(rnd(2500,4500),{t:rnd(0,.25),d:.1,v:.04,ratio:2.5});tone({t:.34,f:2093,d:.09,v:.12,a:.002});tone({t:.48,f:2793.8,d:.14,v:.12,a:.002})},
 award:()=>{[[1568,0],[2093,.06],[2637,.12],[3136,.18]].forEach(([f,t])=>bell(f,{t,d:1.6,v:.07}));for(let i=0;i<40;i++)noise({t:.1+rnd(0,.9),d:.03,f:rnd(1800,3800),q:1,v:.03,a:.002})},
 badge:()=>{[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>tone({t:i*.055,f,type:'square',d:i===4?.35:.07,v:.06,a:.002,lp:4200}))},
 skillcard:()=>{scribble(0,.25,.06);for(let i=0;i<3;i++)wood(.3+i*.12,700+i*150,.1);ding(1318.5,.7,.08,.7)},
 k1:()=>meow(0,720),
 k2:()=>{[4186,3520,2794,2349].forEach((f,i)=>bell(f,{t:i*.06,d:1.2,v:.04,ratio:1.4,idx:f*.5}));noise({d:.8,type:'highpass',f:7000,v:.02,a:.3})},
 k3:()=>{for(let i=0;i<5;i++)tone({t:i*.085,f:rnd(280,420),f2:rnd(700,1000),d:.09,v:.15,a:.002});tone({t:.45,f:200,f2:330,d:.5,v:.08,a:.1,vib:{r:6,d:5}})},
 k4:()=>{wood(0,310,.2);wood(.09,240,.2);wood(.18,310,.18);tone({t:.3,f:330,f2:495,d:.45,v:.06,a:.12,vib:{r:6,d:8}});tone({t:.75,f:495,f2:300,d:.5,v:.06,a:.05,vib:{r:6,d:8}})},
 k5:()=>{tone({f:1100,f2:1900,d:.1,v:.13,a:.003,vib:{r:35,d:40}});tone({t:.14,f:900,f2:1500,d:.12,v:.12,a:.003,vib:{r:35,d:30}});thud(.3,140,.12,.08)},
 s1:()=>{for(let i=0;i<9;i++)tone({t:i*.02,f:3200+i*60,d:.012,type:'square',v:.05,a:.001});noise({d:.2,type:'highpass',f:6000,v:.04});thud(.22,130,.2,.08);mar(784,.28,.12)},
 s2:()=>{for(let i=0;i<9;i++)tone({t:i*.02,f:3200+i*60,d:.012,type:'square',v:.05,a:.001});noise({d:.2,type:'highpass',f:6000,v:.04});thud(.22,130,.2,.08);drip(.3,900,.12);ding(1174.7,.36,.07,.7)},
 i1:()=>{thud(0,95,.5,.16);noise({d:.1,type:'lowpass',f:700,v:.15});ding(1174.7,.14,.12,.8);ding(1568,.24,.12,1)},
 i2:()=>{thud(0,110,.4,.15);noise({d:.08,type:'lowpass',f:800,v:.12});tone({t:.2,f:440,d:.18,type:'triangle',v:.12});tone({t:.34,f:523.25,d:.18,type:'triangle',v:.1});tone({t:.48,f:440,d:.35,type:'triangle',v:.1});tick(.52,2400,.05)},
 pen:()=>{click(0,3500,.14);tone({f:2000,f2:900,d:.015,type:'square',v:.1,a:.001});click(.1,3000,.12);tone({t:.1,f:1700,f2:800,d:.015,type:'square',v:.08,a:.001});scribble(.2,.3,.06)},
 pencil:()=>{wood(0,820,.15);wood(.08,720,.12);scribble(.2,.35,.07)},
 eraser:()=>{for(let i=0;i<6;i++)noise({t:i*.06,d:.06,f:i%2?2600:3600,q:3,v:.08,a:.01});tone({t:.1,f:2300,f2:1900,d:.18,v:.03,a:.02,vib:{r:40,d:50}})},
 dustbin:()=>{bell(540,{d:.5,v:.1,ratio:2.3,idx:700});thud(0,100,.2,.1);rustle(.1,.25,.1,2500)},
 j1:()=>{rustle(0,.3,.14,3000);[262,247,233].forEach((f,i)=>tone({t:.35+i*.2,f,type:'sawtooth',d:.2,v:.06,lp:800,a:.03}))},
 j2:()=>{rustle(0,.25,.14,2600);tone({t:.3,f:140,d:.25,type:'square',v:.08,lp:700,a:.005});tone({t:.58,f:140,d:.3,type:'square',v:.08,lp:700,a:.005})},
 j3:()=>{rustle(0,.25,.14,3400);ding(1976,.28,.1,.5);tone({t:.4,f:700,f2:120,d:.45,type:'triangle',v:.12,a:.005})}
};
/* one sound per skill, chosen by the skill's name */
const SKILL={
 'HTML':()=>{wood(0,700,.18);wood(.11,880,.18);tone({t:.2,f:392,d:.25,type:'triangle',v:.18,a:.002})},
 'CSS':()=>{for(let i=0;i<9;i++)tone({t:i*.04,f:pn(i),d:.4,v:.09,a:.002});ding(2093,.4,.05,.8)},
 'JavaScript':()=>{tone({f:330,f2:660,d:.1,type:'square',v:.08,lp:3200,a:.002});tone({t:.09,f:880,d:.16,type:'square',v:.08,lp:3200,a:.002});tick(.28,2600,.05)},
 'TypeScript':()=>{tone({f:262,d:.2,type:'triangle',v:.2});tone({t:.1,f:392,d:.35,type:'triangle',v:.2});tick(.3,2200,.06);tick(.36,3000,.06)},
 'React':()=>{noise({d:.5,f:500,f2:2600,q:4,v:.07,a:.15});[523.25,659.25,783.99].forEach((f,i)=>tone({t:i*.07,f,d:.45,v:.08,vib:{r:11,d:f*.02}}));ding(1568,.3,.06,.8)},
 'Node.js':()=>{tone({f:196,f2:392,d:.16,v:.2,a:.005});tone({t:.1,f:392,d:.3,type:'triangle',v:.16,lp:1400});for(let i=0;i<3;i++)tick(.34+i*.07,1500+i*300,.06)},
 'Python':()=>{noise({d:.25,type:'highpass',f:6000,v:.08,a:.06});tone({t:.1,f:220,f2:330,d:.3,v:.15,vib:{r:9,d:10}});tone({t:.35,f:330,f2:247,d:.25,v:.12,vib:{r:9,d:8}})},
 'SQL':()=>{thud(0,95,.3,.12);thud(.11,95,.25,.12);for(let i=0;i<5;i++)tick(.25+i*.045,1700+i*220,.05);ding(988,.5,.06,.5)},
 'PostgreSQL':()=>{voice({d:.4,v:.7,q:3,p:[[0,300],[.28,640],[.4,600]],fm:[[0,800],[.28,1500],[.4,1100]],vib:{r:28,d:12}});voice({t:.38,d:.35,v:.65,q:3,p:[[0,600],[.35,360]],fm:[[0,1100],[.35,700]]});noise({d:.15,f:1200,v:.05})},
 'Git':()=>{tone({f:440,f2:660,d:.3,v:.14});tone({f:440,f2:330,d:.3,v:.14});tone({t:.3,f:660,f2:550,d:.2,v:.1});tone({t:.3,f:330,f2:550,d:.2,v:.1});ding(1100,.45,.1,.9)},
 'Docker':()=>{tone({f:130,d:.8,type:'sawtooth',v:.14,a:.08,lp:520,vib:{r:3,d:3}});tone({f:196,d:.7,v:.1,a:.1});bell(300,{t:.55,d:.5,v:.08,ratio:2.4});thud(.55,70,.3,.15)},
 'Figma':()=>{tick(0,2100,.09);click(0,3000,.08);tone({t:.05,f:600,f2:1300,d:.07,v:.14});mar(1046.5,.14,.16);mar(1318.5,.24,.14)}
};
const THEME=dark=>{
 tone({f:1500,f2:260,d:.03,type:'square',v:.08,a:.001,lp:4000});click(0,2500,.1);
 if(dark){tone({t:.04,f:90,f2:200,d:.35,v:.13,a:.03});tone({t:.08,f:880,d:.5,v:.04,vib:{r:5,d:3}});bell(1760,{t:.1,v:.04,d:.6,ratio:1.5})}
 else{tone({t:.03,f:210,f2:70,d:.3,v:.1});thud(.02,100,.12,.1)}};
OPEN.lamp=()=>THEME(true);
const fallback=it=>()=>{ding(pn(H(it.id)%10),0,.1,.8);rustle(0,.1,.06)};
/* per-sound loudness trim, measured so no object is much louder or quieter than the rest */
const TRIM={"first":1.89,"resume":1.15,"about":0.74,"p1":1.54,"p2":1.26,"p3":1.38,"laptop":1.17,"sticky":1.1,"notes":2.2,"broke":1.9,"mug":1.42,"clock":1.12,"secret":1.29,"pc1":1.09,"pc2":1.21,"pc3":1.23,"mail":1.21,"ticket":1.87,"stampbox":1.78,"fieldnote":1.44,"transcript":0.75,"timeline":0.82,"freelance":1.63,"letter":1.55,"biz":1.44,"phone":1.29,"c1":1.52,"c2":1.19,"c3":1.89,"pass":1.55,"award":1.13,"badge":1.83,"skillcard":1.6,"k1":0.68,"k2":1.75,"k3":1.21,"k4":1.34,"k5":1.31,"s1":1.1,"s2":1.1,"i1":0.98,"i2":1.37,"pen":1.71,"pencil":2.2,"eraser":2.2,"lamp":1.33,"dustbin":2.05,"sk0":1.04,"sk1":1.04,"sk2":1.87,"sk3":1.18,"sk4":1.59,"sk8":1.34,"sk10":1.19,"sk13":1.09,"sk14":0.55,"sk17":1.13,"sk19":0.63,"sk22":0.9,"j1":1.81,"j2":1.49,"j3":1.26};
const openSfx=it=>{vs=TRIM[it.id]||1;try{(OPEN[it.id]||(it.cat==='Skills'&&SKILL[it.name])||fallback(it))()}finally{vs=1}};
const hoverSfx=it=>{vs=1;tone({f:pn(H(it.id)%10)*(it.cat==='Skills'?1:.5),d:.09,v:.03,type:'triangle',a:.002})};
const closeSfx=it=>{vs=1;whoosh(0,.2,3200,1200,.06);setTimeout(()=>asObj(it,()=>{vs=.5;drop(it);vs=1}),470)};

/* scene sounds */
const SCENE={
 sweep:()=>{whoosh(0,.7,500,3500,.14);for(let i=0;i<12;i++)tone({t:.05+i*.05,f:rnd(500,1400),d:.05,type:'triangle',v:.05});thud(.7,80,.35,.25);bell(420,{t:.72,d:.6,v:.06,ratio:2.3})},
 restore:()=>{thud(0,80,.3,.2);whoosh(.05,.6,3500,600,.12);for(let i=0;i<8;i++)tone({t:.1+i*.06,f:rnd(500,900),f2:rnd(1000,1600),d:.06,v:.07})},
 coffee:()=>{noise({d:.35,f:1800,f2:600,q:.8,v:.18,a:.01});for(let i=0;i<6;i++)drip(i*.08+.05,rnd(400,900),.1)},
 wipe:()=>{for(let i=0;i<3;i++)noise({t:i*.12,d:.1,f:i%2?1600:2400,f2:i%2?2600:1500,q:3,v:.08,a:.03});tone({t:.05,f:1800,f2:2300,d:.15,v:.03,a:.02,vib:{r:30,d:40}})},
 shuffle:()=>{whoosh(0,.5,800,4500,.1);rustle(0,.9,.07,3800);for(let i=0;i<6;i++)thud(.4+i*.1,rnd(100,160),.12,.06)},
 notify:()=>{ding(1174.7,0,.12,.9);ding(1568,.14,.12,1.1)},
 binHover:()=>{vs=.6;thud(0,90,.2,.1);bell(900,{d:.15,v:.04,ratio:2.76});vs=1},
 binClose:()=>{thud(0,100,.2,.1);bell(480,{t:.02,d:.3,v:.07,ratio:2.3})}
};
const binDrop=it=>{vs=1;thud(0,90,.3,.16);bell(520*pitchOf(it),{d:.3,v:.05,ratio:2.5});rustle(0,.2,.08,2500)};
let sweepN=0;

/* ---------- plumbing ---------- */
function asObj(it,fn){
 if(!ready())return;
 curPan=it&&it.w?clamp(((it.x+it.w/2)/1400-.5)*1.4,-.7,.7):0;
 try{fn()}catch(e){console.warn('desk sfx:',e)}
 curPan=0}
let sl=null;
function slideStart(it){
 slideStop();
 const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=MATS[matOf(it)].sl*(.9+H(it.id)%100/500);f.Q.value=.8;
 const s=ctx.createBufferSource();s.buffer=nbuf;s.loop=true;
 const g=ctx.createGain();g.gain.value=0;s.connect(f);f.connect(g);route(g);s.start(ctx.currentTime,Math.random());
 sl={s,g,to:0}}
function slideMove(d){
 if(!sl)return;
 sl.g.gain.setTargetAtTime(Math.min(.06,d*.0022),ctx.currentTime,.025);
 clearTimeout(sl.to);const g=sl.g;sl.to=setTimeout(()=>{try{g.gain.setTargetAtTime(0,ctx.currentTime,.06)}catch(e){}},70)}
function slideStop(){
 if(!sl)return;const {s,g,to}=sl;sl=null;clearTimeout(to);
 try{g.gain.setTargetAtTime(0,ctx.currentTime,.03);s.stop(ctx.currentTime+.2)}catch(e){}}

const binItem=items.find(i=>i.isDustbin),lampItem=items.find(i=>i.themeLamp),laptopItem=items.find(i=>i.id==='laptop');

/* open */
const _oi=openItem;openItem=function(it){if(it&&!cur&&!busy)asObj(it,()=>openSfx(it));return _oi.apply(this,arguments)};
const _op=openPlain;openPlain=function(it){if(it)asObj(it,()=>openSfx(it));return _op.apply(this,arguments)};
const _od=openDustbin;openDustbin=function(){asObj(binItem,()=>{vs=1;OPEN.dustbin()});return _od.apply(this,arguments)};
/* close */
const _ci=closeItem;closeItem=function(){const it=cur;if(it&&(plainOpen||!busy)&&gate('close',200))asObj(it,()=>closeSfx(it));return _ci.apply(this,arguments)};
veil.addEventListener('click',()=>{const it=cur;if(it&&(plainOpen||!busy)&&gate('close',200))asObj(it,()=>closeSfx(it))},true);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#binClose'))asObj(binItem,()=>{vs=1;SCENE.binClose()})},true);
/* lamp / theme */
const _st=setTheme;setTheme=function(dark,save,animate){if(animate!==false&&save!==false)asObj(lampItem,()=>{vs=1;THEME(!!dark)});return _st.apply(this,arguments)};
/* dustbin */
const _pb=putInBin;putInBin=function(it){
 const sweeping=!!(it&&it.el&&it.el.style.pointerEvents==='none');
 const r=_pb.apply(this,arguments);
 if(it&&!it.isDustbin&&it.inBin){
  if(sweeping){if(gate('sweep',45))asObj(binItem,()=>{vs=1;tone({f:300+(sweepN++%12)*45,d:.05,type:'triangle',v:.05})})}
  else if(gate('binDrop',80))asObj(binItem,()=>binDrop(it))}
 return r};
const _rb=removeFromBin;removeFromBin=function(it){
 const was=!!(it&&it.inBin&&it._swept);
 const r=_rb.apply(this,arguments);
 if(was&&gate('unsweep',45))asObj(binItem,()=>{vs=1;tone({f:rnd(500,900),f2:rnd(1000,1600),d:.06,v:.06})});
 return r};
const _rf=restoreFromBin;restoreFromBin=function(it){
 const r=_rf.apply(this,arguments);
 if(it&&gate('restore',80))asObj(it,()=>{vs=1;tone({f:400,f2:900,d:.09,v:.12,a:.002});drop(it)});
 return r};
/* reset / organise / mess */
const _fa=flyAll;flyAll=function(){if(gate('shuffle',600))asObj(null,()=>{vs=1;SCENE.shuffle()});return _fa.apply(this,arguments)};

/* per-object: hover note, lift, friction slide, drop */
items.forEach(it=>{
 const el=it.el;if(!el)return;
 let lx=0,ly=0,drag=false;
 el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||dragging||cur||busy)return;if(gate('hover',60))asObj(it,()=>hoverSfx(it))});
 el.addEventListener('pointerdown',e=>{lx=e.clientX;ly=e.clientY;drag=false});
 el.addEventListener('pointermove',e=>{
  if(!el.classList.contains('drag'))return;
  if(!drag){drag=true;lx=e.clientX;ly=e.clientY;asObj(it,()=>{vs=1;lift(it);slideStart(it)})}
  const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;slideMove(Math.hypot(dx,dy))});
 const end=cancel=>{if(!drag)return;drag=false;slideStop();if(cancel||it.inBin)return;asObj(it,()=>{vs=1;drop(it)})};
 el.addEventListener('pointerup',()=>end(false));
 el.addEventListener('pointercancel',()=>end(true));
});

/* things the other scripts do: toast messages, coffee landing, laptop notification, bin target */
const toast=document.getElementById('binToast');
if(toast)new MutationObserver(()=>{
 const m=toast.textContent||'';
 if(m.indexOf('Desk swept')===0){sweepN=0;asObj(binItem,()=>{vs=1;SCENE.sweep()})}
 else if(m.indexOf('Everything is back')===0)asObj(binItem,()=>{vs=1;SCENE.restore()});
 else if(m.indexOf('Oops')===0)asObj(items.find(i=>i.id==='mug'),()=>{vs=1;SCENE.coffee()});
 else if(m.indexOf('All wiped')===0)asObj(items.find(i=>i.id==='mug'),()=>{vs=1;SCENE.wipe()});
}).observe(toast,{childList:true,characterData:true,subtree:true});
if(typeof stage!=='undefined')new MutationObserver(list=>{
 for(const r of list)for(const n of r.addedNodes){
  if(n.nodeType===1&&n.classList&&n.classList.contains('spill')&&gate('splat',35))
   asObj(null,()=>{vs=1;tone({f:rnd(260,520),f2:rnd(120,220),d:.08,v:.07,a:.002});noise({d:.05,type:'lowpass',f:900,v:.05})})}
}).observe(stage,{childList:true,subtree:true});
if(laptopItem&&laptopItem.el)new MutationObserver(list=>{
 for(const r of list)for(const n of r.addedNodes)if(n.classList&&n.classList.contains('dot'))asObj(laptopItem,()=>{vs=1;SCENE.notify()})
}).observe(laptopItem.el,{childList:true});
if(binItem&&binItem.el){let was=false;new MutationObserver(()=>{
 const now=binItem.el.classList.contains('bin-target');
 if(now&&!was&&gate('binHover',150))asObj(binItem,SCENE.binHover);was=now
}).observe(binItem.el,{attributes:true,attributeFilter:['class']})}

/* toolbar sound switch */
const tb=document.querySelector('.tb');
if(tb){
 const b=document.createElement('button');b.id='bSfx';b.type='button';
 const label=()=>{b.textContent=enabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(enabled));b.title=enabled?'Mute desk sounds':'Turn desk sounds on'};
 label();
 b.addEventListener('click',()=>{
  enabled=!enabled;try{localStorage.setItem('deskSfx',enabled?'on':'off')}catch(e){}
  label();
  if(enabled){unlocked=true;if(!ctx)init();asObj(null,()=>{vs=1;tone({f:660,d:.1,v:.1});tone({t:.08,f:990,d:.16,v:.1})})}
  else slideStop()});
 const before=document.getElementById('bStory');tb.insertBefore(b,before||null);
}

/* handy for testing: deskSfx.play('mug'), deskSfx.play('Git') */
window.deskSfx={
 play:id=>{const it=items.find(i=>i.id===id||i.name===id);if(!it)return false;unlocked=true;asObj(it,()=>openSfx(it));return true},
 ids:()=>items.map(i=>i.id),
 _offline:c=>{offline=true;unlocked=true;enabled=true;init(c)},
 _run:id=>{const it=items.find(i=>i.id===id);curPan=0;openSfx(it)},
 _mat:id=>{const it=items.find(i=>i.id===id);vs=1;lift(it);drop(it)},
 _scene:k=>{vs=1;if(k==='theme-dark')THEME(true);else if(k==='theme-light')THEME(false);else SCENE[k]()}
};
})();
