// Talk About It At Home — the parent bridge.
// Stores no parent contact data: the kid's own device carries it home via the
// native share sheet. Collapsed by default so it doesn't crowd the dashboard.
(function(){
 if(window.__wzTalk)return; window.__wzTalk=1;
 function kid(){try{return (window.APP&&APP.kid)||null;}catch(e){return null;}}
 function css(){ if(document.getElementById('wz-talk-css'))return;
  var s=document.createElement('style'); s.id='wz-talk-css';
  s.textContent="#wz-talk{background:linear-gradient(135deg,#20203a,#191930);border:1px solid rgba(245,200,66,.45);border-radius:14px;margin:0 0 1rem 0;overflow:hidden}"+
   "#wz-talk .wzt-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.7rem .9rem;cursor:pointer;user-select:none}"+
   "#wz-talk .wzt-t{font-weight:900;color:#f5c842;font-size:.86rem}"+
   "#wz-talk .wzt-hint{font-size:.7rem;color:rgba(255,255,255,.45);font-weight:700}"+
   "#wz-talk .wzt-body{display:none;padding:0 .9rem .9rem}"+
   "#wz-talk.open .wzt-body{display:block}"+
   "#wz-talk .wzt-sum{color:rgba(255,255,255,.8);font-size:.84rem;line-height:1.45;margin:0 0 .6rem}"+
   "#wz-talk .wzt-verse{background:rgba(245,200,66,.1);border-left:3px solid #f5c842;border-radius:6px;padding:.55rem .7rem;margin-bottom:.7rem}"+
   "#wz-talk .wzt-vt{color:#fff;font-size:.84rem;font-style:italic;line-height:1.45}"+
   "#wz-talk .wzt-vr{color:#f5c842;font-size:.72rem;font-weight:900;margin-top:.25rem}"+
   "#wz-talk ol{margin:0 0 .8rem;padding-left:1.1rem}"+
   "#wz-talk li{color:rgba(255,255,255,.85);font-size:.84rem;line-height:1.5;margin-bottom:.35rem}"+
   "#wz-talk .wzt-btn{width:100%;background:#f5c842;color:#1a1a2e;border:none;border-radius:10px;padding:.65rem;font-weight:900;font-size:.85rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }
 function shareText(t){
  var k=kid()||{};
  var lines=[];
  lines.push((k.first_name?k.first_name:'Your warrior')+' learned this at Warrior Zone this week:');
  lines.push('');
  lines.push(t.title);
  if(t.kid_summary)lines.push(t.kid_summary);
  if(t.verse){ lines.push(''); lines.push('"'+t.verse+'"'+(t.verse_ref?' — '+t.verse_ref:'')); }
  lines.push('');
  lines.push('Talk about it at home:');
  (t.questions||[]).forEach(function(q,i){ lines.push((i+1)+'. '+q); });
  lines.push('');
  lines.push('— The Gathering CTX');
  return lines.join('\n');
 }
 function render(t){
  if(document.getElementById('wz-talk'))return;
  var main=document.getElementById('dash-main'); if(!main)return;
  css();
  var box=document.createElement('div'); box.id='wz-talk';
  var head=document.createElement('div'); head.className='wzt-head';
  var lt=document.createElement('div'); lt.className='wzt-t'; lt.textContent='\uD83D\uDCE3 Talk About It At Home';
  var hint=document.createElement('div'); hint.className='wzt-hint'; hint.textContent='tap to open';
  head.appendChild(lt); head.appendChild(hint);
  var body=document.createElement('div'); body.className='wzt-body';
  if(t.kid_summary){ var sm=document.createElement('p'); sm.className='wzt-sum'; sm.textContent=t.kid_summary; body.appendChild(sm); }
  if(t.verse){
   var vb=document.createElement('div'); vb.className='wzt-verse';
   var vt=document.createElement('div'); vt.className='wzt-vt'; vt.textContent='"'+t.verse+'"';
   vb.appendChild(vt);
   if(t.verse_ref){ var vr=document.createElement('div'); vr.className='wzt-vr'; vr.textContent=t.verse_ref; vb.appendChild(vr); }
   body.appendChild(vb);
  }
  var ol=document.createElement('ol');
  (t.questions||[]).forEach(function(q){ var li=document.createElement('li'); li.textContent=q; ol.appendChild(li); });
  body.appendChild(ol);
  var btn=document.createElement('button'); btn.className='wzt-btn'; btn.textContent='\uD83D\uDCE4 Send to my grown-up';
  body.appendChild(btn);
  box.appendChild(head); box.appendChild(body);
  head.onclick=function(){ box.classList.toggle('open'); hint.textContent=box.classList.contains('open')?'tap to close':'tap to open'; };
  btn.onclick=function(){
   var txt=shareText(t);
   if(navigator.share){
    navigator.share({title:'Warrior Zone — Talk About It At Home',text:txt}).catch(function(){});
   } else if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){
     if(typeof toast==='function')toast('\u2713 Copied — paste it to your grown-up!',3500);
    }).catch(function(){});
   } else {
    if(typeof toast==='function')toast('Show this screen to your grown-up!',3500);
   }
  };
  // sits under the pastor card when both are present
  var pastor=document.getElementById('wz-pastor');
  if(pastor&&pastor.nextSibling)main.insertBefore(box,pastor.nextSibling);
  else if(pastor)main.appendChild(box);
  else main.insertBefore(box,main.firstChild);
 }
 function load(){
  sb("family_talk?active=eq.true&order=created_at.desc&limit=1").then(function(rows){
   if(rows&&rows.length)render(rows[0]);   // silent when nothing is posted
  }).catch(function(){});
 }
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>400){clearInterval(iv);return;}
  if(!kid())return;
  clearInterval(iv); setTimeout(load,600); // let the pastor card land first
 },1500);
})();
