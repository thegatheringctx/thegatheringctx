// A Word From Pastor Billy — weekly video card.
// Lives at the top of #dash-main (OUTSIDE the tab panes) so tab re-renders
// cannot wipe it. Waits for login rather than guessing a timer.
(function(){
 if(window.__wzPastor)return; window.__wzPastor=1;
 function kid(){try{return (window.APP&&APP.kid)||null;}catch(e){return null;}}
 function css(){ if(document.getElementById('wz-pastor-css'))return;
  var s=document.createElement('style'); s.id='wz-pastor-css';
  s.textContent="#wz-pastor{background:linear-gradient(135deg,#1a1a2e,#252547);border:2px solid #f5c842;border-radius:16px;padding:1rem;margin:0 0 1rem 0;box-shadow:0 8px 24px rgba(0,0,0,.4)}"+
   "#wz-pastor .wzp-kicker{font-family:'Bangers',cursive;letter-spacing:.06em;color:#f5c842;font-size:1.25rem;line-height:1.1}"+
   "#wz-pastor .wzp-sub{color:rgba(255,255,255,.6);font-size:.74rem;font-weight:700;margin-bottom:.6rem}"+
   "#wz-pastor .wzp-frame{position:relative;width:100%;padding-top:56.25%;border-radius:11px;overflow:hidden;background:#000}"+
   "#wz-pastor .wzp-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}"+
   "#wz-pastor .wzp-msg{color:rgba(255,255,255,.82);font-size:.86rem;line-height:1.45;margin:.6rem 0 0}"+
   "#wz-pastor .wzp-btn{margin-top:.7rem;width:100%;background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.7rem;font-weight:900;font-size:.9rem;cursor:pointer;font-family:inherit}"+
   "#wz-pastor .wzp-btn:disabled{opacity:.65;cursor:default}"+
   "#wz-pastor.wzp-done{padding:.6rem .9rem}"+
   "#wz-pastor.wzp-done .wzp-frame,#wz-pastor.wzp-done .wzp-msg,#wz-pastor.wzp-done .wzp-btn,#wz-pastor.wzp-done .wzp-sub{display:none}"+
   "#wz-pastor .wzp-done-row{display:none;align-items:center;justify-content:space-between;gap:.5rem}"+
   "#wz-pastor.wzp-done .wzp-done-row{display:flex}"+
   "#wz-pastor .wzp-check{color:#7ee08a;font-weight:900;font-size:.8rem;white-space:nowrap}"+
   "#wz-pastor .wzp-reopen{background:none;border:1px solid rgba(245,200,66,.5);color:#f5c842;border-radius:8px;padding:.3rem .6rem;font-size:.7rem;font-weight:800;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }
 function watched(v){ try{ return ((kid()||{}).completed_videos||[]).indexOf(v.id)>=0; }catch(e){ return false; } }
 function render(v){
  if(document.getElementById('wz-pastor'))return;
  var main=document.getElementById('dash-main'); if(!main)return;
  css();
  var box=document.createElement('div'); box.id='wz-pastor';
  var safeTitle=(v.title||'A Word From Pastor Billy');
  var head=document.createElement('div'); head.className='wzp-kicker'; head.textContent='\uD83C\uDFA5 '+safeTitle;
  var sub=document.createElement('div'); sub.className='wzp-sub'; sub.textContent='This week \u00B7 from your pastor';
  var frame=document.createElement('div'); frame.className='wzp-frame';
  var ifr=document.createElement('iframe');
  ifr.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.youtube_id)+'?rel=0&modestbranding=1&playsinline=1';
  ifr.setAttribute('allow','accelerometer; encrypted-media; gyroscope; picture-in-picture');
  ifr.setAttribute('allowfullscreen','');
  ifr.setAttribute('title',safeTitle);
  frame.appendChild(ifr);
  box.appendChild(head); box.appendChild(sub); box.appendChild(frame);
  if(v.description){ var m=document.createElement('div'); m.className='wzp-msg'; m.textContent=v.description; box.appendChild(m); }
  var btn=document.createElement('button'); btn.className='wzp-btn'; btn.textContent='\u26A1 I watched it';
  box.appendChild(btn);
  var done=document.createElement('div'); done.className='wzp-done-row';
  var dl=document.createElement('div'); dl.className='wzp-check'; dl.textContent='\u2713 Watched this week';
  var re=document.createElement('button'); re.className='wzp-reopen'; re.textContent='Watch again';
  done.appendChild(dl); done.appendChild(re); box.appendChild(done);
  re.onclick=function(){ box.classList.remove('wzp-done'); };
  btn.onclick=function(){
   var k=kid(); if(!k)return;
   btn.disabled=true; btn.textContent='...';
   // wzPost lives in core-b (loads after this file) so it is only touched at runtime
   wzPost('wz-award',{action:'video',kidId:k.id,pin:k.pin,key:v.id}).then(function(res){
    if(res&&res.ok){
     if(typeof wzSyncKid==='function')wzSyncKid(res);
     var arr=k.completed_videos||[]; if(arr.indexOf(v.id)<0)arr.push(v.id); k.completed_videos=arr;
     if(res.granted>0&&typeof toast==='function')toast('\u26A1 +'+res.granted+' pts \u2014 thanks for listening!',3000);
     box.classList.add('wzp-done');
    } else { btn.disabled=false; btn.textContent='\u26A1 I watched it'; }
   }).catch(function(){ btn.disabled=false; btn.textContent='\u26A1 I watched it'; });
  };
  if(watched(v))box.classList.add('wzp-done');
  main.insertBefore(box, main.firstChild);
 }
 function load(){
  sb("videos?active=eq.true&topic=eq.pastor&age_group=eq.all&order=created_at.desc&limit=1").then(function(rows){
   if(rows&&rows.length)render(rows[0]);   // silent when Billy hasn't posted one
  }).catch(function(){});
 }
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>400){clearInterval(iv);return;}
  if(!kid())return;
  clearInterval(iv); load();
 },1500);
})();
