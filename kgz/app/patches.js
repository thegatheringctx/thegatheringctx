// app/patches.js — PORT increment 1: the 10 runtime-patch modules,
// bundled in load order with per-segment isolation. Behavior-identical to the
// former 10 <script> tags. Next increments fold these into core-b one at a time.

/* =================== app/auth.js =================== */
try {
// Keep sensitive child data away from the browser's anon key.
// Queries needing privileged data are rerouted to service-role edge functions.
// We wrap sb() rather than reimplement the UI, so the PIN pad, the multi-kid
// picker, the prayer wall and the admin panel keep their exact behaviour.
(function(){
 if(window.__wzAuth)return; window.__wzAuth=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb=sb;
 function admPass(){ return (typeof ADM!=='undefined'&&ADM&&ADM.pass)?ADM.pass:''; }
 function kid(){ try{ return (window.APP&&APP.kid)||null; }catch(e){ return null; } }
 function isGet(opts){ return !opts || !opts.method || String(opts.method).toUpperCase()==='GET'; }

 window.sb=function(path,opts){
  try{
   if(typeof path==='string'){

    if(path.indexOf('kids?select=*')===0){
     // 1. kid login: last name + PIN
     var m=path.match(/last_name=ilike\.([^&]*)&pin=eq\.(\d{4})/);
     if(m){
      var typed=m[2];
      return wzPost('wz-login',{mode:'kid',last_name:decodeURIComponent(m[1]),pin:typed})
       .then(function(r){
        if(!r||!r.ok||!r.kids)return [];
        // reattach the PIN the child just typed: wz-award needs it and the
        // server deliberately never sends it back.
        return r.kids.map(function(k){ k.pin=typed; return k; });
       });
     }
     // 2. admin kid list
     if(path.indexOf('order=points.desc')>=0){
      return wzPost('wz-admin',{action:'kids',pass:admPass()})
       .then(function(r){ return (r&&r.ok&&r.kids)?r.kids:[]; });
     }
     // 3. parent login: PIN only
     var p=path.match(/pin=eq\.(\d{4})/);
     if(p){
      var ptyped=p[1];
      return wzPost('wz-login',{mode:'parent',pin:ptyped})
       .then(function(r){
        if(!r||!r.ok||!r.kids)return [];
        return r.kids.map(function(k){ k.pin=ptyped; return k; });
       });
     }
    }

    // 4. admin decisions list (anon SELECT revoked)
    if(path.indexOf('decisions?')===0 && isGet(opts)){
     return wzPost('wz-admin',{action:'rest',table:'decisions',method:'GET',query:'?'+path.split('?')[1],pass:admPass()})
      .then(function(r){ return (r&&r.ok&&Array.isArray(r.data))?r.data:[]; });
    }

    // 5. PRAYER WALL reads (anon SELECT revoked — a stranger could scrape
    //    children's grief). Kids read it via wz-read with id+pin; the admin
    //    (which needs unapproved rows too) goes through wz-admin.
    if(path.indexOf('prayer_wall?')===0 && isGet(opts)){
     var k=kid();
     var mine=path.match(/kid_id=eq\.([^&]+)/);
     if(k && mine && path.indexOf('prayed_by_pastor=is.true')>=0){
      return wzPost('wz-read',{kid_id:k.id,pin:k.pin,what:'my-answered'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     if(k && path.indexOf('approved=eq.true')>=0){
      return wzPost('wz-read',{kid_id:k.id,pin:k.pin,what:'prayers'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     // admin view (all rows, incl. unapproved)
     if(admPass()){
      return wzPost('wz-admin',{action:'rest',table:'prayer_wall',method:'GET',query:'?'+path.split('?')[1],pass:admPass()})
       .then(function(r){ return (r&&r.ok&&Array.isArray(r.data))?r.data:[]; });
     }
     return Promise.resolve([]);
    }

    // 6. TRANSACTIONS reads — a child's own ledger only.
    if(path.indexOf('transactions?')===0 && isGet(opts)){
     var k2=kid();
     if(k2){
      return wzPost('wz-read',{kid_id:k2.id,pin:k2.pin,what:'my-transactions'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     return Promise.resolve([]);
    }
   }
  }catch(e){}
  return _sb(path,opts);
 };
})();

// ---- signup routing (appended) ----------------------------------------
// The client POSTed straight to `kids` with a client-generated random id and no
// collision check. Now: wz-signup validates, allocates a unique id, rate limits.
(function(){
 if(window.__wzSignup)return; window.__wzSignup=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb2=sb;
 window.sb=function(path,opts){
  try{
   if(path==='kids' && opts && String(opts.method).toUpperCase()==='POST' && opts.body){
    var k=opts.body;
    var typedPin=k.pin;
    return wzPost('wz-signup',{
      first_name:k.first_name, last_name:k.last_name, age:k.age,
      parent_name:k.parent_name, pin:typedPin,
      code:(window.__wzSignupCode||'')
    }).then(function(r){
      if(!r||!r.ok){
       var msg={bad_code:'That signup code is not right.',
                too_many_signups:'Too many new warriors from here right now. Try again shortly.',
                bad_pin:'PIN must be exactly 4 digits.',
                bad_age:'Enter a valid age (4-18).',
                missing_name:'Enter first and last name.',
                name_too_long:'That name is too long.'}[r&&r.error]||'Could not create the account. Try again.';
       throw new Error(msg);
      }
      // reattach the PIN the child just typed — the server never returns it,
      // and wz-award needs it for the rest of the session.
      var kid=r.kid; kid.pin=typedPin;
      return [kid];
    });
   }
  }catch(e){ if(e && e.message) throw e; }
  return _sb2(path,opts);
 };
})();

} catch(__wzPatchErr){ try{console.error("[wz patch] auth",__wzPatchErr);}catch(_){} }

/* =================== app/verse-game.js =================== */
try {
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

} catch(__wzPatchErr){ try{console.error("[wz patch] verse-game",__wzPatchErr);}catch(_){} }

/* =================== app/ranks.js =================== */
try {
// Hall of Victory — belonging, not ranking.
// REPLACES a public 1..21 leaderboard titled "Who is walking in the most armor?".
// Live data showed top=9037, median=70, 12 of 21 kids under 100: the board told
// most children they were last, with a gap no effort could close, and framed it
// as spiritual attainment. Now: one shared church goal, progress against
// YOURSELF, and every kid who showed up this week named. No child is ranked.
(function(){
 if(window.__wzBelong)return; window.__wzBelong=1;
 if(typeof renderRanks!=='function'||typeof sb!=='function')return;

 var TIERS=[{k:'belt',n:'Belt of Truth',p:50},{k:'breastplate',n:'Breastplate',p:150},
  {k:'boots',n:'Boots of Peace',p:400},{k:'shield',n:'Shield of Faith',p:900},
  {k:'helmet',n:'Helmet',p:2000},{k:'sword',n:'Sword of the Spirit',p:4000},
  {k:'full',n:'FULL ARMOR',p:8000}];

 function css(){ if(document.getElementById('wz-bl-css'))return;
  var s=document.createElement('style'); s.id='wz-bl-css';
  s.textContent=
   ".bl-card{background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:1.1rem;margin-bottom:1rem}"+
   ".bl-hero{background:linear-gradient(135deg,rgba(245,200,66,.16),rgba(245,200,66,.04));border:2px solid rgba(245,200,66,.45)}"+
   ".bl-t{font-family:Bangers,cursive;font-size:1.25rem;letter-spacing:.04em;color:#f5c842;line-height:1.1;margin-bottom:.15rem}"+
   ".bl-sub{font-size:.72rem;color:rgba(255,255,255,.45);font-weight:700;margin-bottom:.8rem}"+
   ".bl-nums{display:flex;gap:.6rem;flex-wrap:wrap}"+
   ".bl-num{flex:1;min-width:88px;text-align:center;background:rgba(0,0,0,.25);border-radius:12px;padding:.7rem .4rem}"+
   ".bl-n{font-family:Bangers,cursive;font-size:1.9rem;color:#f5c842;line-height:1}"+
   ".bl-l{font-size:.6rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-top:.2rem}"+
   ".bl-bar{height:10px;background:rgba(0,0,0,.35);border-radius:6px;overflow:hidden;margin:.5rem 0 .3rem}"+
   ".bl-fill{height:100%;background:linear-gradient(90deg,#f5c842,#ffe08a);border-radius:6px;transition:width .6s}"+
   ".bl-next{font-size:.74rem;color:rgba(255,255,255,.65)}"+
   ".bl-pieces{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.55rem}"+
   ".bl-p{font-size:.66rem;font-weight:800;padding:.28rem .5rem;border-radius:20px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.35)}"+
   ".bl-p.on{background:rgba(245,200,66,.2);color:#f5c842}"+
   ".bl-wall{display:flex;flex-wrap:wrap;gap:.4rem}"+
   ".bl-name{background:rgba(245,200,66,.13);color:#f5c842;border-radius:20px;padding:.32rem .68rem;font-size:.76rem;font-weight:800}"+
   ".bl-name.me{background:#f5c842;color:#1a1a2e}";
  document.head.appendChild(s); }

 function daysAgo(ymd){
  if(!ymd)return 999;
  var p=String(ymd).split('-'); if(p.length!==3)return 999;
  var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));
  return Math.floor((Date.now()-d.getTime())/86400000);
 }

 loadRanks=function(){
  sb('kids?select=first_name,lifetime_points,points,completed_verses,last_active&limit=500')
   .then(function(rows){ APP.kids=rows||[]; renderRanks(); })
   .catch(function(){ APP.kids=[]; renderRanks(); });
 };

 renderRanks=function(){
  var el=document.getElementById('tab-ranks'); if(!el)return;
  css(); el.innerHTML='';

  var hdr=document.createElement('div'); hdr.style.cssText='margin-bottom:1rem';
  hdr.innerHTML="<div style=\"font-family:Bangers,cursive;font-size:1.8rem;color:#fff;letter-spacing:.04em;line-height:1\">Hall of<br><span style=\"color:#f5c842\">Victory</span></div>"+
   "<div style='font-size:.72rem;color:rgba(255,255,255,.4);margin-top:.25rem'>One body. One mission. Every warrior counts.</div>";
  el.appendChild(hdr);

  if(!APP.kids||!APP.kids.length){
   var ld=document.createElement('p'); ld.className='muted'; ld.textContent='Loading warriors...';
   el.appendChild(ld); loadRanks(); return;
  }

  // ---- 1. what the church has done TOGETHER ----
  var verses=0, pieces=0, active=0;
  APP.kids.forEach(function(k){
   verses += (k.completed_verses||[]).length;
   try{ pieces += getArmor(k).length; }catch(e){}
   if(daysAgo(k.last_active)<=7) active++;
  });
  var c1=document.createElement('div'); c1.className='bl-card bl-hero';
  c1.innerHTML="<div class='bl-t'>\uD83C\uDFF0 The Gathering Warriors</div>"+
   "<div class='bl-sub'>What God is doing through all of us together</div>"+
   "<div class='bl-nums'>"+
    "<div class='bl-num'><div class='bl-n'>"+verses+"</div><div class='bl-l'>Verses<br>Memorized</div></div>"+
    "<div class='bl-num'><div class='bl-n'>"+pieces+"</div><div class='bl-l'>Armor<br>Earned</div></div>"+
    "<div class='bl-num'><div class='bl-n'>"+APP.kids.length+"</div><div class='bl-l'>Warriors<br>Strong</div></div>"+
   "</div>";
  el.appendChild(c1);

  // ---- 2. YOUR journey, measured against yourself ----
  if(APP.kid){
   var lp=(APP.kid.lifetime_points!=null?APP.kid.lifetime_points:(APP.kid.points||0));
   var mine=[]; try{ mine=getArmor(APP.kid); }catch(e){}
   var next=null;
   for(var i=0;i<TIERS.length;i++){ if(lp<TIERS[i].p){ next=TIERS[i]; break; } }
   var prevP=0;
   for(var j=0;j<TIERS.length;j++){ if(lp>=TIERS[j].p)prevP=TIERS[j].p; }
   var pct = next ? Math.max(2,Math.round(((lp-prevP)/(next.p-prevP))*100)) : 100;

   var c2=document.createElement('div'); c2.className='bl-card';
   var pieceHtml=TIERS.map(function(t){
    return "<span class='bl-p"+(mine.indexOf(t.k)>=0?' on':'')+"'>"+(mine.indexOf(t.k)>=0?'\u2713 ':'')+t.n+"</span>";
   }).join('');
   c2.innerHTML="<div class='bl-t'>\u2694\uFE0F Your Journey</div>"+
    "<div class='bl-sub'>You against yesterday's you. Nobody else.</div>"+
    "<div class='bl-nums' style='margin-bottom:.7rem'>"+
     "<div class='bl-num'><div class='bl-n'>"+(APP.kid.streak_count||0)+"</div><div class='bl-l'>Day<br>Streak</div></div>"+
     "<div class='bl-num'><div class='bl-n'>"+(APP.kid.best_streak||0)+"</div><div class='bl-l'>Your<br>Best</div></div>"+
     "<div class='bl-num'><div class='bl-n'>"+((APP.kid.completed_verses||[]).length)+"</div><div class='bl-l'>Verses<br>You Know</div></div>"+
    "</div>"+
    (next
      ? "<div class='bl-bar'><div class='bl-fill' style='width:"+pct+"%'></div></div>"+
        "<div class='bl-next'>"+(next.p-lp)+" more points to earn your <b style='color:#f5c842'>"+next.n+"</b></div>"
      : "<div class='bl-next'>\uD83C\uDFC6 You are wearing the <b style='color:#f5c842'>FULL ARMOR OF GOD</b>. Keep walking.</div>")+
    "<div class='bl-pieces'>"+pieceHtml+"</div>";
   el.appendChild(c2);
  }

  // ---- 3. everyone who showed up this week, unranked ----
  var week=APP.kids.filter(function(k){ return daysAgo(k.last_active)<=7; });
  var c3=document.createElement('div'); c3.className='bl-card';
  var t3=document.createElement('div'); t3.className='bl-t'; t3.textContent='\uD83D\uDEE1\uFE0F Wall of Warriors';
  var s3=document.createElement('div'); s3.className='bl-sub';
  s3.textContent = week.length ? 'Everyone who showed up this week. No order. No score.' : 'Be the first warrior on the wall this week.';
  c3.appendChild(t3); c3.appendChild(s3);
  var wall=document.createElement('div'); wall.className='bl-wall';
  week.map(function(k){ return k.first_name||'Warrior'; })
      .sort(function(a,b){ return a.localeCompare(b); })
      .forEach(function(n){
       var sp=document.createElement('span'); sp.className='bl-name';
       if(APP.kid&&n===APP.kid.first_name)sp.className+=' me';
       sp.textContent=n; wall.appendChild(sp);
      });
  c3.appendChild(wall); el.appendChild(c3);
 };
})();

} catch(__wzPatchErr){ try{console.error("[wz patch] ranks",__wzPatchErr);}catch(_){} }

/* =================== app/prayer-loop.js =================== */
try {
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

} catch(__wzPatchErr){ try{console.error("[wz patch] prayer-loop",__wzPatchErr);}catch(_){} }

/* =================== app/game-data.js =================== */
try {
// Age-aware, database-backed game pools (all 5 games; merged single IIFE).
(function(){
 if(window.__wzGameData)return; window.__wzGameData=1;
 if(typeof sb!=='function')return;
 function grp(){ try{ return (window.APP&&APP.kid&&APP.kid.age_group)||'812'; }catch(e){ return '812'; } }
 function load(game){
  return sb('game_content?active=eq.true&game=eq.'+game+'&age_group=eq.'+grp()+'&order=sort_order.asc')
   .then(function(rows){ return (rows||[]).map(function(r){ return r.payload; }); })
   .catch(function(){ return []; });
 }
 function refresh(){
  load('tf').then(function(p){ if(p.length>=10 && typeof TFPOOL!=='undefined') TFPOOL=p; });
  load('fitb').then(function(p){ if(p.length>=7 && typeof FITBPOOL!=='undefined') FITBPOOL=p; });
  load('scramble').then(function(p){ if(p.length>=3 && typeof SCRAMPOOL!=='undefined') SCRAMPOOL=p; });
  load('match').then(function(p){ if(p.length>=5 && typeof MPAIRS!=='undefined') MPAIRS=p; });
  load('wheel').then(function(p){ if(p.length>=4 && typeof WCHALLENGES!=='undefined') WCHALLENGES=p; });
 }
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>400){clearInterval(iv);return;}
  if(!(window.APP&&APP.kid))return;
  clearInterval(iv); refresh();
 },1500);
 window.__wzPoolRefresh=refresh;
})();
} catch(__wzPatchErr){ try{console.error("[wz patch] game-data",__wzPatchErr);}catch(_){} }

/* =================== app/darts.js =================== */
try {
// Fiery Darts — Ephesians 6:16.
// The first Arena game that needs NO READING: every other game is reading
// comprehension in a costume, which locked out the 4-7 band entirely.
// The mechanic IS the lesson: darts come, you raise the shield, they go out.
// No lives, no "game over", no shaming — a missed dart just puffs out.
//
// MOVEMENT: CSS animation, NOT requestAnimationFrame. rAF returns 0 frames in a
// backgrounded tab, which left darts frozen off-screen while the timer ran down.
(function(){
 if(window.__wzDarts)return; window.__wzDarts=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 function artBg(file){
  return "linear-gradient(rgba(10,8,30,.72),rgba(10,8,30,.9)), url('img/"+file+"') center 28%/cover no-repeat";
 }
 if(!GAMES.some(function(g){return g.id==='darts';})){
  GAMES.push({id:'darts',title:'Fiery Darts',emoji:'\uD83D\uDEE1\uFE0F',bg:artBg('story-god47-2.jpg'),
   pts:20,sub:'Raise the shield · no reading needed'});
 }

 function css(){ if(document.getElementById('wz-fd-css'))return;
  var s=document.createElement('style'); s.id='wz-fd-css';
  s.textContent=
   "#fd-stage{position:relative;width:100%;max-width:520px;margin:0 auto;height:420px;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#2b1140,#0d0820);border:2px solid rgba(245,200,66,.35);touch-action:manipulation;user-select:none}"+
   "#fd-hero{position:absolute;bottom:6px;left:50%;margin-left:-52px;width:104px;height:104px;border-radius:50%;object-fit:cover;border:3px solid rgba(245,200,66,.75);background:#1a1a2e}"+
   "#fd-shield{position:absolute;bottom:104px;left:50%;margin-left:-26px;font-size:3rem;opacity:0;transition:opacity .12s,transform .12s;pointer-events:none;transform:scale(.6)}"+
   "#fd-shield.up{opacity:1;transform:scale(1)}"+
   ".fd-dart{position:absolute;top:-40px;font-size:2.2rem;cursor:pointer;padding:14px;margin:-14px;line-height:1;animation-name:fdfall;animation-timing-function:linear;animation-fill-mode:forwards}"+
   "@keyframes fdfall{from{transform:translateY(0)}to{transform:translateY(460px)}}"+
   ".fd-pop{animation:fdpop .3s forwards !important}"+
   "@keyframes fdpop{to{transform:scale(2.2);opacity:0}}"+
   "#fd-hud{display:flex;justify-content:space-between;align-items:center;margin:0 auto .5rem;max-width:520px}"+
   ".fd-stat{font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;line-height:1}"+
   ".fd-lab{font-size:.58rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45)}"+
   "#fd-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.2rem;background:rgba(10,8,30,.9);z-index:5}"+
   "#fd-msg h3{font-family:Bangers,cursive;font-size:2rem;color:#f5c842;margin:0 0 .3rem;letter-spacing:.03em}"+
   "#fd-msg p{color:rgba(255,255,255,.82);font-size:.88rem;margin:0 0 .9rem;line-height:1.5;max-width:330px}"+
   "#fd-msg .v{font-style:italic;color:#fff;font-size:.8rem;border-left:3px solid #f5c842;padding-left:.6rem;margin-bottom:.9rem;text-align:left;max-width:330px}"+
   ".fd-btn{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.75rem 1.5rem;font-weight:900;font-size:1rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }

 function heroSrc(){
  try{
   var a=(APP.kid&&APP.kid.avatar)||'';
   var map={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',
            w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
   return 'img/'+(map[a]||'warrior-boy.png');
  }catch(e){ return 'img/warrior-boy.png'; }
 }

 window.initDarts=function(el){
  css();
  el.innerHTML='';
  var hud=document.createElement('div'); hud.id='fd-hud';
  hud.innerHTML="<div><div class='fd-stat' id='fd-blocked'>0</div><div class='fd-lab'>Blocked</div></div>"+
                "<div style='text-align:right'><div class='fd-stat' id='fd-time'>40</div><div class='fd-lab'>Seconds</div></div>";
  el.appendChild(hud);

  var stage=document.createElement('div'); stage.id='fd-stage';
  var hero=document.createElement('img'); hero.id='fd-hero'; hero.src=heroSrc(); hero.alt='Your warrior';
  hero.onerror=function(){ hero.style.display='none'; };
  var shield=document.createElement('div'); shield.id='fd-shield'; shield.textContent='\uD83D\uDEE1\uFE0F';
  stage.appendChild(hero); stage.appendChild(shield);
  el.appendChild(stage);

  var msg=document.createElement('div'); msg.id='fd-msg';
  msg.innerHTML="<h3>Fiery Darts</h3>"+
   "<p>Darts are coming at your warrior. <b>Tap each one</b> to raise the shield and put it out.</p>"+
   "<div class='v'>\u201CTake up the shield of faith, with which you can extinguish all the flaming darts of the evil one.\u201D<br>Ephesians 6:16</div>";
  var go=document.createElement('button'); go.className='fd-btn'; go.textContent='\u2694\uFE0F Start';
  msg.appendChild(go); stage.appendChild(msg);

  var blocked=0, running=false, t=40, spawnT=null, tickT=null;

  function flash(){ shield.classList.add('up'); setTimeout(function(){ shield.classList.remove('up'); },170); }

  function spawn(){
   if(!running)return;
   var d=document.createElement('div');
   d.className='fd-dart'; d.textContent='\uD83D\uDD25';
   var w=stage.clientWidth||320;
   d.style.left=Math.max(8,Math.round(18+Math.random()*(w-70)))+'px';
   // 3.2s to 5s to cross — gentle enough for a 5-year-old to actually hit
   d.style.animationDuration=(3.2+Math.random()*1.8)+'s';
   d.addEventListener('click',function(e){
    e.stopPropagation();
    if(!running||d.dataset.dead)return;
    d.dataset.dead='1';
    d.classList.add('fd-pop'); flash();
    blocked++; document.getElementById('fd-blocked').textContent=blocked;
    setTimeout(function(){ if(d.parentNode)d.remove(); },320);
   });
   // reached the warrior without being tapped: puff out, cost nothing
   d.addEventListener('animationend',function(ev){
    if(ev.animationName!=='fdfall')return;
    if(d.dataset.dead)return;
    d.dataset.dead='1';
    d.classList.add('fd-pop');
    setTimeout(function(){ if(d.parentNode)d.remove(); },320);
   });
   stage.appendChild(d);
  }

  function stop(){
   running=false;
   clearInterval(spawnT); clearInterval(tickT);
   var all=stage.querySelectorAll('.fd-dart');
   for(var i=0;i<all.length;i++)all[i].remove();
   var pts=Math.min(20, Math.round(blocked*0.8));
   msg.innerHTML="<h3>\u2713 Shield Up!</h3>"+
    "<p>You put out <b style='color:#f5c842'>"+blocked+"</b> flaming darts.<br>That is what faith does.</p>"+
    "<div class='v'>\u201CTake up the shield of faith, with which you can extinguish all the flaming darts of the evil one.\u201D<br>Ephesians 6:16</div>";
   var again=document.createElement('button'); again.className='fd-btn'; again.textContent='Play again';
   again.onclick=function(){ initDarts(el); };
   msg.appendChild(again);
   msg.style.display='flex';
   if(pts>0 && window.APP && APP.kid && typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'darts',amount:pts})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('\u26A1 +'+res.granted+' pts!',2500);
       else if(typeof toast==='function')toast('\uD83C\uDFAE Daily game points are maxed — play for fun!',3000);
      }
     }).catch(function(){});
   }
  }

  go.onclick=function(){
   msg.style.display='none';
   running=true; blocked=0; t=40;
   document.getElementById('fd-blocked').textContent='0';
   document.getElementById('fd-time').textContent='40';
   spawn(); spawn();
   spawnT=setInterval(spawn,700);
   tickT=setInterval(function(){
    t--; document.getElementById('fd-time').textContent=t;
    if(t<=0)stop();
   },1000);
  };

  stage.addEventListener('click',function(){ if(running)flash(); });
 };


})();

} catch(__wzPatchErr){ try{console.error("[wz patch] darts",__wzPatchErr);}catch(_){} }

/* =================== app/armor-scale.js =================== */
try {
// Armor rebalance + the warrior wearing it.
// Scale: 50/150/400/900/2000/4000/8000 (was 25/100/250/500/800/1200/1800).
// Easy start so the 12 kids under 100 pts aren't staring at nothing; brutal
// finish so FULL ARMOR means something.
// GRANDFATHERED: kids.armor_earned holds what each child had under the OLD
// scale. getArmor returns the UNION, so raising the bar never takes a piece
// off a child who already earned it.
// LAYOUT NOTE: the warrior art is a head-and-shoulders PORTRAIT — there is no
// waist or feet in frame — so pieces are arranged as a ring AROUND the warrior
// rather than pinned to fake anatomy.
(function(){
 if(window.__wzArmorScale)return; window.__wzArmorScale=1;

 var TIERS=[
  {k:'belt',        n:'Belt of Truth',       p:50,   icon:'\uD83C\uDF97\uFE0F'},
  {k:'breastplate', n:'Breastplate',         p:150,  icon:'\uD83D\uDEE1\uFE0F'},
  {k:'boots',       n:'Boots of Peace',      p:400,  icon:'\uD83E\uDD7E'},
  {k:'shield',      n:'Shield of Faith',     p:900,  icon:'\u2728'},
  {k:'helmet',      n:'Helmet of Salvation', p:2000, icon:'\u26D1\uFE0F'},
  {k:'sword',       n:'Sword of the Spirit', p:4000, icon:'\u2694\uFE0F'}
 ];
 var FULL={k:'full', n:'FULL ARMOR', p:8000, icon:'\uD83C\uDFC6'};
 var ALL=TIERS.concat([FULL]);
 window.WZ_TIERS=ALL;
 var ORDER=ALL.map(function(t){return t.k;});

 // ---- single source of truth for what a kid is wearing ----
 window.getArmor=function(kid){
  if(!kid)return [];
  var pts=(kid.lifetime_points!=null?kid.lifetime_points:(kid.points||0));
  var have={};
  ALL.forEach(function(t){ if(pts>=t.p)have[t.k]=1; });
  (kid.armor_earned||[]).forEach(function(k){ have[k]=1; });   // never strip what was earned
  return ORDER.filter(function(k){ return have[k]; });
 };

 function heroSrc(kid){
  var map={w1:'warrior-boy.png',w2:'warrior-2.png',w3:'warrior-3.png',
           w4:'warrior-girl.png',w5:'warrior-5.png',w6:'warrior-6.png'};
  return 'img/'+(map[(kid&&kid.avatar)||'']||'warrior-boy.png');
 }

 function css(){ if(document.getElementById('wz-aw-css'))return;
  var s=document.createElement('style'); s.id='wz-aw-css';
  s.textContent=
   "#wz-armorman{position:relative;max-width:320px;margin:0 auto .5rem;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle at 50% 40%,#2c2c52,#100e1c);border:2px solid rgba(245,200,66,.28)}"+
   "#wz-armorman .wz-face{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;height:58%;border-radius:50%;overflow:hidden;border:3px solid rgba(245,200,66,.55);background:#1a1a2e}"+
   "#wz-armorman .wz-face img{width:100%;height:100%;object-fit:cover}"+
   ".wz-pin{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.15rem;border:2px solid;transition:all .4s}"+
   ".wz-pin.on{background:rgba(245,200,66,.95);border-color:#fff;animation:wzglow 2.6s ease-in-out infinite}"+
   ".wz-pin.off{background:rgba(12,10,28,.8);border-color:rgba(255,255,255,.18);filter:grayscale(1);opacity:.45}"+
   "@keyframes wzglow{0%,100%{box-shadow:0 0 10px 2px rgba(245,200,66,.55)}50%{box-shadow:0 0 20px 6px rgba(245,200,66,.9)}}"+
   ".wz-crown{position:absolute;top:2%;left:50%;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid}"+
   ".wz-crown.on{background:rgba(245,200,66,.95);border-color:#fff;animation:wzglow 2s ease-in-out infinite}"+
   ".wz-crown.off{background:rgba(12,10,28,.8);border-color:rgba(255,255,255,.15);filter:grayscale(1);opacity:.35}"+
   "#wz-armorcap{text-align:center;font-size:.78rem;color:rgba(255,255,255,.62);font-weight:700;margin-bottom:1rem}"+
   "#wz-armorcap b{color:#f5c842}";
  document.head.appendChild(s); }

 function paintWarrior(){
  var el=document.getElementById('tab-warrior');
  if(!el||!window.APP||!APP.kid)return;
  if(document.getElementById('wz-armorman'))return;
  css();
  var mine=getArmor(APP.kid);
  var box=document.createElement('div'); box.id='wz-armorman';

  var face=document.createElement('div'); face.className='wz-face';
  var img=document.createElement('img'); img.src=heroSrc(APP.kid); img.alt='Your warrior';
  img.onerror=function(){ face.style.display='none'; };
  face.appendChild(img); box.appendChild(face);

  // six pieces evenly around the ring — honest layout for portrait art
  TIERS.forEach(function(t,i){
   var ang=(-60 + i*(360/TIERS.length)) * Math.PI/180;
   var r=41;
   var p=document.createElement('div');
   p.className='wz-pin '+(mine.indexOf(t.k)>=0?'on':'off');
   p.style.left=(50+r*Math.cos(ang))+'%';
   p.style.top=(50+r*Math.sin(ang))+'%';
   p.innerHTML=t.icon;
   p.title=t.n+(mine.indexOf(t.k)>=0?' \u2713 earned':' \u00B7 '+t.p+' pts');
   box.appendChild(p);
  });

  var crown=document.createElement('div');
  crown.className='wz-crown '+(mine.indexOf('full')>=0?'on':'off');
  crown.innerHTML=FULL.icon;
  crown.title=FULL.n+(mine.indexOf('full')>=0?' \u2713':' \u00B7 '+FULL.p+' pts');
  box.appendChild(crown);

  var worn=mine.filter(function(k){ return k!=='full'; }).length;
  var cap=document.createElement('div'); cap.id='wz-armorcap';
  cap.innerHTML = (mine.indexOf('full')>=0)
    ? 'You are wearing the <b>FULL ARMOR OF GOD</b>. Keep walking.'
    : 'You are wearing <b>'+worn+' of 6</b> pieces of the armor of God.';
  el.insertBefore(cap, el.firstChild);
  el.insertBefore(box, el.firstChild);
 }

 window.__wzPaintWarrior=paintWarrior;
})();

} catch(__wzPatchErr){ try{console.error("[wz patch] armor-scale",__wzPatchErr);}catch(_){} }

/* =================== app/games2.js =================== */
try {
// Armor Up + Story Order + better card crops.
// Armor Up is AUDIO-FIRST: a voice names the piece, the kid taps the picture.
// It is the only game a pre-reader can complete without help. Story Order is
// picture-based and reuses the 8 animated stories already in the DB.
(function(){
 if(window.__wzGames2)return; window.__wzGames2=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 // ---- card crops: art was center/cover, which framed giant close-up faces.
 // Push the focal point up and darken the wash so art reads as mood, text stays legible.
 function bg(file){
  return "linear-gradient(rgba(10,8,30,.72),rgba(10,8,30,.9)), url('img/"+file+"') center 28%/cover no-repeat";
 }
 var ART={quiz:'story-bible-2.jpg',tf:'story-res-3.jpg',scramble:'bg-verse.jpg',
         match:'story-way-2.jpg',fitb:'story-god47-4.jpg',wheel:'story-res-5.jpg',
         darts:'story-god47-2.jpg',armorup:'story-way-4.jpg',storyorder:'story-bible-4.jpg'};
 GAMES.forEach(function(g){ if(ART[g.id])g.bg=bg(ART[g.id]); });

 var PIECES=[
  {k:'belt',n:'Belt of Truth',icon:'\uD83C\uDF97\uFE0F',v:'Stand therefore, having fastened on the belt of truth.',r:'Ephesians 6:14'},
  {k:'breastplate',n:'Breastplate of Righteousness',icon:'\uD83E\uDDBA',v:'And having put on the breastplate of righteousness.',r:'Ephesians 6:14'},
  {k:'boots',n:'Shoes of Peace',icon:'\uD83E\uDD7E',v:'As shoes for your feet, having put on the readiness given by the gospel of peace.',r:'Ephesians 6:15'},
  {k:'shield',n:'Shield of Faith',icon:'\uD83D\uDEE1\uFE0F',v:'In all circumstances take up the shield of faith.',r:'Ephesians 6:16'},
  {k:'helmet',n:'Helmet of Salvation',icon:'\u26D1\uFE0F',v:'And take the helmet of salvation.',r:'Ephesians 6:17'},
  {k:'sword',n:'Sword of the Spirit',icon:'\u2694\uFE0F',v:'And the sword of the Spirit, which is the word of God.',r:'Ephesians 6:17'}
 ];

 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
 function say(t){ try{ if(!window.speechSynthesis)return; speechSynthesis.cancel();
   var u=new SpeechSynthesisUtterance(t); u.rate=.88; u.pitch=1.05; speechSynthesis.speak(u); }catch(e){} }

 function css(){ if(document.getElementById('wz-g2-css'))return;
  var s=document.createElement('style'); s.id='wz-g2-css';
  s.textContent=
   ".g2-wrap{text-align:center}"+
   ".g2-prompt{font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;letter-spacing:.03em;margin:.4rem 0 .1rem;line-height:1.15}"+
   ".g2-sub{font-size:.74rem;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:.9rem}"+
   ".g2-say{background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.5);color:#f5c842;border-radius:20px;padding:.4rem .9rem;font-size:.78rem;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:1rem}"+
   ".g2-tiles{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap}"+
   ".g2-tile{width:96px;height:96px;border-radius:18px;background:linear-gradient(135deg,#2a2a4d,#1a1a2e);border:2px solid rgba(245,200,66,.35);font-size:2.6rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s}"+
   ".g2-tile:active{transform:scale(.94)}"+
   ".g2-tile.bad{animation:g2wob .4s}"+
   ".g2-tile.good{background:linear-gradient(135deg,#f5c842,#ffe08a);border-color:#fff;animation:g2pop .5s}"+
   "@keyframes g2wob{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px) rotate(-4deg)}75%{transform:translateX(8px) rotate(4deg)}}"+
   "@keyframes g2pop{50%{transform:scale(1.18)}}"+
   ".g2-verse{background:rgba(0,0,0,.3);border-left:3px solid #f5c842;border-radius:6px;padding:.55rem .7rem;margin:1rem auto 0;max-width:340px;text-align:left}"+
   ".g2-verse i{color:#fff;font-size:.82rem;line-height:1.45}"+
   ".g2-verse b{color:#f5c842;font-size:.7rem;display:block;margin-top:.25rem}"+
   ".g2-dots{display:flex;gap:.3rem;justify-content:center;margin-bottom:.7rem}"+
   ".g2-dot{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.18)}"+
   ".g2-dot.on{background:#f5c842}"+
   ".g2-btn{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.7rem 1.3rem;font-weight:900;font-size:.92rem;cursor:pointer;font-family:inherit;margin-top:1rem}"+
   // story order
   ".so-slots{display:flex;gap:.4rem;justify-content:center;margin-bottom:.9rem;flex-wrap:wrap}"+
   ".so-slot{width:52px;height:52px;border-radius:10px;border:2px dashed rgba(245,200,66,.45);display:flex;align-items:center;justify-content:center;font-weight:900;color:rgba(255,255,255,.35);font-size:.85rem;overflow:hidden}"+
   ".so-slot.done{border-style:solid;border-color:#7ee08a}"+
   ".so-slot img{width:100%;height:100%;object-fit:cover}"+
   ".so-panels{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}"+
   ".so-p{width:108px;height:108px;border-radius:12px;overflow:hidden;border:2px solid rgba(245,200,66,.35);cursor:pointer;position:relative}"+
   ".so-p img{width:100%;height:100%;object-fit:cover}"+
   ".so-p.bad{animation:g2wob .4s}"+
   ".so-p.used{opacity:.25;pointer-events:none}";
  document.head.appendChild(s); }

 // ================= ARMOR UP =================
 window.initArmorUp=function(el){
  css(); el.innerHTML='';
  var rounds=shuffle(PIECES), i=0, got=0;
  var wrap=document.createElement('div'); wrap.className='g2-wrap'; el.appendChild(wrap);

  function draw(){
   if(i>=rounds.length)return done();
   var t=rounds[i];
   wrap.innerHTML='';
   var dots=document.createElement('div'); dots.className='g2-dots';
   rounds.forEach(function(_,n){ var d=document.createElement('div'); d.className='g2-dot'+(n<i?' on':''); dots.appendChild(d); });
   wrap.appendChild(dots);

   var p=document.createElement('div'); p.className='g2-prompt'; p.textContent='Put on the '+t.n+'!';
   var s=document.createElement('div'); s.className='g2-sub'; s.textContent='Listen, then tap the right one';
   wrap.appendChild(p); wrap.appendChild(s);

   var sayBtn=document.createElement('button'); sayBtn.className='g2-say'; sayBtn.textContent='\uD83D\uDD0A Say it again';
   sayBtn.onclick=function(){ say('Put on the '+t.n); };
   wrap.appendChild(sayBtn);

   var wrong=shuffle(PIECES.filter(function(x){return x.k!==t.k;})).slice(0,2);
   var choices=shuffle([t].concat(wrong));
   var tiles=document.createElement('div'); tiles.className='g2-tiles';
   choices.forEach(function(c){
    var b=document.createElement('div'); b.className='g2-tile'; b.innerHTML=c.icon;
    b.title=c.n;
    b.onclick=function(){
     if(c.k!==t.k){ b.classList.add('bad'); setTimeout(function(){b.classList.remove('bad');},420); say('Try again'); return; }
     b.classList.add('good'); got++;
     say(t.v);
     var v=document.createElement('div'); v.className='g2-verse';
     v.innerHTML="<i>\u201C"+t.v+"\u201D</i><b>"+t.r+"</b>";
     wrap.appendChild(v);
     tiles.style.pointerEvents='none';
     setTimeout(function(){ i++; draw(); },2300);
    };
    tiles.appendChild(b);
   });
   wrap.appendChild(tiles);
   say('Put on the '+t.n);
  }

  function done(){
   wrap.innerHTML="<div class='g2-prompt'>\u2713 Fully Armored!</div>"+
     "<div class='g2-sub'>You put on all six pieces.</div>"+
     "<div class='g2-verse'><i>\u201CPut on the whole armor of God, that you may be able to stand.\u201D</i><b>Ephesians 6:11</b></div>";
   say('Well done, warrior. You put on the whole armor of God.');
   var again=document.createElement('button'); again.className='g2-btn'; again.textContent='Play again';
   again.onclick=function(){ initArmorUp(el); };
   wrap.appendChild(again);
   var pts=Math.min(15, got*2);
   if(pts>0&&window.APP&&APP.kid&&typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'armorup',amount:pts})
     .then(function(res){ if(res&&res.ok){ if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('\u26A1 +'+res.granted+' pts!',2500); } }).catch(function(){});
   }
  }
  draw();
 };

 // ================= STORY ORDER =================
 window.initStoryOrder=function(el){
  css(); el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";
  var grp=(window.APP&&APP.kid)?APP.kid.age_group:'812';
  sb('videos?active=eq.true&age_group=eq.'+grp+'&story_panels=not.is.null&select=id,title,story_panels')
   .then(function(rows){
    if(!rows||!rows.length){ el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>No stories yet.</p>"; return; }
    var st=rows[Math.floor(Math.random()*rows.length)];
    var panels=(st.story_panels||[]).slice(0,5);
    if(panels.length<3){ el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Story too short.</p>"; return; }
    play(el, st, panels);
   }).catch(function(){ el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Could not load.</p>"; });
 };

 function play(el, st, panels){
  el.innerHTML='';
  var wrap=document.createElement('div'); wrap.className='g2-wrap'; el.appendChild(wrap);
  var p=document.createElement('div'); p.className='g2-prompt'; p.textContent=st.title;
  var s=document.createElement('div'); s.className='g2-sub'; s.textContent='Tap the pictures in the right order';
  wrap.appendChild(p); wrap.appendChild(s);

  var slots=document.createElement('div'); slots.className='so-slots';
  panels.forEach(function(_,n){ var d=document.createElement('div'); d.className='so-slot'; d.textContent=(n+1); slots.appendChild(d); });
  wrap.appendChild(slots);

  var bank=document.createElement('div'); bank.className='so-panels'; wrap.appendChild(bank);
  var filled=0;
  shuffle(panels.map(function(pn,idx){ return {pn:pn,idx:idx}; })).forEach(function(o){
   var d=document.createElement('div'); d.className='so-p';
   var im=document.createElement('img'); im.src=o.pn.img; im.alt='Story picture';
   im.onerror=function(){ d.style.background='#2a2a4d'; };
   d.appendChild(im);
   d.onclick=function(){
    if(o.idx!==filled){ d.classList.add('bad'); setTimeout(function(){d.classList.remove('bad');},420); return; }
    var slot=slots.children[filled];
    slot.textContent=''; slot.classList.add('done');
    var mini=document.createElement('img'); mini.src=o.pn.img; slot.appendChild(mini);
    d.classList.add('used'); filled++;
    if(filled>=panels.length)finish();
   };
   bank.appendChild(d);
  });

  function finish(){
   var v=document.createElement('div'); v.className='g2-verse';
   v.innerHTML="<i>\u201C"+(panels[panels.length-1].text||'')+"\u201D</i><b>"+st.title+"</b>";
   wrap.appendChild(v);
   var again=document.createElement('button'); again.className='g2-btn'; again.textContent='Another story';
   again.onclick=function(){ initStoryOrder(el); };
   wrap.appendChild(again);
   if(window.APP&&APP.kid&&typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'storyorder',amount:15})
     .then(function(res){ if(res&&res.ok){ if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('\u26A1 +'+res.granted+' pts!',2500); } }).catch(function(){});
   }
  }
 }

 // ---- register ----
 if(!GAMES.some(function(g){return g.id==='armorup';}))
  GAMES.push({id:'armorup',title:'Armor Up',emoji:'\u26D1\uFE0F',bg:bg(ART.armorup),pts:15,sub:'Listen and tap · no reading needed'});
 if(!GAMES.some(function(g){return g.id==='storyorder';}))
  GAMES.push({id:'storyorder',title:'Story Order',emoji:'\uD83D\uDDBC\uFE0F',bg:bg(ART.storyorder),pts:15,sub:'Put the story in order · pictures'});


})();

} catch(__wzPatchErr){ try{console.error("[wz patch] games2",__wzPatchErr);}catch(_){} }

/* =================== app/worship.js =================== */
try {
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

})();

} catch(__wzPatchErr){ try{console.error("[wz patch] worship",__wzPatchErr);}catch(_){} }

/* =================== app/today.js =================== */
try {
(function(){
 if(window.__wzToday)return; window.__wzToday=1;
 if(typeof dashTab!=='function'||typeof sb!=='function')return;

 function css(){ if(document.getElementById('wz-td-css'))return;
  var s=document.createElement('style'); s.id='wz-td-css';
  s.textContent=
   ".td-h{font-family:Bangers,cursive;font-size:2rem;color:#fff;letter-spacing:.03em;line-height:1;margin-bottom:.15rem}"+
   ".td-h span{color:#f5c842}"+
   ".td-sub{font-size:.78rem;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:1rem}"+
   ".td-card{display:flex;align-items:center;gap:.85rem;background:linear-gradient(135deg,#20203a,#181830);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:.9rem 1rem;margin-bottom:.7rem;cursor:pointer;transition:transform .12s,border-color .2s;min-height:72px}"+
   ".td-card:active{transform:scale(.98)}"+
   ".td-card.done{opacity:.55;border-color:rgba(126,224,138,.4)}"+
   ".td-ic{font-size:2rem;flex-shrink:0;width:48px;text-align:center}"+
   ".td-tx{flex:1;min-width:0}"+
   ".td-t{font-weight:900;color:#fff;font-size:.98rem;line-height:1.15}"+
   ".td-d{font-size:.76rem;color:rgba(255,255,255,.55);margin-top:.15rem;line-height:1.3}"+
   ".td-go{flex-shrink:0;color:#f5c842;font-size:1.4rem;font-weight:900}"+
   ".td-card.done .td-go{color:#7ee08a}"+
   ".td-hero{background:linear-gradient(135deg,rgba(245,200,66,.18),rgba(245,200,66,.04));border-color:rgba(245,200,66,.5)}"+
   ".td-streak{display:inline-flex;align-items:center;gap:.3rem;background:rgba(255,120,40,.15);border:1px solid rgba(255,140,60,.4);color:#ffb070;border-radius:20px;padding:.2rem .6rem;font-size:.72rem;font-weight:900;margin-bottom:1rem}";
  document.head.appendChild(s); }

 function today(){ return new Date().toISOString().slice(0,10); }

 window.renderToday=function(){
  var el=document.getElementById('tab-today'); if(!el)return;
  css(); el.innerHTML='';
  var k=(window.APP&&APP.kid)||{};
  var name=k.first_name||'Warrior';

  var h=document.createElement('div');
  h.innerHTML="<div class='td-h'>Hey <span>"+name+"</span>!</div>"+
    "<div class='td-sub'>Here is your mission for today.</div>";
  el.appendChild(h);

  if((k.streak_count||0)>0){
   var st=document.createElement('div'); st.className='td-streak';
   st.textContent='\uD83D\uDD25 '+k.streak_count+' day streak \u2014 keep it going!';
   el.appendChild(st);
  }

  function card(opts){
   var c=document.createElement('div'); c.className='td-card'+(opts.hero?' td-hero':'')+(opts.done?' done':'');
   c.innerHTML="<div class='td-ic'>"+opts.icon+"</div><div class='td-tx'><div class='td-t'>"+opts.title+"</div><div class='td-d'>"+opts.desc+"</div></div><div class='td-go'>"+(opts.done?'\u2713':'\u2192')+"</div>";
   c.onclick=opts.onclick;
   el.appendChild(c);
  }

  var grp=k.age_group||'812';
  // fetch what's live so the cards reflect real content, then render in order
  Promise.all([
   sb("videos?active=eq.true&topic=eq.pastor&age_group=eq.all&order=created_at.desc&limit=1").catch(function(){return [];}),
   sb("memory_verses?active=eq.true&age_group=eq."+grp+"&limit=1").catch(function(){return [];})
  ]).then(function(res){
   var pastor=res[0]&&res[0][0], verse=res[1]&&res[1][0];

   // 1. Pastor's word — first when present. Their shepherd's voice leads the day.
   if(pastor){
    var watched=(k.completed_videos||[]).indexOf(pastor.id)>=0;
    card({hero:true,icon:'\uD83C\uDFA5',title:'A word from Pastor Billy',
      desc:watched?'You watched it. Watch again anytime.':'Your pastor has something to tell you.',
      done:watched, onclick:function(){ dashTab('watch',navFor('watch')); }});
   }

   // 2. Today's verse
   card({icon:'\uD83D\uDCDC',title:'Hide the verse in your heart',
     desc:verse?(verse.reference||'This week\u2019s verse'):'Practice this week\u2019s verse',
     onclick:function(){ dashTab('verse',navFor('verse')); }});

   // 3. Today's devo
   var devoDone=(k.completed_devos||[]).length>0;
   card({icon:'\uD83D\uDCD6',title:'Read today\u2019s devo',
     desc:'A few minutes with God. Earn points.',
     onclick:function(){ dashTab('devos',navFor('devos')); }});

   // 4. Play + learn
   card({icon:'\u2694\uFE0F',title:'Battle Arena',
     desc:'Games that teach. Put on your armor.',
     onclick:function(){ dashTab('games',navFor('games')); }});

   // gentle footer pointing to everything else
   var more=document.createElement('div');
   more.style.cssText='text-align:center;font-size:.72rem;color:rgba(255,255,255,.35);margin-top:1rem';
   more.textContent='Everything else is in the menu below.';
   el.appendChild(more);
  });
 };

 function navFor(tab){
  return document.querySelector(".tab-btn[onclick*=\"'"+tab+"'\"]")||document.querySelector(".tab-sidebar-btn[onclick*=\"'"+tab+"'\"]");
 }

 // route dashTab through 'today' and render it


 // make Today the landing view: openDash defaults to devos, so override after it
 if(typeof openDash==='function'){
  var _od=openDash;
  openDash=function(kid){
   var r=_od.apply(this,arguments);
   setTimeout(function(){ try{ dashTab('today', navFor('today')); }catch(e){} },120);
   return r;
  };
 }
})();

} catch(__wzPatchErr){ try{console.error("[wz patch] today",__wzPatchErr);}catch(_){} }


/* =================== consolidated renderGames wrapper =================== */
try {
(function(){
 if(typeof renderGames!=='function')return;
 var _rg=renderGames;
 renderGames=function(gameId){
  if(!gameId && window.APP && window.APP.kid && typeof window.__wzPoolRefresh==='function'){ try{ window.__wzPoolRefresh(); }catch(e){} }
  var r=_rg.apply(this,arguments);
  var a=document.getElementById('game-arena');
  if(a){
   if(gameId==='darts' && typeof initDarts==='function') initDarts(a);
   if(gameId==='armorup' && typeof initArmorUp==='function') initArmorUp(a);
   if(gameId==='storyorder' && typeof initStoryOrder==='function') initStoryOrder(a);
  }
  return r;
 };
})();
} catch(__wzPatchErr){ try{console.error("[wz patch] renderGames-consolidated",__wzPatchErr);}catch(_){} }

/* =================== consolidated dashTab wrapper =================== */
try {
(function(){
 if(typeof dashTab!=='function')return;
 var _dt=dashTab;
 dashTab=function(tab,btn){
  var r=_dt.apply(this,arguments);
  var w=document.getElementById('tab-worship'); if(w)w.style.display=(tab==='worship')?'block':'none';
  var t=document.getElementById('tab-today'); if(t)t.style.display=(tab==='today')?'block':'none';
  if(tab==='worship' && typeof renderWorship==='function') renderWorship();
  if(tab==='today' && typeof renderToday==='function') renderToday();
  if(tab==='warrior' && typeof window.__wzPaintWarrior==='function') setTimeout(window.__wzPaintWarrior,420);
  return r;
 };
})();
} catch(__wzPatchErr){ try{console.error("[wz patch] dashTab-consolidated",__wzPatchErr);}catch(_){} }
