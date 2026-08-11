/* ============================================================
   The Gathering CTX - shared Netlify Forms submit handler
   Any <form class="js-netlify-form"> is submitted over AJAX to "/"
   (Netlify captures it, then submission-created.mjs routes pastoral
   forms into the care queue). Shows an inline success/error message
   instead of a full page reload. Add:
     <script src="/assets/forms.js" defer></script>
   Each form should include a sibling <p class="tg-msg"> for feedback,
   or one will be created.
   ============================================================ */
(function () {
  "use strict";

  function encode(form) {
    var data = new FormData(form);
    var pairs = [];
    data.forEach(function (v, k) {
      pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    });
    return pairs.join("&");
  }

  function wire(form) {
    var btn = form.querySelector('[type="submit"]');
    var msg = form.querySelector(".tg-msg");
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "tg-msg";
      form.appendChild(msg);
    }
    var btnLabel = btn ? btn.textContent : "Send";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot: if filled, silently succeed without sending.
      var hp = form.querySelector('[name="bot-field"]');
      if (hp && hp.value) { return; }

      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      msg.className = "tg-msg";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(form)
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        var done = form.getAttribute("data-success") ||
          "Thank you. We received it. Someone from The Gathering will follow up.";
        form.reset();
        msg.textContent = done;
        msg.className = "tg-msg ok show";
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      }).catch(function () {
        msg.textContent = "Something went wrong sending that. Please text (817) 518-4773 or email info@gatheringctx.org and we'll help.";
        msg.className = "tg-msg err show";
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      });
    });
  }

  function init() {
    document.querySelectorAll("form.js-netlify-form").forEach(wire);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
