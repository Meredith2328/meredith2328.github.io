/* pilog — client-side section paging for long posts.
   All chapters ship in the page (same link); this only toggles which
   chapters are visible, so switching "pages" never waits on the network. */
(function () {
  "use strict";

  var body = document.querySelector(".post-body");
  if (!body) return;
  var total = parseInt(body.getAttribute("data-chapters") || "0", 10);
  var per = parseInt(body.getAttribute("data-per-page") || "1", 10);
  if (!total || total < 2) return;

  var chapters = body.querySelectorAll(".post-chapter");
  var pages = Math.ceil(total / per);
  var page = 0;
  var firstShow = true;
  var enabled = false;

  var prevBtn = document.getElementById("pager-prev");
  var nextBtn = document.getElementById("pager-next");
  var info = document.getElementById("pager-info");
  var select = document.getElementById("pager-select");
  var toggleBtn = document.getElementById("pager-toggle");
  var hint = document.getElementById("pager-hint");
  if (!prevBtn || !nextBtn || !info || !select || !toggleBtn || !hint) return;

  chapters.forEach(function (ch, i) {
    var opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = ch.getAttribute("data-title") || "第 " + (i + 1) + " 章";
    select.appendChild(opt);
  });

  function rangeText() {
    var start = page * per + 1;
    var end = Math.min(total, start + per - 1);
    return per === 1
      ? "第 " + start + " 章 / 共 " + total + " 章"
      : "第 " + start + "–" + end + " 章 / 共 " + total + " 章";
  }

  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - 24;
    if (window.pilogSmoothScroll) {
      window.pilogSmoothScroll(top);
    } else {
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  function updateHash() {
    if (!history.replaceState) return;
    if (enabled) {
      history.replaceState(null, "", "#ch-" + (page + 1));
    } else {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function setEnabled(on) {
    enabled = on;
    toggleBtn.textContent = on ? "关闭长文章分页" : "开启长文章分页";
    toggleBtn.classList.toggle("is-on", on);
    hint.hidden = on;
    prevBtn.hidden = !on;
    nextBtn.hidden = !on;
    select.hidden = !on;
    info.hidden = !on;
  }

  function show(scrollTarget) {
    var start = page * per;
    chapters.forEach(function (ch, i) {
      ch.hidden = enabled && (i < start || i >= start + per);
    });
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= pages - 1;
    info.textContent = rangeText();
    select.value = String(start);
    if (firstShow) {
      // initial page load: never auto-scroll to the body
      firstShow = false;
      return;
    }
    firstShow = false;
    if (scrollTarget && scrollTarget !== body) {
      scrollToEl(scrollTarget);
    }
  }

  prevBtn.addEventListener("click", function () {
    if (page > 0) {
      page--;
      show();
      updateHash();
    }
  });
  nextBtn.addEventListener("click", function () {
    if (page < pages - 1) {
      page++;
      show();
      updateHash();
    }
  });
  select.addEventListener("change", function () {
    var i = parseInt(select.value, 10);
    if (!isNaN(i)) {
      page = Math.floor(i / per);
      show();
      updateHash();
    }
  });
  toggleBtn.addEventListener("click", function () {
    setEnabled(!enabled);
    updateHash();
    show();
  });

  var initialHash = location.hash;

  // deep link: #ch-N opens that page directly (all chapters share one URL)
  var m = initialHash.match(/^#ch-(\d+)$/);
  if (m) {
    var wanted = parseInt(m[1], 10) - 1;
    if (!isNaN(wanted) && wanted >= 0 && wanted < pages) {
      page = wanted;
      setEnabled(true);
      updateHash();
    } else {
      setEnabled(false);
    }
  } else {
    // default: traditional full-length display, paging is opt-in
    setEnabled(false);
  }

  window.pilogPager = {
    jumpToHeading: function (h) {
      if (!h) return false;
      if (!enabled) {
        scrollToEl(h);
        return true;
      }
      var ch = h.closest(".post-chapter");
      if (!ch) return false;
      var idx = Array.prototype.indexOf.call(chapters, ch);
      if (idx < 0) return false;
      var targetPage = Math.floor(idx / per);
      if (targetPage !== page) {
        page = targetPage;
        show(h);
      } else {
        scrollToEl(h);
      }
      return true;
    }
  };
  show();

  // heading hash (#section-id) inside a hidden chapter -> jump to that page
  if (initialHash.length > 1 && !/^#ch-/.test(initialHash)) {
    var target = document.getElementById(
      decodeURIComponent(initialHash.slice(1))
    );
    if (target && body.contains(target)) {
      window.pilogPager.jumpToHeading(target);
    }
  }
})();
