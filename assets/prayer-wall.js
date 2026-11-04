/* Prayer wall. Shows approved requests from /prayer-wall/data/wall.json and
   lets anyone tap "I prayed". Requests only appear after the person opted in
   on /prayer and the pastoral team approved them. */
(function () {
  "use strict";
  var root = document.getElementById("prayer-wall");
  if (!root) return;
  var API = "/.netlify/functions/prayed";
  var KEY = "gctx-prayed-v1";
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mine() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function remember(id) { var m = mine(); m[id] = new Date().toISOString().slice(0, 10); try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function prayedToday(id) { return mine()[id] === new Date().toISOString().slice(0, 10); }
  function label(n) { return n === 1 ? "1 person has prayed" : n + " people have prayed"; }

  fetch("/prayer-wall/data/wall.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    var list = (data && data.requests) || [];
    if (!list.length) {
      root.innerHTML = '<div class="ix-card pw-empty"><p class="big">The wall&rsquo;s quiet right now.</p>' +
        '<p class="ix-note">When someone asks the church to stand with them, their request shows up here after our pastoral team reviews it. ' +
        'Got something you want the family to pray over?</p><p style="margin-top:22px"><a class="ix-btn" href="/prayer">Share a request</a></p></div>';
      return;
    }
    root.innerHTML = '<div class="pw-grid">' + list.map(function (p) {
      var done = prayedToday(p.id);
      return '<article class="ix-card pw-card" data-id="' + esc(p.id) + '">' +
        '<p class="pw-meta">' + esc(p.name || "A friend") + (p.posted ? " &middot; " + esc(p.posted) : "") + "</p>" +
        '<p class="pw-text">' + esc(p.request) + "</p>" +
        (p.answered ? '<p class="pw-meta" style="color:var(--ix-gold)">Praise report: ' + esc(p.answered) + "</p>" : "") +
        '<div class="pw-foot"><span class="pw-count" aria-live="polite"></span>' +
        '<button type="button" class="pw-pray" aria-pressed="' + done + '">' + (done ? "Prayed" : "I prayed") + "</button></div></article>";
    }).join("") + "</div>";

    var ids = list.map(function (p) { return p.id; });
    fetch(API + "?ids=" + encodeURIComponent(ids.join(","))).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.counts) return;
      Object.keys(d.counts).forEach(function (id) {
        var card = root.querySelector('[data-id="' + CSS.escape(id) + '"]');
        if (card && d.counts[id] > 0) card.querySelector(".pw-count").textContent = label(d.counts[id]);
      });
    }).catch(function () {});

    root.addEventListener("click", function (e) {
      var b = e.target.closest(".pw-pray");
      if (!b || b.getAttribute("aria-pressed") === "true") return;
      var card = b.closest(".pw-card"), id = card.dataset.id;
      b.setAttribute("aria-pressed", "true"); b.textContent = "Prayed";
      remember(id);
      fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: id }) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.count) card.querySelector(".pw-count").textContent = label(d.count); })
        .catch(function () {});
    });
  }).catch(function () {});
})();
