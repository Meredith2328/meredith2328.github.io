#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOM/layout QA for the built site."""

from __future__ import annotations

import json
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from util import block_external

from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
PORT = 8132
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


def img_stats(path: Path):
    img = Image.open(path).convert("L")
    stat = ImageStat.Stat(img)
    return round(stat.stddev[0], 1), img.size


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
        page.on("pageerror", lambda e: failures.append("pageerror: " + str(e)))
        page.on("console", lambda m: failures.append(m.text) if m.type == "error" else None)
        page.goto(base + "/", wait_until="networkidle")

        ok = True
        ok &= check("card count >= 5", page.locator(".card").count() >= 5)
        ok &= check("default view global exposed",
                    page.evaluate("window.PILOG_DEFAULT_VIEW") == "cards")
        first_title = page.locator(".card-title").first.inner_text()
        ok &= check("pinned index card first", "十派的玩具箱" in first_title, first_title[:30])
        second_title = page.locator(".card-title").nth(1).inner_text()
        ok &= check("newest post follows pin", "TRL" in second_title and "假装训练" in second_title,
                    second_title[:40])
        ok &= check("highlight card shown", page.locator(".card.is-highlight").count() >= 1)
        body_font = page.evaluate("getComputedStyle(document.body).fontFamily")
        ok &= check("sans font stack", "Inter" in body_font or "Segoe" in body_font, body_font[:60])
        ok &= check("fonts self-hosted", page.locator('link[href$="css/fonts.css"]').count() == 1)
        ok &= check("katex self-hosted", page.locator('link[href$="vendor/katex/katex.min.css"]').count() == 1)
        card_h = page.locator(".card").first.bounding_box()["height"]
        ok &= check("card height reasonable", 150 < card_h < 320, str(card_h))
        thumb_w = page.locator(".card-thumb img").first.bounding_box()["width"]
        ok &= check("thumb column ~132px", abs(thumb_w - 132) < 6, str(thumb_w))
        pre = page.locator(".card", has_text="用 pilog 搭建").locator(".card-preview").first.inner_text()
        ok &= check("manual preview shown", "个人自制" in pre and "博客框架" in pre, pre[:40])
        ok &= check("tag chips on cards", page.locator(".card .tag-chip").count() >= 4)
        ok &= check("no nested links in previews", page.locator(".card-preview a").count() == 0)

        # filter bar: top 3 tags + expandable "more tags" panel
        ok &= check("top tags = 3", page.locator(".filter-tags .tag-chip").count() == 3)
        page.click("#filter-more")
        ok &= check("more tag panel", page.locator("#filter-more-panel .tag-chip").count() >= 5)
        page.click("#filter-more")

        # clicking a tag selects a removable filter chip below the search bar
        tag_name = page.locator(".filter-tags .tag-chip").first.get_attribute("data-tag")
        page.locator(".filter-tags .tag-chip").first.click()
        page.wait_for_timeout(400)  # allow the client-side cards.json fetch
        ok &= check("selected chip shown", page.locator(".sel-chip").count() == 1)
        ok &= check("selected chip label", "#" + tag_name in page.locator(".sel-chip").first.inner_text())
        filtered = page.locator(".card:visible").count()
        ok &= check("tag filter narrows cards", 0 < filtered < page.locator(".card").count(), str(filtered))
        page.locator(".sel-chip .sel-x").first.click()
        ok &= check("chip x clears filter", page.locator(".sel-chip").count() == 0)

        # clicking a folder segment on a card selects a folder filter
        page.locator(".folder-part[data-folder='posts/toy']").first.click()
        ok &= check("folder chip appears", page.locator(".sel-chip.sel-folder").count() == 1)
        vis = page.locator(".card:visible").count()
        ok &= check("folder filter narrows cards", vis == 9, str(vis))
        page.locator(".sel-chip .sel-x").first.click()

        # only one folder condition at a time: selecting another folder
        # replaces the previous one, and clicking the same folder keeps it;
        # clearing happens via the selected chip's ×
        page.evaluate("window.pilogFilters.selectFolder('posts/toy')")
        page.wait_for_timeout(300)
        page.evaluate("window.pilogFilters.selectFolder('posts/notes')")
        page.wait_for_timeout(300)
        ok &= check("single folder condition", page.locator(".sel-chip.sel-folder").count() == 1)
        ok &= check("folder chip replaced",
                    "posts/notes" in page.locator(".sel-chip.sel-folder").first.inner_text())
        vis = page.locator(".card:visible").count()
        ok &= check("folder filter switched", vis == 17, str(vis))
        page.evaluate("window.pilogFilters.selectFolder('posts/notes')")
        page.wait_for_timeout(200)
        ok &= check("same folder keeps condition",
                    page.locator(".sel-chip.sel-folder").count() == 1)
        page.locator(".sel-chip .sel-x").first.click()
        page.wait_for_timeout(200)
        ok &= check("chip x clears folder", page.locator(".sel-chip.sel-folder").count() == 0)

        # multi-condition: tag + folder with no overlap -> empty state
        page.evaluate("window.pilogFilters.selectFolder('posts/reference')")
        page.click("#filter-more")
        page.fill("#filter-more-search", "CS61A")
        page.locator("#filter-more-list .tag-chip[data-tag='CS61A']").click()
        ok &= check("empty cards state", page.locator(".empty-cards").count() == 1)
        page.locator(".sel-chip .sel-x").first.click()
        page.locator(".sel-chip .sel-x").first.click()
        ok &= check("empty state cleared", page.locator(".empty-cards").count() == 0)
        page.click("#filter-more")  # close the more-tags panel before moving on

        # filters must still work when data/cards.json is unavailable (e.g. the
        # built site opened directly via file:// where fetch is blocked): the
        # server-rendered cards on the page are filtered synchronously
        page.route("**/data/cards.json", lambda route: route.fulfill(
            status=200, content_type="application/json", body="not-json"))
        page.goto(base + "/", wait_until="networkidle")
        page.locator(".filter-tags .tag-chip", has_text="大模型").first.click()
        page.wait_for_timeout(400)
        vis = page.locator(".card:visible").count()
        ok &= check("tag filter works without cards.json", vis >= 1, str(vis))
        page.unroute("**/data/cards.json")
        page.locator(".sel-chip .sel-x").first.click()
        page.wait_for_timeout(300)

        # nav folder link in cards view selects the folder filter
        page.goto(base + "/", wait_until="networkidle")  # reset the no-cards.json fallback
        page.locator(".site-nav a[data-kind='folder']", has_text="CS相关").click()
        page.wait_for_timeout(500)
        ok &= check("nav folder selects filter", page.locator(".sel-chip.sel-folder").count() == 1)
        vis = page.locator(".card:visible").count()
        ok &= check("nav folder shows only its posts", vis >= 5, str(vis))
        page.locator(".sel-chip .sel-x").first.click()

        # tree view
        page.click('[data-view="tree"]')
        ok &= check("tree files >= 5", page.locator(".tree-file").count() >= 5)
        ok &= check("tree folders >= 2", page.locator(".tree-folder").count() >= 2)
        ok &= check("tree highlight row", page.locator(".tree-file.is-highlight").count() >= 1)
        page.click("#tree-expand")
        page.click("#tree-collapse")
        ok &= check("tree collapse hides children", page.locator(".tree-folder").first.evaluate(
            "el => !el.classList.contains('is-open')"))
        page.locator(".site-nav a[data-kind='folder']", has_text="CS相关").click()
        ok &= check("tree nav stays in tree", page.locator("#view-tree").evaluate("el => !el.hidden"))
        ok &= check("tree nav flashes folder", page.locator(".tree-row.tree-flash").count() >= 1)
        # clicking a filter tag while in tree view shows a hint that the
        # filter applies to the cards view
        page.locator(".filter-tags .tag-chip").first.click()
        ok &= check("filter hint in tree view", page.locator(".filter-hint.is-show").count() == 1)
        hint = page.locator(".filter-hint").first.inner_text()
        ok &= check("filter hint text", "卡片视图" in hint and "生效" in hint, hint)
        # the selected-chip row shifts the tag row right; measure both after
        # the click so the hint is compared to the tag's actual position
        chip_box = page.locator(".filter-tags .tag-chip").first.bounding_box()
        hint_box = page.locator(".filter-hint").first.bounding_box()
        ok &= check(
            "filter hint under the clicked tag",
            bool(chip_box and hint_box and
                 hint_box["y"] >= chip_box["y"] + chip_box["height"] - 2 and
                 abs((hint_box["x"] + hint_box["width"] / 2) -
                     (chip_box["x"] + chip_box["width"] / 2)) < 45),
            str(hint_box))
        page.locator(".sel-chip .sel-x").first.click()
        page.wait_for_timeout(200)

        # graph view
        page.click('[data-view="graph"]')
        page.wait_for_function(
            "document.querySelector('#graph-stats') && "
            "document.querySelector('#graph-stats').textContent.includes('篇文章')",
            timeout=20000,
        )
        ok &= check("graph loading indicator present",
                    page.locator("#site-graph-loading").count() == 1)
        ok &= check("graph loading hidden after load",
                    page.locator("#site-graph-loading").evaluate("el => el.hidden"))
        page.click("#graph-expand-all")
        page.wait_for_timeout(600)
        node_count = page.locator(".graph-node").count()
        link_count = page.locator(".graph-link").count()
        ref_count = page.locator(".graph-link.ref").count()
        ok &= check("graph nodes >= 8", node_count >= 8, str(node_count))
        ok &= check("graph legend marks refs", page.locator(".legend-ref").count() == 1)
        ok &= check("graph stats text", "篇文章" in page.locator("#graph-stats").inner_text())
        ok &= check("legend present", page.locator(".graph-legend .legend-item").count() == 5)
        ok &= check("graph highlight node",
                    page.locator('.graph-node rect[stroke="#fbbc04"]').count() >= 1)
        page.click("#graph-collapse-all")
        page.wait_for_timeout(400)
        ok &= check("graph collapse-all works",
                    page.locator(".graph-node").count() < node_count)
        page.click("#graph-expand-all")
        page.wait_for_timeout(400)
        ok &= check("graph expand-all works",
                    page.locator(".graph-node").count() == node_count)

        # search
        page.click('[data-view="cards"]')
        page.fill("#search-input", "玩具")
        page.wait_for_timeout(700)
        ok &= check("search finds results", page.locator(".search-item").count() >= 1)
        # #tag searches tags only; plain words never match tags
        page.fill("#search-input", "#奇怪的东西")
        page.wait_for_timeout(700)
        ok &= check("#tag search finds tag", page.locator(".search-item").count() >= 1)
        page.fill("#search-input", "奇怪的东西")
        page.wait_for_timeout(700)
        ok &= check("plain word ignores tags", page.locator(".search-item").count() == 0)
        page.fill("#search-input", "#奇怪的东西")
        page.wait_for_timeout(700)
        page.locator(".search-tag[data-tag='奇怪的东西']").first.click()
        page.wait_for_timeout(300)
        ok &= check("search tag click selects filter", page.locator(".sel-chip").count() == 1)
        page.locator(".sel-chip .sel-x").first.click()
        page.fill("#search-input", "")

        # full-text search toggle: deep body text only matches when enabled
        page.fill("#search-input", "初步学习完结撒花")
        page.wait_for_timeout(700)
        ok &= check("default search ignores deep text", page.locator(".search-item").count() == 0)
        page.click("#search-fulltext")
        page.wait_for_timeout(1000)
        ok &= check("fulltext toggle active", page.locator("#search-fulltext.is-on").count() == 1)
        ok &= check("fulltext finds deep text", page.locator(".search-item").count() >= 1)
        page.click("#search-fulltext")
        page.wait_for_timeout(500)
        ok &= check("fulltext toggle off restores", page.locator(".search-item").count() == 0)
        page.fill("#search-input", "")

        # post page
        page.goto(base + "/posts/toy/pilog-blog.html", wait_until="networkidle")
        ok &= check("pygments highlight", page.locator(".highlight").count() >= 1)
        ok &= check("code token spans", page.locator(".highlight span").count() >= 2)
        ok &= check("heading ids", page.locator("h2[id]").count() >= 3)
        ok &= check("wiki image resolved", page.locator('.post-body img[src*="cover-pixel"]').count() >= 1)
        ok &= check("dino iframe present", page.locator(".dino-frame").count() == 1)

        # dino widget
        page.click(".dino-toggle")
        page.wait_for_timeout(1200)
        iframe = page.frame_locator(".dino-frame")
        ok &= check("dino iframe loaded", iframe.locator("canvas").count() >= 1)
        ok &= check("dino loading hidden after load",
                    page.locator("#dino-loading").evaluate("el => el.hidden"))

        # pilog-blog rich markdown: strikethrough + LaTeX math
        page.goto(base + "/posts/toy/pilog-blog.html", wait_until="networkidle")
        ok &= check("strikethrough renders", page.locator("del").count() >= 1)
        ok &= check("latex math markup present", page.locator(".arithmatex").count() >= 2)
        ok &= check("code copy buttons present", page.locator(".post-body .code-copy").count() >= 1)
        page.locator(".post-body .code-copy").first.click()
        page.wait_for_timeout(300)
        ok &= check("code copy feedback shown",
                    "已复制" in page.locator(".post-body .code-copy").first.inner_text())

        # long post section paging + styled related/series footer boxes
        page.goto(base + "/posts/notes/algo/algorithm-4.html", wait_until="networkidle")
        chapters = page.locator(".post-chapter").count()
        ok &= check("long post paged into chapters", chapters >= 5, str(chapters))
        ok &= check("pager nav visible", page.locator("#post-pager").is_visible())
        ok &= check("series nav box styled", page.locator(".post-rel.is-series").count() == 1)
        ok &= check("post TOC built", page.locator("#post-toc").is_visible() and
                    page.locator("#post-toc a").count() >= 5,
                    str(page.locator("#post-toc a").count()))
        info1 = page.locator("#pager-info").inner_text()
        ok &= check("pager starts at chapter 1", "第 1 章" in info1, info1)
        page.click("#pager-next")
        page.wait_for_timeout(400)
        info2 = page.locator("#pager-info").inner_text()
        ok &= check("pager next switches chapter", "第 2 章" in info2, info2)
        # clicking a TOC entry for a hidden chapter switches to its page
        page.locator("#post-toc a", has_text="专题四").click()
        page.wait_for_timeout(600)
        info3 = page.locator("#pager-info").inner_text()
        ok &= check("TOC jumps to hidden chapter page", "第 5 章" in info3, info3)
        page.goto(base + "/posts/notes/ml/mathqwen-0.6b-agentic-rl.html", wait_until="networkidle")
        ok &= check("related box styled", page.locator(".post-rel.is-related").count() == 1)
        # scroll-spy highlights the section in view
        page.evaluate("window.scrollTo(0, document.querySelector('.post-body').offsetHeight)")
        page.wait_for_timeout(500)
        ok &= check("TOC scroll-spy active", page.locator("#post-toc a.is-active").count() == 1)
        # repeated TOC clicks: each must land on its target (the second click
        # must not get stuck from the first animation still running)
        page.goto(base + "/posts/notes/ml/minitorch.html", wait_until="networkidle")
        page.locator("#post-toc a", has_text="Efficiency").click()
        page.wait_for_timeout(700)
        dist1 = page.evaluate("""(() => {
          const a = Array.from(document.querySelectorAll('#post-toc a'))
            .find(x => x.textContent.indexOf('Efficiency') >= 0);
          const h = document.getElementById(a.getAttribute('href').slice(1));
          return Math.abs(h.getBoundingClientRect().top - 24);
        })()""")
        ok &= check("TOC first click lands on section", dist1 < 90, str(dist1))
        page.locator("#post-toc a", has_text="项目整体介绍").click()
        page.wait_for_timeout(700)
        dist2 = page.evaluate("""(() => {
          const a = document.querySelector('#post-toc a');
          const h = document.getElementById(a.getAttribute('href').slice(1));
          return Math.abs(h.getBoundingClientRect().top - 24);
        })()""")
        ok &= check("TOC second click reaches first section",
                    dist2 < 90, f"dist {dist2}")

        # prev/next post navigation (card order, wraps at the ends)
        page.goto(base + "/posts/notes/ml/trl-1.9.2-grpo-ref-adapter-silent-noop.html",
                  wait_until="networkidle")
        prev_href = page.locator(".post-nav-link.is-prev").get_attribute("href")
        next_href = page.locator(".post-nav-link.is-next").get_attribute("href")
        ok &= check("prev points to previous post", prev_href and "10pi" in prev_href, str(prev_href))
        ok &= check("next points to next post", next_href and "mathqwen" in next_href, str(next_href))
        page.goto(base + "/posts/toy/zi-she.html", wait_until="networkidle")
        wrap_href = page.locator(".post-nav-link.is-next").get_attribute("href")
        ok &= check("oldest post next wraps to first", wrap_href and "10pi" in wrap_href, str(wrap_href))

        # og:image uses the cover (not favicon) and description is filled
        page.goto(base + "/posts/toy/10pi.html", wait_until="networkidle")
        og_img = page.evaluate("document.querySelector('meta[property=\"og:image\"]').content")
        ok &= check("og:image uses cover", "10pi" in og_img and "favicon" not in og_img, og_img)
        og_desc = page.evaluate("document.querySelector('meta[property=\"og:description\"]').content")
        ok &= check("og:description non-empty", len(og_desc) > 20, og_desc[:40])
        page.goto(base + "/", wait_until="networkidle")
        home_desc = page.evaluate("document.querySelector('meta[name=description]').content")
        ok &= check("home description fallback", len(home_desc) > 0, home_desc[:40])

        # giscus failure fallback: a retry button appears when the widget fails
        page.goto(base + "/posts/toy/pilog-blog.html", wait_until="networkidle")
        page.wait_for_selector("#giscus-fallback:not([hidden])", timeout=10000)
        ok &= check("giscus fallback shows on failure",
                    page.locator("#giscus-retry").is_visible())

        # screenshots sanity
        for name in ["01-cards.png", "02-tree.png", "03-graph.png", "05-post.png", "06-mobile.png"]:
            path = ROOT / "output" / "playwright" / name
            if path.exists():
                std, size = img_stats(path)
                ok &= check(f"screenshot {name} not blank", std > 12, f"std={std} {size}")

        # view default behavior: returning home shows cards
        page.goto(base + "/posts/toy/pilog-blog.html", wait_until="networkidle")
        page.click(".back-link")
        page.wait_for_load_state("networkidle")
        ok &= check("home defaults to cards", page.locator("#view-cards").evaluate("el => !el.hidden"))

        # explicit deep links still work
        page.goto(base + "/index.html#view-tree", wait_until="networkidle")
        ok &= check("deep link #view-tree works", page.locator("#view-tree").evaluate("el => !el.hidden"))
        page.goto(base + "/index.html#view-graph", wait_until="networkidle")
        page.wait_for_timeout(1800)
        ok &= check("deep link #view-graph works", page.locator("#view-graph").evaluate("el => !el.hidden"))
        page.goto(base + "/index.html#folder=posts/toy", wait_until="networkidle")
        ok &= check("deep link #folder selects folder", page.locator(".sel-chip.sel-folder").count() == 1)
        # same-document hash changes accumulate (multi-condition); a real visit
        # from a post page reloads with a clean slate
        page.goto(base + "/posts/toy/notegotya.html", wait_until="networkidle")
        page.goto(base + "/index.html#tag=奇怪的东西", wait_until="networkidle")
        ok &= check("deep link #tag selects tag", page.locator(".sel-chip").count() == 1)
        vis = page.locator(".card:visible").count()
        ok &= check("deep link #tag filters cards", vis >= 1, str(vis))

        # stale localStorage must not override the default
        page.evaluate("localStorage.setItem('pilog.view', 'graph')")
        page.goto(base + "/index.html", wait_until="networkidle")
        ok &= check("home ignores stored view", page.locator("#view-cards").evaluate("el => !el.hidden"))

        browser.close()
    srv.shutdown()

    print()
    if failures:
        print("JS issues:")
        for f in failures[:10]:
            print("  -", f)
        ok = False
    if not ok:
        sys.exit(1)
    print("all QA checks passed")


if __name__ == "__main__":
    main()
