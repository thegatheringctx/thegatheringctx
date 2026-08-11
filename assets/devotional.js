/* ============================================================
   The Gathering CTX — Interactive devotional reader
   A self-contained enhancement layer added to devotional pages:
     • a slim reading-progress bar at the top of the window
     • a reading streak kept in localStorage (🔥 N-day streak)
     • a share button (native share sheet, or copy-link fallback)
   It does not parse the page's own markup, so it is safe on every
   devotional regardless of how that page is built.
   Add with: <script src="/assets/devotional.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  // ---- styles ----
  var css = '' +
  '.dv-progress{position:fixed;top:0;left:0;height:3px;width:0;background:#b8935a;z-index:200;transition:width .1s linear;pointer-events:none}' +
  '.dv-share{position:fixed;right:20px;bottom:20px;z-index:190;display:inline-flex;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:#0a0a0a;background:#b8935a;border:none;border-radius:999px;padding:12px 20px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);transition:transform .15s,filter .15s}' +
  '.dv-share:hover{filter:brightness(1.08);transform:translateY(-1px)}' +
  '.dv-share svg{width:15px;height:15px}' +
  '.dv-streak{position:fixed;left:20px;bottom:20px;z-index:190;display:none;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:.7rem;letter-spacing:.04em;color:#fff;background:rgba(10,10,10,.92);border:1px solid rgba(184,147,90,.5);border-radius:999px;padding:9px 16px;box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
  '.dv-streak.show{display:inline-flex}' +
  '.dv-streak b{color:#b8935a;font-weight:700}' +
  '.dv-toast{position:fixed;left:50%;bottom:78px;transform:translateX(-50%) translateY(10px);z-index:210;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:.8rem;color:#fff;background:rgba(10,10,10,.96);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:11px 18px;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:90vw;text-align:center}' +
  '.dv-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
  '@media(max-width:600px){.dv-share{right:14px;bottom:14px;padding:11px 16px}.dv-streak{left:14px;bottom:14px}}' +
  '@media print{.dv-progress,.dv-share,.dv-streak,.dv-toast{display:none!important}}';
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- elements ----
  var bar = document.createElement("div");
  bar.className = "dv-progress";
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", "Reading progress");

  var share = document.createElement("button");
  share.className = "dv-share";
  share.type = "button";
  share.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg><span>Share</span>';

  var streak = document.createElement("div");
  streak.className = "dv-streak";

  var toast = document.createElement("div");
  toast.className = "dv-toast";

  function mount() {
    document.body.appendChild(bar);
    document.body.appendChild(share);
    document.body.appendChild(streak);
    document.body.appendChild(toast);
    wireProgress();
    wireShare();
    runStreak();
  }

  // ---- reading progress ----
  function wireProgress() {
    function update() {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (h.scrollTop || document.body.scrollTop) / max * 100));
      bar.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", Math.round(pct));
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ---- toast helper ----
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  // ---- share ----
  function wireShare() {
    share.addEventListener("click", function () {
      var data = { title: document.title, text: "A devotional from The Gathering CTX", url: location.href };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () {
          showToast("Link copied — text it to a friend.");
        }).catch(function () { showToast(location.href); });
      } else {
        showToast(location.href);
      }
    });
  }

  // ---- reading streak ----
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function daysBetween(aKey, bKey) {
    var a = aKey.split("-"), b = bKey.split("-");
    var da = new Date(a[0], a[1] - 1, a[2]), db = new Date(b[0], b[1] - 1, b[2]);
    return Math.round((db - da) / 86400000);
  }
  function runStreak() {
    var LAST = "tg_devo_last", CNT = "tg_devo_streak";
    var today = todayKey(), last, count;
    try { last = localStorage.getItem(LAST); count = parseInt(localStorage.getItem(CNT) || "0", 10) || 0; }
    catch (e) { return; } // storage blocked — skip streak silently

    if (last !== today) {
      var gap = last ? daysBetween(last, today) : null;
      count = (gap === 1) ? count + 1 : 1; // consecutive day continues; otherwise restart
      try { localStorage.setItem(LAST, today); localStorage.setItem(CNT, String(count)); } catch (e) {}
      if (count >= 2) setTimeout(function () { showToast("🔥 " + count + "-day reading streak — keep going."); }, 900);
    }
    if (count >= 1) {
      streak.innerHTML = '🔥&nbsp; <b>' + count + '</b>&nbsp; day' + (count === 1 ? '' : 's');
      streak.title = "Your reading streak";
      streak.classList.add("show");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
