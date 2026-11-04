/* Sunday notes. Opens on the most recent message from the sermon archive
   (or ?s=<slug>). Everything typed saves in this browser as you go, so it is
   still there on Tuesday. Nothing is sent anywhere.

   Optional fill-in blanks: drop /sermons/notes/<slug>.json shaped like
   { "points": ["God's love is ___ and ___.", ...], "decree": "..." }
   and each ___ becomes a blank. With no file, the page uses the standing
   reflection prompts, so it works every week with no extra production. */
(function () {
  "use strict";
  var root = document.getElementById("sunday-notes");
  if (!root) return;
  var PROMPTS = [
    { k: "stood", label: "What stood out to me" },
    { k: "scripture", label: "A verse I want to carry this week" },
    { k: "truth", label: "Who I am in Christ, according to this message" },
    { k: "step", label: "One step I will take this week" },
    { k: "share", label: "Who I will share this with" },
    { k: "pray", label: "My prayer" }
  ];
  var SIGNATURE = "I walk with victory, not to it, in Jesus' name.";
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function key(slug) { return "gctx-notes-" + slug; }
  function load(slug) { try { return JSON.parse(localStorage.getItem(key(slug)) || "{}"); } catch (e) { return {}; } }
  function save(slug, d) { try { localStorage.setItem(key(slug), JSON.stringify(d)); return true; } catch (e) { return false; } }

  fetch("/sermons/data/index.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (list) {
    if (!list || !list.length) { root.innerHTML = '<p class="ix-note">Notes will be here on Sunday.</p>'; return; }
    list = list.slice().sort(function (a, b) { return String(b.preachedOn || "").localeCompare(String(a.preachedOn || "")); });
    var want = new URLSearchParams(location.search).get("s");
    var current = list.filter(function (s) { return s.slug === want; })[0] || list[0];
    open(current, list);
  }).catch(function () {});

  function open(sermon, list) {
    fetch("/sermons/notes/" + encodeURIComponent(sermon.slug) + ".json").then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (outline) { render(sermon, list, outline); });
  }

  function render(sermon, list, outline) {
    var data = load(sermon.slug);
    var opts = list.slice(0, 26).map(function (s) {
      return '<option value="' + esc(s.slug) + '"' + (s.slug === sermon.slug ? " selected" : "") + ">" +
        esc((s.seriesShort || s.series || "") + " · " + s.title) + "</option>";
    }).join("");
    var blanksHtml = "";
    if (outline && outline.points && outline.points.length) {
      var n = 0;
      blanksHtml = '<div class="sn-field"><label>Message outline</label>' + outline.points.map(function (pt) {
        return '<p class="sn-point">' + esc(pt).replace(/_{3,}/g, function () {
          var id = "b" + (n++);
          return '<input class="sn-blank" data-k="' + id + '" aria-label="Fill in the blank" value="' + esc(data[id] || "") + '">';
        }) + "</p>";
      }).join("") + "</div>";
    }
    root.innerHTML =
      '<div class="sn-head"><p class="ix-label">' + esc(sermon.series || "Sunday notes") + "</p>" +
      '<h2 class="sn-title">' + esc(sermon.title) + "</h2>" +
      (sermon.passage ? '<p class="sn-passage">' + esc(sermon.passage) + "</p>" : "") +
      '<label class="ix-note" style="display:block;margin-top:14px">Notes for another week<br><select class="sn-pick">' + opts + "</select></label></div>" +
      blanksHtml +
      PROMPTS.map(function (p) {
        return '<div class="sn-field"><label for="sn-' + p.k + '">' + p.label + "</label>" +
          '<textarea id="sn-' + p.k + '" data-k="' + p.k + '">' + esc(data[p.k] || "") + "</textarea></div>";
      }).join("") +
      '<div class="sn-actions"><button type="button" class="ix-btn" data-act="email">Email them to me</button>' +
      '<button type="button" class="ix-btn ghost" data-act="copy">Copy</button>' +
      '<button type="button" class="ix-btn ghost" data-act="print">Print</button>' +
      '<span class="sn-saved" aria-live="polite"></span></div>' +
      '<p class="ix-note" style="margin-top:14px">Your notes save on this device as you type. Only you can see them.</p>' +
      '<p class="sn-decree">' + esc((outline && outline.decree) ? outline.decree + " " : "") + SIGNATURE + "</p>" +
      '<p style="margin-top:28px"><a class="ix-btn ghost" href="/sermons/' + esc(sermon.slug) + '">Listen to the message</a></p>';

    var savedEl = root.querySelector(".sn-saved"), t;
    root.querySelectorAll("[data-k]").forEach(function (el) {
      el.addEventListener("input", function () {
        data[el.dataset.k] = el.value;
        clearTimeout(t);
        t = setTimeout(function () { savedEl.textContent = save(sermon.slug, data) ? "Saved" : "Could not save on this device"; }, 400);
      });
    });
    root.querySelector(".sn-pick").addEventListener("change", function (e) {
      var s = list.filter(function (x) { return x.slug === e.target.value; })[0];
      if (s) { history.replaceState(null, "", "?s=" + encodeURIComponent(s.slug)); open(s, list); }
    });
    function asText() {
      var out = [sermon.title + (sermon.passage ? " (" + sermon.passage + ")" : ""), ""];
      if (outline && outline.points) {
        var n = 0;
        outline.points.forEach(function (pt) { out.push("- " + pt.replace(/_{3,}/g, function () { return data["b" + (n++)] || "____"; })); });
        out.push("");
      }
      PROMPTS.forEach(function (p) { if (data[p.k]) out.push(p.label + ":\n" + data[p.k] + "\n"); });
      out.push(SIGNATURE);
      return out.join("\n");
    }
    root.querySelector(".sn-actions").addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "print") window.print();
      if (b.dataset.act === "email") location.href = "mailto:?subject=" + encodeURIComponent("My notes: " + sermon.title) + "&body=" + encodeURIComponent(asText());
      if (b.dataset.act === "copy" && navigator.clipboard) navigator.clipboard.writeText(asText()).then(function () { savedEl.textContent = "Copied"; });
    });
  }
})();
