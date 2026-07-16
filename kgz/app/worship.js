// Warrior Worship — the missing pillar. Kids church is roughly a third singing;
// this app had zero. YouTube EMBEDS ONLY (Billy's licensing call, 2026-07-15).
// Deliberately NOT gamified: no points. Worship is not a points farm.
(function(){
 if(window.__wzWorship)return; window.__wzWorship=1;
 if(typeof dashTab!=='function'||typeof sb!=='function')return;

 function css(){ if(document.getElementById('wz-ws-css'))return;
  var s=document.createElement('style'); s.id='wz-ws-css';
  s.textContent=
   ".ws-hdr{margin-bottom:1rem}"+
   ".ws-song{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:.9rem;margin-bottom:1rem}"+
   ".ws-t{font-weight:900;color:#fff;font-size:.95rem;line-height:1.25}"+
   ".ws-a{font-size:.74rem;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:.6rem}"+
   ".ws-ref{font-size:.68rem;color:#f5c842;font-weight:800;margin-top:.5rem}"+
   ".ws-frame{position:relative;width:100%;padding-top:56.25%;border-radius:11px;overflow:hidden;background:#000}"+
   ".ws-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}"+
   ".ws-empty{text-align:center;padding:2.5rem 1rem;color:rgba(255,255,255,.5);font-size:.86rem;line-height:1.6}";
  document.head.appendChild(s); }

 window.renderWorship=function(){
  var el=document.getElementById('tab-worship'); if(!el)return;
  css();
  el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";
  var grp=(window.APP&&APP.kid)?APP.kid.age_group:'812';
  sb("worship_songs?active=eq.true&or=(age_group.eq."+grp+",age_group.eq.all)&order=sort_order.asc")
   .then(function(rows){
    el.innerHTML='';
    var h=document.createElement('div'); h.className='ws-hdr';
    h.innerHTML="<div style=\"font-family:Bangers,cursive;font-size:1.8rem;color:#fff;letter-spacing:.04em;line-height:1\">Warrior<br><span style=\"color:#f5c842\">Worship</span></div>"+
      "<div style='font-size:.72rem;color:rgba(255,255,255,.4);margin-top:.25rem'>Sing it loud. God is listening.</div>";
    el.appendChild(h);
    if(!rows||!rows.length){
     var e=document.createElement('div'); e.className='ws-empty';
     e.innerHTML="\uD83C\uDFB5<br><br>No songs yet this week.<br>Pastor Billy is picking them out.";
     el.appendChild(e); return;
    }
    rows.forEach(function(s){
     var c=document.createElement('div'); c.className='ws-song';
     var t=document.createElement('div'); t.className='ws-t'; t.textContent=s.title;
     c.appendChild(t);
     if(s.artist){ var a=document.createElement('div'); a.className='ws-a'; a.textContent=s.artist; c.appendChild(a); }
     var f=document.createElement('div'); f.className='ws-frame';
     var ifr=document.createElement('iframe');
     ifr.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(s.youtube_id)+'?rel=0&modestbranding=1&playsinline=1';
     ifr.setAttribute('allow','accelerometer; encrypted-media; gyroscope; picture-in-picture');
     ifr.setAttribute('allowfullscreen',''); ifr.setAttribute('title',s.title);
     f.appendChild(ifr); c.appendChild(f);
     if(s.verse_ref){ var r=document.createElement('div'); r.className='ws-ref'; r.textContent='\uD83D\uDCDC '+s.verse_ref; c.appendChild(r); }
     el.appendChild(c);
    });
   }).catch(function(){
    el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Could not load the songs.</p>";
   });
 };

 // dashTab's tab list is hardcoded and does not know about worship, so it will
 // hide every known tab but never show/hide ours. Handle it here.
 var _dt=dashTab;
 dashTab=function(tab,btn){
  var r=_dt.apply(this,arguments);
  var w=document.getElementById('tab-worship');
  if(w)w.style.display=(tab==='worship')?'block':'none';
  if(tab==='worship')renderWorship();
  return r;
 };
})();
