// Streaks & Stickers — the daily-return hook, built to fit the app's soul.
// The Hall of Victory deliberately REFUSES to rank children against each other
// (see ranks.js). This module keeps that promise: every reward here is you vs
// yesterday's you. Nothing compares one kid to another.
//
// Two pieces, appended to the Hall of Victory tab (which renders synchronously,
// so a plain wrapper is safe):
//   1. A "don't break the chain" streak strip — visual fire for showing up.
//   2. A Sticker Shelf — collectible milestones a kid earns from their OWN
//      journey (verses learned, devos read, armor earned, streak kept).
//
// All of it is DERIVED from data the kid record already carries — no backend
// change, no new writes. The only thing we persist is a tiny per-kid list in
// localStorage so a newly-earned sticker celebrates exactly once.
(function(){
 if(window.__wzStreaks)return; window.__wzStreaks=1;

 function arr(v){ return Array.isArray(v)?v:[]; }
 function vlen(k){ return arr(k.completed_verses).length; }
 function dlen(k){ return arr(k.completed_devos).length; }
 function mlen(k){ return arr(k.completed_missions).length; }
 function wlen(k){ return arr(k.completed_videos).length; }
 function best(k){ return Math.max(k.best_streak||0, k.streak_count||0); }
 function pieces(k){ try{ return getArmor(k).filter(function(x){return x!=='full';}).length; }catch(e){ return 0; } }
 function hasFull(k){ try{ return getArmor(k).indexOf('full')>=0; }catch(e){ return false; } }

 // Milestones. Order = the shelf order. Each `on(kid)` is a pure predicate.
 var STICKERS=[
  {id:'first',    e:'🌟', n:'First Steps',    hint:'Join the warriors',            on:function(){return true;}},
  {id:'verse1',   e:'📜', n:'Verse Keeper',   hint:'Learn your first verse',        on:function(k){return vlen(k)>=1;}},
  {id:'devo1',    e:'🙏', n:'Quiet Time',     hint:'Finish your first devo',        on:function(k){return dlen(k)>=1;}},
  {id:'streak3',  e:'🔥', n:'On Fire',        hint:'Keep a 3-day streak',           on:function(k){return best(k)>=3;}},
  {id:'armor3',   e:'🛡️', n:'Armored Up', hint:'Earn 3 armor pieces',         on:function(k){return pieces(k)>=3;}},
  {id:'verse5',   e:'📖', n:'Word Warrior',   hint:'Learn 5 verses',                on:function(k){return vlen(k)>=5;}},
  {id:'devo5',    e:'❤️', n:'Faithful Reader',hint:'Finish 5 devos',                on:function(k){return dlen(k)>=5;}},
  {id:'mission1', e:'🎯', n:'Truth Scout',    hint:'Finish a training mission',     on:function(k){return mlen(k)>=1;}},
  {id:'watch1',   e:'🎬', n:'All Ears',       hint:'Watch a warrior video',         on:function(k){return wlen(k)>=1;}},
  {id:'streak7',  e:'⚡',       n:'Unstoppable',    hint:'Keep a 7-day streak',           on:function(k){return best(k)>=7;}},
  {id:'streak14', e:'🏅', n:'Legendary',      hint:'Keep a 14-day streak',          on:function(k){return best(k)>=14;}},
  {id:'armorfull',e:'👑', n:'Fully Armored',  hint:'Wear the full armor of God',    on:function(k){return hasFull(k);}}
 ];

 function css(){ if(document.getElementById('wz-stk-css'))return;
  var s=document.createElement('style'); s.id='wz-stk-css';
  s.textContent=
   ".stk-card{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:1.1rem;margin-bottom:1rem}"+
   ".stk-t{font-family:Bangers,cursive;font-size:1.25rem;letter-spacing:.04em;color:#f5c842;line-height:1.1;margin-bottom:.15rem}"+
   ".stk-sub{font-size:.72rem;color:rgba(255,255,255,.45);font-weight:700;margin-bottom:.85rem}"+
   ".stk-chain{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.5rem}"+
   ".stk-day{width:30px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}"+
   ".stk-day.on{background:linear-gradient(180deg,rgba(255,140,40,.35),rgba(255,80,20,.15));border-color:rgba(255,150,60,.6);box-shadow:0 0 10px rgba(255,120,40,.3)}"+
   ".stk-day.next{border:1.5px dashed rgba(245,200,66,.5)}"+
   ".stk-meta{display:flex;gap:1.2rem;font-size:.74rem;color:rgba(255,255,255,.6);font-weight:700;margin-top:.35rem}"+
   ".stk-meta b{color:#f5c842;font-family:Bangers,cursive;font-size:1.15rem;letter-spacing:.03em}"+
   ".stk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.55rem;margin-top:.35rem}"+
   ".stk-badge{position:relative;text-align:center;border-radius:14px;padding:.6rem .25rem;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03)}"+
   ".stk-badge.got{border-color:rgba(245,200,66,.4);background:linear-gradient(160deg,rgba(245,200,66,.12),rgba(245,200,66,.03))}"+
   ".stk-badge .em{font-size:1.7rem;line-height:1;display:block;margin-bottom:.25rem}"+
   ".stk-badge.locked .em{filter:grayscale(1);opacity:.3}"+
   ".stk-badge .nm{font-size:.58rem;font-weight:800;line-height:1.15;color:#fff}"+
   ".stk-badge.locked .nm{color:rgba(255,255,255,.4)}"+
   ".stk-badge .hint{font-size:.52rem;color:rgba(255,255,255,.3);margin-top:.15rem;line-height:1.1}"+
   ".stk-badge.got .hint{color:#f5c842}"+
   ".stk-badge.pop{animation:stkpop .6s cubic-bezier(.34,1.56,.64,1)}"+
   "@keyframes stkpop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}"+
   ".stk-count{font-size:.68rem;color:rgba(255,255,255,.45);font-weight:800;margin:.15rem 0 .55rem}";
  document.head.appendChild(s); }

 function lsKey(k){ return 'wz_stickers_'+(k.id||'anon'); }
 function loadSeen(k){ try{ return JSON.parse(localStorage.getItem(lsKey(k))||'null'); }catch(e){ return null; } }
 function saveSeen(k,ids){ try{ localStorage.setItem(lsKey(k),JSON.stringify(ids)); }catch(e){} }

 function build(k){
  var card=document.createElement('div'); card.className='stk-card';

  // ---- streak strip ----
  var cur=k.streak_count||0, bst=best(k);
  var SLOTS=Math.max(7,Math.min(10,cur+1));   // always show at least a week
  var chain='';
  for(var i=0;i<SLOTS;i++){
   var on=i<cur, isNext=(i===cur);
   chain+="<div class='stk-day"+(on?' on':'')+(isNext?' next':'')+"'>"+(on?'🔥':(isNext?'⭐':''))+"</div>";
  }
  var strip=cur>0
    ? "<div class='stk-sub'>Don’t break the chain — come back tomorrow to keep it going.</div>"
    : "<div class='stk-sub'>Show up today to light your first flame.</div>";

  // ---- sticker shelf ----
  var earned=STICKERS.filter(function(s){return s.on(k);}).map(function(s){return s.id;});
  var seen=loadSeen(k);
  var fresh = seen ? earned.filter(function(id){return seen.indexOf(id)<0;}) : [];
  saveSeen(k,earned);   // first-ever open saves silently (seen===null -> no fresh)

  var badges='';
  STICKERS.forEach(function(s){
   var got=s.on(k), isFresh=fresh.indexOf(s.id)>=0;
   badges+="<div class='stk-badge "+(got?'got':'locked')+(isFresh?' pop':'')+"'>"+
     "<span class='em'>"+s.e+"</span>"+
     "<div class='nm'>"+s.n+"</div>"+
     "<div class='hint'>"+(got?'Earned!':s.hint)+"</div></div>";
  });

  card.innerHTML=
   "<div class='stk-t'>🔥 Your Streak</div>"+strip+
   "<div class='stk-chain'>"+chain+"</div>"+
   "<div class='stk-meta'><span>Now <b>"+cur+"</b></span><span>Best <b>"+bst+"</b></span></div>"+
   "<div class='stk-t' style='margin-top:1.1rem'>🏅 Sticker Shelf</div>"+
   "<div class='stk-count'>"+earned.length+" of "+STICKERS.length+" collected</div>"+
   "<div class='stk-grid'>"+badges+"</div>";

  // celebrate newly-earned stickers (once), respecting mute
  if(fresh.length){
   setTimeout(function(){
    try{ if(typeof wzConfetti==='function')wzConfetti(40); }catch(e){}
    try{ if(typeof wzSfxFanfare==='function')wzSfxFanfare(); }catch(e){}
    try{ if(navigator.vibrate)navigator.vibrate([40,30,60]); }catch(e){}
    var s0=STICKERS.filter(function(s){return s.id===fresh[0];})[0];
    if(s0&&typeof toast==='function')toast(s0.e+' New sticker: '+s0.n+(fresh.length>1?' (+'+(fresh.length-1)+' more)':'')+'!',4500);
   },600);
  }
  return card;
 }

 function inject(){
  var el=document.getElementById('tab-ranks'); if(!el)return;
  if(!window.APP||!APP.kid)return;
  // Only after the Hall's own cards have rendered (avoids the pre-data pass).
  if(!el.querySelector('.bl-card'))return;
  if(el.querySelector('.stk-card'))return;   // idempotent per render
  css();
  el.appendChild(build(APP.kid));
 }

 function hook(){
  if(typeof renderRanks!=='function')return false;
  var _rr=renderRanks;
  window.renderRanks=renderRanks=function(){
   var r=_rr.apply(this,arguments);
   try{ inject(); }catch(e){}
   return r;
  };
  return true;
 }

 // renderRanks is folded into core-b (loads before this file), so hook now;
 // fall back to a short retry if load order ever shifts.
 if(!hook()){
  var n=0, iv=setInterval(function(){ if(hook()||++n>40)clearInterval(iv); },300);
 }
})();
