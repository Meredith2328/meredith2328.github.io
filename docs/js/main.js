/* pilog — view switching, file tree, multi-condition filters, nav dispatch,
   dino widget */
(function () {
  "use strict";

  /* shared smooth scroll: rAF-based so consecutive calls always restart from
     the current position (native scrollTo({behavior:'smooth'}) can get stuck
     when a previous animation is still running and only move a few pixels) */
  var scrollAnim = null;

  function cancelScrollAnim() {
    if (scrollAnim) {
      cancelAnimationFrame(scrollAnim);
      scrollAnim = null;
    }
  }

  window.pilogSmoothScroll = function (targetY, duration) {
    duration = duration || 360;
    cancelScrollAnim();
    var startY = window.pageYOffset;
    var delta = targetY - startY;
    if (Math.abs(delta) < 1) return;
    var t0 = null;
    var settleAttempts = 0;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / duration);
      window.scrollTo(0, startY + delta * ease(k));
      if (k < 1) {
        scrollAnim = requestAnimationFrame(frame);
      } else {
        scrollAnim = null;
        settle();
      }
    }

    // images decoding after the animation can grow the page and clamp us
    // short of the target; keep settling until the position actually lands
    function settle() {
      if (Math.abs(window.pageYOffset - targetY) < 40) return;
      var stillLoading = false;
      for (var i = 0; i < document.images.length; i++) {
        if (!document.images[i].complete) {
          stillLoading = true;
          break;
        }
      }
      if (stillLoading && settleAttempts < 60) {
        settleAttempts++;
        setTimeout(function () {
          window.scrollTo(0, targetY);
          settle();
        }, 250);
      } else {
        window.scrollTo(0, targetY);
      }
    }
    scrollAnim = requestAnimationFrame(frame);
  };

  // let manual scrolling take over immediately
  ["wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, cancelScrollAnim, { passive: true });
  });

  var VIEWS = ["cards", "tree", "graph"];
  var home = !!document.getElementById("card-grid");

  function activateView(name, updateHash) {
    if (VIEWS.indexOf(name) < 0) return;
    document.querySelectorAll(".view-tab").forEach(function (tab) {
      var active = tab.dataset.view === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".view-pane").forEach(function (pane) {
      pane.hidden = pane.dataset.pane !== name;
      pane.classList.toggle("is-active", pane.dataset.pane === name);
    });
    if (updateHash && history.pushState) {
      history.pushState(null, "", "#view-" + name);
    }
    if (name === "graph" && window.pilogGraph && !window.pilogGraph.started) {
      window.pilogGraph.start();
    }
  }

  document.querySelectorAll(".view-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateView(tab.dataset.view, true);
    });
  });

  function currentView() {
    var pane = document.querySelector(".view-pane.is-active");
    return pane && pane.dataset.pane ? pane.dataset.pane : "cards";
  }

  function defaultView() {
    var v = window.PILOG_DEFAULT_VIEW || "cards";
    return VIEWS.indexOf(v) >= 0 ? v : "cards";
  }

  /* ---------- filters (cards view, multi-condition) ---------- */

  var filterState = { tags: {}, folders: {} };
  var cardsIndex = null;
  var cardsIndexFailed = false;
  var filterSeq = 0;

  function normFolder(f) {
    return String(f || "").replace(/^\/+|\/+$/g, "");
  }

  function folderMatch(cardFolder, sel) {
    cardFolder = normFolder(cardFolder);
    sel = normFolder(sel);
    if (!sel) return true;
    return cardFolder === sel || cardFolder.indexOf(sel + "/") === 0;
  }

  function hasActiveFilters() {
    return (
      Object.keys(filterState.tags).length > 0 ||
      Object.keys(filterState.folders).length > 0
    );
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  function loadCardsIndex() {
    if (cardsIndex !== null || cardsIndexFailed) return Promise.resolve(null);
    return fetch((window.PILOG_ROOT || "") + "data/cards.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        cardsIndex = data;
        return data;
      })
      .catch(function () {
        // data/cards.json unavailable (e.g. the site is opened directly via
        // file:// where fetch is blocked): filtering must still work using
        // the server-rendered cards already in the page
        cardsIndexFailed = true;
        return null;
      });
  }

  function cardHTML(p) {
    var root = window.PILOG_ROOT || "";
    var segs = (p.folder || "").split("/").filter(Boolean);
    var folderHtml = "";
    if (segs.length) {
      var acc = [];
      folderHtml = '<span class="card-folder" title="点击目录片段筛选">';
      segs.forEach(function (seg, i) {
        acc.push(seg);
        if (i) folderHtml += '<span class="folder-sep">/</span>';
        folderHtml +=
          '<button class="folder-part" type="button" data-folder="' +
          esc(acc.join("/")) +
          '">' +
          esc(seg) +
          "</button>";
      });
      folderHtml += "</span>";
    }
    var tagsHtml = (p.tags || [])
      .map(function (t) {
        return (
          '<button class="tag-chip" type="button" data-tag="' +
          esc(t) +
          '">#' +
          esc(t) +
          "</button>"
        );
      })
      .join("");
    var previewHtml = p.preview_html
      ? '<div class="card-preview">' + p.preview_html + "</div>"
      : '<p class="card-preview">' + esc(p.preview_plain || "") + "</p>";
    var thumbHtml = p.thumb_url
      ? '<div class="card-thumb"><img src="' +
        esc(root + p.thumb_url) +
        '" alt="" loading="lazy"></div>'
      : "";
    var coverHtml = p.feature
      ? '<span class="card-cover" style="background-image:url(\'' +
        esc(root + p.feature) +
        '\')"></span>'
      : "";
    return (
      '<article class="card' +
      (p.highlight ? " is-highlight" : "") +
      (p.feature ? " is-cover" : "") +
      ' is-client" data-tags="' +
      esc((p.tags || []).join(" ")) +
      '" data-folder="' +
      esc(p.folder || "") +
      '" data-date="' +
      esc(p.date_str || "") +
      '">' +
      coverHtml +
      '<a class="card-link" href="' +
      esc(root + p.url) +
      '"><div class="card-body"><div class="card-meta"><time datetime="' +
      esc(p.date_str || "") +
      '">' +
      esc(p.date_str || "") +
      "</time>" +
      (p.pin ? '<span class="pin-badge">置顶</span>' : "") +
      folderHtml +
      '</div><h3 class="card-title">' +
      esc(p.title) +
      "</h3>" +
      previewHtml +
      '<div class="card-tags">' +
      tagsHtml +
      "</div></div>" +
      (p.feature ? "" : thumbHtml) +
      "</a></article>"
    );
  }

  function clearClientCards(grid) {
    grid
      .querySelectorAll(".card.is-client")
      .forEach(function (c) {
        c.remove();
      });
  }

  function filterServerCards(grid) {
    var shown = 0;
    grid.querySelectorAll(".card:not(.is-client)").forEach(function (card) {
      var tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
      var tagOk = true;
      for (var t in filterState.tags) {
        if (tags.indexOf(t) < 0) {
          tagOk = false;
          break;
        }
      }
      var folderOk = true;
      for (var f in filterState.folders) {
        if (!folderMatch(card.dataset.folder || "", f)) {
          folderOk = false;
          break;
        }
      }
      var match = tagOk && folderOk;
      card.hidden = !match;
      if (match) shown++;
    });
    return shown;
  }

  function showEmpty(grid, pageOnly) {
    var div = document.createElement("div");
    div.className = "empty-cards";
    div.textContent = pageOnly
      ? "当前页没有符合条件的文章，试试其他标签或目录"
      : "没有符合条件的文章，换个标签或目录试试";
    grid.appendChild(div);
  }

  function renderFiltered(grid, seq) {
    var matches = (cardsIndex || []).filter(function (p) {
      var ok = true;
      Object.keys(filterState.tags).forEach(function (t) {
        if ((p.tags || []).indexOf(t) < 0) ok = false;
      });
      Object.keys(filterState.folders).forEach(function (f) {
        if (!folderMatch(p.folder, f)) ok = false;
      });
      return ok;
    });
    if (seq !== filterSeq) return;
    clearClientCards(grid);
    // the client set replaces the server-rendered cards entirely
    grid.querySelectorAll(".card:not(.is-client)").forEach(function (c) {
      c.hidden = true;
    });
    matches.forEach(function (p) {
      var wrap = document.createElement("div");
      wrap.innerHTML = cardHTML(p).trim();
      grid.appendChild(wrap.firstChild);
    });
    if (!matches.length) {
      showEmpty(grid, false);
    }
  }

  function applyFilters() {
    if (!home) return;
    var grid = document.getElementById("card-grid");
    if (!grid) return;
    var pager = document.querySelector(".pager");
    var empty = grid.querySelector(".empty-cards");
    if (empty) empty.remove();
    if (!hasActiveFilters()) {
      filterSeq++;
      clearClientCards(grid);
      grid.querySelectorAll(".card").forEach(function (c) {
        c.hidden = false;
      });
      if (pager) pager.hidden = false;
      return;
    }
    var seq = ++filterSeq;
    if (pager) pager.hidden = true;

    // 1) synchronous: filter the server-rendered cards already on this page,
    // so filtering always works even before/without data/cards.json
    var serverShown = filterServerCards(grid);

    // 2) async: upgrade to the full cross-page result set when available
    if (cardsIndex !== null) {
      renderFiltered(grid, seq);
    } else {
      loadCardsIndex().then(function (data) {
        if (seq !== filterSeq) return;
        if (data === null) {
          // no cross-page index: keep the on-page result and only warn when
          // this page has no match (matches may live on other pages)
          if (pager) pager.hidden = false;
          if (serverShown === 0) showEmpty(grid, true);
          return;
        }
        renderFiltered(grid, seq);
      });
    }
  }

  function selChip(label, key, isFolder) {
    var chip = document.createElement("span");
    chip.className = "sel-chip" + (isFolder ? " sel-folder" : "");
    var name = document.createElement("span");
    name.textContent = label;
    var x = document.createElement("button");
    x.type = "button";
    x.className = "sel-x";
    x.setAttribute(
      "aria-label",
      "取消" + (isFolder ? "目录" : "标签") + "筛选 " + label
    );
    x.textContent = "×";
    chip.appendChild(name);
    chip.appendChild(x);
    chip.addEventListener("click", function () {
      if (isFolder) removeFolder(key);
      else toggleTag(key);
    });
    return chip;
  }

  function renderSelected() {
    var box = document.getElementById("filter-selected");
    if (!box) return;
    box.innerHTML = "";
    Object.keys(filterState.tags)
      .sort()
      .forEach(function (tag) {
        box.appendChild(selChip("#" + tag, tag, false));
      });
    Object.keys(filterState.folders)
      .sort()
      .forEach(function (folder) {
        box.appendChild(selChip(folder, folder, true));
      });
  }

  function syncChips() {
    document.querySelectorAll(".tag-chip[data-tag]").forEach(function (el) {
      el.classList.toggle("is-selected", !!filterState.tags[el.dataset.tag]);
    });
    document.querySelectorAll(".folder-part[data-folder]").forEach(function (el) {
      el.classList.toggle(
        "is-selected",
        !!filterState.folders[el.dataset.folder]
      );
    });
  }

  function toggleTag(tag, anchor) {
    if (!tag) return;
    var adding = !filterState.tags[tag];
    if (adding) filterState.tags[tag] = true;
    else delete filterState.tags[tag];
    syncChips();
    renderSelected();
    applyFilters();
    if (adding) {
      var view = currentView();
      if (view === "tree" || view === "graph") {
        showFilterHint("已选中筛选「#" + tag + "」，在卡片视图生效", anchor || null);
      }
    }
  }

  function selectFolder(folder) {
    folder = normFolder(folder);
    if (!folder) return;
    // only one folder condition at a time; clicking the same folder again
    // keeps it (idempotent, so repeated nav clicks do not flicker), while a
    // different folder replaces the previous one. Clearing happens via the
    // selected chip's ×.
    if (!filterState.folders[folder]) {
      filterState.folders = {};
      filterState.folders[folder] = true;
    }
    syncChips();
    renderSelected();
    applyFilters();
  }

  function removeFolder(folder) {
    folder = normFolder(folder);
    if (!folder || !filterState.folders[folder]) return;
    delete filterState.folders[folder];
    syncChips();
    renderSelected();
    applyFilters();
  }

  var filterHintEl = null;
  var filterHintTimer = null;

  function showFilterHint(text, anchor) {
    var bar = document.getElementById("filter-bar");
    if (!bar) return;
    if (!filterHintEl) {
      filterHintEl = document.createElement("div");
      filterHintEl.className = "filter-hint";
      filterHintEl.setAttribute("role", "status");
      bar.appendChild(filterHintEl);
    }
    filterHintEl.textContent = text;
    // park the hint right below the clicked tag (centered on it)
    if (anchor && anchor.getBoundingClientRect) {
      var barRect = bar.getBoundingClientRect();
      var r = anchor.getBoundingClientRect();
      filterHintEl.style.left = (r.left - barRect.left + r.width / 2) + "px";
      filterHintEl.style.top = (r.bottom - barRect.top + 6) + "px";
    }
    filterHintEl.classList.add("is-show");
    clearTimeout(filterHintTimer);
    filterHintTimer = setTimeout(function () {
      filterHintEl.classList.remove("is-show");
    }, 2400);
  }

  window.pilogFilters = {
    toggleTag: toggleTag,
    selectFolder: selectFolder,
    removeFolder: removeFolder
  };

  /* ---------- filter bar wiring (homepage only) ---------- */

  if (home) {
    var moreBtn = document.getElementById("filter-more");
    var morePanel = document.getElementById("filter-more-panel");
    var moreSearch = document.getElementById("filter-more-search");
    var moreList = document.getElementById("filter-more-list");

    function closeMore() {
      if (morePanel) morePanel.hidden = true;
      if (moreBtn) moreBtn.textContent = "更多标签 ▾";
    }

    if (moreBtn && morePanel) {
      moreBtn.addEventListener("click", function () {
        morePanel.hidden = !morePanel.hidden;
        moreBtn.textContent = morePanel.hidden ? "更多标签 ▾" : "收起标签 ▴";
        if (moreSearch) moreSearch.value = "";
        if (moreList) {
          moreList
            .querySelectorAll(".tag-chip")
            .forEach(function (el) {
              el.hidden = false;
            });
        }
      });
    }
    if (moreSearch && moreList) {
      moreSearch.addEventListener("input", function () {
        var q = moreSearch.value.trim().toLowerCase();
        moreList.querySelectorAll(".tag-chip").forEach(function (el) {
          el.hidden = !!q && el.dataset.tag.toLowerCase().indexOf(q) < 0;
        });
      });
    }
    document.addEventListener("click", function (e) {
      if (
        morePanel &&
        !morePanel.hidden &&
        !e.target.closest("#filter-more") &&
        !e.target.closest("#filter-more-panel")
      ) {
        closeMore();
      }
    });

    // tag chips and folder parts anywhere toggle their filter (cards too)
    document.addEventListener("click", function (e) {
      var tagChip = e.target.closest(".tag-chip[data-tag]");
      if (tagChip) {
        e.preventDefault();
        toggleTag(tagChip.dataset.tag, tagChip);
        return;
      }
      var folderPart = e.target.closest(".folder-part[data-folder]");
      if (folderPart) {
        e.preventDefault();
        selectFolder(folderPart.dataset.folder);
      }
    });
  }

  /* ---------- hash routing ---------- */

  function parseHash() {
    var h = location.hash || "";
    if (h.indexOf("#view-") === 0) {
      activateView(h.slice(6), false);
      return;
    }
    if (h.indexOf("#folder=") === 0) {
      activateView("cards", false);
      selectFolder(decodeURIComponent(h.slice(8)));
      return;
    }
    if (h.indexOf("#tag=") === 0) {
      activateView("cards", false);
      toggleTag(decodeURIComponent(h.slice(5)));
      return;
    }
    // plain homepage arrival: default cards view with a clean filter slate
    if (hasActiveFilters()) {
      filterState.tags = {};
      filterState.folders = {};
      syncChips();
      renderSelected();
      applyFilters();
    }
    activateView(defaultView(), false);
  }

  parseHash();
  window.addEventListener("hashchange", parseHash);

  /* ---------- nav dispatch ---------- */

  document
    .querySelectorAll(".site-nav a[data-kind='folder']")
    .forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href") || "";
        var at = href.indexOf("#folder=");
        if (at < 0) return;
        var folder = decodeURIComponent(
          href.slice(at + 8).split("#")[0]
        );
        if (!folder) return;
        if (!home) return; // on post pages let the real navigation happen
        e.preventDefault();
        var view = currentView();
        if (view === "tree") {
          locateInTree(folder);
        } else if (view === "graph") {
          if (window.pilogGraph) window.pilogGraph.highlightFolder(folder);
        } else {
          selectFolder(folder);
        }
      });
    });

  /* ---------- file tree ---------- */
  var treeRoot = document.getElementById("tree-root");
  if (treeRoot) {
    treeRoot.querySelectorAll(".tree-folder > .tree-row").forEach(function (row) {
      row.addEventListener("click", function () {
        row.parentElement.classList.toggle("is-open");
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          row.parentElement.classList.toggle("is-open");
        }
      });
    });

    function setAll(open) {
      treeRoot.querySelectorAll(".tree-folder").forEach(function (li) {
        li.classList.toggle("is-open", open);
      });
    }

    var expandBtn = document.getElementById("tree-expand");
    var collapseBtn = document.getElementById("tree-collapse");
    if (expandBtn) expandBtn.addEventListener("click", function () { setAll(true); });
    if (collapseBtn) collapseBtn.addEventListener("click", function () { setAll(false); });
    var leavesBtn = document.getElementById("tree-collapse-leaves");
    if (leavesBtn) {
      leavesBtn.addEventListener("click", function () {
        treeRoot.querySelectorAll(".tree-folder").forEach(function (li) {
          var hasSub = li.querySelector(
            ":scope > .tree-children > .tree-folder"
          );
          li.classList.toggle("is-open", !!hasSub);
        });
      });
    }
  }

  function locateInTree(folder) {
    if (!treeRoot) return;
    var li = treeRoot.querySelector(
      "li[data-path=" + JSON.stringify(folder) + "]"
    );
    if (!li) return;
    var p = li.parentElement;
    while (p && p !== treeRoot) {
      if (p.classList && p.classList.contains("tree-folder")) {
        p.classList.add("is-open");
      }
      p = p.parentElement;
    }
    li.classList.add("is-open");
    var row = li.querySelector(".tree-row");
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.remove("tree-flash");
      void row.offsetWidth;
      row.classList.add("tree-flash");
      setTimeout(function () {
        row.classList.remove("tree-flash");
      }, 1700);
    }
  }

  /* ---------- dino widget ---------- */
  var widget = document.querySelector('[data-widget="dino"]');
  if (widget) {
    var toggle = widget.querySelector(".dino-toggle");
    var panel = widget.querySelector(".dino-panel");
    var close = widget.querySelector(".dino-close");
    var frame = widget.querySelector(".dino-frame");
    var loading = widget.querySelector(".dino-loading");
    var frameLoaded = false;

    function open(force) {
      var show = force === undefined ? panel.hidden : !!force;
      panel.hidden = !show;
      toggle.classList.toggle("is-open", show);
      toggle.setAttribute(
        "aria-label",
        show ? "关闭小恐龙游戏" : "打开小恐龙游戏"
      );
      if (show && frame && frame.dataset.src) {
        frame.src = frame.dataset.src;
      }
      // if the game finished loading before we attached the listener, mark it
      if (show && frame && frame.complete && frame.contentWindow) {
        frameLoaded = true;
      }
      if (loading) loading.hidden = !(!panel.hidden && !frameLoaded);
    }

    toggle.addEventListener("click", function () {
      open();
    });
    if (close) close.addEventListener("click", function () { open(false); });
    if (frame) {
      frame.addEventListener("load", function () {
        frameLoaded = true;
        if (loading) loading.hidden = true;
      });
    }
    var jumpBtn = widget.querySelector(".dino-btn-jump");
    var duckBtn = widget.querySelector(".dino-btn-duck");
    function sendDinoKey(code, key, down) {
      if (!frame || !frame.contentWindow) return;
      var doc = frame.contentDocument || frame.contentWindow.document;
      if (!doc) return;
      var ev = new KeyboardEvent(down ? "keydown" : "keyup", {
        key: key,
        keyCode: code,
        which: code,
        bubbles: true
      });
      try {
        doc.dispatchEvent(ev);
      } catch (err) {
        /* ignore */
      }
    }
    function bindDinoBtn(btn, code, key) {
      if (!btn) return;
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        sendDinoKey(code, key, true);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
        btn.addEventListener(ev, function () {
          sendDinoKey(code, key, false);
        });
      });
    }
    bindDinoBtn(jumpBtn, 38, "ArrowUp");
    bindDinoBtn(duckBtn, 40, "ArrowDown");
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") open(false);
    });
    open(false);
  }

  /* ---------- random post: the pixel dice ---------- */
  var diceBtns = document.querySelectorAll(".random-dice");
  if (diceBtns.length) {
    var diceRoot = window.PILOG_ROOT || "";
    var cardUrls = null;

    // preload the post list so a click feels instant
    fetch(diceRoot + "data/cards.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        cardUrls = data.map(function (e) { return e.url; });
      })
      .catch(function () {});

    function jumpRandom() {
      var go = function () {
        if (!cardUrls || !cardUrls.length) return;
        var target =
          diceRoot + cardUrls[Math.floor(Math.random() * cardUrls.length)];
        // roll the dice, then grab the random toy
        diceBtns.forEach(function (b) { b.classList.add("is-rolling"); });
        setTimeout(function () {
          window.location.href = target;
        }, 300);
      };
      if (cardUrls) {
        go();
        return;
      }
      fetch(diceRoot + "data/cards.json")
        .then(function (r) { return r.json(); })
        .then(function (data) {
          cardUrls = data.map(function (e) { return e.url; });
          go();
        })
        .catch(function () {});
    }
    diceBtns.forEach(function (b) {
      b.addEventListener("click", jumpRandom);
    });
  }

  /* ---------- post pages: ← / → jump between prev / next ---------- */
  if (document.querySelector(".post-nav")) {
    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(input|textarea|select)$/i.test(document.activeElement.tagName)) return;
      var t = e.target;
      if (t && t.closest && t.closest("pre")) return; // let code blocks scroll
      var a = null;
      if (e.key === "ArrowLeft") a = document.querySelector(".post-nav-link.is-prev");
      else if (e.key === "ArrowRight") a = document.querySelector(".post-nav-link.is-next");
      if (a) {
        e.preventDefault();
        window.location.href = a.href;
      }
    });
  }
})();
