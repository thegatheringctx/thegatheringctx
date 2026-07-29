// Today+ — make the daily hub feel like a mission you can finish.
// The Today tab lists up to four actions but only the pastor card ever showed a
// done state, and finishing everything felt like nothing. This adds:
//   - a "Today's Mission" progress bar over the cards,
//   - a green check on each card the kid has actually completed TODAY,
//   - a once-a-day celebration when the whole mission is done.
//
// "Done today" is read from one transactions-today query (same shape core-a uses
// for gamePtsToday) plus the pastor card's own state — so it resets each day and
// needs no backend change. Purely additive: it observes the Today tab and
// enhances whatever renderToday produced. If a signal is missing, a card simply
// shows no check; nothing breaks.
(function(){
 if(window.__wzTodayPlus)return; window.__wzTodayPlus=1;
 if(typeof sb!=='function')return;

 function css(){ if(document.getElementById('wz-tp-css'))return;
  var s=document.createElement('style'); s.id='wz-tp-css';
  s.textContent=
   "#wz-tp-bar{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.3);border-radius:14px;padding:.8rem .95rem;margin-bottom:.8rem}"+
   "#wz-tp-bar .tp-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.5rem}"+
   "#wz-tp-bar .tp-t{font-family:Bangers,cursive;font-size:1.05rem;letter-spacing:.04em;color:#f5c842}"+
   "#wz-tp-bar .tp-n{font-size:.74rem;font-weight:800;color:rgba(255,255,255,.6)}"+
   "#wz-tp-bar .tp-track{height:9px;background:rgba(0,0,0,.35);border-radius:6px;overflow:hidden}"+
   "#wz-tp-bar .tp-fill{height:100%;background:linear-gradient(90deg,#f5c842,#ffe08a);border-radius:6px;transition:width .7s cubic-bezier(.34,1.56,.64,1)}"+
   "#wz-tp-bar.tp-alldone{border-color:rgba(126,224,138,.6)}"+
   "#wz-tp-bar.tp-alldone .tp-fill{background:linear-gradient(90deg,#7ee08a,#c7f7cf)}"+
   ".td-card .td-go.tp-check{color:#7ee08a}";
  document.head.appendChild(s); }

 function today(){ return new Date().toISOString().slice(0,10); }
 function dayStart(){ var d=new Date(); d.setHours(0,0,0,0); return d.getTime(); }

 // Which mission each Today card is, keyed by the icon renderToday uses.
 function typeOf(card){
  var ic=card.querySelector('.td-ic'); var e=ic?(ic.textContent||'').trim():'';
  if(e.indexOf('🎥')>=0)return 'pastor';   // 🎥
  if(e.indexOf('📜')>=0)return 'verse';     // 📜
  if(e.indexOf('📖')>=0)return 'devo';      // 📖
  if(e.indexOf('⚔')>=0)return 'battle';          // ⚔️
  return '';
 }

 function markDone(card){
  card.classList.add('done');
  var go=card.querySelector('.td-go'); if(go){ go.textContent='✓'; go.classList.add('tp-check'); }
 }

 function celebrate(){
  try{ if(typeof wzConfetti==='function')wzConfetti(60); }catch(e){}
  try{ if(typeof wzSfxFanfare==='function')wzSfxFanfare(); }catch(e){}
  try{ if(navigator.vibrate)navigator.vibrate([50,40,80]); }catch(e){}
  try{ if(typeof toast==='function')toast('🌟 Mission complete! Way to go, warrior!',4500); }catch(e){}
 }

 function apply(host, doneSet){
  var cards=host.querySelectorAll('.td-card'); if(!cards.length)return;
  var total=0, done=0;
  cards.forEach(function(card){
   var t=typeOf(card); if(!t)return;
   total++;
   var isDone = card.classList.contains('done') || doneSet[t]===true;
   if(isDone){ markDone(card); done++; }
  });
  if(!total)return;

  // progress bar just above the first card
  var bar=host.querySelector('#wz-tp-bar');
  if(!bar){
   bar=document.createElement('div'); bar.id='wz-tp-bar';
   var first=host.querySelector('.td-card');
   if(first&&first.parentNode)first.parentNode.insertBefore(bar,first);
   else host.appendChild(bar);
  }
  var pct=Math.round((done/total)*100);
  var allDone=done>=total;
  bar.className=allDone?'tp-alldone':'';
  var micon=window.wzIcon?wzIcon(allDone?'trophy':'star',16)+' ':'';
  bar.innerHTML="<div class='tp-top'><div class='tp-t'>"+micon+(allDone?'Mission Complete!':'Today’s Mission')+"</div>"+
    "<div class='tp-n'>"+done+" of "+total+" done</div></div>"+
    "<div class='tp-track'><div class='tp-fill' style='width:"+pct+"%'></div></div>";

  // celebrate once per kid per day
  if(allDone && window.APP && APP.kid){
   var key='wz_tp_done_'+APP.kid.id+'_'+today();
   var seen=false; try{ seen=localStorage.getItem(key)==='1'; }catch(e){}
   if(!seen){ try{ localStorage.setItem(key,'1'); }catch(e){} setTimeout(celebrate,500); }
  }
 }

 // one transactions-today read -> which categories the kid earned in today
 function fetchDone(cb){
  var out={pastor:false,verse:false,devo:false,battle:false};
  if(!window.APP||!APP.kid){ cb(out); return; }
  sb("transactions?kid_id=eq."+APP.kid.id+"&created_at=gte."+dayStart()+"&select=category")
   .then(function(rows){
    (rows||[]).forEach(function(r){
     var c=String(r.category||'').toLowerCase();
     if(c.indexOf('game')>=0)out.battle=true;
     if(c.indexOf('devo')>=0)out.devo=true;
     if(c.indexOf('verse')>=0||c.indexOf('memor')>=0)out.verse=true;
     if(c.indexOf('video')>=0)out.pastor=true;
    });
    cb(out);
   }).catch(function(){ cb(out); });
 }

 var busy=false;
 function enhance(){
  var host=document.getElementById('tab-today'); if(!host)return;
  if(!host.querySelector('.td-card'))return;       // renderToday not done yet
  if(host.querySelector('#wz-tp-bar'))return;      // already enhanced this render
  if(busy)return; busy=true;
  fetchDone(function(doneSet){
   try{ apply(host,doneSet); }catch(e){}
   busy=false;
  });
 }

 // Observe the Today tab; renderToday rebuilds it, we re-enhance the new cards.
 function watch(){
  var host=document.getElementById('tab-today'); if(!host)return false;
  if(host.__wzTpWatched)return true; host.__wzTpWatched=1;
  css();
  var deb=null;
  var mo=new MutationObserver(function(){ if(deb)clearTimeout(deb); deb=setTimeout(enhance,150); });
  try{ mo.observe(host,{childList:true}); }catch(e){}
  setTimeout(enhance,200);
  return true;
 }
 var n=0, iv=setInterval(function(){ if(watch()||++n>60)clearInterval(iv); },350);
})();
