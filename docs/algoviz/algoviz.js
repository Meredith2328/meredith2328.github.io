/* algoviz — step-player for algorithm visualizations.
 *
 * A "module" is a JS file defining window.AlgoVizModules[id] = {...}:
 *   {
 *     title, language ("python"), code: "original source code",
 *     defaultInput: "editable text", inputHint: "how to format the text",
 *     views: { key: {type, title}, ... },          // ordered view layout
 *     parseInput(text) -> input,                    // optional, default: raw text
 *     run(input) -> steps[] | {steps, output}       // trace generator
 *   }
 * Each step: { line: <1-based line in code>, msg: "...",
 *              views: { key: <view state snapshot> } }
 *
 * Player guarantees: only the current step is rendered; jumping is O(1),
 * so very long traces stay smooth.
 */
(function (global) {
  "use strict";

  var MAX_STEPS = 100000;
  var SPEEDS = [0.25, 0.5, 1, 2, 4];
  var BASE_DELAY = 900; // ms per step at 1x

  var moduleCache = {}; // id -> Promise<module>
  var moduleRoots = []; // id -> script promise

  /* ---------------- module loading ---------------- */

  function moduleBaseUrl() {
    // algoviz.js is loaded from <base>algoviz.js — modules live next to it
    // as <base>modules/<id>.js, unless data-viz-base overrides.
    var scripts = document.querySelectorAll("script[src]");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var m = /(.*)algoviz\.js(\?.*)?$/.exec(scripts[i].src);
      if (m) return m[1];
    }
    return "";
  }

  function loadModule(id, base) {
    if (moduleCache[id]) return moduleCache[id];
    var prefix = base || moduleBaseUrl();
    // two supported layouts: <prefix>modules/ (integration) or
    // sibling modules/ of the player dir (repo layout)
    var urls = [
      prefix + "modules/" + encodeURIComponent(id) + ".js",
      prefix + "../modules/" + encodeURIComponent(id) + ".js"
    ];
    moduleCache[id] = new Promise(function (resolve, reject) {
      var i = 0;
      function tryNext() {
        if (i >= urls.length) { reject(new Error("failed to load module '" + id + "'")); return; }
        var s = document.createElement("script");
        s.src = urls[i++];
        s.onload = function () {
          var mods = global.AlgoVizModules || {};
          if (mods[id]) resolve(mods[id]);
          else tryNext();
        };
        s.onerror = function () { s.remove(); tryNext(); };
        document.head.appendChild(s);
      }
      tryNext();
    });
    return moduleCache[id];
  }

  /* ---------------- python highlighter ---------------- */

  var PY_KW = new Set(("def return if elif else for while in not and or is None True False class "
    + "import from as with try except finally raise pass break continue lambda yield global nonlocal assert del").split(" "));

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function hlPython(line) {
    if (/^\s*#/.test(line)) return '<span class="av-com">' + esc(line) + "</span>";
    var out = "", rest = line, m;
    var tokenRe = /(#|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|\s+|.)/g;
    var parts, i;
    while ((m = tokenRe.exec(line)) !== null) {
      var t = m[0];
      if (t === "#") { out += '<span class="av-com">' + esc(line.slice(m.index)) + "</span>"; break; }
      if (/^["']/.test(t)) out += '<span class="av-str">' + esc(t) + "</span>";
      else if (/^\d/.test(t)) out += '<span class="av-num">' + esc(t) + "</span>";
      else if (/^[A-Za-z_]/.test(t)) {
        var next = line[m.index + t.length];
        if (PY_KW.has(t)) out += '<span class="av-kw">' + esc(t) + "</span>";
        else if (next === "(") out += '<span class="av-fn">' + esc(t) + "</span>";
        else out += esc(t);
      } else out += esc(t);
    }
    return out;
  }

  /* ---------------- tiny dom helpers ---------------- */

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c != null) el.appendChild(c); });
    return el;
  }
  function fmt(v) {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "string") return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }

  /* ---------------- view renderers ----------------
   * Each renderer gets (container, state, title). State shapes are small
   * plain objects so LLM-generated traces stay simple. */

  function chipCell(v, extraCls, idxLabel) {
    var c = h("span", { class: "av-cell" + (extraCls ? " " + extraCls : ""), text: fmt(v) });
    if (idxLabel != null) c.appendChild(h("span", { class: "av-idx", text: String(idxLabel) }));
    return c;
  }

  var RENDERERS = {
    vars: function (box, st) {
      var wrap = h("div", { class: "av-vars" });
      var keys = Object.keys(st || {});
      if (!keys.length) { box.appendChild(h("div", { class: "av-view-error", text: "（无变量）" })); return; }
      keys.forEach(function (k) {
        wrap.appendChild(h("span", {
          class: "av-var" + (st[k] && st[k].__hot ? " av-hot" : ""),
          html: "<b>" + esc(k) + "</b>" + esc(fmt(st[k] && st[k].__hot ? st[k].value : st[k]))
        }));
      });
      box.appendChild(wrap);
    },

    array: function (box, st) {
      st = st || {};
      var items = st.items || [], hi = new Set(st.highlights || []);
      var ok = new Set(st.ok || []), bad = new Set(st.bad || []);
      var ptrs = st.pointers || {}; // {name: index}
      var labels = {};
      Object.keys(ptrs).forEach(function (n) { (labels[ptrs[n]] = labels[ptrs[n]] || []).push(n + ":" + ptrs[n]); });
      var wrap = h("div", { class: "av-cells" });
      items.forEach(function (v, i) {
        var cls = hi.has(i) ? "av-hi" : ok.has(i) ? "av-ok" : bad.has(i) ? "av-bad" : "";
        wrap.appendChild(chipCell(v, cls, labels[i] ? labels[i].join(" ") : (st.showIndex ? i : null)));
      });
      if (!items.length) wrap.appendChild(h("span", { class: "av-view-error", text: "[]" }));
      box.appendChild(wrap);
    },

    bars: function (box, st) {
      st = st || {};
      var bars = st.bars || [], axis = st.axis || { min: 0, max: 100 };
      var hi = new Set(st.highlights || []);
      var min = axis.min, span = Math.max(axis.max - axis.min, 1e-9);
      function pct(x) { return Math.min(100, Math.max(0, (x - min) / span * 100)); }
      var wrap = h("div", { class: "av-axis-wrap" });
      var axisEl = h("div", { class: "av-axis" });
      var ticks = axis.ticks != null ? axis.ticks : 5;
      if (typeof ticks === "number") {
        for (var i = 0; i <= ticks; i++) {
          var val = min + span * i / ticks;
          var lab = Math.abs(val - Math.round(val)) < 1e-9 ? Math.round(val) : Math.round(val * 10) / 10;
          axisEl.appendChild(h("span", { class: "av-axis-tick", style: "left:" + (i / ticks * 100) + "%", text: String(lab) }));
        }
      } else { // explicit array of {pos,label}
        ticks.forEach(function (t) {
          axisEl.appendChild(h("span", { class: "av-axis-tick", style: "left:" + pct(t.pos) + "%", text: String(t.label) }));
        });
      }
      var barsWrap = h("div");
      bars.forEach(function (b, i) {
        var row = h("div", { class: "av-bar-row" });
        var cls = hi.has(i) ? " av-hi" : b.status === "ok" ? " av-ok" : b.status === "bad" ? " av-bad" : "";
        var label = b.label != null ? b.label : "[" + b.start + ", " + b.end + "]";
        row.appendChild(h("div", {
          class: "av-bar" + cls,
          style: "left:" + pct(b.start) + "%;width:" + Math.max(pct(b.end) - pct(b.start), 1.5) + "%",
          text: String(label)
        }));
        barsWrap.appendChild(row);
      });
      wrap.appendChild(axisEl); wrap.appendChild(barsWrap); box.appendChild(wrap);
    },

    grid: function (box, st) {
      st = st || {};
      var cells = st.cells || [];
      var hi = new Set((st.highlights || []).map(function (p) { return p[0] + "," + p[1]; }));
      var ok = new Set((st.ok || []).map(function (p) { return p[0] + "," + p[1]; }));
      var bad = new Set((st.bad || []).map(function (p) { return p[0] + "," + p[1]; }));
      var t = h("table", { class: "av-grid" });
      cells.forEach(function (row, r) {
        var tr = h("tr");
        row.forEach(function (v, c) {
          var key = r + "," + c;
          var cls = hi.has(key) ? "av-hi" : ok.has(key) ? "av-ok" : bad.has(key) ? "av-bad" : "";
          tr.appendChild(h("td", { class: cls, text: fmt(v) }));
        });
        t.appendChild(tr);
      });
      box.appendChild(t);
    },

    stack: function (box, st) {
      st = st || {};
      var wrap = h("div", { class: "av-stack" });
      (st.items || []).forEach(function (v, i) {
        wrap.appendChild(chipCell(v, (st.highlights || []).indexOf(i) >= 0 ? "av-hi" : ""));
      });
      if (!(st.items || []).length) wrap.appendChild(h("span", { class: "av-view-error", text: "空" }));
      box.appendChild(wrap);
    },

    queue: function (box, st) {
      st = st || {};
      var wrap = h("div", { class: "av-queue" });
      (st.items || []).forEach(function (v, i) {
        wrap.appendChild(chipCell(v, (st.highlights || []).indexOf(i) >= 0 ? "av-hi" : ""));
      });
      if (!(st.items || []).length) wrap.appendChild(h("span", { class: "av-view-error", text: "空" }));
      box.appendChild(wrap);
    },

    tree: function (box, st) {
      st = st || {};
      if (!st.root) { box.appendChild(h("div", { class: "av-view-error", text: "空树" })); return; }
      // st.root: {val, children: [...], status?} — layout bottom-up by depth
      var nodes = [], edges = [];
      (function walk(n, depth) {
        var id = nodes.length;
        nodes.push({ v: n.val, depth: depth, status: n.status, w: 1 });
        (n.children || []).forEach(function (c, i) {
          var cid = walk(c, depth + 1);
          edges.push([id, cid]);
        });
        return id;
      })(st.root, 0);
      // compute widths (leaf = 1)
      for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].w === 1) {
          var kids = edges.filter(function (e) { return e[0] === i; });
          if (kids.length) nodes[i].w = kids.reduce(function (s, e) { return s + nodes[e[1]].w; }, 0);
        }
      }
      var maxDepth = Math.max.apply(null, nodes.map(function (n) { return n.depth; }));
      var ROW = 56, UNIT = 44, PAD = 22, R = 15;
      var totalW = nodes[0].w;
      // assign x by in-order leaf slot
      var slot = 0;
      var pos = new Array(nodes.length);
      (function place(id) {
        var kids = edges.filter(function (e) { return e[0] === id; });
        if (!kids.length) { pos[id] = { x: PAD + (slot++) * UNIT }; return; }
        kids.forEach(function (e) { place(e[1]); });
        var xs = kids.map(function (e) { return pos[e[1]].x; });
        pos[id] = { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2 };
      })(0);
      var W = Math.max(PAD * 2 + totalW * UNIT, 120), H = (maxDepth + 1) * ROW;
      nodes.forEach(function (n, i) { pos[i].y = 14 + n.depth * ROW; });
      var svg = '<svg width="' + W + '" height="' + (H + 10) + '" viewBox="0 0 ' + W + " " + (H + 10) + '">';
      edges.forEach(function (e) {
        svg += '<line class="av-edge" x1="' + pos[e[0]].x + '" y1="' + pos[e[0]].y + '" x2="' + pos[e[1]].x + '" y2="' + pos[e[1]].y + '"/>';
      });
      nodes.forEach(function (n, i) {
        var cls = "av-node" + (n.status === "hi" ? " av-hi" : n.status === "ok" ? " av-ok" : n.status === "bad" ? " av-bad" : "");
        svg += '<g class="' + cls + '"><circle cx="' + pos[i].x + '" cy="' + pos[i].y + '" r="' + R + '"/>'
          + "<text x=\"" + pos[i].x + "\" y=\"" + pos[i].y + "\">" + esc(fmt(n.v)) + "</text></g>";
      });
      svg += "</svg>";
      var wrap = h("div", { class: "av-tree" });
      wrap.innerHTML = svg;
      box.appendChild(wrap);
    },

    heap: function (box, st) {
      st = st || {};
      var items = st.items || [];
      if (!items.length) { box.appendChild(h("div", { class: "av-view-error", text: "空堆" })); return; }
      var root = { val: items[0], children: [], status: (st.highlights || []).indexOf(0) >= 0 ? "hi" : undefined };
      var q = [root];
      for (var i = 1; i < items.length; i++) {
        var parent = q[Math.floor((i - 1) / 2)] || q[0];
        var node = { val: items[i], children: [], status: (st.highlights || []).indexOf(i) >= 0 ? "hi" : undefined };
        parent.children.push(node); q.push(node);
      }
      RENDERERS.tree(box, { root: root });
      var arr = h("div", { class: "av-cells", style: "margin-top:8px" });
      items.forEach(function (v, i) { arr.appendChild(chipCell(v, (st.highlights || []).indexOf(i) >= 0 ? "av-hi" : "", null)); });
      box.appendChild(arr);
    },

    graph: function (box, st) {
      st = st || {};
      var nodes = st.nodes || [], edges = st.edges || [];
      var hi = new Set(st.highlights || []);
      if (!nodes.length) { box.appendChild(h("div", { class: "av-view-error", text: "空图" })); return; }
      var W = 300, H = Math.max(60, Math.min(360, 36 * Math.ceil(nodes.length / 4)));
      var svg = '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + " " + H + '">';
      var pos = {};
      nodes.forEach(function (n, i) {
        pos[n.id] = n.x != null && n.y != null ? { x: n.x, y: n.y }
          : { x: 30 + (i % 4) * 80, y: 24 + Math.floor(i / 4) * 56 };
      });
      edges.forEach(function (e) {
        var a = pos[e[0]], b = pos[e[1]];
        if (!a || !b) return;
        svg += '<line class="av-edge" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
      });
      nodes.forEach(function (n) {
        var p = pos[n.id];
        var cls = "av-node" + (hi.has(n.id) ? " av-hi" : "");
        svg += '<g class="' + cls + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="15"/>'
          + "<text x=\"" + p.x + "\" y=\"" + p.y + "\">" + esc(fmt(n.val != null ? n.val : n.id)) + "</text></g>";
      });
      svg += "</svg>";
      var wrap = h("div", { class: "av-graph" });
      wrap.innerHTML = svg;
      box.appendChild(wrap);
    },

    output: function (box, st) {
      st = st || {};
      var el = h("div", { class: "av-output" });
      el.appendChild(h("span", { class: "av-out-label", text: "OUTPUT" }));
      el.appendChild(document.createTextNode(fmt(st.text != null ? st.text : st)));
      box.appendChild(el);
    },

    callstack: function (box, st) {
      st = st || {};
      var wrap = h("div", { class: "av-frames" });
      (st.frames || []).forEach(function (f) {
        wrap.appendChild(h("div", { class: "av-frame", text: fmt(f) }));
      });
      if (!(st.frames || []).length) wrap.appendChild(h("span", { class: "av-view-error", text: "空调用栈" }));
      box.appendChild(wrap);
    },

    text: function (box, st) {
      box.appendChild(h("div", { class: "av-output", style: "border:none;background:none;padding:2px 0", text: fmt(st && st.text != null ? st.text : st) }));
    }
  };

  /* ---------------- player ---------------- */

  function buildPlayer(root, mod, opts) {
    opts = opts || {};
    root.innerHTML = "";
    root.classList.add("algoviz-mounted");

    var codeLines = mod.code.replace(/\r\n/g, "\n").split("\n");
    var steps = [], output = null, inputText = mod.defaultInput || "";
    var idx = 0, playing = false, timer = null, speed = 1;

    // --- header controls
    var playIcon = '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg>';
    var pauseIcon = '<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';
    var playBtn = h("button", { class: "algoviz-btn algoviz-btn-play", html: playIcon, title: "播放/暂停 (空格)" });
    var firstBtn = h("button", { class: "algoviz-btn", html: '<svg viewBox="0 0 16 16"><path d="M3 2.5h2v11H3zM13 2.5v11L6 8z"/></svg>', title: "回到开头" });
    var prevBtn = h("button", { class: "algoviz-btn", html: '<svg viewBox="0 0 16 16"><path d="M12 2.5v11L5 8zM3 2.5h2v11H3z"/></svg>', title: "上一步 (←)" });
    var nextBtn = h("button", { class: "algoviz-btn", html: '<svg viewBox="0 0 16 16"><path d="M4 2.5v11L11 8zM11 2.5h2v11h-2z"/></svg>', title: "下一步 (→)" });
    var lastBtn = h("button", { class: "algoviz-btn", html: '<svg viewBox="0 0 16 16"><path d="M11 2.5h2v11h-2zM3 2.5v11L10 8z"/></svg>', title: "跳到结尾" });
    var speedSel = h("select", { class: "algoviz-select", title: "播放速度" },
      SPEEDS.map(function (s) { return h("option", { value: String(s), text: s + "x", selected: s === 1 ? "" : null }); }));
    var stepLabel = h("span", { class: "algoviz-step-label", text: "Step 0 / 0" });
    var editBtn = h("button", { class: "algoviz-btn", text: "✎ Edit Testcase", title: "编辑测试用例" });
    var collapseBtn = h("button", { class: "algoviz-btn", text: "收起 ▲", title: "收起播放器（保留进度）" });
    var slider = h("input", { class: "algoviz-progress", type: "range", min: "0", max: "0", value: "0" });

    var header = h("div", { class: "algoviz-header" }, [
      h("div", { class: "algoviz-title", html: esc(mod.title || mod.id || "") + "<small>algoviz</small>" }),
      firstBtn, prevBtn, playBtn, nextBtn, lastBtn, speedSel,
      slider, stepLabel, editBtn, collapseBtn
    ]);

    // --- code panel
    var codeTable = h("table");
    var rowEls = codeLines.map(function (src, i) {
      var tr = h("tr", null, [
        h("td", { class: "av-ln", text: String(i + 1) }),
        h("td", { class: "av-src", html: hlPython(src) || "&nbsp;" })
      ]);
      codeTable.appendChild(tr);
      return tr;
    });
    var codePanel = h("div", { class: "algoviz-code" }, [codeTable]);

    // --- views panel
    var viewDefs = mod.views || {};
    var viewBoxes = {};
    var viewsPanel = h("div", { class: "algoviz-views" });
    Object.keys(viewDefs).forEach(function (key) {
      var def = viewDefs[key];
      var box = h("div", { class: "av-view" });
      box.appendChild(h("div", { class: "algoviz-view-title", text: def.title || key }));
      var inner = h("div");
      box.appendChild(inner);
      viewBoxes[key] = { def: def, inner: inner, box: box };
      viewsPanel.appendChild(box);
    });
    var outBox = h("div", { class: "av-view" });
    outBox.appendChild(h("div", { class: "algoviz-view-title", text: "Output" }));
    var outInner = h("div");
    outBox.appendChild(outInner);
    viewsPanel.appendChild(outBox);

    // --- footer message
    var stepDot = h("span", { class: "av-step-dot", text: "1" });
    var msgText = h("span", { text: "" });
    var msgBar = h("div", { class: "algoviz-msg" }, [stepDot, msgText]);

    var modalHost = h("div");
    root.appendChild(header);
    root.appendChild(h("div", { class: "algoviz-body" }, [codePanel, viewsPanel]));
    root.appendChild(msgBar);
    root.appendChild(modalHost);

    // --- trace execution
    function runTrace(text, cb) {
      var input;
      try {
        input = mod.parseInput ? mod.parseInput(text) : text;
      } catch (e) { cb(null, "输入解析失败：" + e.message); return; }
      var res;
      try {
        res = mod.run(input);
      } catch (e) { cb(null, "运行出错：" + e.message); return; }
      var s = Array.isArray(res) ? res : (res && res.steps) || [];
      if (!Array.isArray(s) || !s.length) { cb(null, "没有产生任何步骤"); return; }
      if (s.length > MAX_STEPS) s = s.slice(0, MAX_STEPS);
      // drop steps with out-of-range line numbers silently but keep run safe
      var n = codeLines.length;
      s = s.filter(function (st) { return st && st.line >= 1 && st.line <= n; });
      if (!s.length) { cb(null, "所有步骤的行号都超出代码范围"); return; }
      cb({ steps: s, output: Array.isArray(res) ? null : res.output }, null);
    }

    function rebuild(text) {
      pause();
      runTrace(text, function (ok, err) {
        if (err) {
          steps = []; output = null;
          stepLabel.textContent = "0 / 0";
          slider.max = "0"; slider.value = "0";
          outInner.innerHTML = "";
          Object.keys(viewBoxes).forEach(function (k) { viewBoxes[k].inner.innerHTML = ""; });
          msgText.textContent = err;
          stepDot.textContent = "!";
          rowEls.forEach(function (r) { r.classList.remove("av-cur"); });
          return;
        }
        steps = ok.steps; output = ok.output;
        slider.max = String(steps.length - 1);
        goTo(0);
      });
    }

    // --- rendering current step
    function goTo(i) {
      idx = Math.max(0, Math.min(steps.length - 1, i));
      slider.value = String(idx);
      stepLabel.textContent = "Step " + (idx + 1) + " / " + steps.length;
      var st = steps[idx];
      rowEls.forEach(function (r) { r.classList.remove("av-cur"); });
      var tr = rowEls[st.line - 1];
      if (tr) {
        tr.classList.add("av-cur");
        var top = tr.offsetTop, h2 = codePanel.clientHeight;
        if (top < codePanel.scrollTop + 20 || top > codePanel.scrollTop + h2 - 40)
          codePanel.scrollTop = Math.max(0, top - h2 / 2);
      }
      Object.keys(viewBoxes).forEach(function (key) {
        var vb = viewBoxes[key];
        vb.inner.innerHTML = "";
        var state = st.views && st.views[key];
        if (state == null) {
          vb.inner.appendChild(h("div", { class: "av-view-error", text: "（未变化）" }));
          return;
        }
        var r = RENDERERS[vb.def.type || "text"];
        try { r(vb.inner, state); }
        catch (e) { vb.inner.appendChild(h("div", { class: "av-view-error", text: "渲染失败: " + e.message })); }
      });
      outInner.innerHTML = "";
      var outState = output != null ? { text: output } : (st.views && st.views.__output);
      RENDERERS.output(outInner, outState != null ? outState : { text: "" });
      stepDot.textContent = String(idx + 1);
      msgText.textContent = st.msg || "";
    }

    // --- playback
    function tick() {
      if (idx >= steps.length - 1) { pause(); return; }
      goTo(idx + 1);
    }
    function play() {
      if (!steps.length || idx >= steps.length - 1) goTo(0);
      playing = true;
      playBtn.innerHTML = pauseIcon;
      clearInterval(timer);
      timer = setInterval(tick, BASE_DELAY / speed);
    }
    function pause() {
      playing = false;
      playBtn.innerHTML = playIcon;
      clearInterval(timer); timer = null;
    }

    playBtn.onclick = function () { playing ? pause() : play(); };
    firstBtn.onclick = function () { pause(); goTo(0); };
    prevBtn.onclick = function () { pause(); goTo(idx - 1); };
    nextBtn.onclick = function () { pause(); goTo(idx + 1); };
    lastBtn.onclick = function () { pause(); goTo(steps.length - 1); };
    speedSel.onchange = function () {
      speed = parseFloat(speedSel.value);
      if (playing) { clearInterval(timer); timer = setInterval(tick, BASE_DELAY / speed); }
    };
    slider.oninput = function () { pause(); goTo(parseInt(slider.value, 10)); };
    editBtn.onclick = function () { openModal(); };
    collapseBtn.onclick = function () {
      var collapsed = root.classList.toggle("algoviz-collapsed");
      if (collapsed) pause();
      collapseBtn.textContent = collapsed ? "展开 ▼" : "收起 ▲";
    };

    root.tabIndex = 0;
    root.style.outline = "none";
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { pause(); goTo(idx - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { pause(); goTo(idx + 1); e.preventDefault(); }
      else if (e.key === " ") { playing ? pause() : play(); e.preventDefault(); }
    });

    // --- testcase modal
    function openModal() {
      modalHost.innerHTML = "";
      var ta = h("textarea", { spellcheck: "false" });
      ta.value = inputText;
      var err = h("div", { class: "av-modal-err" });
      var mask = h("div", { class: "algoviz-modal-mask" }, [
        h("div", { class: "algoviz-modal" }, [
          h("h4", { text: "编辑测试用例" }),
          h("div", { class: "av-modal-hint", text: mod.inputHint || "修改后点击运行，将重新生成可视化步骤。" }),
          ta, err,
          h("div", { class: "av-modal-actions" }, [
            h("button", { class: "algoviz-btn", text: "取消", onclick: function () { modalHost.innerHTML = ""; } }),
            h("button", {
              class: "algoviz-btn av-primary", text: "▶ 运行", onclick: function () {
                var text = ta.value;
                runTrace(text, function (ok, e2) {
                  if (e2) { err.textContent = e2; return; }
                  inputText = text;
                  steps = ok.steps; output = ok.output;
                  modalHost.innerHTML = "";
                  slider.max = String(steps.length - 1);
                  goTo(0);
                });
              }
            })
          ])
        ])
      ]);
      mask.addEventListener("click", function (e) { if (e.target === mask) modalHost.innerHTML = ""; });
      modalHost.appendChild(mask);
      ta.focus();
    }

    rebuild(inputText);
  }

  /* ---------------- mounting ---------------- */

  function themeClass(el, opts) {
    var t = (opts && opts.theme) || el.getAttribute("data-theme") || "auto";
    if (t === "auto") {
      var modes = ["[data-theme]", "[data-mode]"];
      for (var i = 0; i < modes.length; i++) {
        var p = el.closest(modes[i]);
        if (p) {
          var v = p.getAttribute("data-theme") || p.getAttribute("data-mode");
          return v === "light" ? "algoviz-light" : "";
        }
      }
      var root = document.documentElement;
      var rv = root.getAttribute("data-theme") || root.getAttribute("data-mode");
      if (rv) return rv === "light" ? "algoviz-light" : "";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "algoviz-light" : "";
    }
    return t === "light" ? "algoviz-light" : "";
  }

  var mounted = [];

  function mount(el, opts) {
    if (el.classList.contains("algoviz-init")) return;
    el.classList.add("algoviz-init");
    var id = el.getAttribute("data-module");
    if (!id) return;
    var base = el.getAttribute("data-viz-base") || (opts && opts.base);
    var cls = "algoviz " + themeClass(el, opts);
    el.className = el.className ? el.className + " " + cls : cls;
    el.style.position = el.style.position || "relative";
    mounted.push(el);

    var poster = h("div", { class: "algoviz-poster" }, [
      h("div", { class: "algoviz-poster-play", html: playSvg() }),
      h("div", null, [
        h("div", { class: "algoviz-poster-title", text: el.getAttribute("data-title") || "算法可视化：" + id }),
        h("div", { class: "algoviz-poster-sub", text: "点击加载步骤播放器（代码逐行高亮 · 可编辑测试用例）" })
      ])
    ]);
    el.appendChild(poster);
    poster.onclick = function () {
      loadModule(id, base).then(function (mod) {
        buildPlayer(el, mod, opts || {});
      }, function (err) {
        poster.querySelector(".algoviz-poster-sub").textContent = "加载失败：" + err.message;
      });
    };
    // auto-load if requested
    if (el.getAttribute("data-auto") === "1") poster.onclick();
  }

  function playSvg() {
    return '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M5 3.2v9.6L12.4 8z" fill="currentColor"/></svg>';
  }

  function mountAll(rootEl, opts) {
    (rootEl || document).querySelectorAll(".algoviz[data-module]").forEach(function (el) {
      mount(el, opts);
    });
  }

  function mountModule(el, mod, opts) {
    /* mount a module OBJECT directly (user-pasted / imported), bypassing
     * script loading. mod must satisfy the module format (run, code, ...). */
    if (el.classList.contains("algoviz-init")) return;
    el.classList.add("algoviz-init");
    if (!mod || typeof mod.run !== "function") return;
    var cls = "algoviz " + themeClass(el, opts);
    el.className = el.className ? el.className + " " + cls : cls;
    el.style.position = el.style.position || "relative";
    mounted.push(el);
    buildPlayer(el, mod, opts || {});
  }

  global.AlgoViz = {
    mount: mount,
    mountAll: mountAll,
    mountModule: mountModule,
    loadModule: loadModule,
    views: RENDERERS,
    version: "0.2.0"
  };

  // keep mounted players in sync with the page theme (e.g. blog dark toggle)
  if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    new MutationObserver(function () {
      mounted.forEach(function (el) {
        var light = themeClass(el, { theme: "auto" }) === "algoviz-light";
        el.classList.toggle("algoviz-light", light);
      });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
  }

  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { mountAll(document); });
  } else if (typeof document !== "undefined") {
    mountAll(document);
  }
})(typeof window !== "undefined" ? window : this);
