// extracted from WZCAPFIX_INJECT (was a runtime monkey-patch)
/*WZCAPFIX_INJECT*/
(function(){
 if(window.__wzCapFix)return; window.__wzCapFix=1;
 function capFix(){
  var h=document.querySelector('#tab-games .games-header'); if(!h)return;
  var sub=[].slice.call(h.children).filter(function(c){return /Up to \d+ pts|pts today|pts\/day/i.test(c.textContent||'');})[0];
  if(!sub)return;
  var n=document.querySelectorAll('#tab-games .games-grid .game-card').length||7;
  var max=(window.CFG&&window.CFG.game_daily_max)||100;
  function paint(pts){ var left=Math.max(0,max-(pts||0)); sub.innerHTML="<span>"+n+" games</span> &middot; <span style='color:#f5c842;font-weight:800'>"+(pts||0)+" of "+max+" pts today</span> &middot; <span>"+(left>0?left+" left":"cap reached")+"</span>"; }
  try{ window.gamePtsToday(function(pts){ paint(pts); }); }catch(e){ paint(0); }
 }
 function hook(){ if(typeof window.renderGames==='function'&&!window.renderGames.__wzcap){ var o=window.renderGames; window.renderGames=function(){ var r=o.apply(this,arguments); try{setTimeout(capFix,60);}catch(e){} return r; }; window.renderGames.__wzcap=1; }
  if(typeof window.dashTab==='function'&&!window.dashTab.__wzcap){ var d=window.dashTab; window.dashTab=function(tab,btn){ var r=d.apply(this,arguments); try{ if(tab==='games')setTimeout(capFix,90); }catch(e){} return r; }; window.dashTab.__wzcap=1; }
  try{capFix();}catch(e){}
 }
 setTimeout(hook,400);setTimeout(hook,1400);setTimeout(hook,2800);
})();
