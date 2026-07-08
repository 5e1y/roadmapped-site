/* Roadmapped — hero demo loop.
   The final state is pre-rendered in the HTML (works with JS off and with
   prefers-reduced-motion). This script only replays how it got there. */

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var windowEl = document.getElementById("demo-window");
  var termEl = document.getElementById("demo-term");
  var fileEl = document.getElementById("demo-file");
  var statusEl = document.getElementById("demo-status");
  if (!windowEl || !termEl || !fileEl || !statusEl) return;

  var termLines = Array.prototype.slice.call(termEl.querySelectorAll(".tl"));
  var addLines = Array.prototype.slice.call(fileEl.querySelectorAll(".fl-add"));

  // Remember the full command text, then let the loop retype it.
  termLines.forEach(function (line) {
    var cmd = line.querySelector(".tl-c");
    if (cmd) line.dataset.text = cmd.textContent;
  });

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function setStatus(value, cls) {
    statusEl.textContent = value;
    statusEl.className = "status-val" + (cls ? " " + cls : "");
  }

  function reset() {
    termLines.forEach(function (line) {
      line.classList.remove("on");
      var cmd = line.querySelector(".tl-c");
      if (cmd) cmd.textContent = "";
    });
    addLines.forEach(function (line) { line.classList.remove("on"); });
    setStatus("available", "");
  }

  function typeCommand(line) {
    var cmd = line.querySelector(".tl-c");
    var text = line.dataset.text || "";
    var cursor = document.createElement("span");
    cursor.className = "demo-cursor";
    cmd.after(cursor);
    var i = 0;
    return new Promise(function (resolve) {
      (function tick() {
        if (i < text.length) {
          cmd.textContent = text.slice(0, ++i);
          setTimeout(tick, 22 + Math.random() * 26);
        } else {
          setTimeout(function () { cursor.remove(); resolve(); }, 180);
        }
      })();
    });
  }

  // Side effects in the YAML pane, keyed by terminal line index (after it shows).
  var effects = {
    1: function () { setStatus("in_progress", "is-progress"); return wait(500); },
    5: function () {
      setStatus("done", "is-done");
      return wait(450).then(function () {
        return addLines.reduce(function (chain, line) {
          return chain.then(function () {
            line.classList.add("on");
            return wait(240);
          });
        }, Promise.resolve());
      });
    }
  };

  function playOnce() {
    reset();
    return wait(700).then(function () {
      return termLines.reduce(function (chain, line, index) {
        return chain.then(function () {
          line.classList.add("on");
          var shown = line.dataset.type === "cmd" ? typeCommand(line) : wait(380);
          return shown.then(function () {
            return effects[index] ? effects[index]() : wait(220);
          });
        });
      }, Promise.resolve());
    });
  }

  function loop() {
    playOnce().then(function () {
      return wait(4800);
    }).then(loop);
  }

  function start() {
    windowEl.classList.add("demo-anim");
    loop();
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.35 });
    observer.observe(windowEl);
  } else {
    start();
  }
})();
