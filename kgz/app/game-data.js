// Age-aware, database-backed game pools.
// Before: TFPOOL/FITBPOOL/SCRAMPOOL were hardcoded JS arrays with NO age filter
// and pools ≈ round size, so a 5-year-old got 10-word verses and every play was
// near-identical. Now each game draws from game_content for the kid's age group.
// The hardcoded arrays stay as a fallback if the fetch fails — never leave a kid
// staring at a broken game.
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
 }

 // reload whenever a kid logs in (age group is only known then) and when the
 // Arena is opened, so a kid never plays the other band's content.
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>400){clearInterval(iv);return;}
  if(!(window.APP&&APP.kid))return;
  clearInterval(iv); refresh();
 },1500);

 if(typeof renderGames==='function'){
  var _rg=renderGames;
  renderGames=function(gameId){
   if(!gameId && window.APP && APP.kid) refresh();  // refresh on Arena home
   return _rg.apply(this,arguments);
  };
 }
})();

// ---- match + wheel (appended) -----------------------------------------
// Last two hardcoded games moved to game_content, age-filtered.
(function(){
 if(window.__wzGameData2)return; window.__wzGameData2=1;
 if(typeof sb!=='function')return;
 function grp(){ try{ return (window.APP&&APP.kid&&APP.kid.age_group)||'812'; }catch(e){ return '812'; } }
 function load(game){
  return sb('game_content?active=eq.true&game=eq.'+game+'&age_group=eq.'+grp()+'&order=sort_order.asc')
   .then(function(rows){ return (rows||[]).map(function(r){ return r.payload; }); })
   .catch(function(){ return []; });
 }
 function refresh(){
  load('match').then(function(p){ if(p.length>=5 && typeof MPAIRS!=='undefined') MPAIRS=p; });
  load('wheel').then(function(p){ if(p.length>=4 && typeof WCHALLENGES!=='undefined') WCHALLENGES=p; });
 }
 var tries=0;
 var iv=setInterval(function(){
  tries++; if(tries>400){clearInterval(iv);return;}
  if(!(window.APP&&APP.kid))return;
  clearInterval(iv); refresh();
 },1500);
 if(typeof renderGames==='function'){
  var _rg=renderGames;
  renderGames=function(gameId){
   if(!gameId && window.APP && APP.kid) refresh();
   return _rg.apply(this,arguments);
  };
 }
})();
