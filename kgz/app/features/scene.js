// extracted from WZSCENE_INJECT (was a runtime monkey-patch)
/*WZSCENE_INJECT*/
(function(){
 if(window.__wzScene)return; window.__wzScene=1;
 function css(){
  if(document.getElementById('wz-scene-css'))return;
  var s=document.createElement('style');s.id='wz-scene-css';
  s.textContent="#p-dash::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:#0b0724 center center/cover no-repeat;background-image:linear-gradient(rgba(11,7,36,.82),rgba(11,7,36,.93)),var(--wz-scene,none);transition:opacity .4s;} #p-dash.page{position:relative;} #p-dash>*{position:relative;z-index:1;} #dash-hero{position:relative;overflow:hidden;padding-right:42% !important;} #dash-hero::after{content:'';position:absolute;right:-3%;bottom:-6%;top:5%;width:44%;z-index:0;background:url('img/warrior-boy.png') right bottom/contain no-repeat;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45));pointer-events:none;} body.wz-girl #dash-hero::after{background-image:url('img/warrior-girl.png');} #dash-hero>*{position:relative;z-index:1;} @media(max-width:520px){#dash-hero{padding-right:40% !important;}#dash-hero::after{width:41%;}}";
  document.head.appendChild(s);
 }
 var SCN={watch:'bg-watch.jpg',verse:'bg-verse.jpg',games:'bg-games.jpg'};
 function gender(){try{var k=(window.APP&&APP.kid)||{};var g=k.gender;if(!g&&k.avatar){var a=typeof k.avatar==='string'?JSON.parse(k.avatar):k.avatar;g=a&&(a.gender||a.sex);}g=(g||'').toString().toLowerCase();return (g.charAt(0)==='f'||g==='girl')?'girl':'boy';}catch(e){return 'boy';}}
 function applyGender(){try{document.body.classList.toggle('wz-girl',gender()==='girl');}catch(e){}}
 function setScene(tab){var d=document.getElementById('p-dash');if(!d)return;var f=SCN[tab];d.style.setProperty('--wz-scene',f?("url('img/"+f+"')"):'none');}
 function hook(){css();applyGender();if(typeof window.dashTab==='function'&&!window.dashTab.__wz){var orig=window.dashTab;window.dashTab=function(tab,btn){var r=orig.apply(this,arguments);try{setScene(tab);applyGender();}catch(e){}return r;};window.dashTab.__wz=1;}}
 setTimeout(hook,120);setTimeout(hook,650);setTimeout(applyGender,1600);
})();
