// Verse Keeper — Scripture memory that actually sticks.
// The app already lets kids LEARN verses; this makes them KEEP them. Twelve
// foundational verses, each with a kid-level "what it means," on a gentle
// spaced-review schedule (Leitner boxes in localStorage — no backend): verses
// you're still learning come back soon, verses you know come back later, so they
// don't fade. Recall is one fill-in-the-blank — a wrong tap just reveals the
// word, never a penalty. Non-competitive: it's always you vs. forgetting.
(function(){
 if(window.__wzVerse)return; window.__wzVerse=1;
 var TAG='verse';

 // blank = the word hidden for recall; w = two gentle wrong options.
 // my/mo = meaning for 4–7 / 8–12.
 var V=[
  {id:'jn316', ref:'John 3:16',
   text:'For God so loved the world that he gave his one and only Son.',
   blank:'loved', w:['watched','left'],
   my:'God loves you SO much that He gave Jesus for you.',
   mo:'God loved the world so much that He gave His own Son, Jesus, to rescue us.'},
  {id:'ps231', ref:'Psalm 23:1',
   text:'The Lord is my shepherd; I shall not want.',
   blank:'shepherd', w:['helper','teacher'],
   my:'God takes care of me like a good shepherd takes care of his sheep.',
   mo:'God cares for me like a shepherd cares for his sheep — I have all I truly need.'},
  {id:'gen11', ref:'Genesis 1:1',
   text:'In the beginning God created the heavens and the earth.',
   blank:'created', w:['found','bought'],
   my:'God made everything — the sky, the earth, and you.',
   mo:'God is the Maker of everything that exists — the heavens and the earth.'},
  {id:'rom323', ref:'Romans 3:23',
   text:'For all have sinned and fall short of the glory of God.',
   blank:'sinned', w:['slept','sung'],
   my:'Everybody does wrong things — so everybody needs Jesus.',
   mo:'Every person has sinned, so every person needs Jesus to rescue them.'},
  {id:'eph611', ref:'Ephesians 6:11',
   text:'Put on the full armor of God, so that you can take your stand.',
   blank:'armor', w:['shoes','crown'],
   my:'God gives us armor so we can stand strong and brave.',
   mo:'God gives us His armor so we can stand firm against wrong and stay strong.'},
  {id:'php413', ref:'Philippians 4:13',
   text:'I can do all things through Christ who strengthens me.',
   blank:'strengthens', w:['watches','follows'],
   my:'Jesus gives me strength to do hard things.',
   mo:'With Christ giving me strength, I can face whatever God calls me to do.'},
  {id:'pr35', ref:'Proverbs 3:5',
   text:'Trust in the Lord with all your heart, and lean not on your own understanding.',
   blank:'Trust', w:['Shout','Hide'],
   my:'Trust God more than my own ideas.',
   mo:'Trust God with your whole heart instead of leaning only on your own thinking.'},
  {id:'jos19', ref:'Joshua 1:9',
   text:'Be strong and courageous, for the Lord your God will be with you.',
   blank:'courageous', w:['quiet','careful'],
   my:'I don’t have to be scared — God is with me.',
   mo:'I can be strong and brave because God is with me everywhere I go.'},
  {id:'1jn419', ref:'1 John 4:19',
   text:'We love because he first loved us.',
   blank:'love', w:['sing','win'],
   my:'We can love others because God loved us first.',
   mo:'We are able to love others because God loved us first.'},
  {id:'ps119105', ref:'Psalm 119:105',
   text:'Your word is a lamp for my feet, a light on my path.',
   blank:'lamp', w:['gift','song'],
   my:'The Bible is like a light that shows me the way to go.',
   mo:'God’s Word lights the way, showing me how to live.'},
  {id:'mt2237', ref:'Matthew 22:37',
   text:'Love the Lord your God with all your heart and with all your soul and with all your mind.',
   blank:'Love', w:['Watch','Ask'],
   my:'Love God with your whole self.',
   mo:'Love God with everything you are — heart, soul, and mind.'},
  {id:'jn146', ref:'John 14:6',
   text:'Jesus answered, I am the way and the truth and the life.',
   blank:'way', w:['door','king'],
   my:'Jesus is the way to God.',
   mo:'Jesus is the way, the truth, and the life — the only way to the Father.'}
 ];

 function meaning(o){ return window.wzGrow.younger()?o.my:o.mo; }
 var BOX_DAYS=[0,1,3,7]; // interval added per box level 1..4
 function skey(){ return 'wz_verse_state_'+((window.APP&&APP.kid&&APP.kid.id)||'x'); }
 function state(){ try{ return JSON.parse(localStorage.getItem(skey())||'{}'); }catch(e){ return {}; } }
 function saveState(s){ try{ localStorage.setItem(skey(),JSON.stringify(s)); }catch(e){} }
 function todayN(){ var d=new Date(); return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000); }
 function strongCount(){ var s=state(); var n=0; for(var k in s){ if(s[k]&&s[k].box>=4)n++; } return n; }

 function bump(id,right){
  var s=state(); var cur=s[id]||{box:1,due:todayN()};
  if(right)cur.box=Math.min(4,cur.box+1); else cur.box=Math.max(1,cur.box-1);
  cur.due=todayN()+BOX_DAYS[cur.box-1];
  s[id]=cur; saveState(s);
 }
 function session(){
  var s=state(); var t=todayN();
  var due=[], fresh=[];
  V.forEach(function(v){ var st=s[v.id]; if(!st)fresh.push(v); else if((st.due||0)<=t)due.push({v:v,box:st.box||1}); });
  due.sort(function(a,b){ return a.box-b.box; });
  var out=due.map(function(x){return x.v;});
  for(var i=0; out.length<5 && i<fresh.length; i++)out.push(fresh[i]);
  if(!out.length){ out=V.slice(); shuffle(out); out=out.slice(0,5); } // all fresh & not due → light review
  return out.slice(0,5);
 }
 function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

 function blanked(v){
  var re=new RegExp('\\b'+v.blank.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b');
  return v.text.replace(re,"<span class='vk-slot'>_____</span>");
 }

 function launch(){
  var g=window.wzGrow; if(!g)return;
  vkCss();
  var o=g.overlay('wz-verse'); var body=o.body;
  var list=session(); var i=0;
  body.innerHTML="<div class='gv-wrap'>"+
    "<div class='gv-dots'>"+list.map(function(){return "<div class='gv-dot'></div>";}).join('')+"</div>"+
    "<div class='gv-card'></div><div class='gv-bar'></div></div>";
  var dots=body.querySelectorAll('.gv-dot'), card=body.querySelector('.gv-card'), bar=body.querySelector('.gv-bar');

  function teach(){
   var v=list[i]; dots.forEach(function(d,k){ d.classList.toggle('on',k<=i); });
   card.innerHTML="<div class='gv-emoji'>📌</div><h3 class='gv-h'>"+v.ref+"</h3>"+
     "<div class='gv-verse'><div class='gv-vt'>“"+v.text+"”</div><div class='gv-vr'>"+v.ref+"</div></div>"+
     "<p class='gv-p' style='font-size:.98rem'><b style='color:#f5c842'>What it means:</b> "+meaning(v)+"</p>";
   g.speak(v.text+'. '+meaning(v));
   bar.innerHTML=""; var b=btn('Practice it ›',''); b.onclick=recall; bar.appendChild(b);
  }

  function recall(){
   var v=list[i]; g.hush();
   card.innerHTML="<h3 class='gv-h' style='font-size:1.3rem'>Fill in the word</h3>"+
     "<div class='gv-verse'><div class='gv-vt vk-line'>“"+blanked(v)+"”</div><div class='gv-vr'>"+v.ref+"</div></div>"+
     "<div class='gv-choices'></div>";
   var wrap=card.querySelector('.gv-choices');
   var opts=[{t:v.blank,ok:true},{t:v.w[0],ok:false},{t:v.w[1],ok:false}]; shuffle(opts);
   bar.innerHTML="";
   opts.forEach(function(op){
    var c=document.createElement('button'); c.className='gv-choice'; c.style.textAlign='center'; c.textContent=op.t;
    c.onclick=function(){
     Array.prototype.forEach.call(wrap.children,function(x){ x.disabled=true; });
     var slot=card.querySelector('.vk-slot');
     if(op.ok){ c.classList.add('right'); if(slot){ slot.textContent=v.blank; slot.style.color='#7ee08a'; } bump(v.id,true); }
     else { c.classList.add('wrong');
      Array.prototype.forEach.call(wrap.children,function(x){ if(x.textContent===v.blank)x.classList.add('right'); });
      if(slot){ slot.textContent=v.blank; slot.style.color='#f5c842'; } bump(v.id,false); }
     var nx=btn(i===list.length-1?'Finish':'Next ›',''); nx.onclick=advance; bar.appendChild(nx);
    };
    wrap.appendChild(c);
   });
  }

  function advance(){ if(i===list.length-1)finish(); else { i++; teach(); } }

  function finish(){
   dots.forEach(function(d){ d.classList.add('on'); });
   var strong=strongCount();
   card.innerHTML="<div class='gv-emoji'>⭐</div><h3 class='gv-h'>Verses Kept Strong</h3>"+
     "<p class='gv-p'>You’re keeping <b style='color:#f5c842'>"+strong+"</b> of <b>"+V.length+"</b> verses strong. Come back tomorrow — the ones fading will pop up first so you never lose them.</p>"+
     "<p class='gv-p' style='font-size:.95rem;color:#cfc9ee'>Say one verse out loud to a grown-up before bed.</p>";
   g.speak('You are keeping '+strong+' verses strong. Great work!');
   bar.innerHTML=""; var d=btn('Done ✓',''); d.onclick=function(){ if(!g.doneToday(TAG)){ g.markToday(TAG); g.award('grow',10); } o.close(); };
   bar.appendChild(d);
  }

  function btn(label,cls){ var b=document.createElement('button'); b.className='gv-btn'+(cls?(' '+cls):''); b.textContent=label; return b; }
  teach();
 }

 function vkCss(){ if(document.getElementById('wz-vk-css'))return;
  var s=document.createElement('style'); s.id='wz-vk-css';
  s.textContent=".vk-slot{display:inline-block;min-width:64px;border-bottom:2px solid #f5c842;color:#f5c842;font-weight:900;text-align:center}.vk-line{line-height:1.7}";
  document.head.appendChild(s); }

 var tile={ id:TAG, emoji:'📌', title:'Verse Keeper',
   sub:'Keep your verses strong — and know what they mean', launch:launch,
   doneToday:function(){ return window.wzGrow&&window.wzGrow.doneToday(TAG); } };
 if(window.wzGrow&&window.wzGrow.add)window.wzGrow.add(tile);
 else (window.__wzGrowQ=window.__wzGrowQ||[]).push(tile);
})();
