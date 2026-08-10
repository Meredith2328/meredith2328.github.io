/* pilog — client-side search over title / tags / full text */
(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  if (!input || !results) return;

  var root = window.PILOG_ROOT || "";
  var onHome = !!document.getElementById("card-grid");
  var index = null;
  var loaded = false;
  var query = "";
  var current = -1;
  var items = [];
  var timer = null;
  var fulltextBtn = document.getElementById("search-fulltext");
  var fullOn = false;
  var fulltextByUrl = null;
  var fulltextApplied = false;
  var baseTextByUrl = {};

  function loadIndex() {
    if (loaded) return Promise.resolve(index);
    loaded = true;
    return fetch(root + "data/search.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = data;
        baseTextByUrl = {};
        data.forEach(function (e) { baseTextByUrl[e.url] = e.text; });
        return data;
      })
      .catch(function () {
        loaded = false;
        return [];
      });
  }

  function ensureFulltext() {
    if (fulltextByUrl) return Promise.resolve();
    return fetch(root + "data/fulltext.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        fulltextByUrl = {};
        data.forEach(function (e) { fulltextByUrl[e.url] = e.text; });
      })
      .catch(function () {
        fulltextByUrl = {};
      });
  }

  function applyFulltext() {
    if (fulltextApplied || !fulltextByUrl || !index) return;
    index.forEach(function (e) {
      if (fulltextByUrl[e.url]) e.text = fulltextByUrl[e.url];
    });
    fulltextApplied = true;
  }

  function restoreIndex() {
    if (!fulltextApplied || !index) return;
    index.forEach(function (e) {
      if (baseTextByUrl[e.url] != null) e.text = baseTextByUrl[e.url];
    });
    fulltextApplied = false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mark(text, q) {
    var lower = text.toLowerCase();
    var at = lower.indexOf(q);
    if (at < 0) return esc(text);
    return (
      esc(text.slice(0, at)) +
      "<mark>" + esc(text.slice(at, at + q.length)) + "</mark>" +
      esc(text.slice(at + q.length))
    );
  }

  function score(entry, q) {
    // "#xxx" searches tags only (exact beats prefix); plain "xxx" never
    // matches tags, so tag results do not flood normal searches
    if (q.charAt(0) === "#") {
      var tq = q.slice(1);
      var tags = entry.tags || [];
      var hit = tags.filter(function (t) {
        return t.toLowerCase().indexOf(tq) === 0;
      });
      if (!hit.length) return 0;
      return hit.some(function (t) {
        return t.toLowerCase() === tq;
      }) ? 200 : 100;
    }
    var t = entry.title.toLowerCase();
    var f = (entry.folder || "").toLowerCase();
    var text = (entry.text || "").toLowerCase();
    if (t === q) return 300;
    if (t.indexOf(q) === 0) return 200;
    if (t.indexOf(q) >= 0) return 120;
    if (f.indexOf(q) >= 0) return 40;
    if (text.indexOf(q) >= 0) return 20;
    return 0;
  }

  function snippet(entry, q) {
    var text = entry.text || "";
    var lower = text.toLowerCase();
    var at = lower.indexOf(q);
    var start = Math.max(0, at - 28);
    var slice = text.slice(start, start + 96);
    if (at < 0) return esc(slice);
    var prefix = start > 0 ? "…" : "";
    return prefix + mark(slice, q);
  }

  function render() {
    results.innerHTML = "";
    current = -1;
    items = [];
    if (!query) {
      results.hidden = true;
      return;
    }
    if (fullOn && !fulltextApplied) {
      ensureFulltext().then(function () {
        applyFulltext();
        if (input.value.trim() === query) render();
      });
      return;
    }
    var q = query.toLowerCase();
    var scored = index
      .map(function (e) { return { e: e, s: score(e, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8);

    if (!scored.length) {
      var img = document.createElement("img");
      img.className = "search-empty-img";
      img.src = root + "img/pixel-empty.svg";
      img.alt = "";
      results.appendChild(img);
      var empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "没有匹配「" + query + "」的文章";
      results.appendChild(empty);
      results.hidden = false;
      return;
    }

    scored.forEach(function (x) {
      var a = document.createElement("a");
      a.className = "search-item";
      a.href = root + x.e.url;
      var tagBtns = (x.e.tags || [])
        .map(function (t) {
          return (
            '<span class="search-tag" role="button" tabindex="0" data-tag="' +
            esc(t) +
            '">#' +
            esc(t) +
            "</span>"
          );
        })
        .join(" ");
      a.innerHTML =
        '<span class="search-title">' + mark(x.e.title, q) + "</span>" +
        '<span class="search-snip">' + snippet(x.e, q) + "</span>" +
        '<span class="search-meta">' +
        tagBtns +
        ' · <span class="search-folder">' + esc(x.e.folder || "root") + "</span></span>";
      results.appendChild(a);
      items.push(a);
    });
    results.hidden = false;
  }

  function onInput() {
    query = input.value.trim();
    clearTimeout(timer);
    timer = setTimeout(function () {
      loadIndex().then(function () {
        if (input.value.trim() === query) render();
      });
    }, 120);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("focus", function () {
    if (query) {
      loadIndex().then(function () { render(); });
    }
  });

  if (fulltextBtn) {
    fulltextBtn.addEventListener("click", function () {
      fullOn = !fullOn;
      fulltextBtn.classList.toggle("is-on", fullOn);
      fulltextBtn.setAttribute("aria-pressed", fullOn ? "true" : "false");
      if (fullOn) {
        ensureFulltext().then(function () {
          applyFulltext();
          if (query) render();
        });
      } else {
        restoreIndex();
        if (query) render();
      }
    });
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      results.hidden = true;
      current = -1;
      return;
    }
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      current = (current + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      current = (current - 1 + items.length) % items.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current >= 0) items[current].click();
      else if (items.length) items[0].click();
      return;
    } else {
      return;
    }
    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
    });
  });

  // clicking a tag shown in a search result selects it as a card filter
  results.addEventListener("click", function (e) {
    var tagEl = e.target.closest(".search-tag");
    if (!tagEl) return;
    e.preventDefault();
    e.stopPropagation();
    var tag = tagEl.getAttribute("data-tag");
    if (onHome && window.pilogFilters && window.pilogFilters.toggleTag) {
      window.pilogFilters.toggleTag(tag, tagEl);
      results.hidden = true;
      input.value = "";
      query = "";
    } else {
      window.location.href = root + "index.html#tag=" + encodeURIComponent(tag);
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#search-wrap")) {
      results.hidden = true;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey &&
        !/^(input|textarea|select)$/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
})();
