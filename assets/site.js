/* ============================================================
   The Gathering CTX - Shared site shell injector
   Renders the nav, mobile menu, and footer from ONE definition
   into <div id="site-header"></div> and <div id="site-footer"></div>.
   Change the nav once here and it updates on every page.
   Styling lives in /assets/site.css.
   ============================================================ */
(function () {
  "use strict";

  // ---- The single source of truth for the primary navigation ----
  var NAV = [
    { href: "/new-here",    label: "I'm New" },
    { href: "/belong",      label: "Connect" },
    { href: "/kids",        label: "Kids" },
    { href: "/sermons",     label: "Sermons" },
    { href: "/devotionals", label: "Devotionals" },
    { href: "/resources",   label: "Resources" },
    { href: "/generosity",  label: "Give", give: true }
  ];

  // Normalize a path for active-state comparison: drop trailing slash and .html
  function normalize(p) {
    if (!p) return "/";
    try { p = p.split("?")[0].split("#")[0]; } catch (e) {}
    p = p.replace(/\.html$/, "");
    if (p.length > 1) p = p.replace(/\/$/, "");
    return p === "" ? "/" : p;
  }

  var here = normalize(window.location.pathname);

  function isActive(href) {
    var h = normalize(href);
    if (h === "/") return here === "/";
    return here === h;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---- Build the desktop nav + mobile menu ----
  function buildHeader() {
    var desktop = NAV.map(function (l) {
      var cls = (l.give ? "nav-give-btn" : "") + (isActive(l.href) ? " active" : "");
      return '<a href="' + l.href + '"' + (cls.trim() ? ' class="' + cls.trim() + '"' : "") +
        (isActive(l.href) ? ' aria-current="page"' : "") + ">" + esc(l.label) + "</a>";
    }).join("");

    var mobile = NAV.map(function (l) {
      var cls = (l.give ? "mob-give" : "") + (isActive(l.href) ? " active" : "");
      return '<a href="' + l.href + '"' + (cls.trim() ? ' class="' + cls.trim() + '"' : "") +
        (isActive(l.href) ? ' aria-current="page"' : "") + ">" + esc(l.label) + "</a>";
    }).join("");

    return '' +
      '<nav class="nav">' +
        '<a href="/" class="nav-brand" aria-label="The Gathering CTX home">' +
          '<span class="nav-the">The</span><span class="nav-name">Gathering</span>' +
        '</a>' +
        '<div class="nav-links">' + desktop + '</div>' +
        '<button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile-menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</nav>' +
      '<div class="nav-mobile-menu" id="nav-mobile-menu">' + mobile + '</div>';
  }

  // ---- Build the footer ----
  function buildFooter() {
    return '' +
    '<footer class="site-footer">' +
      '<div class="footer-inner">' +
        '<div>' +
          '<a href="/"><span class="f-logo-the">The</span><span class="f-logo-name">Gathering</span></a>' +
          '<p class="f-tagline">Walk with victory. Not to it.</p>' +
          '<div class="f-social">' +
            '<a href="https://www.facebook.com/thegatheringctx" target="_blank" rel="noopener" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>' +
            '<a href="https://www.instagram.com/thegatheringctx" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>' +
            '<a href="https://podcasts.apple.com/us/podcast/the-gathering-ctx/id1892510293" target="_blank" rel="noopener" aria-label="Apple Podcasts"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 14.2c-2.5 0-4.7-1.2-6.1-3.2.6-1.2 2-2 3.6-2h5c1.6 0 3 .8 3.6 2-1.4 2-3.6 3.2-6.1 3.2z"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<span class="f-col-label">Join Us</span>' +
          '<span class="f-col-line">Sundays at 5:00 PM</span>' +
          '<span class="f-col-line">Cleburne Conference Center</span>' +
          '<span class="f-col-line">1501 W Henderson St</span>' +
          '<span class="f-col-line">Cleburne, TX 76033</span>' +
          '<a href="https://maps.google.com/?q=1501+W+Henderson+St+Cleburne+TX+76033" target="_blank" rel="noopener" class="f-map">Get Directions &rarr;</a>' +
        '</div>' +
        '<div>' +
          '<span class="f-col-label">Connect</span>' +
          '<a href="tel:+16822865640" class="f-col-link">(682) 286-5640</a>' +
          '<a href="mailto:info@gatheringctx.org" class="f-col-link">info@gatheringctx.org</a>' +
          '<a href="sms:+18175184773&body=VISIT" class="f-col-link" style="margin-top:14px">Text VISIT to (817) 518-4773</a>' +
        '</div>' +
        '<div>' +
          '<span class="f-col-label">Site</span>' +
          '<a href="/new-here" class="f-col-link">I\'m New</a>' +
          '<a href="/belong" class="f-col-link">Belong &amp; Become</a>' +
          '<a href="/formed" class="f-col-link">Formed &amp; Sent</a>' +
          '<a href="/sermons" class="f-col-link">Sermons</a>' +
          '<a href="/devotionals" class="f-col-link">Devotionals</a>' +
          '<a href="/teaching" class="f-col-link">Teaching by Series</a>' +
          '<a href="/kids" class="f-col-link">Kids</a>' +
          '<a href="/our-story" class="f-col-link">Our Story</a>' +
          '<a href="/beliefs" class="f-col-link">What We Believe</a>' +
          '<a href="/generosity" class="f-col-link">Give</a>' +
          '<a href="/privacy" class="f-col-link">Privacy</a>' +
          '<a href="/bylaws.pdf" class="f-col-link" target="_blank" rel="noopener">Bylaws</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<p>&copy; 2026 The Gathering CTX &nbsp;&middot;&nbsp; Cleburne, TX &nbsp;&middot;&nbsp; <a href="/privacy">Privacy Policy</a></p>' +
        '<p style="font-style:italic">Photography by <a href="https://www.instagram.com/captured.by.kendra_" target="_blank" rel="noopener">@captured.by.kendra_</a></p>' +
      '</div>' +
    '</footer>';
  }

  // ---- Wire the hamburger + mobile menu ----
  function wire() {
    var btn = document.getElementById("nav-hamburger");
    var menu = document.getElementById("nav-mobile-menu");
    if (!btn || !menu) return;

    function close() {
      menu.classList.remove("open");
      btn.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // ---- Mount ----
  // Ensure the brand typefaces are present on every page (Cormorant Garamond
  // for display, Nunito Sans for body/labels). Many pages already load them;
  // this covers the ones that don't so the whole site shares one type system.
  function ensureFonts() {
    if (document.querySelector('link[href*="Cormorant"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Nunito+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(l);
  }

  // Ensure the brand favicon, home-screen icons, manifest, and theme color are
  // present on every page. The root /favicon.ico is auto-requested by browsers,
  // but this adds the richer PNG/SVG icons and manifest where a page lacks them.
  function ensureIcons() {
    var head = document.head;
    function add(html, testSel) {
      if (testSel && document.querySelector(testSel)) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      head.appendChild(tmp.firstChild);
    }
    add('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">', 'link[rel="icon"][sizes="32x32"]');
    add('<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">', 'link[rel="icon"][sizes="16x16"]');
    add('<link rel="apple-touch-icon" href="/apple-touch-icon.png">', 'link[rel="apple-touch-icon"]');
    add('<link rel="manifest" href="/site.webmanifest">', 'link[rel="manifest"]');
    add('<meta name="theme-color" content="#0a0a0a">', 'meta[name="theme-color"]');
  }

  // Skip-to-content link for keyboard and screen-reader users.
  function addSkipLink() {
    if (document.querySelector(".skip-link")) return;
    var a = document.createElement("a");
    a.className = "skip-link";
    a.href = "#";
    a.textContent = "Skip to content";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector("main, [role=main], article, .fp-wrap, .article-wrapper, .dt-article, .st-wrap");
      if (!target) {
        var secs = [].slice.call(document.querySelectorAll("section"));
        target = secs.filter(function (s) { return !s.closest("#site-header"); })[0];
      }
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    document.body.insertBefore(a, document.body.firstChild);
  }

  // Gentle scroll-reveal for below-the-fold <section>s. Progressive enhancement:
  // only sections that start below the fold are animated (nothing above it
  // flickers), and the whole thing is skipped under reduced-motion or when
  // IntersectionObserver is unavailable, leaving all content visible.
  function addReveals() {
    if (!("IntersectionObserver" in window)) return;
    try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (e) {}
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    [].forEach.call(document.querySelectorAll("section"), function (s) {
      if (s.classList.contains("hero") || s.classList.contains("page-hero")) return;
      if (s.getBoundingClientRect().top < vh * 0.9) return;
      s.classList.add("reveal");
      io.observe(s);
    });
  }

  function mount() {
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) header.innerHTML = buildHeader();
    if (footer) footer.innerHTML = buildFooter();
    ensureFonts();
    ensureIcons();
    addSkipLink();
    wire();
    addReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
