/* pilog — giscus fallback: show a retry button when comments fail to load */
(function () {
  "use strict";

  var section = document.querySelector(".post-comments");
  var fallback = document.getElementById("giscus-fallback");
  var retry = document.getElementById("giscus-retry");
  if (!section || !fallback || !retry) return;

  var CHECK_DELAY = 8000;
  var timer = null;
  var observer = null;
  var done = false;

  function hasFrame() {
    return !!section.querySelector("iframe");
  }

  function clearWatch() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function showFallback() {
    if (done || hasFrame()) return;
    fallback.hidden = false;
    clearWatch();
  }

  function watch() {
    clearWatch();
    timer = setTimeout(showFallback, CHECK_DELAY);
    observer = new MutationObserver(function () {
      if (hasFrame()) {
        done = true;
        clearWatch();
      }
    });
    observer.observe(section, { childList: true, subtree: true });
  }

  retry.addEventListener("click", function () {
    fallback.hidden = true;
    done = false;
    var original = section.querySelector("script[src*='giscus.app']");
    if (!original) {
      location.reload();
      return;
    }
    var attrs = {};
    Array.prototype.forEach.call(original.attributes, function (a) {
      attrs[a.name] = a.value;
    });
    original.remove();
    var s = document.createElement("script");
    Object.keys(attrs).forEach(function (k) {
      s.setAttribute(k, attrs[k]);
    });
    section.insertBefore(s, fallback);
    watch();
  });

  // the template's script tag calls this on network failure
  window.__giscusFail = showFallback;
  watch();
})();
