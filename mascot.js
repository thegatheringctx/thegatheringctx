// Warrior Buddy — a little animated mascot that gives the app "cartoon" life.
// A friendly SVG warrior sits in the corner, bobs and blinks, WAVES when you
// change tabs, CHEERS (jumps + speech bubble) when you earn points, and gives a
// word of encouragement when tapped. It borrows the kid's own skin/accent colors
// so it feels like their warrior cheering them on.
//
// Pure decoration, backend-free: it only reads the on-screen points readout and
// wraps dashTab. Shows only when a kid is logged in; if a hook is missing it just
// sits still. Encouragements are short, kid-friendly, and doctrinally safe.
(function(){
 if(window.__wzMascot)return; window.__wzMascot=1;

 var CHEERS=['🎉 Yes!','Nice one!','Way to go!','⚡ Boom!','Keep it up!','Awesome!'];
 var WORDS=[
  'You’re a mighty warrior! ⚔️',
  'God is with you today!',
  'Put on the full armor of God!',
  'You can do all things through Christ! 💪',
  'Be strong and courageous!',
  'Jesus loves you so much!',
  'Keep going, warrior. I believe in you!',
  'Hide God’s Word in your heart!'
 ];

 // The kid's real illustrated warrior, cropped into a circular buddy.
 var HERO_IMG={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};

 function css(){ if(document.getElementById('wz-mas-css'))return;
  var s=document.createElement('style'); s.id='wz-mas-css';
  s.textContent=
   "#wz-buddy{position:fixed;right:14px;bottom:20px;z-index:9500;width:66px;height:66px;cursor:pointer;display:none;border-radius:50%;overflow:hidden;border:2.5px solid rgba(245,200,66,.75);box-shadow:0 6px 16px rgba(0,0,0,.5),0 0 16px rgba(245,200,66,.25);background:#140a2e}"+
   "#wz-buddy .bwrap{width:100%;height:100%;animation:wzbob 3.4s ease-in-out infinite;transform-origin:50% 90%}"+
   "#wz-buddy .bwrap img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block}"+
   "@keyframes wzbob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-2deg)}}"+
   "#wz-buddy.cheer .bwrap{animation:wzcheer .6s cubic-bezier(.34,1.56,.64,1)}"+
   "@keyframes wzcheer{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-16px) scale(1.12)}100%{transform:translateY(0) scale(1)}}"+
   "#wz-buddy.wave .bwrap{animation:wzwave .6s ease}"+
   "@keyframes wzwave{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}"+
   "#wz-buddy .eye{transform-origin:center;animation:wzblink 4.2s infinite}"+
   "@keyframes wzblink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}"+
   "#wz-bubble{position:fixed;right:16px;bottom:88px;z-index:9501;max-width:180px;background:#fff;color:#1a1a2e;border-radius:14px;padding:.55rem .8rem;font-size:.8rem;font-weight:800;box-shadow:0 6px 18px rgba(0,0,0,.4);opacity:0;transform:translateY(8px) scale(.9);transition:all .2s;pointer-events:none;display:none}"+
   "#wz-bubble.show{opacity:1;transform:translateY(0) scale(1)}"+
   "#wz-bubble::after{content:'';position:absolute;right:22px;bottom:-7px;width:0;height:0;border:7px solid transparent;border-top-color:#fff;border-bottom:0}";
  document.head.appendChild(s); }

 function svg(){
  var a=(window.APP&&APP.kid&&APP.kid.avatar)||''; if(!HERO_IMG[a])a='w1';
  return "<div class='bwrap'><img src='img/"+HERO_IMG[a]+"' alt=''></div>";
 }

 function bubble(txt){
  var el=document.getElementById('wz-bubble'); if(!el)return;
  el.textContent=txt; el.style.display='block';
  requestAnimationFrame(function(){ el.classList.add('show'); });
  clearTimeout(el.__t);
  el.__t=setTimeout(function(){ el.classList.remove('show'); setTimeout(function(){ el.style.display='none'; },220); }, 2600);
 }
 function react(cls){
  var b=document.getElementById('wz-buddy'); if(!b)return;
  b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls);
  setTimeout(function(){ b.classList.remove(cls); }, 700);
 }

 function build(){
  if(document.getElementById('wz-buddy'))return;
  css();
  var b=document.createElement('div'); b.id='wz-buddy'; b.innerHTML=svg();
  b.setAttribute('aria-label','Warrior buddy');
  b.onclick=function(){ react('cheer'); bubble(WORDS[Math.floor(Math.random()*WORDS.length)]); };
  document.body.appendChild(b);
  var bub=document.createElement('div'); bub.id='wz-bubble'; document.body.appendChild(bub);
  // show only when a kid is logged in
  setInterval(function(){ b.style.display=(window.APP&&APP.kid)?'block':'none'; }, 1000);
  // refresh colors to match the kid once known
  setTimeout(function(){ b.innerHTML=svg(); }, 2500);
 }

 function hookTab(){
  if(typeof window.dashTab!=='function' || window.dashTab.__wzMascot)return;
  var _dt=window.dashTab;
  window.dashTab=function(tab,btn){ var r=_dt.apply(this,arguments); try{ react('wave'); }catch(e){} return r; };
  window.dashTab.__wzMascot=1;
 }
 function watchPoints(){
  var el=document.getElementById('dash-pts'); if(!el)return false;
  if(el.__wzMascot)return true; el.__wzMascot=1;
  var last=el.textContent;
  var mo=new MutationObserver(function(){
   var now=el.textContent; if(now===last)return;
   var up=(parseInt(now,10)||0)>(parseInt(last,10)||0); last=now;
   if(up){ react('cheer'); bubble(CHEERS[Math.floor(Math.random()*CHEERS.length)]); }
  });
  try{ mo.observe(el,{childList:true,characterData:true,subtree:true}); }catch(e){}
  return true;
 }

 function init(){ build(); hookTab(); watchPoints(); }
 if(document.readyState!=='loading')init(); else document.addEventListener('DOMContentLoaded',init);
 setTimeout(init,600); setTimeout(init,1600); setTimeout(init,2800);
 var n=0, iv=setInterval(function(){ if((watchPoints()&&window.dashTab&&window.dashTab.__wzMascot)||++n>60)clearInterval(iv); },500);
})();
