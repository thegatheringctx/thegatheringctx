// Books of the Bible — put the books back in order.
// A calm, no-timer ordering game (same spirit as the Verse Builder): tap the
// books in the right order, a wrong tap just wobbles and costs nothing. Teaches
// something genuinely useful — where things live in Scripture — instead of only
// testing recall.
//
// Age-aware: 4-7 order a short, famous run (4 books); 8-12 get a 6-book run.
// We use CURATED consecutive runs, never a random slice, so a kid is never asked
// to order four obscure minor prophets. Award path mirrors Fiery Darts exactly
// (wz-award, key 'books'); the server enforces the daily cap.
(function(){
 if(window.__wzBooks)return; window.__wzBooks=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 function artBg(file){
  return "linear-gradient(rgba(10,8,30,.72),rgba(10,8,30,.9)), url('img/"+file+"') center 30%/cover no-repeat";
 }
 if(!GAMES.some(function(g){return g.id==='books';})){
  GAMES.push({id:'books',title:'Books in Order',emoji:'📚',bg:artBg('story-bible-1.jpg'),
   pts:20,sub:'Put the Bible’s books in order'});
 }

 // Curated, well-known consecutive runs.
 var RUNS_47=[
  ['Genesis','Exodus','Leviticus','Numbers'],
  ['Matthew','Mark','Luke','John'],
  ['Joshua','Judges','Ruth','1 Samuel'],
  ['John','Acts','Romans','1 Corinthians']
 ];
 var RUNS_812=[
  ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua'],
  ['Matthew','Mark','Luke','John','Acts','Romans'],
  ['1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles'],
  ['Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians']
 ];

 function grp(){ try{ return (window.APP&&APP.kid&&APP.kid.age_group)||'812'; }catch(e){ return '812'; } }
 function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
 function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

 function css(){ if(document.getElementById('wz-bk-css'))return;
  var s=document.createElement('style'); s.id='wz-bk-css';
  s.textContent=
   "#bk-wrap{max-width:520px;margin:0 auto}"+
   "#bk-head{background:linear-gradient(135deg,#180444,#051a40);border:1.5px solid rgba(245,200,66,.3);border-radius:18px;padding:1rem;text-align:center;margin-bottom:.85rem}"+
   "#bk-head h3{font-family:Bangers,cursive;font-size:1.5rem;color:#fff;letter-spacing:.03em;margin:0}"+
   "#bk-head p{color:rgba(255,255,255,.6);font-size:.76rem;margin:.25rem 0 0}"+
   "#bk-order{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.85rem}"+
   ".bk-slot{display:flex;align-items:center;gap:.6rem;min-height:46px;border-radius:12px;padding:.35rem .6rem;background:rgba(255,255,255,.04);border:1.5px dashed rgba(245,200,66,.3)}"+
   ".bk-slot.done{border-style:solid;border-color:#7ee08a;background:rgba(126,224,138,.1)}"+
   ".bk-slot.next{border-color:#f5c842;background:rgba(245,200,66,.08)}"+
   ".bk-idx{font-family:Bangers,cursive;font-size:1.1rem;color:#f5c842;width:24px;text-align:center;flex-shrink:0}"+
   ".bk-slot.done .bk-idx{color:#7ee08a}"+
   ".bk-fill{font-weight:800;font-size:.95rem;color:#fff}"+
   ".bk-bank{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center}"+
   ".bk-tile{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.6rem .9rem;font-size:.95rem;font-weight:800;cursor:pointer;font-family:inherit;min-height:44px}"+
   ".bk-tile:disabled{opacity:.2;cursor:default}"+
   ".bk-tile.bad{animation:bkwob .4s}"+
   ".bk-tile.peek{box-shadow:0 0 0 3px rgba(126,224,138,.8);animation:bkpulse 1s}"+
   "@keyframes bkwob{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px) rotate(-3deg)}75%{transform:translateX(7px) rotate(3deg)}}"+
   "@keyframes bkpulse{0%,100%{box-shadow:0 0 0 3px rgba(126,224,138,.2)}50%{box-shadow:0 0 0 4px rgba(126,224,138,.9)}}"+
   "#bk-msg{text-align:center;padding:1.1rem;background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.35);border-radius:16px;margin-top:.5rem}"+
   "#bk-msg h4{font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;margin:0 0 .3rem;letter-spacing:.03em}"+
   "#bk-msg p{color:rgba(255,255,255,.82);font-size:.86rem;margin:0 0 .8rem}"+
   ".bk-btn{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.7rem 1.4rem;font-weight:900;font-size:.95rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }

 window.initBooks=function(el){
  css();
  var run=pick(grp()==='47'?RUNS_47:RUNS_812);
  var target=run.slice();               // canonical order
  var filled=0, wrongOnSlot=0, hinted=false;

  el.innerHTML='';
  var wrap=document.createElement('div'); wrap.id='bk-wrap';
  wrap.innerHTML=
   "<div id='bk-head'><h3>📚 Books in Order</h3>"+
   "<p>Tap the books in the order they appear in the Bible.</p></div>"+
   "<div id='bk-order'></div><div class='bk-bank' id='bk-bank'></div>";
  el.appendChild(wrap);

  var order=wrap.querySelector('#bk-order');
  var bank=wrap.querySelector('#bk-bank');

  target.forEach(function(_,i){
   var slot=document.createElement('div'); slot.className='bk-slot'+(i===0?' next':'');
   slot.innerHTML="<div class='bk-idx'>"+(i+1)+"</div><div class='bk-fill'></div>";
   slot.dataset.i=String(i);
   order.appendChild(slot);
  });

  var tiles={};
  shuffle(run).forEach(function(name){
   var b=document.createElement('button'); b.className='bk-tile'; b.textContent=name;
   b.onclick=function(){ tap(b,name); };
   bank.appendChild(b); tiles[name]=b;
  });

  function markNext(){
   var slots=order.querySelectorAll('.bk-slot');
   slots.forEach(function(s){ s.classList.remove('next'); });
   if(filled<slots.length)slots[filled].classList.add('next');
  }

  function tap(btn,name){
   if(btn.disabled)return;
   if(name!==target[filled]){
    btn.classList.add('bad'); setTimeout(function(){ btn.classList.remove('bad'); },420);
    wrongOnSlot++;
    // gentle help after a few misses — a peek, never a penalty, never a scold
    if(wrongOnSlot>=3){ hinted=true; var right=tiles[target[filled]];
     if(right){ right.classList.add('peek'); setTimeout(function(){ right.classList.remove('peek'); },1000); } }
    return;
   }
   var slot=order.querySelector(".bk-slot[data-i='"+filled+"']");
   if(slot){ slot.classList.add('done'); slot.querySelector('.bk-fill').textContent=name; }
   btn.disabled=true; filled++; wrongOnSlot=0; markNext();
   if(filled>=target.length)done();
  }

  function done(){
   var base=(grp()==='47')?15:20;
   var pts=hinted?Math.max((grp()==='47')?8:10, base-5):base;
   var msg=document.createElement('div'); msg.id='bk-msg';
   msg.innerHTML="<h4>✓ In Order!</h4><p>You put <b style='color:#f5c842'>"+target.length+"</b> books in the right place. Now you know where to find them.</p>";
   var again=document.createElement('button'); again.className='bk-btn'; again.textContent='Play again';
   again.onclick=function(){ initBooks(el); };
   msg.appendChild(again); wrap.appendChild(msg);
   if(window.APP && APP.kid && typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'books',amount:pts})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('⚡ +'+res.granted+' pts!',2500);
       else if(typeof toast==='function')toast('🎮 Daily game points are maxed — play for fun!',3000);
      }
     }).catch(function(){});
   }
  }
 };

 var _rg=renderGames;
 renderGames=function(gameId){
  var r=_rg.apply(this,arguments);
  if(gameId==='books'){
   var a=document.getElementById('game-arena');
   if(a)initBooks(a);
  }
  return r;
 };
})();
