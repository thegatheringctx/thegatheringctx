// Polish — the small motion + feedback touches that make the app feel premium.
// Purely cosmetic and additive: it wraps dashTab to animate tab changes, watches
// the points readout to celebrate every earn with a pulse, and adds a soft tick
// when a kid changes tabs (respecting the existing mute toggle). Nothing here
// touches data or game logic; if a hook is missing it simply does less.
(function(){
 if(window.__wzPolish)return; window.__wzPolish=1;

 function css(){ if(document.getElementById('wz-polish-css'))return;
  var s=document.createElement('style'); s.id='wz-polish-css';
  s.textContent=
   "@keyframes wzFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}"+
   ".wz-fade-in{animation:wzFadeUp .34s cubic-bezier(.34,1.56,.64,1)}"+
   "@keyframes wzPtsPulse{0%{transform:scale(1)}35%{transform:scale(1.22)}100%{transform:scale(1)}}"+
   ".wz-pts-pulse{animation:wzPtsPulse .6s cubic-bezier(.34,1.56,.64,1)}"+
   // buttons/cards get a snappier, more tactile press everywhere
   ".btn,.game-card,.td-card,.store-card,.tab-btn,.q-opt,.tf-t,.tf-f,.kp-btn,.armor-card{transition:transform .12s ease, box-shadow .2s ease}"+
   ".game-card:active,.store-card:active,.td-card:active{transform:scale(.96)}"+
   // a gentle sheen that sweeps the hero card when you land on a tab
   "#dash-hero{position:relative;overflow:hidden}"+
   "#dash-hero.wz-sheen::after{content:'';position:absolute;top:0;left:-60%;width:45%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.10),transparent);transform:skewX(-18deg);animation:wzSheen 1.1s ease-out;pointer-events:none;z-index:5}"+
   "@keyframes wzSheen{to{left:130%}}";
  document.head.appendChild(s); }

 // ---- soft UI tick (own tiny synth, gated by the existing mute toggle) ----
 var AC=null;
 function muted(){ try{ return typeof wzMute==='function' && wzMute(); }catch(e){ return false; } }
 function tick(){
  if(muted())return;
  try{
   if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();
   if(AC.state==='suspended')AC.resume();
   var t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain();
   o.type='sine'; o.frequency.value=523;
   o.connect(g); g.connect(AC.destination);
   g.gain.setValueAtTime(0.0001,t);
   g.gain.linearRampToValueAtTime(0.045,t+0.01);
   g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
   o.start(t); o.stop(t+0.12);
  }catch(e){}
 }

 // ---- animate tab changes + sheen the hero ----
 function hookTab(){
  if(typeof window.dashTab!=='function' || window.dashTab.__wzPolish)return;
  var _dt=window.dashTab;
  window.dashTab=function(tab,btn){
   var r=_dt.apply(this,arguments);
   try{
    var pane=document.getElementById('tab-'+tab);
    if(pane){ pane.classList.remove('wz-fade-in'); void pane.offsetWidth; pane.classList.add('wz-fade-in'); }
    var hero=document.getElementById('dash-hero');
    if(hero){ hero.classList.remove('wz-sheen'); void hero.offsetWidth; hero.classList.add('wz-sheen'); }
    if(btn)tick();
   }catch(e){}
   return r;
  };
  window.dashTab.__wzPolish=1;
 }

 // ---- reward pulse whenever the points readout changes ----
 function watchPoints(){
  var el=document.getElementById('dash-pts'); if(!el)return false;
  if(el.__wzPolish)return true; el.__wzPolish=1;
  var last=el.textContent;
  var mo=new MutationObserver(function(){
   var now=el.textContent;
   if(now===last)return;
   var up=(parseInt(now,10)||0)>(parseInt(last,10)||0); last=now;
   if(!up)return;
   ['.pts-pill','#dash-pts2'].forEach(function(sel){
    var n=document.querySelector(sel); if(!n)return;
    n.classList.remove('wz-pts-pulse'); void n.offsetWidth; n.classList.add('wz-pts-pulse');
   });
  });
  try{ mo.observe(el,{childList:true,characterData:true,subtree:true}); }catch(e){}
  return true;
 }

 function init(){ css(); hookTab(); watchPoints(); }
 if(document.readyState!=='loading')init(); else document.addEventListener('DOMContentLoaded',init);
 // dashTab / the readout are created after login and re-wrapped by other modules
 // on timers; match that cadence so we settle on top.
 setTimeout(init,400); setTimeout(init,1300); setTimeout(init,2700);
 var n=0, iv=setInterval(function(){ if((watchPoints()&&window.dashTab&&window.dashTab.__wzPolish)||++n>60)clearInterval(iv); },500);
})();
