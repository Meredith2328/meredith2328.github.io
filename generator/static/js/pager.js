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

  var prevBtn = document.getElementById("pager-prev");
  var nextBtn = document.getElementById("pager-next");
  var info = document.getElementById("pager-info");
  var select = document.getElementById("pager-select");
  if (!prevBtn || !nextBtn || !info || !select) return;

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

  function show() {
    var start = page * per;
    chapters.forEach(function (ch, i) {
      ch.hidden = i < start || i >= start + per;
    });
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= pages - 1;
    info.textContent = rangeText();
    select.value = String(start);
    if (history.replaceState) {
      history.replaceState(null, "", "#ch-" + (page + 1));
    }
    body.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  prevBtn.addEventListener("click", function () {
    if (page > 0) {
      page--;
      show();
    }
  });
  nextBtn.addEventListener("click", function () {
    if (page < pages - 1) {
      page++;
      show();
    }
  });
  select.addEventListener("change", function () {
    var i = parseInt(select.value, 10);
    if (!isNaN(i)) {
      page = Math.floor(i / per);
      show();
    }
  });

  // deep link: #ch-N opens that page directly (all chapters share one URL)
  var m = location.hash.match(/^#ch-(\d+)$/);
  if (m) {
    var wanted = parseInt(m[1], 10) - 1;
    if (!isNaN(wanted) && wanted >= 0 && wanted < pages) page = wanted;
  }
  show();
})();
