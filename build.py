#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pilog —— 轻量像素风静态博客生成器。

用法:
    python build.py                # 使用 config.json
    python build.py --clean        # 先清空输出目录
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import time
from pathlib import Path

from bs4 import BeautifulSoup, Comment
from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup
from PIL import Image

from generator.assets import (
    AssetMap,
    copy_tree,
    make_pixel_placeholder,
    make_thumbnail,
    sync_tree,
)
from generator.config import Config
from generator.content import (
    auto_preview,
    auto_preview_md,
    build_tree,
    folder_segments,
    scan_posts,
    sorted_for_cards,
    sort_tree,
    split_front_matter,
)
from generator.graph import build_graph
from generator.markdownx import (
    MarkdownContext,
    find_asset,
    render_markdown,
    resolve_asset_out,
)
from generator.rss import build_rss
from generator.utils import rel_output, root_prefix


SVG_ICONS = {
    "github": (
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" '
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 '
        '6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 '
        '5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 '
        '13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 '
        '5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 '
        '18.13V22"/></svg>'
    ),
    "x": (
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">'
        '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584'
        '-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 '
        '20.644h2.039L6.486 3.24H4.298Z"/></svg>'
    ),
    "bilibili": (
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        '<path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 '
        '1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 '
        '3.773s-2.262 1.524-3.773 1.56H4.333c-1.51-.036-2.769-.556-3.773-1.56'
        'S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 '
        '1.004-.996 2.263-1.52 3.773-1.574h.853L3.966 2.147c-.072-.108-.072-'
        '.216 0-.324.108-.108.216-.108.324 0L6.75 4.365h2.235L6.537 2.147c-'
        '.072-.108-.072-.216 0-.324.108-.108.216-.108.324 0l2.228 2.182h2.178'
        'L8.963 2.147c-.072-.108-.072-.216 0-.324.108-.108.216-.108.324 0l2.21'
        ' 2.182h2.196l-2.228-2.182c-.072-.108-.072-.216 0-.324.108-.108.216-'
        '.108.324 0l2.228 2.182h2.235l-2.21-2.218c-.072-.108-.072-.216 0-.324'
        '.108-.108.216-.108.324 0l2.19 2.182h2.518v-.178zM8.98 8.434c-.18 '
        '0-.323.072-.431.216-.108.144-.162.288-.162.431 0 .18.054.324.162.'
        '468.108.144.251.216.431.216s.324-.072.432-.216c.108-.144.162-.288.'
        '162-.468 0-.143-.054-.287-.162-.431-.108-.144-.252-.216-.432-.216zm'
        '5.346.36c-.144-.144-.288-.216-.431-.216-.18 0-.324.072-.432.216-.108'
        '.144-.162.288-.162.431 0 .18.054.324.162.468.108.144.252.216.432.'
        '216s.324-.072.432-.216c.108-.144.162-.288.162-.468 0-.143-.054-.287-'
        '.162-.431zm1.366 7.09c.036 0 .066-.018.09-.054s.036-.09.036-.126c0-'
        '.036-.012-.072-.036-.108s-.054-.036-.09-.036H3.6c-.036 0-.066.012-.09'
        '.036s-.036.072-.036.108c0 .036.012.072.036.126s.054.054.09.054h12.082z"'
        "/></svg>"
    ),
    "weibo": (
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        '<path d="M12.175 14.002c-1.032.288-2.065.072-2.618-.432-.552-.504-'
        '.792-1.368-.504-2.4.288-1.032 1.152-1.944 2.184-2.232 1.032-.288 '
        '2.065-.072 2.617.432.552.504.793 1.368.505 2.4-.288 1.032-1.152 '
        '1.944-2.184 2.232zm-1.152-3.6c-.72.216-1.296.864-1.512 1.584-.216.'
        '72-.072 1.44.36 1.8.432.36 1.152.432 1.872.216.72-.216 1.296-.864 '
        '1.512-1.584.216-.72.072-1.44-.36-1.8-.432-.36-1.152-.432-1.872-.216z'
        "m3.024 5.112c-1.512.72-3.456.576-4.608-.36-1.152-.936-1.584-2.52-"
        "1.224-4.032.36-1.512 1.584-2.88 3.096-3.456 1.512-.576 3.456-.432 "
        "4.608.504 1.152.936 1.584 2.52 1.224 4.032-.36 1.512-1.584 2.88-"
        "3.096 3.312zm5.112-1.368c-.072.216-.288.36-.504.288-.216-.072-.36-"
        ".288-.288-.504.144-.432.216-.864.216-1.296 0-2.52-2.16-4.608-4.752-"
        "4.608-.936 0-1.872.288-2.664.72-.216.144-.504.072-.648-.144-.144-"
        ".216-.072-.504.144-.648.936-.504 2.016-.864 3.168-.864 3.096 0 5.688 "
        "2.376 5.688 5.4 0 .576-.072 1.08-.288 1.656zm1.944-4.032c-.072.216-"
        ".288.36-.504.288-.216-.072-.36-.288-.288-.504.288-.936.432-1.944.432-"
        "2.952 0-3.888-3.168-7.056-7.056-7.056-1.368 0-2.664.36-3.816 "
        "1.08-.216.144-.504.072-.648-.144-.144-.216-.072-.504.144-.648C11.079"
        ".504 12.519.072 13.959.072c4.32 0 7.848 3.528 7.848 7.848 0 1.152-"
        ".216 2.304-.648 3.384l-.144.36-.144.288c-.072.144-.144.288-.216.432 "
        "0 .216-.144.432-.288.432-.072 0-.072 0-.144 0-.216-.072-.36-.216-"
        ".36-.432z\"/></svg>"
    ),
    "email": (
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" '
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" '
        'rx="0"/><path d="m22 7-10 6L2 7"/></svg>'
    ),
    "rss": (
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" '
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path '
        'd="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>'
    ),
}

TREX_BOX = (76, 4, 164, 100)

DINO_BACK_STYLE = (
    "\n  .dino-back { font-family: Consolas, 'Courier New', monospace;"
    " font-size: 13px; font-weight: 700; color: #3c4043; background: #fff;"
    " border: 2px solid #3c4043; padding: 5px 12px; text-decoration: none;"
    " box-shadow: 3px 3px 0 #e8eaed; }\n"
    "  .dino-back:hover { background: #3c4043; color: #f7f7f7; }\n"
)
DINO_BACK_LINK = '<a class="dino-back" href="../index.html">← 返回博客</a>'
DINO_EMBED_SCRIPT = (
    "<script>(function(){"
    "if(!window.top||window.top===window)return;"
    "var b=document.querySelector('.dino-back');"
    "if(b)b.style.display='none';"
    "var s=document.createElement('style');"
    "s.textContent='body{align-items:flex-start;justify-content:center}."
    "page{padding:10px 8px 12px;gap:10px}.hint,.credit{display:none!important}.stage{overflow:hidden}';"
    "document.head.appendChild(s);"
    "var st=document.querySelector('.stage');"
    "function fit(){var k=Math.min(1,(window.innerWidth-16)/600);"
    "if(k>=1){st.style.transform='';st.style.width='';st.style.height='';return;}"
    "st.style.transform='scale('+k+')';st.style.transformOrigin='top left';"
    "st.style.width=Math.round(600*k)+'px';st.style.height=Math.round(150*k)+'px';}"
    "fit();window.addEventListener('resize',fit);"
    "})();</script>"
)


def log(msg: str) -> None:
    print(f"[pilog] {msg}")


def make_dino_icons(root: Path, out: Path) -> None:
    """Crop the official dino sprite for favicon / widget icons."""
    sprite = root / "dino" / "reference" / "sprite_2x.png"
    custom_logo = root / "blogs" / "assets" / "logo.png"
    if custom_logo.exists():
        (out / "img").mkdir(parents=True, exist_ok=True)
        shutil.copy2(custom_logo, out / "img" / "dino-icon.png")
        shutil.copy2(custom_logo, out / "favicon.png")
        log("custom logo applied")
        return
    if not sprite.exists():
        return
    # Windows sometimes holds recently-written files in a user-mapped section
    # (WinError 1224); retry once before giving up
    last_exc: OSError | None = None
    for attempt in range(2):
        try:
            trex = Image.open(sprite).convert("RGBA").crop(TREX_BOX)
            (out / "img").mkdir(parents=True, exist_ok=True)
            favicon = trex.resize((32, 36), Image.NEAREST)
            favicon.save(out / "favicon.png")
            icon = trex.resize((26, 28), Image.NEAREST)
            icon.save(out / "img" / "dino-icon.png")
            log("dino icons generated")
            return
        except OSError as exc:
            last_exc = exc
            time.sleep(1.0)
    log(f"warning: cannot make dino icons: {last_exc}")


def render_nav(page_url: str, ctx: MarkdownContext) -> str:
    nav_file = ctx.blog_root / "nav.md"
    if not nav_file.exists():
        return ""
    text = nav_file.read_text(encoding="utf-8", errors="replace")
    html = render_markdown(text, nav_file, page_url, ctx).html
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.find_all("a", href=True):
        if "#folder=" in a["href"]:
            a["data-kind"] = "folder"
    return str(soup)


def _sanitize_preview_html(html: str) -> str:
    """Card previews render full markdown but must stay inline flow.

    Headings become body-size text, and every block-level element (paragraphs,
    lists, block math, hr, table) is flattened/inline so the card preview's
    line-clamp keeps working and card layout is not distorted.
    """
    soup = BeautifulSoup(html, "html.parser")
    for comment in soup.find_all(string=lambda s: isinstance(s, Comment)):
        comment.extract()
    for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
        h.name = "p"
    # the whole card is already one link: nested anchors would make the
    # browser split the card markup, so preview links become plain text
    for a in soup.find_all("a"):
        a.unwrap()
    for el in soup.find_all(class_="arithmatex"):
        if el.name == "div":
            el.name = "span"
            if el.string:
                el.string = el.string.replace("\\[", "\\(").replace("\\]", "\\)")
    for table in soup.find_all("table"):
        table.decompose()
    for hr in soup.find_all("hr"):
        hr.decompose()
    for li in soup.find_all("li"):
        li.append(soup.new_string("；"))
        li.unwrap()
    for block in soup.find_all(["p", "div", "ul", "ol", "blockquote", "pre"]):
        block.unwrap()
    # collapse leftover newlines/whitespace so the preview flows as one text
    for node in soup.find_all(string=True):
        if node.parent and node.parent.name not in ("pre", "code"):
            node.replace_with(re.sub(r"\s+", " ", node))
    return str(soup)


CHAPTER_LEVELS = ("h2", "h3", "h4", "h1")


def split_chapters(html: str, per_page: int) -> tuple[str, int]:
    """Wrap a rendered post body into `.post-chapter` blocks for client-side
    section paging (all chapters ship in the same page, JS toggles visibility).

    Chapters are cut at the finest common heading level: h2 by default, then
    h3 / h4 / h1 for posts that only use deeper headings. Returns
    (new_html, chapter_count); chapter_count < 2 means paging is not worth it
    and the original html is returned unchanged.
    """
    soup = BeautifulSoup(html, "html.parser")
    if soup.find("html"):
        return html, 0
    level = None
    for tag in CHAPTER_LEVELS:
        if len(soup.find_all(tag)) >= 2:
            level = tag
            break
    if level is None:
        return html, 0

    groups: list[list] = []
    current: list = []
    for child in list(soup.children):
        name = getattr(child, "name", None)
        if name == level:
            if current:
                groups.append(current)
            current = [child]
        else:
            current.append(child)
    if current:
        groups.append(current)
    if len(groups) < 2:
        return html, 0

    for i, group in enumerate(groups):
        node = soup.new_tag("div")
        node["class"] = "post-chapter"
        node["data-ch"] = str(i + 1)
        for el in group:
            if getattr(el, "name", None) == level:
                node["data-title"] = el.get_text(" ", strip=True)
                break
        for el in group:
            node.append(el.extract())
        soup.append(node)
    return str(soup), len(groups)


FOOTER_PREFIXES = ("上一篇：", "下一篇：", "相关：")


def style_footers(html: str) -> str:
    """Turn the trailing 上一篇/下一篇/相关 footer paragraphs into a styled
    `aside.post-rel` block. The links stay as wikilink-derived <a> elements,
    so graph refs recorded at render time are unaffected.

    The aside is moved to the end of the fragment (after any chapter divs),
    so it stays visible on every chapter page of a paged post.
    """
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for p in soup.find_all("p"):
        text = p.get_text(" ", strip=True)
        if text.startswith(FOOTER_PREFIXES):
            found.append(p)
    if not found:
        return html

    aside = soup.new_tag("aside")
    aside["class"] = "post-rel"
    label = soup.new_tag("span")
    label["class"] = "post-rel-label"
    items = soup.new_tag("div")
    items["class"] = "post-rel-items"

    for p in found:
        text = p.get_text(" ", strip=True)
        is_series = "上一篇" in text or "下一篇" in text
        aside["class"] += " is-series" if is_series else " is-related"
        if label.string is None:
            label.string = "系列导航" if is_series else "相关文章"
        role = "plain"
        for child in list(p.children):
            if isinstance(child, str):
                s = str(child)
                if "上一篇" in s:
                    role = "prev"
                elif "下一篇" in s:
                    role = "next"
                else:
                    role = "plain"
                continue
            if getattr(child, "name", None) != "a":
                continue
            a = child
            if role == "prev":
                a.insert(0, "← ")
                a["title"] = "上一篇"
            elif role == "next":
                a.append(" →")
                a["title"] = "下一篇"
            a["class"] = a.get("class", []) + ["post-rel-link"]
            items.append(a.extract())
        p.extract()

    aside.append(label)
    aside.append(items)
    soup.append(aside)
    return str(soup)


def build_site(
    config_path: str | Path = "config.json",
    blog_dir: str | None = None,
    out_dir: str | None = None,
    clean: bool = False,
) -> None:
    cfg = Config.load(Path(config_path))
    if blog_dir:
        cfg.raw["site"]["blog_dir"] = blog_dir
    if out_dir:
        cfg.raw["site"]["out_dir"] = out_dir

    blog_root = cfg.blog_dir
    out_root = cfg.out_dir
    if not blog_root.is_dir():
        log(f"error: blog directory not found: {blog_root}")
        sys.exit(1)
    if not cfg.site_url:
        log("warning: site_url is empty — RSS/OG 中的绝对链接会不完整，请填写 config.json")

    if clean and out_root.exists():
        shutil.rmtree(out_root)
    out_root.mkdir(parents=True, exist_ok=True)
    # GitHub Pages would otherwise run Jekyll and skip dot-directories such
    # as assets/.thumbs/; this opts the output into plain static hosting
    (out_root / ".nojekyll").write_text("", encoding="utf-8")

    assets = AssetMap(blog_root=blog_root, out_root=out_root)
    ctx = MarkdownContext(
        blog_root=blog_root,
        assets=assets,
        base_path=cfg.base_path,
    )

    # hidden posts (front matter `hidden: true`, or Gridea's `hideInList`)
    # are kept in blogs/ for editing but never rendered or published
    posts = [p for p in scan_posts(blog_root, ctx) if not p.hidden]
    ctx.posts_by_rel = {p.rel: p for p in posts}
    for post in posts:
        post.url = post.rel + ".html"

    # 1. render each post's body + preview
    for post in posts:
        text = post.src.read_text(encoding="utf-8", errors="replace")
        _, body = split_front_matter(text)
        rendered = render_markdown(body, post.src, post.url, ctx)
        post.html = rendered.html
        post.refs = rendered.refs
        post.image_sources = rendered.image_sources
        if post.chapters_per_page > 0:
            post.html, post.chapter_count = split_chapters(
                post.html, post.chapters_per_page
            )
        post.html = style_footers(post.html)

        if post.preview:
            preview_html = render_markdown(
                post.preview, post.src, "index.html", ctx
            ).html
            post.preview_plain = auto_preview(post.preview, 260)
        else:
            _, body = split_front_matter(text)
            preview_md = auto_preview_md(body, 260)
            preview_html = (
                render_markdown(preview_md, post.src, "index.html", ctx).html
                if preview_md
                else ""
            )
            post.preview_plain = auto_preview(body, 260)
        post.preview_html = (
            _sanitize_preview_html(preview_html) if preview_html else ""
        )

    # 2. thumbnails
    thumbs_dir = out_root / "assets" / ".thumbs"
    thumbs_dir.mkdir(parents=True, exist_ok=True)
    for post in posts:
        thumb_src = None
        if post.preview_image:
            thumb_src = find_asset(post.preview_image, post.src, ctx)
        if thumb_src is None and post.image_sources:
            thumb_src = post.image_sources[0]
        if thumb_src is None:
            post.thumb_url = None
        else:
            original_rel = resolve_asset_out(thumb_src, ctx)
            thumb = make_thumbnail(thumb_src, thumbs_dir, width=420)
            post.thumb_url = (
                "assets/.thumbs/" + thumb.name if thumb else original_rel
            )
            post.thumb_src = thumb_src
        if post.feature:
            feature_src = (
                thumb_src
                if post.feature == "preview" and thumb_src
                else find_asset(post.feature, post.src, ctx)
            )
            post.feature_url = (
                resolve_asset_out(feature_src, ctx) if feature_src else None
            )

    # 3. graph + tree + search index
    collapse_threshold = int(cfg.site.get("collapse_threshold") or 25)
    tree = sort_tree(
        build_tree(posts, collapse_threshold=collapse_threshold)
    )
    graph = build_graph(posts, cfg.site["title"])
    (out_root / "data").mkdir(parents=True, exist_ok=True)
    (out_root / "data" / "graph.json").write_text(
        json.dumps(graph, ensure_ascii=False), encoding="utf-8"
    )

    search_entries = []
    fulltext_entries = []
    for post in posts:
        body_soup = BeautifulSoup(post.html, "html.parser")
        full_text = body_soup.get_text(" ", strip=True)
        text = full_text[:1600]
        search_entries.append(
            {
                "url": post.url,
                "title": post.title,
                "folder": post.folder,
                "tags": post.tags,
                "preview": post.preview_plain[:160],
                "text": text,
            }
        )
        fulltext_entries.append({"url": post.url, "text": full_text})
    (out_root / "data" / "search.json").write_text(
        json.dumps(search_entries, ensure_ascii=False), encoding="utf-8"
    )
    (out_root / "data" / "fulltext.json").write_text(
        json.dumps(fulltext_entries, ensure_ascii=False), encoding="utf-8"
    )

    # 4. templates
    env = Environment(
        loader=FileSystemLoader(Path(__file__).parent / "generator" / "templates"),
        autoescape=True,
    )
    site_vars = {**cfg.site, "base_path": cfg.base_path}
    socials = {k: (v or "") for k, v in cfg.socials.items()}
    all_tags = sorted(
        {t for post in posts for t in post.tags}, key=str.lower
    )
    tag_counts: dict[str, int] = {}
    for post in posts:
        for t in post.tags:
            tag_counts[t] = tag_counts.get(t, 0) + 1
    top_tags = [
        t
        for t, _ in sorted(
            tag_counts.items(), key=lambda kv: (-kv[1], kv[0].lower())
        )[:3]
    ]
    ordered = sorted_for_cards(posts)
    per_page = max(1, int(cfg.site.get("cards_per_page") or 12))
    pages = [
        ordered[i : i + per_page]
        for i in range(0, max(len(ordered), 1), per_page)
    ]

    # full card data for client-side cross-page filtering (kept in sync with
    # the server-rendered card template in index.html)
    card_entries = []
    for post in ordered:
        card_entries.append(
            {
                "url": post.url,
                "title": post.title,
                "date_str": post.date_str,
                "tags": post.tags,
                "folder": post.folder,
                "pin": post.pin,
                "highlight": post.highlight,
                "preview_html": post.preview_html,
                "preview_plain": post.preview_plain,
                "thumb_url": post.thumb_url or "",
                "feature": post.feature_url or "",
            }
        )
    (out_root / "data" / "cards.json").write_text(
        json.dumps(card_entries, ensure_ascii=False), encoding="utf-8"
    )

    def page_path(n: int) -> str:
        return "index.html" if n == 1 else f"page/{n}.html"

    base_vars = dict(
        site=site_vars,
        socials=socials,
        svg_icons={k: Markup(v) for k, v in SVG_ICONS.items()},
        giscus=cfg.giscus,
        has_header_banner=(blog_root / "assets" / "header.png").exists(),
    )

    generated_pages = set()
    for page_num, page_posts in enumerate(pages, start=1):
        current_url = page_path(page_num)
        pager = {
            "page": page_num,
            "total": len(pages),
            "prev": (
                rel_output(current_url, page_path(page_num - 1))
                if page_num > 1
                else None
            ),
            "next": (
                rel_output(current_url, page_path(page_num + 1))
                if page_num < len(pages)
                else None
            ),
            "pages": [
                {
                    "n": n,
                    "url": rel_output(current_url, page_path(n)),
                    "current": n == page_num,
                }
                for n in range(1, len(pages) + 1)
            ],
        }
        index_vars = {
            **base_vars,
            "root": root_prefix(current_url),
            "page_title": (
                cfg.site["title"]
                if page_num == 1
                else f"第 {page_num} 页"
            ),
            "description": cfg.site.get("subtitle", ""),
            "canonical": (
                cfg.site_url + "/" + ("" if page_num == 1 else current_url)
                if cfg.site_url
                else ""
            ),
            "nav_html": Markup(render_nav(current_url, ctx)),
            "posts": page_posts,
            "pager": pager,
            "tree": tree,
            "all_tags": all_tags,
            "top_tags": top_tags,
            "folder_segments": folder_segments,
            "collapse_threshold": collapse_threshold,
        }
        dst = out_root / current_url
        dst.parent.mkdir(parents=True, exist_ok=True)
        generated_pages.add(dst.resolve())
        dst.write_text(
            env.get_template("index.html").render(**index_vars),
            encoding="utf-8",
        )

    for post in posts:
        post_vars = {
            **base_vars,
            "root": root_prefix(post.url),
            "page_title": post.title,
            "description": post.preview_plain[:160],
            "canonical": (
                cfg.site_url + "/" + post.url if cfg.site_url else ""
            ),
            "nav_html": Markup(render_nav(post.url, ctx)),
            "post": post,
        }
        dst = out_root / post.url
        dst.parent.mkdir(parents=True, exist_ok=True)
        generated_pages.add(dst.resolve())
        dst.write_text(
            env.get_template("post.html").render(**post_vars),
            encoding="utf-8",
        )

    page_404 = out_root / "404.html"
    generated_pages.add(page_404.resolve())
    # GitHub Pages serves 404.html at ANY missing path (e.g. /posts/x.html),
    # so relative asset/link URLs would resolve against the wrong directory.
    # Render with a root-absolute prefix and rewrite every href/src.
    abs_root = (cfg.base_path or "") + "/"
    html_404 = env.get_template("404.html").render(
        **{
            **base_vars,
            "root": abs_root,
            "page_title": "404",
            "description": "页面不存在",
            "canonical": "",
            "nav_html": Markup(render_nav("404.html", ctx)),
        }
    )
    soup_404 = BeautifulSoup(html_404, "html.parser")
    for tag in soup_404.find_all(href=True):
        h = tag["href"].strip()
        if h and not h.startswith(
            ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#", "/")
        ):
            tag["href"] = abs_root + h
    for tag in soup_404.find_all(src=True):
        s = tag["src"].strip()
        if s and not s.startswith(("http://", "https://", "data:", "blob:", "/")):
            tag["src"] = abs_root + s
    page_404.write_text(str(soup_404), encoding="utf-8")

    # 5. static assets + blog assets + dino
    static_src = Path(__file__).parent / "generator" / "static"
    # Windows sometimes pins recently-edited files in a user-mapped section
    # (WinError 1224), which makes copies fail transiently; retry idempotently
    for attempt in range(4):
        try:
            shutil.copytree(static_src, out_root, dirs_exist_ok=True)
            sync_tree(blog_root / "assets", out_root / "assets")
            assets.copy_all(log)
            break
        except (OSError, shutil.Error) as exc:
            if attempt == 3:
                raise
            log(f"asset copy hit a transient file lock, retrying…")
            time.sleep(1.5)

    dino_src = cfg.root / "dino" / "index.html"
    if dino_src.exists():
        (out_root / "dino").mkdir(parents=True, exist_ok=True)
        shutil.copy2(dino_src, out_root / "dino" / "index.html")
        dino_out = out_root / "dino" / "index.html"
        generated_pages.add(dino_out.resolve())
        html = dino_out.read_text(encoding="utf-8")
        if '<div class="toolbar">' in html:
            html = html.replace(
                '<div class="toolbar">',
                '<div class="toolbar">\n      ' + DINO_BACK_LINK + "\n      " + DINO_EMBED_SCRIPT,
                1,
            )
        if ".sound-toggle {" in html:
            html = html.replace(
                ".sound-toggle {",
                DINO_BACK_STYLE + "  .sound-toggle {",
                1,
            )
        dino_out.write_text(html, encoding="utf-8")
        log("copied dino game")

    # prune stale html pages (deleted posts / leftovers from imports)
    pruned = 0
    for html in out_root.rglob("*.html"):
        if "assets" in html.parts:
            continue
        if html.resolve() not in generated_pages:
            html.unlink()
            pruned += 1
    if pruned:
        log(f"pruned {pruned} stale pages")

    make_dino_icons(cfg.root, out_root)

    # 6. rss
    rss_xml = build_rss(posts, cfg, cfg.base_path, cfg.site_url)
    (out_root / "rss.xml").write_text(rss_xml, encoding="utf-8")

    if ctx.warnings:
        log("warnings:")
        for w in ctx.warnings[:20]:
            log(f"  ! {w}")

    log(
        f"done: {len(posts)} posts, {len(tree)} top nodes, "
        f"{graph['stats']['refs']} references, {len(assets._map)} assets"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="pilog static blog generator")
    parser.add_argument("--config", default="config.json")
    parser.add_argument("--blog", default=None, help="override blog dir")
    parser.add_argument("--out", default=None, help="override output dir")
    parser.add_argument("--clean", action="store_true", help="wipe output first")
    args = parser.parse_args()
    build_site(
        config_path=args.config,
        blog_dir=args.blog,
        out_dir=args.out,
        clean=args.clean,
    )


if __name__ == "__main__":
    main()
