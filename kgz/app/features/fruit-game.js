// Fruit of the Spirit — Galatians 5:22-23.
// A joyful COLLECT game (the Arena's other reflex game, Fiery Darts, is about
// defense; this one is about receiving). Nine fruits drift up the stage; tap
// each kind to gather it into your basket. No timer, no losing — a fruit you
// miss just floats off and comes back. The goal is simply to collect all nine,
// which walks the child through the whole list.
//
// Movement is CSS animation (not requestAnimationFrame), matching darts.js, so
// it keeps working if the tab is backgrounded. Award path mirrors the other
// games (wz-award, key 'fruit'); the server enforces the daily cap.
(function(){
 if(window.__wzFruit)return; window.__wzFruit=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 function artBg(file){
  return "linear-gradient(rgba(10,8,30,.7),rgba(10,8,30,.9)), url('img/"+file+"') center 30%/cover no-repeat";
 }
 if(!GAMES.some(function(g){return g.id==='fruit';})){
  GAMES.push({id:'fruit',title:'Fruit Basket',emoji:'🧺',bg:artBg('story-way-3.jpg'),
   pts:15,sub:'Collect the fruit of the Spirit'});
 }

 // Galatians 5:22-23 order.
 var FRUITS=[
  {k:'love',n:'Love',e:'❤️'},{k:'joy',n:'Joy',e:'😊'},{k:'peace',n:'Peace',e:'🕊️'},
  {k:'patience',n:'Patience',e:'⏳'},{k:'kindness',n:'Kindness',e:'🤝'},{k:'goodness',n:'Goodness',e:'🌟'},
  {k:'faith',n:'Faithfulness',e:'🙏'},{k:'gentleness',n:'Gentleness',e:'🍃'},{k:'selfcontrol',n:'Self-Control',e:'🛑'}
 ];

 function css(){ if(document.getElementById('wz-fr-css'))return;
  var s=document.createElement('style'); s.id='wz-fr-css';
  s.textContent=
   "#fr-wrap{max-width:520px;margin:0 auto}"+
   "#fr-checklist{display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;margin-bottom:.6rem}"+
   ".fr-slot{display:flex;align-items:center;gap:.3rem;border-radius:20px;padding:.25rem .55rem;font-size:.66rem;font-weight:800;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.4)}"+
   ".fr-slot .fe{font-size:.95rem;filter:grayscale(1);opacity:.4}"+
   ".fr-slot.on{background:rgba(126,224,138,.14);border-color:rgba(126,224,138,.5);color:#bff3c8}"+
   ".fr-slot.on .fe{filter:none;opacity:1}"+
   "#fr-stage{position:relative;width:100%;height:400px;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#123a25,#0a1f14);border:2px solid rgba(126,224,138,.3);touch-action:manipulation;user-select:none}"+
   "#fr-basket{position:absolute;bottom:6px;left:50%;margin-left:-30px;font-size:3.4rem;z-index:3;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5))}"+
   ".fr-fruit{position:absolute;bottom:-52px;font-size:2.4rem;cursor:pointer;padding:12px;margin:-12px;line-height:1;animation-name:frrise;animation-timing-function:linear;animation-fill-mode:forwards}"+
   "@keyframes frrise{from{transform:translateY(0)}to{transform:translateY(-460px)}}"+
   ".fr-pop{animation:frpop .35s forwards !important}"+
   "@keyframes frpop{to{transform:scale(2) translateY(-30px);opacity:0}}"+
   "#fr-hud{display:flex;justify-content:space-between;align-items:center;margin:0 auto .5rem;max-width:520px}"+
   ".fr-stat{font-family:Bangers,cursive;font-size:1.6rem;color:#7ee08a;line-height:1}"+
   ".fr-lab{font-size:.58rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45)}"+
   "#fr-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.2rem;background:rgba(10,20,14,.92);z-index:5}"+
   "#fr-msg h3{font-family:Bangers,cursive;font-size:2rem;color:#7ee08a;margin:0 0 .3rem;letter-spacing:.03em}"+
   "#fr-msg p{color:rgba(255,255,255,.85);font-size:.88rem;margin:0 0 .9rem;line-height:1.5;max-width:340px}"+
   "#fr-msg .v{font-style:italic;color:#fff;font-size:.8rem;border-left:3px solid #7ee08a;padding-left:.6rem;margin-bottom:.9rem;text-align:left;max-width:340px}"+
   ".fr-btn{background:#7ee08a;color:#0a1f14;border:none;border-radius:11px;padding:.75rem 1.5rem;font-weight:900;font-size:1rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }

 window.initFruit=function(el){
  css();
  el.innerHTML='';
  var wrap=document.createElement('div'); wrap.id='fr-wrap';
  var hud=document.createElement('div'); hud.id='fr-hud';
  hud.innerHTML="<div><div class='fr-stat' id='fr-count'>0</div><div class='fr-lab'>of 9 gathered</div></div>"+
                "<div style='text-align:right;max-width:60%'><div class='fr-lab'>Galatians 5:22-23</div></div>";
  wrap.appendChild(hud);

  var check=document.createElement('div'); check.id='fr-checklist';
  FRUITS.forEach(function(f){
   var sl=document.createElement('div'); sl.className='fr-slot'; sl.dataset.k=f.k;
   sl.innerHTML="<span class='fe'>"+f.e+"</span>"+f.n;
   check.appendChild(sl);
  });
  wrap.appendChild(check);

  var stage=document.createElement('div'); stage.id='fr-stage';
  var basket=document.createElement('div'); basket.id='fr-basket'; basket.textContent='🧺';
  stage.appendChild(basket);

  var msg=document.createElement('div'); msg.id='fr-msg';
  msg.innerHTML="<h3>🧺 Fruit Basket</h3>"+
   "<p>The fruit of the Spirit is floating up. <b>Tap each one</b> to gather it into your basket. Collect all nine!</p>"+
   "<div class='v'>“The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.”<br>Galatians 5:22-23</div>";
  var go=document.createElement('button'); go.className='fr-btn'; go.textContent='🧺 Start';
  msg.appendChild(go); stage.appendChild(msg);
  wrap.appendChild(stage); el.appendChild(wrap);

  var got={}, running=false, spawnT=null;

  function collected(){ var n=0; for(var k in got){ if(got[k])n++; } return n; }

  function celebrateFruit(f){
   got[f.k]=true;
   var sl=check.querySelector(".fr-slot[data-k='"+f.k+"']"); if(sl)sl.classList.add('on');
   document.getElementById('fr-count').textContent=collected();
   if(typeof toast==='function')toast(f.e+' '+f.n+'!',1400);
   if(navigator.vibrate){ try{ navigator.vibrate(25); }catch(e){} }
   if(collected()>=FRUITS.length)finish();
  }

  function spawn(){
   if(!running)return;
   // bias toward fruit not yet collected
   var pool=FRUITS.filter(function(f){return !got[f.k];});
   if(!pool.length)pool=FRUITS;
   var f=pool[Math.floor(Math.random()*pool.length)];
   var d=document.createElement('div'); d.className='fr-fruit'; d.textContent=f.e;
   var w=stage.clientWidth||320;
   d.style.left=Math.max(8,Math.round(14+Math.random()*(w-60)))+'px';
   d.style.animationDuration=(3.6+Math.random()*2)+'s';
   d.addEventListener('click',function(ev){
    ev.stopPropagation();
    if(!running||d.dataset.dead)return;
    d.dataset.dead='1'; d.classList.add('fr-pop');
    if(!got[f.k])celebrateFruit(f);
    else if(navigator.vibrate){ try{ navigator.vibrate(12); }catch(e){} }
    setTimeout(function(){ if(d.parentNode)d.remove(); },360);
   });
   d.addEventListener('animationend',function(e){
    if(e.animationName!=='frrise'||d.dataset.dead)return;
    d.dataset.dead='1'; if(d.parentNode)d.remove();
   });
   stage.appendChild(d);
  }

  function finish(){
   running=false; clearInterval(spawnT);
   var all=stage.querySelectorAll('.fr-fruit'); for(var i=0;i<all.length;i++)all[i].remove();
   msg.innerHTML="<h3>✓ Basket Full!</h3>"+
    "<p>You gathered <b style='color:#7ee08a'>all nine</b> fruit of the Spirit. Ask God to grow them in you.</p>"+
    "<div class='v'>“The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.”<br>Galatians 5:22-23</div>";
   var again=document.createElement('button'); again.className='fr-btn'; again.textContent='Play again';
   again.onclick=function(){ initFruit(el); };
   msg.appendChild(again); msg.style.display='flex';
   if(window.APP && APP.kid && typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'fruit',amount:15})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('⚡ +'+res.granted+' pts!',2500);
       else if(typeof toast==='function')toast('🎮 Daily game points are maxed — play for fun!',3000);
      }
     }).catch(function(){});
   }
  }

  go.onclick=function(){
   msg.style.display='none'; running=true; got={};
   document.getElementById('fr-count').textContent='0';
   check.querySelectorAll('.fr-slot').forEach(function(s){ s.classList.remove('on'); });
   spawn(); spawn();
   spawnT=setInterval(spawn,900);
  };
 };

 var _rg=renderGames;
 renderGames=function(gameId){
  var r=_rg.apply(this,arguments);
  if(gameId==='fruit'){
   var a=document.getElementById('game-arena');
   if(a)initFruit(a);
  }
  return r;
 };
})();
