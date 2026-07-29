// Armor thresholds: show the kid the SAME numbers the unlock logic uses.
// getArmor (WZ_TIERS) is the single source of truth: armor is earned on LIFETIME
// points at 50 / 150 / 400 / 900 / 2000 / 4000 / 8000. But the warrior tab and
// the dashboard hero hint were rendered from older, smaller, hardcoded scales
// (and the hero hint read current points, not lifetime), so "N more points"
// never matched when a piece actually unlocked — confusing and discouraging.
//
// Rather than edit the 175KB bundle, this module corrects the DISPLAY after the
// existing renderers run. It never changes what is unlocked (getArmor already
// gets that right) — only the numbers the child reads. Fails safe: if a node
// isn't found, the worst case is the old text remains; nothing breaks.
(function(){
 if(window.__wzArmorFix)return; window.__wzArmorFix=1;

 // Canonical tiers — prefer the live source of truth, fall back to the known set.
 function tiers(){
  if(window.WZ_TIERS&&WZ_TIERS.length)return WZ_TIERS;
  return [{k:'belt',n:'Belt of Truth',p:50,icon:'🎗️'},{k:'breastplate',n:'Breastplate',p:150,icon:'🛡️'},
   {k:'boots',n:'Boots of Peace',p:400,icon:'🥾'},{k:'shield',n:'Shield of Faith',p:900,icon:'✨'},
   {k:'helmet',n:'Helmet of Salvation',p:2000,icon:'⛑️'},{k:'sword',n:'Sword of the Spirit',p:4000,icon:'⚔️'},
   {k:'full',n:'FULL ARMOR',p:8000,icon:'🏆'}];
 }
 // Label text as rendered in the warrior tab -> canonical threshold.
 var LABEL_PTS={
  'Belt of Truth':50,'Breastplate of Righteousness':150,'Gospel Boots':400,
  'Shield of Faith':900,'Helmet of Salvation':2000,'Sword of the Spirit':4000,'Full Armor of God':8000
 };
 // Label -> custom icon key, so the armor tab grid uses the icon set too.
 var LABEL_KEY={
  'Belt of Truth':'belt','Breastplate of Righteousness':'breastplate','Gospel Boots':'boots',
  'Shield of Faith':'shield','Helmet of Salvation':'helmet','Sword of the Spirit':'sword','Full Armor of God':'full'
 };
 function life(){ try{ var k=APP.kid; return k?(k.lifetime_points!=null?k.lifetime_points:(k.points||0)):0; }catch(e){ return 0; } }

 // ---- 1. dashboard hero hint (#hero-next-armor, set by openDash) ----
 function fixHero(){
  var el=document.getElementById('hero-next-armor'); if(!el||!window.APP||!APP.kid)return;
  var lp=life(), T=tiers(), next=null;
  for(var i=0;i<T.length;i++){ if(lp<T[i].p){ next=T[i]; break; } }
  el.textContent = next
   ? '🎯 Next: '+next.n+' — '+(next.p-lp)+' more pts'
   : '🏆 Full armor unlocked! You are complete!';
 }

 // ---- 2. warrior tab: grid card labels + the "Next:" progress line ----
 function fixArmorTab(){
  var tw=document.getElementById('tab-warrior'); if(!tw)return;
  var lp=life(), T=tiers();

  // (a) per-piece cards: the status div reads "<t> pts" when locked. Rewrite the
  //     number by matching the card's exact label text (stable), leave "UNLOCKED".
  var labels=Object.keys(LABEL_PTS);
  var divs=tw.getElementsByTagName('div');
  for(var i=0;i<divs.length;i++){
   var d=divs[i], txt=(d.textContent||'').trim();
   if(labels.indexOf(txt)<0)continue;                 // this is a label div
   var card=d.parentElement; if(!card)continue;
   var status=card.children[card.children.length-1];   // last cell = status
   if(!status||status===d)continue;
   if(/^\d[\d,]*\s*pts$/i.test((status.textContent||'').trim())){
    status.textContent=LABEL_PTS[txt]+' pts';
   }
   // swap the emoji icon (first cell) for the custom icon
   if(window.wzIcon && LABEL_KEY[txt]){
    var iconDiv=card.children[0];
    if(iconDiv && iconDiv!==d && iconDiv!==status && !iconDiv.querySelector('svg')){
     iconDiv.innerHTML=wzIcon(LABEL_KEY[txt],32);
    }
   }
  }

  // (b) the "Next: … (pts / t)" progress line + its bar.
  var nextLine=null;
  for(var j=0;j<divs.length;j++){
   var t=(divs[j].textContent||'').trim();
   if(t.indexOf('Next:')===0 && t.indexOf('/')>0){ nextLine=divs[j]; break; }
  }
  if(nextLine){
   var next=null, prevP=0;
   for(var m=0;m<T.length;m++){ if(lp<T[m].p){ next=T[m]; break; } prevP=T[m].p; }
   if(next){
    var nkey=next.k||'';
    nextLine.innerHTML='Next: '+(window.wzIcon&&nkey?wzIcon(nkey,15):(next.icon||''))+' '+next.n+' ('+lp+' / '+next.p+')';
    // sibling bar's fill width, recomputed against the real tier span
    var bar=nextLine.nextElementSibling;
    var fill=bar&&bar.firstElementChild;
    if(fill){ var pct=Math.max(0,Math.min(100,Math.round((lp-prevP)/(next.p-prevP)*100))); fill.style.width=pct+'%'; }
   }
  }
 }

 // ---- install: wrap the renderers, and re-apply on warrior-tab opens ----
 function hookArmor(){
  if(typeof window.renderArmor==='function' && !window.renderArmor.__wzFix){
   var _ra=window.renderArmor;
   window.renderArmor=function(){ var r=_ra.apply(this,arguments); try{ fixArmorTab(); }catch(e){} return r; };
   window.renderArmor.__wzFix=1;
  }
 }
 function hookOpen(){
  if(typeof window.openDash==='function' && !window.openDash.__wzFix){
   var _od=window.openDash;
   window.openDash=function(){ var r=_od.apply(this,arguments); setTimeout(fixHero,80); return r; };
   window.openDash.__wzFix=1;
  }
 }
 function hookTab(){
  if(typeof window.dashTab==='function' && !window.dashTab.__wzFixTab){
   var _dt=window.dashTab;
   window.dashTab=function(tab,btn){ var r=_dt.apply(this,arguments); if(tab==='warrior')setTimeout(fixArmorTab,60); return r; };
   window.dashTab.__wzFixTab=1;
  }
 }
 function init(){ hookArmor(); hookOpen(); hookTab(); try{ fixHero(); fixArmorTab(); }catch(e){} }
 // renderArmor/openDash/dashTab are re-wrapped by other modules on timers; match
 // that cadence so we always end up on top of the final versions.
 setTimeout(init,350); setTimeout(init,1300); setTimeout(init,2700);
})();
