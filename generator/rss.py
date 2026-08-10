from __future__ import annotations

from email.utils import format_datetime
from xml.sax.saxutils import escape


def build_rss(posts: list, cfg, base_path: str, site_url: str) -> str:
    posts = sorted([p for p in posts if not p.draft], key=lambda p: p.date, reverse=True)
    feed_url = f"{site_url}/rss.xml"
    site_root = site_url
    description = cfg.site.get("subtitle", "") or "十派的玩具箱：知识笔记、工具笔记、小玩意儿"

    items = []
    for post in posts:
        link = f"{site_root}/{post.url}" if not post.url.startswith("/") else f"{site_root}{post.url}"
        desc = post.preview_html or f"<p>{escape(post.preview_plain)}</p>"
        items.append(
            "      <item>\n"
            f"        <title>{escape(post.title)}</title>\n"
            f"        <link>{escape(link)}</link>\n"
            f"        <guid isPermaLink=\"false\">{escape(link)}</guid>\n"
            f"        <pubDate>{format_datetime(post.date)}</pubDate>\n"
            f"        <description>{escape(desc)}</description>\n"
            "      </item>"
        )

    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<rss version=\"2.0\" "
        "xmlns:atom=\"http://www.w3.org/2005/Atom\">\n"
        "  <channel>\n"
        f"    <title>{escape(cfg.site['title'])}</title>\n"
        f"    <link>{escape(site_root)}/</link>\n"
        f"    <description>{escape(description)}</description>\n"
        f"    <atom:link href=\"{escape(feed_url)}\" rel=\"self\" type=\"application/rss+xml\"/>\n"
        f"    <language>{escape(cfg.site.get('language', 'zh-CN'))}</language>\n"
        "    <generator>pilog</generator>\n"
        + "\n".join(items)
        + "\n  </channel>\n</rss>\n"
    )
