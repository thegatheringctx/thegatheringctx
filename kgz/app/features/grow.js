// Grow Deeper — the teaching hub.
// A calm section on the Today tab that gathers the deeper-discipleship
// experiences (The Big Story, Big Truths, Verse Keeper, Meet Jesus) into one
// place, so a child can move from *playing* to *knowing*. This file owns only
// the section + a tiny registry; each experience lives in its own module and
// registers a tile here. Load order safe: modules that load before this one
// queue onto window.__wzGrowQ and we drain it.
(function(){
 if(window.__wzGrow)return; window.__wzGrow=1;

 function css(){ if(document.getElementById('wz-grow-css'))return;
  var s=document.createElement('style'); s.id='wz-grow-css';
  s.textContent=
   "#wz-grow{margin:1.1rem 0 .4rem}"+
   "#wz-grow .wg-h{display:flex;align-items:center;gap:.5rem;font-family:Bangers,cursive;letter-spacing:.04em;font-size:1.15rem;color:#f5c842;margin:0 0 .1rem}"+
   "#wz-grow .wg-sub{color:rgba(255,255,255,.5);font-size:.72rem;font-weight:700;margin:0 0 .7rem}"+
   "#wz-grow .wg-g{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}"+
   "@media(min-width:560px){#wz-grow .wg-g{grid-template-columns:1fr 1fr}}"+
   ".wg-tile{position:relative;text-align:left;border:1.5px solid rgba(245,200,66,.28);border-radius:16px;padding:.85rem;background:linear-gradient(135deg,#1c123f,#0d1738);color:#fff;cursor:pointer;font-family:inherit;overflow:hidden;min-height:96px;display:flex;flex-direction:column;justify-content:flex-start}"+
   ".wg-tile:active{transform:scale(.97)}"+
   ".wg-tile .wg-e{font-size:1.7rem;line-height:1;margin-bottom:.35rem}"+
   ".wg-tile .wg-t{font-weight:900;font-size:.92rem;letter-spacing:.01em;margin-bottom:.15rem}"+
   ".wg-tile .wg-s{font-size:.68rem;color:rgba(255,255,255,.62);line-height:1.35}"+
   ".wg-tile .wg-done{position:absolute;top:.55rem;right:.6rem;font-size:.9rem;color:#7ee08a}";
  document.head.appendChild(s); }

 var grid=null, pending=[];

 function ensure(){
  var host=document.getElementById('tab-today'); if(!host)return false;
  var sec=host.querySelector('#wz-grow');
  if(!sec){
   css();
   sec=document.createElement('div'); sec.id='wz-grow';
   sec.innerHTML="<div class='wg-h'>🌱 Grow Deeper</div>"+
     "<div class='wg-sub'>Not just points — get to know God.</div>"+
     "<div class='wg-g'></div>";
   host.appendChild(sec);
  }
  grid=sec.querySelector('.wg-g');
  // (re)paint every registered tile — renderToday may have rebuilt the tab
  var items=window.wzGrow._tiles;
  grid.innerHTML='';
  items.forEach(function(t){ grid.appendChild(tileEl(t)); });
  return true;
 }

 function tileEl(t){
  var b=document.createElement('button'); b.className='wg-tile'; b.setAttribute('data-id',t.id);
  var done=false; try{ done=t.doneToday&&t.doneToday(); }catch(e){}
  b.innerHTML="<div class='wg-e'>"+t.emoji+"</div><div class='wg-t'>"+t.title+"</div><div class='wg-s'>"+t.sub+"</div>"+
    (done?"<div class='wg-done'>✓</div>":"");
  b.onclick=function(){ try{ t.launch(); }catch(e){} };
  return b;
 }

 window.wzGrow={
  _tiles:[],
  add:function(t){
   if(this._tiles.some(function(x){return x.id===t.id;}))return;
   this._tiles.push(t);
   // keep a gentle, intentional order
   var ORDER=['bigstory','catechism','verse','gospel'];
   this._tiles.sort(function(a,b){return ORDER.indexOf(a.id)-ORDER.indexOf(b.id);});
   if(grid)ensure();
  },
  repaint:function(){ if(grid)ensure(); },

  // ---- shared helpers used by every Grow experience ----
  age:function(){ try{ return (window.APP&&APP.kid&&APP.kid.age_group)||'812'; }catch(e){ return '812'; } },
  younger:function(){ return this.age()==='47'; },

  // read-aloud, gated by the app's existing mute toggle when present
  speak:function(t){
   try{
    if(typeof wzMute==='function' && wzMute())return null;
    if(!window.speechSynthesis)return null;
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(String(t).replace(/\s+/g,' ').trim());
    u.rate=this.younger()?0.9:0.97; u.pitch=1.05;
    speechSynthesis.speak(u); return u;
   }catch(e){ return null; }
  },
  hush:function(){ try{ speechSynthesis.cancel(); }catch(e){} },

  // full-screen overlay shell. Returns {ov, body, close}. Closing hushes speech.
  overlay:function(id){
   var self=this;
   var ov=document.createElement('div'); ov.id=id; ov.className='wz-grow-ov';
   ov.innerHTML="<button class='wz-gov-x' aria-label='Close'>✕</button><div class='wz-gov-body'></div>";
   document.body.appendChild(ov);
   function close(){ self.hush(); if(ov&&ov.parentNode)ov.parentNode.removeChild(ov); self.repaint(); }
   ov.querySelector('.wz-gov-x').onclick=close;
   ovCss();
   return { ov:ov, body:ov.querySelector('.wz-gov-body'), close:close };
  },

  // award points defensively; safe no-op if the backend ignores the key.
  // once-a-day guard is the caller's job (via doneToday/localStorage).
  award:function(key,amount){
   try{
    if(!(window.APP&&APP.kid&&typeof wzPost==='function'))return;
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:key,amount:amount})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('⚡ +'+res.granted+' pts!',2200);
      }
     }).catch(function(){});
   }catch(e){}
  },

  // once-per-day marker per kid, in localStorage (no backend write)
  key:function(tag){ var id=(window.APP&&APP.kid&&APP.kid.id)||'x'; return 'wz_grow_'+tag+'_'+id; },
  doneToday:function(tag){ try{ return localStorage.getItem(this.key(tag))===day(); }catch(e){ return false; } },
  markToday:function(tag){ try{ localStorage.setItem(this.key(tag),day()); }catch(e){} }
 };

 function day(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }

 function ovCss(){ if(document.getElementById('wz-gov-css'))return;
  var s=document.createElement('style'); s.id='wz-gov-css';
  s.textContent=
   ".wz-grow-ov{position:fixed;inset:0;z-index:2147483470;background:radial-gradient(circle at 50% 22%,#241056,#08041e);display:flex;flex-direction:column;overflow:hidden}"+
   ".wz-gov-x{position:absolute;top:12px;right:12px;z-index:6;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:14px;width:38px;height:38px;font-size:15px;cursor:pointer}"+
   ".wz-gov-body{flex:1;display:flex;flex-direction:column;overflow-y:auto;padding:3.2rem 1.1rem 1.4rem;color:#fff;-webkit-overflow-scrolling:touch}"+
   ".wz-gov-body .gv-wrap{width:100%;max-width:520px;margin:0 auto;display:flex;flex-direction:column;min-height:100%}"+
   ".gv-dots{display:flex;gap:6px;justify-content:center;margin-bottom:1rem;flex-wrap:wrap}"+
   ".gv-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.22)}"+
   ".gv-dot.on{background:#f5c842}"+
   ".gv-card{flex:1;display:flex;flex-direction:column;justify-content:center}"+
   ".gv-emoji{font-size:3.6rem;text-align:center;line-height:1;margin-bottom:.9rem}"+
   ".gv-h{font-family:Bangers,cursive;letter-spacing:.03em;font-size:1.9rem;color:#f5c842;text-align:center;margin:0 0 .7rem}"+
   ".gv-p{font-size:1.06rem;line-height:1.55;color:#f3f0ff;text-align:center;margin:0 auto .9rem;max-width:440px}"+
   ".gv-verse{background:rgba(245,200,66,.1);border-left:3px solid #f5c842;border-radius:8px;padding:.7rem .85rem;margin:0 auto 1rem;max-width:440px}"+
   ".gv-vt{font-style:italic;color:#fff;font-size:.95rem;line-height:1.5}"+
   ".gv-vr{color:#f5c842;font-size:.74rem;font-weight:900;margin-top:.35rem;letter-spacing:.03em}"+
   ".gv-bar{display:flex;gap:.6rem;padding-top:.8rem}"+
   ".gv-btn{flex:1;background:#f5c842;color:#1a1a2e;border:none;border-radius:15px;padding:.85rem;font-weight:900;font-size:1rem;cursor:pointer;font-family:Bangers,cursive;letter-spacing:.04em}"+
   ".gv-btn.ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25);font-family:inherit;font-weight:800}"+
   ".gv-choices{display:grid;gap:.6rem;max-width:440px;margin:0 auto;width:100%}"+
   ".gv-choice{background:rgba(255,255,255,.09);border:1.5px solid rgba(255,255,255,.22);color:#fff;padding:.85rem;border-radius:14px;font-size:1rem;cursor:pointer;font-family:inherit;text-align:left}"+
   ".gv-choice.right{background:#3ec97a;border-color:#3ec97a;color:#08240f}"+
   ".gv-choice.wrong{background:#e05263;border-color:#e05263}";
  document.head.appendChild(s); }
 // drain anything queued before we existed
 (window.__wzGrowQ||[]).forEach(function(t){ window.wzGrow.add(t); });
 window.__wzGrowQ={push:function(t){ window.wzGrow.add(t); }};

 // Same proven attach pattern the other modules use: poll for the Today tab,
 // then re-inject whenever renderToday rebuilds it.
 function watch(){
  var host=document.getElementById('tab-today'); if(!host)return false;
  if(host.__wzGrowWatched)return true; host.__wzGrowWatched=1;
  var deb=null;
  var mo=new MutationObserver(function(){
   if(host.querySelector('#wz-grow'))return;        // still there, nothing to do
   if(deb)clearTimeout(deb); deb=setTimeout(ensure,150);
  });
  try{ mo.observe(host,{childList:true}); }catch(e){}
  setTimeout(ensure,200);
  return true;
 }
 var n=0, iv=setInterval(function(){ if(watch()||++n>60)clearInterval(iv); },350);
})();
