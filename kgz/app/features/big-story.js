// The Big Story — the whole Bible as ONE story that lands on Jesus.
// A calm, narrated walk through the redemptive arc: Creation → Fall → Promise →
// Waiting → Jesus → the Cross → Resurrection → the Invitation → Forever. Each
// scene reads aloud (great for pre-readers) and is age-split. It ends by naming
// the point plainly: the whole Bible is about Jesus, and the child is invited
// into the story. Self-contained; registers a tile in the Grow Deeper hub.
(function(){
 if(window.__wzBigStory)return; window.__wzBigStory=1;
 var TAG='bigstory';

 // y = wording for 4–7, o = wording for 8–12. Verse text is ESV.
 var SCENES=[
  {e:'🌍',h:'In the Beginning',
   y:'God made everything. The sky, the sea, the animals, and you. And it was all very good. God made people to be His friends.',
   o:'In the beginning God made everything, and it was very good. He made people on purpose, to know Him, love Him, and be His friends.',
   v:'And God saw everything that he had made, and behold, it was very good.',vr:'Genesis 1:31'},
  {e:'💔',h:'Something Broke',
   y:'People chose to disobey God. That wrong choice is called sin. Sin broke our friendship with God, and let sad and broken things into the world.',
   o:'People chose to disobey God. That is what sin is. Sin broke our friendship with God and brought sadness, sickness, and death into a good world.',
   v:'Sin came into the world through one man, and death through sin.',vr:'Romans 5:12'},
  {e:'🌟',h:'God’s Big Promise',
   y:'But God did not give up on us! Right away, God promised to send a Rescuer who would make everything right again.',
   o:'But God did not give up on us. From the very start He promised to send a Rescuer, one who would defeat sin and make everything right again.',
   v:'I will put enmity between you and the woman, and between your offspring and her offspring; he shall bruise your head.',vr:'Genesis 3:15'},
  {e:'⏳',h:'The Long Wait',
   y:'For a long, long time God’s people waited and watched for the Rescuer. God was getting everything ready, just at the right time.',
   o:'For centuries God’s people waited and watched, holding on to the promise. God was preparing the world for exactly the right moment.',
   v:'For to us a child is born, to us a son is given… and his name shall be called… Prince of Peace.',vr:'Isaiah 9:6'},
  {e:'👶',h:'Jesus Came',
   y:'God kept His promise! He sent His own Son, Jesus. God the Son came to live with us as a real person. Jesus always did what was right. He never sinned.',
   o:'God kept His promise. He sent His own Son, Jesus, fully God, who became fully human and lived among us. Jesus never sinned. He always did what was right.',
   v:'And the Word became flesh and dwelt among us.',vr:'John 1:14'},
  {e:'✝️',h:'The Rescue',
   y:'Jesus loves us so much that He took the punishment for our sin. He died on the cross in our place. This was the rescue God had promised.',
   o:'Because He loves us, Jesus took the punishment our sin deserved. He died on the cross in our place, the innocent for the guilty. This was the rescue God promised.',
   v:'Christ also suffered once for sins, the righteous for the unrighteous, that he might bring us to God.',vr:'1 Peter 3:18'},
  {e:'🌅',h:'He’s Alive!',
   y:'But the story did not end at the cross. Three days later, Jesus came back to life! He beat sin and death forever. The Rescuer won!',
   o:'The cross was not the end. Three days later Jesus rose from the dead, alive again, forever. He defeated sin and death itself. The Rescuer won.',
   v:'He is not here, for he has risen, as he said.',vr:'Matthew 28:6'},
  {e:'❤️',h:'You’re Invited',
   y:'Now Jesus invites YOU. If you trust Him, He forgives every wrong thing and makes you part of God’s family forever.',
   o:'Now Jesus invites you in. To everyone who trusts Him, He gives forgiveness and makes them a child of God, part of His family forever.',
   v:'To all who did receive him, who believed in his name, he gave the right to become children of God.',vr:'John 1:12'},
  {e:'👑',h:'Forever',
   y:'One day Jesus will make everything new. No more crying, no more owies, no more goodbyes. God’s family will be with Him forever. You can be part of that story!',
   o:'One day Jesus will return and make all things new. No more crying, pain, or death. God’s people will be with Him forever. And you are invited into that story.',
   v:'He will wipe away every tear from their eyes… “Behold, I am making all things new.”',vr:'Revelation 21:4-5'}
 ];

 function txt(s){ return window.wzGrow.younger()?s.y:s.o; }

 function launch(){
  var g=window.wzGrow; if(!g)return;
  var o=g.overlay('wz-bigstory'); var body=o.body;
  body.innerHTML="<div class='gv-wrap'>"+
    "<div class='gv-dots'>"+SCENES.map(function(){return "<div class='gv-dot'></div>";}).join('')+"</div>"+
    "<div class='gv-card'></div>"+
    "<div class='gv-bar'></div></div>";
  var dots=body.querySelectorAll('.gv-dot');
  var card=body.querySelector('.gv-card');
  var bar=body.querySelector('.gv-bar');
  var i=0;

  function render(){
   var s=SCENES[i];
   dots.forEach(function(d,k){ d.classList.toggle('on',k<=i); });
   card.innerHTML="<div class='gv-emoji'>"+s.e+"</div><h3 class='gv-h'>"+s.h+"</h3>"+
     "<p class='gv-p'>"+txt(s)+"</p>"+
     "<div class='gv-verse'><div class='gv-vt'>“"+s.v+"”</div><div class='gv-vr'>"+s.vr+"</div></div>";
   g.speak(s.h+'. '+txt(s));
   var last=(i===SCENES.length-1);
   bar.innerHTML="";
   if(i>0){ var b=btn('‹ Back','ghost'); b.onclick=function(){ i--; render(); }; bar.appendChild(b); }
   var nx=btn(last?'Finish':'Next ›',''); nx.onclick=function(){ if(last)finish(); else { i++; render(); } };
   bar.appendChild(nx);
  }

  function finish(){
   dots.forEach(function(d){ d.classList.add('on'); });
   card.innerHTML="<div class='gv-emoji'>📖</div><h3 class='gv-h'>One Story</h3>"+
     "<p class='gv-p'>The whole Bible, from the very first page to the very last, is really <b>one story</b>. And it is all about <b style='color:#f5c842'>Jesus</b>, the Rescuer God promised.</p>"+
     "<p class='gv-p' style='font-size:.98rem;color:#cfc9ee'>Talk with a grown-up who loves you: which part of the story is your favorite, and why?</p>";
   g.speak('The whole Bible is really one story, and it is all about Jesus, the Rescuer God promised.');
   bar.innerHTML="";
   var done=btn('I finished the story ✓','');
   done.onclick=function(){ if(!g.doneToday(TAG)){ g.markToday(TAG); g.award('grow',10); } o.close(); };
   bar.appendChild(done);
  }

  function btn(label,cls){ var b=document.createElement('button'); b.className='gv-btn'+(cls?(' '+cls):''); b.textContent=label; return b; }
  render();
 }

 var tile={ id:TAG, emoji:'📖', title:'The Big Story',
   sub:'The whole Bible, one story, all about Jesus', launch:launch,
   doneToday:function(){ return window.wzGrow&&window.wzGrow.doneToday(TAG); } };
 if(window.wzGrow&&window.wzGrow.add)window.wzGrow.add(tile);
 else (window.__wzGrowQ=window.__wzGrowQ||[]).push(tile);
})();
