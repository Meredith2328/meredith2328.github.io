#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Feature regression tests: hidden posts, animated GIF covers, feature hero,
markdown strikethrough + LaTeX math."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
TMP = ROOT / ".features_tmp"


def make_md(title: str, body: str, **fm) -> str:
    lines = ["---", f"title: {title}"]
    for key, value in fm.items():
        if isinstance(value, bool):
            lines.append(f"{key}: {'true' if value else 'false'}")
        else:
            lines.append(f"{key}: {value}")
    lines += ["---", "", body]
    return "\n".join(lines)


def test_markdown_del_and_math() -> None:
    from generator.assets import AssetMap
    from generator.markdownx import MarkdownContext, render_markdown

    blog = TMP / "blogs"
    blog.mkdir(parents=True, exist_ok=True)
    ctx = MarkdownContext(
        blog_root=blog, assets=AssetMap(blog_root=blog, out_root=blog)
    )
    src = blog / "demo.md"
    text = "普通文字 ~~删除线~~ 以及 $a^2 + b^2$，整行公式：\n\n$$\nx^2 + y^2 = z^2\n$$\n"
    html = render_markdown(text, src, "index.html", ctx).html
    assert "<del>删除线</del>" in html, html
    assert "arithmatex" in html, html
    assert "\\(a^2 + b^2\\)" in html, html
    assert "\\[\nx^2" in html, html
    # `$$...$$` written inline (not on its own line) must still become block math
    inline_html = render_markdown(
        "前后都有文字 $$E=mc^2$$ 也在同一行",
        src,
        "index.html",
        ctx,
    ).html
    assert '<div class="arithmatex">\\[E=mc^2\\]</div>' in inline_html, inline_html
    # a list directly after a paragraph (no blank line) must still be a list
    list_html = render_markdown(
        "**标题**：\n- 第一项\n- 第二项\n",
        src,
        "index.html",
        ctx,
    ).html
    assert "<ul>" in list_html and "<li>第一项</li>" in list_html, list_html
    assert "- 第一项" not in list_html.replace("<ul>", ""), list_html
    # consecutive blockquote lines keep their line breaks
    bq_html = render_markdown(
        "> 第一行文字。\n> edit time: 2026-03-05\n",
        src,
        "index.html",
        ctx,
    ).html
    assert "<br/>" in bq_html and "第一行文字" in bq_html, bq_html
    # lists inside blockquotes render as lists
    bq_list_html = render_markdown(
        "> 题型：\n> - 加减关系\n> - 乘除关系\n> 归纳一下。\n",
        src,
        "index.html",
        ctx,
    ).html
    assert "<ul>" in bq_list_html and "<li>加减关系</li>" in bq_list_html, bq_list_html
    print("  [PASS] ~~strikethrough~~ and $...$ / $$...$$ render")


def test_gif_thumbnail_keeps_animation() -> None:
    from PIL import Image

    from generator.assets import make_thumbnail

    src = TMP / "anim.gif"
    frames = [
        Image.new("RGB", (600, 300), "#ff0000"),
        Image.new("RGB", (600, 300), "#00aa00"),
        Image.new("RGB", (600, 300), "#0000ff"),
    ]
    frames[0].save(
        src, save_all=True, append_images=frames[1:], duration=120, loop=0
    )
    out = make_thumbnail(src, TMP / "thumbs", width=300)
    assert out is not None and out.suffix == ".gif", out
    with Image.open(out) as im:
        assert getattr(im, "n_frames", 1) > 1
    print("  [PASS] animated GIF cover keeps its animation in thumbnails")


def test_hidden_posts_feature_hero_and_nojekyll() -> None:
    from PIL import Image

    from build import build_site

    blog = TMP / "blogs2"
    out = TMP / "out2"
    if out.exists():
        shutil.rmtree(out)
    (blog / "posts").mkdir(parents=True, exist_ok=True)
    (blog / "assets").mkdir(parents=True, exist_ok=True)
    cover = blog / "assets" / "cover.png"
    Image.new("RGB", (64, 64), "#3366cc").save(cover)

    (blog / "posts" / "visible.md").write_text(
        make_md("可见文章", "正文内容。"), encoding="utf-8"
    )
    (blog / "posts" / "secret.md").write_text(
        make_md("隐藏文章", "不要出现。", hidden=True), encoding="utf-8"
    )
    (blog / "posts" / "secret2.md").write_text(
        make_md("旧 Gridea 隐藏文章", "不要出现。", hideInList=True), encoding="utf-8"
    )
    (blog / "posts" / "hero.md").write_text(
        make_md(
            "带封面文章",
            "有 hero。",
            preview_image="assets/cover.png",
            feature=True,
        ),
        encoding="utf-8",
    )
    (blog / "posts" / "prev.md").write_text(
        "---\n"
        "title: 预览语法测试\n"
        'preview: "# 预览里的标题\\n**加粗** 与 $x^2$ 和 ~~删除线~~"\n'
        "---\n\n正文。\n",
        encoding="utf-8",
    )

    build_site(
        config_path=ROOT / "config.json",
        blog_dir=str(blog),
        out_dir=str(out),
    )
    assert (out / "posts" / "visible.html").exists()
    assert not (out / "posts" / "secret.html").exists()
    assert not (out / "posts" / "secret2.html").exists()
    hero = (out / "posts" / "hero.html").read_text(encoding="utf-8")
    assert 'class="post-hero"' in hero, hero[:400]
    home = (out / "index.html").read_text(encoding="utf-8")
    assert "is-cover" in home, "card cover (feature) missing on homepage"
    # preview supports markdown (bold / math / strikethrough), but headings
    # are flattened to body-size paragraphs
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(home, "html.parser")
    cards = soup.select(".card")
    prev_card = next(
        (c for c in cards if "预览语法测试" in c.get_text()), None
    )
    assert prev_card is not None, "preview test card missing"
    preview = prev_card.select_one(".card-preview")
    assert preview is not None
    assert not preview.find(["h1", "h2", "h3"]), "headings must be flattened"
    assert preview.find("strong") is not None, "bold must render in preview"
    assert preview.find(class_="arithmatex") is not None, "math must render in preview"
    assert (out / ".nojekyll").exists()
    print("  [PASS] hidden excluded; hero + cover + nojekyll + markdown preview present")


def test_long_post_chapter_paging() -> None:
    import json

    from build import build_site

    blog = TMP / "blogs3"
    out = TMP / "out3"
    if out.exists():
        shutil.rmtree(out)
    (blog / "posts").mkdir(parents=True, exist_ok=True)
    (blog / "posts" / "long.md").write_text(
        make_md(
            "长文测试",
            "## 第一章\n\n内容一。\n\n## 第二章\n\n内容二。\n\n"
            "## 第三章\n\n内容三。\n\n相关：[[another|另一篇]]",
            date="2026-01-01",
            chapters_per_page=1,
        ),
        encoding="utf-8",
    )
    (blog / "posts" / "another.md").write_text(
        make_md("另一篇", "正文。", date="2026-01-02"),
        encoding="utf-8",
    )
    build_site(
        config_path=ROOT / "config.json",
        blog_dir=str(blog),
        out_dir=str(out),
    )
    html = (out / "posts" / "long.html").read_text(encoding="utf-8")
    assert html.count('class="post-chapter"') == 3, html[:400]
    assert 'id="post-pager"' in html, html[-600:]
    assert 'class="post-rel is-related"' in html, html[-600:]
    assert 'data-chapters="3"' in html
    # the footer aside must stay outside the chapter divs
    assert html.rfind('class="post-chapter"') < html.find('class="post-rel'), (
        "related footer should come after the last chapter"
    )
    # wikilinks in the styled footer still count as graph refs
    graph = json.loads((out / "data" / "graph.json").read_text(encoding="utf-8"))
    refs = [(l["source"], l["target"]) for l in graph["links"] if l["kind"] == "ref"]
    assert ("posts/long", "posts/another") in refs, refs
    # full-text index carries the whole body
    full = json.loads((out / "data" / "fulltext.json").read_text(encoding="utf-8"))
    long_full = next(e for e in full if e["url"] == "posts/long.html")
    assert "内容三" in long_full["text"], long_full["text"][:200]
    print("  [PASS] long post chapter paging + styled related footer + refs preserved")


def main() -> None:
    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True)
    try:
        test_markdown_del_and_math()
        test_gif_thumbnail_keeps_animation()
        test_hidden_posts_feature_hero_and_nojekyll()
        test_long_post_chapter_paging()
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
    print("all feature checks passed")


if __name__ == "__main__":
    main()
