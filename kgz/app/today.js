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
 var _dt=dashTab;
 dashTab=function(tab,btn){
  var r=_dt.apply(this,arguments);
  var t=document.getElementById('tab-today');
  if(t)t.style.display=(tab==='today')?'block':'none';
  if(tab==='today')renderToday();
  return r;
 };

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
