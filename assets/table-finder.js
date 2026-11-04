/* Find a Table. Reads /table/data/tables.json (public details only) and
   renders filterable cards into #table-finder. "Connect me" opens the
   Table's Church Center page, where the host receives the request. */
(function () {
  "use strict";
  var root = document.getElementById("table-finder");
  if (!root) return;
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  fetch("/table/data/tables.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    if (!data || !data.tables || !data.tables.length) return;
    var tables = data.tables;
    var days = [], towns = [];
    tables.forEach(function (t) {
      if (t.day && days.indexOf(t.day) < 0) days.push(t.day);
      if (t.town && towns.indexOf(t.town) < 0) towns.push(t.town);
    });
    var order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    towns.sort();
    var filter = { day: "", town: "" };

    function chips(kind, list, label) {
      return '<button type="button" class="ix-chip" data-kind="' + kind + '" data-val="" aria-pressed="true">Any ' + label + "</button>" +
        list.map(function (v) { return '<button type="button" class="ix-chip" data-kind="' + kind + '" data-val="' + esc(v) + '" aria-pressed="false">' + esc(v) + "</button>"; }).join("");
    }
    root.innerHTML =
      '<div class="tf-filters" role="group" aria-label="Filter by night">' + chips("day", days, "night") + "</div>" +
      '<div class="tf-filters" role="group" aria-label="Filter by town" style="margin-top:-14px">' + chips("town", towns, "town") + "</div>" +
      '<div class="tf-grid" aria-live="polite"></div>' +
      '<p class="ix-note" style="margin-top:18px">Not sure which one fits? <a href="/contact" style="color:var(--ix-gold)">Tell us</a> and we&rsquo;ll help you find your seat.</p>';
    var grid = root.querySelector(".tf-grid");

    function render() {
      var list = tables.filter(function (t) {
        return (!filter.day || t.day === filter.day) && (!filter.town || t.town === filter.town);
      });
      grid.innerHTML = list.length ? list.map(function (t) {
        return '<div class="tf-card">' +
          (t.town ? '<p class="tf-where">' + esc(t.town) + "</p>" : "") +
          '<p class="tf-host">' + esc(t.host) + "</p>" +
          '<p class="tf-when">' + esc(t.when) + "</p>" +
          '<a class="ix-btn" href="' + esc(t.url) + '" target="_blank" rel="noopener">Connect me</a></div>';
      }).join("") : '<div class="tf-none">No Table matches both of those yet. Try another night or town, or <a href="/contact" style="color:var(--ix-gold)">let us know</a> what would work for you.</div>';
    }
    root.addEventListener("click", function (e) {
      var c = e.target.closest(".ix-chip");
      if (!c) return;
      filter[c.dataset.kind] = c.dataset.val;
      root.querySelectorAll('.ix-chip[data-kind="' + c.dataset.kind + '"]').forEach(function (b) {
        b.setAttribute("aria-pressed", b === c ? "true" : "false");
      });
      render();
    });
    render();
  }).catch(function () {});
})();
