/* Reading plan check-offs.
   Each reading gets a checkbox. Progress is saved in this browser only
   (nothing is sent anywhere). The rhythm counts consecutive plan days
   you have read, ending today. It is you against yesterday's you: no
   ranking, no comparing, and no guilt when a day is missed. */
(function () {
  "use strict";
  var KEY = "gctx-reading-plan-v1";
  var MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  var DAY_OFFSET = { mon: -6, tue: -5, wed: -4, thu: -3, fri: -2, sat: -1 };

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  // "Sunday, October 25" -> Date for that Sunday. The plan has no year, so pick
  // the year that puts the Sunday closest to today.
  function sundayFrom(text) {
    var m = /([a-z]+)\s+(\d{1,2})/i.exec(text || "");
    if (!m) return null;
    var mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi < 0) return null;
    var now = new Date(), best = null;
    [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].forEach(function (y) {
      var d = new Date(y, mi, parseInt(m[2], 10));
      if (!best || Math.abs(d - now) < Math.abs(best - now)) best = d;
    });
    return best;
  }

  var state = load();
  var rows = [];
  var today = iso(new Date());

  document.querySelectorAll(".week").forEach(function (week, wi) {
    var dateEl = week.querySelector(".week-date");
    var sunday = dateEl ? sundayFrom(dateEl.textContent) : null;
    week.querySelectorAll(".days li").forEach(function (li) {
      var spans = li.querySelectorAll("span");
      if (spans.length < 2) return;
      var dayName = spans[0].textContent.trim().toLowerCase().slice(0, 3);
      var ref = spans[1].textContent.trim();
      var date = null;
      if (sunday && DAY_OFFSET[dayName] !== undefined) {
        var d = new Date(sunday); d.setDate(d.getDate() + DAY_OFFSET[dayName]); date = iso(d);
      }
      var id = (date || ("w" + wi + "-" + dayName)) + "|" + ref;

      var box = document.createElement("input");
      box.type = "checkbox";
      box.className = "rp-check";
      box.setAttribute("aria-label", "Mark " + spans[0].textContent.trim() + ", " + ref + " as read");
      box.checked = !!state[id];

      var left = document.createElement("span");
      left.className = "rp-left";
      li.insertBefore(left, spans[0]);
      left.appendChild(box);
      left.appendChild(spans[0]);
      spans[1].classList.add("rp-ref");
      li.classList.add("rp-row");
      if (box.checked) li.classList.add("done");
      if (date === today) li.classList.add("today");

      function toggle(v) {
        box.checked = v;
        if (v) state[id] = today; else delete state[id];
        li.classList.toggle("done", v);
        save(state);
        render();
      }
      box.addEventListener("change", function () { toggle(box.checked); });
      li.addEventListener("click", function (e) { if (e.target !== box) toggle(!box.checked); });
      rows.push({ id: id, date: date, box: box });
    });
  });
  if (!rows.length) return;

  // Progress panel, placed above the first week.
  var panel = document.createElement("div");
  panel.className = "rp-progress";
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML =
    '<div class="rp-stat"><b id="rp-done">0</b><span>Readings done</span></div>' +
    '<div class="rp-stat"><b id="rp-rhythm">0</b><span>Day rhythm</span></div>' +
    '<p class="rp-word" id="rp-word"></p>';
  var first = document.querySelector(".week");
  first.parentNode.insertBefore(panel, first);

  function render() {
    var done = rows.filter(function (r) { return r.box.checked; }).length;
    // Rhythm: walk back through scheduled plan days up to today.
    var dated = rows.filter(function (r) { return r.date && r.date <= today; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var rhythm = 0;
    for (var i = 0; i < dated.length; i++) {
      if (dated[i].box.checked) rhythm++;
      else if (dated[i].date === today) continue; // today is not over yet
      else break;
    }
    document.getElementById("rp-done").textContent = done;
    document.getElementById("rp-rhythm").textContent = rhythm;
    var word;
    if (done === 0) word = "Start with today's reading. One passage, a few minutes, a heart turned toward Him.";
    else if (rhythm === 0) word = "Pick it back up today. His mercies are new every morning. Lamentations 3:22 to 23";
    else if (rhythm >= 6) word = "A full week in the Word. Keep walking. You'll hear Sunday differently!";
    else word = "You're walking with Him day by day. Keep going!";
    document.getElementById("rp-word").textContent = word;
  }
  render();
})();
