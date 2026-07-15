// extracted from WZSTORY_INJECT (was a runtime monkey-patch)
/*WZSTORY_INJECT*/
(function(){
 if(window.__wzStory)return; window.__wzStory=1;
 function stCss(){if(document.getElementById('wz-story-css'))return;var s=document.createElement('style');s.id='wz-story-css';s.textContent="#wz-story{position:fixed;inset:0;z-index:2147483500;background:#07041a;display:flex;flex-direction:column;overflow:hidden} #wz-story .stage{position:relative;flex:1;overflow:hidden;background:#07041a} #wz-story .pimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease} #wz-story .pimg.on{opacity:1} @keyframes wzken{from{transform:scale(1.03)}to{transform:scale(1.18)}} #wz-story .cap{position:absolute;left:0;right:0;bottom:0;padding:26px 22px 24px;background:linear-gradient(transparent,rgba(6,3,20,.55) 30%,rgba(6,3,20,.95));color:#fff;font-size:20px;line-height:1.45;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.8);z-index:3} #wz-story .vs{color:#f5c842;font-weight:800;font-size:13px;margin-top:10px;letter-spacing:.04em} #wz-story .dots{display:flex;gap:7px;justify-content:center;padding:12px 0 4px;background:#07041a;z-index:4} #wz-story .dot{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.25);transition:background .3s} #wz-story .dot.on{background:#f5c842} #wz-story .bar{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 14px 16px;background:#07041a;z-index:4} #wz-story .btn{flex:1;background:#f5c842;color:#1a1a2e;font-weight:800;border:none;border-radius:16px;padding:11px 22px;font-size:15px;cursor:pointer;font-family:Bangers,cursive;letter-spacing:.04em} #wz-story .x{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:8px 14px;font-size:13px;cursor:pointer} #wz-story .quiz{position:absolute;inset:0;z-index:5;background:radial-gradient(circle at 50% 35%,#241056,#0a0526);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center} #wz-story .q{color:#fff;font-size:21px;font-weight:700;margin-bottom:18px;max-width:520px} #wz-story .ch{display:grid;gap:10px;width:100%;max-width:420px} #wz-story .ch button{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;padding:13px;border-radius:14px;font-size:16px;cursor:pointer} #wz-story .ch button.right{background:#3ec97a;border-color:#3ec97a} #wz-story .ch button.wrong{background:#e05263;border-color:#e05263}";document.head.appendChild(s);}
 function speak(t){try{if(!window.speechSynthesis)return null;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.rate=.95;u.pitch=1.05;speechSynthesis.speak(u);return u;}catch(e){return null;}}
 window.wzStoryPlayer=function(v,isDone){
  stCss();
  var panels=v.story_panels||[];var i=0;var timer=null;
  var ov=document.createElement('div');ov.id='wz-story';
  ov.innerHTML="<div class='stage'>"+panels.map(function(p,n){return "<img class='pimg' data-n='"+n+"' src='"+p.img+"'>";}).join('')+"<div class='cap'></div></div><div class='dots'>"+panels.map(function(){return "<div class='dot'></div>";}).join('')+"</div><div class='bar'><button class='x'>Exit</button><button class='btn'>Next</button></div>";
  document.body.appendChild(ov);
  var caps=ov.querySelector('.cap'),dots=ov.querySelectorAll('.dot'),imgs=ov.querySelectorAll('.pimg');
  function show(n){ i=n; imgs.forEach(function(im,k){im.classList.toggle('on',k===n); if(k===n){im.style.animation='none';void im.offsetWidth;im.style.animation='wzken 14s ease-out forwards';}});
   dots.forEach(function(d,k){d.classList.toggle('on',k<=n);});
   var p=panels[n];
   caps.innerHTML=p.text+(p.verse?"<div class='vs'>"+p.verse+"</div>":"");
   ov.querySelector('.btn').textContent=(n===panels.length-1)?'Take the Quiz':'Next';
   var u=speak(p.text); clearTimeout(timer);
   if(u){u.onend=function(){timer=setTimeout(function(){if(i===n)next();},900);};}
   else {timer=setTimeout(function(){if(i===n)next();},5200);}
  }
  function next(){ if(i<panels.length-1) show(i+1); else quiz(); }
  function close(){ try{speechSynthesis.cancel();}catch(e){} clearTimeout(timer); var o=document.getElementById('wz-story'); if(o)o.remove(); }
  function quiz(){
   try{speechSynthesis.cancel();}catch(e){} clearTimeout(timer);
   var choices=v.quiz_choices||[]; var ans=v.quiz_answer;
   var q=document.createElement('div');q.className='quiz';
   q.innerHTML="<div class='q'>"+v.quiz_q+"</div><div class='ch'>"+choices.map(function(c,n){return "<button data-n='"+n+"'>"+c+"</button>";}).join('')+"</div>";
   ov.appendChild(q);
   speak(v.quiz_q);
   q.querySelectorAll('button').forEach(function(b){b.onclick=function(){
     var n=parseInt(b.getAttribute('data-n'));
     if(n===ans){ b.classList.add('right');
       try{if(window.wzSfxFanfare&&localStorage.getItem('wz_mute')!=='1')wzSfxFanfare();}catch(e){}
       setTimeout(function(){ close(); if(!isDone){ try{window.awardVideo(v);}catch(e){} } },800);
     } else { b.classList.add('wrong'); setTimeout(function(){b.classList.remove('wrong');},700); }
   };});
  }
  ov.querySelector('.btn').onclick=function(){next();};
  ov.querySelector('.x').onclick=close;
  show(0);
 };
 function hook(){ if(typeof window.openVideo==='function' && !window.openVideo.__wzStory){ var oo=window.openVideo; window.openVideo=function(v,isDone){ if(v&&v.story_panels&&v.story_panels.length){ return window.wzStoryPlayer(v,isDone); } return oo.apply(this,arguments); }; window.openVideo.__wzStory=1; } }
 setTimeout(hook,300);setTimeout(hook,1200);setTimeout(hook,2600);
})();
