// Who Am I? — Bible Heroes.
// A clue-based guessing game: read up to three clues, then pick the hero. It
// teaches the great stories of Scripture (not just verses), and rewards the kid
// for guessing with FEWER clues — so a child who knows the story is celebrated,
// and a child who doesn't still gets there and learns it. No shaming: a wrong
// pick just reveals the right answer kindly and moves on.
//
// Self-contained and age-aware; awards through the existing wz-award path
// (key 'heroes'), server enforces the daily cap. Same module pattern as the
// other Arena games (register into GAMES, wrap renderGames).
(function(){
 if(window.__wzHeroes)return; window.__wzHeroes=1;
 if(typeof GAMES==='undefined'||typeof renderGames!=='function')return;

 function artBg(file){
  return "linear-gradient(rgba(10,8,30,.72),rgba(10,8,30,.9)), url('img/"+file+"') center 30%/cover no-repeat";
 }
 if(!GAMES.some(function(g){return g.id==='heroes';})){
  GAMES.push({id:'heroes',title:'Who Am I?',emoji:'🦸',bg:artBg('story-god47-4.jpg'),
   pts:25,sub:'Guess the Bible hero from clues'});
 }

 // Well-known heroes. `easy:true` ones are used for the 4-7 band too.
 var HEROES=[
  {n:'Noah',   easy:true,  c:['God told me to build a giant boat.','I brought two of every animal aboard.','God sent a rainbow after the flood.']},
  {n:'Moses',  easy:true,  c:['I was placed in a basket on a river as a baby.','I saw a bush that was on fire but did not burn.','God used me to part the Red Sea.']},
  {n:'David',  easy:true,  c:['I was a young shepherd boy.','I beat a giant with a sling and one stone.','I became a king and wrote songs to God.']},
  {n:'Daniel', easy:true,  c:['I prayed to God even when it was against the law.','I was thrown into a den of lions.','God shut the lions’ mouths and I was safe.']},
  {n:'Jonah',  easy:true,  c:['God told me to go to Nineveh, but I ran away.','I was swallowed by a great fish.','After three days I obeyed God.']},
  {n:'Joseph', easy:true,  c:['My father gave me a colorful coat.','My brothers sold me, but God had a plan.','I became a ruler in Egypt and saved my family.']},
  {n:'Ruth',   easy:false, c:['I left my home to stay with Naomi.','I gathered grain in Boaz’s field.','I became the great-grandmother of King David.']},
  {n:'Esther', easy:false, c:['I was a queen chosen by the king.','I was brave “for such a time as this.”','I saved my people from an evil plan.']},
  {n:'Abraham',easy:false, c:['God promised me more children than the stars.','I was ready to trust God with my son Isaac.','I am called the father of many nations.']},
  {n:'Peter',  easy:false, c:['I was a fisherman before Jesus called me.','I walked on water toward Jesus for a moment.','I preached and 3,000 people believed in one day.']},
  {n:'Paul',   easy:false, c:['I once hurt Christians before I met Jesus.','I met Jesus in a bright light on the Damascus road.','I wrote many letters in the New Testament.']},
  {n:'Joshua', easy:false, c:['I took over leading Israel after Moses.','We marched around Jericho and the walls fell.','I said, “As for me and my house, we will serve the Lord.”']}
 ];

 function css(){ if(document.getElementById('wz-hr-css'))return;
  var s=document.createElement('style'); s.id='wz-hr-css';
  s.textContent=
   "#hr-wrap{max-width:520px;margin:0 auto}"+
   "#hr-head{background:linear-gradient(135deg,#180444,#051a40);border:1.5px solid rgba(108,82,227,.3);border-radius:18px;padding:.9rem 1rem;text-align:center;margin-bottom:.85rem}"+
   "#hr-head h3{font-family:Bangers,cursive;font-size:1.4rem;color:#fff;letter-spacing:.03em;margin:0}"+
   "#hr-head .rnd{color:rgba(255,255,255,.5);font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-top:.15rem}"+
   ".hr-clues{background:rgba(255,255,255,.04);border:1px solid rgba(245,200,66,.25);border-radius:16px;padding:1rem;margin-bottom:.85rem;min-height:120px}"+
   ".hr-clue{display:flex;gap:.6rem;align-items:flex-start;margin-bottom:.6rem;animation:hrin .3s}"+
   "@keyframes hrin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"+
   ".hr-num{font-family:Bangers,cursive;color:#f5c842;font-size:1.1rem;line-height:1.2;flex-shrink:0}"+
   ".hr-tx{font-size:.92rem;color:#eee;line-height:1.4}"+
   ".hr-more{background:none;border:1px dashed rgba(245,200,66,.4);color:#f5c842;border-radius:10px;padding:.4rem .8rem;font-size:.78rem;font-weight:800;cursor:pointer;font-family:inherit}"+
   ".hr-opts{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}"+
   ".hr-opt{background:rgba(108,82,227,.14);border:2px solid rgba(108,82,227,.35);color:#fff;border-radius:14px;padding:.85rem .5rem;font-size:.95rem;font-weight:800;cursor:pointer;font-family:inherit;min-height:52px}"+
   ".hr-opt.right{background:rgba(126,224,138,.2);border-color:#7ee08a;color:#bff3c8}"+
   ".hr-opt.wrongpick{background:rgba(255,120,90,.16);border-color:rgba(255,120,90,.5)}"+
   "#hr-msg{text-align:center;padding:1.2rem;background:linear-gradient(135deg,#1e1e38,#171730);border:1px solid rgba(245,200,66,.35);border-radius:16px}"+
   "#hr-msg h4{font-family:Bangers,cursive;font-size:1.6rem;color:#f5c842;margin:0 0 .3rem;letter-spacing:.03em}"+
   "#hr-msg p{color:rgba(255,255,255,.82);font-size:.9rem;margin:0 0 .9rem}"+
   ".hr-btn{background:#f5c842;color:#1a1a2e;border:none;border-radius:11px;padding:.7rem 1.4rem;font-weight:900;font-size:.95rem;cursor:pointer;font-family:inherit}";
  document.head.appendChild(s); }

 function grp(){ try{ return (window.APP&&APP.kid&&APP.kid.age_group)||'812'; }catch(e){ return '812'; } }
 function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

 window.initHeroes=function(el){
  css();
  var pool=(grp()==='47')?HEROES.filter(function(h){return h.easy;}):HEROES;
  var rounds=shuffle(pool).slice(0,5);
  var idx=0, correct=0;

  el.innerHTML="<div id='hr-wrap'><div id='hr-head'><h3>🦸 Who Am I?</h3><div class='rnd' id='hr-rnd'></div></div><div id='hr-body'></div></div>";
  var body=el.querySelector('#hr-body');

  function draw(){
   if(idx>=rounds.length)return finish();
   document.getElementById('hr-rnd').textContent='Hero '+(idx+1)+' of '+rounds.length;
   var hero=rounds[idx];
   var shown=1, answered=false;

   var clues=document.createElement('div'); clues.className='hr-clues';
   function renderClues(){
    clues.innerHTML='';
    for(var i=0;i<shown;i++){
     var c=document.createElement('div'); c.className='hr-clue';
     c.innerHTML="<div class='hr-num'>"+(i+1)+"</div><div class='hr-tx'>"+hero.c[i]+"</div>";
     clues.appendChild(c);
    }
    if(shown<hero.c.length && !answered){
     var more=document.createElement('button'); more.className='hr-more'; more.textContent='Need another clue';
     more.onclick=function(){ shown++; renderClues(); };
     clues.appendChild(more);
    }
   }
   renderClues();

   // options: correct + 3 distinct others
   var others=shuffle(HEROES.filter(function(h){return h.n!==hero.n;})).slice(0,3).map(function(h){return h.n;});
   var opts=shuffle(others.concat([hero.n]));
   var grid=document.createElement('div'); grid.className='hr-opts';
   opts.forEach(function(name){
    var b=document.createElement('button'); b.className='hr-opt'; b.textContent=name;
    b.onclick=function(){
     if(answered)return; answered=true;
     var right=(name===hero.n);
     if(right){ b.classList.add('right'); correct++; if(typeof toast==='function')toast('✓ Yes! '+hero.n+(shown===1?' — first clue!':'')); }
     else{
      b.classList.add('wrongpick');
      [].forEach.call(grid.children,function(x){ if(x.textContent===hero.n)x.classList.add('right'); });
      if(typeof toast==='function')toast('It was '+hero.n+'. Now you know!',2600);
     }
     // remove the "need a clue" button
     var mb=clues.querySelector('.hr-more'); if(mb)mb.remove();
     setTimeout(function(){ idx++; draw(); }, right?900:1700);
    };
    grid.appendChild(b);
   });

   body.innerHTML=''; body.appendChild(clues); body.appendChild(grid);
  }

  function finish(){
   var pts=correct*5;
   body.innerHTML="<div id='hr-msg'><h4>✓ "+correct+" of "+rounds.length+"!</h4>"+
     "<p>You know your Bible heroes. Their stories show us who God is.</p></div>";
   var msg=body.querySelector('#hr-msg');
   var again=document.createElement('button'); again.className='hr-btn'; again.textContent='Play again';
   again.onclick=function(){ initHeroes(el); }; msg.appendChild(again);
   if(pts>0 && window.APP && APP.kid && typeof wzPost==='function'){
    wzPost('wz-award',{action:'game',kidId:APP.kid.id,pin:APP.kid.pin,key:'heroes',amount:pts})
     .then(function(res){
      if(res&&res.ok){
       if(typeof wzSyncKid==='function')wzSyncKid(res);
       if(res.granted>0&&typeof toast==='function')toast('⚡ +'+res.granted+' pts!',2500);
       else if(typeof toast==='function')toast('🎮 Daily game points are maxed — play for fun!',3000);
      }
     }).catch(function(){});
   }
  }

  draw();
 };

 var _rg=renderGames;
 renderGames=function(gameId){
  var r=_rg.apply(this,arguments);
  if(gameId==='heroes'){
   var a=document.getElementById('game-arena');
   if(a)initHeroes(a);
  }
  return r;
 };
})();
