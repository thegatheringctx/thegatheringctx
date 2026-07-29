// Warrior Locker — the emotional heart of the app: YOUR warrior, suiting up.
// The whole zone is themed "put on the full armor of God" (Ephesians 6), but the
// armor was only ever a progress bar + an emoji grid. Kids bond with a character,
// not a bar. This is a full-screen hero moment: the child's own warrior (their
// colors, their look) stands tall and the armor pieces they've EARNED snap on one
// by one with light and sound. Tapping a piece teaches its verse from Ephesians 6.
//
// It reuses what already exists — armorSVG (which already draws each earned
// piece), getArmor / WZ_TIERS (the real thresholds), and the celebration SFX —
// so it's purely additive and cannot change points or unlocks. A gold "Enter my
// Locker" button is added to the Armor tab; the Locker itself is a separate
// full-screen overlay, so it never fights the existing armor rendering.
(function(){
 if(window.__wzLocker)return; window.__wzLocker=1;

 // Ephesians 6 — each piece's verse + a kid-friendly meaning. Order matches
 // WZ_TIERS. Kept short, accurate, and orthodox.
 var PIECES=[
  {k:'belt',        e:'🎗️', name:'Belt of Truth',            ref:'Ephesians 6:14',
   verse:'“Stand therefore, having fastened on the belt of truth.”',
   mean:'Truth holds everything together. When you live in God’s truth, you stand strong.'},
  {k:'breastplate', e:'🛡️', name:'Breastplate of Righteousness', ref:'Ephesians 6:14',
   verse:'“…and having put on the breastplate of righteousness.”',
   mean:'It guards your heart. You are made right with God through Jesus, not by being perfect.'},
  {k:'boots',       e:'🥾', name:'Gospel Boots of Peace',     ref:'Ephesians 6:15',
   verse:'“…as shoes for your feet, having put on the readiness given by the gospel of peace.”',
   mean:'You’re ready to go and carry God’s peace wherever you walk.'},
  {k:'shield',      e:'🛡️', name:'Shield of Faith',           ref:'Ephesians 6:16',
   verse:'“In all circumstances take up the shield of faith, with which you can extinguish all the flaming darts of the evil one.”',
   mean:'Faith in God stops the enemy’s lies. Trust God and you are protected.'},
  {k:'helmet',      e:'⛑️', name:'Helmet of Salvation',       ref:'Ephesians 6:17',
   verse:'“…take the helmet of salvation.”',
   mean:'It guards your mind. You know you belong to God and are safe in Jesus.'},
  {k:'sword',       e:'⚔️', name:'Sword of the Spirit',       ref:'Ephesians 6:17',
   verse:'“…and the sword of the Spirit, which is the word of God.”',
   mean:'God’s Word is your weapon. Know it, speak it, and stand strong.'},
  {k:'full',        e:'🏆', name:'The Full Armor of God',     ref:'Ephesians 6:11',
   verse:'“Put on the whole armor of God, that you may be able to stand against the schemes of the devil.”',
   mean:'Wearing it all, you are ready for anything, because your strength is in the Lord.'}
 ];
 // Titles a kid grows into, by how many pieces they wear (not counting FULL).
 var TITLES=['Recruit','Squire','Shield-Bearer','Guardian','Defender','Champion','Full Warrior of God'];

 function has(kid){ try{ var a=getArmor(kid)||[]; return function(id){ return a.indexOf(id)>=0; }; }catch(e){ return function(){return false;}; } }
 function earnedList(kid){ try{ return getArmor(kid)||[]; }catch(e){ return []; } }
 function tiers(){ if(window.WZ_TIERS&&WZ_TIERS.length)return WZ_TIERS; return PIECES.map(function(p,i){return {k:p.k,n:p.name,p:[50,150,400,900,2000,4000,8000][i]};}); }
 function life(kid){ return kid?(kid.lifetime_points!=null?kid.lifetime_points:(kid.points||0)):0; }
 // Real illustrated warrior art (and animated clips) already shipped with the app.
 var HERO_IMG={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
 var HERO_VID={w1:'warrior-1.mp4',w2:'warrior-2.mp4',w3:'warrior-3.mp4',w4:'warrior-4.mp4',w5:'warrior-5.mp4',w6:'warrior-6.mp4'};
 function heroKey(kid){ var a=(kid&&kid.avatar)||''; return HERO_IMG[a]?a:'w1'; }

 function css(){ if(document.getElementById('wz-lk-css'))return;
  var s=document.createElement('style'); s.id='wz-lk-css';
  s.textContent=
   "#wz-lk{position:fixed;inset:0;z-index:100050;background:radial-gradient(circle at 50% 30%,#221056,#07031a 70%);overflow-y:auto;display:none}"+
   "#wz-lk.show{display:block;animation:wzlkin .35s ease}"+
   "@keyframes wzlkin{from{opacity:0}to{opacity:1}}"+
   "#wz-lk .lk-in{max-width:460px;margin:0 auto;padding:1.1rem 1.1rem 2.2rem;position:relative}"+
   "#wz-lk .lk-x{position:absolute;top:.7rem;right:.9rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;width:38px;height:38px;border-radius:50%;font-size:1.1rem;cursor:pointer;z-index:3}"+
   "#wz-lk .lk-name{font-family:Bangers,cursive;font-size:2.3rem;color:#fff;text-align:center;letter-spacing:.03em;line-height:1;margin:.4rem 0 .1rem;text-shadow:0 0 30px rgba(245,200,66,.5)}"+
   "#wz-lk .lk-title{text-align:center;color:#f5c842;font-weight:900;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.5rem}"+
   "#wz-lk .lk-stage{position:relative;height:300px;display:flex;align-items:center;justify-content:center;margin-bottom:.3rem}"+
   "#wz-lk .lk-aura{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(245,200,66,.45),rgba(245,200,66,0) 68%);animation:wzlkpulse 3.6s ease-in-out infinite}"+
   "@keyframes wzlkpulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.65;transform:scale(1.08)}}"+
   "#wz-lk .lk-hero{position:relative;z-index:2;width:216px;height:216px;border-radius:28px;overflow:hidden;border:3px solid rgba(245,200,66,.6);box-shadow:0 12px 34px rgba(0,0,0,.55),0 0 46px rgba(245,200,66,.28);animation:wzlkfloat 4.4s ease-in-out infinite;background:#140a2e}"+
   "#wz-lk .lk-hero video,#wz-lk .lk-hero img{width:100%;height:100%;object-fit:cover;display:block}"+
   "@keyframes wzlkfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}"+
   "#wz-lk .lk-piece.reveal{animation:wzlkrev .55s cubic-bezier(.34,1.56,.64,1)}"+
   "@keyframes wzlkrev{0%{transform:scale(.55);opacity:.3}60%{transform:scale(1.14)}100%{transform:scale(1)}}"+
   "#wz-lk .lk-quest{background:rgba(255,255,255,.05);border:1px solid rgba(245,200,66,.3);border-radius:14px;padding:.7rem .9rem;margin-bottom:.9rem;text-align:center}"+
   "#wz-lk .lk-quest .qn{font-size:.8rem;color:#fff;font-weight:800}"+
   "#wz-lk .lk-quest .qb{height:9px;background:rgba(0,0,0,.35);border-radius:6px;overflow:hidden;margin:.45rem 0 .2rem}"+
   "#wz-lk .lk-quest .qf{height:100%;background:linear-gradient(90deg,#f5c842,#ffe08a);border-radius:6px;transition:width .8s}"+
   "#wz-lk .lk-quest .qs{font-size:.68rem;color:rgba(255,255,255,.5)}"+
   "#wz-lk .lk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:.9rem}"+
   "#wz-lk .lk-piece{text-align:center;border-radius:14px;padding:.6rem .2rem;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);cursor:pointer;transition:transform .12s}"+
   "#wz-lk .lk-piece:active{transform:scale(.94)}"+
   "#wz-lk .lk-piece.on{border-color:rgba(245,200,66,.5);background:linear-gradient(160deg,rgba(245,200,66,.15),rgba(245,200,66,.03));box-shadow:0 0 14px rgba(245,200,66,.15)}"+
   "#wz-lk .lk-piece .pe{font-size:1.7rem;display:block}"+
   "#wz-lk .lk-piece.off .pe{filter:grayscale(1);opacity:.3}"+
   "#wz-lk .lk-piece .pn{font-size:.55rem;font-weight:800;color:#fff;line-height:1.15;margin-top:.2rem}"+
   "#wz-lk .lk-piece.off .pn{color:rgba(255,255,255,.4)}"+
   "#wz-lk .lk-verse{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.35);border-radius:16px;padding:1rem;margin-bottom:.9rem;min-height:110px}"+
   "#wz-lk .lk-verse .vr{color:#f5c842;font-weight:900;font-size:.72rem;letter-spacing:.05em;margin-bottom:.35rem}"+
   "#wz-lk .lk-verse .vt{color:#fff;font-style:italic;font-size:.9rem;line-height:1.5;margin-bottom:.45rem}"+
   "#wz-lk .lk-verse .vm{color:rgba(255,255,255,.7);font-size:.8rem;line-height:1.5}"+
   "#wz-lk .lk-verse.locked .vt{color:rgba(255,255,255,.5)}"+
   "#wz-lk .lk-btns{display:flex;gap:.55rem}"+
   "#wz-lk .lk-btn{flex:1;border:none;border-radius:12px;padding:.8rem;font-family:Bangers,cursive;font-size:1.05rem;letter-spacing:.05em;cursor:pointer}"+
   "#wz-lk .lk-gold{background:linear-gradient(135deg,#f5c842,#E09000);color:#0A0318}"+
   "#wz-lk .lk-dark{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff}"+
   ".lk-launch{width:100%;border:none;border-radius:16px;padding:.95rem;margin-bottom:1rem;font-family:Bangers,cursive;font-size:1.25rem;letter-spacing:.06em;color:#0A0318;background:linear-gradient(135deg,#f5c842,#E09000);box-shadow:0 6px 20px rgba(245,200,66,.35);cursor:pointer}"+
   ".lk-launch:active{transform:scale(.97)}";
  document.head.appendChild(s); }

 function selectPiece(root, kid, i){
  var has_=has(kid), p=PIECES[i], on=has_(p.k);
  var box=root.querySelector('.lk-verse');
  box.className='lk-verse'+(on?'':' locked');
  box.innerHTML="<div class='vr'>"+(window.wzIcon?wzIcon(p.k,17):'')+" "+p.name+" · "+p.ref+"</div>"+
    "<div class='vt'>"+p.verse+"</div>"+
    "<div class='vm'>"+(on?p.mean:'🔒 Earn this piece to unlock it. '+p.mean)+"</div>";
  [].forEach.call(root.querySelectorAll('.lk-piece'),function(el,idx){ el.style.outline=(idx===i)?'2px solid rgba(245,200,66,.6)':'none'; });
 }

 function buildQuest(root, kid){
  var lp=life(kid), T=tiers(), next=null, prevP=0;
  for(var i=0;i<T.length;i++){ if(lp<T[i].p){ next=T[i]; break; } prevP=T[i].p; }
  var q=root.querySelector('.lk-quest');
  var ic=function(k,sz){ return window.wzIcon?wzIcon(k,sz):''; };
  if(next){
   var nm=(PIECES[T.indexOf(next)]||{}).name||next.n||'the next piece';
   var pct=Math.max(3,Math.min(100,Math.round((lp-prevP)/(next.p-prevP)*100)));
   q.innerHTML="<div class='qn'>"+ic('target',16)+" Next: "+nm+"</div><div class='qb'><div class='qf' style='width:"+pct+"%'></div></div>"+
     "<div class='qs'>"+(next.p-lp)+" more points to earn it</div>";
  } else {
   q.innerHTML="<div class='qn'>"+ic('full',16)+" You wear the FULL armor of God!</div><div class='qs'>Keep standing strong, warrior.</div>";
  }
 }

 function renderHero(root, kid){
  var el=root.querySelector('#lk-hero'); if(!el)return;
  var k=heroKey(kid);
  // <video> with a poster: if the mp4 plays we get an animated warrior; if it
  // fails to load, the poster image (the illustrated art) stays. Clean fallback.
  el.innerHTML="<video autoplay muted loop playsinline preload='metadata' poster='img/"+HERO_IMG[k]+"'><source src='img/"+HERO_VID[k]+"' type='video/mp4'></video>";
 }
 function revealPieces(root, kid){
  var has_=has(kid);
  var earnedCards=[];
  [].forEach.call(root.querySelectorAll('.lk-piece'),function(c){
   var i=parseInt(c.getAttribute('data-i'),10);
   if(PIECES[i] && has_(PIECES[i].k)) earnedCards.push(c);
  });
  earnedCards.forEach(function(c,idx){
   setTimeout(function(){
    c.classList.remove('reveal'); void c.offsetWidth; c.classList.add('reveal');
    try{ if(typeof wzSfxEarn==='function')wzSfxEarn(); }catch(e){}
    try{ if(navigator.vibrate)navigator.vibrate(16); }catch(e){}
   }, 350+idx*360);
  });
 }

 window.wzOpenLocker=function(){
  var kid=(window.APP&&APP.kid); if(!kid){ if(typeof toast==='function')toast('Log in to see your Locker!'); return; }
  css();
  var root=document.getElementById('wz-lk');
  if(!root){ root=document.createElement('div'); root.id='wz-lk'; document.body.appendChild(root); }
  var has_=has(kid);
  var pieceCount=earnedList(kid).filter(function(x){return x!=='full';}).length;
  var title=TITLES[Math.min(pieceCount,TITLES.length-1)];

  var ic=function(k,sz){ return window.wzIcon?wzIcon(k,sz):''; };
  var grid='';
  PIECES.forEach(function(p,i){ var on=has_(p.k);
   grid+="<div class='lk-piece "+(on?'on':'off')+"' data-i='"+i+"'><span class='pe'>"+ic(p.k,30)+"</span><div class='pn'>"+p.name+"</div></div>";
  });

  root.innerHTML=
   "<div class='lk-in'>"+
   "<button class='lk-x' aria-label='Close'>✕</button>"+
   "<div class='lk-name'>"+((kid.first_name||'Warrior'))+"</div>"+
   "<div class='lk-title'>"+(window.wzIcon?wzIcon('sword',14):'')+" "+title+"</div>"+
   "<div class='lk-stage'><div class='lk-aura'></div><div class='lk-hero' id='lk-hero'></div></div>"+
   "<div class='lk-quest'></div>"+
   "<div class='lk-grid'>"+grid+"</div>"+
   "<div class='lk-verse locked'><div class='vr'>Tap a piece of armor</div><div class='vt'>Each piece is a promise from God in Ephesians 6.</div><div class='vm'>Tap any armor above to read its verse and what it means for you.</div></div>"+
   "<div class='lk-btns'>"+
     "<button class='lk-btn lk-gold' id='lk-custom'>🎨 Customize</button>"+
     "<button class='lk-btn lk-dark' id='lk-close'>Done</button>"+
   "</div></div>";

  root.classList.add('show');
  buildQuest(root, kid);
  renderHero(root, kid);
  revealPieces(root, kid);

  function close(){ root.classList.remove('show'); }
  root.querySelector('.lk-x').onclick=close;
  root.querySelector('#lk-close').onclick=close;
  root.querySelector('#lk-custom').onclick=function(){
   close();
   try{ if(typeof dashTab==='function'){ var b=document.querySelector(".tab-btn[onclick*=\"'warrior'\"]")||document.querySelector(".tab-sidebar-btn[onclick*=\"'warrior'\"]"); dashTab('warrior',b); } if(typeof openCustomize==='function')setTimeout(openCustomize,200); }catch(e){}
  };
  [].forEach.call(root.querySelectorAll('.lk-piece'),function(el){
   el.onclick=function(){ selectPiece(root, kid, parseInt(el.getAttribute('data-i'),10)); };
  });

  // celebrate a full set on open
  if(has_('full')){ try{ if(typeof wzConfetti==='function')setTimeout(function(){wzConfetti(50);},earnedList(kid).length*480+300); }catch(e){} }
 };

 // Add a prominent launch button to the top of the Armor tab (after it renders).
 function addLaunch(){
  var tw=document.getElementById('tab-warrior'); if(!tw)return;
  if(tw.querySelector('.lk-launch'))return;
  if(!tw.firstChild)return;                 // wait until the tab has rendered
  var b=document.createElement('button'); b.className='lk-launch';
  b.textContent='Enter My Warrior Locker';
  b.onclick=function(){ wzOpenLocker(); };
  tw.insertBefore(b, tw.firstChild);
 }
 function hookArmor(){
  if(typeof window.renderArmor==='function' && !window.renderArmor.__wzLk){
   var _ra=window.renderArmor;
   window.renderArmor=function(){ var r=_ra.apply(this,arguments); setTimeout(addLaunch,20); return r; };
   window.renderArmor.__wzLk=1;
  }
 }
 function hookTab(){
  if(typeof window.dashTab==='function' && !window.dashTab.__wzLkTab){
   var _dt=window.dashTab;
   window.dashTab=function(tab,btn){ var r=_dt.apply(this,arguments); if(tab==='warrior')setTimeout(addLaunch,80); return r; };
   window.dashTab.__wzLkTab=1;
  }
 }
 function init(){ hookArmor(); hookTab(); try{ addLaunch(); }catch(e){} }
 setTimeout(init,400); setTimeout(init,1300); setTimeout(init,2700);
})();
