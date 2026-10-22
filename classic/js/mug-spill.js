
/* Shake the coffee mug hard while dragging it: coffee splashes onto the desk and onto nearby items.
   Shake it again (or press Reset) and the desk is wiped clean. Stains on items move with the items. */
(function(){
 const mug=items.find(i=>i.id==='mug');if(!mug||!mug.el)return;
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let toast=document.getElementById('binToast');
 if(!toast){toast=document.createElement('div');toast.id='binToast';toast.setAttribute('role','status');document.body.appendChild(toast)}
 let tt;const say=m=>{toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),3000)};
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const ctr=o=>({x:o.x+o.w/2,y:o.y+o.h/2});
 let spills=[],busy=false;

 const blob=(size,anim,delay)=>{
  const d=document.createElement('i');d.className='spill';
  const r=()=>Math.round(rnd(38,62));
  d.style.width=size+'px';d.style.height=Math.round(size*rnd(.75,1))+'px';
  d.style.borderRadius=`${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
  d.style.transform=`rotate(${Math.round(rnd(0,180))}deg)`;
  if(anim&&!reduce)d.animate([{opacity:0,scale:.2},{opacity:1,scale:1.12,offset:.6},{opacity:1,scale:1}],{duration:380,delay,easing:'ease-out',fill:'backwards'});
  return d};

 function spill(){
  busy=true;
  const m=ctr(mug),targets=[];
  /* desk stains around the mug (under the objects) */
  const nd=Math.round(rnd(3,5));
  for(let i=0;i<nd;i++){const a=rnd(0,Math.PI*2),r=rnd(55,190);
   targets.push({x:m.x+Math.cos(a)*r,y:m.y+Math.sin(a)*r*.8,size:rnd(34,70),item:null})}
  /* nearby items catch a stain too, and carry it with them */
  items.forEach(o=>{
   if(o===mug||o.isDustbin||o.themeLamp||o.inBin||o.el.style.display==='none')return;
   const c=ctr(o);if(Math.hypot(c.x-m.x,c.y-m.y)>200)return;
   const size=Math.max(18,Math.min(44,Math.min(o.w,o.h)*rnd(.4,.7)));
   targets.push({x:o.x+rnd(o.w*.2,o.w*.8),y:o.y+rnd(o.h*.2,o.h*.8),size,item:o})});
  let longest=0;
  targets.forEach((t,i)=>{
   const dur=reduce?0:Math.round(rnd(420,760)),delay=reduce?0:i*35;longest=Math.max(longest,dur+delay);
   const land=()=>{
    const b=blob(t.size,true,0);
    if(t.item){b.style.left=(t.x-t.item.x-t.size/2)+'px';b.style.top=(t.y-t.item.y-t.size/2)+'px';t.item.el.appendChild(b)}
    else{b.style.left=(t.x-t.size/2)+'px';b.style.top=(t.y-t.size/2)+'px';stage.appendChild(b)}
    spills.push(b)};
   if(reduce){land();return}
   /* flying droplet: up and out, then down onto the target */
   const dp=document.createElement('i');dp.className='spill-drop';const sz=Math.round(rnd(5,10));
   dp.style.width=dp.style.height=sz+'px';stage.appendChild(dp);
   const dx=t.x-m.x,dy=t.y-m.y,peak=-rnd(50,110);
   dp.animate([
    {transform:`translate(${m.x}px,${m.y-20}px) scale(1)`,opacity:1},
    {transform:`translate(${m.x+dx*.55}px,${m.y+Math.min(dy,0)+peak}px) scale(1.1)`,opacity:1,offset:.5,easing:'ease-in'},
    {transform:`translate(${t.x}px,${t.y}px) scale(.6)`,opacity:.9}
   ],{duration:dur,delay,easing:'ease-out',fill:'both'}).onfinish=()=>{dp.remove();land()};
  });
  /* mug gives a little wobble */
  if(!reduce)mug.el.animate([{rotate:'0deg'},{rotate:'-9deg'},{rotate:'7deg'},{rotate:'-4deg'},{rotate:'0deg'}],{duration:420,easing:'ease-out'});
  say('Oops, coffee everywhere. Shake the mug again to wipe it up.');
  setTimeout(()=>{busy=false},longest+500);
 }

 function wipe(deskOnly,quiet){
  const keep=[];
  spills.forEach(b=>{
   if(deskOnly&&b.parentNode!==stage){keep.push(b);return}
   if(reduce){b.remove();return}
   b.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease-in',fill:'forwards'}).onfinish=()=>b.remove()});
  const had=spills.length>keep.length;spills=keep;
  if(had&&!quiet)say('All wiped up.');
 }

 /* shake detection: count fast direction reversals of the dragged mug (mouse or finger) */
 const MIN=40,OPP=12,N=5,WIN=900;
 const axis=()=>({d:0,seg:0,opp:0});
 let ax=axis(),ay=axis(),last=null,rev=[],cool=0;
 const feed=(a,d,now)=>{if(!d)return;const s=d>0?1:-1,m=Math.abs(d);
  if(!a.d){a.d=s;a.seg=m;return}
  if(s===a.d){a.seg+=m;a.opp=0;return}
  a.opp+=m;
  if(a.opp>=OPP){if(a.seg>=MIN)rev.push(now);a.d=s;a.seg=a.opp;a.opp=0}};
 mug.el.addEventListener('pointerdown',e=>{last={x:e.clientX,y:e.clientY};rev=[];ax=axis();ay=axis()});
 mug.el.addEventListener('pointermove',e=>{
  if(!last||busy)return;
  const now=performance.now();
  feed(ax,e.clientX-last.x,now);feed(ay,e.clientY-last.y,now);
  last={x:e.clientX,y:e.clientY};
  rev=rev.filter(t=>now-t<=WIN);
  if(rev.length>=N&&now>cool){rev=[];cool=now+1200;spills.length?wipe():spill()}
 });
 const stop=()=>{last=null;rev=[]};
 mug.el.addEventListener('pointerup',stop);mug.el.addEventListener('pointercancel',stop);

 /* Reset cleans everything. Switching layout clears desk stains (item stains travel with their items). */
 document.getElementById('bReset')?.addEventListener('click',()=>wipe(false,true));
 addEventListener('keydown',e=>{if((e.key==='r'||e.key==='R')&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||''))wipe(false,true)});
 const _to=toOrganized;toOrganized=function(){wipe(true,true);return _to.apply(this,arguments)};
 const _tm=toMess;toMess=function(){wipe(true,true);return _tm.apply(this,arguments)};
})();
