/* Find your next step. A few yes/no questions, then one clear next step.
   Nothing is stored or sent. Each answer either lands on a step or moves
   to the next question. */
(function () {
  "use strict";
  var root = document.getElementById("next-step");
  if (!root) return;

  var Q = [
    { q: "Have you been to a Sunday gathering yet?", yes: 1, no: "visit", yesText: "Yes, I have", noText: "Not yet" },
    { q: "Where are you with Jesus right now?", yes: 2, no: "explore", yesText: "I'm following Him", noText: "I'm still exploring" },
    { q: "Have you taken Belong & Become, our partnership class?", yes: 3, no: "belong", yesText: "Yes", noText: "Not yet" },
    { q: "Do you have a seat at a Table?", yes: 4, no: "table", yesText: "Yes, I do", noText: "Not yet" },
    { q: "Have you been baptized since you started following Jesus?", yes: "serve", no: "baptism", yesText: "Yes", noText: "Not yet" }
  ];
  var R = {
    visit: { t: "Come <em>this Sunday.</em>", p: "We gather Sundays at 5:00 PM at the Cleburne Conference Center. Doors open at 4:30. Come as you are. Let us know you're coming and someone will be watching for you.", href: "/visit", cta: "Plan a visit" },
    explore: { t: "Bring your <em>questions.</em>", p: "You don't have to have it figured out to sit with us. Questions are welcome here. Send us a note and someone from The Gathering will reach out to talk, listen, and pray with you.", href: "/contact", cta: "Start a conversation", alt: { href: "/new-here", cta: "What we are about" } },
    belong: { t: "Take <em>Belong & Become.</em>", p: "One session. You'll learn who we are, what we believe, and where you fit. It's the doorway into partnership and the first step into a Table.", href: "/belong", cta: "Learn about the class" },
    table: { t: "Find <em>your Table.</em>", p: "A Table is where the family of The Gathering gets smaller so faith gets stronger. Pick the night and the side of town that fit your life.", href: "/table#find", cta: "Find a Table" },
    baptism: { t: "Take the <em>next step in the water.</em>", p: "Baptism is how you tell the world what Jesus has already done in you. “For as many of you as were baptized into Christ have put on Christ.” Galatians 3:27", href: "/baptism", cta: "About baptism" },
    serve: { t: "Find <em>your place to serve.</em>", p: "You're planted. Now help someone else find their seat. Every partner has a gift, and the body grows when every part does its work. Ephesians 4:16", href: "/serve", cta: "Ways to serve", alt: { href: "/formed", cta: "Go deeper with Formed" } }
  };
  var history = [];

  function ask(n) {
    var item = Q[n];
    root.innerHTML =
      '<div class="ns-bar"><i style="width:' + Math.round((n / Q.length) * 100) + '%"></i></div>' +
      '<p class="ns-step">Question ' + (n + 1) + "</p>" +
      '<h2 class="ns-q" tabindex="-1">' + item.q + "</h2>" +
      '<div class="ns-opts">' +
      '<button type="button" class="ns-opt" data-go="yes">' + item.yesText + "</button>" +
      '<button type="button" class="ns-opt" data-go="no">' + item.noText + "</button></div>" +
      (history.length ? '<button type="button" class="ns-back">&larr; Back</button>' : "");
    root.querySelector(".ns-q").focus();
    root.querySelectorAll(".ns-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        history.push(n);
        var to = item[b.dataset.go];
        typeof to === "number" ? ask(to) : result(to);
      });
    });
    var back = root.querySelector(".ns-back");
    if (back) back.addEventListener("click", function () { ask(history.pop()); });
  }
  function result(key) {
    var r = R[key];
    root.innerHTML =
      '<div class="ns-bar"><i style="width:100%"></i></div>' +
      '<div class="ns-result"><p class="ns-step">Your next step</p>' +
      '<h2 tabindex="-1">' + r.t + "</h2><p>" + r.p + "</p>" +
      '<a class="ix-btn" href="' + r.href + '">' + r.cta + "</a>" +
      (r.alt ? ' <a class="ix-btn ghost" href="' + r.alt.href + '" style="margin-left:8px">' + r.alt.cta + "</a>" : "") +
      '<div><button type="button" class="ns-back">&larr; Back</button> &nbsp; <button type="button" class="ns-back" data-restart>Start over</button></div></div>';
    root.querySelector("h2").focus();
    root.querySelectorAll(".ns-back").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.hasAttribute("data-restart")) { history = []; ask(0); } else ask(history.pop());
      });
    });
  }
  ask(0);
})();
