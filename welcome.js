// Welcome, Warrior — a first-login moment that hooks a new kid.
// The very first time a child reaches their dashboard, this plays a short,
// celebratory welcome: confetti + fanfare, their warrior on screen, one anchor
// verse (Ephesians 6:10, ESV), three quick "here's how it works" beats, and a
// nudge to make their warrior their own. It fires ONCE per kid (a per-kid flag in
// localStorage), then never again.
//
// Additive and backend-free: it wraps openDash to detect the first arrival and
// reuses armorSVG for the warrior. If anything is missing it simply doesn't show.
(function(){
 if(window.__wzWelcome)return; window.__wzWelcome=1;

 function seen(id){ try{ return localStorage.getItem('wz_welcomed_'+id)==='1'; }catch(e){ return true; } }
 function mark(id){ try{ localStorage.setItem('wz_welcomed_'+id,'1'); }catch(e){} }

 function css(){ if(document.getElementById('wz-wel-css'))return;
  var s=document.createElement('style'); s.id='wz-wel-css';
  s.textContent=
   "#wz-wel{position:fixed;inset:0;z-index:100070;background:radial-gradient(circle at 50% 30%,#2a1466,#07031a 72%);display:none;overflow-y:auto}"+
   "#wz-wel.show{display:block;animation:wzwelin .4s ease}"+
   "@keyframes wzwelin{from{opacity:0}to{opacity:1}}"+
   "#wz-wel .win{max-width:440px;margin:0 auto;padding:1.6rem 1.3rem 2.2rem;text-align:center}"+
   "#wz-wel .badge{display:inline-block;background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.35);color:#f5c842;border-radius:99px;padding:.25rem .8rem;font-size:.6rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.6rem}"+
   "#wz-wel .h{font-family:Bangers,cursive;font-size:2.5rem;color:#fff;line-height:1;letter-spacing:.03em;text-shadow:0 0 30px rgba(245,200,66,.5);margin-bottom:.15rem}"+
   "#wz-wel .h em{color:#f5c842;font-style:normal}"+
   "#wz-wel .warr{height:210px;display:flex;align-items:center;justify-content:center;margin:.4rem 0}"+
   "#wz-wel .welhero{width:200px;height:200px;border-radius:26px;overflow:hidden;border:3px solid rgba(245,200,66,.6);box-shadow:0 12px 30px rgba(0,0,0,.5),0 0 42px rgba(245,200,66,.25);animation:wzwelfloat 4.2s ease-in-out infinite;background:#140a2e}"+
   "#wz-wel .welhero video,#wz-wel .welhero img{width:100%;height:100%;object-fit:cover;display:block}"+
   "@keyframes wzwelfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}"+
   "#wz-wel .verse{color:#fff;font-style:italic;font-size:.95rem;line-height:1.5;margin:.2rem auto 1rem;max-width:340px}"+
   "#wz-wel .verse .vr{display:block;color:#f5c842;font-style:normal;font-weight:900;font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;margin-top:.35rem}"+
   "#wz-wel .steps{display:flex;flex-direction:column;gap:.55rem;margin-bottom:1.2rem;text-align:left}"+
   "#wz-wel .step{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:.7rem .85rem}"+
   "#wz-wel .step .se{font-size:1.6rem;flex-shrink:0}"+
   "#wz-wel .step .st{font-weight:800;font-size:.9rem;color:#fff}"+
   "#wz-wel .step .sd{font-size:.74rem;color:rgba(255,255,255,.55)}"+
   "#wz-wel .btns{display:flex;gap:.55rem}"+
   "#wz-wel .wbtn{flex:1;border:none;border-radius:13px;padding:.85rem;font-family:Bangers,cursive;font-size:1.15rem;letter-spacing:.05em;cursor:pointer}"+
   "#wz-wel .gold{background:linear-gradient(135deg,#f5c842,#E09000);color:#0A0318}"+
   "#wz-wel .dark{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff}";
  document.head.appendChild(s); }

 // Use the real illustrated (and animated) warrior art the app already ships.
 var HERO_IMG={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
 var HERO_VID={w1:'warrior-1.mp4',w2:'warrior-2.mp4',w3:'warrior-3.mp4',w4:'warrior-4.mp4',w5:'warrior-5.mp4',w6:'warrior-6.mp4'};
 function warriorSVG(kid){
  var a=(kid&&kid.avatar)||''; if(!HERO_IMG[a])a='w1';
  return "<div class='welhero'><video autoplay muted loop playsinline preload='metadata' poster='img/"+HERO_IMG[a]+"'><source src='img/"+HERO_VID[a]+"' type='video/mp4'></video></div>";
 }

 window.wzWelcome=function(kid){
  kid=kid||(window.APP&&APP.kid); if(!kid)return;
  css();
  var root=document.getElementById('wz-wel');
  if(!root){ root=document.createElement('div'); root.id='wz-wel'; document.body.appendChild(root); }
  root.innerHTML=
   "<div class='win'>"+
   "<div class='badge'>⚔️ The Gathering CTX</div>"+
   "<div class='h'>Welcome,<br><em>"+(kid.first_name||'Warrior')+"!</em></div>"+
   "<div class='warr'>"+warriorSVG(kid)+"</div>"+
   "<div class='verse'>“Be strong in the Lord and in the strength of his might.”<span class='vr'>Ephesians 6:10 · ESV</span></div>"+
   "<div class='steps'>"+
     "<div class='step'><div class='se'>"+(window.wzIcon?wzIcon('star',26):'⭐')+"</div><div><div class='st'>Earn points</div><div class='sd'>Read, play, memorize, show up on Sunday.</div></div></div>"+
     "<div class='step'><div class='se'>"+(window.wzIcon?wzIcon('shield',26):'🛡️')+"</div><div><div class='st'>Put on the armor of God</div><div class='sd'>Your points unlock each piece from Ephesians 6.</div></div></div>"+
     "<div class='step'><div class='se'>"+(window.wzIcon?wzIcon('gift',26):'🎁')+"</div><div><div class='st'>Open your daily blessing</div><div class='sd'>A new verse waits for you every day.</div></div></div>"+
   "</div>"+
   "<div class='btns'>"+
     "<button class='wbtn dark' id='wel-custom'>🎨 Make it mine</button>"+
     "<button class='wbtn gold' id='wel-go'>Let’s go! ⚔️</button>"+
   "</div></div>";
  root.classList.add('show');
  try{ if(typeof wzConfetti==='function')wzConfetti(64); }catch(e){}
  try{ if(typeof wzSfxFanfare==='function')wzSfxFanfare(); }catch(e){}
  try{ if(navigator.vibrate)navigator.vibrate([40,30,60,30,80]); }catch(e){}

  function close(){ root.classList.remove('show'); }
  root.querySelector('#wel-go').onclick=close;
  root.querySelector('#wel-custom').onclick=function(){
   close();
   try{
    if(typeof wzOpenLocker==='function'){ wzOpenLocker(); return; }
    if(typeof dashTab==='function'){ var b=document.querySelector(".tab-btn[onclick*=\"'warrior'\"]"); dashTab('warrior',b); }
    if(typeof openCustomize==='function')setTimeout(openCustomize,250);
   }catch(e){}
  };
 };

 function maybeWelcome(){
  var kid=(window.APP&&APP.kid); if(!kid||!kid.id)return;
  if(seen(kid.id))return;
  mark(kid.id);
  setTimeout(function(){ try{ wzWelcome(kid); }catch(e){} }, 650);
 }
 function hook(){
  if(typeof window.openDash!=='function' || window.openDash.__wzWel)return;
  var _od=window.openDash;
  window.openDash=function(kid){ var r=_od.apply(this,arguments); try{ maybeWelcome(); }catch(e){} return r; };
  window.openDash.__wzWel=1;
 }
 setTimeout(hook,400); setTimeout(hook,1300); setTimeout(hook,2700);
})();
