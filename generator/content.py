from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import yaml

from .markdownx import MarkdownContext, find_asset, render_markdown
from .utils import natural_key, parse_date, rel_output


@dataclass
class Post:
    src: Path
    rel: str
    rel_dir: str
    stem: str
    title: str = ""
    date: datetime = field(default_factory=datetime.now)
    tags: list = field(default_factory=list)
    preview: str | None = None
    preview_image: str | None = None
    draft: bool = False
    pin: bool = False
    highlight: bool = False
    hidden: bool = False
    feature: str = ""
    order: float | None = None
    chapters_per_page: int = 0
    chapter_count: int = 0
    folder: str = ""
    url: str = ""
    html: str = ""
    preview_html: str = ""
    preview_plain: str = ""
    thumb_src: Path | None = None
    thumb_url: str | None = None
    feature_url: str | None = None
    image_sources: list = field(default_factory=list)
    refs: list = field(default_factory=list)
    word_count: int = 0

    @property
    def date_str(self) -> str:
        return self.date.strftime("%Y-%m-%d")


def split_front_matter(text: str) -> tuple[dict, str]:
    """Return (front matter dict, body text)."""
    if not text.startswith("---\n") and not text.startswith("---\r\n"):
        return {}, text
    lines = text.splitlines(keepends=True)
    closing = -1
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            closing = i
            break
    if closing < 0:
        return {}, text
    fm_text = "".join(lines[1:closing])
    body = "".join(lines[closing + 1:])
    try:
        fm = yaml.safe_load(fm_text) or {}
        if not isinstance(fm, dict):
            fm = {}
    except yaml.YAMLError:
        fm = {}
    return fm, body


def _first_heading(text: str) -> str | None:
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("# ") or s.startswith("#\t"):
            return s.lstrip("#").strip()
        if s.startswith("#"):
            return s.lstrip("#").strip()
    return None


def auto_preview(body: str, max_chars: int = 260) -> str:
    """Extract an informative plain-text snippet, skipping headings/code."""
    parts: list[str] = []
    total = 0
    in_code = False
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith(("```", "~~~")):
            in_code = not in_code
            continue
        if in_code or not line:
            continue
        if line.startswith(("#", ">", "!", "[[", "[^")) or line in ("---", "***", "==="):
            continue
        if line.startswith("|") and line.endswith("|"):
            continue
        # unwrap links, strip emphasis markers
        line = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", line)
        line = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line)
        line = re.sub(r"[`*_~]", "", line)
        line = re.sub(r"<[^>]+>", "", line)
        line = re.sub(r"^\s*(?:[-*+]|\d+[.)])\s+", "", line)
        line = re.sub(r"^\s*\[[ xX]\]\s*", "", line)
        line = re.sub(r"\s+", " ", line).strip()
        if not line or len(line) < 8:
            continue
        parts.append(line)
        total += len(line)
        if total >= max_chars:
            break
    text = " ".join(parts)
    if len(text) > max_chars:
        cut = text.rfind(" ", 0, max_chars)
        text = text[: cut if cut > max_chars * 0.6 else max_chars].rstrip()
        text += "…"
    return text


def auto_preview_md(body: str, max_chars: int = 260) -> str:
    """Extract a markdown snippet (keeping inline syntax) for card previews.

    Skips headings, code blocks, tables, blockquotes, footnotes and images so
    the rendered preview stays tidy; heading flattening is applied by the
    caller after markdown rendering.
    """
    parts: list[str] = []
    total = 0
    in_code = False
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith(("```", "~~~")):
            in_code = not in_code
            continue
        if in_code or not line:
            continue
        if line.startswith(("#", ">", "!", "[[", "[^")) or line in ("---", "***", "==="):
            continue
        if line.startswith("|") and line.endswith("|"):
            continue
        parts.append(line)
        total += len(line)
        if total >= max_chars:
            break
    text = "\n\n".join(parts)
    if len(text) > max_chars:
        cut = text.rfind(" ", 0, max_chars)
        text = text[: cut if cut > max_chars * 0.6 else max_chars].rstrip()
        text += "…"
    return text


def parse_tags(fm: dict, rel_dir: str) -> list:
    tags = fm.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    elif isinstance(tags, list):
        tags = [str(t).strip() for t in tags if str(t).strip()]
    return tags


def scan_posts(blog_root: Path, ctx: MarkdownContext) -> list[Post]:
    posts: list[Post] = []
    for md in sorted(blog_root.rglob("*.md"), key=lambda p: p.as_posix().lower()):
        rel = md.relative_to(blog_root).as_posix()
        name = md.name
        if name in ("nav.md",) or name.startswith((".", "_")):
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        fm, body = split_front_matter(text)
        if fm.get("draft", False):
            continue
        stem = md.stem
        date = parse_date(
            fm.get("date"),
            datetime.fromtimestamp(md.stat().st_mtime),
        )
        title = str(fm.get("title") or _first_heading(body) or stem).strip()
        rel_dir = rel.rsplit("/", 1)[0] if "/" in rel else ""
        tags = parse_tags(fm, rel_dir)
        folder = rel_dir or "root"
        post = Post(
            src=md.resolve(),
            rel=rel[:-3],
            rel_dir=rel_dir,
            stem=stem,
            title=title,
            date=date,
            tags=tags,
            preview=(str(fm["preview"]) if fm.get("preview") else None),
            preview_image=(str(fm["preview_image"]) if fm.get("preview_image") else None),
            draft=bool(fm.get("draft", False)),
            pin=bool(fm.get("pin", False)),
            highlight=bool(fm.get("highlight", False)),
            hidden=bool(fm.get("hidden", False) or fm.get("hideInList", False)),
            feature=_parse_feature(fm.get("feature")),
            order=(
                float(fm["order"])
                if fm.get("order") is not None
                else None
            ),
            chapters_per_page=_parse_chapters(fm.get("chapters_per_page")),
            folder=folder,
            word_count=len(re.sub(r"\s+", "", body)),
        )
        posts.append(post)
    return posts


def _parse_chapters(value) -> int:
    """Front matter `chapters_per_page` -> int (0 means no section paging)."""
    if value is None:
        return 0
    try:
        n = int(value)
    except (TypeError, ValueError):
        return 0
    return n if n > 0 else 0


def _parse_feature(value) -> str:
    """Normalize the `feature` front matter value.

    Gridea writes `feature: /post-images/xxx.png`; pilog also accepts
    `feature: true` to reuse the post's preview image. Returns "" when unset.
    """
    if isinstance(value, bool):
        return "preview" if value else ""
    if value is None:
        return ""
    text = str(value).strip()
    if text.lower() in ("true", "yes", "1"):
        return "preview"
    return text.lstrip("/")


def build_index(blog_root: Path) -> dict:
    """rel_dir -> {name, path} for every directory that exists under blogs."""
    dirs: dict[str, dict] = {"": {"name": "root", "path": ""}}
    for d in blog_root.rglob("*"):
        if d.is_dir():
            rel = d.relative_to(blog_root).as_posix()
            dirs[rel] = {"name": d.name, "path": rel}
    return dirs


def build_tree(
    posts: list[Post],
    collapse_threshold: int = 25,
    collapse_min_posts: int = 4,
) -> list:
    """Nested tree; large folders default to collapsed when there are many posts."""

    total = len(posts)
    dir_counts: dict[str, int] = {}
    for post in posts:
        acc = ""
        for part in (post.rel_dir.split("/") if post.rel_dir else []):
            acc = f"{acc}/{part}" if acc else part
            dir_counts[acc] = dir_counts.get(acc, 0) + 1
    subdirs: set[str] = set()
    for d in dir_counts:
        parent = d.rsplit("/", 1)[0]
        if parent:
            subdirs.add(parent)

    def default_collapsed(d: str) -> bool:
        # only leaf dirs (no subdirs with posts) collapse by default, so the
        # tree/graph still shows navigable folder structure
        return (
            total > collapse_threshold
            and d not in subdirs
            and dir_counts.get(d, 0) >= collapse_min_posts
        )

    def node(path: str, name: str) -> dict:
        return {"name": name, "path": path, "is_dir": True, "children": []}

    root: dict = node("", "root")
    dirs = {"": root}
    for post in sorted(posts, key=lambda p: p.rel):
        parts = post.rel.split("/")
        cur = root
        acc = ""
        for part in parts[:-1]:
            acc = f"{acc}/{part}" if acc else part
            if acc not in dirs:
                new = node(acc, part)
                new["open"] = not default_collapsed(acc)
                dirs[acc] = new
                cur["children"].append(new)
            cur = dirs[acc]
        cur["children"].append(
            {
                "name": post.stem,
                "path": post.rel,
                "is_dir": False,
                "url": post.url,
                "title": post.title,
                "date": post.date_str,
                "tags": post.tags,
                "highlight": post.highlight,
            }
        )
    return root["children"]


def sorted_for_cards(posts: list[Post]) -> list[Post]:
    """Pinned first; within each group manual `order` wins, then newest first."""

    def key(p: Post):
        return (p.order if p.order is not None else float("inf"), -p.date.timestamp())

    pinned = sorted((p for p in posts if p.pin), key=key)
    rest = sorted((p for p in posts if not p.pin), key=key)
    return pinned + rest


def folder_segments(folder: str) -> list:
    """Split 'posts/tech' into clickable [{name, path}] segments."""
    if not folder or folder == "root":
        return []
    parts = folder.split("/")
    return [
        {"name": part, "path": "/".join(parts[: i + 1])}
        for i, part in enumerate(parts)
    ]


def sort_tree(nodes: list) -> list:
    for n in nodes:
        if n.get("is_dir"):
            n["children"] = sort_tree(n["children"])
    return sorted(
        nodes,
        key=lambda n: (not n.get("is_dir", False), natural_key(n["name"].lower())),
    )
