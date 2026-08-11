/* pilog — pixel relationship graph
   force-directed SVG + envelope-walking pixel snake (vanilla JS) */
(function () {
  "use strict";

  var dataEl = document.getElementById("graph-data");
  if (!dataEl) return;

  var dataRoot = dataEl.getAttribute("data-root") || "";
  var collapseThreshold =
    parseInt(dataEl.getAttribute("data-collapse") || "25", 10) || 25;

  var svg = document.getElementById("graph-svg");
  var tip = document.getElementById("graph-tip");
  var wrap = document.getElementById("graph-wrap");
  var statsEl = document.getElementById("graph-stats");
  var fitBtn = document.getElementById("graph-fit");
  var snakeBtn = document.getElementById("graph-snake");
  var zoomSlider = document.getElementById("graph-zoom");
  var zoomInBtn = document.getElementById("graph-zoom-in");
  var zoomOutBtn = document.getElementById("graph-zoom-out");
  var panUpBtn = document.getElementById("graph-pan-up");
  var panDownBtn = document.getElementById("graph-pan-down");
  var panLeftBtn = document.getElementById("graph-pan-left");
  var panRightBtn = document.getElementById("graph-pan-right");
  var recenterBtn = document.getElementById("graph-recenter");
  if (!svg || !wrap) return;

  var W = 1200, H = 700;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);

  var NS = "http://www.w3.org/2000/svg";
  var defs = document.createElementNS(NS, "defs");
  svg.appendChild(defs);

  function marker(id, color, dashed) {
    var m = document.createElementNS(NS, "marker");
    m.setAttribute("id", id);
    m.setAttribute("viewBox", "0 0 10 10");
    m.setAttribute("refX", dashed ? 8 : 9);
    m.setAttribute("refY", 5);
    m.setAttribute("markerWidth", 7);
    m.setAttribute("markerHeight", 7);
    m.setAttribute("orient", "auto-start-reverse");
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M 0 1 L 9 5 L 0 9 z");
    path.setAttribute("fill", color);
    m.appendChild(path);
    defs.appendChild(m);
  }
  marker("arrow-solid", "#9aa0a6", false);
  marker("arrow-ref", "#1a73e8", true);

  var viewport = document.createElementNS(NS, "g");
  svg.appendChild(viewport);
  var envLayer = document.createElementNS(NS, "g");
  var linksG = document.createElementNS(NS, "g");
  var nodesG = document.createElementNS(NS, "g");
  viewport.appendChild(envLayer);
  viewport.appendChild(linksG);
  viewport.appendChild(nodesG);

  /* ---------- text measurement / adaptive labels ---------- */

  function charW(ch) {
    if (/[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F]/.test(ch)) return 19.5;
    return 11;
  }

  function textWidth(s) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += charW(s[i]);
    return w;
  }

  function fitLabel(s, maxW) {
    var dots = "...";
    if (textWidth(s) <= maxW) return s;
    var out = "", w = textWidth(dots);
    for (var i = 0; i < s.length; i++) {
      var cw = charW(s[i]);
      if (w + cw > maxW) break;
      out += s[i];
      w += cw;
    }
    return out + dots;
  }

  /* ---------- state ---------- */

  var data = null;
  var nodes = {};
  var links = [];
  var hidden = {};     // node ids whose subtree is hidden (folded away)
  var collapsed = {};  // dir ids that are collapsed
  var dirCounts = {};  // dir id -> number of posts inside (for labels)

  function subtreeIds(id) {
    var out = [];
    Object.keys(nodes).forEach(function (nid) {
      if (nid !== id && (nid + "/").indexOf(id + "/") === 0) out.push(nid);
    });
    return out;
  }

  function computeDirCounts() {
    var per = {};
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      if (n.type === "post" && n.folder) {
        per[n.folder] = (per[n.folder] || 0) + 1;
      }
    });
    dirCounts = {};
    Object.keys(per).forEach(function (folder) {
      var acc = "";
      folder.split("/").forEach(function (part) {
        acc = acc ? acc + "/" + part : part;
        dirCounts[acc] = (dirCounts[acc] || 0) + per[folder];
      });
    });
    // leaf dirs only: dirs that are not the parent of any other dir
    var subdirs = {};
    Object.keys(dirCounts).forEach(function (d) {
      var parent = d.lastIndexOf("/") >= 0 ? d.slice(0, d.lastIndexOf("/")) : "";
      if (parent) subdirs[parent] = true;
    });
    dirCounts._leaf = {};
    Object.keys(dirCounts).forEach(function (d) {
      if (d !== "_leaf" && !subdirs[d]) dirCounts._leaf[d] = true;
    });
  }

  function applyDefaultCollapse() {
    if (!data || !data.stats.posts || data.stats.posts <= collapseThreshold) return;
    Object.keys(dirCounts).forEach(function (dir) {
      if (dir && dir !== "_leaf" && dirCounts._leaf[dir] && dirCounts[dir] >= 4) {
        collapseDir(dir);
      }
    });
  }

  function collapseDir(id) {
    if (collapsed[id]) return;
    collapsed[id] = true;
    subtreeIds(id).forEach(function (sid) { hidden[sid] = true; });
  }

  function expandDir(id) {
    if (!collapsed[id]) return;
    delete collapsed[id];
    subtreeIds(id).forEach(function (sid) {
      delete hidden[sid];
      // expanding an ancestor reveals everything below it: clear any
      // nested "collapsed" markers so labels/state stay consistent
      if (nodes[sid] && nodes[sid].type === "dir") delete collapsed[sid];
    });
  }

  function expandAll() {
    collapsed = {};
    hidden = {};
    render();
    updateStats();
    snakeDirty = true;
  }

  function collapseAll() {
    Object.keys(nodes).forEach(function (id) {
      if (nodes[id].type === "dir") collapseDir(id);
    });
    render();
    updateStats();
    snakeDirty = true;
  }

  function toggleDir(id) {
    if (collapsed[id]) expandDir(id);
    else collapseDir(id);
    render();
    updateStats();
    snakeDirty = true;
  }

  function toggleAll() {
    if (Object.keys(hidden).length) expandAll();
    else collapseAll();
  }

  /* ---------- build nodes / links ---------- */

  function build() {
    nodes = {};
    data.nodes.forEach(function (n) {
      var label = String(n.label || n.id);
      var fullLabel = label;
      var maxW = n.type === "dir" ? 250 : 330;
      var minW = n.type === "dir" ? 112 : n.type === "root" ? 176 : 128;
      var labelW = textWidth(label);
      var w;
      if (n.type === "root") {
        w = Math.max(minW, 48 + Math.min(labelW, 300));
      } else if (n.type === "dir") {
        w = Math.max(minW, 44 + Math.min(labelW, maxW - 44));
      } else {
        w = Math.max(minW, 26 + Math.min(labelW, maxW - 26));
      }
      var display = fitLabel(label, w - (n.type === "dir" ? 34 : 18));
      nodes[n.id] = {
        id: n.id,
        label: display,
        fullLabel: fullLabel,
        type: n.type,
        url: n.url,
        tags: n.tags || [],
        folder: n.folder || "",
        highlight: !!n.highlight,
        x: W / 2 + (Math.random() - 0.5) * W * 0.45,
        y: H / 2 + (Math.random() - 0.5) * H * 0.45,
        vx: 0,
        vy: 0,
        fixed: false,
        w: w,
        h: n.type === "dir" ? 48 : 56
      };
    });

    links = data.links.map(function (l) {
      return {
        source: nodes[l.source],
        target: nodes[l.target],
        kind: l.kind,
        rest: l.kind === "ref" ? 180 : 150
      };
    }).filter(function (l) {
      return l.source && l.target && l.source !== l.target;
    });

    computeDirCounts();
    applyDefaultCollapse();
  }

  /* ---------- physics ---------- */

  function step() {
    var ids = Object.keys(nodes);
    var i, j;
    for (i = 0; i < ids.length; i++) {
      var a = nodes[ids[i]];
      for (j = i + 1; j < ids.length; j++) {
        var b = nodes[ids[j]];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = Math.max(dx * dx + dy * dy, 1600);
        var f = 82000 / d2;
        var d = Math.sqrt(d2);
        var fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }
    links.forEach(function (l) {
      var dx = l.target.x - l.source.x;
      var dy = l.target.y - l.source.y;
      var d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      var k = l.kind === "ref" ? 0.006 : 0.014;
      var f = (d - l.rest) * k;
      var fx = (dx / d) * f, fy = (dy / d) * f;
      if (!l.source.fixed) { l.source.vx += fx; l.source.vy += fy; }
      if (!l.target.fixed) { l.target.vx -= fx; l.target.vy -= fy; }
    });
    ids.forEach(function (id) {
      var n = nodes[id];
      if (n.fixed) return;
      n.vx += (W / 2 - n.x) * 0.004;
      n.vy += (H / 2 - n.y) * 0.004;
      n.vx *= 0.82;
      n.vy *= 0.82;
      n.x = Math.min(W - 60, Math.max(60, n.x + n.vx));
      n.y = Math.min(H - 50, Math.max(50, n.y + n.vy));
    });
    for (i = 0; i < ids.length; i++) {
      for (j = i + 1; j < ids.length; j++) {
        var p = nodes[ids[i]], q = nodes[ids[j]];
        var pdx = p.x - q.x, pdy = p.y - q.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy);
        var minD = p.w / 2 + q.w / 2 + 10;
        if (pd > 0 && pd < minD) {
          var push = (minD - pd) * 0.35;
          var nx = pdx / pd, ny = pdy / pd;
          if (!p.fixed) { p.x += nx * push; p.y += ny * push; }
          if (!q.fixed) { q.x -= nx * push; q.y -= ny * push; }
        }
      }
    }
  }

  function warmup(iterations) {
    for (var i = 0; i < iterations; i++) step();
  }

  /* ---------- rendering ---------- */

  var nodeEls = {}, linkEls = [];

  var DINO_ROWS = [
    "....######....",
    "...########...",
    "...####.####..",
    "..####..####..",
    "..##########..",
    "..##......##..",
    "..##......##..",
    "..##......##..",
    ".###########..",
    "..####..####.."
  ];

  function dinoIcon(cell) {
    var g = document.createElementNS(NS, "g");
    for (var y = 0; y < DINO_ROWS.length; y++) {
      for (var x = 0; x < DINO_ROWS[y].length; x++) {
        if (DINO_ROWS[y][x] === "#") {
          var r = document.createElementNS(NS, "rect");
          r.setAttribute("x", x * cell);
          r.setAttribute("y", y * cell);
          r.setAttribute("width", cell);
          r.setAttribute("height", cell);
          r.setAttribute("fill", "#3c4043");
          g.appendChild(r);
        }
      }
    }
    return g;
  }

  function rectNode(n) {
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "graph-node");
    g.setAttribute("data-id", n.id);
    var rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", -n.w / 2);
    rect.setAttribute("y", -n.h / 2);
    rect.setAttribute("width", n.w);
    rect.setAttribute("height", n.h);
    var text = document.createElementNS(NS, "text");
    text.setAttribute("font-size", n.type === "root" ? 19 : 18);

    if (n.type === "root") {
      rect.setAttribute("fill", "#ffffff");
      rect.setAttribute("stroke", "#3c4043");
      var icon = dinoIcon(2);
      icon.setAttribute("transform", "translate(" + (-n.w / 2 + 8) + "," + (-DINO_ROWS.length + 2) + ")");
      g.appendChild(icon);
      text.textContent = n.label;
      text.setAttribute("x", -n.w / 2 + 8 + DINO_ROWS[0].length * 2 + 8);
      text.setAttribute("y", 5);
      text.setAttribute("text-anchor", "start");
      text.setAttribute("font-weight", "700");
      text.setAttribute("fill", "#3c4043");
    } else if (n.type === "dir") {
      rect.setAttribute("fill", "#e8eaed");
      rect.setAttribute("stroke", "#5f6368");
      var count = dirCounts[n.id] ? " (" + dirCounts[n.id] + ")" : "";
      var marker = collapsed[n.id] ? "▸ " : "▾ ";
      text.textContent = marker + n.label + count;
      text.setAttribute("x", 0);
      text.setAttribute("y", 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#5f6368");
    } else {
      if (n.highlight) {
        rect.setAttribute("fill", "#fff8e1");
        rect.setAttribute("stroke", "#fbbc04");
        rect.setAttribute("stroke-width", "3");
      } else {
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", "#3c4043");
      }
      text.textContent = n.label;
      text.setAttribute("x", 0);
      text.setAttribute("y", 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#3c4043");
    }
    g.appendChild(rect);
    g.appendChild(text);
    return g;
  }

  function visibleLink(l) {
    return !hidden[l.source.id] && !hidden[l.target.id];
  }

  function render() {
    linksG.innerHTML = "";
    nodesG.innerHTML = "";
    nodeEls = {};
    linkEls = [];

    links.forEach(function (l) {
      if (!visibleLink(l)) return;
      var line = document.createElementNS(NS, "line");
      line.setAttribute("class", "graph-link" + (l.kind === "ref" ? " ref" : ""));
      line.setAttribute("marker-end", l.kind === "ref" ? "url(#arrow-ref)" : "url(#arrow-solid)");
      linksG.appendChild(line);
      l.el = line;
      linkEls.push(line);
    });

    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      var n = nodes[id];
      var g = rectNode(n);
      g.addEventListener("pointerdown", function (e) { onNodeDown(e, n); });
      g.addEventListener("pointermove", function (e) { onNodeMove(e, n); });
      g.addEventListener("pointerleave", function () { clearHover(); });
      nodesG.appendChild(g);
      nodeEls[id] = g;
    });
    updatePositions();
  }

  function updatePositions() {
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      var g = nodeEls[id];
      if (!g || hidden[id]) return;
      g.setAttribute("transform", "translate(" + n.x + "," + n.y + ")");
    });
    linkEls.forEach(function (line) {
      var l = null;
      for (var i = 0; i < links.length; i++) {
        if (links[i].el === line) { l = links[i]; break; }
      }
      if (l) {
        line.setAttribute("x1", l.source.x);
        line.setAttribute("y1", l.source.y);
        line.setAttribute("x2", l.target.x);
        line.setAttribute("y2", l.target.y);
      }
    });
  }

  /* ---------- interaction ---------- */

  var zoom = 1, ox = 0, oy = 0, dragging = null, moved = false, panning = false;

  function applyTransform() {
    viewport.setAttribute("transform", "translate(" + ox + "," + oy + ") scale(" + zoom + ")");
    if (zoomSlider) zoomSlider.value = String(Math.round(zoom * 100));
  }

  function onNodeDown(e, n) {
    e.stopPropagation();
    e.preventDefault();
    dragging = n;
    n.fixed = true;
    moved = false;
    var startX = e.clientX, startY = e.clientY;
    var originX = n.x, originY = n.y;
    var originPt = toSvg(startX, startY);
    var applied = false;
    var longPressed = false;
    var longPressTimer = setTimeout(function () {
      longPressTimer = null;
      longPressed = true;
      setNodeFocus(n);
    }, 500);
    var move = function (ev) {
      if (dragging !== n) return;
      var dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (longPressTimer && Math.hypot(dx, dy) > 6) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (!applied && Math.hypot(dx, dy) < 4) return;  // ignore click jitter
      var pt = toSvg(ev.clientX, ev.clientY);
      n.x = originX + (pt.x - originPt.x);
      n.y = originY + (pt.y - originPt.y);
      applied = true;
      moved = true;
      updatePositions();
      snakeDirty = true;
    };
    var up = function () {
      dragging = null;
      n.fixed = false;
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (moved || longPressed) return;
      if (n.type === "dir") {
        toggleDir(n.id);
        if (focusNode) applyFocus(focusNode); // re-apply highlight after render
      } else if (n.type === "root") {
        toggleAll();
        if (focusNode) applyFocus(focusNode);
      } else if (n.url) {
        window.location.href = n.url;
      }
    };
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up);
  }

  function toSvg(cx, cy) {
    var rect = svg.getBoundingClientRect();
    return {
      x: (cx - rect.left - ox) / zoom,
      y: (cy - rect.top - oy) / zoom
    };
  }

  function neighbors(n) {
    var set = {};
    links.forEach(function (l) {
      if (l.source === n) set[l.target.id] = true;
      if (l.target === n) set[l.source.id] = true;
    });
    return set;
  }

  var focusNode = null;

  function setNodeFocus(n) {
    // long-pressing the same node toggles the highlight off; long-pressing a
    // different node switches the focus center; clicking empty background
    // also cancels (clearFocus)
    if (focusNode === n) {
      focusNode = null;
      clearFocus();
      return;
    }
    focusNode = n;
    applyFocus(n);
  }

  function applyFocus(n) {
    var nb = neighbors(n);
    Object.keys(nodeEls).forEach(function (id) {
      if (hidden[id]) return;
      var el = nodeEls[id];
      el.style.opacity = (id === n.id || nb[id]) ? "1" : "0.12";
    });
    linkEls.forEach(function (line) {
      var l = null;
      for (var i = 0; i < links.length; i++) {
        if (links[i].el === line) { l = links[i]; break; }
      }
      if (l) {
        line.style.opacity = (l.source === n || l.target === n) ? "1" : "0.12";
      }
    });
  }

  function clearFocus() {
    focusNode = null;
    Object.keys(nodeEls).forEach(function (id) {
      if (!hidden[id]) nodeEls[id].style.opacity = "1";
    });
    linkEls.forEach(function (l) { l.style.opacity = "1"; });
  }

  function showTip(e, n) {
    var tags = (n.tags && n.tags.length) ? n.tags.join(" · ") : (n.folder || "根目录");
    tip.innerHTML = "<b>" + escapeHtml(n.fullLabel) + "</b><span>" +
      escapeHtml(n.type === "post" ? "文章" : n.type === "dir" ? "目录" : "根") +
      " · " + escapeHtml(tags) + "</span>";
    tip.hidden = false;
    var wrapRect = wrap.getBoundingClientRect();
    var x = e.clientX - wrapRect.left + 14;
    var y = e.clientY - wrapRect.top + 14;
    tip.style.left = Math.min(x, wrapRect.width - 220) + "px";
    tip.style.top = Math.min(y, wrapRect.height - 70) + "px";
  }

  function clearHover() {
    tip.hidden = true;
    if (focusNode) {
      applyFocus(focusNode);
      return;
    }
    Object.keys(nodeEls).forEach(function (id) {
      nodeEls[id].style.opacity = "1";
    });
    linkEls.forEach(function (l) { l.style.opacity = "1"; });
  }

  function onNodeMove(e, n) {
    if (dragging === n) return;
    showTip(e, n);
    if (focusNode) return;
    var nb = neighbors(n);
    Object.keys(nodeEls).forEach(function (id) {
      nodeEls[id].style.opacity = (id === n.id || nb[id]) ? "1" : "0.22";
    });
    linkEls.forEach(function (l) { l.style.opacity = "1"; });
  }

  svg.addEventListener("pointerdown", function (e) {
    if (e.target === svg || e.target === linksG || e.target === envLayer) {
      cancelFlashAnim();
      clearFocus();
      e.preventDefault();
      panning = true;
      moved = false;
      var last = { x: e.clientX, y: e.clientY };
      var move = function (ev) {
        if (!panning) return;
        ox += ev.clientX - last.x;
        oy += ev.clientY - last.y;
        last.x = ev.clientX; last.y = ev.clientY;
        applyTransform();
      };
      var up = function () {
        panning = false;
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
    }
  });

  svg.addEventListener("wheel", function (e) {
    cancelFlashAnim();
    e.preventDefault();
    var rect = svg.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoom = Math.min(3, Math.max(0.25, zoom * factor));
    ox = mx - (mx - ox) * factor;
    oy = my - (my - oy) * factor;
    applyTransform();
    snakeDirty = true;
  }, { passive: false });

  /* ---------- floating controls (zoom / pan / recenter) ---------- */

  function zoomBy(factor) {
    cancelFlashAnim();
    var rect = svg.getBoundingClientRect();
    var cx = rect.width / 2, cy = rect.height / 2;
    var z = Math.min(3, Math.max(0.25, zoom * factor));
    var f = z / zoom;
    ox = cx - (cx - ox) * f;
    oy = cy - (cy - oy) * f;
    zoom = z;
    applyTransform();
    snakeDirty = true;
  }

  function setZoomFromSlider(pct) {
    cancelFlashAnim();
    var z = Math.min(3, Math.max(0.25, pct / 100));
    var rect = svg.getBoundingClientRect();
    var cx = rect.width / 2, cy = rect.height / 2;
    var f = z / zoom;
    ox = cx - (cx - ox) * f;
    oy = cy - (cy - oy) * f;
    zoom = z;
    applyTransform();
    snakeDirty = true;
  }

  function panBy(dx, dy) {
    ox += dx;
    oy += dy;
    applyTransform();
  }

  function fitBBox(minX, minY, maxX, maxY, pad, minZ, maxZ, dur) {
    var rect = svg.getBoundingClientRect();
    var z = Math.min(maxZ, Math.max(minZ,
      Math.min((rect.width - 40) / (maxX - minX + pad * 2),
               (rect.height - 40) / (maxY - minY + pad * 2))));
    var tx = rect.width / 2 - ((minX + maxX) / 2) * z;
    var ty = rect.height / 2 - ((minY + maxY) / 2) * z;
    animateTransform([zoom, ox, oy], [z, tx, ty], dur);
    snakeDirty = true;
  }

  function recenterView() {
    if (!data) return;
    var xs = [], ys = [];
    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      var n = nodes[id];
      xs.push(n.x - n.w / 2, n.x + n.w / 2);
      ys.push(n.y - n.h / 2, n.y + n.h / 2);
    });
    if (!xs.length) return;
    fitBBox(
      Math.min.apply(null, xs), Math.min.apply(null, ys),
      Math.max.apply(null, xs), Math.max.apply(null, ys),
      70, 0.4, 2.2, 300
    );
  }

  var hold = { raf: null, fn: null, last: 0 };

  function stopHold() {
    if (hold.raf != null) cancelAnimationFrame(hold.raf);
    hold.raf = null;
    hold.fn = null;
  }

  function holdTick(ts) {
    if (!hold.fn) return;
    var dt = Math.min(120, ts - hold.last) / 1000;
    hold.last = ts;
    hold.fn(dt);
    hold.raf = requestAnimationFrame(holdTick);
  }

  function startHold(fn) {
    stopHold();
    hold.fn = fn;
    hold.last = performance.now();
    fn(0); // a quick tap performs one step
    hold.raf = requestAnimationFrame(holdTick);
  }

  function bindHoldBtn(el, fn) {
    if (!el) return;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      startHold(fn);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      el.addEventListener(ev, function () {
        if (hold.fn === fn) stopHold();
      });
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn(0);
      }
    });
  }

  function panHandler(dx, dy) {
    return function (dt) {
      var rect = svg.getBoundingClientRect();
      var speed = Math.max(320, rect.width * 0.85); // px per second
      var step = dt > 0 ? speed * dt : rect.width * 0.15;
      panBy(-dx * step, -dy * step);
    };
  }

  function zoomHandler(factor) {
    return function (dt) {
      zoomBy(dt > 0 ? Math.pow(factor, dt * 2) : factor);
    };
  }

  bindHoldBtn(zoomInBtn, zoomHandler(1.25));
  bindHoldBtn(zoomOutBtn, zoomHandler(1 / 1.25));
  bindHoldBtn(panUpBtn, panHandler(0, -1));
  bindHoldBtn(panDownBtn, panHandler(0, 1));
  bindHoldBtn(panLeftBtn, panHandler(-1, 0));
  bindHoldBtn(panRightBtn, panHandler(1, 0));

  if (zoomSlider) {
    zoomSlider.addEventListener("input", function () {
      setZoomFromSlider(parseFloat(zoomSlider.value) || 100);
    });
  }
  if (recenterBtn) {
    recenterBtn.addEventListener("click", recenterView);
    recenterBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        recenterView();
      }
    });
  }

  var expandBtn = document.getElementById("graph-expand-all");
  var collapseBtn = document.getElementById("graph-collapse-all");
  if (expandBtn) expandBtn.addEventListener("click", expandAll);
  if (collapseBtn) collapseBtn.addEventListener("click", collapseAll);
  if (fitBtn) fitBtn.addEventListener("click", fitView);

  function fitView() {
    var xs = [], ys = [];
    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      var n = nodes[id];
      xs.push(n.x - n.w / 2, n.x + n.w / 2);
      ys.push(n.y - n.h / 2, n.y + n.h / 2);
    });
    if (snakeCfg.enabled && snakeState.body && snakeState.body.length) {
      snakeState.body.forEach(function (p) {
        xs.push(p.x - 6, p.x + 6);
        ys.push(p.y - 6, p.y + 6);
      });
    }
    if (!xs.length) return;
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var rect = svg.getBoundingClientRect();
    zoom = Math.min(
      (rect.width - 70) / (maxX - minX + 70),
      (rect.height - 70) / (maxY - minY + 70),
      2.2
    );
    zoom = Math.max(1.0, zoom);
    ox = rect.width / 2 - ((minX + maxX) / 2) * zoom;
    oy = rect.height / 2 - ((minY + maxY) / 2) * zoom;
    applyTransform();
  }

  function updateStats() {
    if (!statsEl) return;
    var posts = Object.keys(nodes).filter(function (id) {
      return nodes[id].type === "post" && !hidden[id];
    }).length;
    var dirs = Object.keys(nodes).filter(function (id) {
      return nodes[id].type === "dir" && !hidden[id];
    }).length;
    var folded = Object.keys(hidden).length;
    statsEl.textContent =
      data.stats.posts + " 篇文章 · " + data.stats.dirs + " 个主题 · " +
      data.stats.refs + " 条引用" +
      (folded ? " · 已折叠 " + folded + " 个节点" : "");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- folder highlight (nav integration) ---------- */

  var flashAnim = null; // active temporary zoom animation
  var pendingHighlight = null;

  function cancelFlashAnim() {
    if (flashAnim) {
      if (flashAnim.raf) cancelAnimationFrame(flashAnim.raf);
      if (flashAnim.timer) clearTimeout(flashAnim.timer);
      flashAnim = null;
    }
  }

  function animateTransform(from, to, dur, done) {
    cancelFlashAnim();
    var t0 = null;
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = ease(k);
      zoom = from[0] + (to[0] - from[0]) * e;
      ox = from[1] + (to[1] - from[1]) * e;
      oy = from[2] + (to[2] - from[2]) * e;
      applyTransform();
      if (k < 1) {
        flashAnim.raf = requestAnimationFrame(frame);
      } else {
        flashAnim = null;
        if (done) done();
      }
    }
    flashAnim = { raf: requestAnimationFrame(frame), timer: null };
  }

  function highlightFolder(folder) {
    if (!data) {
      pendingHighlight = folder;
      return;
    }
    pendingHighlight = null;
    var parts = String(folder).split("/").filter(Boolean);
    var acc = "";
    var changed = false;
    parts.forEach(function (part) {
      acc = acc ? acc + "/" + part : part;
      if (collapsed[acc]) {
        expandDir(acc);
        changed = true;
      }
    });
    if (changed) {
      render();
      updateStats();
      snakeDirty = true;
    }

    // bounding box of the folder's whole subtree (dirs + posts)
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var found = false;
    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      if (id !== folder && id.indexOf(folder + "/") !== 0) return;
      var n = nodes[id];
      found = true;
      minX = Math.min(minX, n.x - n.w / 2);
      minY = Math.min(minY, n.y - n.h / 2);
      maxX = Math.max(maxX, n.x + n.w / 2);
      maxY = Math.max(maxY, n.y + n.h / 2);
    });
    if (!found) return;

    var pad = 46;
    var flash = document.createElementNS(NS, "rect");
    flash.setAttribute("class", "graph-flash");
    flash.setAttribute("x", minX - pad);
    flash.setAttribute("y", minY - pad);
    flash.setAttribute("width", maxX - minX + pad * 2);
    flash.setAttribute("height", maxY - minY + pad * 2);
    envLayer.appendChild(flash);
    flash.addEventListener("animationend", function () {
      flash.remove();
    });

    // zoom to fit the subtree's bounding box so its nodes fill the view
    fitBBox(minX, minY, maxX, maxY, 46, 0.4, 2.2, 320);
  }

  /* ============================================================
     envelope snake
     ============================================================ */

  var snakeCfg = {
    enabled: true,
    speed: 1.5,
    gap: 28,
    segLen: 16,
    segCount: 9,
    headSize: 13,
    bodySize: 9
  };

  var snakeState = {
    t: 0,
    path: null,
    body: []
  };
  var snakeDirty = true;
  var rafId = null;

  var envPoly = document.createElementNS(NS, "polyline");
  envPoly.setAttribute("class", "graph-env");
  envPoly.setAttribute("fill", "none");
  envLayer.appendChild(envPoly);
  var snakeGroup = document.createElementNS(NS, "g");
  snakeGroup.setAttribute("class", "graph-snake");
  envLayer.appendChild(snakeGroup);

  function convexHull(points) {
    if (points.length < 3) return points.slice();
    var pts = points.slice().sort(function (a, b) {
      return a[0] - b[0] || a[1] - b[1];
    });
    function cross(o, a, b) {
      return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
    var lower = [];
    for (var i = 0; i < pts.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
      lower.push(pts[i]);
    }
    var upper = [];
    for (var j = pts.length - 1; j >= 0; j--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[j]) <= 0) upper.pop();
      upper.push(pts[j]);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function offsetPolygon(hull, dist) {
    var n = hull.length;
    if (n < 3) {
      var xs = hull.map(function (p) { return p[0]; });
      var ys = hull.map(function (p) { return p[1]; });
      return [
        [Math.min.apply(null, xs) - dist, Math.min.apply(null, ys) - dist],
        [Math.max.apply(null, xs) + dist, Math.min.apply(null, ys) - dist],
        [Math.max.apply(null, xs) + dist, Math.max.apply(null, ys) + dist],
        [Math.min.apply(null, xs) - dist, Math.max.apply(null, ys) + dist]
      ];
    }
    var cx = 0, cy = 0;
    for (var i = 0; i < n; i++) { cx += hull[i][0]; cy += hull[i][1]; }
    cx /= n; cy /= n;
    var edges = [];
    for (var j = 0; j < n; j++) {
      var a = hull[j], b = hull[(j + 1) % n];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      var nx = -dy, ny = dx;
      if ((a[0] - cx) * nx + (a[1] - cy) * ny < 0) { nx = -nx; ny = -ny; }
      edges.push({ px: a[0] + nx * dist, py: a[1] + ny * dist, dx: dx, dy: dy });
    }
    var out = [];
    for (var k = 0; k < n; k++) {
      var e1 = edges[k], e0 = edges[(k - 1 + n) % n];
      var den = e0.dx * e1.dy - e0.dy * e1.dx;
      var x, y;
      if (Math.abs(den) < 1e-9) {
        x = (e0.px + e1.px) / 2;
        y = (e0.py + e1.py) / 2;
      } else {
        var t = ((e1.px - e0.px) * e1.dy - (e1.py - e0.py) * e1.dx) / den;
        x = e0.px + t * e0.dx;
        y = e0.py + t * e0.dy;
      }
      out.push([x, y]);
    }
    return out;
  }

  function buildEnvelope() {
    var corners = [];
    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      var n = nodes[id];
      corners.push(
        [n.x - n.w / 2, n.y - n.h / 2],
        [n.x + n.w / 2, n.y - n.h / 2],
        [n.x + n.w / 2, n.y + n.h / 2],
        [n.x - n.w / 2, n.y + n.h / 2]
      );
    });
    if (!corners.length) {
      snakeState.path = null;
      return;
    }
    var hull = convexHull(corners);
    var dist = snakeCfg.gap / Math.max(zoom, 0.15);
    var offset = offsetPolygon(hull, dist);
    var step = 14;
    var total = 0;
    var segs = [];
    for (var i = 0; i < offset.length; i++) {
      var a = offset[i], b = offset[(i + 1) % offset.length];
      var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push({ a: a, b: b, len: len });
      total += len;
    }
    if (total < step * 4) {
      snakeState.path = { pts: offset.map(function (p) { return [p[0], p[1]]; }), total: total };
      return;
    }
    var count = Math.max(6, Math.floor(total / step));
    var pts = [];
    for (var k = 0; k <= count; k++) {
      var d = k * total / count;
      var acc = 0, seg = segs[segs.length - 1];
      for (var j = 0; j < segs.length; j++) {
        if (acc + segs[j].len >= d || j === segs.length - 1) { seg = segs[j]; break; }
        acc += segs[j].len;
      }
      var tt = seg.len ? Math.max(0, Math.min(1, (d - acc) / seg.len)) : 0;
      pts.push([seg.a[0] + (seg.b[0] - seg.a[0]) * tt, seg.a[1] + (seg.b[1] - seg.a[1]) * tt]);
    }
    snakeState.path = { pts: pts, total: total };
    snakeState.t = snakeState.t % total;

    var polyPts = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    envPoly.setAttribute("points", polyPts);
    envPoly.setAttribute("display", snakeCfg.enabled ? "" : "none");
  }

  function pathPoint(t) {
    var path = snakeState.path;
    if (!path || !path.pts.length) return { x: 0, y: 0 };
    var pts = path.pts, total = path.total;
    t = ((t % total) + total) % total;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (t <= len) {
        var f = len ? t / len : 0;
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
      }
      t -= len;
    }
    return { x: pts[0][0], y: pts[0][1] };
  }

  function avoidForce(p, gap, strength) {
    var fx = 0, fy = 0;
    Object.keys(nodes).forEach(function (id) {
      if (hidden[id]) return;
      var n = nodes[id];
      var minX = n.x - n.w / 2 - gap, maxX = n.x + n.w / 2 + gap;
      var minY = n.y - n.h / 2 - gap, maxY = n.y + n.h / 2 + gap;
      if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) return;
      var qx = Math.max(n.x - n.w / 2, Math.min(p.x, n.x + n.w / 2));
      var qy = Math.max(n.y - n.h / 2, Math.min(p.y, n.y + n.h / 2));
      var dx = p.x - qx, dy = p.y - qy;
      var d = Math.hypot(dx, dy);
      if (d < 1e-6) {
        var l = p.x - (n.x - n.w / 2), r = (n.x + n.w / 2) - p.x;
        var t = p.y - (n.y - n.h / 2), b = (n.y + n.h / 2) - p.y;
        var m = Math.min(l, r, t, b);
        if (m === l) fx -= gap;
        else if (m === r) fx += gap;
        else if (m === t) fy -= gap;
        else fy += gap;
      } else {
        var push = (gap - d) * strength;
        fx += (dx / d) * push;
        fy += (dy / d) * push;
      }
    });
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      if (hidden[l.source.id] || hidden[l.target.id]) continue;
      var abx = l.target.x - l.source.x, aby = l.target.y - l.source.y;
      var len2 = abx * abx + aby * aby || 1;
      var tt = Math.max(0, Math.min(1, ((p.x - l.source.x) * abx + (p.y - l.source.y) * aby) / len2));
      var qx = l.source.x + abx * tt, qy = l.source.y + aby * tt;
      var dx = p.x - qx, dy = p.y - qy;
      var d = Math.hypot(dx, dy);
      if (d > 1e-6 && d < gap) {
        var push = (gap - d) * strength * 0.7;
        fx += (dx / d) * push;
        fy += (dy / d) * push;
      }
    }
    return { x: fx, y: fy };
  }

  function stepSnake() {
    if (!snakeState.path) return;
    var gap = snakeCfg.gap / Math.max(zoom, 0.15);
    snakeState.t += snakeCfg.speed;
    if (snakeState.t >= snakeState.path.total) snakeState.t -= snakeState.path.total;

    var base = pathPoint(snakeState.t);
    var av = avoidForce(base, gap, 0.5);
    var target = { x: base.x + av.x, y: base.y + av.y };
    var prevHead = snakeState.body[0] || target;
    var head = {
      x: prevHead.x + (target.x - prevHead.x) * 0.42,
      y: prevHead.y + (target.y - prevHead.y) * 0.42
    };
    var pts = [head];
    for (var i = 1; i < snakeCfg.segCount; i++) {
      var cur = snakeState.body[i] || { x: head.x, y: head.y };
      var prev = pts[i - 1];
      var dx = cur.x - prev.x, dy = cur.y - prev.y;
      var d = Math.hypot(dx, dy) || 1;
      var k = (d - snakeCfg.segLen) / d;
      cur.x -= dx * k;
      cur.y -= dy * k;
      var bav = avoidForce(cur, gap * 0.75, 0.3);
      cur.x += bav.x;
      cur.y += bav.y;
      pts.push(cur);
    }
    snakeState.body = pts;
    drawSnake();
  }

  function drawSnake() {
    while (snakeGroup.firstChild) snakeGroup.removeChild(snakeGroup.firstChild);
    if (!snakeState.body.length) return;
    var body = snakeState.body;
    for (var i = 0; i < body.length; i++) {
      var p = body[i];
      var size = i === 0 ? snakeCfg.headSize : snakeCfg.bodySize;
      var x = Math.round(p.x - size / 2);
      var y = Math.round(p.y - size / 2);
      var rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", size);
      rect.setAttribute("height", size);
      if (i === 0) {
        rect.setAttribute("fill", "#1a73e8");
      } else {
        rect.setAttribute("fill", i % 3 === 0 ? "#5f6368" : "#3c4043");
      }
      snakeGroup.appendChild(rect);
      if (i === 0 && body[1]) {
        var dx = p.x - body[1].x, dy = p.y - body[1].y;
        var d = Math.hypot(dx, dy) || 1;
        var ex = Math.round(p.x + (dx / d) * (size * 0.28) - 1.5);
        var ey = Math.round(p.y + (dy / d) * (size * 0.28) - 1.5);
        var eye = document.createElementNS(NS, "rect");
        eye.setAttribute("x", ex);
        eye.setAttribute("y", ey);
        eye.setAttribute("width", 3);
        eye.setAttribute("height", 3);
        eye.setAttribute("fill", "#ffffff");
        snakeGroup.appendChild(eye);
      }
    }
  }

  function loop() {
    if (!snakeCfg.enabled) return;
    if (snakeDirty) {
      snakeDirty = false;
      buildEnvelope();
    }
    stepSnake();
    rafId = requestAnimationFrame(loop);
  }

  function toggleSnake(force) {
    var on = force !== undefined ? force : !snakeCfg.enabled;
    snakeCfg.enabled = on;
    if (snakeBtn) {
      snakeBtn.textContent = on ? "贪吃蛇 开" : "贪吃蛇 关";
      snakeBtn.classList.toggle("is-on", on);
    }
    envLayer.setAttribute("display", on ? "" : "none");
    try { localStorage.setItem("pilog.graph.snake", on ? "1" : "0"); } catch (e) { /* ignore */ }
    if (on) {
      snakeDirty = true;
      if (rafId == null) rafId = requestAnimationFrame(loop);
    } else {
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      while (snakeGroup.firstChild) snakeGroup.removeChild(snakeGroup.firstChild);
      envPoly.setAttribute("display", "none");
    }
  }

  if (snakeBtn) {
    snakeBtn.addEventListener("click", function () { toggleSnake(); });
  }
  try {
    var saved = localStorage.getItem("pilog.graph.snake");
    if (saved === "0") toggleSnake(false);
  } catch (e) { /* ignore */ }

  /* ---------- boot ---------- */

  function run() {
    build();
    warmup(320);
    render();
    updateStats();
    fitView();
    if (snakeCfg.enabled) {
      snakeDirty = true;
      if (rafId == null) rafId = requestAnimationFrame(loop);
    }
  }

  window.pilogGraph = {
    started: false,
    start: function () {
      if (this.started) return;
      this.started = true;
      setLoading(true, "加载图谱中…");
      var self = this;
      fetch(dataRoot + "data/graph.json")
        .then(function (r) { return r.json(); })
        .then(function (d) {
          data = d;
          run();
          setLoading(false);
          if (pendingHighlight) {
            var f = pendingHighlight;
            pendingHighlight = null;
            highlightFolder(f);
          }
        })
        .catch(function () {
          self.started = false;
          setLoading(true, "图谱加载失败，请刷新重试");
        });
    },
    highlightFolder: function (folder) {
      highlightFolder(folder);
    }
  };

  /* ---------- loading indicator (site graph pane) ---------- */

  var loadingEl = document.getElementById("site-graph-loading");
  var loadingText = document.getElementById("site-graph-loading-text");

  function setLoading(on, msg) {
    if (!loadingEl) return;
    loadingEl.hidden = !on;
    if (msg && loadingText) loadingText.textContent = msg;
  }

  var pane = document.querySelector(".view-pane.is-active");
  if (pane && pane.dataset.pane === "graph") {
    window.pilogGraph.start();
  }
})();
