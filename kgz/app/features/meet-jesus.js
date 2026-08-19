// Meet Jesus — the gospel, told gently, for a child.
// A clear good-news walk: God loves you → sin is a real problem → Jesus is the
// rescue → it's a free gift → here's how to respond. The response is never
// pressured and the app never "closes" a decision: every path hands the child
// to a parent or pastor, because a real person who loves them should walk with
// them next. No points are awarded here on purpose — this isn't a game to win.
// Reviewed for biblical soundness before shipping. Registers in Grow Deeper.
(function(){
 if(window.__wzGospel)return; window.__wzGospel=1;
 var TAG='gospel';

 var SCENES=[
  {e:'❤️',h:'God Loves You',
   y:'God made you on purpose, and He loves you more than you can imagine. He wants to be your friend forever.',
   o:'God made you on purpose and loves you more than you can imagine. He knows everything about you, and He wants you to know Him forever.',
   v:'See what great love the Father has lavished on us, that we should be called children of God.',vr:'1 John 3:1'},
  {e:'😔',h:'We Have a Problem',
   y:'But all of us do wrong things — that’s called sin. Sin gets in the way between us and God, and we can’t fix it by ourselves.',
   o:'But every one of us has sinned — we’ve all done, said, and thought wrong things. Sin separates us from God, and no amount of trying can fix it on our own.',
   v:'For all have sinned and fall short of the glory of God.',vr:'Romans 3:23'},
  {e:'✝️',h:'Jesus Is the Rescue',
   y:'God loves us so much He sent Jesus. Jesus never did anything wrong, but He took our punishment on the cross — and then came back to life!',
   o:'God loved us so much that He sent Jesus. Jesus lived a perfect life, then took the punishment for our sin on the cross, and rose from the dead — defeating sin and death.',
   v:'God demonstrates his own love for us in this: While we were still sinners, Christ died for us.',vr:'Romans 5:8'},
  {e:'🎁',h:'It’s a Gift',
   y:'You can’t earn it by being good enough. Jesus offers to forgive you and make you God’s child — as a free gift, to anyone who trusts Him.',
   o:'You can’t earn this by being good enough — no one can. Forgiveness and new life are a free gift from Jesus, given to everyone who turns from sin and trusts Him.',
   v:'For it is by grace you have been saved, through faith… it is the gift of God.',vr:'Ephesians 2:8'},
  {e:'🙋',h:'How to Respond',
   y:'You can talk to Jesus in your own words: tell Him you’re sorry for your sin, thank Him for what He did, and ask Him to be your Savior and King.',
   o:'Responding is simple and real: tell Jesus you’re sorry for your sin, believe He died and rose for you, thank Him, and ask Him to be your Savior and King of your life.',
   v:'If you declare… “Jesus is Lord,” and believe… you will be saved.',vr:'Romans 10:9'}
 ];

 function txt(s){ return window.wzGrow.younger()?s.y:s.o; }

 function launch(){
  var g=window.wzGrow; if(!g)return;
  var o=g.overlay('wz-gospel'); var body=o.body;
  body.innerHTML="<div class='gv-wrap'>"+
    "<div class='gv-dots'>"+SCENES.map(function(){return "<div class='gv-dot'></div>";}).join('')+
      "<div class='gv-dot'></div></div>"+  // extra dot for the response step
    "<div class='gv-card'></div><div class='gv-bar'></div></div>";
  var dots=body.querySelectorAll('.gv-dot'), card=body.querySelector('.gv-card'), bar=body.querySelector('.gv-bar');
  var i=0;

  function render(){
   var s=SCENES[i]; dots.forEach(function(d,k){ d.classList.toggle('on',k<=i); });
   card.innerHTML="<div class='gv-emoji'>"+s.e+"</div><h3 class='gv-h'>"+s.h+"</h3>"+
     "<p class='gv-p'>"+txt(s)+"</p>"+
     "<div class='gv-verse'><div class='gv-vt'>“"+s.v+"”</div><div class='gv-vr'>"+s.vr+"</div></div>";
   g.speak(s.h+'. '+txt(s));
   bar.innerHTML="";
   if(i>0){ var b=btn('‹ Back','ghost'); b.onclick=function(){ i--; render(); }; bar.appendChild(b); }
   var nx=btn(i===SCENES.length-1?'What now? ›':'Next ›',''); nx.onclick=function(){ if(i===SCENES.length-1)respond(); else { i++; render(); } };
   bar.appendChild(nx);
  }

  function respond(){
   dots.forEach(function(d){ d.classList.add('on'); });
   g.hush();
   card.innerHTML="<div class='gv-emoji'>🕊️</div><h3 class='gv-h'>Would You Like to Trust Jesus?</h3>"+
     "<p class='gv-p'>There’s no rush and no pressure — Jesus is patient and kind. What feels true for you right now?</p>";
   bar.innerHTML="";
   var wrap=document.createElement('div'); wrap.className='gv-choices'; card.appendChild(wrap);
   wrap.appendChild(choice('🙏  I want to trust Jesus', pray));
   wrap.appendChild(choice('❓  I have questions', questions));
   wrap.appendChild(choice('💭  I’m still thinking', thinking));
  }

  function pray(){
   card.innerHTML="<div class='gv-emoji'>🙏</div><h3 class='gv-h'>You Can Pray</h3>"+
     "<p class='gv-p'>You can talk to Jesus right now, in your own words. If you’d like, you can pray something like this:</p>"+
     "<div class='gv-verse'><div class='gv-vt'>“Dear Jesus, I know I’ve done wrong things, and I’m sorry. Thank You for dying on the cross for me and coming back to life. Please forgive me and be my Savior and my King. I want to follow You. Amen.”</div></div>"+
     "<p class='gv-p' style='font-weight:800;color:#f5c842'>Really important next step:</p>"+
     "<p class='gv-p'>Go tell your mom, dad, or your pastor today. They will be so happy — and they’ll help you take your next steps with Jesus. This is bigger than an app, and you shouldn’t walk it alone.</p>";
   g.speak('You can talk to Jesus in your own words. And an important next step: go tell your mom, dad, or your pastor. They will be so happy to help you.');
   endBar();
  }
  function questions(){
   card.innerHTML="<div class='gv-emoji'>❓</div><h3 class='gv-h'>Questions Are Good</h3>"+
     "<p class='gv-p'>Having questions is a <b>great</b> thing — God is not scared of your questions, and neither are we.</p>"+
     "<p class='gv-p'>The best thing to do is ask a grown-up who loves Jesus — your parents, or your pastor. They would <b>love</b> to sit down and talk with you about anything you’re wondering.</p>";
   g.speak('Questions are good! God is not scared of your questions. Ask a grown-up who loves Jesus — your parents or your pastor.');
   endBar();
  }
  function thinking(){
   card.innerHTML="<div class='gv-emoji'>💭</div><h3 class='gv-h'>That’s Okay</h3>"+
     "<p class='gv-p'>That’s completely okay. Jesus is patient, and He’ll be right here whenever you’re ready. There’s no pressure at all.</p>"+
     "<p class='gv-p'>You can come back any time — and you can always talk with a grown-up who loves you about what you’re thinking.</p>";
   g.speak('That is okay. Jesus is patient and He will be here whenever you are ready. There is no pressure at all.');
   endBar();
  }

  function endBar(){
   bar.innerHTML="";
   var d=btn('Close ✓',''); d.onclick=function(){ g.markToday(TAG); o.close(); };
   bar.appendChild(d);
  }
  function choice(label,fn){ var c=document.createElement('button'); c.className='gv-choice'; c.style.textAlign='center'; c.textContent=label; c.onclick=fn; return c; }
  function btn(label,cls){ var b=document.createElement('button'); b.className='gv-btn'+(cls?(' '+cls):''); b.textContent=label; return b; }
  render();
 }

 var tile={ id:TAG, emoji:'🕊️', title:'Meet Jesus',
   sub:'The best news in the whole world', launch:launch,
   doneToday:function(){ return window.wzGrow&&window.wzGrow.doneToday(TAG); } };
 if(window.wzGrow&&window.wzGrow.add)window.wzGrow.add(tile);
 else (window.__wzGrowQ=window.__wzGrowQ||[]).push(tile);
})();
