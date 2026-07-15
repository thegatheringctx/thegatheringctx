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

 var _rg=renderGames;
 renderGames=function(gameId){
  var r=_rg.apply(this,arguments);
  var a=document.getElementById('game-arena');
  if(gameId==='armorup'&&a)initArmorUp(a);
  if(gameId==='storyorder'&&a)initStoryOrder(a);
  return r;
 };
})();
