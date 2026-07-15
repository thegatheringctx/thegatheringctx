// Daily streak nudge opt-in. Deliberately gentle: never auto-prompts, never nags.
(function(){
 if(window.__wzPush)return; window.__wzPush=1;
 var VAPID='BEZ3txP6vF8LWe3FWehAA1VkSCP8kWNEZuKH1ro03IHhkYlsQR8A0YnnuAyFDjq0hp5xcc6BJUU5XfbcrEDFs5o';
 function u8(base64){var pad='='.repeat((4-base64.length%4)%4);var b=(base64+pad).replace(/-/g,'+').replace(/_/g,'/');var raw=atob(b);var out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
 function supported(){return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window);}
 function kid(){try{return (window.APP&&APP.kid)||null;}catch(e){return null;}}
 async function subscribe(){
  var k=kid(); if(!k)return false;
  var reg=await navigator.serviceWorker.ready;
  var sub=await reg.pushManager.getSubscription();
  if(!sub){ sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(VAPID)}); }
  var r=await fetch('https://ktuapfiexhlladgkuauc.supabase.co/functions/v1/wz-push-subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kid_id:k.id,pin:k.pin,subscription:sub.toJSON()})});
  var res=await r.json().catch(function(){return null;});
  return !!(res&&res.ok);
 }
 function css(){ if(document.getElementById('wz-push-css'))return; var s=document.createElement('style'); s.id='wz-push-css';
  s.textContent="#wz-push-btn{position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#f5c842;color:#1a1a2e;border:none;border-radius:22px;padding:10px 16px;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);font-family:inherit}#wz-push-btn:hover{filter:brightness(1.05)}#wz-push-btn:disabled{opacity:.7;cursor:default}";
  document.head.appendChild(s); }
 function hide(){ var b=document.getElementById('wz-push-btn'); if(b)b.remove(); }
 function show(){
  if(document.getElementById('wz-push-btn'))return; css();
  var b=document.createElement('button'); b.id='wz-push-btn'; b.textContent='\uD83D\uDD14 Remind me daily';
  b.onclick=async function(){
    b.disabled=true; b.textContent='...';
    try{
      var perm=await Notification.requestPermission();
      if(perm==='granted'){
        var ok=await subscribe();
        b.textContent = ok ? '\u2713 Reminders on' : 'Try again';
        if(ok){ setTimeout(hide,1800); } else { b.disabled=false; }
      } else {
        hide(); try{localStorage.setItem('wz_push_dismissed','1');}catch(e){}
      }
    }catch(e){ hide(); }
  };
  document.body.appendChild(b);
 }
 function init(){
  if(!supported())return;
  if(!kid())return;
  if(Notification.permission==='denied')return;
  try{ if(localStorage.getItem('wz_push_dismissed')==='1')return; }catch(e){}
  if(Notification.permission==='granted'){ hide(); subscribe(); return; }
  show();
 }
 // Wait for an actual login. Fixed timers used to fire while the child was still
 // typing their PIN, so init() found no kid and never ran again.
 var tries=0;
 var iv=setInterval(function(){
  tries++;
  if(tries>400){ clearInterval(iv); return; }   // give up after ~10 min
  if(!kid())return;
  clearInterval(iv);
  init();
 },1500);
})();
