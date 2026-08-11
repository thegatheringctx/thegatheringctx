/* ============================================================
   The Gathering CTX - Kids Zone shell injector
   Renders the playful kids nav + footer from one definition into
   <div id="kids-header"></div> and <div id="kids-footer"></div>.
   Styling: /assets/kids-shell.css
   ============================================================ */
(function () {
  "use strict";

  var NAV = [
    { href: "/kids", label: "Home" },
    { href: "/kids-games.html", label: "Games" },
    { href: "/check-in.html", label: "Check-In" },
    { href: "/", label: "Main Site", main: true }
  ];

  function normalize(p) {
    if (!p) return "/";
    p = p.split("?")[0].split("#")[0].replace(/\.html$/, "");
    if (p.length > 1) p = p.replace(/\/$/, "");
    return p || "/";
  }
  var here = normalize(location.pathname);
  function active(href) {
    var h = normalize(href);
    return h === "/" ? here === "/" : here === h;
  }
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

  // Ensure the playful fonts are present (kids pages usually load them already).
  function ensureFonts() {
    if (document.querySelector('link[href*="Fredoka"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap";
    document.head.appendChild(l);
  }

  function link(l, cls) {
    var c = (l.main ? "kz-main " : "") + (active(l.href) ? "active" : "");
    return '<a href="' + l.href + '"' + (c.trim() ? ' class="' + c.trim() + '"' : "") +
      (active(l.href) ? ' aria-current="page"' : "") + ">" + esc(l.label) + "</a>";
  }

  function header() {
    return '' +
      '<nav class="kz-nav">' +
        '<a href="/kids" class="kz-brand"><span class="kz-emoji">🦁</span>Kids Zone</a>' +
        '<div class="kz-links">' + NAV.map(function (l) { return link(l); }).join("") + '</div>' +
        '<button class="kz-burger" id="kz-burger" aria-label="Open menu" aria-expanded="false" aria-controls="kz-mobile"><span></span><span></span><span></span></button>' +
      '</nav>' +
      '<div class="kz-mobile" id="kz-mobile">' + NAV.map(function (l) { return link(l); }).join("") + '</div>';
  }

  function footer() {
    return '' +
      '<footer class="kz-footer">' +
        '<div class="kz-f-logo">Kids Gathering Zone</div>' +
        '<div class="kz-f-line">Sundays at 5:00 PM &middot; Cleburne Conference Center<br>Where kids meet Jesus and have a blast doing it.</div>' +
        '<div class="kz-f-links">' +
          '<a href="/kids">Kids Home</a>' +
          '<a href="/check-in.html">Check-In</a>' +
          '<a href="/">Main Site</a>' +
        '</div>' +
        '<div class="kz-f-note">&copy; The Gathering CTX &middot; Kids Zone</div>' +
      '</footer>';
  }

  function wire() {
    var b = document.getElementById("kz-burger"), m = document.getElementById("kz-mobile");
    if (!b || !m) return;
    function close(){ m.classList.remove("open"); b.classList.remove("open"); b.setAttribute("aria-expanded","false"); }
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = m.classList.toggle("open");
      b.classList.toggle("open", open);
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
    m.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("click", function (e) { if (!m.contains(e.target) && !b.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  function mount() {
    ensureFonts();
    var h = document.getElementById("kids-header"), f = document.getElementById("kids-footer");
    if (h) h.innerHTML = header();
    if (f) f.innerHTML = footer();
    wire();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
