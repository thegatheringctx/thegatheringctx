// extracted from WZACADEMY_INJECT (was a runtime monkey-patch)
/*WZACADEMY_INJECT*/
(function(){
 if(window.__wzAcademy)return; window.__wzAcademy=1;
 var IDS=['w1','w2','w3','w4','w5','w6'],WI=['warrior-boy.png','warrior-2.png','warrior-3.png','warrior-girl.png','warrior-5.png','warrior-6.png'];
 function curImg(){try{var a=(window.APP&&APP.kid&&APP.kid.avatar)||'';var i=IDS.indexOf(a);return 'img/'+(i>=0?WI[i]:'warrior-boy.png');}catch(e){return 'img/warrior-boy.png';}}
 function acCss(){if(document.getElementById('wz-ac-css'))return;var s=document.createElement('style');s.id='wz-ac-css';s.textContent="#wz-ac{position:fixed;inset:0;z-index:2147483450;background:radial-gradient(circle at 50% 30%,#26105e,#0a0526);display:flex;flex-direction:column;overflow:hidden} #wz-ac .top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px} #wz-ac .dots{display:flex;gap:6px} #wz-ac .dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25)} #wz-ac .dot.on{background:#f5c842} #wz-ac .x{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:6px 12px;font-size:12px;cursor:pointer} #wz-ac .body{flex:1;display:flex;align-items:flex-end;justify-content:center;position:relative;padding:0 14px 8px} #wz-ac .bubble{position:relative;background:#fff;color:#1a1a2e;border-radius:20px;padding:16px 18px;max-width:460px;font-size:17px;line-height:1.45;box-shadow:0 10px 30px rgba(0,0,0,.45);margin-bottom:18px} #wz-ac .bubble:after{content:'';position:absolute;right:-12px;bottom:26px;border:10px solid transparent;border-left-color:#fff} #wz-ac .hero{width:170px;flex:none;align-self:flex-end;filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));animation:wzacf 3.4s ease-in-out infinite;-webkit-mask-image:radial-gradient(ellipse 62% 74% at 50% 44%,#000 60%,rgba(0,0,0,0) 92%);mask-image:radial-gradient(ellipse 62% 74% at 50% 44%,#000 60%,rgba(0,0,0,0) 92%)} @keyframes wzacf{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} #wz-ac .vs{color:#f5c842;font-weight:800;font-size:12px;margin-top:8px} #wz-ac .bar{padding:10px 14px 18px} #wz-ac .btn{width:100%;background:#f5c842;color:#1a1a2e;font-weight:800;border:none;border-radius:16px;padding:13px;font-size:16px;cursor:pointer;font-family:Bangers,cursive;letter-spacing:.04em} #wz-ac .ch{display:grid;gap:8px;max-width:460px;margin:0 auto;width:100%} #wz-ac .ch button{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;padding:12px;border-radius:13px;font-size:15px;cursor:pointer} #wz-ac .ch button.right{background:#3ec97a;border-color:#3ec97a} #wz-ac .ch button.wrong{background:#e05263;border-color:#e05263} @media(max-width:560px){#wz-ac .hero{width:120px}}";document.head.appendChild(s);}
 function say(t){try{if(!window.speechSynthesis)return null;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.rate=.97;u.pitch=1.05;speechSynthesis.speak(u);return u;}catch(e){return null;}}
 window.wzAcademy=async function(){
  acCss();
  var ag=(window.APP&&APP.kid&&APP.kid.age_group)||'812';
  var rows=null; try{ rows=await window.sb('warrior_lessons?age_group=eq.'+ag+'&active=is.true&select=*'); }catch(e){}
  if(!rows||!rows.length)return;
  rows.sort(function(){return Math.random()-0.5;});
  var L=rows.slice(0,5); var i=0; var earned=0;
  var ov=document.createElement('div');ov.id='wz-ac';
  ov.innerHTML="<div class='top'><div class='dots'>"+L.map(function(){return "<div class='dot'></div>";}).join('')+"</div><button class='x'>Exit</button></div><div class='body'><div class='bubble'></div><img class='hero' src='"+curImg()+"'></div><div class='bar'></div>";
  document.body.appendChild(ov);
  var bub=ov.querySelector('.bubble'), bar=ov.querySelector('.bar'), dots=ov.querySelectorAll('.dot');
  function close(){try{speechSynthesis.cancel();}catch(e){} var o=document.getElementById('wz-ac'); if(o)o.remove();}
  ov.querySelector('.x').onclick=close;
  function teach(){ var l=L[i]; dots.forEach(function(d,k){d.classList.toggle('on',k<=i);}); bub.innerHTML=l.teach; say(l.teach); bar.innerHTML="<button class='btn'>Got it!</button>"; bar.querySelector('.btn').onclick=ask; }
  function ask(){ var l=L[i]; bub.innerHTML="<b>"+l.q+"</b>"; say(l.q); bar.innerHTML="<div class='ch'>"+(l.o||[]).map(function(c,n){return "<button data-n='"+n+"'>"+c+"</button>";}).join('')+"</div>";
   bar.querySelectorAll('button').forEach(function(b){b.onclick=function(){ var n=parseInt(b.getAttribute('data-n'));
    if(n===l.a){ b.classList.add('right'); bub.innerHTML=l.encourage+(l.verse?"<div class='vs'>"+l.verse+"</div>":""); say(l.encourage);
     try{if(window.wzSfxEarn&&localStorage.getItem('wz_mute')!=='1')wzSfxEarn();}catch(e){}
     try{window.gameAward(5,'game_academy');}catch(e){}
     earned+=5;
     bar.innerHTML="<button class='btn'>"+(i<L.length-1?'Next Lesson':'Finish')+"</button>";
     bar.querySelector('.btn').onclick=function(){ if(i<L.length-1){i++;teach();} else { bub.innerHTML='Great training, warrior! You earned '+earned+' points.'; say('Great training, warrior!'); try{if(window.wzSfxFanfare&&localStorage.getItem('wz_mute')!=='1')wzSfxFanfare();}catch(e){} bar.innerHTML="<button class='btn'>Done</button>"; bar.querySelector('.btn').onclick=close; } };
    } else { b.classList.add('wrong'); bub.innerHTML=l.coach; say(l.coach); setTimeout(function(){b.classList.remove('wrong');},900); }
   };});
  }
  teach();
 };
 function addCard(){ var tg=document.getElementById('tab-games'); if(!tg)return; var grid=tg.querySelector('.games-grid'); if(!grid)return; if(grid.querySelector('[data-wzac]'))return;
  var c=document.createElement('div'); c.className='game-card'; c.setAttribute('data-wzac','1'); c.style.background='linear-gradient(135deg,#1f6f4a,#0d3d29)';
  c.innerHTML="<div class='gc-badge'>TEACH</div><div class='gc-emoji'>&#127891;</div><div class='gc-title'>Warrior Academy</div><div class='gc-sub'>Your warrior teaches you &middot; 5 lessons</div><div class='gc-pts'>&#9889; UP TO 25 PTS</div>";
  c.onclick=function(){window.wzAcademy();};
  grid.appendChild(c);
 }
 function hook(){ if(typeof window.renderGames==='function'&&!window.renderGames.__wzac){ var o=window.renderGames; window.renderGames=function(){ var r=o.apply(this,arguments); try{setTimeout(addCard,20);}catch(e){} return r; }; window.renderGames.__wzac=1; }
  if(typeof window.dashTab==='function'&&!window.dashTab.__wzac){ var d=window.dashTab; window.dashTab=function(tab,btn){ var r=d.apply(this,arguments); try{ if(tab==='games')setTimeout(addCard,40); }catch(e){} return r; }; window.dashTab.__wzac=1; }
  try{addCard();}catch(e){}
 }
 setTimeout(hook,300);setTimeout(hook,1200);setTimeout(hook,2600);
})();
