/* Roadmapped — mini dashboard in the hero.
   The board's final state is pre-rendered in the HTML: every ticket done,
   full agent transcript. Works with JavaScript off and respects
   prefers-reduced-motion. This script adds the view toggle, the task panel,
   and a replay of the agent shipping the last two tickets. */

(function () {
  "use strict";

  var win = document.getElementById("mini-window");
  if (!win) return;

  /* ---------- Data: the backlog of this very page ---------- */

  var TASKS = {
    1: {
      title: "Spec the homepage demo",
      deps: [],
      commit: "b41c07d",
      outcome: "Decided the hero demo should be the backlog that built the hero demo. This ticket therefore describes itself.",
      verification: "you're reading it"
    },
    2: {
      title: "Copy that survives the tone-of-voice doc",
      deps: [1],
      commit: "0d9e4f1",
      outcome: "Four rewrites. The document won.",
      verification: "agent reread it — “almost not salesy”"
    },
    3: {
      title: "Columns view",
      deps: [1],
      commit: "7c25a3e",
      outcome: "Three columns, zero drag-and-drop. The agent moves the cards; you review the diff.",
      verification: "you're looking at it"
    },
    4: {
      title: "Dependency graph view",
      deps: [3],
      commit: "e8f21b6",
      outcome: "Seven nodes, nine edges, no libraries. It's SVG all the way down.",
      verification: "it's the other button on the toggle"
    },
    5: {
      title: "Task panel on click",
      deps: [3],
      commit: "51adc90",
      outcome: "You clicked, it opened.",
      verification: "this panel"
    },
    6: {
      title: "Agent pane, left",
      deps: [3, 5],
      commit: "9b30f77",
      outcome: "The typing on the left. Built by the thing it depicts.",
      verification: "currently replaying its own ticket"
    },
    7: {
      title: "Deploy to Cloudflare Pages",
      deps: [2, 4, 6],
      commit: "3fe6a12",
      outcome: "npx wrangler deploy. There is no step 2.",
      verification: "you're looking at the deployment"
    }
  };

  var state = { 1: "done", 2: "done", 3: "done", 4: "done", 5: "done", 6: "done", 7: "done" };

  function taskEls(id) {
    return win.querySelectorAll('[data-task="' + id + '"]');
  }

  /* ---------- Status plumbing (board + graph + panel stay in sync) ---------- */

  var lists = {};
  ["todo", "in_progress", "done"].forEach(function (status) {
    lists[status] = win.querySelector('.mini-col[data-status="' + status + '"] .mini-col-list');
  });

  function setStatus(id, status) {
    state[id] = status;
    taskEls(id).forEach(function (el) { el.dataset.status = status; });

    var card = win.querySelector('.mini-card[data-task="' + id + '"]');
    if (card) {
      var li = card.closest("li");
      // Never yank a card out from under the keyboard.
      if (li && !li.contains(document.activeElement)) {
        var list = lists[status];
        var before = null;
        Array.prototype.some.call(list.children, function (child) {
          var btn = child.querySelector(".mini-card");
          if (btn && Number(btn.dataset.task) > id) { before = child; return true; }
          return false;
        });
        list.insertBefore(li, before);
      }
    }
    if (openId === id) renderPanelStatus();
  }

  /* ---------- View toggle ---------- */

  var tabs = {
    columns: document.getElementById("tab-columns"),
    graph: document.getElementById("tab-graph")
  };
  var views = {
    columns: document.getElementById("view-columns"),
    graph: document.getElementById("view-graph")
  };

  function showView(which) {
    Object.keys(views).forEach(function (key) {
      views[key].hidden = key !== which;
      tabs[key].setAttribute("aria-pressed", String(key === which));
    });
  }

  tabs.columns.addEventListener("click", function () { showView("columns"); });
  tabs.graph.addEventListener("click", function () { showView("graph"); });

  /* ---------- Task panel ---------- */

  var panel = document.getElementById("mini-panel");
  var openId = null;
  var invoker = null;
  var fields = {
    id: document.getElementById("panel-id"),
    title: document.getElementById("panel-title"),
    status: document.getElementById("panel-status"),
    deps: document.getElementById("panel-deps"),
    record: document.getElementById("panel-record"),
    outcome: document.getElementById("panel-outcome"),
    verification: document.getElementById("panel-verification"),
    commit: document.getElementById("panel-commit")
  };

  function renderPanelStatus() {
    var status = state[openId];
    fields.status.textContent = status;
    fields.status.className =
      status === "in_progress" ? "is-progress" : status === "done" ? "is-done" : "";
    // No record until the work is recorded. Honest history, even here.
    fields.record.hidden = status !== "done";
  }

  function clearSelection() {
    win.querySelectorAll(".is-selected").forEach(function (el) {
      el.classList.remove("is-selected");
    });
  }

  function openPanel(id, btn) {
    var task = TASKS[id];
    if (!task) return;
    openId = id;
    invoker = btn;
    fields.id.textContent = "#" + id;
    fields.title.textContent = task.title;
    fields.deps.textContent = task.deps.length
      ? task.deps.map(function (d) { return "#" + d; }).join(", ")
      : "—";
    fields.outcome.textContent = task.outcome;
    fields.verification.textContent = "verification: " + task.verification;
    fields.commit.textContent = "commit " + task.commit;
    renderPanelStatus();
    clearSelection();
    taskEls(id).forEach(function (el) { el.classList.add("is-selected"); });
    panel.hidden = false;
    panel.focus();
  }

  function closePanel(refocus) {
    if (panel.hidden) return;
    panel.hidden = true;
    clearSelection();
    if (refocus && invoker && document.contains(invoker)) invoker.focus();
    openId = null;
    invoker = null;
  }

  win.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-task]");
    if (!btn || !win.contains(btn)) return;
    var id = Number(btn.dataset.task);
    if (openId === id) { closePanel(true); return; }
    openPanel(id, btn);
  });

  document.getElementById("panel-close").addEventListener("click", function () {
    closePanel(true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePanel(true);
  });

  /* ---------- Replay: the agent ships #6 and #7, again and again ---------- */

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var chat = document.getElementById("mini-chat");
  var lines = Array.prototype.slice.call(chat.querySelectorAll(".cl"));

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
    cursor.className = "mini-cursor";
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

  // Board side effects, keyed by transcript line index (after it shows).
  var effects = {
    1: function () { setStatus(6, "in_progress"); return wait(650); },
    4: function () { setStatus(6, "done"); return wait(650); },
    6: function () { setStatus(7, "in_progress"); return wait(650); },
    9: function () { setStatus(7, "done"); return wait(400); }
  };

  function reset() {
    lines.forEach(function (line) {
      line.classList.remove("on");
      var typed = line.querySelector(".cl-t");
      if (typed) typed.textContent = "";
    });
    setStatus(6, "todo");
    setStatus(7, "todo");
  }

  function playOnce() {
    reset();
    return wait(900).then(function () {
      return lines.reduce(function (chain, line, index) {
        return chain.then(function () {
          line.classList.add("on");
          var shown = line.dataset.kind === "you" ? typeLine(line) : wait(480);
          return shown.then(function () {
            return effects[index] ? effects[index]() : wait(260);
          });
        });
      }, Promise.resolve());
    });
  }

  function loop() {
    playOnce().then(function () { return wait(6500); }).then(loop);
  }

  function start() {
    chat.classList.add("mini-anim");
    loop();
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.3 });
    observer.observe(win);
  } else {
    start();
  }
})();
