/* pilog — side table of contents with scroll-spy (post pages) */
(function () {
  "use strict";

  var toc = document.getElementById("post-toc");
  var body = document.querySelector(".post-body");
  if (!toc || !body) return;

  var headings = Array.prototype.filter.call(
    body.querySelectorAll("h2, h3"),
    function (h) {
      return !!h.id;
    }
  );
  if (headings.length < 3) return;

  // nested list: h3 sits under the current h2
  var list = document.createElement("ol");
  list.className = "post-toc-list";
  var currentItem = null;
  headings.forEach(function (h) {
    var li = document.createElement("li");
    li.className = h.tagName === "H2" ? "toc-h2" : "toc-h3";
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.title = h.textContent;
    li.appendChild(a);
    if (h.tagName === "H2") {
      list.appendChild(li);
      currentItem = li;
    } else if (currentItem) {
      var sub = currentItem.querySelector("ul");
      if (!sub) {
        sub = document.createElement("ul");
        currentItem.appendChild(sub);
      }
      sub.appendChild(li);
    } else {
      list.appendChild(li);
    }
  });
  toc.appendChild(list);
  toc.hidden = false;

  var links = toc.querySelectorAll("a");

  // narrow screens hide the side TOC; provide a floating toggle button on the
  // right edge that slides the TOC panel out / tucks it back in. The arrow
  // points left while closed (panel slides in from the right) and right while
  // open (click to tuck it back)
  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "toc-toggle";
  toggle.setAttribute("aria-label", "打开目录");
  toggle.setAttribute("aria-expanded", "false");
  toggle.title = "目录";
  toggle.textContent = "◀";
  document.body.appendChild(toggle);

  function setTocOpen(open) {
    toc.classList.toggle("is-open", open);
    toggle.classList.toggle("is-active", open);
    toggle.textContent = open ? "▶" : "◀";
    toggle.setAttribute("aria-label", open ? "收起目录" : "打开目录");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setTocOpen(!toc.classList.contains("is-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setTocOpen(false);
  });

  // hover "#" anchor links on every heading (deep-linkable section anchors)
  body.querySelectorAll("h1, h2, h3, h4").forEach(function (h) {
    if (!h.id) return;
    var a = document.createElement("a");
    a.className = "heading-anchor";
    a.href = "#" + h.id;
    a.setAttribute("aria-label", "链接到本节");
    a.textContent = "#";
    h.insertBefore(a, h.firstChild);
  });

  body.addEventListener("click", function (e) {
    var a = e.target.closest(".heading-anchor");
    if (!a) return;
    e.preventDefault();
    var h = document.getElementById(a.getAttribute("href").slice(1));
    if (!h) return;
    if (window.pilogPager && window.pilogPager.jumpToHeading) {
      window.pilogPager.jumpToHeading(h);
    } else {
      scrollToHeading(h);
    }
    if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
  });

  function scrollToHeading(h) {
    var top = h.getBoundingClientRect().top + window.pageYOffset - 24;
    if (window.pilogSmoothScroll) {
      window.pilogSmoothScroll(top);
    } else {
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  toc.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    var h = document.getElementById(a.getAttribute("href").slice(1));
    if (!h) return;
    if (window.pilogPager && window.pilogPager.jumpToHeading) {
      if (window.pilogPager.jumpToHeading(h)) {
        setTocOpen(false); // mobile panel: tuck back in after jumping
        return;
      }
    }
    scrollToHeading(h);
    setTocOpen(false);
  });

  // scroll-spy: highlight the last visible heading above 35% of the viewport
  function currentIndex() {
    var mid = window.pageYOffset + window.innerHeight * 0.35;
    var idx = 0;
    headings.forEach(function (h, i) {
      var ch = h.closest(".post-chapter");
      if (ch && ch.hidden) return;
      if (h.getBoundingClientRect().top + window.pageYOffset <= mid) idx = i;
    });
    return idx;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      links.forEach(function (a, i) {
        a.classList.toggle("is-active", i === currentIndex());
      });
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
