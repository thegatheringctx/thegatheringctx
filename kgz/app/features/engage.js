// Engage \u2014 five additions from the Sept 2026 Kids Zone review (Pastor Billy said "do them all").
//  1. Prize Day: a monthly prize-table Sunday (default: last Sunday of the month,
//     override with app_config key `prize_day` = YYYY-MM-DD). Banner in the Store,
//     a card on Today the week of Prize Day, and a leader block in Admin.
//  2. Reminders: a clear "Grown-ups: turn on a daily reminder" card on Today
//     (the old corner button reached zero families), with Add-to-Home-Screen help
//     on iPhone/iPad, plus an Invite-back list for leaders in Admin.
//  3. Game cap -> next step: when game points are maxed for the day, point the
//     kid to the verse / devo / pastor video instead of a dead-end "max reached".
//  4. Scripture first: a verse bonus quest at the top of the Battle Arena.
//  5. Sunday shout-outs: an Admin list of this week's wins for leaders to celebrate.
// Also fixes the ledger reads: transactions were routed to wz-read, which returns
// the last 50 rows of all time, so "points today" and "done today" summed the
// wrong window (the Arena header showed "cap reached" for any kid with history).
// Purely additive; every hook is wrapped in try/catch so nothing here can break login.
(function(){
 if(window.__wzEngage)return; window.__wzEngage=1;

 function kid(){ try{ return (window.APP&&APP.kid)||null; }catch(e){ return null; } }
 function navFor(tab){ return document.querySelector(".tab-btn[onclick*=\"'"+tab+"'\"]")||document.querySelector(".tab-sidebar-btn[onclick*=\"'"+tab+"'\"]"); }
 function go(tab){ try{ dashTab(tab,navFor(tab)); }catch(e){} }
 function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
 function ls(k,v){ try{ if(v===undefined)return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
 function ymd(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
 function todayKey(){ return ymd(new Date()); }

 function css(){ if(document.getElementById('wz-eng-css'))return;
  var s=document.createElement('style'); s.id='wz-eng-css';
  s.textContent=
   ".eng-banner{display:flex;align-items:center;gap:.8rem;border-radius:16px;padding:.8rem 1rem;margin-bottom:1rem;background:linear-gradient(135deg,rgba(245,200,66,.22),rgba(245,200,66,.06));border:1.5px solid rgba(245,200,66,.45)}"+
   ".eng-banner .ei{font-size:1.9rem;flex-shrink:0}"+
   ".eng-banner .et{font-family:Bangers,cursive;font-size:1.25rem;color:#f5c842;letter-spacing:.04em;line-height:1.05}"+
   ".eng-banner .ed{font-size:.74rem;color:rgba(255,255,255,.72);margin-top:.2rem;line-height:1.35}"+
   ".eng-banner.tap{cursor:pointer}.eng-banner.tap:active{transform:scale(.98)}"+
   ".eng-x{margin-left:auto;align-self:flex-start;background:none;border:none;color:rgba(255,255,255,.4);font-size:1rem;cursor:pointer;padding:0 .2rem}"+
   "#eng-sheet{position:fixed;inset:0;z-index:2147483200;background:rgba(0,0,0,.78);display:flex;align-items:flex-end;justify-content:center}"+
   "#eng-sheet .box{width:100%;max-width:480px;background:linear-gradient(180deg,#0f0635,#07031a);border-top:2px solid rgba(245,200,66,.35);border-radius:26px 26px 0 0;padding:1.4rem 1.2rem 2.2rem;text-align:center}"+
   "#eng-sheet .h{font-family:Bangers,cursive;font-size:1.7rem;color:#fff;letter-spacing:.04em;line-height:1.05}"+
   "#eng-sheet .h span{color:#f5c842}"+
   "#eng-sheet .p{font-size:.84rem;color:rgba(255,255,255,.65);margin:.4rem 0 1rem;line-height:1.45}"+
   "#eng-sheet .opt{display:flex;align-items:center;gap:.75rem;width:100%;text-align:left;background:rgba(255,255,255,.06);border:1.5px solid rgba(245,200,66,.3);border-radius:16px;padding:.8rem .9rem;margin-bottom:.6rem;color:#fff;cursor:pointer;font-family:inherit}"+
   "#eng-sheet .opt .oi{font-size:1.6rem}#eng-sheet .opt .ot{font-weight:900;font-size:.95rem}#eng-sheet .opt .od{font-size:.72rem;color:rgba(255,255,255,.55)}"+
   "#eng-sheet .opt .op{margin-left:auto;font-family:Bangers,cursive;color:#f5c842;font-size:1.15rem;white-space:nowrap}"+
   "#eng-sheet .keep{background:none;border:none;color:rgba(255,255,255,.5);font-weight:800;font-size:.8rem;margin-top:.4rem;cursor:pointer;font-family:inherit}"+
   "body.eng-hasrem #wz-push-btn{visibility:hidden}"+
   ".eng-adm{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1rem;margin-bottom:.85rem}"+
   ".eng-adm .row{display:flex;justify-content:space-between;gap:.6rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.8rem}"+
   ".eng-adm .row:last-child{border-bottom:none}"+
   ".eng-adm .nm{font-weight:900;color:#fff}.eng-adm .why{color:#f5c842;font-weight:800;text-align:right}.eng-adm .mut{color:rgba(255,255,255,.45);font-size:.7rem}";
  document.head.appendChild(s); }

 /* ---------------- ledger reads: filter to the window the caller asked for ---------------- */
 try{
  var _sb=window.sb;
  if(typeof _sb==='function' && typeof wzPost==='function'){
   window.sb=function(path,opts){
    try{
     var k=kid();
     var isGet=!opts||!opts.method||String(opts.method).toUpperCase()==='GET';
     if(k && isGet && typeof path==='string' && path.indexOf('transactions?')===0){
      var q=path.split('?')[1]||'';
      var who=(q.match(/(?:^|&)kid_id=eq\.([^&]+)/)||[])[1];
      if(!who || decodeURIComponent(who)===String(k.id)){
       var since=+((q.match(/(?:^|&)created_at=gte\.(\d+)/)||[])[1]||0);
       var ceq=(q.match(/(?:^|&)category=eq\.([^&]+)/)||[])[1];
       var clike=(q.match(/(?:^|&)category=like\.([^&]+)/)||[])[1];
       var lim=+((q.match(/(?:^|&)limit=(\d+)/)||[])[1]||0);
       var body={kid_id:k.id,pin:k.pin,what:'my-transactions'}; if(since)body.since=since;
       return wzPost('wz-read',body).then(function(r){
        var rows=(r&&r.ok&&r.rows)?r.rows:[];
        rows=rows.filter(function(t){
         var c=String(t.category||'');
         if(since && (+t.created_at||0)<since)return false;
         if(ceq && c!==decodeURIComponent(ceq))return false;
         if(clike){ var pre=decodeURIComponent(clike).replace(/\*$/,''); if(c.indexOf(pre)!==0)return false; }
         return true;
        });
        return lim?rows.slice(0,lim):rows;
       });
      }
     }
    }catch(e){}
    return _sb.apply(this,arguments);
   };
  }
 }catch(e){}

 /* ---------------- shared content lookups ---------------- */
 var cache={};
 function getVerse(){
  var k=kid(); var grp=(k&&k.age_group)||'812';
  if(cache['v'+grp])return cache['v'+grp];
  return (cache['v'+grp]=sb("memory_verses?active=eq.true&age_group=eq."+grp+"&limit=1").then(function(r){return (r&&r[0])||null;}).catch(function(){return null;}));
 }
 function getPastor(){
  if(cache.p)return cache.p;
  return (cache.p=sb("videos?active=eq.true&topic=eq.pastor&age_group=eq.all&order=created_at.desc&limit=1").then(function(r){return (r&&r[0])||null;}).catch(function(){return null;}));
 }
 function getItems(){
  if(window.APP&&APP.storeItems&&APP.storeItems.length)return Promise.resolve(APP.storeItems);
  return sb("store_items?select=*&active=eq.true&order=pts.asc").then(function(r){ if(window.APP&&r&&r.length)APP.storeItems=r; return r||[]; }).catch(function(){return [];});
 }
 function verseDone(v){ var k=kid(); return !!(v&&k&&(k.completed_verses||[]).indexOf(v.id)>=0); }
 function pastorDone(p){ var k=kid(); return !!(p&&k&&(k.completed_videos||[]).indexOf(p.id)>=0); }

 /* ---------------- 1. Prize Day ---------------- */
 function lastSunday(y,m){ var d=new Date(y,m+1,0); d.setDate(d.getDate()-d.getDay()); return d; }
 function prizeDay(){
  var now=new Date(); now.setHours(0,0,0,0);
  var o=(window.CFG&&CFG.prize_day)||'';
  var mm=/^(\d{4})-(\d{2})-(\d{2})$/.exec(o);
  if(mm){ var od=new Date(+mm[1],+mm[2]-1,+mm[3]); if(od>=now)return {date:od,custom:true}; }
  var d=lastSunday(now.getFullYear(),now.getMonth());
  if(d<now)d=lastSunday(now.getFullYear(),now.getMonth()+1);
  return {date:d,custom:false};
 }
 function daysTo(d){ var n=new Date(); n.setHours(0,0,0,0); return Math.round((d-n)/86400000); }
 function prettyDay(d){ try{ return d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'}); }catch(e){ return ymd(d); } }
 function whenText(d){ var n=daysTo(d); return n===0?'TODAY':(n===1?'tomorrow':(n<7?'this '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]:prettyDay(d))); }

 function prizeBanner(items){
  var k=kid(); var pts=(k&&k.points)||0;
  var pd=prizeDay(); var n=daysTo(pd.date);
  var afford=(items||[]).filter(function(i){return pts>=i.pts;});
  var next=(items||[]).filter(function(i){return pts<i.pts;}).sort(function(a,b){return a.pts-b.pts;})[0];
  var b=document.createElement('div'); b.className='eng-banner'; b.id='eng-prize';
  var line;
  if(afford.length) line='You can redeem '+afford.length+' prize'+(afford.length>1?'s':'')+' right now. Redeem before Prize Day and a leader will hand it to you!';
  else if(next) line=(next.pts-pts)+' more points and you can get '+esc(next.name)+'. Keep going, warrior!';
  else line='Redeem prizes here and a leader will hand them out on Prize Day.';
  b.innerHTML="<div class='ei'>\ud83c\udf81</div><div><div class='et'>Prize Day is "+(n===0?'TODAY!':esc(whenText(pd.date))+'!')+"</div><div class='ed'>"+line+"</div></div>";
  return b;
 }
 try{
  var _rs=window.renderStore;
  if(typeof _rs==='function'){
   window.renderStore=function(){
    var r=_rs.apply(this,arguments);
    try{
     css();
     var el=document.getElementById('tab-store');
     if(el && window.APP && APP.storeItems && APP.storeItems.length && !document.getElementById('eng-prize')){
      var ban=prizeBanner(APP.storeItems);
      var anchor=el.children[1]||null; // after the header, before the balance card
      el.insertBefore(ban,anchor);
     }
    }catch(e){}
    return r;
   };
  }
 }catch(e){}

 /* ---------------- Today tab additions (prize card + grown-ups reminder) ---------------- */
 function isIOS(){ var ua=navigator.userAgent||''; return /iPad|iPhone|iPod/.test(ua)||(ua.indexOf('Macintosh')>=0&&'ontouchend' in document); }
 function standalone(){ try{ return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true; }catch(e){ return false; } }
 function pushSupported(){ return ('serviceWorker' in navigator)&&('PushManager' in window)&&('Notification' in window); }

 function reminderCard(){
  var k=kid(); if(!k)return null;
  var dk='wz_eng_rem_x_'+k.id; if(ls(dk)==='1')return null;
  if(ls('wz_push_dismissed')==='1')return null;
  var c=document.createElement('div'); c.className='eng-banner tap'; c.id='eng-remind';
  if(pushSupported()){
   if(Notification.permission!=='default')return null; // already on, or blocked by the family
   c.innerHTML="<div class='ei'>\ud83d\udd14</div><div><div class='et'>Grown-ups: daily reminder</div><div class='ed'>Tap to get one gentle reminder a day so "+esc(k.first_name||'your warrior')+" keeps the streak going.</div></div><button class='eng-x' aria-label='Hide'>\u2715</button>";
   c.onclick=function(ev){
    if(ev.target&&ev.target.classList.contains('eng-x'))return;
    var b=document.getElementById('wz-push-btn');
    if(b){ b.click(); c.remove(); return; }
    try{ Notification.requestPermission().then(function(){ c.remove(); }); }catch(e){}
   };
  } else if(isIOS() && !standalone()){
   c.innerHTML="<div class='ei'>\ud83d\udcf2</div><div><div class='et'>Grown-ups: want reminders?</div><div class='ed'>On iPhone or iPad, tap <b>Share</b> then <b>Add to Home Screen</b>. Open Kids Zone from that icon and you can turn on a daily reminder.</div></div><button class='eng-x' aria-label='Hide'>\u2715</button>";
   c.classList.remove('tap');
  } else return null;
  c.querySelector('.eng-x').onclick=function(ev){ ev.stopPropagation(); ls(dk,'1'); c.remove(); };
  return c;
 }

 function enhanceToday(){
  var host=document.getElementById('tab-today'); if(!host||!kid())return;
  var foot=host.lastElementChild;
  // wait for renderToday's async cards to finish: its last child is the footer line
  if(!host.querySelector('.td-card')||!foot||foot.classList.contains('td-card')||!/menu below/i.test(foot.textContent||''))return;
  css();
  // prize card the week of Prize Day
  if(!document.getElementById('eng-prize-today')){
   var pd=prizeDay(); var n=daysTo(pd.date);
   if(n>=0 && n<=6){
    var holder=document.createElement('div'); holder.id='eng-prize-today';
    host.insertBefore(holder,foot);
    getItems().then(function(items){
     var b=prizeBanner(items); b.id='eng-prize-t'; b.classList.add('tap');
     b.onclick=function(){ go('store'); };
     holder.appendChild(b);
    });
   }
  }
  if(!document.getElementById('eng-remind')){
   var rc=reminderCard(); if(rc){ host.insertBefore(rc,foot); document.body.classList.add('eng-hasrem'); }
  }
 }
 try{
  var mo=new MutationObserver(function(){ setTimeout(enhanceToday,50); });
  var tries=0, iv=setInterval(function(){
   var host=document.getElementById('tab-today');
   if(host){ mo.observe(host,{childList:true}); clearInterval(iv); }
   if(++tries>40)clearInterval(iv);
  },500);
 }catch(e){}

 /* ---------------- 3. Game cap -> next step ---------------- */
 var sheetUntil=0;
 function capSheet(){
  var k=kid(); if(!k)return;
  var key='wz_eng_cap_'+k.id+'_'+todayKey();
  if(ls(key)==='1'){ // already showed the full sheet today: one short nudge
   if(typeof toast==='function')toast('\ud83c\udfae Game points are maxed for today. Learn the verse or read the devo for more!',4000);
   return;
  }
  ls(key,'1'); css();
  Promise.all([getVerse(),getPastor()]).then(function(r){
   var v=r[0], p=r[1];
   var opts=[];
   if(v && !verseDone(v)) opts.push({i:'\ud83d\udcdc',t:'Learn this week\u2019s verse',d:esc(v.reference||'Hide God\u2019s Word in your heart'),p:'+'+(v.points||20),tab:'verse'});
   opts.push({i:'\ud83d\udcd6',t:'Read today\u2019s devo',d:'A few minutes with God',p:'+'+((window.CFG&&CFG.devo_pts)||10),tab:'devos'});
   if(p && !pastorDone(p)) opts.push({i:'\ud83c\udfa5',t:'A word from Pastor Billy',d:'Watch and answer the question',p:'+'+(p.points||25),tab:'watch'});
   var ov=document.createElement('div'); ov.id='eng-sheet';
   ov.innerHTML="<div class='box'><div class='h'>Game points <span>maxed</span> for today!</div>"+
    "<div class='p'>Great work, "+esc(k.first_name||'warrior')+". You can keep playing for fun. Want more points? Try one of these:</div>"+
    opts.map(function(o,ix){ return "<button class='opt' data-ix='"+ix+"'><span class='oi'>"+o.i+"</span><span><div class='ot'>"+o.t+"</div><div class='od'>"+o.d+"</div></span><span class='op'>"+o.p+"</span></button>"; }).join('')+
    "<button class='keep'>Keep playing for fun</button></div>";
   ov.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.opt'):null;
    if(b){ var o=opts[+b.getAttribute('data-ix')]; ov.remove(); try{ document.querySelectorAll('.wz-grow-ov').forEach(function(x){x.remove();}); }catch(_){} go(o.tab); return; }
    if(e.target===ov||e.target.classList.contains('keep'))ov.remove();
   });
   document.body.appendChild(ov);
  });
 }
 try{
  var _toast=window.toast;
  if(typeof _toast==='function'){
   window.toast=function(msg){
    try{ if(Date.now()<sheetUntil && /game (points )?max/i.test(String(msg)))return; }catch(e){}
    return _toast.apply(this,arguments);
   };
  }
  var _wp=window.wzPost;
  if(typeof _wp==='function'){
   window.wzPost=function(fn,body){
    var pr=_wp.apply(this,arguments);
    try{
     if(fn==='wz-award' && body && body.action==='game' && (+body.amount||0)>0){
      pr.then(function(res){
       if(res && res.ok && res.granted===0){ sheetUntil=Date.now()+3000; setTimeout(capSheet,700); }
      }).catch(function(){});
     }
    }catch(e){}
    return pr;
   };
  }
 }catch(e){}

 /* ---------------- 4. Scripture first in the Arena ---------------- */
 function arenaQuest(){
  var el=document.getElementById('tab-games'); if(!el||!kid()||document.getElementById('eng-quest'))return;
  getVerse().then(function(v){
   if(!v||verseDone(v)||document.getElementById('eng-quest'))return;
   css();
   var b=document.createElement('div'); b.className='eng-banner tap'; b.id='eng-quest';
   b.innerHTML="<div class='ei'>\ud83d\udcdc</div><div><div class='et'>Bonus quest: +"+(v.points||20)+" pts</div><div class='ed'>Learn this week\u2019s verse"+(v.reference?' ('+esc(v.reference)+')':'')+". The Word of God is the sword of the Spirit!</div></div>";
   b.onclick=function(){ go('verse'); };
   var hdr=el.querySelector('.games-header');
   if(hdr&&hdr.parentNode===el)el.insertBefore(b,hdr.nextSibling); else el.insertBefore(b,el.firstChild);
  });
 }
 try{
  var _dt=window.dashTab;
  if(typeof _dt==='function'){
   window.dashTab=function(tab){
    var r=_dt.apply(this,arguments);
    try{ if(tab==='games')setTimeout(arenaQuest,160); if(tab==='today')setTimeout(enhanceToday,400); }catch(e){}
    return r;
   };
  }
 }catch(e){}

 /* ---------------- 2 + 5. Leader tools in Admin > Today ---------------- */
 function initial(s){ s=String(s||''); return s?(' '+s.charAt(0).toUpperCase()+'.'):''; }
 function renderLeader(){
  var ov=document.getElementById('atab-overview'); if(!ov||typeof ADM==='undefined'||!ADM.pass)return;
  css();
  var wrap=document.getElementById('eng-leader');
  if(!wrap){ wrap=document.createElement('div'); wrap.id='eng-leader'; ov.insertBefore(wrap,ov.children[2]||null); }
  var pd=prizeDay();
  var pending=(ADM.orders||[]).filter(function(o){return o.status!=='fulfilled';}).length;
  wrap.innerHTML=
   "<div class='eyebrow' style='margin-bottom:.6rem'>\ud83c\udf89 Sunday Shout-outs</div><div class='eng-adm' id='eng-shout'><div class='mut'>Loading this week\u2019s wins...</div></div>"+
   "<div class='eyebrow' style='margin-bottom:.6rem'>\ud83c\udf81 Prize Day</div><div class='eng-adm'>"+
    "<div style='font-weight:900;color:#fff'>"+esc(prettyDay(pd.date))+(pd.custom?'':" <span class='mut'>(auto: last Sunday of the month)</span>")+"</div>"+
    "<div class='mut' style='margin:.3rem 0 .6rem'>"+pending+" prize"+(pending===1?'':'s')+" waiting to hand out (see Orders).</div>"+
    "<div style='display:flex;gap:.5rem'><input id='eng-pd' type='date' value='"+(pd.custom?ymd(pd.date):'')+"' style='flex:1;font-size:.85rem;padding:.45rem .6rem'>"+
    "<button id='eng-pd-save' style='background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.35);border-radius:10px;color:#f5c842;font-weight:900;font-size:.75rem;padding:.4rem .8rem;cursor:pointer'>Save</button></div>"+
    "<div class='mut' style='margin-top:.35rem'>Leave blank and save to go back to the last Sunday of each month.</div></div>"+
   "<div class='eyebrow' style='margin-bottom:.6rem'>\ud83d\udc4b Invite Back</div><div class='eng-adm' id='eng-invite'></div>";
  var sv=document.getElementById('eng-pd-save');
  if(sv)sv.onclick=function(){ var v=(document.getElementById('eng-pd').value||'').trim(); try{ saveConfig('prize_day',v); }catch(e){} if(window.CFG)CFG.prize_day=v; toast(v?'Prize Day set.':'Prize Day back to auto.',2500); setTimeout(renderLeader,300); };

  // Invite back: warriors quiet for 14+ days, with the grown-up's name for a Sunday hello
  var cutoff=ymd(new Date(Date.now()-14*86400000));
  var quiet=(ADM.kids||[]).filter(function(k){ return !k.last_active || k.last_active<cutoff; })
   .sort(function(a,b){ return String(b.last_active||'').localeCompare(String(a.last_active||'')); });
  var inv=document.getElementById('eng-invite');
  if(inv){
   inv.innerHTML=quiet.length?(
    "<div class='mut' style='margin-bottom:.4rem'>"+quiet.length+(quiet.length===1?" warrior hasn\u2019t":" warriors haven\u2019t")+" opened Kids Zone in 2+ weeks. A friendly word to the family on Sunday goes a long way.</div>"+
    quiet.slice(0,20).map(function(k){
     return "<div class='row'><div><div class='nm'>"+esc(k.first_name)+esc(initial(k.last_name))+"</div><div class='mut'>"+(k.parent_name?'Grown-up: '+esc(k.parent_name):'')+"</div></div><div class='mut' style='text-align:right'>"+(k.last_active?'Last in '+esc(k.last_active):'Never logged in')+"</div></div>";
    }).join('')+(quiet.length>20?"<div class='mut' style='margin-top:.4rem'>+"+(quiet.length-20)+" more</div>":'')
   ):"<div class='mut'>Everyone has been in Kids Zone in the last two weeks. \ud83d\ude4c</div>";
  }

  // Shout-outs: this week's wins (since Sunday midnight)
  wzPost('wz-admin',{action:'weekly',pass:ADM.pass}).then(function(r){
   var box=document.getElementById('eng-shout'); if(!box)return;
   if(!r||!r.ok){ box.innerHTML="<div class='mut'>Could not load this week\u2019s wins.</div>"; return; }
   var per=r.per||{}; var byId={}; (ADM.kids||[]).forEach(function(k){byId[k.id]=k;});
   var since=r.since||0; var out=[];
   Object.keys(byId).forEach(function(id){
    var k=byId[id], p=per[id]||{}, why=[];
    if(p.verses)why.push('learned '+(p.verses>1?p.verses+' verses':'a verse'));
    if((p.devos||0)>=3)why.push('read '+p.devos+' devos');
    if((k.streak_count||0)>=3 && k.last_active && k.last_active>=ymd(new Date(Date.now()-86400000)))why.push(k.streak_count+'-day streak');
    if(p.videos)why.push('watched '+(p.videos>1?p.videos+' videos':'a video'));
    var joined=+k.joined_at||Date.parse(k.joined_at||'')||0;
    if(joined && joined>=since)why.push('new warrior!');
    if(why.length)out.push({k:k,why:why,score:(p.verses||0)*5+(p.devos||0)+(k.streak_count||0)});
   });
   out.sort(function(a,b){return b.score-a.score;});
   box.innerHTML=out.length?(
    "<div class='mut' style='margin-bottom:.4rem'>Celebrate these warriors from the front on Sunday.</div>"+
    out.slice(0,15).map(function(o){ return "<div class='row'><div class='nm'>"+esc(o.k.first_name)+esc(initial(o.k.last_name))+"</div><div class='why'>"+esc(o.why.join(' \u00b7 '))+"</div></div>"; }).join('')
   ):"<div class='mut'>No milestones yet this week. Verses, 3+ devos, streaks and new warriors show up here.</div>";
  }).catch(function(){ var box=document.getElementById('eng-shout'); if(box)box.innerHTML="<div class='mut'>Could not load this week\u2019s wins.</div>"; });
 }
 try{
  var _alo=window.admLoadOverview;
  if(typeof _alo==='function'){
   window.admLoadOverview=function(){ var r=_alo.apply(this,arguments); try{ setTimeout(renderLeader,50); }catch(e){} return r; };
  }
 }catch(e){}
})();
