/* ---------- desk lighting ---------- */
const REDUCE=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const THEME_KEY='pb-portfolio-theme';
function updateLampSpotlight(){
 const lamp=items.find(i=>i.id==='lamp');
 if(!lamp)return;
 stage.style.setProperty('--lamp-x',(lamp.x+lamp.w*.5)+'px');
 stage.style.setProperty('--lamp-y',(lamp.y+lamp.h*.28)+'px');
}
function setLampVisual(dark,animate=true){
 const lamp=items.find(i=>i.id==='lamp');
 if(!lamp?.el)return;
 const shell=lamp.el.querySelector('.lamp-shell');
 lamp.el.classList.toggle('lamp-off',!!dark);
 if(shell){
  shell.classList.toggle('is-off',!!dark);
  shell.classList.toggle('is-on',!dark);
  if(animate){
   shell.classList.remove('switch-on','switch-off');
   void shell.offsetWidth;
   shell.classList.add(dark?'switch-off':'switch-on');
  }
 }
 lamp.el.setAttribute('aria-label',dark?'Desk lamp, click to turn the light on or drag to move':'Desk lamp, click to turn the light off or drag to move');
 updateLampSpotlight();
}
function setTheme(dark,save=true,animate=true){
 document.body.classList.toggle('dark',!!dark);
 setLampVisual(!!dark,animate);
 const btn=document.getElementById('themeBtn');
 if(btn){
  btn.setAttribute('aria-pressed',String(!!dark));
  btn.textContent=dark?'Light theme':'Dark theme';
  btn.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
 }
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.setAttribute('content',dark?'#080a0e':'#f1f2f5');
 if(save)localStorage.setItem(THEME_KEY,dark?'dark':'light');
}
const savedTheme=localStorage.getItem(THEME_KEY);
if(savedTheme==='dark')document.body.classList.add('dark');
else document.body.classList.remove('dark');

/* ---------- stage, drag, depth ---------- */
const stage=document.getElementById('stage'),wrap=document.getElementById('wrap');
let _uq=0;const uniq=h=>{const k='-c'+(++_uq);return String(h).replace(/\bid="([^"]+)"/g,(m,i)=>'id="'+i+k+'"').replace(/url\(#([^)]+)\)/g,(m,i)=>'url(#'+i+k+')')};
const binItems=[];
function refreshDustbin(){
 const bin=items.find(i=>i.id==='dustbin');if(!bin?.el)return;
 const c=binItems.length;const n=bin.el.querySelector('.count');if(n)n.textContent=c;
}
function inDropTarget(it,target){return it.x<target.x+target.w&&it.x+it.w>target.x&&it.y<target.y+target.h&&it.y+it.h>target.y}
function removeFromBin(it){const i=binItems.indexOf(it);if(i>=0)binItems.splice(i,1);it.inBin=false;it.el.classList.remove('in-bin');it.el.style.display='';refreshDustbin()}
function putInBin(it){if(it.isDustbin)return;removeFromBin(it);it.inBin=true;it.el.style.display='none';binItems.push(it);if(it.id==='lamp')setTheme(true,false,false);put(it);refreshDustbin()}
function restoreFromBin(it){removeFromBin(it);const SWD=innerWidth<720?640:1400;it.x=Math.max(0,Math.min(SWD-it.w,it.x));it.y=Math.max(0,Math.min(SH-it.h,it.y));it.el.style.display='';it.el.classList.remove('off');if(it.id==='lamp')setTheme(false,false,false);put(it);it.el.animate([{transform:`rotate(${it.r}deg) scale(.92)`,opacity:.4},{transform:`rotate(${it.r}deg) scale(1)`,opacity:1}],{duration:220,easing:'ease-out'});}
function dustbinThumb(it){return `<div class="bin-item" data-bin-id="${it.id}"><div class="thumb"><div style="position:absolute;left:50%;top:50%;margin:${-it.h/2}px 0 0 ${-it.w/2}px;width:${it.w}px;height:${it.h}px;transform:scale(${Math.min(120/it.w,74/it.h)})">${uniq(it.html)}</div></div><span class="bn">${it.name}</span><span class="bc">${it.cat}</span><button class="restore" type="button">Put back on desk</button></div>`}
function openDustbin(){
 const old=panel.innerHTML;
 panel.style.display='grid';panel.style.placeItems='center';panel.style.opacity=1;panel.style.transform='none';panel.style.background='transparent';panel.style.boxShadow='none';panel.style.border='0';veil.classList.add('on');
 panel.innerHTML=`<div class="bin-panel" role="document"><div class="bin-head"><div><h2 id="dialog-title">Dustbin</h2><p>${binItems.length?`${binItems.length} item${binItems.length===1?'':'s'} stored here`:'Nothing is in the dustbin'}</p></div><button type="button" class="btn" id="binClose">Close</button></div><div class="bin-grid">${binItems.length?binItems.map(dustbinThumb).join(''):'<div class="bin-empty">The bin is empty. Drag something here when you want it off the desk.</div>'}</div></div>`;
 panel.querySelector('#binClose').onclick=()=>{panel.style.background='';panel.style.boxShadow='';panel.style.border='';panel.style.placeItems='';panel.innerHTML=old;panel.style.display='none';veil.classList.remove('on');const bin=items.find(i=>i.isDustbin);if(bin?.el)bin.el.focus({preventScroll:true})};
 panel.querySelector('#binClose').focus();
 panel.querySelectorAll('.bin-item').forEach(card=>{
  const id=card.dataset.binId,it=items.find(o=>o.id===id);if(!it)return;
  card.querySelector('.restore').onclick=e=>{e.stopPropagation();restoreFromBin(it,it.x0,it.y0);openDustbin()};
  card.onclick=e=>{if(e.target.closest('.restore'))return;openPlain(it)};
  card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move'});
 });
}
const archiveLabel=document.createElement('div');archiveLabel.className='archlabel';archiveLabel.textContent='PROJECTS';archiveLabel.style.left='28px';archiveLabel.style.top='438px';stage.appendChild(archiveLabel);
function scrollToItem(it){
 if(!it)return;
 const top=wrap.getBoundingClientRect().top+scrollY+it.y*scale-84;
 scrollTo({top:Math.max(0,top),behavior:REDUCE?'auto':'smooth'});
}
function deskWidth(){return parseFloat(stage.style.width)||1400}
let scale=1,SH=1840,organized=false,zTop=900;
/* Stacking follows recency only: the starting order keeps the old level order, then whatever you drag last sits on top. */
[...items].sort((a,b)=>a.lv-b.lv||a.zc-b.zc).forEach((it,i)=>{it.zc=i+1;it.zc0=it.zc});zc=items.length;
const zOf=it=>it.zc;
function fit(){const cw=innerWidth<720?640:1400;scale=innerWidth/cw;stage.style.width=cw+'px';stage.style.transform=`scale(${scale})`;stage.style.height=SH+'px';wrap.style.height=SH*scale+'px'}
addEventListener('resize',fit);fit();
// Performance: avoid repainting every desk object on every mouse move. Static depth lighting is intentional.
stage.style.setProperty('--lx','0');
const put=it=>{const e=it.el;e.style.left=it.x+'px';e.style.top=it.y+'px';e.style.transform=`rotate(${it.r}deg)`};
let dragging=null;
items.forEach(it=>{
 const el=document.createElement('div');el.className='obj lv'+it.lv;el.tabIndex=0;
 el.setAttribute('role','button');el.setAttribute('aria-label',it.isDustbin?'Dustbin, click to open or drag items here':it.themeLamp?'Desk lamp, click to toggle light or drag to move':it.name+', open');
 Object.assign(el.style,{width:it.w+'px',height:it.h+'px',zIndex:zOf(it)});
 el.innerHTML=it.html+`<div class="tip">${it.name}</div>`;
 if(it.themeLamp)el.classList.add('lamp-object');
 stage.appendChild(el);it.el=el;put(it);
 let sx0,sy0,ox,oy,moved,lx,tilt=0,pid,cx=0,cy=0,sc0=0,asRAF=0;
 el.addEventListener('pointerenter',()=>{ /* peek: nudge away from what lies underneath */
  if(dragging)return;let vx=0,vy=0;
  items.forEach(o=>{if(o===it||o.cat==='Decor'||zOf(o)>=zOf(it))return;
   if(it.x<o.x+o.w&&it.x+it.w>o.x&&it.y<o.y+o.h&&it.y+it.h>o.y){const dx=it.x+it.w/2-(o.x+o.w/2),dy=it.y+it.h/2-(o.y+o.h/2),d=Math.hypot(dx,dy)||1;vx+=dx/d;vy+=dy/d}});
  const m=Math.hypot(vx,vy);el.style.setProperty('--pk',m?`${vx/m*14}px ${vy/m*14}px`:'0 -3px')});
 el.addEventListener('pointerdown',e=>{
  const scrollTouch=(e.pointerType==='touch'||e.pointerType==='pen')&&!document.body.classList.contains('arrange');
  it._tap={x:e.clientX,y:e.clientY,scroll:scrollTouch,pid:e.pointerId};
  if(scrollTouch)return;
  el.setPointerCapture(e.pointerId);pid=e.pointerId;sx0=lx=cx=e.clientX;sy0=cy=e.clientY;sc0=scrollY;ox=it.x;oy=it.y;it._pr=it.r;moved=false});
 /* place the dragged object under the pointer, counting any page scroll since the grab */
 const applyDrag=()=>{
  const dx=cx-sx0,dy=(cy-sy0)+(scrollY-sc0);
  it.x=Math.max(-20,Math.min(deskWidth()-it.w+20,ox+dx/scale));it.y=Math.max(-20,Math.min(SH-it.h+20,oy+dy/scale));
  el.style.left=it.x+'px';el.style.top=it.y+'px';el.style.transform=`rotate(${it.r+tilt}deg) scale(1.05)`;
  if(it.themeLamp){
   if(!it._spotRAF) it._spotRAF=requestAnimationFrame(()=>{it._spotRAF=0;updateLampSpotlight()});
  }
  const bin=items.find(o=>o.isDustbin);if(bin&&it!==bin){const over=inDropTarget(it,bin);bin.el.classList.toggle('bin-target',over)}
  items.forEach(o=>{if(!o.roll||o===it)return;const ddx=o.x+o.w/2-(it.x+it.w/2),ddy=o.y+o.h/2-(it.y+it.h/2),d=Math.hypot(ddx,ddy);
   if(d<150){o.r=o.r0+Math.sign(ddx||1)*(150-d)/150*9;o.x=o.x0+Math.sign(ddx||1)*(150-d)/150*10;put(o)}});
 };
 /* edge auto-scroll: the closer the pointer is to the top/bottom edge, the faster the page scrolls */
 const EDGE=110,MAXSPD=26;
 const edgeSpeed=()=>{
  if(cy<EDGE)return -Math.pow((EDGE-Math.max(cy,0))/EDGE,2)*MAXSPD;
  if(cy>innerHeight-EDGE)return Math.pow((cy-(innerHeight-EDGE))/EDGE,2)*MAXSPD;
  return 0};
 const autoScroll=()=>{
  if(!dragging||dragging!==it){asRAF=0;return}
  const v=edgeSpeed();
  if(v){const before=scrollY;scrollTo({top:before+v,behavior:'instant'});if(scrollY!==before)applyDrag()}
  asRAF=requestAnimationFrame(autoScroll)};
 const stopAuto=()=>{if(asRAF){cancelAnimationFrame(asRAF);asRAF=0}};
 el.addEventListener('pointermove',e=>{
  if(pid!==e.pointerId||!el.hasPointerCapture(pid))return;
  cx=e.clientX;cy=e.clientY;
  const dx=cx-sx0,dy=(cy-sy0)+(scrollY-sc0);
  if(!moved&&Math.hypot(dx,dy)<5)return;
  if(!moved){moved=true;dragging=it;it.zc=++zc;el.style.zIndex=9000;el.classList.add('drag');el.classList.remove('fly');if(!asRAF)asRAF=requestAnimationFrame(autoScroll)}
  tilt=Math.max(-7,Math.min(7,tilt*.8+(e.clientX-lx)*.45));lx=e.clientX;
  applyDrag();
 });
 el.addEventListener('pointercancel',e=>{
  if(it._tap&&it._tap.scroll&&it._tap.pid===e.pointerId){it._tap=null;return}
  if(pid!==e.pointerId)return;stopAuto();pid=null;dragging=null;el.classList.remove('drag');tilt=0;el.style.zIndex=zOf(it);el.style.transform=`rotate(${it.r}deg)`;const bin=items.find(o=>o.isDustbin);if(bin)bin.el.classList.remove('bin-target')});
 el.addEventListener('pointerup',e=>{
  if(it._tap&&it._tap.scroll&&it._tap.pid===e.pointerId){
   const dx=e.clientX-it._tap.x,dy=e.clientY-it._tap.y;it._tap=null;
   if(Math.hypot(dx,dy)<12){if(it.isDustbin)openDustbin();else if(it.themeLamp)setTheme(!document.body.classList.contains('dark'));else openItem(it)}
   return}
  if(pid!==e.pointerId)return;stopAuto();pid=null;dragging=null;el.classList.remove('drag');tilt=0;
  const bin=items.find(o=>o.isDustbin);if(bin)bin.el.classList.remove('bin-target');
  if(moved&&bin&&it!==bin&&inDropTarget(it,bin)){it.x=ox;it.y=oy;if(it._pr!=null)it.r=it._pr;putInBin(it);el.style.zIndex=zOf(it);return}
  el.style.zIndex=zOf(it);el.style.transform=`rotate(${it.r}deg)`;
  if(!moved){if(it.isDustbin){openDustbin();return}if(it.themeLamp){setTheme(!document.body.classList.contains('dark'));return}openItem(it);}
 });
 el.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();if(it.isDustbin)openDustbin();else if(it.themeLamp)setTheme(!document.body.classList.contains('dark'));else openItem(it)}
  else if(e.key.startsWith('Arrow')){e.preventDefault();const s=e.shiftKey?32:8;
   if(e.key==='ArrowLeft')it.x-=s;if(e.key==='ArrowRight')it.x+=s;if(e.key==='ArrowUp')it.y-=s;if(e.key==='ArrowDown')it.y+=s;put(it)}
 });
});
setTheme(document.body.classList.contains('dark'),false,false);
/* clock */
function tick(){const n=new Date(),h=(n.getHours()%12)*30+n.getMinutes()/2,m=n.getMinutes()*6,s=n.getSeconds()*6;
 document.querySelectorAll('.clk').forEach(c=>{[['hh',h],['mh',m],['sh',s]].forEach(([k,a])=>{const l=c.querySelector('.'+k);if(l)l.setAttribute('transform',`rotate(${a} 50 50)`)})})}
tick();setInterval(tick,1000);

/* ---------- viewer: object lifts, flies to centre, becomes the document ---------- */
const veil=document.getElementById('veil'),panel=document.getElementById('panel');let cur=null,busy=false;
function docViewer(it){
 const f=it.file,img=/\.(png|jpe?g|webp)$/i.test(f);
 return `<div class="dtool">${img?'':'<button class="btn" data-a="prev">‹ Prev</button><span id="pg">Page 1</span><button class="btn" data-a="next">Next ›</button>'}<button class="btn" data-a="zo">−</button><span id="zl">100%</span><button class="btn" data-a="zi">+</button><button class="btn" data-a="fs">Full screen</button><a class="btn" href="${f}" download>Download</a><a class="btn" href="${f}" target="_blank" rel="noopener">Open in new tab</a></div><div class="dview">${img?`<img id="dv" src="${f}" alt="${it.v.title}">`:`<iframe id="dv" title="${it.v.title}"></iframe>`}</div>`}
function wireDoc(it){
 const f=it.file,img=/\.(png|jpe?g|webp)$/i.test(f),dv=panel.querySelector('#dv');let pg=1,z=100;
 const draw=()=>{panel.querySelector('#zl').textContent=z+'%';if(img)dv.style.transform=`scale(${z/100})`;else{dv.src=`${f}#page=${pg}&zoom=${z}&toolbar=0&navpanes=0`;panel.querySelector('#pg').textContent='Page '+pg}};
 panel.querySelector('.dtool').onclick=e=>{const a=e.target.dataset.a;if(!a)return;
  if(a==='prev')pg=Math.max(1,pg-1);if(a==='next')pg++;if(a==='zi')z=Math.min(300,z+25);if(a==='zo')z=Math.max(50,z-25);
  if(a==='fs'){panel.requestFullscreen&&panel.requestFullscreen();return}draw()};
 draw()}
function render(it){
 const v=it.v;let main;
 if(it.file)main=docViewer(it);
 else if(v.page)main=`<div class="vb pg">${v.page}</div>`;
 else{const k=Math.min(3.2,360/it.w,440/it.h);
  main=`<div class="vb split"><div class="frame"><div style="width:${it.w*k}px;height:${it.h*k}px"><div style="width:${it.w}px;height:${it.h}px;transform:scale(${k}) rotate(${it.r/2}deg)">${uniq(it.html)}</div></div></div><div class="txt">${v.body}</div></div>`}
 panel.innerHTML=`<div class="vh"><div><small>${escapeHtml(v.type)}</small><h2 id="dialog-title">${escapeHtml(v.title)}</h2></div><button type="button" id="x">Close</button></div>${main}`;
 panel.querySelector('#x').onclick=closeItem;if(it.file)wireDoc(it);
}
function pose(it){
 const pr=it.el.getBoundingClientRect(),cx=pr.left+pr.width/2,cy=pr.top+pr.height/2,fr=panel.querySelector('.frame>div');
 if(fr){const t=fr.getBoundingClientRect();return{cx,cy,tx:t.left+t.width/2-cx,ty:t.top+t.height/2-cy,s:t.width/(it.w*scale),rot:it.r/2}}
 return{cx,cy,tx:innerWidth/2-cx,ty:innerHeight/2-cy,s:Math.min(innerWidth*.3/(it.w*scale),innerHeight*.42/(it.h*scale),3),rot:0}}
function flyer(it,p){
 const w=it.w*scale,h=it.h*scale,fl=document.createElement('div');fl.className='flyer lv2';
 Object.assign(fl.style,{left:p.cx-w/2+'px',top:p.cy-h/2+'px',width:w+'px',height:h+'px'});
 fl.innerHTML=`<div style="width:${it.w}px;height:${it.h}px;transform:scale(${scale});transform-origin:0 0">${uniq(it.html)}</div>`;
 document.body.appendChild(fl);return fl}
function openItem(it){
 if(!it||cur||busy)return;
 if(REDUCE){openPlain(it);return}
 cur=it;busy=true;render(it);
 panel.style.display='block';panel.style.transition='none';panel.style.opacity=0;panel.style.transform='none';
 const p=pose(it),fl=flyer(it,p);
 panel.style.transform='scale(.97)';it.el.classList.add('hide');veil.classList.add('on');
 const a=fl.animate([{transform:`translate(0,0) rotate(${it.r}deg) scale(1)`},
  {transform:`translate(${p.tx*.08}px,${p.ty*.08-16}px) rotate(${it.r}deg) scale(1.07)`,offset:.2},
  {transform:`translate(${p.tx}px,${p.ty}px) rotate(${p.rot}deg) scale(${p.s})`}],{duration:560,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'});
 setTimeout(()=>{panel.style.transition='opacity .25s,transform .25s';panel.style.opacity=1;panel.style.transform='none'},360);
 a.onfinish=()=>{fl.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'}).onfinish=()=>fl.remove();busy=false;panel.querySelector('#x').focus()};
}
function closeItem(){if(plainOpen){const it=cur;plainOpen=false;panel.style.display='none';veil.classList.remove('on');cur=null;if(it?.el)it.el.focus({preventScroll:true});return}
 if(!cur||busy)return;const it=cur;
 if(REDUCE){if(document.fullscreenElement)document.exitFullscreen();it.el.classList.remove('hide');panel.style.display='none';veil.classList.remove('on');cur=null;busy=false;it.el.focus({preventScroll:true});return}
 busy=true;if(document.fullscreenElement)document.exitFullscreen();
 const p=pose(it),fl=flyer(it,p);
 panel.style.transition='opacity .18s';panel.style.opacity=0;veil.classList.remove('on');
 const a=fl.animate([{transform:`translate(${p.tx}px,${p.ty}px) rotate(${p.rot}deg) scale(${p.s})`},
  {transform:`translate(${p.tx*.12}px,${p.ty*.12-12}px) rotate(${it.r}deg) scale(1.06)`,offset:.78},
  {transform:`translate(0,0) rotate(${it.r}deg) scale(1)`}],{duration:520,easing:'cubic-bezier(.4,.1,.3,1)',fill:'forwards'});
 a.onfinish=()=>{it.el.classList.remove('hide');fl.remove();panel.style.display='none';cur=null;busy=false;
  it.el.animate([{transform:`rotate(${it.r}deg) scale(1.04)`},{transform:`rotate(${it.r}deg) scale(1)`}],{duration:220,easing:'ease-out'});it.el.focus({preventScroll:true})};
}
veil.addEventListener('click',closeItem);

/* ---------- find, browse, reset, organize ---------- */
const F={q:'',cat:'Everything'},qI=document.getElementById('q'),drw=document.getElementById('drw');
function applyF(){const act=F.q||F.cat!=='Everything';
 items.forEach(it=>{const m=(F.cat==='Everything'||it.cat===F.cat)&&(!F.q||it.text.includes(F.q));it.el.classList.toggle('dim',act&&!m);it.el.classList.toggle('hit',act&&m&&it.cat!=='Decor')});
 drw.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.c===F.cat))}
qI.addEventListener('input',()=>{F.q=qI.value.trim().toLowerCase();applyF()});
qI.addEventListener('keydown',e=>{e.stopPropagation();
 if(e.key==='Escape'){qI.value='';F.q='';applyF();qI.blur()}
 if(e.key==='Enter'){const h=items.find(i=>i.el.classList.contains('hit'));if(h)scrollToItem(h)}});
const CATS=['Everything',...['Documents','Projects','Experience','Education','Achievements','Certificates','Personal','Contact','Skills'].filter(c=>items.some(i=>i.cat===c))];
drw.innerHTML=CATS.map(c=>`<button type="button" data-c="${c}">${c}<span>${c==='Everything'?items.filter(i=>i.cat!=='Decor').length:items.filter(i=>i.cat===c).length}</span></button>`).join('');
drw.onclick=e=>{const b=e.target.closest('button');if(!b)return;F.cat=F.cat===b.dataset.c?'Everything':b.dataset.c;applyF();drw.classList.remove('on');document.getElementById('bMenu').setAttribute('aria-expanded','false');
 const h=items.find(i=>i.el.classList.contains('hit'));if(h&&F.cat!=='Everything')scrollToItem(h)};
document.getElementById('bMenu').onclick=e=>{const on=!drw.classList.contains('on');drw.classList.toggle('on',on);e.currentTarget.setAttribute('aria-expanded',String(on));e.stopPropagation()};
addEventListener('click',e=>{if(!drw.contains(e.target)){drw.classList.remove('on');document.getElementById('bMenu').setAttribute('aria-expanded','false')}});
function flyAll(fn){items.forEach((it,i)=>{it.el.classList.add('fly');it.el.style.transitionDelay=(i%9)*18+'ms'});fn();
 setTimeout(()=>items.forEach(it=>{it.el.classList.remove('fly');it.el.style.transitionDelay=''}),1300)}
function resetDesk(){
 binItems.slice().forEach(it=>restoreFromBin(it));
 items.forEach(it=>{it.x=it.x0;it.y=it.y0;it.r=it.r0;it.zc=it.zc0;it.el.style.zIndex=zOf(it);it.el.style.display='';it.el.classList.remove('off');it.mx=it.x0;it.my=it.y0;it.mr=it.r0;put(it)});
 zc=items.length;organized=false;labels.forEach(l=>l.remove());labels=[];
 bOrg.textContent='Organize';bOrg.classList.remove('on');
 if(innerWidth<720)toOrganized();
 else flyAll(()=>{items.forEach(it=>{it.x=it.x0;it.y=it.y0;it.r=it.r0;put(it)});SH=1840;fit()});
 setTimeout(()=>binJunk(),900);
 refreshDustbin();
}
const bOrg=document.getElementById('bOrg');let labels=[];
function toOrganized(){
 organized=true;bOrg.textContent='Messy mode';bOrg.classList.add('on');
 items.forEach(it=>{it.mx=it.x;it.my=it.y;it.mr=it.r});
 const ORDER=['Documents','Projects','Experience','Education','Achievements','Certificates','Personal','Contact','Skills'];
 const cp=innerWidth<720;let y=cp?92:70;const W=cp?580:1300,G2=cp?16:24,X0=cp?30:50;labels.forEach(l=>l.remove());labels=[];
 flyAll(()=>{
  ORDER.forEach(c=>{const g=items.filter(i=>i.cat===c&&!i.isDustbin);if(!g.length)return;
   const lb=document.createElement('div');lb.className='olabel';lb.textContent=c;lb.style.left=X0+'px';lb.style.top=y+'px';stage.appendChild(lb);labels.push(lb);y+=44;
   let x=X0,rh=0;g.forEach(it=>{if(x+it.w>X0+W){x=X0;y+=rh+G2;rh=0}it.x=x;it.y=y+(c==='Skills'?0:6);it.r=0;put(it);x+=it.w+G2;rh=Math.max(rh,it.h)});
   if(cp){const rows={};g.forEach(i=>(rows[i.y]=rows[i.y]||[]).push(i));Object.values(rows).forEach(r=>{const l=Math.min(...r.map(i=>i.x)),rt=Math.max(...r.map(i=>i.x+i.w)),d=320-(l+rt)/2;r.forEach(i=>{i.x+=d;put(i)})})}
   y+=rh+50});
  /* In organized mode the lamp is deliberately the easy-to-find light at the right of the document row. */
  const lamp=items.find(i=>i.id==='lamp');if(lamp){const rs=items.find(i=>i.id==='resume');lamp.x=cp?(rs?Math.min(rs.x+rs.w+4,640-lamp.w-2):40):1110;lamp.y=cp?(rs?rs.y+4:y+10):72;lamp.r=0;put(lamp)}
  const bin=items.find(i=>i.id==='dustbin');if(bin){bin.x=cp?490:1240;bin.y=cp?y-40:Math.max(y-130,1250);bin.r=0;put(bin)}
  items.filter(i=>i.cat==='Decor'&&!i.themeLamp&&!i.isDustbin).forEach(it=>it.el.classList.add('off'));
  SH=cp?y+220:Math.max(y+80,1510);fit()})}
function toMess(quick){if(innerWidth<720)return;
 organized=false;bOrg.textContent='Organize';bOrg.classList.remove('on');labels.forEach(l=>l.remove());labels=[];
 const go=()=>{items.forEach(it=>{if(it.mx!=null){it.x=it.mx;it.y=it.my;it.r=it.mr}put(it);it.el.classList.remove('off')});SH=1840;fit()};
 if(quick)go();else flyAll(go)}
bOrg.onclick=()=>{if(innerWidth<720){if(!organized)toOrganized();return}organized?toMess():toOrganized()};
document.getElementById('bReset').onclick=resetDesk;
document.getElementById('bSk').onclick=()=>scrollToItem(items.find(i=>i.id==='skillcard')||items.find(i=>i.cat==='Skills'));

/* ---------- story mode ---------- */
let story=false;
const bStory=document.getElementById('bStory');
bStory.textContent='Quick tour';bStory.onclick=()=>startTour();


/* ===== v4: tour, mobile, bin helpers, a11y ===== */
let plainOpen=false,binOpen=false,tour=-1;
function openPlain(it){if(!it)return;binOpen=false;plainOpen=true;cur=it;panel.style.background='';panel.style.boxShadow='';panel.style.border='';panel.style.placeItems='';render(it);panel.style.display='block';panel.style.transition='none';panel.style.opacity=1;panel.style.transform='none';veil.classList.add('on');const x=panel.querySelector('#x');if(x)x.focus()}
const _od=openDustbin;openDustbin=function(){_od();binOpen=true;const c=panel.querySelector('#binClose');if(c)c.addEventListener('click',()=>{binOpen=false})};
const closeBin=()=>{const c=document.getElementById('binClose');if(binOpen&&c){c.click();return true}return false};
veil.addEventListener('click',closeBin);
const binJunk=()=>['j1','j2','j3'].forEach(id=>{const o=items.find(i=>i.id===id);if(o&&!o.inBin)putInBin(o)});binJunk();

const TOUR=DESK_TOUR.filter(step=>items.some(i=>i.id===step[0]));
const tourBar=document.createElement('div');tourBar.id='tour';tourBar.setAttribute('role','region');tourBar.setAttribute('aria-label','Quick tour');document.body.appendChild(tourBar);
function tourShow(){const n=TOUR.length,idx=tour,t=TOUR[idx];
 tourBar.innerHTML=`<span class="tm">${sv('cat')}</span><div class="tt"><small>QUICK TOUR · ${idx+1} / ${n}</small><span>${escapeHtml(t[1])}</span></div><button type="button" data-t="b" ${idx?'':'disabled'}>Back</button><button type="button" class="p" data-t="n">${idx===n-1?'Finish':'Next'}</button><button type="button" data-t="s">Skip</button>`;
 tourBar.classList.add('on');
 tourBar.querySelector('[data-t=b]').onclick=()=>{if(tour>0){tour--;tourShow()}};
 tourBar.querySelector('[data-t=n]').onclick=()=>{if(tour<n-1){tour++;tourShow()}else exitTour()};
 tourBar.querySelector('[data-t=s]').onclick=exitTour;
 const it=items.find(i=>i.id===t[0]);if(it&&it.inBin)restoreFromBin(it,it.x0,it.y0);
 const go=()=>{if(tour!==idx)return;if(busy){setTimeout(go,100);return}if(cur){closeItem();setTimeout(go,100);return}if(it)openItem(it)};go()}
function startTour(){const w=document.getElementById('welcome');if(w)w.remove();if(tour>=0)return;tour=0;tourShow()}
function exitTour(){tour=-1;tourBar.classList.remove('on');if(cur&&!busy)closeItem()}

/* The quick tour stays on the toolbar. It no longer covers the page on load. */

/* mobile: simple scrolling list instead of the scaled desk */
let wasM=null;
const mq=()=>{const m=innerWidth<720;document.body.classList.toggle('m',m);if(wasM!==null&&wasM!==m){m?toOrganized():toMess(true)}wasM=m;fit()};
mq();addEventListener('resize',mq);if(innerWidth<720)toOrganized();

/* keyboard: Escape closes bin and tour, Tab stays inside the open dialog */
addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(closeBin())return;if(tour>=0)exitTour();return}
 if(e.key!=='Tab'||panel.style.display==='none'||!veil.classList.contains('on'))return;
 const f=[...panel.querySelectorAll('button,a[href],input,[tabindex]:not([tabindex="-1"])'),...tourBar.querySelectorAll('button:not(:disabled)')];if(!f.length)return;
 const a=f[0],z=f[f.length-1],ae=document.activeElement,inside=panel.contains(ae)||tourBar.contains(ae);
 if(!inside){e.preventDefault();a.focus()}else if(e.shiftKey&&ae===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&ae===z){e.preventDefault();a.focus()}
},true);
panel.setAttribute('aria-label','Details');
/* ---------- keyboard ---------- */
addEventListener('keydown',e=>{
 const tag=document.activeElement&&document.activeElement.tagName;
 if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||document.activeElement?.isContentEditable||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==='Escape'){if(cur)closeItem();else{F.cat='Everything';applyF()}return}
 if(cur)return;
 if(e.key==='/'){e.preventDefault();qI.focus()}
 else if(e.key==='r'||e.key==='R')resetDesk();
 else if(e.key==='o'||e.key==='O')organized?toMess():toOrganized();
 else if(e.key==='1'){F.cat='Projects';applyF();const hit=items.find(i=>i.cat==='Projects');if(hit)scrollToItem(hit)}
 else if(e.key==='3')openItem(items.find(i=>i.id==='resume'));
});
