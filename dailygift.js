// Daily Gift — "Today's Blessing."
// A once-a-day chest the kid opens for a Scripture blessing. It builds the daily
// habit the streak system rewards, and sends every child off with God's Word.
// The verse is chosen by the calendar day, so the whole church gets the same
// "verse of the day" — a shared blessing, not a random one.
//
// Additive and backend-free: no points are awarded (so nothing to abuse), the
// only thing stored is a per-kid "opened today" flag in localStorage. It adds a
// button to the top of the Today hub; opening it plays the existing celebration
// SFX. All verses are ESV and passed the biblical-soundness review.
(function(){
 if(window.__wzGift)return; window.__wzGift=1;

 // Shared verse-of-the-day pool (ESV). Rotated by day-of-year so everyone gets
 // the same blessing each day. Kept short and kid-appropriate.
 var VERSES=[
  {t:'Be strong and courageous. Do not be frightened… for the Lord your God is with you wherever you go.', r:'Joshua 1:9'},
  {t:'I can do all things through him who strengthens me.', r:'Philippians 4:13'},
  {t:'The Lord is my shepherd; I shall not want.', r:'Psalm 23:1'},
  {t:'God is our refuge and strength, a very present help in trouble.', r:'Psalm 46:1'},
  {t:'Trust in the Lord with all your heart, and do not lean on your own understanding.', r:'Proverbs 3:5'},
  {t:'For God so loved the world, that he gave his only Son…', r:'John 3:16'},
  {t:'We love because he first loved us.', r:'1 John 4:19'},
  {t:'Let the little children come to me… for to such belongs the kingdom of heaven.', r:'Matthew 19:14'},
  {t:'I have called you by name, you are mine.', r:'Isaiah 43:1'},
  {t:'Fear not, for I am with you; be not dismayed, for I am your God.', r:'Isaiah 41:10'},
  {t:'Oh give thanks to the Lord, for he is good, for his steadfast love endures forever!', r:'Psalm 107:1'},
  {t:'But you are a chosen race, a royal priesthood, a holy nation, a people for his own possession.', r:'1 Peter 2:9'},
  {t:'The Lord is my light and my salvation; whom shall I fear?', r:'Psalm 27:1'},
  {t:'Rejoice in the Lord always; again I will say, rejoice.', r:'Philippians 4:4'}
 ];

 function dayOfYear(){
  var d=new Date(), start=new Date(d.getFullYear(),0,0);
  return Math.floor((d-start)/86400000);
 }
 function today(){ return new Date().toISOString().slice(0,10); }
 function verseOfDay(){ return VERSES[dayOfYear()%VERSES.length]; }
 function kidId(){ try{ return (window.APP&&APP.kid&&APP.kid.id)||'anon'; }catch(e){ return 'anon'; } }
 function openedToday(){ try{ return localStorage.getItem('wz_gift_'+kidId())===today(); }catch(e){ return false; } }
 function markOpened(){ try{ localStorage.setItem('wz_gift_'+kidId(), today()); }catch(e){} }

 function css(){ if(document.getElementById('wz-gift-css'))return;
  var s=document.createElement('style'); s.id='wz-gift-css';
  s.textContent=
   ".gift-launch{display:flex;align-items:center;gap:.7rem;width:100%;border:none;border-radius:16px;padding:.85rem 1rem;margin-bottom:.8rem;cursor:pointer;background:linear-gradient(135deg,#3a2270,#1a0f45);border:1px solid rgba(245,200,66,.4);text-align:left}"+
   ".gift-launch .ge{font-size:1.9rem;animation:giftwob 2.2s ease-in-out infinite}"+
   "@keyframes giftwob{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}"+
   ".gift-launch .gt{flex:1}"+
   ".gift-launch .g1{font-family:Bangers,cursive;font-size:1.1rem;color:#f5c842;letter-spacing:.03em}"+
   ".gift-launch .g2{font-size:.72rem;color:rgba(255,255,255,.6)}"+
   ".gift-launch.done{opacity:.7;background:rgba(255,255,255,.04);border-color:rgba(126,224,138,.4)}"+
   ".gift-launch.done .ge{animation:none}"+
   "#wz-gift{position:fixed;inset:0;z-index:100060;background:radial-gradient(circle at 50% 40%,rgba(58,34,112,.97),rgba(7,3,26,.99));display:none;align-items:center;justify-content:center;text-align:center;padding:1.4rem}"+
   "#wz-gift.show{display:flex;animation:giftin .3s ease}"+
   "@keyframes giftin{from{opacity:0}to{opacity:1}}"+
   "#wz-gift .gc{max-width:420px}"+
   "#wz-gift .chest{font-size:5.5rem;cursor:pointer;animation:giftpop .5s cubic-bezier(.34,1.56,.64,1)}"+
   "@keyframes giftpop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1)}}"+
   "#wz-gift .chest.shake{animation:giftshake .5s}"+
   "@keyframes giftshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}"+
   "#wz-gift .hint{color:rgba(255,255,255,.6);font-size:.85rem;margin-top:.6rem}"+
   "#wz-gift .reveal{display:none;animation:giftin .5s ease}"+
   "#wz-gift .reveal.show{display:block}"+
   "#wz-gift .rt{font-family:Bangers,cursive;font-size:1.7rem;color:#f5c842;letter-spacing:.03em;margin-bottom:.8rem}"+
   "#wz-gift .verse{background:rgba(255,255,255,.06);border:1px solid rgba(245,200,66,.35);border-radius:18px;padding:1.2rem;margin-bottom:1rem}"+
   "#wz-gift .vt{font-style:italic;color:#fff;font-size:1.1rem;line-height:1.6;margin-bottom:.6rem}"+
   "#wz-gift .vr{color:#f5c842;font-weight:900;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase}"+
   "#wz-gift .sub{color:rgba(255,255,255,.65);font-size:.85rem;margin-bottom:1.2rem;line-height:1.5}"+
   "#wz-gift .gbtn{background:linear-gradient(135deg,#f5c842,#E09000);color:#0A0318;border:none;border-radius:13px;padding:.8rem 2rem;font-family:Bangers,cursive;font-size:1.15rem;letter-spacing:.05em;cursor:pointer}";
  document.head.appendChild(s); }

 window.wzOpenGift=function(){
  css();
  var v=verseOfDay();
  var root=document.getElementById('wz-gift');
  if(!root){ root=document.createElement('div'); root.id='wz-gift'; document.body.appendChild(root); }
  var already=openedToday();
  root.innerHTML=
   "<div class='gc'>"+
   "<div id='gift-chest' class='chest'>"+(window.wzIcon?wzIcon('gift',88):'🎁')+"</div>"+
   "<div class='hint' id='gift-hint'>"+(already?'Here is today’s blessing.':'Tap the gift to open today’s blessing!')+"</div>"+
   "<div class='reveal' id='gift-reveal'>"+
     "<div class='rt'>Today’s Blessing</div>"+
     "<div class='verse'><div class='vt'>“"+v.t+"”</div><div class='vr'>"+v.r+" · ESV</div></div>"+
     "<div class='sub'>God’s Word is for you today, warrior. Come back tomorrow for a new blessing.</div>"+
     "<button class='gbtn' id='gift-done'>Amen ✓</button>"+
   "</div></div>";
  root.classList.add('show');

  var chest=root.querySelector('#gift-chest');
  var reveal=root.querySelector('#gift-reveal');
  var hint=root.querySelector('#gift-hint');
  function open(){
   chest.classList.add('shake');
   setTimeout(function(){
    hint.style.display='none'; reveal.classList.add('show');
    markOpened(); refreshBtn();
    try{ if(typeof wzConfetti==='function')wzConfetti(50); }catch(e){}
    try{ if(typeof wzSfxFanfare==='function')wzSfxFanfare(); }catch(e){}
    try{ if(navigator.vibrate)navigator.vibrate([40,30,60]); }catch(e){}
   },500);
  }
  if(already){ reveal.classList.add('show'); hint.style.display='none'; }
  else chest.onclick=open;
  root.querySelector('#gift-done').onclick=function(){ root.classList.remove('show'); };
  // tap backdrop to close
  root.onclick=function(e){ if(e.target===root)root.classList.remove('show'); };
 };

 function refreshBtn(){
  var b=document.querySelector('.gift-launch'); if(!b)return;
  var done=openedToday();
  b.className='gift-launch'+(done?' done':'');
  b.innerHTML="<div class='ge'>"+(window.wzIcon?wzIcon('gift',30):(done?'🎉':'🎁'))+"</div><div class='gt'>"+
    "<div class='g1'>"+(done?'Blessing opened':'Today’s Blessing')+"</div>"+
    "<div class='g2'>"+(done?'Come back tomorrow for a new one!':'Tap to open your daily gift')+"</div></div>";
 }
 function addButton(){
  var host=document.getElementById('tab-today'); if(!host)return;
  if(!host.firstChild)return;
  if(host.querySelector('.gift-launch'))return;
  css();
  var b=document.createElement('button'); b.className='gift-launch';
  b.onclick=function(){ wzOpenGift(); };
  host.insertBefore(b, host.firstChild);
  refreshBtn();
 }

 function watch(){
  var host=document.getElementById('tab-today'); if(!host)return false;
  if(host.__wzGiftWatched)return true; host.__wzGiftWatched=1;
  var deb=null;
  var mo=new MutationObserver(function(){ if(deb)clearTimeout(deb); deb=setTimeout(addButton,160); });
  try{ mo.observe(host,{childList:true}); }catch(e){}
  setTimeout(addButton,220);
  return true;
 }
 var n=0, iv=setInterval(function(){ if(watch()||++n>60)clearInterval(iv); },350);
})();
