
/* Bin animation: shake the dustbin hard and everything on the desk (except the lamp) is swept into it.
   Shake it again and the swept items fly back to their places. Works in messy and organized mode. */
(function(){
 const bin=items.find(i=>i.isDustbin);if(!bin||!bin.el)return;
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const binArt=()=>bin.el.querySelector('.dustbin');
 const toast=document.createElement('div');toast.id='binToast';toast.setAttribute('role','status');document.body.appendChild(toast);
 let tt;const say=m=>{toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2800)};
 const swept=()=>binItems.filter(i=>i._swept);
 const fadeLabels=hide=>{[...labels,archiveLabel].forEach(l=>{if(!l)return;l.style.transition='opacity .5s';l.style.opacity=hide?'0':''})};
 const ctr=o=>({x:o.x+o.w/2,y:o.y+o.h/2});
 let busyShake=false;

 /* an item put back by hand (dustbin window) is no longer part of the sweep */
 const _rm=removeFromBin;
 removeFromBin=function(it){it._swept=false;_rm(it);if(!busyShake&&!swept().length)fadeLabels(false)};

 /* keep headings hidden if the layout mode changes while the desk is swept */
 const keepHidden=()=>{if(swept().length)fadeLabels(true)};
 const _to=toOrganized;toOrganized=function(){_to.apply(this,arguments);keepHidden()};
 const _tm=toMess;toMess=function(){_tm.apply(this,arguments);keepHidden()};

 function sweep(){
  const b=ctr(bin);
  const list=items.filter(i=>!i.inBin&&!i.isDustbin&&!i.themeLamp&&i.el.style.display!=='none');
  if(!list.length)return;
  list.sort((p,q)=>Math.hypot(ctr(p).x-b.x,ctr(p).y-b.y)-Math.hypot(ctr(q).x-b.x,ctr(q).y-b.y));
  busyShake=true;binArt()&&binArt().classList.add('rattle');
  say('Desk swept. Shake the bin again to put everything back.');
  let left=list.length;
  const done=()=>{if(--left>0)return;binArt()&&binArt().classList.remove('rattle');fadeLabels(true);busyShake=false};
  list.forEach((it,i)=>{
   const k=ctr(it),dx=b.x-k.x,dy=b.y-k.y;
   it.el.style.pointerEvents='none';
   const fin=()=>{putInBin(it);it._swept=true;it.el.style.pointerEvents='';done()};
   if(reduce||!it.el.animate||it.el.classList.contains('off')){fin();return}
   const a=it.el.animate([{transform:`rotate(${it.r}deg)`},{transform:`translate(${dx}px,${dy}px) rotate(${it.r+(i%2?-200:200)}deg) scale(.08)`,opacity:.15}],{duration:520,delay:Math.min(i*14,650),easing:'cubic-bezier(.55,0,.85,.35)',fill:'forwards'});
   a.onfinish=()=>{fin();a.cancel()};
  });
 }

 function restore(){
  const b=ctr(bin),list=swept();
  list.sort((p,q)=>Math.hypot(ctr(p).x-b.x,ctr(p).y-b.y)-Math.hypot(ctr(q).x-b.x,ctr(q).y-b.y));
  busyShake=true;binArt()&&binArt().classList.add('rattle');
  say('Everything is back in its place.');
  list.forEach((it,i)=>{
   const k=ctr(it),dx=b.x-k.x,dy=b.y-k.y;
   removeFromBin(it);put(it);
   if(reduce||!it.el.animate||it.el.classList.contains('off'))return;
   it.el.animate([{transform:`translate(${dx}px,${dy}px) rotate(${it.r-180}deg) scale(.08)`,opacity:.15},{transform:`rotate(${it.r}deg)`,opacity:1}],{duration:620,delay:Math.min(i*14,650),easing:'cubic-bezier(.2,.8,.25,1)',fill:'backwards'});
  });
  fadeLabels(false);
  setTimeout(()=>{binArt()&&binArt().classList.remove('rattle');busyShake=false},reduce?0:Math.min(list.length*14,650)+640);
 }

 /* shake detection: count fast direction reversals of the dragged bin (mouse or finger) */
 const MIN=45,OPP=14,N=6,WIN=1000;
 const axis=()=>({d:0,seg:0,opp:0});
 let ax=axis(),ay=axis(),last=null,rev=[],cool=0;
 const feed=(a,d,now)=>{if(!d)return;const s=d>0?1:-1,m=Math.abs(d);
  if(!a.d){a.d=s;a.seg=m;return}
  if(s===a.d){a.seg+=m;a.opp=0;return}
  a.opp+=m;
  if(a.opp>=OPP){if(a.seg>=MIN)rev.push(now);a.d=s;a.seg=a.opp;a.opp=0}};
 bin.el.addEventListener('pointerdown',e=>{last={x:e.clientX,y:e.clientY};rev=[];ax=axis();ay=axis()});
 bin.el.addEventListener('pointermove',e=>{
  if(!last||busyShake)return;
  const now=performance.now();
  feed(ax,e.clientX-last.x,now);feed(ay,e.clientY-last.y,now);
  last={x:e.clientX,y:e.clientY};
  rev=rev.filter(t=>now-t<=WIN);
  if(rev.length>=N&&now>cool){rev=[];cool=now+1200;swept().length?restore():sweep()}
 });
 const stop=()=>{last=null;rev=[]};
 bin.el.addEventListener('pointerup',stop);bin.el.addEventListener('pointercancel',stop);
})();
