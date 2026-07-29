// Juice Pack — tactile + audible feedback across the whole Arena.
// Before: only the FINAL point-award chimed (wzSyncKid -> wzSfxEarn). A kid could
// answer 10 quiz questions and hear nothing until the end. Kids need feedback on
// EVERY tap — that is what makes a game feel alive.
//
// How it works: instead of editing all six games, we watch the dashboard for the
// exact CSS classes the games already add on a right/wrong answer (.correct,
// .wrong, .match-matched) and fire a short tone + a gentle haptic buzz. Purely
// additive, reads nothing, breaks nothing. Respects the existing mute toggle
// (wzMute) and does nothing on browsers without WebAudio/vibrate.
//
// Tone philosophy matches the app: correct = warm rising chime, wrong = a soft
// low "boop", never harsh. No shaming. A quick run of correct answers nudges the
// pitch up so a streak literally sounds better.
(function(){
 if(window.__wzJuice)return; window.__wzJuice=1;

 // ---- audio (self-contained; core-a's `tone` is module-private) ----
 var AC=null;
 function muted(){ try{ return typeof wzMute==='function' && wzMute(); }catch(e){ return false; } }
 function ctx(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
 function tone(freq,dur,type,vol,delay){
  var ac=ctx(); if(!ac||muted())return;
  try{ if(ac.state==='suspended')ac.resume(); }catch(e){}
  var t=ac.currentTime+(delay||0);
  var o=ac.createOscillator(), g=ac.createGain();
  o.type=type||'sine'; o.frequency.value=freq; o.connect(g); g.connect(ac.destination);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(vol||.10,t+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t); o.stop(t+dur+0.06);
 }
 function buzz(pattern){ if(navigator.vibrate){ try{ navigator.vibrate(pattern); }catch(e){} } }

 // ---- combo: consecutive correct answers raise the pitch ----
 var combo=0, lastCorrect=0;
 function correctFx(){
  var now=Date.now();
  combo = (now-lastCorrect < 6000) ? Math.min(combo+1,6) : 1;
  lastCorrect=now;
  var base=587 + combo*44;               // D5 climbing with the streak
  tone(base,0.11,'triangle',.11,0);
  tone(base*1.5,0.14,'triangle',.09,0.06);
  buzz(30);
 }
 function wrongFx(){
  combo=0;
  tone(196,0.16,'sine',.09,0);           // gentle low G, no sting
  buzz([12,50,12]);
 }

 // Debounce so one answer that flips several nodes fires once.
 var pending=null, sawCorrect=false, sawWrong=false;
 function flush(){
  pending=null;
  if(sawCorrect)correctFx(); else if(sawWrong)wrongFx();
  sawCorrect=sawWrong=false;
 }
 function note(kind){
  if(kind==='correct')sawCorrect=true; else sawWrong=true;
  if(!pending)pending=setTimeout(flush,40);
 }

 function classify(cls){
  if(!cls||cls.indexOf)cls=String(cls||'');
  // positive: quiz/tf right answer, memory-match pair made
  if(/\b(correct|match-matched)\b/.test(cls))return 'correct';
  // negative: quiz/tf wrong answer, verse-builder wrong tile
  if(/\b(wrong|vg-tile[^"]*\bbad|chip[^"]*\bbad)\b/.test(cls) || /\bwrong\b/.test(cls))return 'wrong';
  return null;
 }

 function watch(root){
  if(!root||root.__wzJuiceWatched)return; root.__wzJuiceWatched=1;
  var mo=new MutationObserver(function(muts){
   for(var i=0;i<muts.length;i++){
    var m=muts[i];
    if(m.type!=='attributes'||m.attributeName!=='class')continue;
    var k=classify(m.target.className);
    if(k)note(k);
   }
  });
  try{ mo.observe(root,{attributes:true,attributeName:['class'],subtree:true}); }catch(e){}
 }

 // #dash-main holds every game; wait for it, then watch it.
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>200){ clearInterval(iv); return; }
  var main=document.getElementById('dash-main');
  if(main){ clearInterval(iv); watch(main); }
 },400);

 // First user gesture unlocks the audio context on iOS/Safari.
 function unlock(){ try{ var ac=ctx(); if(ac&&ac.state==='suspended')ac.resume(); }catch(e){} }
 document.addEventListener('touchstart',unlock,{once:true,passive:true});
 document.addEventListener('click',unlock,{once:true});
})();
