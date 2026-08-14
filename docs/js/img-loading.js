/* pilog — show an explicit "loading…" hint while post images are still
   loading, instead of the tiny collapsing dot the browser paints for an
   unloaded <img>. Each image is wrapped in a .img-loading box; the hint is
   removed once the image has loaded (or failed). */
(function () {
  "use strict";

  var body = document.querySelector(".post-body");
  if (!body) return;

  body.querySelectorAll("img").forEach(function (img) {
    var wrap = document.createElement("span");
    wrap.className = "img-loading is-loading";
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    var done = function () {
      wrap.classList.remove("is-loading");
    };
    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  });
})();
