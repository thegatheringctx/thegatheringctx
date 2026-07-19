function dashTab(tab,btn){
  APP.tab=tab;
  ["devos","games","warrior","store","ranks","prayer","training","watch","verse","jesus"].forEach(function(t){
    var el=document.getElementById("tab-"+t);if(el)el.style.display=t===tab?"block":"none";
  });
  // Reset both mobile tab-btns AND desktop sidebar btns
  document.querySelectorAll(".tab-btn,.tab-sidebar-btn").forEach(function(b){b.classList.remove("active");});
  if(btn)btn.classList.add("active");
  // Sync the other nav — keep both in sync
  var allBtns=document.querySelectorAll(".tab-btn,.tab-sidebar-btn");
  allBtns.forEach(function(b){
    var match=b.getAttribute("onclick")||"";
    if(match.indexOf("'"+tab+"'")>=0)b.classList.add("active");
  });
  if(tab==="devos")renderDevos();
  if(tab==="games")renderGames();
  if(tab==="warrior")renderArmor();
  if(tab==="store"){loadStore();renderStore();}
  if(tab==="ranks")loadRanks();
  if(tab==="prayer")renderPrayer();
  if(tab==="training")renderTraining();
  if(tab==="watch")renderVideos();
  if(tab==="verse")renderVerse();
  if(tab==="jesus")renderJesus();
}

// ════════════════════════════════════════════════
//  DEVOS
// ════════════════════════════════════════════════
var DEVOS=[{id:'worship-d1',day:1,title:'He Is Worthy',scripture:'Revelation 4:11',body:'Worship means telling God how great He is. In heaven, people stand around God throne and shout that He is worthy. Worthy means He is the best, the biggest, and the most wonderful of all. He made the stars, the oceans, the puppies, and you! Nobody is greater than God. When you see how big and good He is, your heart just wants to say wow and thank You. That is worship!',prayer:'God, You are worthy! You made everything, and You are the greatest of all. I love You. Amen.'},{id:'worship-d2',day:2,title:'You Are a Worshiper',scripture:'Isaiah 43:7',body:'Do you have to be a great singer to worship? No! God made you to worship Him. That means you are a worshiper. It is who you are! The Bible even says God is looking for people who will worship Him, and He is looking for you. You do not have to be big or grown up. A heart that loves God is worship. Bowing your head and saying God is greater than me is worship before you sing one word.',prayer:'God, You made me to love You. I am a worshiper! Thank You for looking for me. Amen.'},{id:'worship-d3',day:3,title:'Worship Because He Is Good',scripture:'Revelation 5:9',body:'We do not worship God only on happy days. We worship Him because He is always good. Jesus loves you so much that He died to rescue you, and He is alive again! That is true on your best day and your worst day. So do not wait until you feel like it. Tell God how great He is, and your happy heart will come running to catch up. He is always worthy!',prayer:'Jesus, You are always good, even on hard days. Thank You for rescuing me. I worship You! Amen.'},{id:'worship-d4',day:4,title:'Worship With All of You',scripture:'John 4:24',body:'Worship is not just singing. You can worship God with your whole self! You worship when you sing, when you say thank You, when you help your family, and when you obey. Jesus said to worship in spirit and in truth. That means from the inside, with a real heart that loves the real God. Your school, your words, and your kindness can all be worship. God loves it when you give Him all of you.',prayer:'Jesus, I worship You with all of me. My singing, my helping, and my heart are all for You. Amen.'},{id:'worship-d5',day:5,title:'I Will Not Watch, I Will Bow',scripture:'Hebrews 13:15',body:'Some people just watch other people worship. But God made you to join in! You do not have to sit and watch. You can sing, lift your hands, and shout that Jesus is worthy. Worship even costs something sometimes, like praising God when you are tired or sad. That is okay. Worship was never about being perfect. It is about a great big God and an open heart. So today, do not just watch. Bow. Join in!',prayer:'Jesus, I will not just watch. I will worship You with everything! You are worthy of it all. I walk with Jesus, and THAT means I win! Amen.'}];

function renderDevos(){
  var el=document.getElementById("tab-devos");if(!el)return;
  el.innerHTML="";
  var completed=APP.kid?APP.kid.completed_devos||[]:[];
  var doneCount=completed.length,total=DEVOS.length;
  var hdr=document.createElement("div");hdr.style.cssText="margin-bottom:1rem";
  hdr.innerHTML="<div style=\'font-family:Bangers,cursive;font-size:1.8rem;color:#fff;letter-spacing:.04em;line-height:1\'>Daily<br><span style=\'color:#f5c842\'>Devotionals</span></div><div style='font-size:.72rem;color:rgba(255,255,255,.4);margin-top:.25rem'>Read. Reflect. Grow. Earn points every day.</div>";
  el.appendChild(hdr);
  var progPct=Math.round((doneCount/total)*100);
  var progCard=document.createElement("div");
  progCard.style.cssText="background:linear-gradient(135deg,rgba(108,82,227,.15),rgba(64,10,96,.1));border:1.5px solid rgba(108,82,227,.25);border-radius:20px;padding:.85rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem";
  progCard.innerHTML="<div style='font-size:2.2rem;flex-shrink:0'>"+(doneCount===total?"🏆":doneCount>0?"📖":"📚")+"</div>"
    +"<div style='flex:1'><div style='display:flex;justify-content:space-between;margin-bottom:4px'>"
    +"<div style='font-size:.7rem;font-weight:900;color:rgba(255,255,255,.55)'>"+(doneCount===total?"All done — warrior!":doneCount+"/"+total+" complete")+"</div>"
    +"<div style='font-size:.7rem;font-weight:900;color:#f5c842'>"+progPct+"%</div></div>"
    +"<div style='background:rgba(255,255,255,.08);border-radius:99px;height:6px;overflow:hidden'>"
    +"<div style='height:100%;background:linear-gradient(90deg,#6C52E3,#f5c842);border-radius:99px;width:"+progPct+"%'></div></div></div>";
  el.appendChild(progCard);
  DEVOS.forEach(function(d,i){
    var done=completed.indexOf(String(d&&d.id?d.id:i))>=0;
    var card=document.createElement("div");
    card.style.cssText="border-radius:20px;margin-bottom:.65rem;overflow:hidden;cursor:pointer;transition:border-color .2s;border:1.5px solid "+(done?"rgba(0,192,122,.3)":"rgba(255,255,255,.08)");
    var topBar=document.createElement("div");topBar.style.cssText="height:4px;background:"+(done?"linear-gradient(90deg,#00C07A,#00E5A0)":"linear-gradient(90deg,rgba(108,82,227,.6),rgba(245,200,66,.4))");
    var body=document.createElement("div");body.style.cssText="background:"+(done?"rgba(0,192,122,.06)":"rgba(255,255,255,.04)")+";padding:.9rem 1rem;display:flex;align-items:center;gap:.85rem";
    var badge=document.createElement("div");badge.style.cssText="width:48px;height:48px;border-radius:14px;flex-shrink:0;background:"+(done?"rgba(0,192,122,.2)":"linear-gradient(135deg,rgba(108,82,227,.35),rgba(64,10,96,.35))")+";border:1.5px solid "+(done?"rgba(0,192,122,.4)":"rgba(108,82,227,.4)")+";display:flex;flex-direction:column;align-items:center;justify-content:center";
    badge.innerHTML="<span style='font-size:.44rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:"+(done?"#00C07A":"rgba(255,255,255,.4)")+"'>DAY</span><span style='font-size:1.3rem;font-weight:900;color:"+(done?"#00C07A":"#fff")+"'>"+d.day+"</span>";
    var info=document.createElement("div");info.style.cssText="flex:1;min-width:0";
    info.innerHTML="<div style='font-size:.88rem;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px'>"+d.title+"</div><div style='font-size:.68rem;color:rgba(255,255,255,.38)'>"+d.scripture+"</div>";
    var right=document.createElement("div");right.style.cssText="flex-shrink:0;text-align:right";
    right.innerHTML=done?"<div style='font-size:1.2rem'>✅</div><div style='font-size:.55rem;font-weight:900;color:rgba(0,192,122,.6)'>Done</div>":"<div style='font-size:1rem;color:rgba(255,255,255,.2)'>›</div><div style='font-size:.58rem;font-weight:900;color:#f5c842'>+"+cfgN("devo_pts")+" pts</div>";
    body.appendChild(badge);body.appendChild(info);body.appendChild(right);card.appendChild(topBar);card.appendChild(body);
    card.addEventListener("click",function(){openDevo(i);});
    el.appendChild(card);
  });
  var foot=document.createElement("div");foot.style.cssText="text-align:center;padding:1rem 0;font-size:.72rem;color:rgba(255,255,255,.2);line-height:1.6";foot.innerHTML="New devotionals added weekly after Sunday service.";el.appendChild(foot);
}

function openDevo(i){
  var d=DEVOS[i];
  var ov=document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:999;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s";
  var box=document.createElement("div");
  box.style.cssText="background:linear-gradient(180deg,#0f0635 0%,#07031a 100%);border-radius:28px 28px 0 0;padding:1.5rem 1.25rem 2.5rem;width:100%;max-width:480px;max-height:82vh;overflow-y:auto;border-top:2px solid rgba(108,82,227,.3);animation:slideUp .3s";
  var closeBtn=document.createElement("button");closeBtn.textContent="✕";closeBtn.style.cssText="float:right;background:rgba(255,255,255,.1);border:none;border-radius:50%;width:32px;height:32px;color:rgba(255,255,255,.6);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center";closeBtn.addEventListener("click",function(){ov.remove();});
  var hdr=document.createElement("div");hdr.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem";
  var lbl=document.createElement("div");lbl.className="eyebrow";lbl.textContent="Day "+d.day+" Devotional";
  hdr.appendChild(lbl);hdr.appendChild(closeBtn);
  var title=document.createElement("div");title.style.cssText="font-family:'Bangers',cursive;font-size:1.5rem;color:#fff;margin-bottom:.75rem;letter-spacing:.04em";title.textContent=d.title;
  var scr=document.createElement("div");scr.style.cssText="background:rgba(245,200,66,.08);border:1.5px solid rgba(245,200,66,.2);border-radius:12px;padding:.75rem 1rem;margin-bottom:.85rem;font-size:.72rem;font-weight:900;color:#f5c842;letter-spacing:.08em;text-transform:uppercase";scr.textContent="📖 "+d.scripture;
  var body=document.createElement("p");body.style.cssText="font-size:.88rem;line-height:1.75;color:rgba(255,255,255,.8);margin-bottom:.85rem";body.textContent=d.body;
  var pray=document.createElement("div");pray.style.cssText="border-left:3px solid #f5c842;padding:.65rem .9rem;background:rgba(245,200,66,.05);border-radius:0 12px 12px 0;margin-bottom:1.1rem;font-size:.83rem;font-style:italic;color:rgba(255,255,255,.7);line-height:1.6";pray.textContent="🙏 "+d.prayer;
  var btn=document.createElement("button");btn.className="btn btn-gold";btn.textContent="✅ Mark Complete — Earn 10 pts!";
  btn.addEventListener("click",function(evt){
    if(btn.disabled)return;
    btn.disabled=true;btn.textContent="Complete! +10 pts ✅";btn.style.background="rgba(0,192,122,.2)";btn.style.color="#00C07A";
    markDevo(i,evt);setTimeout(function(){ov.remove();},1200);
  });
  box.appendChild(hdr);box.appendChild(title);box.appendChild(scr);box.appendChild(body);box.appendChild(pray);box.appendChild(btn);
  ov.appendChild(box);document.body.appendChild(ov);
}

function markDevo(i,evt){
  if(!APP.kid)return;
  var completed=APP.kid.completed_devos||[];
  var _mk=String(DEVOS[i]&&DEVOS[i].id?DEVOS[i].id:i);if(completed.indexOf(_mk)>=0){toast("Already completed this one!");return;}
  var pts=cfgN("devo_pts")||10;
  // Update completed_devos array in Supabase
  completed=completed.concat([_mk]);
  sb("kids?id=eq."+APP.kid.id,{method:"PATCH",body:{completed_devos:completed},prefer:"return=representation"})
    .then(function(){
      APP.kid.completed_devos=completed;
      awardPts(pts,evt);
      toast("📖 Devotional complete! +"+pts+" pts");
    }).catch(function(){toast("📖 Could not save your progress. Try again in a moment.");});
}

// ════════════════════════════════════════════════
//  GAMES SUITE
// ════════════════════════════════════════════════
var GAMES=[
  {id:"quiz",title:"Bible Battle Quiz",emoji:"🧠",bg:"linear-gradient(135deg,#1a0540 0%,#3d1080 100%)",pts:50,sub:"20 questions · 5 pts each"},
  {id:"tf",title:"True or False",emoji:"⚡",bg:"linear-gradient(135deg,#051a40 0%,#103070 100%)",pts:20,sub:"15 lightning rounds · 2 pts each"},
  {id:"scramble",title:"Scripture Scramble",emoji:"📜",bg:"linear-gradient(135deg,#1a0a05 0%,#503010 100%)",pts:30,sub:"Rearrange the words · 30 pts"},
  {id:"match",title:"Verse Match",emoji:"🃏",bg:"linear-gradient(135deg,#0a1a05 0%,#2a5510 100%)",pts:25,sub:"Flip cards · match pairs"},
  {id:"fitb",title:"Fill the Blank",emoji:"✍️",bg:"linear-gradient(135deg,#1a1505 0%,#504010 100%)",pts:20,sub:"Complete the scripture · 3 pts each"},
  {id:"wheel",title:"Spin the Wheel",emoji:"🎡",bg:"linear-gradient(135deg,#1a0530 0%,#400a60 100%)",pts:15,sub:"Spin for a faith challenge"}
];

function renderGames(gameId){
  var el=document.getElementById("tab-games");if(!el)return;
  el.innerHTML="";
  if(!gameId){
    var hdr=document.createElement("div");hdr.className="games-header";
    var totalGPts=cfgN("quiz_pts_per_q")*10+cfgN("tf_pts_per_q")*10+cfgN("scramble_pts")+cfgN("match_pts")+cfgN("fitb_pts_per_q")*7+cfgN("wheel_pts");
    hdr.innerHTML="<div style='font-size:.58rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.3rem'>Choose Your Weapon</div>"
      +"<div style='font-family:Bangers,cursive;font-size:2.4rem;color:#fff;letter-spacing:.05em;line-height:.9;text-shadow:0 0 40px rgba(108,82,227,.5)'>BATTLE<br><span style=\'color:#f5c842\'>ARENA</span></div>"
      +"<div style='display:flex;align-items:center;justify-content:center;gap:.65rem;margin-top:.5rem'>"
      +"<div style='font-size:.68rem;color:rgba(255,255,255,.4)'>6 games</div>"
      +"<div style='width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.2)'></div>"
      +"<div style='font-size:.68rem;color:#f5c842;font-weight:900'>Up to "+totalGPts+" pts</div>"
      +"<div style='width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.2)'></div>"
      +"<div style='font-size:.68rem;color:rgba(255,255,255,.4)'>unlock armor</div></div>";
    el.appendChild(hdr);
    var grid=document.createElement("div");grid.className="games-grid";
    GAMES.forEach(function(g){
      var card=document.createElement("div");card.className="game-card";card.style.background=g.bg;
      card.innerHTML="<div class='gc-badge'>BATTLE</div><div class='gc-emoji'>"+g.emoji+"</div><div class='gc-title'>"+g.title+"</div><div class='gc-sub'>"+g.sub+"</div><div class='gc-pts'>⚡ UP TO "+g.pts+" PTS</div>";
      card.addEventListener("click",function(){renderGames(g.id);});
      grid.appendChild(card);
    });
    el.appendChild(grid);
    return;
  }
  var back=document.createElement("button");back.className="back-btn";back.textContent="← Back to Games";back.addEventListener("click",function(){renderGames();});el.appendChild(back);
  var arena=document.createElement("div");arena.id="game-arena";arena.className="anim-in";el.appendChild(arena);
  if(gameId==="quiz")initQuiz(arena);
  else if(gameId==="tf")initTF(arena);
  else if(gameId==="scramble")initScramble(arena);
  else if(gameId==="match")initMatch(arena);
  else if(gameId==="fitb")initFITB(arena);
  else if(gameId==="wheel")initWheel(arena);
}

// ── GAME 1: QUIZ ─────────────────────────────────
var QPOOL=[
  {q:"Paul wrote Philippians from where?",o:["A palace","Prison","A boat","His home"],a:1},
  {q:"The Sword of the Spirit is what?",o:["A real sword","The Word of God","A prayer","Faith"],a:1},
  {q:"I can do all things through whom?",o:["My friends","Myself","Christ","Moses"],a:2},
  {q:"Jesus was in the tomb how many days?",o:["1","2","3","7"],a:2},
  {q:"Who was swallowed by a great fish?",o:["Moses","Jonah","Daniel","Paul"],a:1},
  {q:"The Lord is my _____ (Psalm 23:1)",o:["King","Shepherd","Father","Rock"],a:1},
  {q:"Jesus chose how many disciples?",o:["7","10","12","15"],a:2},
  {q:"What armor protects your mind?",o:["Belt","Breastplate","Helmet","Sword"],a:2},
  {q:"Emmanuel means?",o:["Son of God","God with us","King of kings","Almighty"],a:1},
  {q:"Who killed Goliath?",o:["Samson","Solomon","David","Joshua"],a:2},
  {q:"The Belt of Truth goes where?",o:["Head","Waist","Feet","Hand"],a:1},
  {q:"Jesus turned water into?",o:["Juice","Wine","Milk","Oil"],a:1},
  {q:"Rejoice in the Lord _____",o:["Sometimes","On Sundays","Always","When happy"],a:2},
  {q:"Who built the ark?",o:["Moses","Noah","Abraham","David"],a:1},
  {q:"The Shield of Faith blocks what?",o:["Rain","Enemy arrows","Wind","Swords"],a:1},
  {q:"Jesus rose on which day?",o:["Friday","Saturday","Sunday","Monday"],a:2},
  {q:"Paul says pray about _____ things",o:["Big","Nothing","Everything","Few"],a:2},
  {q:"Who received the Ten Commandments?",o:["Abraham","Moses","David","Paul"],a:1},
  {q:"The peace of God _____ your heart",o:["Breaks","Guards","Opens","Changes"],a:1},
  {q:"Phil 4:13 — I can do all things through?",o:["Practice","Christ","Prayer","Hope"],a:1}
];
var _qi=0,_qs=0,_qa=false,_qpool=[];

function initQuiz(el){
  if(!APP._quizLoaded){APP._quizLoaded=true;el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";var _g=APP.kid?APP.kid.age_group:"812";sb("quiz_questions?active=eq.true&or=(age_group.eq."+_g+",age_group.is.null)&order=sort_order.asc").then(function(rows){if(rows&&rows.length){QPOOL=rows.map(function(r){return {q:r.q,o:r.o,a:r.a};});}initQuiz(el);}).catch(function(){initQuiz(el);});return;}
  _qi=0;_qs=0;_qa=true;
  _qpool=QPOOL.slice().sort(function(){return Math.random()-.5;}).slice(0,10);
  el.innerHTML="<div style='text-align:center;margin-bottom:1rem'><div style='font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;letter-spacing:.05em'>Bible Battle Quiz</div><div class='muted' style='margin:.2rem 0'>10 questions · 5 pts each · 50 pts max</div></div><div id='quiz-area'></div>";
  showQ();
}

function showQ(){
  var el=document.getElementById("quiz-area");if(!el)return;
  if(_qi>=_qpool.length){endQuiz();return;}
  var q=_qpool[_qi];
  el.innerHTML="";el.className="anim-in";
  var prog=document.createElement("div");prog.className="prog-bar";
  var fill=document.createElement("div");fill.className="prog-fill";fill.style.width=Math.round((_qi/_qpool.length)*100)+"%";
  prog.appendChild(fill);el.appendChild(prog);
  var wrap=document.createElement("div");wrap.className="q-wrap";
  var num=document.createElement("div");num.className="q-num";num.textContent="Question "+(_qi+1)+" of "+_qpool.length;
  var qtext=document.createElement("div");qtext.className="q-text";qtext.textContent=q.q;
  var opts=document.createElement("div");opts.className="q-opts";
  q.o.forEach(function(o,i){
    var btn=document.createElement("div");btn.className="q-opt";btn.textContent=o;
    btn.addEventListener("click",function(evt){
      if(!_qa)return;_qa=false;
      opts.querySelectorAll(".q-opt").forEach(function(b){b.style.pointerEvents="none";});
      if(i===q.a){btn.classList.add("correct");_qs++;toast("✅ Correct! +5 pts");}
      else{btn.classList.add("wrong");opts.querySelectorAll(".q-opt")[q.a].classList.add("correct");toast("❌ "+q.o[q.a]+" was correct!");}
      _qi++;_qa=true;setTimeout(showQ,1100);
    });
    opts.appendChild(btn);
  });
  wrap.appendChild(num);wrap.appendChild(qtext);wrap.appendChild(opts);el.appendChild(wrap);
}

function endQuiz(){
  _qa=false;var pts=_qs*cfgN("quiz_pts_per_q");
  var el=document.getElementById("quiz-area");if(!el)return;
  el.innerHTML="";el.className="anim-in";
  var wrap=document.createElement("div");
  wrap.style.cssText="text-align:center;padding:1.5rem;background:rgba(8,4,30,.95);border:2px solid rgba(108,82,227,.3);border-radius:24px";
  var icon=document.createElement("div");icon.style.cssText="font-size:3.5rem;margin-bottom:.5rem";icon.textContent=_qs>=8?"🏆":_qs>=5?"⚔️":"🛡️";
  var score=document.createElement("div");score.style.cssText="font-family:Bangers,cursive;font-size:3rem;color:#f5c842;letter-spacing:.05em;text-shadow:0 0 20px rgba(245,200,66,.5)";score.textContent=_qs+"/"+_qpool.length;
  var msg=document.createElement("div");msg.style.cssText="font-size:.85rem;color:rgba(255,255,255,.55);margin:.3rem 0";msg.textContent=_qs>=8?"Unstoppable Warrior!":_qs>=5?"Strong battle!":"Keep training the Word!";
  var ptsEl=document.createElement("div");ptsEl.style.cssText="font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;margin:.5rem 0 1.1rem";ptsEl.textContent="+"+pts+" WARRIOR POINTS!";
  var again=document.createElement("button");again.className="btn btn-gold";again.style.maxWidth="220px";again.style.margin="0 auto";again.textContent="Play Again ⚔️";
  again.addEventListener("click",function(){_qi=0;_qs=0;_qa=true;_qpool=QPOOL.slice().sort(function(){return Math.random()-.5;}).slice(0,10);showQ();});
  wrap.appendChild(icon);wrap.appendChild(score);wrap.appendChild(msg);wrap.appendChild(ptsEl);wrap.appendChild(again);el.appendChild(wrap);
  gameAward(pts,"quiz");
}

// ── GAME 2: TRUE OR FALSE ────────────────────────
var TFPOOL=[
  {s:"Jesus walked on water.",a:true},
  {s:"Moses parted the Red Sea.",a:true},
  {s:"David killed Goliath with a sword.",a:false,x:"He used a stone and sling!"},
  {s:"Paul wrote Philippians from prison.",a:true},
  {s:"The Bible has 66 books.",a:true},
  {s:"Jonah was swallowed by a whale.",a:false,x:"The Bible says a great fish!"},
  {s:"Jesus had 10 disciples.",a:false,x:"He had 12!"},
  {s:"The Belt of Truth is part of the armor of God.",a:true},
  {s:"Jesus rose from the dead on Saturday.",a:false,x:"He rose on Sunday!"},
  {s:"The Holy Spirit is part of the Trinity.",a:true},
  {s:"Abraham was 100 when Isaac was born.",a:true},
  {s:"The first book of the Bible is Genesis.",a:true},
  {s:"Jesus was born in Nazareth.",a:false,x:"He was born in Bethlehem!"},
  {s:"Peter denied Jesus three times.",a:true},
  {s:"The last book of the Bible is Revelation.",a:true}
];
var _ti=0,_ts=0,_tfActive=false,_tfPool=[];

function initTF(el){
  _ti=0;_ts=0;_tfActive=true;
  _tfPool=TFPOOL.slice().sort(function(){return Math.random()-.5;}).slice(0,10);
  showTF(el);
}

function showTF(el){
  if(_ti>=_tfPool.length){endTF(el);return;}
  var q=_tfPool[_ti];el.innerHTML="";el.className="anim-in";
  var prog=document.createElement("div");prog.className="prog-bar";
  var fill=document.createElement("div");fill.className="prog-fill";fill.style.width=Math.round((_ti/_tfPool.length)*100)+"%";prog.appendChild(fill);el.appendChild(prog);
  var num=document.createElement("div");num.style.cssText="font-size:.62rem;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.32);text-align:center;margin-bottom:.65rem;text-transform:uppercase";num.textContent="Statement "+(_ti+1)+" of "+_tfPool.length;el.appendChild(num);
  var wrap=document.createElement("div");wrap.style.cssText="background:rgba(8,4,30,.95);border:2px solid rgba(245,200,66,.12);border-radius:24px;padding:1.5rem 1.25rem";
  var stmt=document.createElement("div");stmt.className="tf-stmt";stmt.textContent=q.s;
  var btns=document.createElement("div");btns.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.75rem";
  var tBtn=document.createElement("div");tBtn.className="tf-t";tBtn.textContent="✅ TRUE";
  var fBtn=document.createElement("div");fBtn.className="tf-f";fBtn.textContent="❌ FALSE";
  function answer(v){
    if(!_tfActive)return;_tfActive=false;
    tBtn.style.pointerEvents="none";fBtn.style.pointerEvents="none";
    if(v===q.a){
      (v?tBtn:fBtn).style.background=v?"rgba(0,192,122,.4)":"rgba(255,90,54,.4)";
      _ts++;toast("Correct! ✅");
    } else {
      (v?tBtn:fBtn).style.background="rgba(255,90,54,.3)";(v?fBtn:tBtn).style.background="rgba(0,192,122,.3)";
      toast(q.x?"❌ "+q.x:"❌ Wrong!");
    }
    _ti++;_tfActive=true;setTimeout(function(){showTF(el);},1050);
  }
  tBtn.addEventListener("click",function(){answer(true);});
  fBtn.addEventListener("click",function(){answer(false);});
  btns.appendChild(tBtn);btns.appendChild(fBtn);
  wrap.appendChild(stmt);wrap.appendChild(btns);el.appendChild(wrap);
}

function endTF(el){
  var pts=_ts*cfgN("tf_pts_per_q");el.innerHTML="";el.className="anim-in";
  var wrap=document.createElement("div");wrap.style.cssText="text-align:center;padding:1.5rem;background:rgba(8,4,30,.95);border:2px solid rgba(41,174,255,.2);border-radius:24px";
  var icon=document.createElement("div");icon.style.cssText="font-size:3.5rem;margin-bottom:.5rem";icon.textContent=_ts>=8?"🏆":_ts>=5?"⚡":"🛡️";
  var score=document.createElement("div");score.style.cssText="font-family:Bangers,cursive;font-size:3rem;color:#f5c842;letter-spacing:.05em";score.textContent=_ts+"/"+_tfPool.length;
  var ptsEl=document.createElement("div");ptsEl.style.cssText="font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;margin:.5rem 0 1rem";ptsEl.textContent="+"+pts+" pts!";
  var again=document.createElement("button");again.className="btn btn-gold";again.style.maxWidth="220px";again.style.margin="0 auto";again.textContent="Play Again ⚡";
  again.addEventListener("click",function(){initTF(el);});
  wrap.appendChild(icon);wrap.appendChild(score);wrap.appendChild(ptsEl);wrap.appendChild(again);el.appendChild(wrap);
  gameAward(pts,"tf");
}

// ── GAME 3: SCRIPTURE SCRAMBLE ───────────────────
var SCRAMPOOL=[
  {ref:"Philippians 4:13",words:["I","can","do","all","things","through","him","who","strengthens","me"]},
  {ref:"Joshua 1:9",words:["Be","strong","and","courageous","Do","not","be","afraid"]},
  {ref:"Ephesians 6:11",words:["Put","on","the","whole","armor","of","God"]},
  {ref:"Psalm 23:1",words:["The","Lord","is","my","shepherd","I","shall","not","want"]},
  {ref:"John 3:16",words:["For","God","so","loved","the","world"]},
  {ref:"2 Timothy 1:7",words:["God","gave","us","a","spirit","not","of","fear"]},
  {ref:"Philippians 4:4",words:["Rejoice","in","the","Lord","always"]}
];
var _sc=null,_scSel=[],_scBank=[];

function initScramble(el){
  _sc=SCRAMPOOL[Math.floor(Math.random()*SCRAMPOOL.length)];
  _scSel=[];_scBank=_sc.words.slice().sort(function(){return Math.random()-.5;});
  renderScramble(el);
}

function renderScramble(el){
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="text-align:center;margin-bottom:.85rem";
  hdr.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;letter-spacing:.05em'>Scripture Scramble</div><div class='muted' style='margin:.2rem 0'>Tap words in the right order</div><div style='font-size:.72rem;font-weight:900;color:rgba(245,200,66,.6);letter-spacing:.1em;text-transform:uppercase;margin-top:.3rem'>"+_sc.ref+"</div>";
  el.appendChild(hdr);
  var ansBox=document.createElement("div");ansBox.className="scram-answer";
  if(!_scSel.length){var ph=document.createElement("div");ph.style.cssText="color:rgba(255,255,255,.2);font-size:.78rem;font-style:italic;padding:.2rem";ph.textContent="Tap words below to build the verse...";ansBox.appendChild(ph);}
  _scSel.forEach(function(w,i){
    var chip=document.createElement("div");chip.className="chip-ans";chip.textContent=w;
    chip.addEventListener("click",function(){_scSel.splice(i,1);_scBank.push(w);renderScramble(el);});
    ansBox.appendChild(chip);
  });
  el.appendChild(ansBox);
  var bankBox=document.createElement("div");bankBox.className="scram-bank";
  _scBank.forEach(function(w,i){
    var chip=document.createElement("div");chip.className="chip-bank";chip.textContent=w;
    chip.addEventListener("click",function(){_scSel.push(w);_scBank.splice(i,1);renderScramble(el);});
    bankBox.appendChild(chip);
  });
  el.appendChild(bankBox);
  if(!_scBank.length){
    var checkBtn=document.createElement("button");checkBtn.className="btn btn-gold";checkBtn.textContent="Check My Answer ✅";
    checkBtn.addEventListener("click",function(){
      var correct=_sc.words.join(" ").toLowerCase();
      var attempt=_scSel.join(" ").toLowerCase();
      if(attempt===correct){
        var sPts=cfgN("scramble_pts");gameAward(sPts,"scramble");
        el.innerHTML="";
        var done=document.createElement("div");done.style.cssText="text-align:center;padding:2rem;background:rgba(0,192,122,.08);border:2px solid rgba(0,192,122,.3);border-radius:24px";
        done.innerHTML="<div style='font-size:3rem;margin-bottom:.5rem'>🏆</div><div style='font-family:Bangers,cursive;font-size:2rem;color:#f5c842'>Perfect!</div><div style='color:rgba(255,255,255,.6);font-size:.85rem;margin:.5rem 0 1rem'>+30 points earned!</div>";
        var nextBtn=document.createElement("button");nextBtn.className="btn btn-gold";nextBtn.style.maxWidth="200px";nextBtn.style.margin="0 auto";nextBtn.textContent="Next Verse";
        nextBtn.addEventListener("click",function(){initScramble(el);});
        done.appendChild(nextBtn);el.appendChild(done);
      } else {
        toast("❌ Not quite — try again!");
        _scSel=[];_scBank=_sc.words.slice().sort(function(){return Math.random()-.5;});renderScramble(el);
      }
    });
    el.appendChild(checkBtn);
  }
}

// ── GAME 4: VERSE MATCH ──────────────────────────
var MPAIRS=[
  {a:"Philippians 4:13",b:"All things through Christ"},
  {a:"Joshua 1:9",b:"Strong and courageous"},
  {a:"John 3:16",b:"God so loved the world"},
  {a:"Ephesians 6:11",b:"Whole armor of God"},
  {a:"Psalm 23:1",b:"The Lord is my shepherd"},
  {a:"2 Timothy 1:7",b:"Spirit of power and love"},
  {a:"Philippians 4:4",b:"Rejoice always"},
  {a:"Romans 8:28",b:"All things work for good"}
];
var _mcards=[],_mflipped=[],_mmatched=[],_mlocked=false;

function initMatch(el){
  _mflipped=[];_mmatched=[];_mlocked=false;
  var pairs=MPAIRS.slice().sort(function(){return Math.random()-.5;}).slice(0,5);
  _mcards=[];
  pairs.forEach(function(p,i){
    _mcards.push({id:"a"+i,pair:i,text:p.a,matched:false});
    _mcards.push({id:"b"+i,pair:i,text:p.b,matched:false});
  });
  _mcards.sort(function(){return Math.random()-.5;});
  renderMatch(el);
}

function renderMatch(el){
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="text-align:center;margin-bottom:.85rem";hdr.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;letter-spacing:.05em'>Verse Match</div><div class='muted' style='margin:.2rem 0'>Tap to flip · Match the reference to its verse · +25 pts</div>";el.appendChild(hdr);
  var grid=document.createElement("div");grid.className="match-grid";
  _mcards.forEach(function(card){
    var isFlipped=_mflipped.indexOf(card.id)>=0;
    var c=document.createElement("div");c.className="match-card";
    if(card.matched){c.className="match-card match-matched";c.textContent=card.text;}
    else if(isFlipped){c.className="match-card match-face-up";c.textContent=card.text;}
    else{c.className="match-card match-face-down";}
    if(!card.matched){c.addEventListener("click",function(){flipCard(card.id,el);});}
    grid.appendChild(c);
  });
  el.appendChild(grid);
  if(_mmatched.length===5){
    var done=document.createElement("div");done.style.cssText="text-align:center;margin-top:1rem;padding:1.1rem;background:rgba(0,192,122,.08);border:1.5px solid rgba(0,192,122,.3);border-radius:18px";
    var mPts=cfgN("match_pts");done.innerHTML="<div style='font-size:2.5rem;margin-bottom:.4rem'>🏆</div><div style='font-family:Bangers,cursive;font-size:1.4rem;color:#f5c842'>All Matched! +"+mPts+" pts!</div>";
    var ag=document.createElement("button");ag.className="btn btn-gold";ag.style.cssText="max-width:180px;margin:.75rem auto 0";ag.textContent="Play Again";ag.addEventListener("click",function(){initMatch(el);});
    done.appendChild(ag);el.appendChild(done);gameAward(cfgN("match_pts")||25,"match");
  }
}

function flipCard(id,el){
  if(_mlocked)return;if(_mflipped.indexOf(id)>=0)return;
  _mflipped.push(id);renderMatch(el);
  if(_mflipped.length===2){
    _mlocked=true;
    var c1=_mcards.find(function(c){return c.id===_mflipped[0];});
    var c2=_mcards.find(function(c){return c.id===_mflipped[1];});
    if(c1&&c2&&c1.pair===c2.pair&&c1.id!==c2.id){
      c1.matched=true;c2.matched=true;_mmatched.push(c1.pair);toast("Match! ✅");
      _mflipped=[];_mlocked=false;renderMatch(el);
    } else {setTimeout(function(){_mflipped=[];_mlocked=false;renderMatch(el);},900);}
  }
}

// ── GAME 5: FILL IN THE BLANK ────────────────────
var FITBPOOL=[
  {s:"I can do all _____ through Christ who strengthens me.",a:"things",ref:"Philippians 4:13"},
  {s:"The Lord is my _____, I shall not want.",a:"shepherd",ref:"Psalm 23:1"},
  {s:"Be strong and _____, do not be afraid.",a:"courageous",ref:"Joshua 1:9"},
  {s:"Put on the whole _____ of God.",a:"armor",ref:"Ephesians 6:11"},
  {s:"God gave us a spirit not of _____ but of power.",a:"fear",ref:"2 Timothy 1:7"},
  {s:"Rejoice in the Lord _____; again I will say rejoice.",a:"always",ref:"Philippians 4:4"},
  {s:"The _____ of God guards your heart and mind.",a:"peace",ref:"Philippians 4:7"}
];
var _fi=0,_fs=0;

function initFITB(el){
  _fi=0;_fs=0;
  var pool=FITBPOOL.slice().sort(function(){return Math.random()-.5;});
  showFITB(el,pool);
}

function showFITB(el,pool){
  if(_fi>=pool.length){
    var pts=_fs*cfgN("fitb_pts_per_q");el.innerHTML="";el.className="anim-in";
    var wrap=document.createElement("div");wrap.style.cssText="text-align:center;padding:1.5rem;background:rgba(8,4,30,.95);border:2px solid rgba(245,200,66,.15);border-radius:24px";
    var icon=document.createElement("div");icon.style.cssText="font-size:3rem;margin-bottom:.5rem";icon.textContent=_fs>=5?"🏆":_fs>=3?"✍️":"📖";
    var score=document.createElement("div");score.style.cssText="font-family:Bangers,cursive;font-size:3rem;color:#f5c842;letter-spacing:.05em";score.textContent=_fs+"/"+pool.length;
    var ptsEl=document.createElement("div");ptsEl.style.cssText="font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;margin:.5rem 0 1rem";ptsEl.textContent="+"+pts+" pts!";
    var ag=document.createElement("button");ag.className="btn btn-gold";ag.style.cssText="max-width:220px;margin:0 auto";ag.textContent="Play Again ✍️";ag.addEventListener("click",function(){initFITB(el);});
    wrap.appendChild(icon);wrap.appendChild(score);wrap.appendChild(ptsEl);wrap.appendChild(ag);el.appendChild(wrap);
    gameAward(pts,"fitb");return;
  }
  var q=pool[_fi];el.innerHTML="";el.className="anim-in";
  var prog=document.createElement("div");prog.className="prog-bar";
  var fill2=document.createElement("div");fill2.className="prog-fill";fill2.style.width=Math.round((_fi/pool.length)*100)+"%";prog.appendChild(fill2);el.appendChild(prog);
  var wrap=document.createElement("div");wrap.style.cssText="background:rgba(8,4,30,.95);border:2px solid rgba(245,200,66,.12);border-radius:24px;padding:1.5rem";
  var ref=document.createElement("div");ref.style.cssText="font-size:.62rem;font-weight:900;letter-spacing:.15em;color:rgba(245,200,66,.6);text-transform:uppercase;text-align:center;margin-bottom:.65rem";ref.textContent=q.ref;
  var stmt=document.createElement("div");stmt.style.cssText="font-size:1rem;font-weight:700;color:#E8E4F0;line-height:1.6;text-align:center;margin-bottom:1rem";stmt.textContent=q.s;
  var inp=document.createElement("input");inp.type="text";inp.placeholder="Type the missing word...";inp.style.textAlign="center";inp.style.fontSize="1rem";inp.style.fontWeight="800";
  var err=document.createElement("div");err.className="error";
  var btn=document.createElement("button");btn.className="btn btn-gold";btn.style.marginTop=".65rem";btn.textContent="Submit ⚔️";
  btn.addEventListener("click",function(){
    var val=inp.value.trim().toLowerCase();
    if(!val){err.textContent="Type your answer!";return;}
    if(val===q.a.toLowerCase()){
      _fs++;err.style.color="#00C07A";err.textContent="✅ Correct!";
      btn.style.pointerEvents="none";setTimeout(function(){_fi++;showFITB(el,pool);},1100);
    } else {err.style.color="#ff8a8a";err.textContent="❌ Try again! Hint: "+q.a.length+" letters";inp.value="";inp.focus();}
  });
  inp.addEventListener("keydown",function(e){if(e.key==="Enter")btn.click();});
  wrap.appendChild(ref);wrap.appendChild(stmt);wrap.appendChild(inp);wrap.appendChild(err);wrap.appendChild(btn);el.appendChild(wrap);
  setTimeout(function(){inp.focus();},200);
}

// ── GAME 6: SPIN THE WHEEL ───────────────────────
var WCHALLENGES=[
  {e:"🙏",c:"Pray out loud right now! Thank God for 3 specific things.",pts:10},
  {e:"📖",c:"Name 3 books of the Bible! Quick!",pts:10},
  {e:"⚔️",c:"Recite Philippians 4:13 from memory!",pts:15},
  {e:"🛡️",c:"Name all 7 pieces of the Armor of God!",pts:20},
  {e:"🏆",c:"Tell someone next to you one thing God has done for you.",pts:10},
  {e:"📜",c:"Name 5 disciples of Jesus!",pts:10},
  {e:"🎯",c:"What did Paul call his religious resume compared to Christ? (Rubbish/Skubala!)",pts:15},
  {e:"🌟",c:"Shout: I walk with victory, not to it, in Jesus name! Amen!",pts:10}
];
var _wSpun=false;

function initWheel(el){
  _wSpun=false;renderWheel(el);
}

function renderWheel(el){
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="text-align:center;margin-bottom:1rem";hdr.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;letter-spacing:.05em'>Spin the Wheel</div><div class='muted' style='margin:.2rem 0'>Spin for a random faith challenge!</div>";el.appendChild(hdr);
  var wheelDiv=document.createElement("div");wheelDiv.style.cssText="width:190px;height:190px;border-radius:50%;margin:0 auto;border:4px solid rgba(245,200,66,.45);box-shadow:0 0 50px rgba(245,200,66,.25),inset 0 0 30px rgba(0,0,0,.6);background:conic-gradient(#1a0540 0 45deg,#3d1080 45deg 90deg,#051a40 90deg 135deg,#103070 135deg 180deg,#1a2a05 180deg 225deg,#3a5510 225deg 270deg,#1a0530 270deg 315deg,#400a60 315deg 360deg);transition:transform 3.5s cubic-bezier(.17,.67,.12,1);display:flex;align-items:center;justify-content:center;font-size:3.5rem;cursor:pointer";
  wheelDiv.textContent="🎡";
  var spinBtn=document.createElement("button");spinBtn.className="btn btn-gold";spinBtn.style.cssText="max-width:220px;margin:.85rem auto 0;display:block;font-size:1.3rem;letter-spacing:.1em";spinBtn.textContent="⚡ SPIN!";
  var resultDiv=document.createElement("div");resultDiv.id="wheel-result";resultDiv.style.marginTop=".75rem";
  spinBtn.addEventListener("click",function(){
    if(_wSpun)return;_wSpun=true;spinBtn.disabled=true;spinBtn.style.opacity=".4";
    var deg=1080+Math.floor(Math.random()*360);
    wheelDiv.style.transform="rotate("+deg+"deg)";
    setTimeout(function(){
      var pick=WCHALLENGES[Math.floor(Math.random()*WCHALLENGES.length)];
      resultDiv.innerHTML="";resultDiv.className="anim-in";
      var res=document.createElement("div");res.style.cssText="background:rgba(8,4,30,.95);border:2px solid rgba(245,200,66,.25);border-radius:20px;padding:1.25rem;text-align:center";
      var eEl=document.createElement("div");eEl.style.cssText="font-size:3rem;margin-bottom:.5rem";eEl.textContent=pick.e;
      var cEl=document.createElement("div");cEl.style.cssText="font-size:.9rem;font-weight:700;color:#E8E4F0;line-height:1.55;margin-bottom:.85rem";cEl.textContent=pick.c;
      var doneBtn=document.createElement("button");doneBtn.className="btn btn-gold";doneBtn.style.maxWidth="220px";doneBtn.style.margin="0 auto";doneBtn.textContent="I Did It! +"+pick.pts+" pts ✅";
      doneBtn.addEventListener("click",function(){
        gameAward(pick.pts,"wheel");
        _wSpun=false;renderWheel(el);
      });
      res.appendChild(eEl);res.appendChild(cEl);res.appendChild(doneBtn);resultDiv.appendChild(res);
    },3500);
  });
  el.appendChild(wheelDiv);el.appendChild(spinBtn);el.appendChild(resultDiv);
}

// ════════════════════════════════════════════════
//  ARMOR SCREEN
// ════════════════════════════════════════════════
var ARMOR=[
  {id:"belt",name:"Belt of Truth",ref:"Ephesians 6:14",desc:"Truth holds everything together. Without it, everything falls apart.",pts:10,e:"🟡"},
  {id:"breastplate",name:"Breastplate of Righteousness",ref:"Ephesians 6:14",desc:"Covers your heart. God's righteousness, not yours.",pts:50,e:"🛡"},
  {id:"boots",name:"Shoes of Peace",ref:"Ephesians 6:15",desc:"You carry peace everywhere you go. You are ready for anything.",pts:100,e:"👟"},
  {id:"shield",name:"Shield of Faith",ref:"Ephesians 6:16",desc:"Stops the enemy's fiery arrows. Faith is your defense.",pts:200,e:"🛡️"},
  {id:"helmet",name:"Helmet of Salvation",ref:"Ephesians 6:17",desc:"Protects your mind. You know who you are in Christ.",pts:350,e:"🪖"},
  {id:"sword",name:"Sword of the Spirit",ref:"Ephesians 6:17",desc:"The Word of God is your only offensive weapon. Use it.",pts:500,e:"⚔️"},
  {id:"full",name:"Full Armor — Complete!",ref:"Ephesians 6:13",desc:"You wear the complete armor of God. Nothing can stop you.",pts:750,e:"✨"}
];

function renderArmor(){
  var el=document.getElementById("tab-warrior");if(!el)return;
  var unlocked=APP.kid?getArmor(APP.kid):[];
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="font-family:'Bangers',cursive;font-size:1.5rem;letter-spacing:.04em;margin-bottom:.85rem";hdr.textContent="Your Armor of God";el.appendChild(hdr);
  var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.65rem";
  ARMOR.forEach(function(a){
    var on=unlocked.indexOf(a.id)>=0;
    var card=document.createElement("div");card.className="armor-card "+(on?"unlocked":"locked");
    var emj=document.createElement("span");emj.style.cssText="font-size:2.3rem;margin-bottom:.35rem;display:block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.6))"+(on?"":";filter:grayscale(1) opacity(.2)");emj.textContent=a.e;
    var nm=document.createElement("div");nm.style.cssText="font-size:.75rem;font-weight:900;color:"+(on?"#fff":"rgba(255,255,255,.3)")+";margin-bottom:.2rem;line-height:1.2";nm.textContent=a.name;
    var rf=document.createElement("div");rf.style.cssText="font-size:.6rem;color:rgba(255,255,255,.3);margin-bottom:.3rem";rf.textContent=a.ref;
    var st=document.createElement("div");st.style.cssText="font-size:.65rem;font-weight:900;color:"+(on?"#00C07A":"rgba(255,255,255,.25)");st.textContent=on?"✅ EQUIPPED":"🔒 "+a.pts+" pts";
    card.appendChild(emj);card.appendChild(nm);card.appendChild(rf);card.appendChild(st);
    if(on){card.addEventListener("click",function(){
      var ov=document.createElement("div");ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:999;display:flex;align-items:center;justify-content:center;padding:1.25rem";
      var box=document.createElement("div");box.style.cssText="background:#0f0635;border:2px solid rgba(245,200,66,.3);border-radius:24px;padding:1.5rem;max-width:340px;width:100%;text-align:center;animation:slideUp .3s";
      box.innerHTML="<div style='font-size:3rem;margin-bottom:.65rem'>"+a.e+"</div><div style='font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;margin-bottom:.3rem'>"+a.name+"</div><div style='font-size:.7rem;font-weight:900;color:rgba(245,200,66,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.85rem'>"+a.ref+"</div><p style='font-size:.88rem;line-height:1.65;color:rgba(255,255,255,.75);margin-bottom:1.1rem'>"+a.desc+"</p><button onclick='this.closest(\"div\").parentElement.parentElement.remove()' style='background:rgba(255,255,255,.1);border:none;border-radius:12px;padding:.65rem 1.5rem;color:#fff;font-weight:700;cursor:pointer;font-size:.85rem'>Close</button>";
      ov.appendChild(box);document.body.appendChild(ov);
    });}
    grid.appendChild(card);
  });
  el.appendChild(grid);
  var myPts=APP.kid?APP.kid.points||0:0;
  var nextArmor=ARMOR.find(function(a){return unlocked.indexOf(a.id)<0;});
  if(nextArmor){
    var next=document.createElement("div");next.style.cssText="margin-top:.85rem;background:rgba(245,200,66,.06);border:1.5px solid rgba(245,200,66,.2);border-radius:16px;padding:.85rem 1rem;display:flex;align-items:center;gap:.75rem";
    next.innerHTML="<div style='font-size:1.6rem'>🎯</div><div><div style='font-size:.75rem;font-weight:900;margin-bottom:2px'>Next: "+nextArmor.name+"</div><div style='font-size:.68rem;color:rgba(255,255,255,.4)'>"+(nextArmor.pts-myPts)+" more pts to unlock</div></div>";
    el.appendChild(next);
  }
}

// ════════════════════════════════════════════════
//  STORE
// ════════════════════════════════════════════════
function loadStore(){
  if(APP.storeItems.length){renderStore();return;}
  sb("store_items?select=*&active=eq.true&order=pts.asc")
    .then(function(items){APP.storeItems=items||[];renderStore();}).catch(function(){});
}

function renderStore(){
  var el=document.getElementById("tab-store");if(!el)return;
  var myPts=APP.kid?APP.kid.points||0:0;
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="margin-bottom:1rem";
  hdr.innerHTML="<div style=\'font-family:Bangers,cursive;font-size:1.8rem;color:#fff;letter-spacing:.04em;line-height:1\'>Warrior<br><span style=\'color:#f5c842\'>Store</span></div><div style='font-size:.72rem;color:rgba(255,255,255,.4);margin-top:.25rem'>Earn points. Trade them for real prizes.</div>";
  el.appendChild(hdr);
  var ptsBanner=document.createElement("div");
  ptsBanner.style.cssText="background:rgba(245,200,66,.1);border:1.5px solid rgba(245,200,66,.25);border-radius:16px;padding:.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.75rem";
  ptsBanner.innerHTML="<div style='font-size:1.6rem'>⭐</div><div><div style='font-family:Bangers,cursive;font-size:1.5rem;color:#f5c842;line-height:1'>"+myPts+" pts</div><div style='font-size:.65rem;color:rgba(255,255,255,.4);margin-top:1px'>Your balance — earn more by playing games and reading devos!</div></div>";
  el.appendChild(ptsBanner);
  if(!APP.storeItems.length){var ld=document.createElement("p");ld.className="muted";ld.textContent="Loading store...";el.appendChild(ld);return;}
  var sorted=[].concat(APP.storeItems).sort(function(a,b){var ac=myPts>=a.pts?0:1,bc=myPts>=b.pts?0:1;if(ac!==bc)return ac-bc;return a.pts-b.pts;});
  var canAffordN=sorted.filter(function(s){return myPts>=s.pts;}).length;
  var affordMsg=document.createElement("div");
  if(canAffordN>0){affordMsg.style.cssText="font-size:.62rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#00C07A;margin-bottom:.75rem";affordMsg.textContent="✅ "+canAffordN+" prize"+(canAffordN!==1?"s":"")+" you can redeem right now!";}
  else if(sorted.length){affordMsg.style.cssText="font-size:.7rem;color:rgba(255,255,255,.35);margin-bottom:.75rem";affordMsg.textContent="🎯 "+(sorted[0].pts-myPts)+" more pts — then you can redeem "+sorted[0].name+"!";}
  el.appendChild(affordMsg);
  var grid=document.createElement("div");grid.className="store-grid";
  sorted.forEach(function(item){
    var can=myPts>=item.pts;
    var card=document.createElement("div");card.style.cssText="border-radius:20px;overflow:hidden;cursor:pointer;transition:all .22s;border:1.5px solid "+(can?"rgba(0,192,122,.35)":"rgba(255,255,255,.08)")+";background:"+(can?"rgba(0,192,122,.05)":"rgba(255,255,255,.04)");
    card.addEventListener("mouseenter",function(){card.style.transform="scale(1.02)";});
    card.addEventListener("mouseleave",function(){card.style.transform="";});
    var imgWrap=document.createElement("div");imgWrap.style.cssText="background:rgba(255,255,255,.04);padding:.85rem;position:relative";
    if(can){var rdyBadge=document.createElement("div");rdyBadge.style.cssText="position:absolute;top:6px;left:6px;background:#00C07A;color:#fff;font-size:.5rem;font-weight:900;padding:2px 7px;border-radius:99px;letter-spacing:.08em";rdyBadge.textContent="CAN REDEEM";imgWrap.appendChild(rdyBadge);}
    if(item.img){var img=document.createElement("img");img.src=item.img;img.alt=item.name;img.style.cssText="width:100%;height:80px;object-fit:contain;border-radius:10px;display:block";img.onerror=function(){this.style.display="none";};imgWrap.appendChild(img);}
    else{var ph=document.createElement("div");ph.style.cssText="height:80px;display:flex;align-items:center;justify-content:center;font-size:2.5rem";ph.textContent="🎁";imgWrap.appendChild(ph);}
    var info2=document.createElement("div");info2.style.cssText="padding:.6rem .75rem .85rem";
    info2.innerHTML="<div style='font-size:.78rem;font-weight:900;color:#fff;margin-bottom:.25rem;line-height:1.25'>"+item.name+"</div>"
      +"<div style='font-family:Bangers,cursive;font-size:1.15rem;color:#f5c842;line-height:1'>"+item.pts+" pts</div>"
      +"<div style='font-size:.6rem;font-weight:900;margin-top:3px;color:"+(can?"#00C07A":"rgba(255,255,255,.3)")+"'>"+(can?"Tap to redeem!":(item.pts-myPts)+" more pts needed")+"</div>";
    card.appendChild(imgWrap);card.appendChild(info2);
    card.addEventListener("click",function(){redeemItem(item.id,item.pts,item.name,can);});
    grid.appendChild(card);
  });
  el.appendChild(grid);
}

function redeemItem(id,pts,name,canAfford){
  if(!APP.kid){toast("Log in to redeem!");return;}
  if(!canAfford){toast("Need "+(pts-(APP.kid.points||0))+" more points!");return;}
  var ov=document.createElement("div");ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:flex-end;justify-content:center";
  var box=document.createElement("div");box.style.cssText="background:linear-gradient(180deg,#0f0635,#07031a);border-radius:28px 28px 0 0;border-top:2px solid rgba(245,200,66,.25);padding:1.5rem 1.25rem 3rem;width:100%;max-width:480px;animation:slideUp .3s";
  box.innerHTML="<div style='text-align:center;margin-bottom:1.1rem'>"
    +"<div style='font-size:3rem;margin-bottom:.5rem'>🎁</div>"
    +"<div style='font-family:Bangers,cursive;font-size:1.6rem;color:#fff;letter-spacing:.04em;margin-bottom:.25rem'>Redeem This Prize?</div>"
    +"<div style='font-size:.95rem;font-weight:900;color:#f5c842;margin-bottom:.35rem'>"+name+"</div>"
    +"<div style='font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.55'>This costs <strong style=\'color:#f5c842\'>"+pts+" points</strong>.<br>A leader will bring your prize on Sunday!</div></div>"
    +"<div style='background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:.85rem 1rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center'>"
    +"<div style='font-size:.78rem;color:rgba(255,255,255,.55)'>Balance after:</div>"
    +"<div style='font-family:Bangers,cursive;font-size:1.4rem;color:#f5c842'>"+((APP.kid.points||0)-pts)+" pts</div></div>"
    +"<div style='display:grid;grid-template-columns:1fr 1fr;gap:.65rem'>"
    +"<div id='redeem-cancel' style='background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:14px;padding:.9rem;text-align:center;cursor:pointer;font-weight:900;font-size:.88rem'>Cancel</div>"
    +"<div id='redeem-confirm' style='background:linear-gradient(135deg,#f5c842,#E09000);color:#0A0318;border-radius:14px;padding:.9rem;text-align:center;cursor:pointer;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:.06em'>Yes! Redeem!</div>"
    +"</div>";
  ov.appendChild(box);document.body.appendChild(ov);
  document.getElementById("redeem-cancel").addEventListener("click",function(){ov.remove();});
  document.getElementById("redeem-confirm").addEventListener("click",function(){
    var np=(APP.kid.points||0)-pts;
    wzPost("wz-redeem",{kidId:APP.kid.id,pin:APP.kid.pin,itemId:id}).then(function(rr){
        if(!rr||!rr.ok){toast(rr&&rr.error==="insufficient_points"?"Not enough points!":"Could not redeem. Try again.");return;}
        np=rr.points;
        APP.kid.points=np;
        var dp=document.getElementById("dash-pts");if(dp)dp.textContent=np;
        var dp2=document.getElementById("dash-pts2");if(dp2)dp2.textContent=np;
        ov.remove();renderStore();
        var cel=document.createElement("div");cel.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fadeIn .3s";
        cel.innerHTML="<div style='font-size:5rem;margin-bottom:.5rem'>🎉</div>"
          +"<div style='font-family:Bangers,cursive;font-size:2.4rem;color:#f5c842;letter-spacing:.06em;text-shadow:0 0 30px rgba(245,200,66,.5)'>REDEEMED!</div>"
          +"<div style='font-size:.88rem;color:rgba(255,255,255,.7);margin-top:.5rem;text-align:center;padding:0 2rem;line-height:1.65'>A leader will bring<br><strong style=\'color:#fff\'>"+name+"</strong><br>for you on Sunday!</div>";
        document.body.appendChild(cel);setTimeout(function(){cel.remove();},2800);
        toast("🎉 "+name+" redeemed!",4000);
      }).catch(function(){toast("Error. Try again.");ov.remove();});
  });
}

// ════════════════════════════════════════════════
//  LEADERBOARD
// ════════════════════════════════════════════════
/* loadRanks: folded into the ranks (belonging) module at end of file */
/* renderRanks: folded into the ranks (belonging) module at end of file */





var MISSIONS=[
  {
    id:"m1",
    title:"Did Jesus Actually Rise From the Dead?",
    emoji:"✝️",
    bg:"linear-gradient(135deg,#1a0540,#3d1080)",
    worldSays:"Dead people stay dead. It was probably made up by his followers.",
    warriorSays:"The resurrection is the most documented event in the ancient world. Over 500 eyewitnesses saw Jesus alive after he died — and none of them ever changed their story, even when threatened with death. People do not die for things they know are lies.",
    scriptures:[
      {ref:"1 Corinthians 15:3-6 ESV",text:"Christ died for our sins in accordance with the Scriptures, that he was buried, that he was raised on the third day, and that he appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time."},
      {ref:"John 20:27 ESV",text:"Then he said to Thomas, Put your finger here, and see my hands; and put out your hand, and place it in my side. Do not disbelieve, but believe."},
      {ref:"Acts 2:32 ESV",text:"This Jesus God raised up, and of that we all are witnesses."}
    ],
    fact:"The tomb was guarded by Roman soldiers — the most disciplined military force in the world. They could not explain where the body went.",
    challenge:"Tell one person this week: the resurrection is real, and here is why.",
    memory:"I am the resurrection and the life. — John 11:25",
    quiz:{
      q:"How many eyewitnesses saw Jesus alive after his death, according to Paul?",
      opts:["About 12","More than 500","Only 3","About 50"],
      a:1,
      chalQ:"What did Paul say about people who die for something they know is a lie?",
      chalOpts:["They are very brave","People do not die for things they know are lies","They must have believed it","It has happened many times"],
      chalA:1
    }
  },
  {
    id:"m2",
    title:"Is the Bible Actually True?",
    emoji:"📖",
    bg:"linear-gradient(135deg,#051a40,#103070)",
    worldSays:"The Bible is just an old book full of myths. Men wrote it and made it all up.",
    warriorSays:"The Bible was written by 40 different authors across 1,500 years on three continents — and it tells one unified story without contradiction. Archaeological discoveries have confirmed hundreds of specific details in Scripture. No other ancient document comes close to the number of manuscripts we have.",
    scriptures:[
      {ref:"2 Timothy 3:16 ESV",text:"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness."},
      {ref:"2 Peter 1:21 ESV",text:"No prophecy was ever produced by the will of man, but men spoke from God as they were carried along by the Holy Spirit."},
      {ref:"Psalm 119:160 ESV",text:"The sum of your word is truth, and every one of your righteous rules endures forever."}
    ],
    fact:"The Dead Sea Scrolls discovered in 1947 confirmed that the book of Isaiah — written 700 years before Jesus — matches what we have today almost perfectly.",
    challenge:"Read one chapter of the Bible this week and write down one thing you notice.",
    memory:"Your word is a lamp to my feet and a light to my path. — Psalm 119:105",
    quiz:{
      q:"How many authors wrote the Bible, across how many years?",
      opts:["12 authors, 100 years","40 authors, 1500 years","4 authors, 400 years","100 authors, 50 years"],
      a:1,
      chalQ:"What did the Dead Sea Scrolls discovery confirm?",
      chalOpts:["The Bible had many errors","The Bible was written in the 1800s","The book of Isaiah has stayed almost perfectly the same for 700 years","Nothing important"],
      chalA:2
    }
  },
  {
    id:"m3",
    title:"Why Does God Let Bad Things Happen?",
    emoji:"❓",
    bg:"linear-gradient(135deg,#1a2a05,#3a5510)",
    worldSays:"If God was real and good he would stop suffering. Since there is suffering, God either does not exist or does not care.",
    warriorSays:"God is not the author of evil — sin is. God entered the suffering himself in Jesus. He knows what it costs. And he promises that nothing is wasted — every hard thing has a purpose in his hands. Suffering is not proof that God is absent. Sometimes it is proof that he is at work.",
    scriptures:[
      {ref:"Romans 8:28 ESV",text:"And we know that for those who love God all things work together for good, for those who are called according to his purpose."},
      {ref:"John 16:33 ESV",text:"In the world you will have tribulation. But take heart; I have overcome the world."},
      {ref:"2 Corinthians 1:3-4 ESV",text:"Blessed be the God and Father of our Lord Jesus Christ, the Father of mercies and God of all comfort, who comforts us in all our affliction."}
    ],
    fact:"C.S. Lewis started as an atheist and said suffering was his biggest argument against God. After becoming a Christian he called suffering the megaphone God uses to wake us up.",
    challenge:"Think of one hard thing in your life. Write down how God might be using it.",
    memory:"I have said these things to you, that in me you may have peace. — John 16:33",
    quiz:{
      q:"According to this mission, who is the author of evil?",
      opts:["God","Sin","The government","Bad luck"],
      a:1,
      chalQ:"What did C.S. Lewis call suffering after he became a Christian?",
      chalOpts:["A punishment","A mistake","The megaphone God uses to wake us up","Something to avoid"],
      chalA:2
    }
  },
  {
    id:"m4",
    title:"Isn't Christianity Just a Religion?",
    emoji:"🌍",
    bg:"linear-gradient(135deg,#1a0a05,#503010)",
    worldSays:"Christianity is just one religion among many. They all basically say the same thing.",
    warriorSays:"Every religion in the world says: do good things to reach God. Christianity alone says: God came down to reach you. That is not a small difference — it is the opposite direction. Jesus did not come to give us a new religion. He came to give us himself.",
    scriptures:[
      {ref:"John 14:6 ESV",text:"Jesus said to him, I am the way, and the truth, and the life. No one comes to the Father except through me."},
      {ref:"Ephesians 2:8-9 ESV",text:"For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast."},
      {ref:"Acts 4:12 ESV",text:"And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved."}
    ],
    fact:"Every major world religion requires human effort to reach God or escape the world. Christianity is the only one where God does the reaching — and pays the price himself.",
    challenge:"Explain to someone this week what makes Christianity different. Use the phrase: God came down.",
    memory:"I am the way, and the truth, and the life. — John 14:6",
    quiz:{
      q:"What does every other religion tell you to do, according to this mission?",
      opts:["Follow Jesus","Do good things to reach God","Pray five times a day","Read the Bible"],
      a:1,
      chalQ:"What did Jesus come to give us, according to this mission?",
      chalOpts:["A new set of rules","A better religion","Himself","A list of commands"],
      chalA:2
    }
  },
  {
    id:"m5",
    title:"Does God Actually Care About Me?",
    emoji:"❤️",
    bg:"linear-gradient(135deg,#1a0530,#400a60)",
    worldSays:"You are too small. The universe is too big. God, if he exists, does not notice you.",
    warriorSays:"God knows how many hairs are on your head right now. He knew you before you were born and called you by name. The creator of every galaxy chose to enter human history — not as a king — but as a baby in a barn. He did not do that for no one. He did it for you.",
    scriptures:[
      {ref:"Jeremiah 1:5 ESV",text:"Before I formed you in the womb I knew you, and before you were born I consecrated you."},
      {ref:"Matthew 10:30 ESV",text:"Even the hairs of your head are all numbered."},
      {ref:"Romans 5:8 ESV",text:"God shows his love for us in that while we were still sinners, Christ died for us."}
    ],
    fact:"The universe has 200 billion trillion stars. The God who made all of them also made you — and considers you worth dying for.",
    challenge:"Every morning this week say out loud: God knows my name and he is for me.",
    memory:"I have called you by name, you are mine. — Isaiah 43:1",
    quiz:{
      q:"According to Matthew 10:30, what does God know about you?",
      opts:["Your address","The number of hairs on your head","Your grades","Your future job"],
      a:1,
      chalQ:"How many stars are in the universe, according to this mission?",
      chalOpts:["1 billion","200 thousand","200 billion trillion","Too many to count"],
      chalA:2
    }
  },
  {
    id:"m6",
    title:"What Makes Jesus Different From Everyone Else?",
    emoji:"👑",
    bg:"linear-gradient(135deg,#0a1a05,#2a5510)",
    worldSays:"Jesus was a great teacher, but so were Buddha and others. Pick the one you like.",
    warriorSays:"Jesus said things no teacher ever said. He said I am the way — not I know the way. He said I am the truth — not I speak the truth. He said I am life — not I teach about life. Every other religious leader pointed to their teaching. Jesus pointed to himself.",
    scriptures:[
      {ref:"Colossians 1:15-16 ESV",text:"He is the image of the invisible God, the firstborn of all creation. For by him all things were created, in heaven and on earth."},
      {ref:"Hebrews 1:3 ESV",text:"He is the radiance of the glory of God and the exact imprint of his nature, and he upholds the universe by the word of his power."},
      {ref:"Philippians 2:9-11 ESV",text:"God has highly exalted him and bestowed on him the name that is above every name, so that at the name of Jesus every knee should bow."}
    ],
    fact:"No other founder of any religion claimed to be God himself. Jesus did — and then backed it up by rising from the dead.",
    challenge:"Look up one miracle of Jesus this week. Read the story and ask: who else could do this?",
    memory:"He is before all things, and in him all things hold together. — Colossians 1:17",
    quiz:{
      q:"What did every other religious leader point to, compared to Jesus?",
      opts:["Their miracles","Their teaching — Jesus pointed to himself","Their followers","Their country"],
      a:1,
      chalQ:"What did Jesus claim that no other religious founder ever claimed?",
      chalOpts:["To be a prophet","To know God","To be God himself","To be sinless"],
      chalA:2
    }
  },
  {
    id:"m7",
    title:"How Do I Know God Is Real?",
    emoji:"🌌",
    bg:"linear-gradient(135deg,#1a1505,#504010)",
    worldSays:"There is no proof God exists. Science explains everything. God is just something people invented.",
    warriorSays:"Everything that exists came from somewhere. Science can tell us how things work — it cannot tell us why there is something rather than nothing. The universe had a beginning. That means something outside the universe started it. And beyond the evidence — God is knowable. You can talk to him and he answers.",
    scriptures:[
      {ref:"Romans 1:20 ESV",text:"His invisible attributes, namely, his eternal power and divine nature, have been clearly perceived, ever since the creation of the world, in the things that have been made."},
      {ref:"Psalm 19:1 ESV",text:"The heavens declare the glory of God, and the sky above proclaims his handiwork."},
      {ref:"Hebrews 11:6 ESV",text:"Whoever would draw near to God must believe that he exists and that he rewards those who seek him."}
    ],
    fact:"The Big Bang — the scientific name for the beginning of the universe — means that time, space, and matter all had a starting point. Whatever caused it must be outside of time and space. That sounds a lot like God.",
    challenge:"Go outside tonight and look at the sky. Ask God to make himself real to you. Then be quiet and listen.",
    memory:"The heavens declare the glory of God. — Psalm 19:1",
    quiz:{
      q:"What does science tell us about the universe having a beginning?",
      opts:["The universe has always existed","The Big Bang means time, space, and matter had a starting point","Science proves there is no God","Nothing — science cannot tell us this"],
      a:1,
      chalQ:"What does Romans 1:20 say about knowing God exists?",
      chalOpts:["We cannot know God exists","His nature has been clearly seen through what he made","We must have faith with no evidence","Only scholars can understand this"],
      chalA:1
    }
  },
  {
    id:"m8",
    title:"Why Do Christians Believe in the Trinity?",
    emoji:"🔱",
    bg:"linear-gradient(135deg,#180444,#051a40)",
    worldSays:"The Trinity makes no sense. Three gods? Christians just made it up.",
    warriorSays:"The Trinity is not three gods. It is one God who eternally exists as Father, Son, and Holy Spirit — three persons, one being. We do not fully understand it because God is bigger than our categories. God is not a lonely singular force. He is a community of love. And he made you for that community.",
    scriptures:[
      {ref:"Matthew 3:16-17 ESV",text:"And when Jesus was baptized, he went up from the water, and behold, the heavens were opened to him, and he saw the Spirit of God descending like a dove; and behold, a voice from heaven said, This is my beloved Son, with whom I am well pleased."},
      {ref:"John 1:1 ESV",text:"In the beginning was the Word, and the Word was with God, and the Word was God."},
      {ref:"2 Corinthians 13:14 ESV",text:"The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all."}
    ],
    fact:"The word Trinity is not in the Bible but the truth of it is on almost every page. Every time all three persons appear together — Father, Son, Spirit — you see the Trinity in action.",
    challenge:"Memorize this: One God. Three Persons. Father. Son. Holy Spirit. All fully God. All one.",
    memory:"Go and make disciples, baptizing them in the name of the Father and of the Son and of the Holy Spirit. — Matthew 28:19",
    quiz:{
      q:"What does the Trinity mean — according to this mission?",
      opts:["Three separate gods","One God in three persons — Father, Son, and Holy Spirit","God changing into different forms","A committee that runs heaven"],
      a:1,
      chalQ:"In Matthew 3:16-17, how many persons of the Trinity appear at one time?",
      chalOpts:["Only one — Jesus","Two — Jesus and God","All three — Spirit descends, Son is baptized, Father speaks","None — this passage is not about the Trinity"],
      chalA:2
    }
  }
];

// ════════════════════════════════════════════════
//  WARRIOR TRAINING (APOLOGETICS)
// ════════════════════════════════════════════════
function renderTraining(){
  var el=document.getElementById("tab-training");if(!el)return;
  if(!APP._missionsLoaded){el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";APP._missionsLoaded=true;sb("training_missions?active=eq.true&order=sort_order.asc").then(function(rows){if(rows&&rows.length){MISSIONS=rows.map(function(r){return {id:r.id,title:r.title,emoji:r.emoji||"⚔️",bg:r.bg||"linear-gradient(135deg,#180444,#051a40)",worldSays:r.world_says,warriorSays:r.warrior_says,scriptures:r.scriptures||[]};});}renderTraining();}).catch(function(){renderTraining();});return;}
  el.innerHTML="";

  // Header
  var hdr=document.createElement("div");
  hdr.style.cssText="background:linear-gradient(135deg,#180444,#051a40);border-radius:24px;padding:1.25rem;margin-bottom:1rem;text-align:center;border:1.5px solid rgba(108,82,227,.3);position:relative;overflow:hidden";
  hdr.innerHTML="<div style='position:absolute;font-size:90px;opacity:.04;right:-10px;top:-10px'>⚔️</div>"
    +"<div style='position:relative;z-index:1'>"
    +"<div style='font-size:.6rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.3rem'>Ephesians 6:11</div>"
    +"<div style='font-family:Bangers,cursive;font-size:2rem;color:#fff;letter-spacing:.05em;line-height:.95;text-shadow:0 0 30px rgba(108,82,227,.5)'>WARRIOR<br><span style=\"color:#f5c842\">TRAINING</span></div>"
    +"<div style='font-size:.75rem;color:rgba(255,255,255,.45);margin-top:.4rem;line-height:1.5'>Know what you believe.<br>Know why it is true.<br>Be ready to answer anyone.</div>"
    +"</div>";
  el.appendChild(hdr);

  // Progress bar
  var completed=APP.kid?APP.kid.completed_missions||[]:[];
  var pct=Math.round((completed.length/MISSIONS.length)*100);
  var prog=document.createElement("div");
  prog.style.cssText="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:.85rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.85rem";
  prog.innerHTML="<div style='font-size:1.6rem'>🏆</div>"
    +"<div style='flex:1'>"
    +"<div style='display:flex;justify-content:space-between;font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:4px'>"
    +"<span>Training Progress</span><span style='color:#f5c842'>"+completed.length+"/"+MISSIONS.length+"</span></div>"
    +"<div style='background:rgba(255,255,255,.07);border-radius:99px;height:7px;overflow:hidden'>"
    +"<div style='height:100%;background:linear-gradient(90deg,#6C52E3,#f5c842);border-radius:99px;width:"+pct+"%;transition:width .8s cubic-bezier(.34,1.56,.64,1)'></div></div>"
    +"<div style='font-size:.62rem;color:rgba(255,255,255,.3);margin-top:3px'>"+(pct===100?"🏆 Complete warrior!":"Complete all 8 missions to become a full Warrior Apologist")+"</div>"
    +"</div>";
  el.appendChild(prog);

  // Mission cards
  MISSIONS.forEach(function(m){
    var done=completed.indexOf(m.id)>=0;
    var card=document.createElement("div");
    card.style.cssText="border-radius:20px;padding:1rem;margin-bottom:.7rem;cursor:pointer;position:relative;overflow:hidden;border:1.5px solid rgba(255,255,255,.1);transition:all .22s;background:"+m.bg;
    if(done)card.style.borderColor="rgba(0,192,122,.4)";
    card.innerHTML="<div style='position:absolute;top:10px;right:12px;font-size:2.2rem;opacity:.18'>"+m.emoji+"</div>"
      +(done?"<div style='position:absolute;top:10px;left:10px;background:rgba(0,192,122,.9);border-radius:99px;font-size:.55rem;font-weight:900;padding:2px 8px;color:#fff;letter-spacing:.08em'>COMPLETE ✅</div>"
             :"<div style='position:absolute;top:10px;left:10px;background:rgba(108,82,227,.9);border-radius:99px;font-size:.55rem;font-weight:900;padding:2px 8px;color:#fff;letter-spacing:.08em'>MISSION</div>")
      +"<div style='margin-top:1.4rem'>"
      +"<div style='font-family:Bangers,cursive;font-size:1.05rem;color:#fff;letter-spacing:.03em;line-height:1.2;margin-bottom:.25rem'>"+m.title+"</div>"
      +"<div style='font-size:.68rem;color:rgba(255,255,255,.45)'>"+m.scriptures.length+" scriptures &middot; "+(done?"Already completed":"Tap to train")+"</div>"
      +"<div style='font-size:.65rem;font-weight:900;color:#f5c842;margin-top:.3rem'>⚡ "+(done?"✅ Complete":"Answer the check question to earn pts")+"</div>"
      +"</div>";
    card.addEventListener("click",function(){openMission(m);});
    card.addEventListener("mouseenter",function(){card.style.transform="scale(1.01)";});
    card.addEventListener("mouseleave",function(){card.style.transform="";});
    el.appendChild(card);
  });
}

function openMission(m){
  var completed=APP.kid?APP.kid.completed_missions||[]:[];
  var done=completed.indexOf(m.id)>=0;
  var ov=document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:flex-end;justify-content:center;overflow:hidden";
  var box=document.createElement("div");
  box.style.cssText="background:linear-gradient(180deg,#0f0635 0%,#07031a 100%);border-radius:28px 28px 0 0;padding:1.5rem 1.25rem 3rem;width:100%;max-width:540px;max-height:92vh;overflow-y:auto;border-top:2px solid rgba(108,82,227,.3);animation:slideUp .35s";

  // Close
  var closeWrap=document.createElement("div");closeWrap.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem";
  var closeBtn=document.createElement("button");closeBtn.textContent="✕ Close";closeBtn.style.cssText="background:rgba(255,255,255,.08);border:none;border-radius:10px;padding:.4rem .85rem;color:rgba(255,255,255,.5);cursor:pointer;font-size:.78rem;font-weight:700";closeBtn.addEventListener("click",function(){ov.remove();});
  var mLabel=document.createElement("div");mLabel.style.cssText="font-size:.58rem;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.3)";mLabel.textContent="Warrior Training";
  closeWrap.appendChild(mLabel);closeWrap.appendChild(closeBtn);box.appendChild(closeWrap);

  // Title block
  var titleBlock=document.createElement("div");
  titleBlock.style.cssText="background:"+m.bg+";border-radius:20px;padding:1.25rem;margin-bottom:1.1rem;position:relative;overflow:hidden;border:1.5px solid rgba(255,255,255,.1)";
  titleBlock.innerHTML="<div style='position:absolute;right:12px;top:12px;font-size:3rem;opacity:.15'>"+m.emoji+"</div>"
    +"<div style='font-family:Bangers,cursive;font-size:1.6rem;color:#fff;letter-spacing:.04em;line-height:1.1;position:relative;z-index:1'>"+m.title+"</div>"
    +(done?"<div style='margin-top:.5rem;font-size:.75rem;font-weight:900;color:#00C07A'>✅ Mission Complete!</div>":"");
  box.appendChild(titleBlock);

  // World says / Warrior says
  var debate=document.createElement("div");debate.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.1rem";
  var ws=document.createElement("div");ws.style.cssText="background:rgba(255,90,54,.08);border:1.5px solid rgba(255,90,54,.2);border-radius:16px;padding:.85rem";
  ws.innerHTML="<div style='font-size:.58rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,90,54,.7);margin-bottom:.4rem'>The World Says</div>"
    +"<div style='font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.5;font-style:italic'>\""+m.worldSays+"\"</div>";
  var ww=document.createElement("div");ww.style.cssText="background:rgba(0,192,122,.08);border:1.5px solid rgba(0,192,122,.2);border-radius:16px;padding:.85rem";
  ww.innerHTML="<div style='font-size:.58rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(0,192,122,.7);margin-bottom:.4rem'>Warriors Know</div>"
    +"<div style='font-size:.78rem;color:rgba(255,255,255,.8);line-height:1.5'>"+m.warriorSays+"</div>";
  debate.appendChild(ws);debate.appendChild(ww);box.appendChild(debate);

  // Fact box
  var fact=document.createElement("div");fact.style.cssText="background:rgba(245,200,66,.06);border:1.5px solid rgba(245,200,66,.2);border-radius:16px;padding:.85rem 1rem;margin-bottom:1.1rem;display:flex;gap:.75rem;align-items:flex-start";
  fact.innerHTML="<div style='font-size:1.4rem;flex-shrink:0'>💡</div><div><div style='font-size:.6rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,200,66,.6);margin-bottom:.3rem'>Warrior Fact</div><div style='font-size:.82rem;color:rgba(255,255,255,.8);line-height:1.55'>"+m.fact+"</div></div>";
  box.appendChild(fact);

  // Scriptures
  var scrHdr=document.createElement("div");scrHdr.style.cssText="font-size:.6rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.6rem";scrHdr.textContent="Key Scriptures";box.appendChild(scrHdr);
  m.scriptures.forEach(function(s){
    var sc=document.createElement("div");sc.style.cssText="background:rgba(255,255,255,.04);border-left:3px solid #f5c842;border-radius:0 12px 12px 0;padding:.75rem 1rem;margin-bottom:.5rem";
    sc.innerHTML="<div style='font-size:.6rem;font-weight:900;color:#f5c842;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3rem'>"+s.ref+"</div>"
      +"<div style='font-size:.83rem;color:rgba(255,255,255,.8);line-height:1.6;font-style:italic'>\""+s.text+"\"</div>";
    box.appendChild(sc);
  });

  // Memory verse
  var mem=document.createElement("div");mem.style.cssText="background:rgba(108,82,227,.1);border:1.5px solid rgba(108,82,227,.25);border-radius:16px;padding:.85rem 1rem;margin:.75rem 0;text-align:center";
  mem.innerHTML="<div style='font-size:.58rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(108,82,227,.7);margin-bottom:.3rem'>⚡ Memory Verse</div>"
    +"<div style='font-size:.88rem;color:#fff;font-style:italic;line-height:1.55'>\""+m.memory+"\"</div>";
  box.appendChild(mem);

  // Challenge
  var chal=document.createElement("div");chal.style.cssText="background:rgba(255,107,26,.08);border:1.5px solid rgba(255,107,26,.25);border-radius:16px;padding:.85rem 1rem;margin-bottom:1rem;display:flex;gap:.75rem;align-items:flex-start";
  chal.innerHTML="<div style='font-size:1.4rem;flex-shrink:0'>🎯</div><div><div style='font-size:.6rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,107,26,.7);margin-bottom:.3rem'>Your Challenge (+15 pts)</div><div style='font-size:.85rem;color:rgba(255,255,255,.85);line-height:1.55;font-weight:700'>"+m.challenge+"</div></div>";
  box.appendChild(chal);

  // Action buttons — quiz-gated
  var btnRow=document.createElement("div");btnRow.style.cssText="display:grid;gap:.55rem";
  var chalKey=m.id+"-challenge";
  var chalDone=completed.indexOf(chalKey)>=0;

  if(!done){
    // Show quiz to unlock mission points
    var quizDiv=document.createElement("div");
    quizDiv.style.cssText="background:rgba(108,82,227,.1);border:1.5px solid rgba(108,82,227,.3);border-radius:18px;padding:1rem;margin-bottom:.35rem";
    var quizLbl=document.createElement("div");quizLbl.style.cssText="font-size:.6rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(108,82,227,.7);margin-bottom:.5rem";quizLbl.textContent="⚡ Quick Check — Prove You Read It";
    var quizQ=document.createElement("div");quizQ.style.cssText="font-size:.88rem;font-weight:700;color:#E8E4F0;line-height:1.55;margin-bottom:.75rem";quizQ.textContent=m.quiz.q;
    var quizOpts=document.createElement("div");quizOpts.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.45rem";
    var quizAnswered=false;
    m.quiz.opts.forEach(function(opt,idx){
      var ob=document.createElement("div");
      ob.style.cssText="background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12);border-radius:12px;padding:.65rem .5rem;font-size:.78rem;font-weight:700;cursor:pointer;color:#E8E4F0;text-align:center;transition:all .15s";
      ob.textContent=opt;
      ob.addEventListener("click",function(){
        if(quizAnswered)return;quizAnswered=true;
        quizOpts.querySelectorAll("div").forEach(function(b){b.style.pointerEvents="none";});
        if(idx===m.quiz.a){
          ob.style.background="rgba(0,229,160,.2)";ob.style.borderColor="#00E5A0";ob.style.color="#00E5A0";
          setTimeout(function(){
            quizDiv.style.display="none";
            completeMission(m.id,25,function(){
              done=true;
              // Show challenge section
              showChalSection();
            });
            toast("⚔️ Correct! Points earned!",2500);
          },700);
        } else {
          ob.style.background="rgba(255,90,54,.2)";ob.style.borderColor="#FF5A36";
          quizOpts.querySelectorAll("div")[m.quiz.a].style.background="rgba(0,229,160,.15)";
          quizOpts.querySelectorAll("div")[m.quiz.a].style.borderColor="#00E5A0";
          setTimeout(function(){quizAnswered=false;quizOpts.querySelectorAll("div").forEach(function(b){b.style.pointerEvents="auto";ob.style.background="rgba(255,255,255,.07)";ob.style.borderColor="rgba(255,255,255,.12)";ob.style.color="#E8E4F0";});},1200);
        }
      });
      quizOpts.appendChild(ob);
    });
    quizDiv.appendChild(quizLbl);quizDiv.appendChild(quizQ);quizDiv.appendChild(quizOpts);
    btnRow.appendChild(quizDiv);
  } else {
    var doneTag=document.createElement("div");
    doneTag.style.cssText="text-align:center;font-size:.78rem;color:rgba(0,192,122,.7);font-weight:900;padding:.4rem;background:rgba(0,192,122,.07);border-radius:12px;margin-bottom:.35rem";
    doneTag.textContent="✅ Mission complete!";
    btnRow.appendChild(doneTag);
  }

  function showChalSection(){
    if(chalDone)return;
    var chalSection=document.createElement("div");
    chalSection.style.cssText="background:rgba(255,107,26,.08);border:1.5px solid rgba(255,107,26,.25);border-radius:18px;padding:1rem;animation:slideUp .3s";
    var chalLbl=document.createElement("div");chalLbl.style.cssText="font-size:.6rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,107,26,.7);margin-bottom:.4rem";chalLbl.textContent="🎯 Challenge Check";
    var chalQ2=document.createElement("div");chalQ2.style.cssText="font-size:.88rem;font-weight:700;color:#E8E4F0;line-height:1.55;margin-bottom:.6rem";chalQ2.textContent=m.quiz.chalQ;
    var chalOpts2=document.createElement("div");chalOpts2.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.45rem";
    var chalAnswered=false;
    m.quiz.chalOpts.forEach(function(opt,idx){
      var cb=document.createElement("div");
      cb.style.cssText="background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12);border-radius:12px;padding:.65rem .5rem;font-size:.78rem;font-weight:700;cursor:pointer;color:#E8E4F0;text-align:center;transition:all .15s";
      cb.textContent=opt;
      cb.addEventListener("click",function(){
        if(chalAnswered)return;chalAnswered=true;
        chalOpts2.querySelectorAll("div").forEach(function(b){b.style.pointerEvents="none";});
        if(idx===m.quiz.chalA){
          cb.style.background="rgba(0,229,160,.2)";cb.style.borderColor="#00E5A0";cb.style.color="#00E5A0";
          setTimeout(function(){
            completeMission(chalKey,15,function(){toast("🔥 Challenge complete! Points earned!",3000);});
            chalSection.innerHTML="<div style='text-align:center;font-size:.85rem;font-weight:900;color:#00C07A;padding:.5rem'>🏆 Challenge Complete! You are a Warrior Apologist!</div>";
          },700);
        } else {
          cb.style.background="rgba(255,90,54,.2)";cb.style.borderColor="#FF5A36";
          chalOpts2.querySelectorAll("div")[m.quiz.chalA].style.background="rgba(0,229,160,.15)";
          chalOpts2.querySelectorAll("div")[m.quiz.chalA].style.borderColor="#00E5A0";
          setTimeout(function(){chalAnswered=false;chalOpts2.querySelectorAll("div").forEach(function(b){b.style.pointerEvents="auto";cb.style.background="rgba(255,255,255,.07)";cb.style.borderColor="rgba(255,255,255,.12)";cb.style.color="#E8E4F0";});},1200);
        }
      });
      chalOpts2.appendChild(cb);
    });
    chalSection.appendChild(chalLbl);chalSection.appendChild(chalQ2);chalSection.appendChild(chalOpts2);
    btnRow.appendChild(chalSection);
  }

  // If mission done but challenge not — show challenge section immediately
  if(done&&!chalDone)showChalSection();
  if(done&&chalDone){
    var fullDone=document.createElement("div");
    fullDone.style.cssText="text-align:center;font-size:.75rem;color:#f5c842;font-weight:900;padding:.5rem;background:rgba(245,200,66,.07);border-radius:12px";
    fullDone.textContent="🏆 Mission + Challenge both complete! Full Warrior!";
    btnRow.appendChild(fullDone);
  }

  box.appendChild(btnRow);
  ov.appendChild(box);
  ov.addEventListener("click",function(e){if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
}

function trainingPtsThisWeek(cb){sb("transactions?kid_id=eq."+APP.kid.id+"&category=eq.training&created_at=gte."+videoWeekStart()+"&select=points").then(function(rows){var t=0;(rows||[]).forEach(function(x){t+=(x.points||0);});cb(t);}).catch(function(){cb(0);});}
function completeMission(key,pts,cb){
  if(!APP.kid){toast("Log in to save progress!");return;}
  var missions=APP.kid.completed_missions||[];
  if(missions.indexOf(key)>=0){toast("Already completed!");return;}
  var cap=(typeof cfgN==="function"?cfgN("training_weekly_max"):0)||50;
  trainingPtsThisWeek(function(used){
    if(used>=cap){toast("⚔️ Training points max for this week ("+cap+")! New missions and points next week.",4500);return;}
    var grant=Math.min(pts,cap-used);
    var nm=missions.concat([key]);
    sb("kids?id=eq."+APP.kid.id,{method:"PATCH",body:{completed_missions:nm},prefer:"return=representation"})
      .then(function(){
        APP.kid.completed_missions=nm;
        awardPts(grant,null,"training");
        if(cb)cb();
        renderTraining();
      }).catch(function(){toast("Could not save. Try again.");});
  });
}

// ════════════════════════════════════════════════
//  KID ANNOUNCEMENTS
// ════════════════════════════════════════════════
function loadKidAnnouncements(){
  sb("announcements?select=*&active=eq.true&order=created_at.desc&limit=3")
    .then(function(rows){
      if(!rows||!rows.length)return;
      var typeIcons={info:"📢",event:"📅",challenge:"⚔️",praise:"🏆"};
      // Show each as a dismissable banner on the hero area
      var container=document.getElementById("dash-announcements");
      if(!container){
        container=document.createElement("div");container.id="dash-announcements";container.style.cssText="margin-bottom:.75rem";
        var heroCard=document.querySelector(".hero-card");
        if(heroCard&&heroCard.parentNode)heroCard.parentNode.insertBefore(container,heroCard);
      }
      container.innerHTML="";
      rows.forEach(function(ann){
        var icon=typeIcons[ann.type]||"📢";
        var card=document.createElement("div");
        card.style.cssText="background:linear-gradient(135deg,rgba(108,82,227,.15),rgba(64,10,96,.1));border:1.5px solid rgba(108,82,227,.3);border-radius:18px;padding:.85rem 1rem;margin-bottom:.5rem;position:relative;animation:slideUp .35s";
        card.innerHTML="<button onclick='this.parentElement.remove()' style='position:absolute;top:8px;right:8px;background:rgba(255,255,255,.1);border:none;border-radius:50%;width:22px;height:22px;color:rgba(255,255,255,.5);cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center'>✕</button>"
          +"<div style='font-size:.6rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(108,82,227,.7);margin-bottom:.2rem'>"+icon+" Announcement</div>"
          +"<div style='font-weight:900;font-size:.88rem;color:#fff;margin-bottom:.2rem'>"+ann.title+"</div>"
          +"<div style='font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.5'>"+ann.body+"</div>";
        container.appendChild(card);
      });
    }).catch(function(){});
}

// ════════════════════════════════════════════════
//  PRAYER WALL
// ════════════════════════════════════════════════
function renderPrayer(){
  var el=document.getElementById("tab-prayer");if(!el)return;
  el.innerHTML="";
  var hdr=document.createElement("div");hdr.style.cssText="font-family:'Bangers',cursive;font-size:1.5rem;letter-spacing:.04em;margin-bottom:.85rem";hdr.textContent="Prayer Wall";el.appendChild(hdr);
  // Submit form
  var form=document.createElement("div");form.style.cssText="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1rem;margin-bottom:1rem";
  var inp=document.createElement("input");inp.type="text";inp.placeholder="Share a prayer request...";inp.id="prayer-inp";inp.style.marginBottom=".5rem";
  var submitBtn=document.createElement("button");submitBtn.className="btn btn-gold";submitBtn.style.cssText="font-size:.9rem;padding:.7rem";submitBtn.textContent="🙏 Submit Prayer";
  submitBtn.addEventListener("click",function(){
    var txt=(inp.value||"").trim();if(!txt){toast("Type your prayer request first!");return;}
    if(!APP.kid){toast("Log in to submit a prayer!");return;}
    sb("prayer_wall",{method:"POST",body:{text:txt,name:APP.kid.first_name,kid_id:APP.kid.id,approved:true,prayers:0},prefer:"return=representation"})
      .then(function(){inp.value="";toast("🙏 Prayer submitted!");renderPrayer();})
      .catch(function(){toast("Error. Try again.");});
  });
  form.appendChild(inp);form.appendChild(submitBtn);el.appendChild(form);
  // Load prayers
  var listEl=document.createElement("div");listEl.id="prayer-list";listEl.innerHTML="<p class='muted'>Loading prayers...</p>";el.appendChild(listEl);
  sb("prayer_wall?select=*&approved=eq.true&order=created_at.desc&limit=30")
    .then(function(rows){
      listEl.innerHTML="";
      if(!rows.length){listEl.innerHTML="<p class='muted'>No prayers yet. Be the first!</p>";return;}
      rows.forEach(function(p){
        var card=document.createElement("div");card.style.cssText="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.85rem 1rem;margin-bottom:.5rem";
        var txt=document.createElement("div");txt.style.cssText="font-size:.88rem;color:rgba(255,255,255,.85);line-height:1.55;margin-bottom:.4rem";txt.textContent=p.text;
        var meta=document.createElement("div");meta.style.cssText="font-size:.65rem;color:rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center";
        var nameEl=document.createElement("span");nameEl.textContent="🙏 "+p.name;
        var prayBtn=document.createElement("button");prayBtn.style.cssText="background:rgba(245,200,66,.12);border:1px solid rgba(245,200,66,.25);border-radius:8px;padding:2px 10px;color:#f5c842;font-size:.65rem;font-weight:900;cursor:pointer";prayBtn.textContent="Prayed ("+p.prayers+")";
        prayBtn.addEventListener("click",function(){
          sb("prayer_wall?id=eq."+p.id,{method:"PATCH",body:{prayers:(p.prayers||0)+1},prefer:"return=representation"})
            .then(function(){p.prayers=(p.prayers||0)+1;prayBtn.textContent="Prayed ("+p.prayers+")";toast("🙏 Praying with you!");}).catch(function(){});
        });
        meta.appendChild(nameEl);meta.appendChild(prayBtn);
        card.appendChild(txt);card.appendChild(meta);listEl.appendChild(card);
      });
    }).catch(function(){listEl.innerHTML="<p class='muted'>Could not load prayers.</p>";});
}


// ════════════════════════════════════════════════
//  SIGNUP
// ════════════════════════════════════════════════
function doSignup(){
  var first=(document.getElementById("su-first").value||"").trim();
  var last=(document.getElementById("su-last").value||"").trim();
  var age=parseInt(document.getElementById("su-age").value||"0");
  var parent=(document.getElementById("su-parent").value||"").trim();
  var pin=(document.getElementById("su-pin").value||"").trim();
  var err=document.getElementById("su-err");err.textContent="";
  if(!first||!last){err.textContent="Enter first and last name.";return;}
  if(!age||age<4||age>18){err.textContent="Enter a valid age (4-18).";return;}
  var pin2=(document.getElementById("su-pin2").value||"").trim();
  if(pin.length!==4||isNaN(pin)){err.textContent="PIN must be exactly 4 digits.";return;}
  if(pin!==pin2){err.textContent="PINs do not match! Try again.";return;}
  err.textContent="Creating account...";
  var id="KGZ-"+Math.floor(1000+Math.random()*9000);
  sb("kids",{method:"POST",body:{id:id,first_name:first,last_name:last,age:age,age_group:age<=7?"47":"812",pin:pin,parent_name:parent,points:0,joined_at:Date.now(),avatar:"warrior"},prefer:"return=representation"})
    .then(function(rows){
      APP.kid=Array.isArray(rows)?rows[0]:rows;err.textContent="";
      ["su-first","su-last","su-age","su-parent","su-pin"].forEach(function(fid){var f=document.getElementById(fid);if(f)f.value="";});
      openDash(APP.kid);toast("⚔️ Welcome, "+first+"! You are a warrior!",3500);
    }).catch(function(e){err.textContent="Error: "+(e.message||"try again");});
}

// ════════════════════════════════════════════════
//  PARENT LOGIN
// ════════════════════════════════════════════════
function doParentLogin(){
  var pin=(document.getElementById("pl-pin").value||"").trim();
  var err=document.getElementById("pl-err");
  if(!pin){err.textContent="Enter your PIN.";return;}
  err.textContent="Checking...";
  sb("kids?select=*&pin=eq."+pin)
    .then(function(rows){
      err.textContent="";document.getElementById("pl-pin").value="";
      if(!rows||!rows.length){err.textContent="No kids found with that PIN.";return;}
      if(rows.length===1){APP.kid=rows[0];openDash(rows[0]);toast("Welcome! Showing "+rows[0].first_name,3000);return;}
      // Multiple kids — show picker
      err.style.color="#f5c842";err.textContent="Pick your warrior:";
      var picker=document.getElementById("pl-picker");
      if(!picker){picker=document.createElement("div");picker.id="pl-picker";picker.style.cssText="margin-top:.65rem;display:flex;flex-direction:column;gap:.5rem";
      document.getElementById("pl-pin").parentNode.appendChild(picker);}
      picker.innerHTML="";
      rows.forEach(function(k){
        var btn=document.createElement("div");
        btn.style.cssText="background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:14px;padding:.85rem 1rem;cursor:pointer;font-weight:900;font-size:.9rem;transition:all .2s;text-align:center";
        btn.textContent="⚔️ "+k.first_name+" "+k.last_name+" ("+k.points+" pts)";
        btn.addEventListener("click",function(){APP.kid=k;openDash(k);toast("Welcome, "+k.first_name+"!",3000);});
        picker.appendChild(btn);
      });
    }).catch(function(){err.textContent="Error. Try again.";});
}

// ════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════
// ════ ADMIN STATE ════
var ADM={kids:[],orders:[],selKid:null};

function doAdminLogin(){
  var pw=document.getElementById("al-pw").value;
  var err=document.getElementById("al-err");
  if(pw!=="gathering"){err.textContent="Incorrect password.";return;}
  err.textContent="Loading...";
  Promise.all([
    sb("kids?select=*&order=points.desc"),
    sb("orders?select=*&order=created_at.desc"),
    sb("store_items?select=*&order=pts.asc"),
    sb("app_config?select=key,value")
  ]).then(function(results){
    ADM.kids=results[0]||[];
    ADM.orders=results[1]||[];
    APP.storeItems=results[2]||[];
    // Load live config so settings tab shows current values
    var cfgRows=results[3]||[];
    cfgRows.forEach(function(r){CFG[r.key]=r.value;});
    err.textContent="";
    show("p-admin");
    admRefreshStats();
    admRenderKids();
    admRenderOrders();
    admRenderStore();
    // Start on overview tab
    adminTab("overview", document.querySelector(".admin-tab"));
  }).catch(function(e){err.textContent="Error: "+(e.message||"try again");});
}



function admRefreshStats(){
  var totalPts=ADM.kids.reduce(function(s,k){return s+(k.points||0);},0);
  var pendOrders=ADM.orders.filter(function(o){return o.status==="pending";}).length;
  var el;
  el=document.getElementById("adm-stat-kids");if(el)el.textContent=ADM.kids.length;
  el=document.getElementById("adm-stat-pts");if(el)el.textContent=totalPts.toLocaleString();
  el=document.getElementById("adm-stat-orders");if(el)el.textContent=pendOrders+(pendOrders>0?" ⚠️":"");
  el=document.getElementById("adm-stat-items");if(el)el.textContent=APP.storeItems.length;
  var ci=document.getElementById("adm-stat-checkin");
  var ciStat=document.getElementById("adm-checkin-stat");
  var on=CFG.checkin_enabled==="true";
  if(ci)ci.textContent=on?"🟢 LIVE":"⚪ OFF";
  if(ciStat)ciStat.style.borderColor=on?"rgba(0,192,122,.4)":"rgba(255,255,255,.1)";
}

function admSearchKids(){
  var q=(document.getElementById("adm-search").value||"").trim().toUpperCase();
  var filtered=ADM.kids.filter(function(k){
    return !q||(k.first_name+" "+k.last_name).toUpperCase().includes(q)||k.pin.includes(q);
  });
  admRenderKidsList(filtered);
}

function admRenderKids(){admRenderKidsList(ADM.kids);}

function admRenderKidsList(kids){
  var el=document.getElementById("adm-kids-list");if(!el)return;
  el.innerHTML="";
  kids.forEach(function(k,i){
    var row=document.createElement("div");row.className="kid-row-adm";
    var medals=["🥇","🥈","🥉"];
    var rank=ADM.kids.indexOf(k);
    var medal=rank<3?medals[rank]:"";
    var armor=getArmor(k);
    row.innerHTML="<div style='font-size:1rem;width:26px;text-align:center;flex-shrink:0'>"+medal+"</div>"
      +"<div style='flex:1'>"
        +"<div style='font-weight:900;font-size:.85rem'>"+k.first_name+" "+k.last_name+"</div>"
        +"<div style='font-size:.62rem;color:rgba(255,255,255,.35);margin-top:1px'>PIN: "+k.pin+" &middot; Age: "+(k.age||"?")+" &middot; "+armor.length+"/7 armor</div>"
      +"</div>"
      +"<div style='text-align:right;flex-shrink:0'>"
        +"<div style='font-family:Bangers,cursive;font-size:1.1rem;color:#f5c842'>"+k.points+" pts</div>"
        +"<div style='font-size:.6rem;color:rgba(255,255,255,.3)'>"+(k.age_group==="47"?"Ages 4-7":"Ages 8-12")+"</div>"
      +"</div>";
    row.addEventListener("click",function(){showKidDetail(k);});
    var aBtn=document.createElement("button");
    aBtn.style.cssText="background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.3);border-radius:8px;padding:.3rem .6rem;color:#f5c842;font-size:.62rem;font-weight:900;cursor:pointer;flex-shrink:0;margin-left:.4rem";
    aBtn.textContent="+pts";
    aBtn.addEventListener("click",function(e){
      e.stopPropagation();
      ADM.selKid=k;
      document.getElementById("award-sel-name").textContent=k.first_name+" "+k.last_name;
      document.getElementById("award-sel-pts").textContent=k.points+" pts currently";
      document.getElementById("award-selected").style.display="block";
      adminTab("award",document.querySelectorAll(".admin-tab")[1]);
    });
    var editBtn=document.createElement("button");
    editBtn.style.cssText="background:rgba(108,82,227,.15);border:1px solid rgba(108,82,227,.3);border-radius:8px;padding:.3rem .55rem;color:#9B7EE8;font-size:.6rem;font-weight:900;cursor:pointer;flex-shrink:0;margin-left:.25rem";
    editBtn.textContent="✎";
    editBtn.addEventListener("click",function(e){e.stopPropagation();editKid(k);});
    var resetBtn=document.createElement("button");
    resetBtn.style.cssText="background:rgba(255,200,0,.1);border:1px solid rgba(255,200,0,.25);border-radius:8px;padding:.3rem .55rem;color:#ffc800;font-size:.6rem;font-weight:900;cursor:pointer;flex-shrink:0;margin-left:.25rem";
    resetBtn.textContent="0";
    resetBtn.title="Reset points to 0";
    resetBtn.addEventListener("click",function(e){e.stopPropagation();resetKidPoints(k);});
    var delBtn2=document.createElement("button");
    delBtn2.style.cssText="background:rgba(255,90,54,.12);border:1px solid rgba(255,90,54,.25);border-radius:8px;padding:.3rem .55rem;color:#FF5A36;font-size:.6rem;font-weight:900;cursor:pointer;flex-shrink:0;margin-left:.25rem";
    delBtn2.textContent="✕";
    delBtn2.addEventListener("click",function(e){e.stopPropagation();deleteKid(k);});
    row.appendChild(aBtn);row.appendChild(editBtn);row.appendChild(resetBtn);row.appendChild(delBtn2);
    el.appendChild(row);
  });
}

function admAwardSearch(){
  var q=(document.getElementById("award-search").value||"").trim().toUpperCase();
  var res=document.getElementById("award-results");
  if(!q||q.length<2){res.innerHTML="";return;}
  var matches=ADM.kids.filter(function(k){return (k.first_name+" "+k.last_name).toUpperCase().includes(q);}).slice(0,5);
  res.innerHTML="";
  matches.forEach(function(k){
    var hit=document.createElement("div");hit.className="search-hit";
    hit.innerHTML="<span>"+k.first_name+" "+k.last_name+"</span><span style='color:rgba(255,255,255,.4);font-size:.72rem'>"+k.points+" pts</span>";
    hit.addEventListener("click",function(){
      ADM.selKid=k;
      document.getElementById("award-search").value="";
      res.innerHTML="";
      document.getElementById("award-sel-name").textContent=k.first_name+" "+k.last_name;
      document.getElementById("award-sel-pts").textContent=k.points+" pts currently";
      document.getElementById("award-selected").style.display="block";
    });
    res.appendChild(hit);
  });
}

function doAwardPts(){
  var err=document.getElementById("award-err");err.textContent="";
  if(!ADM.selKid){err.textContent="Search for and select a warrior first.";return;}
  var pts=parseInt(document.getElementById("award-pts").value||"0");
  if(!pts||pts<1){err.textContent="Enter a valid point amount.";return;}
  var cat=document.getElementById("award-cat").value;
  var note=(document.getElementById("award-note").value||"").trim();
  var np=(ADM.selKid.points||0)+pts;
  sb("kids?id=eq."+ADM.selKid.id,{method:"PATCH",body:{points:np},prefer:"return=representation"})
    .then(function(){
      ADM.selKid.points=np;
      var idx=ADM.kids.findIndex(function(k){return k.id===ADM.selKid.id;});
      if(idx>=0)ADM.kids[idx].points=np;
      // Log transaction
      sb("transactions",{method:"POST",body:{kid_id:ADM.selKid.id,points:pts,category:cat,note:note,assigned_by:"admin",created_at:Date.now()},prefer:"return=representation"}).catch(function(){});
      document.getElementById("award-pts").value="";
      document.getElementById("award-note").value="";
      document.getElementById("award-sel-pts").textContent=np+" pts";
      admRefreshStats();
      toast("✅ "+pts+" pts awarded to "+ADM.selKid.first_name+"!",3000);
    }).catch(function(){err.textContent="Error. Try again.";});
}

function quickAward(pts,cat){
  if(!ADM.selKid){toast("Select a warrior first from the Warriors tab!");return;}
  var np=(ADM.selKid.points||0)+pts;
  sb("kids?id=eq."+ADM.selKid.id,{method:"PATCH",body:{points:np},prefer:"return=representation"})
    .then(function(){
      ADM.selKid.points=np;
      var idx=ADM.kids.findIndex(function(k){return k.id===ADM.selKid.id;});
      if(idx>=0)ADM.kids[idx].points=np;
      sb("transactions",{method:"POST",body:{kid_id:ADM.selKid.id,points:pts,category:cat,assigned_by:"admin",created_at:Date.now()},prefer:"return=representation"}).catch(function(){});
      document.getElementById("award-sel-pts").textContent=np+" pts";
      admRefreshStats();
      toast("⚡ "+pts+" pts → "+ADM.selKid.first_name+"!",2500);
    }).catch(function(){toast("Error. Try again.");});
}

function admRenderOrders(){
  var el=document.getElementById("adm-orders-list");if(!el)return;
  if(!ADM.orders.length){el.innerHTML="<p class='muted'>No orders yet.</p>";return;}
  el.innerHTML="";
  ADM.orders.forEach(function(o){
    var kid=ADM.kids.find(function(k){return k.id===o.kid_id;});
    var row=document.createElement("div");row.className="order-row";
    var isPending=o.status==="pending";
    row.innerHTML="<div style='display:flex;justify-content:space-between;align-items:flex-start;gap:.75rem'>"
      +"<div style='flex:1'>"
        +"<div style='font-weight:900;font-size:.85rem;margin-bottom:2px'>"+o.item_name+"</div>"
        +"<div style='font-size:.7rem;color:rgba(255,255,255,.4)'>"+( kid?kid.first_name+" "+kid.last_name:"Unknown")+" &middot; "+o.pts_spent+" pts</div>"
        +"<div style='font-size:.65rem;color:rgba(255,255,255,.3);margin-top:2px'>"+new Date(o.created_at||Date.now()).toLocaleDateString()+"</div>"
      +"</div>"
      +"<div style='flex-shrink:0'>"
        +(isPending?"<span style='background:rgba(255,200,0,.15);border:1px solid rgba(255,200,0,.3);color:#ffc800;border-radius:8px;padding:3px 10px;font-size:.65rem;font-weight:900'>PENDING</span>"
                   :"<span style='background:rgba(0,192,122,.12);border:1px solid rgba(0,192,122,.3);color:#00C07A;border-radius:8px;padding:3px 10px;font-size:.65rem;font-weight:900'>FULFILLED</span>")
      +"</div></div>";
    if(isPending){
      var fulfillBtn=document.createElement("button");
      fulfillBtn.style.cssText="margin-top:.65rem;background:rgba(0,192,122,.15);border:1.5px solid rgba(0,192,122,.3);border-radius:10px;padding:.45rem 1rem;color:#00C07A;font-weight:900;font-size:.75rem;cursor:pointer;width:100%";
      fulfillBtn.textContent="✅ Mark as Fulfilled";
      fulfillBtn.addEventListener("click",function(){
        sb("orders?id=eq."+o.id,{method:"PATCH",body:{status:"fulfilled"},prefer:"return=representation"})
          .then(function(){o.status="fulfilled";admRenderOrders();admRefreshStats();toast("✅ Order marked fulfilled!");})
          .catch(function(){toast("Error. Try again.");});
      });
      row.appendChild(fulfillBtn);
    }
    el.appendChild(row);
  });
}

function adminTab(tab,btn){
  ["overview","kids","award","orders","store","announce","settings"].forEach(function(t){
    var el=document.getElementById("atab-"+t);if(el)el.style.display=t===tab?"block":"none";
  });
  document.querySelectorAll(".admin-tab").forEach(function(b){b.classList.remove("active");});
  if(btn)btn.classList.add("active");
  if(tab==="overview")admLoadOverview();
  if(tab==="settings")admLoadSettings();
  if(tab==="orders"){admRenderOrders();admRenderPrayers();}
  if(tab==="announce")loadAnnouncements();
}

function toggleCheckin(){
  var enabled=CFG.checkin_enabled==="true";
  CFG.checkin_enabled=enabled?"false":"true";
  saveConfig("checkin_enabled",CFG.checkin_enabled);
  updateCheckinBtn();
  admLoadSettings();
  toast(CFG.checkin_enabled==="true"?"⛪ Check-In is LIVE!":"Check-In turned off",3000);
}

function saveCfgCheckin(){
  var pts=document.getElementById("cfg-checkin-pts").value||"10";
  saveConfig("checkin_pts",pts);CFG.checkin_pts=pts;
  toast("✅ Check-in points saved: "+pts+" pts");
}

function saveCfgGames(){
  var map={quiz:"cfg-quiz",tf:"cfg-tf",scramble:"cfg-scramble",match:"cfg-match",fitb:"cfg-fitb",wheel:"cfg-wheel",devo:"cfg-devo"};
  var keys={quiz:"quiz_pts_per_q",tf:"tf_pts_per_q",scramble:"scramble_pts",match:"match_pts",fitb:"fitb_pts_per_q",wheel:"wheel_pts",devo:"devo_pts"};
  Object.keys(map).forEach(function(k){
    var el=document.getElementById(map[k]);if(!el)return;
    var v=el.value||"5";saveConfig(keys[k],v);CFG[keys[k]]=v;
  });
  toast("✅ Game points saved!");
}

function admLoadSettings(){
  // Update toggle button
  var tog=document.getElementById("checkin-toggle");
  if(tog){
    var on=CFG.checkin_enabled==="true";
    tog.textContent=on?"ON — Tap to Disable":"OFF — Tap to Enable";
    tog.style.background=on?"rgba(0,192,122,.3)":"rgba(255,90,54,.2)";
    tog.style.border=on?"1.5px solid rgba(0,192,122,.5)":"1.5px solid rgba(255,90,54,.4)";
    tog.style.color=on?"#00C07A":"#ff8a8a";
  }
  // Fill config values
  var fields={quiz_pts_per_q:"cfg-quiz",tf_pts_per_q:"cfg-tf",scramble_pts:"cfg-scramble",match_pts:"cfg-match",fitb_pts_per_q:"cfg-fitb",wheel_pts:"cfg-wheel",devo_pts:"cfg-devo",checkin_pts:"cfg-checkin-pts"};
  Object.keys(fields).forEach(function(k){
    var el=document.getElementById(fields[k]);if(el)el.value=CFG[k]||"5";
  });
  // Render prize list
  admRenderPrizes();
}

function admRenderPrizes(){
  var el=document.getElementById("adm-prize-list");if(!el)return;
  el.innerHTML="";
  APP.storeItems.forEach(function(item){
    var row=document.createElement("div");row.style.cssText="display:flex;align-items:center;gap:.65rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.65rem .85rem;margin-bottom:.4rem";
    var info=document.createElement("div");info.style.flex="1";
    info.innerHTML="<div style='font-weight:900;font-size:.82rem'>"+item.name+"</div><div style='font-size:.65rem;color:rgba(255,255,255,.4)'>"+item.pts+" pts</div>";
    var editPts=document.createElement("input");editPts.type="number";editPts.value=item.pts;editPts.style.cssText="width:70px;padding:.35rem .5rem;font-size:.82rem;text-align:center";
    var saveBtn=document.createElement("button");saveBtn.style.cssText="background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.3);border-radius:8px;padding:.3rem .6rem;color:#f5c842;font-size:.62rem;font-weight:900;cursor:pointer";saveBtn.textContent="Save";
    saveBtn.addEventListener("click",function(){
      var np=parseInt(editPts.value||"0");if(!np||np<1)return;
      sb("store_items?id=eq."+item.id,{method:"PATCH",body:{pts:np},prefer:"return=representation"})
        .then(function(){item.pts=np;toast("✅ "+item.name+" now costs "+np+" pts");}).catch(function(){toast("Error saving.");});
    });
    var delBtn=document.createElement("button");delBtn.style.cssText="background:rgba(255,90,54,.15);border:1px solid rgba(255,90,54,.3);border-radius:8px;padding:.3rem .6rem;color:#FF5A36;font-size:.62rem;font-weight:900;cursor:pointer";delBtn.textContent="Del";
    delBtn.addEventListener("click",function(){
      if(!confirm("Delete "+item.name+"?"))return;
      sb("store_items?id=eq."+item.id,{method:"DELETE"})
        .then(function(){APP.storeItems=APP.storeItems.filter(function(s){return s.id!==item.id;});admRenderPrizes();admRenderStore();toast("Deleted.");}).catch(function(){toast("Error.");});
    });
    row.appendChild(info);row.appendChild(editPts);row.appendChild(saveBtn);row.appendChild(delBtn);el.appendChild(row);
  });
}

function addPrize(){
  var name=(document.getElementById("new-prize-name").value||"").trim();
  var pts=parseInt(document.getElementById("new-prize-pts").value||"0");
  var desc=(document.getElementById("new-prize-desc").value||"").trim();
  var url=(document.getElementById("new-prize-url").value||"").trim();
  if(!name||!pts){toast("Enter name and point cost!");return;}
  sb("store_items",{method:"POST",body:{name:name,pts:pts,description:desc,amazon_url:url||null,active:true},prefer:"return=representation"})
    .then(function(rows){
      var newItem=Array.isArray(rows)?rows[0]:rows;if(newItem)APP.storeItems.push(newItem);
      document.getElementById("new-prize-name").value="";
      document.getElementById("new-prize-pts").value="";
      document.getElementById("new-prize-desc").value="";
      document.getElementById("new-prize-url").value="";
      admRenderPrizes();admRenderStore();toast("✅ Prize added!");
    }).catch(function(e){toast("Error: "+(e.message||"try again"));});
}

// ── KID DETAIL PANEL ─────────────────────────────
function showKidDetail(kid){
  var ov=document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0";
  var box=document.createElement("div");
  box.style.cssText="background:linear-gradient(180deg,#0f0635,#07031a);border-radius:24px 24px 0 0;border-top:2px solid rgba(245,200,66,.2);padding:1.35rem 1.25rem 2rem;width:100%;max-width:480px;max-height:80vh;overflow-y:auto;animation:slideUp .3s";
  var closeBtn=document.createElement("button");closeBtn.textContent="✕";closeBtn.style.cssText="float:right;background:rgba(255,255,255,.1);border:none;border-radius:50%;width:32px;height:32px;color:rgba(255,255,255,.6);cursor:pointer;font-size:1rem";closeBtn.addEventListener("click",function(){ov.remove();});
  var armor=getArmor(kid);
  var headerHTML="<div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem'>"
    +"<div><div style='font-family:Bangers,cursive;font-size:1.6rem;color:#fff;letter-spacing:.04em'>"+kid.first_name+" "+kid.last_name+"</div>"
    +"<div style='font-size:.7rem;color:rgba(255,255,255,.4)'>PIN: "+kid.pin+" &middot; Age: "+(kid.age||"?")+" &middot; "+armor.length+"/7 armor</div></div>"
    +"</div>"
    +"<div style='background:rgba(245,200,66,.1);border:1.5px solid rgba(245,200,66,.25);border-radius:16px;padding:.85rem 1.25rem;text-align:center;margin-bottom:1rem'>"
    +"<div style='font-family:Bangers,cursive;font-size:2.5rem;color:#f5c842;line-height:1'>"+kid.points+"</div>"
    +"<div style='font-size:.6rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35)'>Warrior Points</div></div>"
    +"<div style='display:flex;gap:.5rem;margin-bottom:1rem'>"
    +"<div id='kd-award-btn' style='flex:1;background:rgba(245,200,66,.15);border:1.5px solid rgba(245,200,66,.3);border-radius:12px;padding:.65rem;text-align:center;cursor:pointer;font-weight:900;font-size:.82rem;color:#f5c842'>⚡ Award Pts</div>"
    +"<div id='kd-edit-btn' style='flex:1;background:rgba(108,82,227,.15);border:1.5px solid rgba(108,82,227,.3);border-radius:12px;padding:.65rem;text-align:center;cursor:pointer;font-weight:900;font-size:.82rem;color:#9B7EE8'>✎ Edit</div>"
    +"</div>"
    +"<div id='kd-award-form' style='display:none;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:.85rem;margin-bottom:.75rem'>"
    +"<div style='display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.5rem'>"
    +"<input id='kd-pts' type='number' placeholder='Points' min='1'>"
    +"<select id='kd-cat' style='background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);border-radius:12px;padding:.7rem .75rem;color:#fff;font-size:.85rem'>"
    +"<option value='attendance'>Attendance</option><option value='memorization'>Memory</option>"
    +"<option value='devo'>Devotional</option><option value='game'>Game</option><option value='bonus'>Bonus</option>"
    +"</select></div>"
    +"<button onclick='doKdAward()' class='btn btn-gold' style='font-size:.85rem;padding:.65rem'>Award</button></div>"
    +"<div class='eyebrow' style='margin-bottom:.5rem'>Point History</div>"
    +"<div id='kd-txns'><p class='muted'>Loading...</p></div>";
  box.innerHTML=headerHTML;
  box.prepend(closeBtn);
  ov.appendChild(box);document.body.appendChild(ov);
  // Wire buttons
  document.getElementById("kd-award-btn").addEventListener("click",function(){
    var f=document.getElementById("kd-award-form");f.style.display=f.style.display==="none"?"block":"none";
  });
  document.getElementById("kd-edit-btn").addEventListener("click",function(){ov.remove();editKid(kid);});
  // Award from detail
  window.doKdAward=function(){
    var pts=parseInt((document.getElementById("kd-pts").value||"0"));
    var cat=document.getElementById("kd-cat").value;
    if(!pts||pts<1){toast("Enter a valid amount!");return;}
    var np=(kid.points||0)+pts;
    sb("kids?id=eq."+kid.id,{method:"PATCH",body:{points:np},prefer:"return=representation"})
      .then(function(){
        sb("transactions",{method:"POST",body:{kid_id:kid.id,points:pts,category:cat,assigned_by:"admin",created_at:Date.now()},prefer:"return=representation"}).catch(function(){});
        kid.points=np;
        var idx2=ADM.kids.findIndex(function(k2){return k2.id===kid.id;});if(idx2>=0)ADM.kids[idx2].points=np;
        box.querySelector("[style*='font-size:2.5rem']").textContent=np;
        document.getElementById("kd-award-form").style.display="none";
        document.getElementById("kd-pts").value="";
        admRefreshStats();toast("✅ +"+pts+" pts to "+kid.first_name+"!");
        loadKdTxns(kid.id);
      }).catch(function(){toast("Error.");});
  };
  loadKdTxns(kid.id);
}

function loadKdTxns(kidId){
  var el=document.getElementById("kd-txns");if(!el)return;
  sb("transactions?select=*&kid_id=eq."+kidId+"&order=created_at.desc&limit=15")
    .then(function(rows){
      if(!rows.length){el.innerHTML="<p class='muted'>No transactions yet.</p>";return;}
      el.innerHTML="";
      rows.forEach(function(t){
        var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.78rem";
        var catIcons={attendance:"⛪",memorization:"📖",devo:"🙏",game:"⚔️",bonus:"⭐",witness:"✝️"};
        var icon=catIcons[t.category]||"⚡";
        var lbl=document.createElement("div");lbl.style.cssText="color:rgba(255,255,255,.7)";lbl.textContent=icon+" "+t.category+(t.note?" — "+t.note:"");
        var pts=document.createElement("div");pts.style.cssText="font-family:Bangers,cursive;font-size:.95rem;color:#f5c842;font-weight:900";pts.textContent="+"+t.points+" pts";
        var date=document.createElement("div");date.style.cssText="font-size:.6rem;color:rgba(255,255,255,.25);margin-top:1px";date.textContent=new Date(t.created_at||Date.now()).toLocaleDateString();
        var left=document.createElement("div");left.appendChild(lbl);left.appendChild(date);
        row.appendChild(left);row.appendChild(pts);el.appendChild(row);
      });
    }).catch(function(){el.innerHTML="<p class='muted'>Error loading history.</p>";});
}

// ── EDIT KID ─────────────────────────────────────
function editKid(kid){
  var ov=document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.25rem";
  var box=document.createElement("div");
  box.style.cssText="background:#0f0635;border:2px solid rgba(245,200,66,.25);border-radius:24px;padding:1.5rem;width:100%;max-width:380px;animation:slideUp .3s";
  box.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.4rem;color:#f5c842;margin-bottom:1rem'>Edit Warrior</div>"
    +"<div class='eyebrow' style='margin-bottom:.3rem'>First Name</div><input id='ek-first' type='text' value='"+kid.first_name+"' style='margin-bottom:.65rem'>"
    +"<div class='eyebrow' style='margin-bottom:.3rem'>Last Name</div><input id='ek-last' type='text' value='"+kid.last_name+"' style='margin-bottom:.65rem'>"
    +"<div style='display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.65rem'>"
      +"<div><div class='eyebrow' style='margin-bottom:.3rem'>Age</div><input id='ek-age' type='number' value='"+(kid.age||"")+"'></div>"
      +"<div><div class='eyebrow' style='margin-bottom:.3rem'>PIN</div><input id='ek-pin' type='text' value='"+kid.pin+"' maxlength='4'></div>"
    +"</div>"
    +"<div style='display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.35rem'>"
      +"<div id='ek-cancel' style='background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:12px;padding:.75rem;text-align:center;cursor:pointer;font-weight:700;font-size:.85rem'>Cancel</div>"
      +"<div id='ek-save' style='background:linear-gradient(135deg,#f5c842,#E09000);color:#0A0318;border-radius:12px;padding:.75rem;text-align:center;cursor:pointer;font-family:Bangers,cursive;font-size:1rem;letter-spacing:.06em'>Save</div>"
    +"</div>"
    +"<div id='ek-err' class='error'></div>";
  ov.appendChild(box);document.body.appendChild(ov);
  document.getElementById("ek-cancel").addEventListener("click",function(){ov.remove();});
  document.getElementById("ek-save").addEventListener("click",function(){
    var first=(document.getElementById("ek-first").value||"").trim();
    var last=(document.getElementById("ek-last").value||"").trim();
    var age=parseInt(document.getElementById("ek-age").value||"0");
    var pin=(document.getElementById("ek-pin").value||"").trim();
    var err=document.getElementById("ek-err");err.textContent="";
    if(!first||!last){err.textContent="Name required.";return;}
    if(pin.length!==4||isNaN(pin)){err.textContent="PIN must be 4 digits.";return;}
    var ageGroup=age<=7?"47":"812";
    sb("kids?id=eq."+kid.id,{method:"PATCH",body:{first_name:first,last_name:last,age:age,age_group:ageGroup,pin:pin},prefer:"return=representation"})
      .then(function(){
        kid.first_name=first;kid.last_name=last;kid.age=age;kid.age_group=ageGroup;kid.pin=pin;
        admRenderKids();ov.remove();toast("✅ "+first+" updated!");
      }).catch(function(){err.textContent="Error saving. Try again.";});
  });
}

// ── DELETE KID ────────────────────────────────────
function deleteKid(kid){
  if(!confirm("Delete "+kid.first_name+" "+kid.last_name+"? This cannot be undone."))return;
  sb("kids?id=eq."+kid.id,{method:"DELETE"})
    .then(function(){
      ADM.kids=ADM.kids.filter(function(k){return k.id!==kid.id;});
      admRefreshStats();admRenderKids();
      toast("Deleted "+kid.first_name,2500);
    }).catch(function(){toast("Error deleting.");});
}

function admRenderPrayers(){
  var el=document.getElementById("adm-prayers-list");if(!el)return;
  el.innerHTML="<p class='muted'>Loading prayers...</p>";
  sb("prayer_wall?select=*&order=created_at.desc")
    .then(function(rows){
      el.innerHTML="";
      if(!rows.length){el.innerHTML="<p class='muted'>No prayers submitted yet.</p>";return;}
      rows.forEach(function(p){
        var row=document.createElement("div");row.style.cssText="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.75rem 1rem;margin-bottom:.4rem";
        var top=document.createElement("div");top.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.35rem";
        var txt=document.createElement("div");txt.style.cssText="font-size:.85rem;color:rgba(255,255,255,.85);line-height:1.5;flex:1";txt.textContent=p.text;
        var btns=document.createElement("div");btns.style.cssText="display:flex;gap:.35rem;flex-shrink:0";
        var approveBtn=document.createElement("button");approveBtn.style.cssText="background:rgba(0,192,122,.15);border:1px solid rgba(0,192,122,.3);border-radius:8px;padding:.25rem .55rem;color:#00C07A;font-size:.62rem;font-weight:900;cursor:pointer";
        approveBtn.textContent=p.approved?"✅ Live":"Approve";
        if(!p.approved){approveBtn.addEventListener("click",function(){
          sb("prayer_wall?id=eq."+p.id,{method:"PATCH",body:{approved:true},prefer:"return=representation"})
            .then(function(){p.approved=true;approveBtn.textContent="✅ Live";toast("Prayer approved!");}).catch(function(){});
        });}
        var delPBtn=document.createElement("button");delPBtn.style.cssText="background:rgba(255,90,54,.12);border:1px solid rgba(255,90,54,.25);border-radius:8px;padding:.25rem .55rem;color:#FF5A36;font-size:.62rem;font-weight:900;cursor:pointer";
        delPBtn.textContent="✕";
        delPBtn.addEventListener("click",function(){
          sb("prayer_wall?id=eq."+p.id,{method:"DELETE"})
            .then(function(){row.remove();toast("Prayer removed.");}).catch(function(){});
        });
        btns.appendChild(approveBtn);btns.appendChild(delPBtn);top.appendChild(txt);top.appendChild(btns);
        var meta=document.createElement("div");meta.style.cssText="font-size:.62rem;color:rgba(255,255,255,.3)";
        meta.textContent="🙏 "+p.name+" · "+p.prayers+" prayed";
        row.appendChild(top);row.appendChild(meta);el.appendChild(row);
      });
    }).catch(function(){el.innerHTML="<p class='muted'>Error loading prayers.</p>";});
}


// ── OVERVIEW TAB ─────────────────────────────────
function admLoadOverview(){
  // Check-in toggle display
  var on=CFG.checkin_enabled==="true";
  var statusEl=document.getElementById("ov-checkin-status");
  var togBtn=document.getElementById("ov-toggle-btn");
  if(statusEl)statusEl.textContent=on?"🟢 Check-In LIVE":"⚪ Check-In Off";
  if(togBtn){togBtn.textContent=on?"Turn OFF":"Turn ON";togBtn.style.background=on?"rgba(255,90,54,.3)":"rgba(0,192,122,.3)";togBtn.style.color=on?"#ff8a8a":"#00C07A";}

  // Quick stats
  var kids=ADM.kids;
  if(kids.length){
    var top=kids[0];
    var avg=Math.round(kids.reduce(function(s,k){return s+(k.points||0);},0)/kids.length);
    var zeros=kids.filter(function(k){return !k.points||k.points===0;}).length;
    var fullArmor=kids.filter(function(k){return getArmor(k).length===7;}).length;
    var el;
    el=document.getElementById("ov-stat-top");if(el)el.textContent=top.first_name;
    el=document.getElementById("ov-stat-avg");if(el)el.textContent=avg+" pts";
    el=document.getElementById("ov-stat-zero");if(el)el.textContent=zeros;
    el=document.getElementById("ov-stat-armor");if(el)el.textContent=fullArmor;
  }

  // Wire roster div to ov-roster
  var ovRoster=document.getElementById("ov-roster");
  if(ovRoster){
    var today=new Date().toISOString().split("T")[0];
    sb("sunday_checkins?select=*&date=eq."+today)
      .then(function(rows){
        if(!rows.length){ovRoster.innerHTML="<p class='muted'>No check-ins yet today.</p>";return;}
        ovRoster.innerHTML="<div style='font-size:.72rem;font-weight:900;color:#f5c842;margin-bottom:.4rem'>"+rows.length+" warrior"+(rows.length!==1?"s":"")+" checked in</div>";
        rows.forEach(function(r){
          var kid=ADM.kids.find(function(k){return k.id===r.kid_id;});
          var name=kid?kid.first_name+" "+kid.last_name:"Unknown";
          var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;font-size:.78rem;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.05)";
          row.innerHTML="<span>⛪ "+name+"</span><span style='color:#f5c842;font-weight:900'>+"+r.pts_awarded+" pts</span>";
          ovRoster.appendChild(row);
        });
      }).catch(function(){});
  }

  // Pending orders quick view
  var ovOrders=document.getElementById("ov-pending-orders");
  if(ovOrders){
    var pending=ADM.orders.filter(function(o){return o.status==="pending";});
    if(!pending.length){ovOrders.innerHTML="<p class='muted'>No pending orders ✅</p>";return;}
    ovOrders.innerHTML="";
    pending.slice(0,5).forEach(function(o){
      var kid=ADM.kids.find(function(k){return k.id===o.kid_id;});
      var row=document.createElement("div");row.style.cssText="display:flex;align-items:center;justify-content:space-between;background:rgba(255,200,0,.07);border:1px solid rgba(255,200,0,.2);border-radius:12px;padding:.65rem 1rem;margin-bottom:.4rem";
      row.innerHTML="<div><div style='font-weight:900;font-size:.82rem'>"+o.item_name+"</div><div style='font-size:.65rem;color:rgba(255,255,255,.4)'>"+(kid?kid.first_name+" "+kid.last_name:"Unknown")+"</div></div>";
      var fulfBtn=document.createElement("button");fulfBtn.style.cssText="background:rgba(0,192,122,.2);border:1px solid rgba(0,192,122,.35);border-radius:8px;padding:.3rem .7rem;color:#00C07A;font-size:.65rem;font-weight:900;cursor:pointer;flex-shrink:0";fulfBtn.textContent="Fulfill ✅";
      fulfBtn.addEventListener("click",function(){
        sb("orders?id=eq."+o.id,{method:"PATCH",body:{status:"fulfilled"},prefer:"return=representation"})
          .then(function(){o.status="fulfilled";row.remove();admRefreshStats();toast("✅ Fulfilled!");}).catch(function(){});
      });
      row.appendChild(fulfBtn);ovOrders.appendChild(row);
    });
    if(pending.length>5){var more=document.createElement("p");more.className="muted";more.textContent="+"+(pending.length-5)+" more — see Orders tab";ovOrders.appendChild(more);}
  }
}

// ── EXPORT CSV ────────────────────────────────────
function exportCSV(){
  if(!ADM.kids.length){toast("No warriors to export.");return;}
  var rows=["Name,Points,Age Group,Age,Armor Pieces,PIN,Joined"];
  ADM.kids.forEach(function(k){
    var armor=getArmor(k).length;
    var joined=k.joined_at?new Date(k.joined_at).toLocaleDateString():"Unknown";
    rows.push([
      (k.first_name||"")+" "+(k.last_name||""),
      k.points||0,
      k.age_group==="47"?"Ages 4-7":"Ages 8-12",
      k.age||"",
      armor+"/7",
      k.pin||"",
      joined
    ].join(","));
  });
  var csv=rows.join("\n");
  var blob=new Blob([csv],{type:"text/csv"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");a.href=url;a.download="warrior-zone-report-"+new Date().toISOString().split("T")[0]+".csv";
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  toast("📊 CSV downloaded!",2500);
}

// ── RESET KID POINTS ─────────────────────────────
function resetKidPoints(kid){
  if(!confirm("Reset "+kid.first_name+"'s points to 0? This cannot be undone."))return;
  sb("kids?id=eq."+kid.id,{method:"PATCH",body:{points:0},prefer:"return=representation"})
    .then(function(){
      kid.points=0;admRenderKids();admRefreshStats();
      toast("Points reset for "+kid.first_name,2500);
    }).catch(function(){toast("Error resetting points.");});
}

// ── ANNOUNCEMENTS ────────────────────────────────
function sendAnnouncement(){
  var title=(document.getElementById("ann-title").value||"").trim();
  var body=(document.getElementById("ann-body").value||"").trim();
  var type=document.getElementById("ann-type").value;
  if(!title||!body){toast("Enter a title and message!");return;}
  sb("announcements",{method:"POST",body:{title:title,body:body,type:type,active:true,created_at:Date.now()},prefer:"return=representation"})
    .then(function(){
      document.getElementById("ann-title").value="";
      document.getElementById("ann-body").value="";
      toast("📣 Announcement sent to all warriors!",3000);
      loadAnnouncements();
    }).catch(function(e){toast("Error: "+(e.message||"try again"));});
}

function loadAnnouncements(){
  var el=document.getElementById("ann-list");if(!el)return;
  el.innerHTML="<p class='muted'>Loading...</p>";
  sb("announcements?select=*&order=created_at.desc&limit=10")
    .then(function(rows){
      if(!rows.length){el.innerHTML="<p class='muted'>No announcements yet.</p>";return;}
      el.innerHTML="";
      rows.forEach(function(a){
        var row=document.createElement("div");row.style.cssText="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.85rem 1rem;margin-bottom:.45rem";
        var typeIcons={info:"📢",event:"📅",challenge:"⚔️",praise:"🏆"};
        var icon=typeIcons[a.type]||"📢";
        row.innerHTML="<div style='display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.3rem'>"
          +"<div style='font-weight:900;font-size:.85rem'>"+icon+" "+a.title+"</div>"
          +"<div style='display:flex;gap:.35rem;flex-shrink:0'>"
          +"<button onclick=\\'toggleAnn(\\\\'+a.id+\\',"+(!a.active)+",this)' style='background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.25rem .55rem;color:rgba(255,255,255,.6);font-size:.6rem;font-weight:900;cursor:pointer'>"+(a.active?"Hide":"Show")+"</button>"
          +"<button onclick=\\'deleteAnn(\\\\'+a.id+\\',this)' style='background:rgba(255,90,54,.12);border:1px solid rgba(255,90,54,.25);border-radius:8px;padding:.25rem .55rem;color:#FF5A36;font-size:.6rem;font-weight:900;cursor:pointer'>✕</button>"
          +"</div></div>"
          +"<div style='font-size:.78rem;color:rgba(255,255,255,.6);line-height:1.45;margin-bottom:.25rem'>"+a.body+"</div>"
          +"<div style='font-size:.62rem;color:rgba(255,255,255,.3)'>"+new Date(a.created_at||Date.now()).toLocaleDateString()+" &middot; "+(a.active?"🟢 Active":"⚪ Hidden")+"</div>";
        el.appendChild(row);
      });
    }).catch(function(){el.innerHTML="<p class='muted'>Error loading.</p>";});
}

function toggleAnn(id,active,btn){
  sb("announcements?id=eq."+id,{method:"PATCH",body:{active:active},prefer:"return=representation"})
    .then(function(){btn.textContent=active?"Hide":"Show";toast(active?"Announcement shown":"Announcement hidden");loadAnnouncements();})
    .catch(function(){toast("Error.");});
}
function deleteAnn(id,btn){
  if(!confirm("Delete this announcement?"))return;
  sb("announcements?id=eq."+id,{method:"DELETE"})
    .then(function(){btn.closest("[style]").remove();toast("Deleted.");}).catch(function(){toast("Error.");});
}

// ── ORDER SEARCH ─────────────────────────────────
function admSearchOrders(){
  var q=(document.getElementById("order-search").value||"").trim().toUpperCase();
  var rows=document.querySelectorAll(".order-row");
  rows.forEach(function(r){
    r.style.display=!q||r.textContent.toUpperCase().includes(q)?"":"none";
  });
}

function admRenderStore(){
  var el=document.getElementById("adm-store-list");if(!el)return;
  if(!APP.storeItems.length){el.innerHTML="<p class='muted'>No store items.</p>";return;}
  el.innerHTML="";
  APP.storeItems.forEach(function(item){
    var row=document.createElement("div");row.className="order-row";
    row.style.display="flex";row.style.alignItems="center";row.style.gap=".75rem";
    if(item.img){var img=document.createElement("img");img.src=item.img;img.style.cssText="width:50px;height:50px;border-radius:10px;object-fit:contain;flex-shrink:0";img.onerror=function(){this.style.display="none";};row.appendChild(img);}
    var info=document.createElement("div");info.style.flex="1";
    info.innerHTML="<div style='font-weight:900;font-size:.85rem'>"+item.name+"</div>"
      +"<div style='font-size:.7rem;color:rgba(255,255,255,.4)'>"+item.pts+" pts &middot; "+(item.active?"Active":"Inactive")+"</div>"
      +(item.description?"<div style='font-size:.65rem;color:rgba(255,255,255,.3);margin-top:2px'>"+item.description+"</div>":"");
    row.appendChild(info);
    if(item.amazon_url){
      var link=document.createElement("a");link.href=item.amazon_url;link.target="_blank";
      link.style.cssText="background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.3);border-radius:8px;padding:.3rem .65rem;color:#f5c842;font-size:.65rem;font-weight:900;text-decoration:none;flex-shrink:0";
      link.textContent="Amazon";row.appendChild(link);
    }
    el.appendChild(row);
  });
}

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded",function(){
  show("p-land");
  // Load app config
  sb("app_config?select=key,value").then(function(rows){
    rows.forEach(function(r){ CFG[r.key]=r.value; });
    // Update checkin button if enabled
    updateCheckinBtn();
  }).catch(function(){});
  sb("kids?select=id").then(function(r){
    var el=document.getElementById("stat-warriors");if(el)el.textContent=r.length;
  }).catch(function(){});
  var VV=[
    {t:"Be strong and courageous. Do not be afraid, for the Lord your God is with you wherever you go.",r:"Joshua 1:9 \u00b7 ESV"},
    {t:"I can do all things through him who strengthens me.",r:"Philippians 4:13 \u00b7 ESV"},
    {t:"Put on the whole armor of God, that you may be able to stand against the schemes of the devil.",r:"Ephesians 6:11 \u00b7 ESV"},
    {t:"God gave us a spirit not of fear but of power and love and self-control.",r:"2 Timothy 1:7 \u00b7 ESV"},
    {t:"Rejoice in the Lord always; again I will say, rejoice.",r:"Philippians 4:4 \u00b7 ESV"},
    {t:"The peace of God, which surpasses all understanding, will guard your hearts and your minds.",r:"Philippians 4:7 \u00b7 ESV"}
  ];
  var vi=0;
  setInterval(function(){
    vi=(vi+1)%VV.length;
    var t=document.getElementById("verse-text");var r=document.getElementById("verse-ref");
    if(t&&r){t.style.opacity=0;setTimeout(function(){t.textContent="\u201c"+VV[vi].t+"\u201d";r.textContent=VV[vi].r;t.style.transition="opacity .5s";t.style.opacity=1;},300);}
  },8000);
  // CSS handles sidebar show/hide via @media — no JS needed
  // Login page particles
  var loginParts=document.getElementById("login-particles");
  if(loginParts){
    var lpEmojis=["⚔️","🛡️","🪖","📖","✝️","🏆","⚡","🙏","🌟","🔥"];
    for(var li=0;li<20;li++){
      var lpe=document.createElement("div");lpe.className="lp-emoji";
      lpe.textContent=lpEmojis[li%lpEmojis.length];
      lpe.style.cssText="left:"+(Math.random()*100)+"%;--d:"+(Math.random()*10+6)+"s;--delay:-"+(Math.random()*10)+"s";
      loginParts.appendChild(lpe);
    }
  }
  for(var i=0;i<12;i++){
    var e=document.createElement("div");e.className="ember";
    e.style.cssText="--sz:"+(Math.random()*3+2)+"px;--d:"+(Math.random()*6+6)+"s;--delay:-"+(Math.random()*10)+"s;--c:"+(Math.random()>.4?"#f5c842":Math.random()>.5?"#FF6B1A":"#ff4500")+";left:"+(Math.random()*90+5)+"%";
    document.body.appendChild(e);
  }
});
;/* --- WZ SECURE REWIRE: points are server-authoritative --- */
var WZ_BASE="https://ktuapfiexhlladgkuauc.supabase.co/functions/v1";
function wzPost(fn,body){return fetch(WZ_BASE+"/"+fn,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json();});}
function wzUI(){if(!APP.kid)return;var p=APP.kid.points||0;var a=document.getElementById("dash-pts");if(a)a.textContent=p;var b=document.getElementById("dash-pts2");if(b)b.textContent=p;if(typeof getArmor==="function"){var ar=getArmor(APP.kid);var af=document.getElementById("armor-fill");if(af)af.style.width=Math.round((ar.length/7)*100)+"%";var ac=document.getElementById("armor-count");if(ac)ac.textContent=ar.length+"/7";var ap=document.getElementById("armor-pct");if(ap)ap.textContent=Math.round((ar.length/7)*100)+"%";}}
function wzSyncKid(res){if(res&&typeof res.points==="number"){APP.kid.points=res.points;if(typeof res.lifetime_points==="number")APP.kid.lifetime_points=res.lifetime_points;wzUI();}}
function gameAward(pts,key){if(!APP.kid)return;wzPost("wz-award",{action:"game",kidId:APP.kid.id,pin:APP.kid.pin,key:key,amount:pts}).then(function(res){if(res&&res.ok){if(res.granted>0){wzSyncKid(res);toast("⚡ +"+res.granted+" pts!",3000);}else{toast("🎮 Daily game max reached! Keep playing for fun, points reset tomorrow.",4500);}}else{toast("Could not save. Try again.");}}).catch(function(){toast("Could not save. Try again.");});}
function awardVideo(v){if(!APP.kid)return;wzPost("wz-award",{action:"video",kidId:APP.kid.id,pin:APP.kid.pin,key:v.id}).then(function(res){if(res&&res.ok){var d=APP.kid.completed_videos||[];if(d.indexOf(v.id)<0){APP.kid.completed_videos=d.concat([v.id]);}if(res.granted>0){wzSyncKid(res);toast("🎬 Correct! +"+res.granted+" points, warrior!",4000);}else if(res.already){toast("Already earned! ✅");}else{toast("🎬 Weekly video max reached! New points next week.",4500);}setTimeout(function(){if(typeof renderVideos==="function")renderVideos();},1200);}else{toast("Could not save. Try again.");}}).catch(function(){toast("Could not save. Try again.");});}
function completeMission(key,pts,cb){if(!APP.kid){toast("Log in to save progress!");return;}wzPost("wz-award",{action:"training",kidId:APP.kid.id,pin:APP.kid.pin,key:key}).then(function(res){if(res&&res.ok){var m=APP.kid.completed_missions||[];if(m.indexOf(key)<0){APP.kid.completed_missions=m.concat([key]);}if(res.granted>0){wzSyncKid(res);toast("⚡ +"+res.granted+" pts!",3000);}else if(res.already){toast("Already completed!");}else{toast("⚔️ Weekly training max reached! New points next week.",4500);}if(cb)cb();if(typeof renderTraining==="function")renderTraining();}else{toast("Could not save. Try again.");}}).catch(function(){toast("Could not save. Try again.");});}
function markDevo(i,evt){if(!APP.kid)return;var mk=String((typeof DEVOS!=="undefined"&&DEVOS[i]&&DEVOS[i].id)?DEVOS[i].id:i);wzPost("wz-award",{action:"devo",kidId:APP.kid.id,pin:APP.kid.pin,key:mk}).then(function(res){if(res&&res.ok){var d=APP.kid.completed_devos||[];if(d.indexOf(mk)<0){APP.kid.completed_devos=d.concat([mk]);}if(res.granted>0){wzSyncKid(res);toast("📖 Devotional complete! +"+res.granted+" pts");}else if(res.already){toast("Already completed this one!");}else{toast("📖 Devo max reached for today. More tomorrow!");}if(typeof renderDevos==="function")renderDevos();}else{toast("Could not save. Try again.");}}).catch(function(){toast("Could not save. Try again.");});}
function doCheckin(){if(!APP.kid){toast("Log in first to check in!");show("p-klogin");return;}wzPost("wz-award",{action:"checkin",kidId:APP.kid.id,pin:APP.kid.pin}).then(function(res){if(res&&res.ok){if(res.granted>0){wzSyncKid(res);toast("⛪ Checked in! +"+res.granted+" pts! God is good!",4000);}else if(res.already){toast("Already checked in this week! ✅");}else{toast("Check-in is not open right now.");}}else if(res&&res.error==="checkin_off"){toast("Check-in is not open right now.");}else{toast("Could not check in. Try again.");}}).catch(function(){toast("Could not check in. Try again.");});}
function saveConfig(k,v){CFG[k]=String(v);wzPost("wz-admin",{action:"config",pass:(typeof ADM!=="undefined"?ADM.pass:""),key:k,value:String(v)}).catch(function(){});}
function doAwardPts(){var err=document.getElementById("award-err");err.textContent="";if(!ADM.selKid){err.textContent="Search for and select a warrior first.";return;}var pts=parseInt(document.getElementById("award-pts").value||"0");if(!pts){err.textContent="Enter a valid point amount.";return;}var cat=document.getElementById("award-cat").value;var note=(document.getElementById("award-note").value||"").trim();wzPost("wz-admin",{action:"award",pass:ADM.pass,kidId:ADM.selKid.id,points:pts,category:cat,note:note||"admin"}).then(function(res){if(!res||!res.ok){err.textContent=(res&&res.error==="admin_auth_failed")?"Admin session expired. Log in again.":"Could not apply. Try again.";return;}ADM.selKid.points=res.points;var idx=ADM.kids.findIndex(function(k){return k.id===ADM.selKid.id;});if(idx>=0)ADM.kids[idx].points=res.points;var sp=document.getElementById("award-sel-pts");if(sp)sp.textContent=res.points+" pts";document.getElementById("award-pts").value="";var an=document.getElementById("award-note");if(an)an.value="";admRefreshStats();toast("⚡ "+pts+" pts → "+ADM.selKid.first_name+"!",2500);}).catch(function(){err.textContent="Network error.";});}
function quickAward(pts,cat){if(!ADM.selKid){toast("Select a warrior first from the Warriors tab!");return;}wzPost("wz-admin",{action:"award",pass:ADM.pass,kidId:ADM.selKid.id,points:pts,category:cat,note:"quick"}).then(function(res){if(!res||!res.ok){toast("Could not apply. Log in again if needed.");return;}ADM.selKid.points=res.points;var idx=ADM.kids.findIndex(function(k){return k.id===ADM.selKid.id;});if(idx>=0)ADM.kids[idx].points=res.points;var sp=document.getElementById("award-sel-pts");if(sp)sp.textContent=res.points+" pts";admRefreshStats();toast("⚡ "+pts+" pts → "+ADM.selKid.first_name+"!",2500);}).catch(function(){toast("Network error.");});}
function resetKidPoints(kid){if(!confirm("Reset "+kid.first_name+"'s points to 0? This cannot be undone."))return;wzPost("wz-admin",{action:"award",pass:ADM.pass,kidId:kid.id,points:-(kid.points||0),category:"reset",note:"reset to 0"}).then(function(res){if(!res||!res.ok){toast("Error resetting points.");return;}kid.points=res.points;admRenderKids();admRefreshStats();toast("Points reset for "+kid.first_name,2500);}).catch(function(){toast("Error resetting points.");});}
function doAdminLogin(){var pw=document.getElementById("al-pw").value;var err=document.getElementById("al-err");err.textContent="Checking...";wzPost("wz-admin-auth",{action:"verify",passphrase:pw}).then(function(v){if(!v||!v.ok){err.textContent="Incorrect password.";return;}ADM.pass=pw;err.textContent="Loading...";Promise.all([sb("kids?select=*&order=points.desc"),sb("orders?select=*&order=created_at.desc"),sb("store_items?select=*&order=pts.asc"),sb("app_config?select=key,value")]).then(function(results){ADM.kids=results[0]||[];ADM.orders=results[1]||[];APP.storeItems=results[2]||[];var cfgRows=results[3]||[];cfgRows.forEach(function(r){CFG[r.key]=r.value;});err.textContent="";show("p-admin");admRefreshStats();admRenderKids();admRenderOrders();admRenderStore();adminTab("overview",document.querySelector(".admin-tab"));}).catch(function(){err.textContent="Load failed. Try again.";});}).catch(function(){err.textContent="Network error. Try again.";});}
;window.renderArmor=function(){var el=document.getElementById("tab-warrior");if(!el)return;var unlocked=APP.kid?getArmor(APP.kid):[];el.innerHTML="";var pts=APP.kid?(APP.kid.lifetime_points!=null?APP.kid.lifetime_points:(APP.kid.points||0)):0;var PIECES=[{id:"belt",label:"Belt of Truth",e:"🎗️",t:25},{id:"breastplate",label:"Breastplate of Righteousness",e:"🛡️",t:100},{id:"boots",label:"Gospel Boots",e:"🥾",t:250},{id:"shield",label:"Shield of Faith",e:"🛡️",t:500},{id:"helmet",label:"Helmet of Salvation",e:"⛑️",t:800},{id:"sword",label:"Sword of the Spirit",e:"⚔️",t:1200},{id:"full",label:"Full Armor of God",e:"✨",t:1800}];var has=function(id){return unlocked.indexOf(id)>=0;};var count=unlocked.filter(function(x){return x!=="full";}).length;var hdr=document.createElement("div");hdr.style.cssText="font-family:'Bangers',cursive;font-size:1.6rem;letter-spacing:.04em";hdr.textContent="Your Armor of God";var sub=document.createElement("div");sub.className="muted";sub.style.cssText="margin-bottom:.85rem;font-size:.78rem";sub.textContent=count+" of 6 pieces earned"+(has("full")?" — FULL ARMOR, warrior!":"");el.appendChild(hdr);el.appendChild(sub);var box=document.createElement("div");box.style.cssText="background:linear-gradient(160deg,#150a3a,#08132e);border:1.5px solid rgba(245,200,66,.2);border-radius:24px;padding:1rem;margin-bottom:1rem;text-align:center";box.innerHTML=armorSVG(has);el.appendChild(box);var next=null;for(var i=0;i<PIECES.length;i++){if(!has(PIECES[i].id)){next=PIECES[i];break;}}if(next){var prevT=0;for(var j=0;j<PIECES.length;j++){if(PIECES[j].id===next.id)break;prevT=PIECES[j].t;}var pctn=Math.max(0,Math.min(100,Math.round((pts-prevT)/(next.t-prevT)*100)));var prog=document.createElement("div");prog.style.cssText="margin-bottom:1rem";prog.innerHTML="<div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Next: "+next.e+" "+next.label+" ("+pts+" / "+next.t+")</div><div style='background:rgba(255,255,255,.08);border-radius:99px;height:9px;overflow:hidden'><div style='height:100%;width:"+pctn+"%;background:linear-gradient(90deg,#f5c842,#ff8c00);border-radius:99px'></div></div>";el.appendChild(prog);}var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.25rem";PIECES.forEach(function(a){if(a.id==="full")return;var on=has(a.id);var card=document.createElement("div");card.style.cssText="border-radius:18px;padding:.85rem .6rem;text-align:center;border:1.5px solid "+(on?"rgba(245,200,66,.4)":"rgba(255,255,255,.08)")+";background:"+(on?"rgba(245,200,66,.08)":"rgba(255,255,255,.03)");card.innerHTML="<div style='font-size:2rem;margin-bottom:.3rem"+(on?"":";filter:grayscale(1) opacity(.3)")+"'>"+a.e+"</div><div style='font-size:.66rem;font-weight:800;color:"+(on?"#fff":"rgba(255,255,255,.4)")+";line-height:1.2'>"+a.label+"</div><div style='font-size:.6rem;color:"+(on?"#f5c842":"rgba(255,255,255,.3)")+";margin-top:.2rem'>"+(on?"UNLOCKED":a.t+" pts")+"</div>";grid.appendChild(card);});el.appendChild(grid);el.appendChild(renderBadgesSection());};
;/* --- WZ WARRIOR MODEL v2 + CUSTOMIZE --- */
function wzSkin(){try{var a=APP.kid&&APP.kid.avatar;if(a&&a.charAt(0)==="{"){var o=JSON.parse(a);if(o.skin)return o.skin;}}catch(e){}return "#f1c27d";}
function wzAccent(){try{var a=APP.kid&&APP.kid.avatar;if(a&&a.charAt(0)==="{"){var o=JSON.parse(a);if(o.accent)return o.accent;}}catch(e){}return "#6C52E3";}
window.armorSVG=function(has){var skin=wzSkin(),accent=wzAccent(),gold="url(#agold)";function pc(on,off){return on?gold:off;}var full=has("full");var s="<svg viewBox='0 0 200 280' width='180' style='max-width:78%'>";s+="<defs><linearGradient id='agold' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffe487'/><stop offset='1' stop-color='#E09000'/></linearGradient><radialGradient id='aura'><stop offset='0' stop-color='rgba(245,200,66,.5)'/><stop offset='1' stop-color='rgba(245,200,66,0)'/></radialGradient></defs>";if(full)s+="<circle cx='100' cy='150' r='138' fill='url(#aura)'/>";if(has('breastplate')||full)s+="<path d='M72,122 q28,-12 56,0 l12,104 q-40,18 -80,0 z' fill='"+accent+"' opacity='.92'/>";s+="<rect x='84' y='196' width='15' height='40' rx='7' fill='#3a2a1a'/><rect x='101' y='196' width='15' height='40' rx='7' fill='#3a2a1a'/>";s+="<rect x='81' y='224' width='20' height='21' rx='9' fill='"+pc(has('boots'),'#2a1e12')+"'/><rect x='99' y='224' width='20' height='21' rx='9' fill='"+pc(has('boots'),'#2a1e12')+"'/>";s+="<rect x='52' y='126' width='16' height='52' rx='8' fill='"+accent+"'/><rect x='132' y='126' width='16' height='52' rx='8' fill='"+accent+"'/>";s+="<rect x='68' y='120' width='64' height='84' rx='26' fill='"+accent+"'/>";s+="<circle cx='60' cy='182' r='10' fill='"+skin+"'/><circle cx='140' cy='182' r='10' fill='"+skin+"'/>";s+="<rect x='70' y='124' width='60' height='66' rx='22' fill='"+pc(has('breastplate'),'rgba(255,255,255,.06)')+"' stroke='"+(has('breastplate')?'#b06f00':'rgba(255,255,255,.12)')+"' stroke-width='2'/>";if(has('breastplate'))s+="<circle cx='100' cy='150' r='11' fill='#ffe487' stroke='#b06f00' stroke-width='1.5'/><path d='M100,143 v14 M93,150 h14' stroke='#b06f00' stroke-width='2.2'/>";s+="<rect x='66' y='186' width='68' height='16' rx='6' fill='"+pc(has('belt'),'rgba(255,255,255,.06)')+"'/>";if(has('belt'))s+="<rect x='92' y='187' width='16' height='14' rx='3' fill='#8a5600'/>";s+="<circle cx='100' cy='80' r='38' fill='"+skin+"'/>";s+="<circle cx='88' cy='78' r='4.6' fill='#2a1a10'/><circle cx='112' cy='78' r='4.6' fill='#2a1a10'/><circle cx='89.6' cy='76.4' r='1.5' fill='#fff'/><circle cx='113.6' cy='76.4' r='1.5' fill='#fff'/>";s+="<path d='M89,92 q11,10 22,0' stroke='#a05a3a' stroke-width='3' fill='none' stroke-linecap='round'/>";s+="<circle cx='79' cy='88' r='4.5' fill='#ff9a9a' opacity='.45'/><circle cx='121' cy='88' r='4.5' fill='#ff9a9a' opacity='.45'/>";if(has('helmet'))s+="<path d='M61,76 a39,39 0 0,1 78,0 v3 h-11 l-4,-17 a31,31 0 0,0 -48,0 l-4,17 h-11 z' fill='url(#agold)' stroke='#b06f00' stroke-width='1.5'/><rect x='96' y='38' width='8' height='17' rx='3' fill='#b06f00'/>";s+="<ellipse cx='45' cy='150' rx='20' ry='27' fill='"+pc(has('shield'),'rgba(255,255,255,.05)')+"' stroke='"+(has('shield')?'#b06f00':'rgba(255,255,255,.12)')+"' stroke-width='2'/>";if(has('shield'))s+="<path d='M45,137 v26 M34,150 h22' stroke='#fff' stroke-width='3' stroke-linecap='round' opacity='.9'/>";s+="<rect x='150' y='118' width='6' height='74' rx='3' fill='"+(has('sword')?'#eef2fb':'rgba(255,255,255,.07)')+"'/><rect x='141' y='116' width='24' height='7' rx='3' fill='"+(has('sword')?gold:'rgba(255,255,255,.07)')+"'/><rect x='150' y='190' width='6' height='13' rx='3' fill='"+(has('sword')?'#8a5600':'rgba(255,255,255,.07)')+"'/>";s+="</svg>";return s;};
function saveCustom(k,v){var cur={};try{var a=APP.kid.avatar;if(a&&a.charAt(0)==="{")cur=JSON.parse(a);}catch(e){}cur[k]=v;var js=JSON.stringify(cur);APP.kid.avatar=js;sb("kids?id=eq."+APP.kid.id,{method:"PATCH",body:{avatar:js}}).catch(function(){});renderArmor();openCustomize();}
function openCustomize(){var host=document.getElementById("tab-warrior");if(!host)return;var ex=document.getElementById("wz-custom");if(ex){ex.remove();return;}var skins=["#ffe0bd","#f1c27d","#c68642","#8d5524"];var accents=["#6C52E3","#2f6fed","#00b070","#e04a3f","#f5c842","#e85aa0"];var cur={};try{var a=APP.kid.avatar;if(a&&a.charAt(0)==="{")cur=JSON.parse(a);}catch(e){}var p=document.createElement("div");p.id="wz-custom";p.style.cssText="background:rgba(255,255,255,.05);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:1rem;margin-bottom:1rem";var h="<div style='font-weight:900;margin-bottom:.5rem'>🎨 Customize Your Warrior</div><div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Skin</div><div style='display:flex;gap:.5rem;margin-bottom:.7rem'>";skins.forEach(function(c){h+="<button data-skin='"+c+"' style='width:38px;height:38px;border-radius:50%;border:3px solid "+((cur.skin||'#f1c27d')===c?'#f5c842':'rgba(255,255,255,.2)')+";background:"+c+";cursor:pointer'></button>";});h+="</div><div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Warrior Color</div><div style='display:flex;gap:.5rem;flex-wrap:wrap'>";accents.forEach(function(c){h+="<button data-accent='"+c+"' style='width:38px;height:38px;border-radius:50%;border:3px solid "+((cur.accent||'#6C52E3')===c?'#f5c842':'rgba(255,255,255,.2)')+";background:"+c+";cursor:pointer'></button>";});h+="</div>";p.innerHTML=h;host.insertBefore(p,host.children[3]||null);p.querySelectorAll("[data-skin]").forEach(function(b){b.addEventListener("click",function(){saveCustom("skin",b.getAttribute("data-skin"));});});p.querySelectorAll("[data-accent]").forEach(function(b){b.addEventListener("click",function(){saveCustom("accent",b.getAttribute("data-accent"));});});}
window.renderArmor=function(){var el=document.getElementById("tab-warrior");if(!el)return;var unlocked=APP.kid?getArmor(APP.kid):[];el.innerHTML="";var pts=APP.kid?(APP.kid.lifetime_points!=null?APP.kid.lifetime_points:(APP.kid.points||0)):0;var PIECES=[{id:"belt",label:"Belt of Truth",e:"🎗️",t:25},{id:"breastplate",label:"Breastplate of Righteousness",e:"🛡️",t:100},{id:"boots",label:"Gospel Boots",e:"🥾",t:250},{id:"shield",label:"Shield of Faith",e:"🛡️",t:500},{id:"helmet",label:"Helmet of Salvation",e:"⛑️",t:800},{id:"sword",label:"Sword of the Spirit",e:"⚔️",t:1200},{id:"full",label:"Full Armor of God",e:"✨",t:1800}];var has=function(id){return unlocked.indexOf(id)>=0;};var count=unlocked.filter(function(x){return x!=="full";}).length;var hdr=document.createElement("div");hdr.style.cssText="font-family:'Bangers',cursive;font-size:1.6rem;letter-spacing:.04em";hdr.textContent="Your Armor of God";var sub=document.createElement("div");sub.className="muted";sub.style.cssText="margin-bottom:.6rem;font-size:.78rem";sub.textContent=count+" of 6 pieces earned"+(has("full")?" — FULL ARMOR, warrior!":"");el.appendChild(hdr);el.appendChild(sub);var cbtn=document.createElement("button");cbtn.className="btn btn-dark";cbtn.style.cssText="font-size:.8rem;padding:.5rem .9rem;margin-bottom:.85rem;width:auto;display:inline-block";cbtn.textContent="🎨 Customize My Warrior";cbtn.addEventListener("click",openCustomize);el.appendChild(cbtn);var box=document.createElement("div");box.style.cssText="background:linear-gradient(160deg,#150a3a,#08132e);border:1.5px solid rgba(245,200,66,.2);border-radius:24px;padding:1rem;margin-bottom:1rem;text-align:center";box.innerHTML=armorSVG(has);el.appendChild(box);var next=null;for(var i=0;i<PIECES.length;i++){if(!has(PIECES[i].id)){next=PIECES[i];break;}}if(next){var prevT=0;for(var j=0;j<PIECES.length;j++){if(PIECES[j].id===next.id)break;prevT=PIECES[j].t;}var pctn=Math.max(0,Math.min(100,Math.round((pts-prevT)/(next.t-prevT)*100)));var prog=document.createElement("div");prog.style.cssText="margin-bottom:1rem";prog.innerHTML="<div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Next: "+next.e+" "+next.label+" ("+pts+" / "+next.t+")</div><div style='background:rgba(255,255,255,.08);border-radius:99px;height:9px;overflow:hidden'><div style='height:100%;width:"+pctn+"%;background:linear-gradient(90deg,#f5c842,#ff8c00);border-radius:99px'></div></div>";el.appendChild(prog);}var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.25rem";PIECES.forEach(function(a){if(a.id==="full")return;var on=has(a.id);var card=document.createElement("div");card.style.cssText="border-radius:18px;padding:.85rem .6rem;text-align:center;border:1.5px solid "+(on?"rgba(245,200,66,.4)":"rgba(255,255,255,.08)")+";background:"+(on?"rgba(245,200,66,.08)":"rgba(255,255,255,.03)");card.innerHTML="<div style='font-size:2rem;margin-bottom:.3rem"+(on?"":";filter:grayscale(1) opacity(.3)")+"'>"+a.e+"</div><div style='font-size:.66rem;font-weight:800;color:"+(on?"#fff":"rgba(255,255,255,.4)")+";line-height:1.2'>"+a.label+"</div><div style='font-size:.6rem;color:"+(on?"#f5c842":"rgba(255,255,255,.3)")+";margin-top:.2rem'>"+(on?"UNLOCKED":a.t+" pts")+"</div>";grid.appendChild(card);});el.appendChild(grid);el.appendChild(renderBadgesSection());};



/* ===== ranks (belonging) folded from patch layer (2026-07-19) ===== */
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
