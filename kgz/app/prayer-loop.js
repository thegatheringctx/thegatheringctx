// The answer coming back — a child who knows her pastor prayed for her BY NAME
// is being shepherded. Wraps renderPrayer rather than reimplementing it.
(function(){
 if(window.__wzPrayLoop)return; window.__wzPrayLoop=1;
 if(typeof renderPrayer!=='function'||typeof sb!=='function')return;

 function css(){ if(document.getElementById('wz-pl-css'))return;
  var s=document.createElement('style'); s.id='wz-pl-css';
  s.textContent=
   "#wz-prayed{background:linear-gradient(135deg,rgba(245,200,66,.2),rgba(245,200,66,.05));border:2px solid #f5c842;border-radius:16px;padding:.95rem;margin-bottom:1rem}"+
   "#wz-prayed .pl-t{font-family:Bangers,cursive;font-size:1.15rem;color:#f5c842;letter-spacing:.03em;line-height:1.15}"+
   "#wz-prayed .pl-s{font-size:.75rem;color:rgba(255,255,255,.6);font-weight:700;margin:.15rem 0 .6rem}"+
   "#wz-prayed .pl-q{background:rgba(0,0,0,.28);border-left:3px solid #f5c842;border-radius:6px;padding:.5rem .65rem;margin-bottom:.4rem}"+
   "#wz-prayed .pl-x{font-size:.82rem;color:#fff;line-height:1.4;font-style:italic}"+
   "#wz-prayed .pl-w{font-size:.68rem;color:rgba(245,200,66,.85);font-weight:800;margin-top:.25rem}";
  document.head.appendChild(s); }

 function decorate(){
  var el=document.getElementById('tab-prayer');
  if(!el||!window.APP||!APP.kid)return;
  if(document.getElementById('wz-prayed'))return;
  sb('prayer_wall?select=id,text,prayed_at&kid_id=eq.'+encodeURIComponent(APP.kid.id)+'&prayed_by_pastor=is.true&order=prayed_at.desc&limit=3')
   .then(function(rows){
    if(!rows||!rows.length)return;
    if(document.getElementById('wz-prayed'))return;
    css();
    var box=document.createElement('div'); box.id='wz-prayed';
    var t=document.createElement('div'); t.className='pl-t';
    t.textContent='\uD83D\uDE4F Pastor Billy prayed for you, '+(APP.kid.first_name||'warrior')+'.';
    var s=document.createElement('div'); s.className='pl-s';
    s.textContent='You are not praying alone. Your pastor prayed for this by name.';
    box.appendChild(t); box.appendChild(s);
    rows.forEach(function(p){
     var q=document.createElement('div'); q.className='pl-q';
     var x=document.createElement('div'); x.className='pl-x'; x.textContent='\u201C'+p.text+'\u201D';
     q.appendChild(x);
     if(p.prayed_at){
      var w=document.createElement('div'); w.className='pl-w';
      var d=new Date(p.prayed_at);
      w.textContent='\u2713 Prayed for on '+d.toLocaleDateString();
      q.appendChild(w);
     }
     box.appendChild(q);
    });
    el.insertBefore(box, el.firstChild);
   }).catch(function(){});
 }

 var _rp=renderPrayer;
 renderPrayer=function(){
  var r=_rp.apply(this,arguments);
  setTimeout(decorate,350);
  return r;
 };
})();
