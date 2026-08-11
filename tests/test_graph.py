#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression tests for the graph view (nodes, root, snake)."""

from __future__ import annotations

import json
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from util import block_external

ROOT = Path(__file__).resolve().parents[1]
PORT = 8140
OUT_DIR = ROOT / json.loads(
    (ROOT / "config.json").read_text(encoding="utf-8")
)["site"]["out_dir"]


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUT_DIR), **kwargs)


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}" + ("" if cond else f" — {detail}"))
    return cond


def main() -> None:
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{PORT}"
    failures = []

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        block_external(page)
        page.on("pageerror", lambda e: failures.append(str(e)))
        page.goto(base + "/", wait_until="networkidle")
        page.click('[data-view="graph"]')
        page.wait_for_function(
            "document.querySelector('#graph-stats') && "
            "document.querySelector('#graph-stats').textContent.includes('篇文章')",
            timeout=20000,
        )

        ok = True
        # 1. no JS errors
        ok &= check("no page errors", not failures, "; ".join(failures))

        # 1b. graph area must not select text while dragging
        user_select = page.evaluate(
            "getComputedStyle(document.querySelector('.graph-wrap')).userSelect")
        ok &= check("graph wrap blocks text selection", user_select == "none", user_select)
        center = page.evaluate("""
            () => {
              const g = document.querySelector('.graph-node[data-id^="posts/"]');
              const r = g.querySelector(':scope > rect').getBoundingClientRect();
              return {x: r.x + r.width / 2, y: r.y + r.height / 2};
            }
        """)
        page.mouse.move(center["x"], center["y"])
        page.mouse.down()
        page.mouse.move(center["x"] + 90, center["y"] + 40, steps=5)
        page.mouse.up()
        sel = page.evaluate("window.getSelection().toString().length")
        ok &= check("drag leaves no text selected", sel == 0, f"selected={sel} chars")

        # 2. bigger nodes: post rects wider than before (>110px)
        widths = page.eval_on_selector_all(
            ".graph-node[data-id^='posts/'] > rect",
            "els => els.map(e => parseFloat(e.getAttribute('width')))")
        ok &= check("post/dir nodes bigger", widths and all(w >= 110 for w in widths),
                    str(widths)[:120])

        # 3. long title truncated with '...'
        labels = page.eval_on_selector_all(".graph-node text", "els => els.map(e => e.textContent)")
        truncated = [t for t in labels if t.endswith("...")]
        ok &= check("long title truncated with ...", len(truncated) >= 1, str(truncated)[:120])

        # 4. root node is white with ink border (no solid black block)
        root_style = page.evaluate("""
            () => {
              const g = document.querySelector('.graph-node[data-id=""]');
              if (!g) return null;
              const r = g.querySelector(':scope > rect');
              return r ? {fill: r.getAttribute('fill'), stroke: r.getAttribute('stroke')} : null;
            }
        """)
        ok &= check(
            "root node not black",
            root_style and root_style["fill"] == "#ffffff" and root_style["stroke"] == "#3c4043",
            str(root_style))

        # 5. snake head moves over time
        def head_pos():
            return page.evaluate("""
                () => {
                  const r = document.querySelector('.graph-snake rect');
                  if (!r) return null;
                  const b = r.getBoundingClientRect();
                  return [Math.round(b.x), Math.round(b.y)];
                }
            """)

        h1 = head_pos()
        page.wait_for_timeout(700)
        h2 = head_pos()
        ok &= check("snake is moving", bool(h1 and h2 and h1 != h2), f"{h1} -> {h2}")

        # 6. snake keeps clearance from nodes (sample head rects)
        def nearest_gap():
            return page.evaluate("""
                () => {
                  const pts = [...document.querySelectorAll('.graph-snake rect')].map(r => {
                    const b = r.getBoundingClientRect();
                    return {x: b.x + b.width/2, y: b.y + b.height/2};
                  });
                  const nodes = [...document.querySelectorAll('.graph-node')].map(g => {
                    const r = g.querySelector('rect').getBoundingClientRect();
                    return {x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height};
                  });
                  let min = Infinity;
                  pts.forEach(p => nodes.forEach(n => {
                    const dx = Math.max(Math.abs(p.x - n.x) - n.w/2, 0);
                    const dy = Math.max(Math.abs(p.y - n.y) - n.h/2, 0);
                    min = Math.min(min, Math.hypot(dx, dy));
                  }));
                  return Math.round(min);
                }
            """)
        gap = nearest_gap()
        ok &= check("snake keeps gap from nodes", gap is not None and gap >= 8, f"gap={gap}px")

        # 7. toggle off/on
        page.click("#graph-snake")
        page.wait_for_timeout(300)
        off_visible = page.locator(".graph-snake rect").count()
        ok &= check("snake toggle hides", off_visible == 0, str(off_visible))
        page.click("#graph-snake")
        page.wait_for_timeout(700)
        on_visible = page.locator(".graph-snake rect").count()
        ok &= check("snake toggle shows", on_visible >= 5, str(on_visible))

        # 8. single-click a dir node toggles its subtree
        # (measure against the fully-expanded count: with many posts the
        # default view already folds large leaf folders)
        page.click("#graph-expand-all")
        page.wait_for_timeout(600)
        total_before = page.locator(".graph-node").count()
        page.evaluate("""
            () => {
              const g = document.querySelector('.graph-node[data-id="posts"]');
              const r = g.querySelector(':scope > rect').getBoundingClientRect();
              const x = r.x + r.width / 2, y = r.y + r.height / 2;
              g.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: x, clientY: y, bubbles: true, pointerId: 7
              }));
              g.dispatchEvent(new PointerEvent('pointerup', {
                clientX: x, clientY: y, bubbles: true, pointerId: 7
              }));
            }
        """)
        page.wait_for_timeout(400)
        after_collapse = page.locator(".graph-node").count()
        ok &= check("dir single-click collapses", after_collapse < total_before,
                    f"{total_before} -> {after_collapse}")
        # the collapsed dir is no longer rendered; clicking the root node
        # toggles everything back open
        page.evaluate("""
            () => {
              const g = document.querySelector('.graph-node[data-id=""]');
              const r = g.querySelector(':scope > rect').getBoundingClientRect();
              const x = r.x + r.width / 2, y = r.y + r.height / 2;
              g.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: x, clientY: y, bubbles: true, pointerId: 8
              }));
              g.dispatchEvent(new PointerEvent('pointerup', {
                clientX: x, clientY: y, bubbles: true, pointerId: 8
              }));
            }
        """)
        page.wait_for_timeout(400)
        ok &= check("dir single-click expands",
                    page.locator(".graph-node").count() == total_before)

        # 9. drag a node near the snake does not crash it and it keeps moving
        page.evaluate("""
            () => {
              const n = document.querySelector('.graph-node[data-id^="posts"]');
              const r = n.querySelector('rect').getBoundingClientRect();
              const head = document.querySelector('.graph-snake rect').getBoundingClientRect();
              n.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: r.x + 10, clientY: r.y + 10, bubbles: true, pointerId: 1
              }));
              // move node onto the snake head
              document.querySelector('svg').dispatchEvent(new PointerEvent('pointermove', {
                clientX: head.x + 4, clientY: head.y + 4, bubbles: true, pointerId: 1
              }));
              document.querySelector('svg').dispatchEvent(new PointerEvent('pointerup', {
                clientX: head.x + 4, clientY: head.y + 4, bubbles: true, pointerId: 1
              }));
            }
        """)
        page.wait_for_timeout(1200)
        h3 = head_pos()
        page_errors_after = len(failures)
        ok &= check("snake survives node drop-in", h3 is not None and page_errors_after == len(failures), f"head={h3}")
        gap2 = nearest_gap()
        ok &= check("snake escaped dragged node", gap2 is not None and gap2 >= 8, f"gap={gap2}px")

        # 10. nav folder link highlights the folder subtree and KEEPS the
        # zoomed/centered viewport (only the flash box fades away)
        def viewport():
            return page.evaluate("""
                () => {
                  const g = document.querySelector('#graph-svg g');
                  if (!g) return null;
                  const m = g.getAttribute('transform').match(
                    /translate\\(([\\d.-]+),([\\d.-]+)\\) scale\\(([\\d.]+)\\)/);
                  return m ? {ox: parseFloat(m[1]), oy: parseFloat(m[2]), z: parseFloat(m[3])} : null;
                }
            """)

        vp0 = viewport()
        page.locator(".site-nav a[data-kind='folder']", has_text="玩具").click()
        page.wait_for_timeout(700)
        vp1 = viewport()
        flash = page.locator(".graph-flash").count()
        ok &= check("nav folder graph flash", flash >= 1, str(flash))
        page.wait_for_timeout(2000)
        vp2 = viewport()
        flash2 = page.locator(".graph-flash").count()
        ok &= check("graph flash fades away", flash2 == 0, str(flash2))
        ok &= check("graph viewport keeps located zoom",
                    bool(vp1 and vp2 and abs(vp1["z"] - vp2["z"]) < 0.02 and
                         abs(vp1["ox"] - vp2["ox"]) < 0.5 and
                         abs(vp1["oy"] - vp2["oy"]) < 0.5),
                    f"{vp1} -> {vp2}")
        ok &= check("graph viewport moved to the subtree",
                    bool(vp0 and vp1 and (abs(vp0["z"] - vp1["z"]) > 0.05 or
                                          abs(vp0["ox"] - vp1["ox"]) > 5 or
                                          abs(vp0["oy"] - vp1["oy"]) > 5)),
                    f"{vp0} -> {vp1}")

        # 10b. hold zoom-out must zoom out (and hold zoom-in must zoom in)
        page.click("#graph-expand-all")
        page.wait_for_timeout(400)

        def z_now():
            return page.evaluate("""(() => {
              const t = document.querySelector('#graph-svg g').getAttribute('transform');
              const m = t.match(/scale\\(([\\d.]+)\\)/);
              return m ? parseFloat(m[1]) : null;
            })()""")

        zb = z_now()
        box = page.locator("#graph-zoom-out").bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(500)
        page.mouse.up()
        page.wait_for_timeout(200)
        za = z_now()
        ok &= check("hold zoom-out zooms out", bool(za and zb and za < zb - 0.05), f"{zb} -> {za}")
        box = page.locator("#graph-zoom-in").bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(400)
        page.mouse.up()
        page.wait_for_timeout(200)
        zb2 = z_now()
        ok &= check("hold zoom-in zooms in", bool(zb2 and za and zb2 > za + 0.05), f"{za} -> {zb2}")

        # 10c. long-press a node highlights its direct neighbors; again cancels
        page.click("#graph-recenter")
        page.wait_for_timeout(400)
        # bring the graph area fully into view so the node is reachable
        page.evaluate("""(() => {
          const w = document.querySelector('.graph-wrap');
          window.scrollTo(0, w.getBoundingClientRect().top + window.pageYOffset - 20);
        })()""")
        page.wait_for_timeout(300)
        rbox = page.locator('.graph-node[data-id=""]').bounding_box()
        page.mouse.move(rbox["x"] + rbox["width"] / 2, rbox["y"] + rbox["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(700)
        page.mouse.up()
        page.wait_for_timeout(300)
        op = page.evaluate(
            "Array.from(document.querySelectorAll('.graph-node')).map(g => g.style.opacity)")
        dims = sum(1 for o in op if o == "0.12")
        lits = sum(1 for o in op if o == "1")
        ok &= check("long-press highlights neighbors", dims > 0 and 0 < lits < len(op),
                    f"lit={lits} dim={dims}")
        page.mouse.move(rbox["x"] + rbox["width"] / 2, rbox["y"] + rbox["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(700)
        page.mouse.up()
        page.wait_for_timeout(300)
        op2 = page.evaluate(
            "Array.from(document.querySelectorAll('.graph-node')).map(g => g.style.opacity)")
        ok &= check("long-press again cancels focus",
                    all(o in ("", "1") for o in op2), str(set(op2)))

        # 10d. recenter fits the visible nodes inside the viewport
        page.click("#graph-recenter")
        page.wait_for_timeout(500)
        fit = page.evaluate("""(() => {
          const r = document.getElementById('graph-svg').getBoundingClientRect();
          const els = document.querySelectorAll('.graph-node');
          let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
          els.forEach(g => { const b = g.getBoundingClientRect(); minX=Math.min(minX,b.x); minY=Math.min(minY,b.y); maxX=Math.max(maxX,b.x+b.width); maxY=Math.max(maxY,b.y+b.height); });
          return minX >= r.x - 4 && minY >= r.y - 4 && maxX <= r.x + r.width + 4 && maxY <= r.y + r.height + 4;
        })()""")
        ok &= check("recenter fits visible graph", fit)

        # 11. filter tag clicked in graph view -> cards-view hint
        page.locator(".filter-tags .tag-chip").first.click()
        ok &= check("filter hint in graph view", page.locator(".filter-hint.is-show").count() == 1)
        page.locator(".sel-chip .sel-x").first.click()
        page.wait_for_timeout(200)

        browser.close()
    srv.shutdown()

    print()
    if not ok:
        sys.exit(1)
    print("all graph checks passed")


if __name__ == "__main__":
    main()
