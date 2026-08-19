// Big Truths — a kids' catechism that sticks.
// Short question-and-answer foundations of the faith, read aloud and age-split.
// Each truth is taught, then gently checked (a wrong tap just reveals the answer
// kindly — never a penalty). "Mastered" truths are remembered in localStorage
// and resurface less often, so a round always leads with what the child hasn't
// locked in yet: simple spaced review, no backend. Registers in Grow Deeper.
(function(){
 if(window.__wzCat)return; window.__wzCat=1;
 var TAG='catechism';

 // ao = answer for 8–12, ay = simpler answer for 4–7. c[0] is the correct
 // check option; c[1],c[2] are gentle, clearly-different distractors.
 var Q=[
  {id:'made', q:'Who made you and everything?',
   ay:'God made everything, and God made me.',
   ao:'God made everything that exists, and God made me.',
   v:'In the beginning God created the heavens and the earth.',vr:'Genesis 1:1',
   c:['God made everything and made me.','Everything made itself.','No one really knows.']},
  {id:'why', q:'Why did God make you?',
   ay:'To know Him and love Him.',
   ao:'To know Him, love Him, and bring Him glory.',
   v:'…whom I created for my glory.',vr:'Isaiah 43:7',
   c:['To know, love, and glorify God.','So I could do whatever I want.','For no reason at all.']},
  {id:'god', q:'What is God like?',
   ay:'God is holy, loving, and perfect. There is only one God.',
   ao:'God is holy, loving, and perfect — the one true God, who has always been and always will be.',
   v:'Holy, holy, holy is the Lord God Almighty.',vr:'Revelation 4:8',
   c:['Holy, loving, and perfect.','Sometimes good, sometimes not.','Just a made-up idea.']},
  {id:'one', q:'How many true Gods are there?',
   ay:'One! The one true God — the Father, the Son, and the Holy Spirit.',
   ao:'There is only one true God, who is Father, Son, and Holy Spirit — three persons, one God.',
   v:'The Lord our God, the Lord is one.',vr:'Deuteronomy 6:4',
   c:['One true God — Father, Son, and Spirit.','Lots of different gods.','One god for each country.']},
  {id:'jesus', q:'Who is Jesus?',
   ay:'Jesus is God’s Son, who became a person to save us.',
   ao:'Jesus is the Son of God, fully God and fully man, who came to save us.',
   v:'The Word became flesh and made his dwelling among us.',vr:'John 1:14',
   c:['God’s Son, who came to save us.','Just a nice teacher, nothing more.','A made-up hero.']},
  {id:'sin', q:'What is sin?',
   ay:'Sin is doing, saying, or thinking what is wrong against God. Everyone sins.',
   ao:'Sin is anything we do, say, or think that goes against God. Everyone has sinned.',
   v:'For all have sinned and fall short of the glory of God.',vr:'Romans 3:23',
   c:['Anything against God — and everyone sins.','Only really big crimes.','Something only other people do.']},
  {id:'save', q:'Can being good enough save you from sin?',
   ay:'No. Only Jesus can save us.',
   ao:'No — we cannot save ourselves by being good. Only Jesus can save us.',
   v:'…by grace you have been saved… not by works.',vr:'Ephesians 2:8-9',
   c:['No — only Jesus can save us.','Yes, if I try really hard.','Yes, if I’m nicer than others.']},
  {id:'cross', q:'How did Jesus save us?',
   ay:'Jesus died on the cross for our sin, and rose again.',
   ao:'Jesus took the punishment for our sin by dying on the cross, and rose from the dead.',
   v:'Christ died for our sins… he was raised on the third day.',vr:'1 Corinthians 15:3-4',
   c:['He died for our sin and rose again.','He just gave good advice.','He never really came back.']},
  {id:'trust', q:'How does someone become part of God’s family?',
   ay:'By trusting Jesus — not by being good enough.',
   ao:'By turning from sin and trusting in Jesus — not by our own goodness.',
   v:'…believe in the Lord Jesus, and you will be saved.',vr:'Acts 16:31',
   c:['By trusting in Jesus.','By collecting enough good points.','By being born in a church.']},
  {id:'bible', q:'What is the Bible?',
   ay:'The Bible is God’s true Word to us.',
   ao:'The Bible is God’s true Word — breathed out by God to teach and guide us.',
   v:'All Scripture is God-breathed…',vr:'2 Timothy 3:16',
   c:['God’s true Word to us.','Just old stories people made up.','A book of magic spells.']},
  {id:'love', q:'What does God want us to do?',
   ay:'Love God with all our heart, and love others.',
   ao:'Love God with all our heart, soul, mind, and strength — and love our neighbor as ourselves.',
   v:'Love the Lord your God… love your neighbor as yourself.',vr:'Matthew 22:37-39',
   c:['Love God and love others.','Only take care of myself.','Just follow lots of rules to look good.']},
  {id:'hope', q:'What is our forever hope?',
   ay:'To be with God forever, where He makes everything new.',
   ao:'To be with God forever in a world made new, with no more crying, pain, or death.',
   v:'He will wipe every tear… “I am making everything new!”',vr:'Revelation 21:4-5',
   c:['To be with God forever, all made new.','That nothing happens after this.','To finally get everything I want.']}
 ];

 function ans(o){ return window.wzGrow.younger()?o.ay:o.ao; }
 function mkey(){ return 'wz_cat_mastered_'+((window.APP&&APP.kid&&APP.kid.id)||'x'); }
 function mastered(){ try{ return JSON.parse(localStorage.getItem(mkey())||'[]'); }catch(e){ return []; } }
 function master(id){ try{ var m=mastered(); if(m.indexOf(id)<0){ m.push(id); localStorage.setItem(mkey(),JSON.stringify(m)); } }catch(e){} }

 // Build a round: lead with not-yet-mastered, then fill with review.
 function round(){
  var m=mastered();
  var fresh=Q.filter(function(q){ return m.indexOf(q.id)<0; });
  var review=Q.filter(function(q){ return m.indexOf(q.id)>=0; });
  shuffle(review);
  var out=fresh.slice(0,5);
  for(var i=0; out.length<5 && i<review.length; i++)out.push(review[i]);
  return out;
 }
 function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

 function launch(){
  var g=window.wzGrow; if(!g)return;
  var o=g.overlay('wz-cat'); var body=o.body;
  var list=round(); var i=0;
  body.innerHTML="<div class='gv-wrap'>"+
    "<div class='gv-dots'>"+list.map(function(){return "<div class='gv-dot'></div>";}).join('')+"</div>"+
    "<div class='gv-card'></div><div class='gv-bar'></div></div>";
  var dots=body.querySelectorAll('.gv-dot'), card=body.querySelector('.gv-card'), bar=body.querySelector('.gv-bar');

  function teach(){
   var q=list[i]; dots.forEach(function(d,k){ d.classList.toggle('on',k<=i); });
   card.innerHTML="<div class='gv-emoji'>💡</div><h3 class='gv-h'>"+q.q+"</h3>"+
     "<p class='gv-p'><b style='color:#f5c842'>"+ans(q)+"</b></p>"+
     "<div class='gv-verse'><div class='gv-vt'>“"+q.v+"”</div><div class='gv-vr'>"+q.vr+"</div></div>";
   g.speak(q.q+' '+ans(q));
   bar.innerHTML="";
   var b=btn('Say it back, then check ›',''); b.onclick=check; bar.appendChild(b);
  }

  function check(){
   var q=list[i]; g.hush();
   card.innerHTML="<h3 class='gv-h' style='font-size:1.5rem'>"+q.q+"</h3><div class='gv-choices'></div>";
   var wrap=card.querySelector('.gv-choices');
   var opts=q.c.map(function(t,k){ return {t:t,ok:k===0}; }); shuffle(opts);
   bar.innerHTML="";
   opts.forEach(function(op){
    var c=document.createElement('button'); c.className='gv-choice'; c.textContent=op.t;
    c.onclick=function(){
     Array.prototype.forEach.call(wrap.children,function(x){ x.disabled=true; });
     if(op.ok){ c.classList.add('right'); master(q.id); }
     else { c.classList.add('wrong');
      Array.prototype.forEach.call(wrap.children,function(x){ if(x.textContent===q.c[0])x.classList.add('right'); }); }
     var nx=btn(i===list.length-1?'Finish':'Next ›',''); nx.onclick=advance; bar.appendChild(nx);
    };
    wrap.appendChild(c);
   });
  }

  function advance(){ if(i===list.length-1)finish(); else { i++; teach(); } }

  function finish(){
   var m=mastered().length;
   dots.forEach(function(d){ d.classList.add('on'); });
   card.innerHTML="<div class='gv-emoji'>🏅</div><h3 class='gv-h'>Well done!</h3>"+
     "<p class='gv-p'>You know <b style='color:#f5c842'>"+m+"</b> of <b>"+Q.length+"</b> big truths. Keep coming back — the ones you’re still learning will show up first.</p>"+
     "<p class='gv-p' style='font-size:.95rem;color:#cfc9ee'>Try teaching one big truth to someone in your family tonight.</p>";
   g.speak('Well done! You know '+m+' of '+Q.length+' big truths.');
   bar.innerHTML="";
   var d=btn('Done ✓',''); d.onclick=function(){ if(!g.doneToday(TAG)){ g.markToday(TAG); g.award('grow',10); } o.close(); };
   bar.appendChild(d);
  }

  function btn(label,cls){ var b=document.createElement('button'); b.className='gv-btn'+(cls?(' '+cls):''); b.textContent=label; return b; }
  teach();
 }

 var tile={ id:TAG, emoji:'💡', title:'Big Truths',
   sub:'Know what you believe — one truth at a time', launch:launch,
   doneToday:function(){ return window.wzGrow&&window.wzGrow.doneToday(TAG); } };
 if(window.wzGrow&&window.wzGrow.add)window.wzGrow.add(tile);
 else (window.__wzGrowQ=window.__wzGrowQ||[]).push(tile);
})();
