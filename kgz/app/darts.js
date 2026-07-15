// Fiery Darts — Ephesians 6:16.
// The first Arena game that needs NO READING: every other game is reading
// comprehension in a costume, which locked out the 4-7 band entirely.
// The mechanic IS the lesson: darts come, you raise the shield, they go out.
// No lives, no "game over", no shaming — a missed dart just puffs out.
//
// MOVEMENT: CSS animation, NOT requestAnimationFrame. rAF returns 0 frames in a
// backgrounded tab, which left darts frozen off-screen while the timer ran down.
(function(){
 if(window.__wzDarts)return; window.__wzDarts=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 function artBg(file){
  return "linear-gradient(rgba(10,8,30,.72),rgba(10,8,30,.9)), url('img/"+file+"') center 28%/cover no-repeat";
 }
 if(!GAMES.some(function(g){return g.id==='darts';})){
  GAMES.push({id:'darts',title:'Fiery Darts',emoji:'\uD83D\uDEE1\uFE0F',bg:artBg('story-god47-2.jpg'),
   pts:20,sub:'Raise the shield · no reading needed'});
 }

 function css(){ if(document.getElementById('wz-fd-css'))return;
  var s=document.createElement('style'); s.id='wz-fd-css';
  s.textContent=
   "#fd-stage{position:relative;width:100%;max-width:520px;margin:0 auto;height:420px;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#2b1140,#0d0820);border:2px solid rgba(245,200,66,.35);touch-action:manipulation;user-select:none}"+
   "#fd-hero{position:absolute;bottom:6px;left:50%;margin-left:-52px;width:104px;height:104px;border-radius:50%;object-fit:cover;border:3px solid rgba(245,200,66,.75);background:#1a1a2e}"+
   "#fd-shield{position:absolute;bottom:104px;left:50%;margin-left:-26px;font-size:3rem;opacity:0;transition:opacity .12s,transform .12s;pointer-events:none;transform:scale(.6)}"+
   "#fd-shield.up{opacity:1;transform:scale(1)}"+
   ".fd-dart{position:absolute;top:-40px;font-size:2.2rem;cursor:pointer;padding:14px;margin:-14px;line-height:1;animation-name:fdfall;animation-timing-function:linear;animation-fill-mode:forwards}"+
   "@keyframes fdfall{from{transform:translateY(0)}to{transform:translateY(460px)}}"+
   ".fd-pop{animation:fdpop .3s forwards !important}"+
   "@keyframes fdpop{to{transform:scale(2.2);opacity:0}}"+
   "#fd-hud{display:flex;justify-content:space-between;align-items:center;margin:0 auto .5rem;max-width:520px}"+
   ".fd-stat{font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;line-height:1}"+
   ".fd-lab{font-size:.58rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45)}"+
   "#fd-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.2rem;background:rgba(10,8,30,.9);z-index:5}"+
   "#fd-msg h3{font-family:Bangers,cursive;font-size:2rem;color:#f5c842;margin:0 0 .3rem;letter-spacing:.03em}"+
   "#fd-msg p{color:rgba(255,255,255,.82);font-size:.88rem;margin:0 0 .9rem;line-height:1.5;max-width:330px}"+
   "#fd-msg .v{font-style:italic;color:#fff;font-size:.8rem;border-left:3px solid #f5c842;padding-left:.6rem;margin-bottom:.9rem;text-align:left;max-width:330px}"+
   ".fd-btn{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.75rem 1.5rem;font-weight:900;font-size:1rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }

 function heroSrc(){
  try{
   var a=(APP.kid&&APP.kid.avatar)||'';
   var map={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',
            w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
   return 'img/'+(map[a]||'warrior-boy.png');
  }catch(e){ return 'img/warrior-boy.png'; }
 }

 window.initDarts=function(el){
  css();
  el.innerHTML='';
  var hud=document.createElement('div'); hud.id='fd-hud';
  hud.innerHTML="<div><div class='fd-stat' id='fd-blocked'>0</div><div class='fd-lab'>Blocked</div></div>"+
                "<div style='text-align:right'><div class='fd-stat' id='fd-time'>40</div><div class='fd-lab'>Seconds</div></div>";
  el.appendChild(hud);

  var stage=document.createElement('div'); stage.id='fd-stage';
  var hero=document.createElement('img'); hero.id='fd-hero'; hero.src=heroSrc(); hero.alt='Your warrior';
  hero.onerror=function(){ hero.style.display='none'; };
  var shield=document.createElement('div'); shield.id='fd-shield'; shield.textContent='\uD83D\uDEE1\uFE0F';
  stage.appendChild(hero); stage.appendChild(shield);
  el.appendChild(stage);

  var msg=document.createElement('div'); msg.id='fd-msg';
  msg.innerHTML="<h3>Fiery Darts</h3>"+
   "<p>Darts are coming at your warrior. <b>Tap each one</b> to raise the shield and put it out.</p>"+
   "<div class='v'>\u201CTake up the shield of faith, with which you can extinguish all the flaming darts of the evil one.\u201D<br>Ephesians 6:16</div>";
  var go=document.createElement('button'); go.className='fd-btn'; go.textContent='\u2694\uFE0F Start';
  msg.appendChild(go); stage.appendChild(msg);

  var blocked=0, running=false, t=40, spawnT=null, tickT=null;

  function flash(){ shield.classList.add('up'); setTimeout(function(){ shield.classList.remove('up'); },170); }

  function spawn(){
   if(!running)return;
   var d=document.createElement('div');
   d.className='fd-dart'; d.textContent='\uD83D\uDD25';
   var w=stage.clientWidth||320;
   d.style.left=Math.max(8,Math.round(18+Math.random()*(w-70)))+'px';
   // 3.2s to 5s to cross — gentle enough for a 5-year-old to actually hit
   d.style.animationDuration=(3.2+Math.random()*1.8)+'s';
   d.addEventListener('click',function(e){
    e.stopPropagation();
    if(!running||d.dataset.dead)return;
    d.dataset.dead='1';
    d.classList.add('fd-pop'); flash();
    blocked++; document.getElementById('fd-blocked').textContent=blocked;
    setTimeout(function(){ if(d.parentNode)d.remove(); },320);
   });
   // reached the warrior without being tapped: puff out, cost nothing
   d.addEventListener('animationend',function(ev){
    if(ev.animationName!=='fdfall')return;
    if(d.dataset.dead)return;
    d.dataset.dead='1';
    d.classList.add('fd-pop');
    setTimeout(function(){ if(d.parentNode)d.remove(); },320);
   });
   stage.appendChild(d);
  }

  function stop(){
   running=false;
   clearInterval(spawnT); clearInterval(tickT);
   var all=stage.querySelectorAll('.fd-dart');
   for(var i=0;i<all.length;i++)all[i].remove();
   var pts=Math.min(20, Math.round(blocked*0.8));
   msg.innerHTML="<h3>\u2713 Shield Up!</h3>"+
    "<p>You put out <b style='color:#f5c842'>"+blocked+"</b> flaming darts.<br>That is what faith does.</p>"+
    "<div class='v'>\u201CTake up the shield of faith, with which you can extinguish all the flaming darts of the evil one.\u201D<br>Ephesians 6:16</div>";
   var again=document.createElement('button'); again.className='fd-btn'; again.textContent='Play again';
   again.onclick=function(){ initDarts(el); };
   msg.appendChild(again);
   msg.style.display='flex';
   if(pts>0 && window.APP && APP.kid && typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'darts',amount:pts})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('\u26A1 +'+res.granted+' pts!',2500);
       else if(typeof toast==='function')toast('\uD83C\uDFAE Daily game points are maxed — play for fun!',3000);
      }
     }).catch(function(){});
   }
  }

  go.onclick=function(){
   msg.style.display='none';
   running=true; blocked=0; t=40;
   document.getElementById('fd-blocked').textContent='0';
   document.getElementById('fd-time').textContent='40';
   spawn(); spawn();
   spawnT=setInterval(spawn,700);
   tickT=setInterval(function(){
    t--; document.getElementById('fd-time').textContent=t;
    if(t<=0)stop();
   },1000);
  };

  stage.addEventListener('click',function(){ if(running)flash(); });
 };

 var _rg=renderGames;
 renderGames=function(gameId){
  var r=_rg.apply(this,arguments);
  if(gameId==='darts'){
   var a=document.getElementById('game-arena');
   if(a)initDarts(a);
  }
  return r;
 };
})();
