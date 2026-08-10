/* pilog — copy button for post code blocks */
(function () {
  "use strict";

  var body = document.querySelector(".post-body");
  if (!body) return;

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.classList.add("is-copied");
      btn.textContent = "已复制";
      setTimeout(function () {
        btn.classList.remove("is-copied");
        btn.textContent = old;
      }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        legacyCopy(text);
        done();
      });
    } else {
      legacyCopy(text);
      done();
    }
  }

  body.querySelectorAll("pre").forEach(function (pre) {
    var wrap = document.createElement("div");
    wrap.className = "code-block";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy";
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(btn);
    wrap.appendChild(pre);
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      copyText((code || pre).textContent.replace(/\n$/, ""), btn);
    });
  });
})();
