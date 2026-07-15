// Armor rebalance + the warrior actually wearing it.
// Scale: 50/150/400/900/2000/4000/8000 (was 25/100/250/500/800/1200/1800).
// Easy start so the 12 kids under 100 pts aren't staring at nothing; brutal
// finish so FULL ARMOR means something (only a 8000+ warrior reaches it).
// GRANDFATHERED: kids.armor_earned holds what each child had under the OLD
// scale. getArmor returns the UNION, so raising the bar never takes a piece
// off a child who already earned it.
(function(){
 if(window.__wzArmorScale)return; window.__wzArmorScale=1;

 var TIERS=[
  {k:'belt',        n:'Belt of Truth',       p:50,   icon:'\uD83C\uDF97\uFE0F', top:'62%', left:'50%'},
  {k:'breastplate', n:'Breastplate',         p:150,  icon:'\uD83D\uDC94', top:'44%', left:'50%'},
  {k:'boots',       n:'Boots of Peace',      p:400,  icon:'\uD83E\uDD7E', top:'88%', left:'50%'},
  {k:'shield',      n:'Shield of Faith',     p:900,  icon:'\uD83D\uDEE1\uFE0F', top:'55%', left:'22%'},
  {k:'helmet',      n:'Helmet of Salvation', p:2000, icon:'\u26D1\uFE0F', top:'16%', left:'50%'},
  {k:'sword',       n:'Sword of the Spirit', p:4000, icon:'\u2694\uFE0F', top:'55%', left:'78%'},
  {k:'full',        n:'FULL ARMOR',          p:8000, icon:'\uD83C\uDFC6', top:'32%', left:'50%'}
 ];
 window.WZ_TIERS=TIERS;
 var ORDER=TIERS.map(function(t){return t.k;});

 // ---- the single source of truth for what a kid is wearing ----
 window.getArmor=function(kid){
  if(!kid)return [];
  var pts=(kid.lifetime_points!=null?kid.lifetime_points:(kid.points||0));
  var have={};
  TIERS.forEach(function(t){ if(pts>=t.p)have[t.k]=1; });
  // never strip what was earned under the old scale
  (kid.armor_earned||[]).forEach(function(k){ have[k]=1; });
  return ORDER.filter(function(k){ return have[k]; });
 };

 function heroSrc(kid){
  var map={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',
           w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
  return 'img/'+(map[(kid&&kid.avatar)||'']||'warrior-boy.png');
 }

 function css(){ if(document.getElementById('wz-aw-css'))return;
  var s=document.createElement('style'); s.id='wz-aw-css';
  s.textContent=
   "#wz-armorman{position:relative;max-width:300px;margin:0 auto 1rem;aspect-ratio:1/1;border-radius:18px;overflow:hidden;background:radial-gradient(circle at 50% 35%,#2a2a4d,#12101f);border:2px solid rgba(245,200,66,.4)}"+
   "#wz-armorman img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}"+
   ".wz-pin{position:absolute;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.05rem;border:2px solid;transition:all .35s}"+
   ".wz-pin.on{background:rgba(245,200,66,.92);border-color:#fff;box-shadow:0 0 16px 4px rgba(245,200,66,.75);animation:wzglow 2.4s ease-in-out infinite}"+
   ".wz-pin.off{background:rgba(10,8,25,.72);border-color:rgba(255,255,255,.22);filter:grayscale(1);opacity:.5}"+
   "@keyframes wzglow{0%,100%{box-shadow:0 0 12px 3px rgba(245,200,66,.6)}50%{box-shadow:0 0 22px 7px rgba(245,200,66,.95)}}"+
   "#wz-armorcap{text-align:center;font-size:.76rem;color:rgba(255,255,255,.6);font-weight:700;margin-bottom:1rem}"+
   "#wz-armorcap b{color:#f5c842}";
  document.head.appendChild(s); }

 function paintWarrior(){
  var el=document.getElementById('tab-warrior');
  if(!el||!window.APP||!APP.kid)return;
  if(document.getElementById('wz-armorman'))return;
  css();
  var mine=getArmor(APP.kid);
  var box=document.createElement('div'); box.id='wz-armorman';
  var img=document.createElement('img'); img.src=heroSrc(APP.kid); img.alt='Your warrior';
  img.onerror=function(){ img.style.display='none'; };
  box.appendChild(img);
  TIERS.forEach(function(t){
   var p=document.createElement('div');
   p.className='wz-pin '+(mine.indexOf(t.k)>=0?'on':'off');
   p.style.top=t.top; p.style.left=t.left;
   p.innerHTML=t.icon;
   p.title=t.n+(mine.indexOf(t.k)>=0?' \u2713':' \u00B7 '+t.p+' pts');
   box.appendChild(p);
  });
  var cap=document.createElement('div'); cap.id='wz-armorcap';
  cap.innerHTML='You are wearing <b>'+mine.length+' of 7</b> pieces of the armor of God.';
  el.insertBefore(cap, el.firstChild);
  el.insertBefore(box, el.firstChild);
 }

 // the Armor tab is re-rendered by dashTab; repaint after it
 if(typeof dashTab==='function'){
  var _dt=dashTab;
  dashTab=function(tab,btn){
   var r=_dt.apply(this,arguments);
   if(tab==='warrior')setTimeout(paintWarrior,420);
   return r;
  };
 }
})();
