/* archviz — enhancement script.
   The diagrams are plain HTML + CSS (native <details> for folding,
   so they degrade gracefully without JS). This script only adds an
   "expand all / collapse all" button to each diagram's head bar. */
(function () {
  "use strict";

  function enhance(root) {
    var boxes = root.querySelectorAll(".archviz");
    Array.prototype.forEach.call(boxes, function (box) {
      if (box.dataset.avReady) return;
      box.dataset.avReady = "1";

      var folds = box.querySelectorAll("details.av-fold");
      if (!folds.length) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "av-btn";

      function sync() {
        var openCount = box.querySelectorAll("details.av-fold[open]").length;
        btn.textContent = openCount >= folds.length ? "\u6536\u8D77\u5168\u90E8" : "\u5C55\u5F00\u5168\u90E8";
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
