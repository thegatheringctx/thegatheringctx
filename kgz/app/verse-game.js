// Verse Builder — rebuild the verse by tapping words in order.
// Replaces a self-graded "I said it" button with actual active recall, so the
// 20 points are earned rather than claimed. Award path (awardVerse -> wz-award)
// is reused untouched. No timer, no score, no fail state: wrong taps just wobble.
(function(){
 if(window.__wzVerseGame)return; window.__wzVerseGame=1;
 if(typeof renderVerse!=='function'||typeof sb!=='function')return;

 function W(t){ return String(t||'').trim().split(/\s+/).filter(Boolean); }
 function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
 function pickBlanks(n,frac){
  var count=Math.max(1,Math.round(n*frac));
  var all=[]; for(var i=0;i<n;i++)all.push(i);
  return shuffle(all).slice(0,count).sort(function(a,b){return a-b;});
 }
 function css(){ if(document.getElementById('wz-vg-css'))return;
  var s=document.createElement('style'); s.id='wz-vg-css';
  s.textContent=
   ".vg-card{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.35);border-radius:16px;padding:1.1rem;margin-bottom:1rem}"+
   ".vg-ref{color:#f5c842;font-weight:900;font-size:.8rem;letter-spacing:.04em;margin-bottom:.6rem}"+
   ".vg-verse{font-size:1.15rem;line-height:2.1;color:#fff;text-align:center;margin:.5rem 0 1rem;display:flex;flex-wrap:wrap;gap:.3rem;justify-content:center}"+
   ".vg-w{padding:.1rem .15rem}"+
   ".vg-slot{display:inline-block;min-width:54px;border-bottom:3px solid rgba(245,200,66,.55);height:1.6em}"+
   ".vg-slot.done{border-bottom-color:#7ee08a;color:#7ee08a;font-weight:800}"+
   ".vg-slot.next{border-bottom-color:#f5c842;background:rgba(245,200,66,.12);border-radius:4px}"+
   ".vg-tiles{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;margin-top:.4rem}"+
   ".vg-tile{background:#f5c842;color:#1a1a2e;border:none;border-radius:10px;padding:.6rem .85rem;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;min-height:44px}"+
   ".vg-tile:disabled{opacity:.25;cursor:default}"+
   ".vg-tile.bad{animation:vgwob .4s}"+
   "@keyframes vgwob{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px) rotate(-3deg)}75%{transform:translateX(7px) rotate(3deg)}}"+
   ".vg-btn{width:100%;margin-top:.9rem;background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.75rem;font-weight:900;font-size:.95rem;cursor:pointer;font-family:inherit}"+
   ".vg-ghost{background:none;border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.75)}"+
   ".vg-step{text-align:center;font-size:.72rem;font-weight:800;color:rgba(255,255,255,.45);letter-spacing:.05em;text-transform:uppercase;margin-bottom:.5rem}"+
   ".vg-done{text-align:center;color:#7ee08a;font-weight:900;padding:.5rem}";
  document.head.appendChild(s); }

 function buildCard(v, already){
  var words=W(v.text);
  var card=document.createElement('div'); card.className='vg-card';
  var ref=document.createElement('div'); ref.className='vg-ref'; ref.textContent='\uD83D\uDCDC '+(v.reference||'');
  card.appendChild(ref);
  var step=document.createElement('div'); step.className='vg-step'; card.appendChild(step);
  var line=document.createElement('div'); line.className='vg-verse'; card.appendChild(line);
  var tiles=document.createElement('div'); tiles.className='vg-tiles'; card.appendChild(tiles);
  var act=document.createElement('button'); act.className='vg-btn'; card.appendChild(act);

  // 4-7 verses are tiny ("God is love."), so one build round is plenty.
  // 8-12 get a scaffolded half-blank round first.
  var stages=[{k:'read'}];
  if(words.length>=6)stages.push({k:'blank',frac:.5});
  stages.push({k:'blank',frac:1});
  var si=0, blanks=[], filled=0;

  function drawRead(){
   step.textContent='Step 1 \u00B7 Read it out loud';
   line.innerHTML=''; tiles.innerHTML='';
   words.forEach(function(w){ var s=document.createElement('span'); s.className='vg-w'; s.textContent=w; line.appendChild(s); });
   act.className='vg-btn'; act.textContent="I'm ready \u2192";
   act.onclick=function(){ si++; draw(); };
  }
  function drawBlank(st){
   blanks=pickBlanks(words.length,st.frac); filled=0;
   step.textContent = st.frac>=1 ? ('Step '+(si+1)+' \u00B7 Build the whole verse') : ('Step '+(si+1)+' \u00B7 Fill in the missing words');
   line.innerHTML='';
   words.forEach(function(w,i){
    var s=document.createElement('span');
    if(blanks.indexOf(i)>=0){ s.className='vg-slot'; s.dataset.i=String(i); }
    else { s.className='vg-w'; s.textContent=w; }
    line.appendChild(s);
   });
   markNext();
   tiles.innerHTML='';
   shuffle(blanks.map(function(i){return {i:i,w:words[i]};})).forEach(function(o){
    var b=document.createElement('button'); b.className='vg-tile'; b.textContent=o.w;
    b.onclick=function(){ tap(b,o); };
    tiles.appendChild(b);
   });
   act.className='vg-btn vg-ghost'; act.textContent='\u21BA Start over';
   act.onclick=function(){ draw(); };
  }
  function markNext(){
   var slots=line.querySelectorAll('.vg-slot');
   slots.forEach(function(s){ s.classList.remove('next'); });
   for(var i=0;i<slots.length;i++){ if(!slots[i].classList.contains('done')){ slots[i].classList.add('next'); break; } }
  }
  function tap(btn,o){
   var want=blanks[filled];
   if(o.i!==want){
    // wrong word: wobble, say nothing harsh, cost nothing
    btn.classList.add('bad'); setTimeout(function(){ btn.classList.remove('bad'); },420);
    return;
   }
   var slot=line.querySelector('.vg-slot[data-i="'+want+'"]');
   if(slot){ slot.textContent=o.w; slot.classList.add('done'); slot.classList.remove('next'); }
   btn.disabled=true; filled++; markNext();
   if(filled>=blanks.length)stageDone();
  }
  function stageDone(){
   if(si<stages.length-1){
    act.className='vg-btn'; act.textContent='Nice! Next \u2192';
    act.onclick=function(){ si++; draw(); };
    return;
   }
   finish();
  }
  function finish(){
   step.textContent='\u2713 You built it from memory';
   tiles.innerHTML='';
   if(already){
    act.className='vg-btn vg-ghost'; act.textContent='\u21BA Practice again';
    act.onclick=function(){ si=0; draw(); };
    return;
   }
   already=true;
   act.className='vg-btn'; act.textContent='\u26A1 Claim +'+(v.points||20);
   act.onclick=function(){
    act.disabled=true; act.textContent='...';
    try{ awardVerse(v); }catch(e){}
    setTimeout(function(){
     act.disabled=false; act.className='vg-btn vg-ghost'; act.textContent='\u21BA Practice again';
     act.onclick=function(){ si=0; draw(); };
    },1200);
   };
  }
  function draw(){
   var st=stages[si];
   if(st.k==='read')drawRead(); else drawBlank(st);
  }
  draw();
  return card;
 }

 renderVerse=function(){
  var el=document.getElementById('tab-verse'); if(!el)return;
  css();
  el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";
  var grp=(window.APP&&APP.kid)?APP.kid.age_group:'812';
  sb('memory_verses?active=eq.true&age_group=eq.'+grp+'&order=sort_order.asc').then(function(rows){
   el.innerHTML='';
   var hdr=document.createElement('div'); hdr.style.cssText='margin-bottom:1rem';
   hdr.innerHTML="<div style=\"font-family:Bangers,cursive;font-size:1.7rem;letter-spacing:.03em;color:#fff\">MEMORY <span style=\"color:#f5c842\">VERSE</span></div>"+
     "<p class='muted' style='margin:.15rem 0 0;font-size:.8rem'>Hide the words. Build it back. Hide it in your heart.</p>";
   el.appendChild(hdr);
   if(!rows||!rows.length){
    var p=document.createElement('p'); p.className='muted'; p.style.cssText='text-align:center;padding:2rem';
    p.textContent='No verse this week.'; el.appendChild(p); return;
   }
   var doneList=(window.APP&&APP.kid&&APP.kid.completed_verses)||[];
   rows.forEach(function(v){ el.appendChild(buildCard(v, doneList.indexOf(v.id)>=0)); });
  }).catch(function(){
   el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Could not load the verse. Try again.</p>";
  });
 };
})();
