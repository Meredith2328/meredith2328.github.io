#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify the built site works under a GitHub Pages sub-path (/blogtest)."""

from __future__ import annotations

import json
import shutil
import sys
import threading
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from util import block_external

ROOT = Path(__file__).resolve().parents[1]
PORT = 8130
OUT_DIR = ROOT / json.loads(
    (ROOT / "config.json").read_text(encoding="utf-8")
)["site"]["out_dir"]


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "_deploy_test"), **kwargs)


def main() -> None:
    deploy = ROOT / "_deploy_test"
    if deploy.exists():
        shutil.rmtree(deploy)
    shutil.copytree(OUT_DIR, deploy / "blogtest")

    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{PORT}/blogtest"

    from playwright.sync_api import sync_playwright

    failures = []

    def check(name, cond, detail=""):
        status = "PASS" if cond else "FAIL"
        print(f"  [{status}] {name}" + (f" — {detail}" if detail and not cond else ""))
        if not cond:
            failures.append(name)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        block_external(page)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        # 1. home under sub-path
        page.goto(base + "/", wait_until="networkidle")
        check("home loads", "card-grid" in page.content())
        check("no page errors (home)", not errors, "; ".join(errors))

        # 2. open a post from home
        page.click(".card-link")
        page.wait_for_load_state("networkidle")
        check("post URL under /blogtest", page.url.startswith(base + "/posts/"))
        check("post content rendered", page.locator(".post-body p").count() > 0)

        # 3. back link returns to /blogtest home, not repo root
        page.click(".back-link")
        page.wait_for_load_state("networkidle")
        check(
            "back link lands on /blogtest/",
            page.url.replace("/index.html", "").rstrip("/") == base,
        )

        # 4. nav bar link
        nav_home = page.locator(".site-nav a", has_text="首页")
        home_href = nav_home.get_attribute("href")
        check("nav 首页 href is page-relative", home_href and not home_href.startswith("/"),
              home_href or "")
        nav_home.click()
        page.wait_for_load_state("networkidle")
        check("nav 首页 lands on /blogtest/",
              page.url.replace("/index.html", "").rstrip("/") == base)

        # 5. dino link inside a post
        page.goto(base + "/posts/toy/pilog-blog.html", wait_until="networkidle")
        page.click("a[href$='dino/index.html']")
        page.wait_for_load_state("networkidle")
        check("dino game reachable", "runner" in page.content().lower() or page.title() != "")
        back = page.locator(".dino-back")
        check("dino page has back link", back.count() == 1)
        back.click()
        page.wait_for_load_state("networkidle")
        check("dino back link returns home",
              page.url.replace("/index.html", "").rstrip("/") == base)

        # 5b. widget must NOT show the back link (it is embedded in the blog
        # already); the standalone page keeps it
        page.goto(base + "/", wait_until="networkidle")
        page.click(".dino-toggle")
        page.wait_for_timeout(1200)
        widget = page.frame_locator(".dino-frame")
        hidden = widget.locator(".dino-back").evaluate("el => getComputedStyle(el).display")
        check("widget hides back link", hidden == "none", hidden)
        panel_w = page.evaluate("document.querySelector('.dino-panel').offsetWidth")
        check("widget wide enough for the game", panel_w >= 600, str(panel_w))
        dino_frame = next(
            f for f in page.frames if f.url.rstrip("/").endswith("dino/index.html")
        )
        layout = dino_frame.evaluate("""
            () => {
              const canvas = document.querySelector('#runner-canvas').getBoundingClientRect();
              const hint = document.querySelector('.hint');
              const credit = document.querySelector('.credit');
              const sound = document.querySelector('#sound-toggle');
              return {
                canvasTop: Math.round(canvas.top),
                canvasBottom: Math.round(canvas.bottom),
                canvasVisible: canvas.top >= 0 && canvas.bottom <= window.innerHeight,
                hintHidden: !hint || getComputedStyle(hint).display === 'none',
                creditHidden: !credit || getComputedStyle(credit).display === 'none',
                soundVisible: !!sound && sound.getBoundingClientRect().height > 0
              };
            }
        """)
        check("canvas fully visible in widget", layout["canvasVisible"],
              f"top={layout['canvasTop']} bottom={layout['canvasBottom']}")
        check("widget hides hint text", layout["hintHidden"])
        check("widget hides credit text", layout["creditHidden"])
        check("sound toggle remains", layout["soundVisible"])

        # narrow viewports hide the sound bar so it cannot cover the game
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)
        mobile_layout = dino_frame.evaluate("""
            () => {
              const sound = document.querySelector('#sound-toggle');
              const canvas = document.querySelector('#runner-canvas').getBoundingClientRect();
              return {
                soundVisible: !!sound && sound.getBoundingClientRect().height > 0,
                canvasVisible: canvas.top >= 0 && canvas.bottom <= window.innerHeight
              };
            }
        """)
        check("mobile embed hides sound bar", not mobile_layout["soundVisible"])
        check("mobile canvas stays visible", mobile_layout["canvasVisible"])
        page.set_viewport_size({"width": 1280, "height": 900})

        # 6. views switch and render
        page.goto(base + "/", wait_until="networkidle")
        page.click('[data-view="tree"]')
        check("tree rows rendered", page.locator(".tree-file").count() >= 4)
        page.click('[data-view="graph"]')
        page.wait_for_timeout(1400)
        check("graph nodes rendered", page.locator(".graph-node").count() >= 6)
        check("graph links rendered", page.locator(".graph-link").count() >= 6)

        # 7. rss reachable
        resp = page.request.get(base + "/rss.xml")
        check("rss.xml reachable", resp.ok and "rss" in (resp.text() or "")[:100])

        browser.close()
    srv.shutdown()
    shutil.rmtree(deploy)

    print()
    if failures:
        print(f"{len(failures)} check(s) failed")
        sys.exit(1)
    print("all path checks passed")


if __name__ == "__main__":
    main()
