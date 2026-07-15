// Armor rebalance + the warrior wearing it.
// Scale: 50/150/400/900/2000/4000/8000 (was 25/100/250/500/800/1200/1800).
// Easy start so the 12 kids under 100 pts aren't staring at nothing; brutal
// finish so FULL ARMOR means something.
// GRANDFATHERED: kids.armor_earned holds what each child had under the OLD
// scale. getArmor returns the UNION, so raising the bar never takes a piece
// off a child who already earned it.
// LAYOUT NOTE: the warrior art is a head-and-shoulders PORTRAIT — there is no
// waist or feet in frame — so pieces are arranged as a ring AROUND the warrior
// rather than pinned to fake anatomy.
(function(){
 if(window.__wzArmorScale)return; window.__wzArmorScale=1;

 var TIERS=[
  {k:'belt',        n:'Belt of Truth',       p:50,   icon:'\uD83C\uDF97\uFE0F'},
  {k:'breastplate', n:'Breastplate',         p:150,  icon:'\uD83D\uDEE1\uFE0F'},
  {k:'boots',       n:'Boots of Peace',      p:400,  icon:'\uD83E\uDD7E'},
  {k:'shield',      n:'Shield of Faith',     p:900,  icon:'\u2728'},
  {k:'helmet',      n:'Helmet of Salvation', p:2000, icon:'\u26D1\uFE0F'},
  {k:'sword',       n:'Sword of the Spirit', p:4000, icon:'\u2694\uFE0F'}
 ];
 var FULL={k:'full', n:'FULL ARMOR', p:8000, icon:'\uD83C\uDFC6'};
 var ALL=TIERS.concat([FULL]);
 window.WZ_TIERS=ALL;
 var ORDER=ALL.map(function(t){return t.k;});

 // ---- single source of truth for what a kid is wearing ----
 window.getArmor=function(kid){
  if(!kid)return [];
  var pts=(kid.lifetime_points!=null?kid.lifetime_points:(kid.points||0));
  var have={};
  ALL.forEach(function(t){ if(pts>=t.p)have[t.k]=1; });
  (kid.armor_earned||[]).forEach(function(k){ have[k]=1; });   // never strip what was earned
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
   "#wz-armorman{position:relative;max-width:320px;margin:0 auto .5rem;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle at 50% 40%,#2c2c52,#100e1c);border:2px solid rgba(245,200,66,.28)}"+
   "#wz-armorman .wz-face{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;height:58%;border-radius:50%;overflow:hidden;border:3px solid rgba(245,200,66,.55);background:#1a1a2e}"+
   "#wz-armorman .wz-face img{width:100%;height:100%;object-fit:cover}"+
   ".wz-pin{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.15rem;border:2px solid;transition:all .4s}"+
   ".wz-pin.on{background:rgba(245,200,66,.95);border-color:#fff;animation:wzglow 2.6s ease-in-out infinite}"+
   ".wz-pin.off{background:rgba(12,10,28,.8);border-color:rgba(255,255,255,.18);filter:grayscale(1);opacity:.45}"+
   "@keyframes wzglow{0%,100%{box-shadow:0 0 10px 2px rgba(245,200,66,.55)}50%{box-shadow:0 0 20px 6px rgba(245,200,66,.9)}}"+
   ".wz-crown{position:absolute;top:2%;left:50%;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid}"+
   ".wz-crown.on{background:rgba(245,200,66,.95);border-color:#fff;animation:wzglow 2s ease-in-out infinite}"+
   ".wz-crown.off{background:rgba(12,10,28,.8);border-color:rgba(255,255,255,.15);filter:grayscale(1);opacity:.35}"+
   "#wz-armorcap{text-align:center;font-size:.78rem;color:rgba(255,255,255,.62);font-weight:700;margin-bottom:1rem}"+
   "#wz-armorcap b{color:#f5c842}";
  document.head.appendChild(s); }

 function paintWarrior(){
  var el=document.getElementById('tab-warrior');
  if(!el||!window.APP||!APP.kid)return;
  if(document.getElementById('wz-armorman'))return;
  css();
  var mine=getArmor(APP.kid);
  var box=document.createElement('div'); box.id='wz-armorman';

  var face=document.createElement('div'); face.className='wz-face';
  var img=document.createElement('img'); img.src=heroSrc(APP.kid); img.alt='Your warrior';
  img.onerror=function(){ face.style.display='none'; };
  face.appendChild(img); box.appendChild(face);

  // six pieces evenly around the ring — honest layout for portrait art
  TIERS.forEach(function(t,i){
   var ang=(-60 + i*(360/TIERS.length)) * Math.PI/180;
   var r=41;
   var p=document.createElement('div');
   p.className='wz-pin '+(mine.indexOf(t.k)>=0?'on':'off');
   p.style.left=(50+r*Math.cos(ang))+'%';
   p.style.top=(50+r*Math.sin(ang))+'%';
   p.innerHTML=t.icon;
   p.title=t.n+(mine.indexOf(t.k)>=0?' \u2713 earned':' \u00B7 '+t.p+' pts');
   box.appendChild(p);
  });

  var crown=document.createElement('div');
  crown.className='wz-crown '+(mine.indexOf('full')>=0?'on':'off');
  crown.innerHTML=FULL.icon;
  crown.title=FULL.n+(mine.indexOf('full')>=0?' \u2713':' \u00B7 '+FULL.p+' pts');
  box.appendChild(crown);

  var worn=mine.filter(function(k){ return k!=='full'; }).length;
  var cap=document.createElement('div'); cap.id='wz-armorcap';
  cap.innerHTML = (mine.indexOf('full')>=0)
    ? 'You are wearing the <b>FULL ARMOR OF GOD</b>. Keep walking.'
    : 'You are wearing <b>'+worn+' of 6</b> pieces of the armor of God.';
  el.insertBefore(cap, el.firstChild);
  el.insertBefore(box, el.firstChild);
 }

 if(typeof dashTab==='function'){
  var _dt=dashTab;
  dashTab=function(tab,btn){
   var r=_dt.apply(this,arguments);
   if(tab==='warrior')setTimeout(paintWarrior,420);
   return r;
  };
 }
})();
