/* archviz — enhancement script.
   Plain HTML + CSS degrades gracefully without JS (native <details>).
   This script adds: expand/collapse-all buttons, layer-filter rail
   buttons, and evolution-stage tabs. All state lives in data-*
   attributes; markup is authored per-post, logic is generic. */
(function () {
  "use strict";

  var EXPAND = "\u5C55\u5F00\u5168\u90E8";
  var COLLAPSE = "\u6536\u8D77\u5168\u90E8";

  function addExpandAll(box) {
    var folds = box.querySelectorAll("details.av-fold");
    if (!folds.length) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "av-btn";

    function sync() {
      var openCount = box.querySelectorAll("details.av-fold[open]").length;
      btn.textContent = openCount >= folds.length ? COLLAPSE : EXPAND;
    }

    btn.addEventListener("click", function () {
      var anyClosed = Array.prototype.some.call(folds, function (d) {
        return !d.open;
      });
      Array.prototype.forEach.call(folds, function (d) {
        d.open = anyClosed;
      });
      sync();
    });

    Array.prototype.forEach.call(folds, function (d) {
      d.addEventListener("toggle", sync);
    });

    var head = box.querySelector(".av-head");
    if (head) {
      var flex = head.querySelector(".av-flex");
      if (!flex) {
        flex = document.createElement("span");
        flex.className = "av-flex";
        head.appendChild(flex);
      }
      head.insertBefore(btn, flex.nextSibling);
    }
    sync();
  }

  /* layer filter: buttons carry data-av2-layer, nodes carry
     data-av2-layer="<same id>". Clicking highlights that layer's
     nodes and dims the rest; clicking again resets. */
  function addLayerFilter(box) {
    var buttons = box.querySelectorAll(".av2-lbtn[data-av2-layer]");
    if (!buttons.length) return;
    var nodes = box.querySelectorAll(".av2-node[data-av2-layer]");
    var active = null;

    function apply() {
      Array.prototype.forEach.call(nodes, function (n) {
        n.classList.toggle("is-dim", active !== null && n.getAttribute("data-av2-layer") !== active);
        n.classList.toggle("is-focus", active !== null && n.getAttribute("data-av2-layer") === active);
      });
      Array.prototype.forEach.call(buttons, function (b) {
        b.classList.toggle("is-on", b.getAttribute("data-av2-layer") === active);
      });
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () {
        var layer = b.getAttribute("data-av2-layer");
        active = (active === layer) ? null : layer;
        apply();
      });
    });
  }

  /* evolution tabs: .av3-tab[data-av3-stage] toggles the matching
     .av3-pane[data-av3-stage] inside the same .archviz box. */
  function addStageTabs(box) {
    var tabs = box.querySelectorAll(".av3-tab[data-av3-stage]");
    if (!tabs.length) return;
    var panes = box.querySelectorAll(".av3-pane[data-av3-stage]");

    function select(stage) {
      Array.prototype.forEach.call(tabs, function (t) {
        t.classList.toggle("is-on", t.getAttribute("data-av3-stage") === stage);
      });
      Array.prototype.forEach.call(panes, function (p) {
        p.classList.toggle("is-on", p.getAttribute("data-av3-stage") === stage);
      });
    }

    Array.prototype.forEach.call(tabs, function (t) {
      t.addEventListener("click", function () {
        select(t.getAttribute("data-av3-stage"));
      });
    });
    if (tabs[0]) select(tabs[0].getAttribute("data-av3-stage"));
  }

  function enhance(root) {
    var boxes = root.querySelectorAll(".archviz");
    Array.prototype.forEach.call(boxes, function (box) {
      if (box.dataset.avReady) return;
      box.dataset.avReady = "1";
      addExpandAll(box);
      addLayerFilter(box);
      addStageTabs(box);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      enhance(document);
    });
  } else {
    enhance(document);
  }

  window.ArchViz = { mountAll: enhance };
})();
