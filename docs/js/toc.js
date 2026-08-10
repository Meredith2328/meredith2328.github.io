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
      if (window.pilogPager.jumpToHeading(h)) return;
    }
    scrollToHeading(h);
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
