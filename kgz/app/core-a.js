
var SUPA_URL="https://ktuapfiexhlladgkuauc.supabase.co";
var SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dWFwZmlleGhsbGFkZ2t1YXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjI0MTgsImV4cCI6MjA5NDA5ODQxOH0.Dp9OIWU_D8ioGaITj9_fVeVfIL9dYaGwRUK4hrJ_YVM";

var APP={kid:null,kids:[],storeItems:[],tab:"devos"};
var _pin=[];var _stack=[];
var CFG={
  checkin_pts:"10",quiz_pts_per_q:"5",tf_pts_per_q:"2",
  scramble_pts:"30",match_pts:"25",fitb_pts_per_q:"3",
  wheel_pts:"10",devo_pts:"10",checkin_enabled:"false"
};
function cfgN(k){return parseInt(CFG[k]||"0");}
function gameToday(){var d=new Date();d.setHours(0,0,0,0);return d.getTime();}
function gamePtsToday(cb){sb("transactions?kid_id=eq."+APP.kid.id+"&category=like.game_*&created_at=gte."+gameToday()+"&select=points").then(function(rows){var t=0;(rows||[]).forEach(function(x){t+=(x.points||0);});cb(t);}).catch(function(){cb(0);});}
function gameAward(pts,key){if(!APP.kid)return;var cap=cfgN("game_daily_max")||50;gamePtsToday(function(used){var room=cap-used;if(room<=0){toast("🎮 Daily game max reached ("+cap+" pts). Keep playing for fun, points reset tomorrow!",4500);return;}var grant=Math.min(pts,room);awardPts(grant,null,"game_"+key);toast("⚡ +"+grant+" pts!  ("+(used+grant)+"/"+cap+" today)",3500);});}
function saveConfig(k,v){
  CFG[k]=String(v);
  sb("app_config?key=eq."+k,{method:"PATCH",body:{value:String(v)},prefer:"return=representation"}).catch(function(){});
}

// ── NAV ──────────────────────────────────────────
function show(id){
  var cur=document.querySelector(".page.active");
  if(cur&&cur.id!==id) _stack.push(cur.id);
  document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active");p.style.display="none";});
  var el=document.getElementById(id);
  if(el){el.classList.add("active");el.style.display="block";}
  window.scrollTo(0,0);
}
function navBack(){if(_stack.length)show(_stack.pop());else show("p-land");}

// ── SUPABASE ─────────────────────────────────────
function sb(path,opts){
  opts=opts||{};
  var method=opts.method||"GET";
  var headers={"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY};
  if(opts.prefer)headers["Prefer"]=opts.prefer;
  if(opts.body)headers["Content-Type"]="application/json";
  return fetch(SUPA_URL+"/rest/v1/"+path,{
    method:method,headers:headers,
    body:opts.body?JSON.stringify(opts.body):undefined
  }).then(function(r){
    if(!r.ok)return r.text().then(function(t){throw new Error(t);});
    var ct=r.headers.get("content-type")||"";
    if(ct.indexOf("json")>=0)return r.json();
    return [];
  });
}

// ── TOAST ────────────────────────────────────────
function toast(msg,dur){
  var el=document.getElementById("toast");if(!el)return;
  el.textContent=msg;el.classList.add("show");
  setTimeout(function(){el.classList.remove("show");},dur||2500);
}

// ── SCORE BURST ──────────────────────────────────
function burst(pts,x,y){
  var el=document.createElement("div");el.className="score-burst";
  el.textContent="+"+pts+" pts!";
  el.style.left=(x||(window.innerWidth/2))+"px";
  el.style.top=(y||200)+"px";
  document.body.appendChild(el);
  setTimeout(function(){el.remove();},1300);
}

// ── PIN PAD ──────────────────────────────────────
function klTap(k){
  if(k==="del")_pin.pop();
  else if(_pin.length<4)_pin.push(String(k));
  document.querySelectorAll("#kl-dots .pin-dot").forEach(function(d,i){
    d.textContent=_pin[i]!==undefined?"●":"";
    _pin[i]!==undefined?d.classList.add("filled"):d.classList.remove("filled");
  });
}

// ── LOGIN ─────────────────────────────────────────
function doLogin(){
  var last=(document.getElementById("kl-last").value||"").trim();
  var err=document.getElementById("kl-err");err.textContent="";
  if(!last){err.textContent="Enter your last name!";return;}
  if(_pin.length!==4){err.textContent="Enter your 4-digit PIN!";return;}
  var pin=_pin.join("");err.textContent="Checking...";
  sb("kids?select=*&last_name=ilike."+encodeURIComponent(last)+"&pin=eq."+pin)
    .then(function(rows){
      if(!rows||!rows.length)throw new Error("No account found. Check your last name and PIN.");
      APP.kid=rows[0];_pin=[];err.textContent="";
      document.getElementById("kl-last").value="";
      document.querySelectorAll("#kl-dots .pin-dot").forEach(function(d){d.textContent="";d.classList.remove("filled");});
      openDash(APP.kid);
    }).catch(function(e){
      err.textContent=e.message||"Login failed.";_pin=[];
      document.querySelectorAll("#kl-dots .pin-dot").forEach(function(d){d.textContent="";d.classList.remove("filled");});
    });
}
function doLogout(){APP.kid=null;show("p-land");}

// ── ARMOR HELPER ─────────────────────────────────
/* getArmor: folded into the armor module at end of file */

// ── SUNDAY CHECK-IN ─────────────────────────────
function loadCheckinRoster(){
  var el=document.getElementById("checkin-roster");if(!el)return;
  el.innerHTML="<p class='muted'>Loading...</p>";
  var today=new Date().toISOString().split("T")[0];
  sb("sunday_checkins?select=*&date=eq."+today)
    .then(function(rows){
      if(!rows.length){el.innerHTML="<p class='muted'>No check-ins yet today ("+today+").</p>";return;}
      el.innerHTML="<div style='font-size:.72rem;font-weight:900;color:#f5c842;margin-bottom:.5rem'>"+rows.length+" warrior"+(rows.length!==1?"s":"")+" checked in today</div>";
      rows.forEach(function(r){
        var kid=ADM.kids.find(function(k){return k.id===r.kid_id;});
        var name=kid?kid.first_name+" "+kid.last_name:"Unknown ("+r.kid_id.slice(0,8)+")";
        var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;font-size:.78rem;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.06)";
        row.innerHTML="<span>⛪ "+name+"</span><span style='color:#f5c842;font-weight:900'>+"+r.pts_awarded+" pts</span>";
        el.appendChild(row);
      });
    }).catch(function(){el.innerHTML="<p class='muted'>Error loading roster.</p>";});
}

function updateCheckinBtn(){
  var enabled=CFG.checkin_enabled==="true";
  var banner=document.getElementById("checkin-banner");
  if(banner)banner.style.display=enabled?"block":"none";
  var ptsDsp=document.getElementById("checkin-pts-display");
  if(ptsDsp)ptsDsp.textContent=CFG.checkin_pts||"10";
}
function doCheckin(){
  if(!APP.kid){toast("Log in first to check in! Tap ⚔️ I'M A WARRIOR");show("p-klogin");return;}
  var today=new Date().toISOString().split("T")[0];
  // Check if already checked in today
  sb("sunday_checkins?kid_id=eq."+APP.kid.id+"&date=eq."+today)
    .then(function(rows){
      if(rows&&rows.length){toast("Already checked in today! ✅");return;}
      var pts=cfgN("checkin_pts")||10;
      sb("sunday_checkins",{method:"POST",body:{kid_id:APP.kid.id,date:today,pts_awarded:pts},prefer:"return=representation"})
        .then(function(){
          awardPts(pts);toast("⛪ Checked in! +"+pts+" pts! God is good!",4000);
        }).catch(function(){toast("Error checking in. Try again.");});
    }).catch(function(){toast("Error. Try again.");});
}

// ── AWARD POINTS ─────────────────────────────────
function awardPts(pts,evt,cat){
  if(!APP.kid||pts<=0)return;
  var np=(APP.kid.points||0)+pts;
  if(cat){sb("transactions",{method:"POST",body:{id:"t"+Date.now()+"_"+Math.floor(Math.random()*100000),kid_id:APP.kid.id,points:pts,category:cat,note:"auto",created_at:Date.now()}});}
  var nl=(APP.kid.lifetime_points!=null?APP.kid.lifetime_points:(APP.kid.points||0))+pts;
  sb("kids?id=eq."+APP.kid.id,{method:"PATCH",body:{points:np,lifetime_points:nl},prefer:"return=representation"})
    .then(function(){
      APP.kid.points=np;APP.kid.lifetime_points=nl;
      var dp=document.getElementById("dash-pts");if(dp)dp.textContent=np;
      var dp2=document.getElementById("dash-pts2");if(dp2)dp2.textContent=np;
      var armor=getArmor(APP.kid);
      var af=document.getElementById("armor-fill");if(af)af.style.width=Math.round((armor.length/7)*100)+"%";
      var ac=document.getElementById("armor-count");if(ac)ac.textContent=armor.length+"/7";
      var ap=document.getElementById("armor-pct");if(ap)ap.textContent=Math.round((armor.length/7)*100)+"%";
      burst(pts,evt?evt.clientX:null,evt?evt.clientY:null);
    }).catch(function(){});
}

// ── OPEN DASHBOARD ───────────────────────────────
function openDash(kid){
  document.getElementById("dash-name").textContent=kid.first_name||"Warrior";
  document.getElementById("dash-pts").textContent=kid.points||0;
  document.getElementById("dash-pts2").textContent=kid.points||0;
  var armor=getArmor(kid);
  var pct=Math.round((armor.length/7)*100);
  document.getElementById("armor-fill").style.width=pct+"%";
  document.getElementById("armor-count").textContent=armor.length+"/7";
  var pctEl=document.getElementById("armor-pct");if(pctEl)pctEl.textContent=pct+"%";
  // Next armor hint
  var ARMOR_NAMES=[{pts:10,name:"Belt of Truth"},{pts:50,name:"Breastplate"},{pts:100,name:"Boots of Peace"},{pts:200,name:"Shield of Faith"},{pts:350,name:"Helmet"},{pts:500,name:"Sword of the Spirit"},{pts:750,name:"Full Armor!"}];
  var next=ARMOR_NAMES.find(function(a){return (kid.points||0)<a.pts;});
  var nextEl=document.getElementById("hero-next-armor");
  if(nextEl&&next)nextEl.textContent="🎯 Next: "+next.name+" — "+(next.pts-(kid.points||0))+" more pts";
  else if(nextEl)nextEl.textContent="🏆 Full armor unlocked! You are complete!";
  // Show check-in button if enabled
  var dci=document.getElementById("dash-checkin-btn");
  if(dci)dci.style.display=CFG.checkin_enabled==="true"?"block":"none";
  show("p-dash");
  // Check for active announcements
  loadKidAnnouncements();
  // Sidebar shown/hidden by CSS @media rule
  dashTab("devos",document.querySelector(".tab-btn"));
  loadStore();loadRanks();
}

// ── TABS ─────────────────────────────────────────
function renderVideos(){
  var el=document.getElementById("tab-watch");if(!el)return;
  el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Loading...</p>";
  var grp=APP.kid?APP.kid.age_group:"812";
  sb("videos?active=eq.true&age_group=eq."+grp+"&order=sort_order.asc").then(function(rows){
    var done=(APP.kid&&APP.kid.completed_videos)?APP.kid.completed_videos:[];
    el.innerHTML="";
    var hdr=document.createElement("div");hdr.style.cssText="margin-bottom:1rem";
    hdr.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.7rem;letter-spacing:.04em'>🎬 Watch &amp; Learn</div><div class='muted'>New videos every week. Watch, answer one question, earn points. One time each.</div>";
    el.appendChild(hdr);
    if(!rows||!rows.length){var e=document.createElement("div");e.className="muted";e.style.cssText="text-align:center;padding:2rem";e.textContent="New videos coming soon, warrior!";el.appendChild(e);return;}
    rows.forEach(function(v){
      var isDone=done.indexOf(v.id)>=0;
      var row=document.createElement("div");row.className="devo-row";
      row.innerHTML="<div style='font-size:1.7rem'>"+(isDone?"✅":"🎬")+"</div><div style='flex:1'><div style='font-weight:900'>"+v.title+"</div><div class='muted' style='font-size:.72rem'>"+(v.topic||"")+"</div></div><div class='gold' style='font-weight:900;font-size:.8rem'>"+(isDone?"DONE":"+"+(v.points||25))+"</div>";
      row.addEventListener("click",function(){openVideo(v,isDone);});
      el.appendChild(row);
    });
  }).catch(function(){el.innerHTML="<p class='muted' style='text-align:center;padding:2rem'>Could not load videos.</p>";});
}
function openVideo(v,isDone){
  var el=document.getElementById("tab-watch");if(!el)return;
  el.innerHTML="";
  var back=document.createElement("button");back.className="back-btn";back.textContent="← back";back.addEventListener("click",renderVideos);el.appendChild(back);
  var t=document.createElement("div");t.style.cssText="font-family:Bangers,cursive;font-size:1.5rem;margin-bottom:.5rem";t.textContent=v.title;el.appendChild(t);
  var frame=document.createElement("div");frame.style.cssText="position:relative;width:100%;padding-bottom:56.25%;border-radius:16px;overflow:hidden;margin-bottom:1rem;background:#000";
  frame.innerHTML="<iframe src='https://www.youtube.com/embed/"+(v.youtube_id||"")+"' style='position:absolute;inset:0;width:100%;height:100%;border:0' allow='accelerometer;autoplay;encrypted-media;gyroscope;picture-in-picture' allowfullscreen></iframe>";
  el.appendChild(frame);
  if(isDone){var d=document.createElement("div");d.className="muted";d.style.cssText="text-align:center;padding:1rem";d.textContent="✅ Points already earned for this one. Watch again anytime!";el.appendChild(d);return;}
  var qwrap=document.createElement("div");qwrap.className="q-wrap";
  var qh=document.createElement("div");qh.className="q-text";qh.textContent=v.quiz_q||"Ready?";qwrap.appendChild(qh);
  var opts=document.createElement("div");opts.className="q-opts";
  (v.quiz_choices||[]).forEach(function(choice,idx){
    var o=document.createElement("button");o.className="q-opt";o.textContent=choice;
    o.addEventListener("click",function(){
      if(o.classList.contains("done"))return;
      if(idx===v.quiz_answer){o.classList.add("correct");o.classList.add("done");awardVideo(v);}
      else{o.classList.add("wrong");toast("Not quite! Watch again and try once more. 🎬",3500);}
    });
    opts.appendChild(o);
  });
  qwrap.appendChild(opts);el.appendChild(qwrap);
}
function videoWeekStart(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-d.getDay());return d.getTime();}
function videoPtsThisWeek(cb){sb("transactions?kid_id=eq."+APP.kid.id+"&category=eq.video&created_at=gte."+videoWeekStart()+"&select=points").then(function(rows){var t=0;(rows||[]).forEach(function(x){t+=(x.points||0);});cb(t);}).catch(function(){cb(0);});}
function awardVideo(v){
  if(!APP.kid)return;
  var done=APP.kid.completed_videos||[];
  if(done.indexOf(v.id)>=0){toast("Already earned! ✅");return;}
  var cap=(typeof cfgN==="function"?cfgN("video_weekly_max"):0)||50;
  videoPtsThisWeek(function(used){
    if(used>=cap){toast("🎬 You hit this week's video points max ("+cap+")! New videos and points next week.",4500);return;}
    var grant=Math.min(v.points||25,cap-used);
    var nd=done.concat([v.id]);
    sb("kids?id=eq."+APP.kid.id,{method:"PATCH",body:{completed_videos:nd},prefer:"return=representation"}).then(function(){
      APP.kid.completed_videos=nd;
      awardPts(grant,null,"video");
      toast("🎬 Correct! +"+grant+" points, warrior!",4000);
      setTimeout(renderVideos,1400);
    }).catch(function(){toast("Hmm, could not save. Try again in a moment.");});
  });
}
function initWatchTab(){
  if(document.getElementById("tab-watch"))return;
  var host=document.getElementById("tab-devos");if(!host||!host.parentElement)return;
  var c=document.createElement("div");c.id="tab-watch";c.style.display="none";host.parentElement.appendChild(c);
  var mb=document.querySelector(".tab-bar");
  if(mb&&!mb.querySelector("[data-watch]")){var b=document.createElement("button");b.className="tab-btn";b.setAttribute("data-watch","1");b.setAttribute("onclick","dashTab('watch',this)");b.innerHTML="<span class='ti'>🎬</span>Watch";mb.appendChild(b);}
  var sbn=document.getElementById("tab-sidebar-nav");
  if(sbn&&!sbn.querySelector("[data-watch]")){var b2=document.createElement("button");b2.className="tab-sidebar-btn";b2.setAttribute("data-watch","1");b2.setAttribute("onclick","dashTab('watch',this)");b2.innerHTML="<span class='ti'>🎬</span>Watch";sbn.appendChild(b2);}
}
if(document.readyState!=="loading")initWatchTab();else document.addEventListener("DOMContentLoaded",initWatchTab);
setTimeout(initWatchTab,1800);

function wzAdminAuth(body){return fetch("https://ktuapfiexhlladgkuauc.supabase.co/functions/v1/wz-admin-auth",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json();});}
function initAdminSecurity(){
  var host=document.getElementById("atab-settings");if(!host)return;
  if(document.getElementById("wz-adminsec"))return;
  var card=document.createElement("div");card.id="wz-adminsec";
  card.style.cssText="background:rgba(255,255,255,.06);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:1rem;margin-bottom:1rem";
  card.innerHTML="<div style='font-weight:900;margin-bottom:.35rem'>🔐 Admin Passphrase</div><div class='muted' id='wz-sec-status' style='margin-bottom:.6rem'>Checking...</div>";
  var btn=document.createElement("button");btn.className="btn btn-gold";btn.style.cssText="font-size:.9rem;padding:.7rem";btn.textContent="Set / Change Passphrase";
  function refreshSec(){wzAdminAuth({action:"status"}).then(function(st){var el=document.getElementById("wz-sec-status");if(el)el.textContent=(st&&st.set)?"A secure passphrase is set. It will replace the old admin PIN once lockdown is enabled.":"No secure passphrase set yet. Tap below to create one.";});}
  btn.addEventListener("click",function(){
    wzAdminAuth({action:"status"}).then(function(st){
      var cur=null;
      if(st&&st.set){cur=window.prompt("Enter CURRENT admin passphrase:");if(cur===null)return;}
      var np=window.prompt("Enter NEW admin passphrase (at least 6 characters):");if(np===null)return;
      wzAdminAuth({action:"set",passphrase:np,current:cur||undefined}).then(function(r){
        if(r&&r.ok){toast("🔐 Admin passphrase saved!");refreshSec();}
        else if(r&&r.error==="current_wrong"){toast("Current passphrase was wrong.");}
        else if(r&&r.error==="too_short"){toast("Passphrase must be at least 6 characters.");}
        else{toast("Could not save. Try again.");}
      });
    });
  });
  card.appendChild(btn);host.insertBefore(card,host.firstChild);
  refreshSec();
}
if(document.readyState!=="loading")initAdminSecurity();else document.addEventListener("DOMContentLoaded",initAdminSecurity);
setTimeout(initAdminSecurity,2000);
;/* --- WZ MEMORY VERSE + STREAK --- */
window.wzSyncKid=function(res){if(res&&typeof res.points==="number"){APP.kid.points=res.points;if(typeof res.lifetime_points==="number")APP.kid.lifetime_points=res.lifetime_points;if(typeof res.streak==="number")APP.kid.streak_count=res.streak;if(typeof wzUI==="function")wzUI();wzUpdateStreak();if(res.streakBonus>0){setTimeout(function(){toast("🔥 "+res.streak+"-day streak! +"+res.streakBonus+" bonus points!",4500);},1400);}}};
function wzUpdateStreak(){var el=document.getElementById("wz-streak");if(!el||!APP.kid)return;var s=APP.kid.streak_count||0;if(s>0){el.style.display="";el.textContent="🔥 "+s;}else{el.style.display="none";}}
/* renderVerse: folded into the Verse Builder module at end of file */
function versePractice(el,v,done){var words=v.text.split(" ");var state={level:0};var card=document.createElement("div");card.className="q-wrap";var ref=document.createElement("div");ref.style.cssText="font-family:Bangers,cursive;font-size:1.2rem;color:#f5c842;margin-bottom:.6rem;text-align:center";ref.textContent=v.reference;var body=document.createElement("div");body.style.cssText="font-size:1.15rem;line-height:1.9;text-align:center;min-height:90px;margin-bottom:1rem;color:#E8E4F0";card.appendChild(ref);card.appendChild(body);function render(){var hc=Math.round(words.length*state.level/4);var hid={};if(hc>0){var st=words.length/hc;for(var i=0;i<hc;i++){hid[Math.floor(i*st)]=1;}}if(state.level>=4){for(var k=0;k<words.length;k++)hid[k]=1;}body.innerHTML=words.map(function(w,i){return hid[i]?"<span style='color:#6C52E3;font-weight:900'>____</span>":w;}).join(" ");}render();var prog=document.createElement("div");prog.className="muted";prog.style.cssText="text-align:center;margin-bottom:.8rem;font-size:.75rem";function up(){prog.textContent=state.level>=4?"Now say it from memory!":("Level "+state.level+" of 4");}up();card.appendChild(prog);if(done){var d=document.createElement("div");d.className="muted";d.style.cssText="text-align:center;padding:.5rem";d.textContent="✅ You memorized this one! Keep practicing anytime.";card.appendChild(d);el.appendChild(card);return;}var rowb=document.createElement("div");rowb.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem";var less=document.createElement("button");less.className="btn btn-dark";less.textContent="↺ Show all";var more=document.createElement("button");more.className="btn btn-gold";more.textContent="Hide more →";less.addEventListener("click",function(){state.level=0;render();up();more.textContent="Hide more →";});more.addEventListener("click",function(){if(state.level<4){state.level++;render();up();if(state.level>=4){more.textContent="✅ I said it! (+"+(v.points||20)+")";}return;}awardVerse(v);});rowb.appendChild(less);rowb.appendChild(more);card.appendChild(rowb);el.appendChild(card);}
function awardVerse(v){if(!APP.kid)return;wzPost("wz-award",{action:"verse",kidId:APP.kid.id,pin:APP.kid.pin,key:v.id}).then(function(res){if(res&&res.ok){if(res.granted>0){wzSyncKid(res);var d=APP.kid.completed_verses||[];if(d.indexOf(v.id)<0)APP.kid.completed_verses=d.concat([v.id]);toast("📜 Memorized! +"+res.granted+" points, warrior!",4000);setTimeout(renderVerse,1500);}else if(res.already){toast("Already memorized! ✅");}else{wzSyncKid(res);toast("📜 Great job!");}}else{toast("Could not save. Try again.");}}).catch(function(){toast("Could not save. Try again.");});}
function initVerseTab(){if(!document.getElementById("tab-verse")){var host=document.getElementById("tab-devos");if(host&&host.parentElement){var c=document.createElement("div");c.id="tab-verse";c.style.display="none";host.parentElement.appendChild(c);}var mb=document.querySelector(".tab-bar");if(mb&&!mb.querySelector("[data-verse]")){var bx=document.createElement("button");bx.className="tab-btn";bx.setAttribute("data-verse","1");bx.setAttribute("onclick","dashTab('verse',this)");bx.innerHTML="<span class='ti'>📜</span>Verse";mb.appendChild(bx);}var sbn=document.getElementById("tab-sidebar-nav");if(sbn&&!sbn.querySelector("[data-verse]")){var b2=document.createElement("button");b2.className="tab-sidebar-btn";b2.setAttribute("data-verse","1");b2.setAttribute("onclick","dashTab('verse',this)");b2.innerHTML="<span class='ti'>📜</span>Verse";sbn.appendChild(b2);}}if(!document.getElementById("wz-streak")){var pill=document.querySelector(".pts-pill");if(pill&&pill.parentElement){var chip=document.createElement("span");chip.id="wz-streak";chip.style.cssText="background:rgba(255,107,26,.15);border:1.5px solid rgba(255,107,26,.4);color:#FF6B1A;font-family:'Bangers',cursive;letter-spacing:.04em;font-size:.85rem;padding:4px 12px;border-radius:99px;margin-right:6px";pill.parentElement.insertBefore(chip,pill);}}wzUpdateStreak();}
if(document.readyState!=="loading")initVerseTab();else document.addEventListener("DOMContentLoaded",initVerseTab);
setTimeout(initVerseTab,2000);setInterval(wzUpdateStreak,3000);
;/* --- WZ VISUAL ARMOR + BADGES --- */
function armorSVG(has){var gold="url(#agold)";function pc(on,o){return on?gold:o;}var full=has("full");return "<svg viewBox='0 0 200 260' width='170' style='max-width:72%'>"+"<defs><linearGradient id='agold' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffe08a'/><stop offset='1' stop-color='#E09000'/></linearGradient><radialGradient id='aura'><stop offset='0' stop-color='rgba(245,200,66,.45)'/><stop offset='1' stop-color='rgba(245,200,66,0)'/></radialGradient></defs>"+(full?"<circle cx='100' cy='130' r='125' fill='url(#aura)'/>":"")+"<rect x='84' y='168' width='13' height='62' rx='6' fill='#141433'/><rect x='103' y='168' width='13' height='62' rx='6' fill='#141433'/><rect x='58' y='100' width='13' height='58' rx='6' fill='#141433'/><rect x='129' y='100' width='13' height='58' rx='6' fill='#141433'/><rect x='74' y='92' width='52' height='84' rx='16' fill='#1e1e44'/><circle cx='100' cy='62' r='21' fill='#2c2c52'/>"+"<rect x='84' y='206' width='13' height='24' rx='5' fill='"+pc(has('boots'),'#0e0e28')+"'/><rect x='103' y='206' width='13' height='24' rx='5' fill='"+pc(has('boots'),'#0e0e28')+"'/>"+"<path d='M76,96 h48 a12,12 0 0,1 12,12 v34 a14,14 0 0,1 -14,14 h-44 a14,14 0 0,1 -14,-14 v-34 a12,12 0 0,1 12,-12 z' fill='"+pc(has('breastplate'),'rgba(255,255,255,.04)')+"' stroke='"+(has('breastplate')?'#b06f00':'rgba(255,255,255,.08)')+"' stroke-width='1.5'/>"+(has('breastplate')?"<line x1='100' y1='98' x2='100' y2='150' stroke='#b06f00' stroke-width='1.5'/>":"")+"<rect x='72' y='150' width='56' height='13' rx='4' fill='"+pc(has('belt'),'rgba(255,255,255,.05)')+"'/>"+(has('belt')?"<rect x='94' y='151' width='12' height='11' rx='2' fill='#8a5600'/>":"")+"<path d='M79,64 a21,21 0 0,1 42,0 v2 h-6 l-3,-10 a17,17 0 0,0 -21,0 l-3,10 h-6 z' fill='"+pc(has('helmet'),'rgba(255,255,255,.05)')+"'/>"+(has('helmet')?"<rect x='97' y='50' width='6' height='16' rx='2' fill='#b06f00'/>":"")+"<path d='M40,120 q14,-8 26,0 v20 q0,18 -13,26 q-13,-8 -13,-26 z' fill='"+pc(has('shield'),'rgba(255,255,255,.04)')+"' stroke='"+(has('shield')?'#b06f00':'rgba(255,255,255,.08)')+"' stroke-width='1.5'/>"+(has('shield')?"<path d='M53,124 v30 M44,138 h18' stroke='#fff' stroke-width='2.5' stroke-linecap='round' opacity='.85'/>":"")+"<rect x='143' y='86' width='5' height='66' rx='2' fill='"+(has('sword')?'#e8ecf5':'rgba(255,255,255,.06)')+"'/><rect x='135' y='150' width='21' height='6' rx='2' fill='"+(has('sword')?gold:'rgba(255,255,255,.06)')+"'/><rect x='143' y='154' width='5' height='12' rx='2' fill='"+(has('sword')?'#8a5600':'rgba(255,255,255,.06)')+"'/>"+"</svg>";}
function renderBadgesSection(){var K=APP.kid||{};var wrap=document.createElement("div");var h=document.createElement("div");h.style.cssText="font-family:'Bangers',cursive;font-size:1.4rem;letter-spacing:.04em;margin-bottom:.6rem";h.textContent="🏅 Badges";wrap.appendChild(h);var mc=(K.completed_missions||[]).length,vc=(K.completed_videos||[]).length,wc=(K.completed_verses||[]).length,dc=(K.completed_devos||[]).length,bs=K.best_streak||0;var B=[{e:"🛡️",label:"Defender",val:mc,tiers:[1,3,6],unit:"missions"},{e:"🎬",label:"Truth Seeker",val:vc,tiers:[1,3,6],unit:"videos"},{e:"📜",label:"Word Warrior",val:wc,tiers:[1,3,5],unit:"verses"},{e:"📖",label:"Faithful Reader",val:dc,tiers:[3,7,15],unit:"devos"},{e:"🔥",label:"Faithful",val:bs,tiers:[3,7,30],unit:"day streak"}];var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem";B.forEach(function(b){var earned=b.tiers.filter(function(t){return b.val>=t;}).length;var on=earned>0;var nextTier=b.tiers[earned]||null;var stars="";for(var i=0;i<3;i++){stars+=(i<earned)?"⭐":"<span style='opacity:.2'>⭐</span>";}var card=document.createElement("div");card.style.cssText="border-radius:16px;padding:.8rem .6rem;text-align:center;border:1.5px solid "+(on?"rgba(245,200,66,.35)":"rgba(255,255,255,.08)")+";background:"+(on?"rgba(245,200,66,.07)":"rgba(255,255,255,.03)");card.innerHTML="<div style='font-size:1.9rem"+(on?"":";filter:grayscale(1) opacity(.35)")+"'>"+b.e+"</div><div style='font-size:.72rem;font-weight:900;color:"+(on?"#fff":"rgba(255,255,255,.45)")+"'>"+b.label+"</div><div style='font-size:.7rem;margin:.15rem 0'>"+stars+"</div><div style='font-size:.58rem;color:rgba(255,255,255,.4)'>"+(nextTier?(b.val+"/"+nextTier+" "+b.unit):"Maxed! 🎉")+"</div>";grid.appendChild(card);});wrap.appendChild(grid);return wrap;}
function renderArmor(){var el=document.getElementById("tab-warrior");if(!el)return;var unlocked=APP.kid?getArmor(APP.kid):[];el.innerHTML="";var pts=APP.kid?(APP.kid.lifetime_points!=null?APP.kid.lifetime_points:(APP.kid.points||0)):0;var PIECES=[{id:"belt",label:"Belt of Truth",e:"🎗️",t:25},{id:"breastplate",label:"Breastplate of Righteousness",e:"🛡️",t:100},{id:"boots",label:"Gospel Boots",e:"🥾",t:250},{id:"shield",label:"Shield of Faith",e:"🛡️",t:500},{id:"helmet",label:"Helmet of Salvation",e:"⛑️",t:800},{id:"sword",label:"Sword of the Spirit",e:"⚔️",t:1200},{id:"full",label:"Full Armor of God",e:"✨",t:1800}];var has=function(id){return unlocked.indexOf(id)>=0;};var count=unlocked.filter(function(x){return x!=="full";}).length;var hdr=document.createElement("div");hdr.style.cssText="font-family:'Bangers',cursive;font-size:1.6rem;letter-spacing:.04em";hdr.textContent="Your Armor of God";var sub=document.createElement("div");sub.className="muted";sub.style.cssText="margin-bottom:.85rem;font-size:.78rem";sub.textContent=count+" of 6 pieces earned"+(has("full")?" — FULL ARMOR, warrior!":"");el.appendChild(hdr);el.appendChild(sub);var box=document.createElement("div");box.style.cssText="background:linear-gradient(160deg,#150a3a,#08132e);border:1.5px solid rgba(245,200,66,.2);border-radius:24px;padding:1rem;margin-bottom:1rem;text-align:center";box.innerHTML=armorSVG(has);el.appendChild(box);var next=null;for(var i=0;i<PIECES.length;i++){if(!has(PIECES[i].id)){next=PIECES[i];break;}}if(next){var prevT=0;for(var j=0;j<PIECES.length;j++){if(PIECES[j].id===next.id)break;prevT=PIECES[j].t;}var pctn=Math.max(0,Math.min(100,Math.round((pts-prevT)/(next.t-prevT)*100)));var prog=document.createElement("div");prog.style.cssText="margin-bottom:1rem";prog.innerHTML="<div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Next: "+next.e+" "+next.label+" ("+pts+" / "+next.t+")</div><div style='background:rgba(255,255,255,.08);border-radius:99px;height:9px;overflow:hidden'><div style='height:100%;width:"+pctn+"%;background:linear-gradient(90deg,#f5c842,#ff8c00);border-radius:99px'></div></div>";el.appendChild(prog);}var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.25rem";PIECES.forEach(function(a){if(a.id==="full")return;var on=has(a.id);var card=document.createElement("div");card.style.cssText="border-radius:18px;padding:.85rem .6rem;text-align:center;border:1.5px solid "+(on?"rgba(245,200,66,.4)":"rgba(255,255,255,.08)")+";background:"+(on?"rgba(245,200,66,.08)":"rgba(255,255,255,.03)");card.innerHTML="<div style='font-size:2rem;margin-bottom:.3rem"+(on?"":";filter:grayscale(1) opacity(.3)")+"'>"+a.e+"</div><div style='font-size:.66rem;font-weight:800;color:"+(on?"#fff":"rgba(255,255,255,.4)")+";line-height:1.2'>"+a.label+"</div><div style='font-size:.6rem;color:"+(on?"#f5c842":"rgba(255,255,255,.3)")+";margin-top:.2rem'>"+(on?"UNLOCKED":a.t+" pts")+"</div>";grid.appendChild(card);});el.appendChild(grid);el.appendChild(renderBadgesSection());}
;/* --- WZ FOLLOW JESUS --- */
function renderJesus(){var el=document.getElementById("tab-jesus");if(!el)return;var already=APP.kid&&APP.kid._decided;el.innerHTML="";var steps=[{t:"God Made You and Loves You",b:"You are not an accident. God made you on purpose, and He loves you more than you can imagine.",v:"“For God so loved the world, that he gave his only Son.” John 3:16"},{t:"But We All Do Wrong",b:"Every one of us has done wrong things. The Bible calls it sin, and it pulls us away from God.",v:"“For all have sinned and fall short of the glory of God.” Romans 3:23"},{t:"Jesus Came to Rescue You",b:"Because He loves you, Jesus died on the cross for your sin and rose from the dead. He opened the way back to God.",v:"“God shows his love for us in that while we were still sinners, Christ died for us.” Romans 5:8"},{t:"It Is a Gift",b:"You do not have to be good enough first. Following Jesus is a free gift. You receive it and trust Him.",v:"“For by grace you have been saved through faith. It is the gift of God.” Ephesians 2:8"}];var hdr=document.createElement("div");hdr.style.cssText="text-align:center;margin-bottom:1rem";hdr.innerHTML="<div style='font-size:2.4rem'>✝️</div><div style='font-family:Bangers,cursive;font-size:1.9rem;letter-spacing:.04em'>Do You Want to Follow Jesus?</div>";el.appendChild(hdr);steps.forEach(function(s,i){var c=document.createElement("div");c.className="q-wrap";c.style.cssText="margin-bottom:.8rem;padding:1.1rem";c.innerHTML="<div style='font-family:Bangers,cursive;font-size:1.15rem;color:#f5c842;margin-bottom:.35rem'>"+(i+1)+". "+s.t+"</div><div style='font-size:.95rem;line-height:1.6;color:#E8E4F0;margin-bottom:.5rem'>"+s.b+"</div><div class='muted' style='font-size:.78rem;font-style:italic'>"+s.v+"</div>";el.appendChild(c);});var pray=document.createElement("div");pray.style.cssText="background:rgba(245,200,66,.08);border:1.5px solid rgba(245,200,66,.3);border-radius:16px;padding:1rem;margin-bottom:1rem";pray.innerHTML="<div style='font-weight:900;margin-bottom:.4rem'>A prayer you can pray:</div><div style='font-size:.95rem;line-height:1.6;font-style:italic;color:#E8E4F0'>“Jesus, thank You for loving me. I am sorry for the wrong I have done. I believe You died and rose again for me. I want to follow You. Be my Savior and my King. Amen.”</div>";el.appendChild(pray);if(already){var dn=document.createElement("div");dn.style.cssText="text-align:center;padding:1rem;color:#00E5A0;font-weight:900";dn.textContent="✅ You said yes to Jesus! We are celebrating with you. 🎉";el.appendChild(dn);}else{var btn=document.createElement("button");btn.className="btn btn-gold";btn.textContent="✝️ I prayed this — I want to follow Jesus!";btn.addEventListener("click",function(){recordDecision();});el.appendChild(btn);var q=document.createElement("div");q.className="muted";q.style.cssText="text-align:center;margin-top:.8rem;font-size:.8rem";q.textContent="Have questions? That is great! Talk to Pastor Billy or a leader — they would love to help.";el.appendChild(q);}}
function recordDecision(){if(!APP.kid){toast("Log in first, warrior!");return;}var id="d"+Date.now()+"_"+APP.kid.id;sb("decisions",{method:"POST",body:{id:id,kid_id:APP.kid.id,kid_name:((APP.kid.first_name||"")+" "+(APP.kid.last_name||"")).trim(),age_group:APP.kid.age_group||"",type:"follow_jesus",followed_up:false,created_at:Date.now()},prefer:"return=representation"}).then(function(){APP.kid._decided=true;toast("🎉 Heaven is celebrating! A leader will celebrate with you soon.",5000);renderJesus();}).catch(function(){APP.kid._decided=true;toast("🎉 So glad! Be sure to tell a leader too.",5000);renderJesus();});}
function initJesusTab(){if(document.getElementById("tab-jesus"))return;var host=document.getElementById("tab-devos");if(!host||!host.parentElement)return;var c=document.createElement("div");c.id="tab-jesus";c.style.display="none";host.parentElement.appendChild(c);var mb=document.querySelector(".tab-bar");if(mb&&!mb.querySelector("[data-jesus]")){var b=document.createElement("button");b.className="tab-btn";b.setAttribute("data-jesus","1");b.setAttribute("onclick","dashTab('jesus',this)");b.innerHTML="<span class='ti'>✝️</span>Jesus";mb.insertBefore(b,mb.firstChild);}var sbn=document.getElementById("tab-sidebar-nav");if(sbn&&!sbn.querySelector("[data-jesus]")){var b2=document.createElement("button");b2.className="tab-sidebar-btn";b2.setAttribute("data-jesus","1");b2.setAttribute("onclick","dashTab('jesus',this)");b2.innerHTML="<span class='ti'>✝️</span>Jesus";sbn.insertBefore(b2,sbn.firstChild);}}
function initDecisionsAdmin(){var host=document.getElementById("atab-settings");if(!host||document.getElementById("wz-decisions"))return;var card=document.createElement("div");card.id="wz-decisions";card.style.cssText="background:rgba(0,229,160,.06);border:1px solid rgba(0,229,160,.3);border-radius:16px;padding:1rem;margin-bottom:1rem";card.innerHTML="<div style='font-weight:900;margin-bottom:.5rem'>🙌 Faith Decisions</div><div id='wz-dec-list' class='muted' style='font-size:.82rem'>Kids who said yes to Jesus will show here.</div>";var btn=document.createElement("button");btn.className="btn btn-dark";btn.style.cssText="font-size:.85rem;padding:.6rem;margin-top:.5rem";btn.textContent="Load decisions";btn.addEventListener("click",loadDecisions);card.appendChild(btn);host.insertBefore(card,host.firstChild);loadDecisions();}
function loadDecisions(){var el=document.getElementById("wz-dec-list");if(!el)return;el.textContent="Loading...";sb("decisions?order=created_at.desc&limit=50").then(function(rows){if(!rows||!rows.length){el.textContent="No decisions yet.";return;}el.innerHTML="";rows.forEach(function(d){var r=document.createElement("div");r.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.07)";var dt=new Date(d.created_at||0);r.innerHTML="<div><div style='font-weight:800;color:#fff'>"+(d.kid_name||"A warrior")+(d.followed_up?" ✅":"")+"</div><div class='muted' style='font-size:.7rem'>said yes "+dt.toLocaleDateString()+"</div></div>";if(!d.followed_up){var cb=document.createElement("button");cb.className="btn btn-dark";cb.style.cssText="font-size:.7rem;padding:.35rem .6rem;width:auto";cb.textContent="Mark celebrated";cb.addEventListener("click",function(){sb("decisions?id=eq."+d.id,{method:"PATCH",body:{followed_up:true}}).then(loadDecisions);});r.appendChild(cb);}el.appendChild(r);});}).catch(function(){el.textContent="Could not load.";});}
if(document.readyState!=="loading")initJesusTab();else document.addEventListener("DOMContentLoaded",initJesusTab);
setTimeout(function(){initJesusTab();initDecisionsAdmin();},2000);setInterval(initDecisionsAdmin,4000);
;/* --- WZ LISTEN (read-aloud) --- */
function wzSpeak(text){if(!('speechSynthesis' in window)){toast("Listening is not available on this device.");return false;}speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.rate=0.92;u.pitch=1.05;u.volume=1;speechSynthesis.speak(u);return true;}
function wzActiveText(){var ov=[].slice.call(document.querySelectorAll('div')).filter(function(d){var s=getComputedStyle(d);return s.position==='fixed'&&(parseInt(s.zIndex)||0)>=9990&&d.offsetHeight>200&&d.innerText&&d.innerText.length>40;});var src=ov.length?ov[ov.length-1]:(document.getElementById("tab-"+(APP.tab||""))||document.querySelector(".page.active"));var t=src?(src.innerText||""):"";return t.replace(/\bListen\b|\bStop\b/g,"").replace(/\s+/g," ").trim().slice(0,1600);}
function wzListenInit(){if(document.getElementById("wz-listen"))return;var b=document.createElement("button");b.id="wz-listen";b.style.cssText="position:fixed;bottom:82px;right:14px;z-index:9000;background:linear-gradient(135deg,#6C52E3,#3d1080);color:#fff;border:1.5px solid rgba(255,255,255,.25);border-radius:99px;padding:.55rem .85rem;font-weight:900;font-size:.78rem;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer;display:none";b.innerHTML="🔊 Listen";b.addEventListener("click",function(){if(window.speechSynthesis&&speechSynthesis.speaking){speechSynthesis.cancel();b.innerHTML="🔊 Listen";return;}var t=wzActiveText();if(!t||t.length<12){toast("Open a devo, verse, or lesson to listen.");return;}if(wzSpeak(t))b.innerHTML="⏹ Stop";});document.body.appendChild(b);setInterval(function(){b.style.display=(window.APP&&APP.kid)?"block":"none";if(window.speechSynthesis&&!speechSynthesis.speaking&&b.innerHTML.indexOf("Stop")>=0)b.innerHTML="🔊 Listen";},1000);}
if(document.readyState!=="loading")wzListenInit();else document.addEventListener("DOMContentLoaded",wzListenInit);
setTimeout(wzListenInit,2200);
;/* --- WZ DAILY NUDGE --- */
function wzNudge(){if(!(window.APP&&APP.kid)||APP._nudged)return;var today=new Date().toISOString().slice(0,10);if(APP.kid.last_active!==today){APP._nudged=true;setTimeout(function(){if(typeof toast==="function")toast("🔥 Keep your streak alive, warrior! Do today's verse or a devo.",6000);},3500);}}
setInterval(wzNudge,3000);
;/* WZ WARRIOR v4 (safe inject) */
window.wzGender=function(){try{var a=APP.kid&&APP.kid.avatar;if(a&&a.charAt(0)==="{"){var o=JSON.parse(a);if(o.gender)return o.gender;}}catch(e){}var g=((APP.kid&&APP.kid.gender)||"").toLowerCase();if(g.charAt(0)==="f"||g==="girl")return "girl";return "boy";};
setTimeout(function(){
window.armorSVG=function(has){var skin=wzSkin(),accent=wzAccent(),gender=wzGender(),full=has("full");var hair=(gender==="girl")?"#6b4423":"#3a2416";var GD="url(#ggold)";var s="<svg viewBox='0 0 220 320' width='190' style='max-width:84%'>";s+="<defs><linearGradient id='ggold' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffe9a0'/><stop offset='.5' stop-color='#f5c842'/><stop offset='1' stop-color='#c67a00'/></linearGradient><linearGradient id='gcape' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='"+accent+"'/><stop offset='1' stop-color='#0a0620'/></linearGradient><radialGradient id='gaura'><stop offset='0' stop-color='rgba(245,200,66,.55)'/><stop offset='1' stop-color='rgba(245,200,66,0)'/></radialGradient><radialGradient id='gskin' cx='.4' cy='.35'><stop offset='0' stop-color='"+skin+"'/><stop offset='1' stop-color='#0000001f'/></radialGradient></defs>";if(full)s+="<circle cx='110' cy='165' r='150' fill='url(#gaura)'/>";if(has('breastplate')||full)s+="<path d='M78,120 q32,-16 64,0 l20,150 q-52,22 -104,0 z' fill='url(#gcape)'/><path d='M110,122 v148' stroke='#00000033' stroke-width='2'/>";s+="<path d='M92,210 h16 l-2,52 h-12 z' fill='#2b2036'/><path d='M112,210 h16 l-2,52 h-12 z' fill='#2b2036'/>";s+="<path d='M88,254 h22 l2,20 q-13,6 -26,0 z' fill='"+(has('boots')?GD:'#171026')+"' stroke='"+(has('boots')?'#a86a00':'none')+"' stroke-width='1.5'/><path d='M110,254 h22 l2,20 q-13,6 -26,0 z' fill='"+(has('boots')?GD:'#171026')+"' stroke='"+(has('boots')?'#a86a00':'none')+"' stroke-width='1.5'/>";s+="<rect x='62' y='132' width='18' height='58' rx='9' fill='"+accent+"'/><rect x='140' y='132' width='18' height='58' rx='9' fill='"+accent+"'/>";if(has('breastplate'))s+="<rect x='60' y='176' width='22' height='16' rx='6' fill='"+GD+"'/><rect x='138' y='176' width='22' height='16' rx='6' fill='"+GD+"'/>";s+="<circle cx='71' cy='198' r='10' fill='"+skin+"'/><circle cx='149' cy='198' r='10' fill='"+skin+"'/>";s+="<path d='M80,126 q30,-10 60,0 l6,74 q-36,14 -72,0 z' fill='"+accent+"'/>";s+="<path d='M82,130 q28,-9 56,0 l5,62 q-33,12 -66,0 z' fill='"+(has('breastplate')?GD:'rgba(255,255,255,.06)')+"' stroke='"+(has('breastplate')?'#a86a00':'rgba(255,255,255,.12)')+"' stroke-width='2'/>";if(has('breastplate'))s+="<path d='M110,132 v58' stroke='#a86a00' stroke-width='2'/><ellipse cx='84' cy='134' rx='16' ry='12' fill='"+GD+"' stroke='#a86a00' stroke-width='1.5'/><ellipse cx='136' cy='134' rx='16' ry='12' fill='"+GD+"' stroke='#a86a00' stroke-width='1.5'/><circle cx='110' cy='158' r='11' fill='#fff4cf' stroke='#a86a00' stroke-width='1.5'/><path d='M110,151 v14 M103,158 h14' stroke='#a86a00' stroke-width='2.4'/>";s+="<path d='M78,192 q32,10 64,0 l-2,14 q-30,9 -60,0 z' fill='"+(has('belt')?GD:'rgba(255,255,255,.06)')+"'/>";if(has('belt'))s+="<rect x='102' y='193' width='16' height='13' rx='3' fill='#8a5600'/>";s+="<rect x='102' y='104' width='16' height='16' fill='"+skin+"'/>";if(gender==="girl")s+="<path d='M140,72 q28,22 16,64 q-10,10 -18,2 q12,-32 -6,-58 z' fill='"+hair+"'/>";s+="<circle cx='110' cy='80' r='36' fill='url(#gskin)'/>";if(gender==="girl")s+="<path d='M73,84 q-5,-46 37,-48 q42,2 37,48 q-9,-22 -37,-22 q-28,0 -37,22 z' fill='"+hair+"'/>";else s+="<path d='M75,74 q3,-35 35,-35 q32,0 35,35 q-11,-17 -35,-17 q-24,0 -35,17 z' fill='"+hair+"'/>";s+="<circle cx='98' cy='81' r='4.6' fill='#2a1a12'/><circle cx='122' cy='81' r='4.6' fill='#2a1a12'/><circle cx='99.6' cy='79.3' r='1.6' fill='#fff'/><circle cx='123.6' cy='79.3' r='1.6' fill='#fff'/>";s+="<path d='M92,71 q6,-4 12,-1 M116,71 q6,-3 12,1' stroke='"+hair+"' stroke-width='2.4' fill='none' stroke-linecap='round'/>";s+="<path d='M99,95 q11,9 22,0' stroke='#b5654a' stroke-width='3' fill='none' stroke-linecap='round'/>";s+="<circle cx='88' cy='91' r='5' fill='#ff9a9a' opacity='.4'/><circle cx='132' cy='91' r='5' fill='#ff9a9a' opacity='.4'/>";if(has('helmet'))s+="<path d='M72,78 a38,38 0 0,1 76,0 v4 h-12 l-3,-18 a30,30 0 0,0 -46,0 l-3,18 h-12 z' fill='"+GD+"' stroke='#a86a00' stroke-width='1.5'/><path d='M104,42 q6,-9 12,0 l-2,16 h-8 z' fill='#e04a3f'/>";s+="<path d='M40,150 q16,-10 30,0 v22 q0,20 -15,30 q-15,-10 -15,-30 z' fill='"+(has('shield')?GD:'rgba(255,255,255,.05)')+"' stroke='"+(has('shield')?'#a86a00':'rgba(255,255,255,.12)')+"' stroke-width='2.5'/>";if(has('shield'))s+="<path d='M55,158 v34 M42,172 h26' stroke='#fff' stroke-width='3.5' stroke-linecap='round' opacity='.9'/>";s+="<rect x='166' y='118' width='7' height='82' rx='3' fill='"+(has('sword')?'#f0f4ff':'rgba(255,255,255,.07)')+"'/><rect x='166' y='118' width='3' height='82' fill='"+(has('sword')?'#c9d4ee':'transparent')+"'/><rect x='156' y='116' width='27' height='8' rx='3' fill='"+(has('sword')?GD:'rgba(255,255,255,.07)')+"'/><rect x='166' y='198' width='7' height='14' rx='3' fill='"+(has('sword')?'#a86a00':'rgba(255,255,255,.07)')+"'/>";s+="</svg>";return s;};

window.openCustomize=function(){var host=document.getElementById("tab-warrior");if(!host)return;var ex=document.getElementById("wz-custom");if(ex){ex.remove();return;}var cur={};try{var a=APP.kid.avatar;if(a&&a.charAt(0)==="{")cur=JSON.parse(a);}catch(e){}var g=cur.gender||(((APP.kid&&APP.kid.gender)||"").toLowerCase().charAt(0)==="f"?"girl":"boy");var skins=["#ffe0bd","#f1c27d","#c68642","#8d5524"];var accents=["#6C52E3","#2f6fed","#00b070","#e04a3f","#f5c842","#e85aa0"];var p=document.createElement("div");p.id="wz-custom";p.style.cssText="background:rgba(255,255,255,.05);border:1px solid rgba(245,200,66,.3);border-radius:16px;padding:1rem;margin-bottom:1rem";var h="<div style='font-weight:900;margin-bottom:.5rem'>🎨 Customize Your Warrior</div><div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Warrior</div><div style='display:flex;gap:.5rem;margin-bottom:.7rem'>";h+="<button data-gender='boy' style='flex:1;padding:.55rem;border-radius:12px;border:2px solid "+(g==="boy"?"#f5c842":"rgba(255,255,255,.2)")+";background:rgba(255,255,255,.06);color:#fff;font-weight:800;cursor:pointer'>🛡️ Boy</button>";h+="<button data-gender='girl' style='flex:1;padding:.55rem;border-radius:12px;border:2px solid "+(g==="girl"?"#f5c842":"rgba(255,255,255,.2)")+";background:rgba(255,255,255,.06);color:#fff;font-weight:800;cursor:pointer'>🛡️ Girl</button></div>";h+="<div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Skin</div><div style='display:flex;gap:.5rem;margin-bottom:.7rem'>";skins.forEach(function(c){h+="<button data-skin='"+c+"' style='width:38px;height:38px;border-radius:50%;border:3px solid "+((cur.skin||"#f1c27d")===c?"#f5c842":"rgba(255,255,255,.2)")+";background:"+c+";cursor:pointer'></button>";});h+="</div><div class='muted' style='font-size:.72rem;margin-bottom:.3rem'>Color</div><div style='display:flex;gap:.5rem;flex-wrap:wrap'>";accents.forEach(function(c){h+="<button data-accent='"+c+"' style='width:38px;height:38px;border-radius:50%;border:3px solid "+((cur.accent||"#6C52E3")===c?"#f5c842":"rgba(255,255,255,.2)")+";background:"+c+";cursor:pointer'></button>";});h+="</div>";p.innerHTML=h;host.insertBefore(p,host.children[3]||null);p.querySelectorAll("[data-gender]").forEach(function(b){b.addEventListener("click",function(){saveCustom("gender",b.getAttribute("data-gender"));});});p.querySelectorAll("[data-skin]").forEach(function(b){b.addEventListener("click",function(){saveCustom("skin",b.getAttribute("data-skin"));});});p.querySelectorAll("[data-accent]").forEach(function(b){b.addEventListener("click",function(){saveCustom("accent",b.getAttribute("data-accent"));});});}

},90);
;/* WZ MOTION + CELEBRATION */
(function(){var st=document.createElement('style');st.textContent="@keyframes wzfall{0%{transform:translateY(-12vh) rotate(0);opacity:1}100%{transform:translateY(112vh) rotate(720deg);opacity:.9}}@keyframes wzpop{0%{transform:scale(.3);opacity:0}55%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}@keyframes wzfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes wzglow{0%,100%{filter:drop-shadow(0 0 10px rgba(245,200,66,.6))}50%{filter:drop-shadow(0 0 26px rgba(245,200,66,1))}}#tab-warrior svg{animation:wzfloat 4s ease-in-out infinite}";document.head.appendChild(st);})();
function wzConfetti(n){n=n||34;var cols=['#f5c842','#ff8c00','#6C52E3','#00E5A0','#ffffff','#e85aa0'];for(var i=0;i<n;i++){(function(i){var d=document.createElement('div');var sz=6+Math.random()*8;d.style.cssText='position:fixed;top:-14px;left:'+(Math.random()*100)+'vw;width:'+sz+'px;height:'+(sz*0.5)+'px;background:'+cols[i%cols.length]+';z-index:99998;border-radius:2px;pointer-events:none;animation:wzfall '+(1.6+Math.random()*1.4)+'s cubic-bezier(.3,.6,.6,1) forwards;animation-delay:'+(Math.random()*0.3)+'s';document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove();},3400);})(i);}}
var WZ_PIECE={belt:'Belt of Truth',breastplate:'Breastplate of Righteousness',boots:'Gospel Boots',shield:'Shield of Faith',helmet:'Helmet of Salvation',sword:'Sword of the Spirit',full:'the FULL Armor of God'};
var WZ_PEMO={belt:'🎗️',breastplate:'🛡️',boots:'🥾',shield:'🛡️',helmet:'⛑️',sword:'⚔️',full:'✨'};
function wzArmorCelebrate(id){var lbl=WZ_PIECE[id]||'a new piece';var emo=WZ_PEMO[id]||'✨';var big=(id==='full');var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;background:radial-gradient(circle at 50% 38%,rgba(45,22,88,.96),rgba(7,3,26,.985));z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;animation:wzpop .5s';ov.innerHTML="<div style='font-size:"+(big?'5.4rem':'4.4rem')+";animation:wzglow 1.4s ease-in-out infinite'>"+emo+"</div><div style='font-family:Bangers,cursive;font-size:2.3rem;color:#f5c842;letter-spacing:.05em;margin-top:.4rem;text-shadow:0 0 30px rgba(245,200,66,.7)'>"+(big?'FULL ARMOR!':'NEW ARMOR!')+"</div><div style='color:#fff;font-size:1.1rem;margin-top:.35rem;max-width:82%;line-height:1.4'>You earned <b>"+lbl+"</b>!</div><div style='color:rgba(255,255,255,.55);font-size:.85rem;margin-top:1.3rem'>Tap to keep going, warrior</div>";ov.addEventListener('click',function(){if(ov.parentNode)ov.remove();});document.body.appendChild(ov);wzConfetti(64);if(navigator.vibrate){try{navigator.vibrate([40,30,60]);}catch(e){}}setTimeout(function(){if(ov.parentNode)ov.remove();},5500);}
setTimeout(function(){
  window.wzSyncKid=function(res){
    var oldArr=(window.APP&&APP.kid&&typeof getArmor==='function')?getArmor(APP.kid):[];
    if(res&&typeof res.points==='number'){APP.kid.points=res.points;if(typeof res.lifetime_points==='number')APP.kid.lifetime_points=res.lifetime_points;if(typeof res.streak==='number')APP.kid.streak_count=res.streak;if(typeof wzUI==='function')wzUI();if(typeof wzUpdateStreak==='function')wzUpdateStreak();if(res.streakBonus>0){setTimeout(function(){toast('🔥 '+res.streak+'-day streak! +'+res.streakBonus+' bonus points!',4500);},1400);}}
    if(res&&res.granted>0)wzConfetti(18);
    var newArr=(window.APP&&APP.kid&&typeof getArmor==='function')?getArmor(APP.kid):[];
    var added=newArr.filter(function(x){return oldArr.indexOf(x)<0;});
    if(added.length){var id=added[added.length-1];setTimeout(function(){wzArmorCelebrate(id);},700);}
  };
},120);
;/* WZ SOUND */
(function(){var AC=null;window.wzMute=function(){try{return localStorage.getItem('wz_mute')==='1';}catch(e){return false;}};function ctx(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return AC;}function tone(freq,dur,type,vol,delay){var ac=ctx();if(!ac||window.wzMute())return;try{if(ac.state==='suspended')ac.resume();}catch(e){}var t=ac.currentTime+(delay||0);var o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=freq;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol||.12,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.start(t);o.stop(t+dur+0.06);}window.wzSfxEarn=function(){tone(659,0.12,'triangle',.11,0);tone(988,0.16,'triangle',.10,0.07);};window.wzSfxFanfare=function(){[523,659,784,1047].forEach(function(f,i){tone(f,0.32,'triangle',.13,i*0.11);});tone(1319,0.5,'triangle',.10,0.5);};})();
function wzMuteInit(){if(document.getElementById('wz-mute'))return;var b=document.createElement('button');b.id='wz-mute';b.style.cssText='position:fixed;bottom:82px;left:14px;z-index:9000;background:rgba(20,15,40,.85);color:#fff;border:1.5px solid rgba(255,255,255,.2);border-radius:99px;padding:.5rem .72rem;font-size:.95rem;cursor:pointer;display:none;box-shadow:0 6px 20px rgba(0,0,0,.5)';function lbl(){b.textContent=(window.wzMute&&window.wzMute())?'🔕':'🔔';}lbl();b.addEventListener('click',function(){try{localStorage.setItem('wz_mute',(window.wzMute&&window.wzMute())?'0':'1');}catch(e){}lbl();});document.body.appendChild(b);setInterval(function(){b.style.display=(window.APP&&APP.kid)?'block':'none';},1000);}
if(document.readyState!=='loading')wzMuteInit();else document.addEventListener('DOMContentLoaded',wzMuteInit);
setTimeout(wzMuteInit,2400);
setTimeout(function(){var oc=window.wzArmorCelebrate;if(typeof oc==='function'){window.wzArmorCelebrate=function(id){if(window.wzSfxFanfare)wzSfxFanfare();return oc(id);};}var os=window.wzSyncKid;if(typeof os==='function'){window.wzSyncKid=function(res){if(res&&res.granted>0&&window.wzSfxEarn)wzSfxEarn();return os(res);};}},350);


/* ===== verse (verse builder) folded from patch layer (2026-07-19) ===== */
// Verse Builder — rebuild the verse by tapping words in order.
// Replaces a self-graded "I said it" button with actual active recall, so the
// 20 points are earned rather than claimed. Award path (awardVerse -> wz-award)
// is reused untouched. No timer, no score, no fail state: wrong taps just wobble.
(function(){
 if(window.__wzVerseGame)return; window.__wzVerseGame=1;
 if(typeof sb!=='function')return;

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


/* ===== armor (getArmor + ring) folded from patch layer (2026-07-19) ===== */
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
