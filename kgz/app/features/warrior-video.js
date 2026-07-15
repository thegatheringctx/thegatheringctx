// extracted from WZVIDEO_INJECT (was a runtime monkey-patch)
/*WZVIDEO_INJECT*/
(function(){
 if(window.__wzVideo)return; window.__wzVideo=1;
 var IDS=['w1','w2','w3','w4','w5','w6'],WI=['warrior-boy.png','warrior-2.png','warrior-3.png','warrior-girl.png','warrior-5.png','warrior-6.png'];
 function idx(){try{var a=(window.APP&&APP.kid&&APP.kid.avatar)||'';var i=IDS.indexOf(a);return i>=0?i:0;}catch(e){return 0;}}
 function stillFor(){return 'img/'+WI[idx()];}
 function vidFor(){return 'img/warrior-'+(idx()+1)+'.mp4';}
 function mkVid(cls){var v=document.createElement('video');if(cls)v.className=cls;v.setAttribute('data-wzv','1');v.autoplay=true;v.loop=true;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('preload','auto');v.src=vidFor();try{var p=v.play();if(p&&p.catch)p.catch(function(){});}catch(e){}return v;}
 function guard(v,revert){var done=false;function bail(){if(done)return;done=true;try{revert();}catch(e){}}
  v.addEventListener('loadeddata',function(){done=true;});
  v.addEventListener('error',bail);
  setTimeout(function(){ if(v.readyState===0) bail(); },4000);}
 function videoize(){
  try{
   var ah=document.querySelector('img.wz-armor-hero');
   if(ah){ var v=mkVid('wz-armor-hero'); guard(v,function(){ if(v.parentNode)v.replaceWith(ah); }); ah.replaceWith(v); }
   var ach=document.querySelector('#wz-ac img.hero');
   if(ach){ var v2=mkVid('hero'); guard(v2,function(){ if(v2.parentNode)v2.replaceWith(ach); }); ach.replaceWith(v2); }
   var bc=document.querySelector('#wz-hero-banner>div:nth-child(3)');
   if(bc && !bc.querySelector('video[data-wzv]')){
    var prevBg=bc.style.backgroundImage;
    var v3=mkVid(''); v3.style.cssText='width:100%;height:100%;object-fit:contain;object-position:right bottom;display:block';
    guard(v3,function(){ if(v3.parentNode)v3.remove(); bc.style.backgroundImage=prevBg||("url('"+stillFor()+"')"); });
    bc.style.backgroundImage='none'; bc.appendChild(v3);
   }
  }catch(e){}
 }
 window.wzVideoize=videoize;
 function keepPlaying(){ try{ document.querySelectorAll('video[data-wzv]').forEach(function(v){ if(v.paused && v.readyState>2){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); } }); }catch(e){} }
 function init(){ videoize();
  if(!window.__wzVidObs){ var d=null; var mo=new MutationObserver(function(){ clearTimeout(d); d=setTimeout(videoize,250); }); mo.observe(document.body,{childList:true,subtree:true}); window.__wzVidObs=mo; }
  if(!window.__wzVidPlay){ window.__wzVidPlay=setInterval(keepPlaying,4000); }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) keepPlaying(); });
 }
 setTimeout(init,700);setTimeout(init,1800);setTimeout(init,3200);
})();
