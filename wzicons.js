// wz-icons — a small, cohesive custom SVG icon set to replace the emoji.
// Modern line-style icons (Lucide/Linear feel): 24x24, single stroke, rounded
// joins, drawn in the app's gold via currentColor. One source of truth so every
// surface (Locker, armor tab, welcome) reads as one designed system, not clip-art.
// window.wzIcon(name, size) -> SVG string. Unknown name falls back to a shield.
(function(){
 if(window.wzIcon)return;

 var P={
  // Armor of God (Ephesians 6)
  belt:        "<rect x='3' y='9.5' width='18' height='5' rx='1.6'/><rect x='9.5' y='8' width='5' height='8' rx='1.2'/><path d='M12 10.4v3.2'/>",
  breastplate: "<path d='M7 4.5h10v6.5a5 5 0 0 1-10 0z'/><path d='M12 4.5v12'/><path d='M7 8h10'/>",
  boots:       "<path d='M9 3h4v10h3a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1z'/>",
  shield:      "<path d='M12 3 4 6v5.2c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6z'/><path d='M12 8.4v6.2M9 11.5h6'/>",
  helmet:      "<path d='M5 12a7 7 0 0 1 14 0v2.6A2.4 2.4 0 0 1 16.6 17H7.4A2.4 2.4 0 0 1 5 14.6z'/><path d='M9 12h6M12 4.6V3'/>",
  sword:       "<path d='M14.5 17.5 4 7V4h3l10.5 10.5'/><path d='M13 19l6-6'/><path d='M16 16l4 4'/><path d='M19 21l2-2'/>",
  full:        "<path d='M3.5 8l3.6 3.4L12 5l4.9 6.4L20.5 8 19 18H5z'/><path d='M5 20.5h14'/>",
  // supporting UI icons
  target:      "<circle cx='12' cy='12' r='8'/><circle cx='12' cy='12' r='4'/><circle cx='12' cy='12' r='.6' fill='currentColor'/>",
  gift:        "<rect x='4' y='9' width='16' height='11' rx='1.6'/><path d='M4 12.5h16M12 9v11'/><path d='M12 9S10.5 4.5 8.2 5.2 9 9 12 9zM12 9s1.5-4.5 3.8-3.8S15 9 12 9z'/>",
  star:        "<path d='M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z'/>",
  flame:       "<path d='M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2.5C10 12 9 9 12 3z'/>",
  book:        "<path d='M5 4.5h11a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H5z'/><path d='M5 4.5A1.5 1.5 0 0 0 3.5 6v13A1.5 1.5 0 0 1 5 20.5'/>",
  trophy:      "<path d='M8 4h8v4a4 4 0 0 1-8 0z'/><path d='M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3'/><path d='M12 12v4M9 20h6M10 20l.5-4M14 20l-.5-4'/>",
  heart:       "<path d='M12 20s-6.8-4.4-6.8-9.4A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 6.8 2.6C18.8 15.6 12 20 12 20z'/>",
  play:        "<circle cx='12' cy='12' r='8.5'/><path d='M10.2 8.6l5 3.4-5 3.4z'/>",
  bolt:        "<path d='M13 3 5.5 13H10l-1 8 8.5-11H13z'/>"
 };

 window.wzIcon=function(name, size){
  var d=P[name]||P.shield; size=size||28;
  return "<svg class='wz-ic' width='"+size+"' height='"+size+"' viewBox='0 0 24 24' fill='none' stroke='currentColor' "+
   "stroke-width='1.85' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>"+d+"</svg>";
 };

 // one-time style: gold color + a hairline glow for depth; inline in text nicely.
 if(!document.getElementById('wz-ic-css')){
  var s=document.createElement('style'); s.id='wz-ic-css';
  s.textContent=".wz-ic{color:#f5c842;vertical-align:middle;filter:drop-shadow(0 1px 3px rgba(245,200,66,.25))}";
  document.head.appendChild(s);
 }
})();
