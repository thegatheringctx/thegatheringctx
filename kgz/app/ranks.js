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
