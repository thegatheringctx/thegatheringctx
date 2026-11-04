/* Decree mode: "Speak it aloud."
   Adds a button under each decree block. It opens a full-screen view that
   shows one line at a time, big enough to read across a living room, so a
   family or a Table can declare it together. Tap, click, space or the right
   arrow moves forward; left arrow goes back; Esc closes. */
(function () {
  "use strict";
  var blocks = document.querySelectorAll(".decree-block");
  if (!blocks.length) return;

  var dm = document.createElement("div");
  dm.className = "dm";
  dm.setAttribute("role", "dialog");
  dm.setAttribute("aria-modal", "true");
  dm.setAttribute("aria-label", "Speak the decree aloud");
  dm.innerHTML =
    '<p class="dm-series"></p>' +
    '<button class="dm-close" type="button" aria-label="Close">&#10005;</button>' +
    '<p class="dm-line" aria-live="assertive"></p>' +
    '<p class="dm-hint">Say it out loud together. Tap to continue.</p>' +
    '<div class="dm-nav"><button class="ix-btn ghost dm-prev" type="button">Back</button><button class="ix-btn dm-next" type="button">Next</button></div>' +
    '<div class="dm-dots" aria-hidden="true"></div>';
  document.body.appendChild(dm);

  var lineEl = dm.querySelector(".dm-line"), dotsEl = dm.querySelector(".dm-dots"),
      seriesEl = dm.querySelector(".dm-series"), hintEl = dm.querySelector(".dm-hint"),
      nextBtn = dm.querySelector(".dm-next"), lastFocus = null, lines = [], i = 0;

  function show() {
    lineEl.classList.remove("show");
    setTimeout(function () {
      lineEl.textContent = lines[i];
      lineEl.classList.toggle("final", i === lines.length - 1);
      lineEl.classList.add("show");
    }, 60);
    dotsEl.innerHTML = lines.map(function (_, n) { return '<i class="' + (n <= i ? "on" : "") + '"></i>'; }).join("");
    var last = i === lines.length - 1;
    nextBtn.textContent = last ? "Amen" : "Next";
    hintEl.textContent = last ? "Declare it together." : "Say it out loud together. Tap to continue.";
  }
  function open(block) {
    lines = Array.prototype.map.call(block.querySelectorAll(".decree-line"), function (p) { return p.textContent.trim(); }).filter(Boolean);
    if (!lines.length) return;
    var s = block.querySelector(".decree-series");
    seriesEl.textContent = s ? s.textContent.split("·").slice(0, 2).join("·").trim() : "";
    i = 0; lastFocus = document.activeElement;
    dm.classList.add("open"); document.documentElement.style.overflow = "hidden";
    show(); nextBtn.focus();
  }
  function close() {
    dm.classList.remove("open"); document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function next() { if (i < lines.length - 1) { i++; show(); } else close(); }
  function prev() { if (i > 0) { i--; show(); } }

  dm.addEventListener("click", function (e) {
    if (e.target.closest(".dm-close")) return close();
    if (e.target.closest(".dm-prev")) return prev();
    next();
  });
  document.addEventListener("keydown", function (e) {
    if (!dm.classList.contains("open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });

  blocks.forEach(function (block) {
    if (!block.querySelector(".decree-line")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ix-btn dm-launch";
    b.textContent = "Speak it aloud";
    b.addEventListener("click", function () { open(block); });
    var lastLine = block.querySelectorAll(".decree-line");
    lastLine = lastLine[lastLine.length - 1];
    lastLine.parentNode.insertBefore(b, lastLine.nextSibling);
  });
})();
