/* pilog — click post images to view them enlarged */
(function () {
  "use strict";

  var body = document.querySelector(".post-body");
  if (!body) return;

  var overlay = null;

  function close() {
    if (overlay) {
      overlay.remove();
      overlay = null;
      document.removeEventListener("keydown", onKey, true);
    }
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  body.addEventListener("click", function (e) {
    var img = e.target.closest("img");
    if (!img) return;
    if (img.closest("a")) return; // linked images navigate normally
    e.preventDefault();
    close();
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    overlay.appendChild(big);
    // show a loading hint until the enlarged image has actually arrived
    var hint = document.createElement("span");
    hint.className = "lightbox-hint";
    hint.textContent = "图片正在加载中...";
    overlay.appendChild(hint);
    var dropHint = function () {
      hint.remove();
    };
    if (big.complete && big.naturalWidth > 0) {
      dropHint();
    } else {
      big.addEventListener("load", dropHint);
      big.addEventListener("error", dropHint);
    }
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(overlay);
  });
})();
