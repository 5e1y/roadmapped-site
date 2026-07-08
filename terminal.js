/* Roadmapped — the terminal window in the hero.
   One of two windows: this one replays the agent loop (take → work → record);
   the window next to it is the real dashboard (an iframe on the actual React
   app, read-only build) and needs no help from us.

   The full transcript is pre-rendered in the HTML: the page works with
   JavaScript off, and `prefers-reduced-motion` keeps it static. The replay
   only re-types what is already there. It never takes focus. */

(function () {
  "use strict";

  var term = document.getElementById("term");
  if (!term) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lines = Array.prototype.slice.call(term.querySelectorAll(".cl"));

  // Remember the full "you" prompts, then let the loop retype them.
  lines.forEach(function (line) {
    var typed = line.querySelector(".cl-t");
    if (typed) line.dataset.text = typed.textContent;
  });

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function typeLine(line) {
    var typed = line.querySelector(".cl-t");
    var text = line.dataset.text || "";
    var cursor = document.createElement("span");
    cursor.className = "term-cursor";
    typed.after(cursor);
    var i = 0;
    return new Promise(function (resolve) {
      (function tick() {
        if (i < text.length) {
          typed.textContent = text.slice(0, ++i);
          setTimeout(tick, 24 + Math.random() * 26);
        } else {
          setTimeout(function () { cursor.remove(); resolve(); }, 200);
        }
      })();
    });
  }

  // Slightly longer beats after the lines that land a point.
  var beats = { 3: 900, 4: 900, 8: 1100 };

  function reset() {
    lines.forEach(function (line) {
      line.classList.remove("on");
      var typed = line.querySelector(".cl-t");
      if (typed) typed.textContent = "";
    });
  }

  function playOnce() {
    reset();
    return wait(900).then(function () {
      return lines.reduce(function (chain, line, index) {
        return chain.then(function () {
          line.classList.add("on");
          var shown = line.dataset.kind === "you" ? typeLine(line) : wait(520);
          return shown.then(function () { return wait(beats[index] || 300); });
        });
      }, Promise.resolve());
    });
  }

  function loop() {
    playOnce().then(function () { return wait(8000); }).then(loop);
  }

  function start() {
    term.classList.add("term-anim");
    loop();
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.3 });
    observer.observe(term);
  } else {
    start();
  }
})();
