from __future__ import annotations

import re
import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import unquote, quote

import markdown as md_lib
from bs4 import BeautifulSoup

from .utils import rel_output


IMG_TOKEN = "__PILOG_IMG__:"
LINK_TOKEN = "__PILOG_LINK__:"
BLOCK_MATH_TOKEN = "PILOG-BLOCKMATH-"
LIST_MARKER_RE = re.compile(r"^(?:[-*+]|\d+[.)])\s+\S")

WIKI_IMAGE_RE = re.compile(r"!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]")
WIKI_LINK_RE = re.compile(r"\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]")
CODE_TOKEN = "__PILOG_CODE__:"


@dataclass
class MarkdownContext:
    blog_root: Path
    assets: object  # AssetMap
    base_path: str = ""
    posts_by_rel: dict = field(default_factory=dict)  # rel -> Post
    warnings: list = field(default_factory=list)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


@dataclass
class Rendered:
    html: str
    refs: list  # post rel targets
    image_sources: list  # abs Path of images found in body


def _parse_wiki(text: str) -> str:
    """Convert Obsidian [[...]] / ![[...]] into standard markdown tokens.

    Inline code spans and fenced code blocks are stashed first, so wiki
    syntax shown as an example (e.g. ``![[a.png]]``) stays literal.
    """

    def img(m: re.Match) -> str:
        name = m.group(1).strip()
        opts = (m.group(2) or "").strip()
        payload = quote(name)
        if opts:
            payload += "|" + quote(opts)
        return f"![{name}]({IMG_TOKEN}{payload})"

    def link(m: re.Match) -> str:
        target = m.group(1).strip()
        label = (m.group(2) or "").strip() or target.split("#")[0].split("/")[-1]
        payload = quote(target)
        return f"[{label}]({LINK_TOKEN}{payload})"

    out: list = []
    in_fence = False
    fence = ""
    for line in text.splitlines(keepends=True):
        stripped = line.strip()
        if not in_fence and stripped.startswith(("```", "~~~")):
            in_fence = True
            fence = stripped[:3]
            out.append(line)
            continue
        if in_fence:
            if stripped.startswith(fence):
                in_fence = False
            out.append(line)  # wiki syntax inside fenced code stays literal
            continue
        spans: list = []

        def stash(m: re.Match) -> str:
            spans.append(m.group(0))
            return f"{CODE_TOKEN}{len(spans) - 1}"

        line = re.sub(r"(`+)([^`\n]+?)\1", stash, line)
        line = WIKI_IMAGE_RE.sub(img, line)
        line = WIKI_LINK_RE.sub(link, line)
        # descending order: replace :41 before its prefix :4
        for i in range(len(spans) - 1, -1, -1):
            line = line.replace(f"{CODE_TOKEN}{i}", spans[i])
        out.append(line)
    return "".join(out)


def _extract_block_math(text: str) -> tuple[str, list]:
    r"""Pull `$$...$$` blocks out of the source so they always render as
    display math (KaTeX `\[...\]`), even when the pair is written inline
    inside a paragraph instead of on its own lines."""
    maths: list = []
    out: list = []
    in_code = False
    fence = ""
    pending: list | None = None
    spans: list = []

    def stash(m: re.Match) -> str:
        spans.append(m.group(0))
        return f"{CODE_TOKEN}{len(spans) - 1}"

    def restore(s: str) -> str:
        for i in range(len(spans) - 1, -1, -1):
            s = s.replace(f"{CODE_TOKEN}{i}", spans[i])
        return s

    for line in text.splitlines(keepends=True):
        stripped = line.strip()
        if in_code:
            if fence and stripped.startswith(fence):
                in_code = False
            out.append(line)
            continue
        if stripped.startswith(("```", "~~~")):
            in_code = True
            fence = stripped[:3]
            out.append(line)
            continue
        # stash inline code spans so `$$...$$` shown as an example stays literal
        line = re.sub(r"(`+)([^`\n]+?)\1", stash, line)
        if pending is not None:
            end = line.find("$$")
            if end >= 0:
                pending.append(line[:end])
                maths.append(restore("".join(pending)))
                token = f"{BLOCK_MATH_TOKEN}{len(maths) - 1}"
                out.append("\n\n" + token + "\n\n" + restore(line[end + 2 :]))
                pending = None
            else:
                pending.append(line)
            continue
        while True:
            idx = line.find("$$")
            if idx < 0:
                out.append(restore(line))
                break
            rest = line[idx + 2 :]
            end = rest.find("$$")
            if end < 0:
                pending = [rest]
                out.append(restore(line[:idx]))
                break
            maths.append(restore(rest[:end]))
            token = f"{BLOCK_MATH_TOKEN}{len(maths) - 1}"
            out.append(restore(line[:idx]) + "\n\n" + token + "\n\n")
            line = rest[end + 2 :]
    if pending is not None:
        out.append(restore("".join(pending)))
    return "".join(out), maths


def _normalize_lists(text: str) -> str:
    """python-markdown only starts a list after a blank line; note-style
    content often puts `- item` right after a paragraph, or `> - item`
    inside a blockquote. Insert the missing blank separators so lists
    (including lists inside blockquotes) render as such."""
    lines = text.splitlines(keepends=True)
    out: list = []
    in_code = False
    fence = ""

    def info(s: str) -> tuple:
        quote = s.startswith(">")
        content = re.sub(r"^>\s?", "", s) if quote else s
        return (
            quote,
            bool(LIST_MARKER_RE.match(content)),
            not content.strip(),
        )

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not in_code and stripped.startswith(("```", "~~~")):
            in_code = True
            fence = stripped[:3]
        elif in_code and stripped.startswith(fence):
            in_code = False
        quote = is_list = False
        if not in_code:
            quote, is_list, _ = info(line)
            if is_list and out:
                # before: previous line is a non-blank, non-list line
                _, plist, pblank = info(out[-1])
                if not pblank and not plist:
                    out.append(">\n" if quote else "\n")
        out.append(line)
        if quote and is_list and i + 1 < len(lines):
            # after: a blockquote list directly followed by quote text
            nquote, nlist, nblank = info(lines[i + 1])
            if nquote and not nblank and not nlist:
                out.append(">\n")
    return "".join(out)


def _heading_slugify(value: str, separator: str = "-") -> str:
    """Slugify a heading for its anchor id, keeping CJK characters.
    HTML5 ids allow Unicode, so `## 根因三步` -> `#根因三步` instead of `#_1`."""
    slug = re.sub(r"\W+", separator, value)
    slug = re.sub(re.escape(separator) + "+", separator, slug).strip(separator)
    return slug.lower()


def _collect_code_langs(text: str) -> list[str]:
    """Walk fenced code blocks in source order and return the language/file
    label of each one ("" when the fence has no info string)."""
    langs: list[str] = []
    in_fence = False
    fence = ""
    for line in text.splitlines(keepends=True):
        stripped = line.strip()
        if not in_fence and stripped.startswith(("```", "~~~")):
            in_fence = True
            fence = stripped[:3]
            info = stripped[3:].strip()
            label = ""
            for token in info.split():
                if token.lower().startswith("hl:"):
                    continue
                if "=" in token and token.split("=", 1)[0].lower() in ("title", "file"):
                    label = token.split("=", 1)[1]
                    break
                if not label:
                    label = token
            langs.append(label)
            continue
        if in_fence and stripped.startswith(fence):
            in_fence = False
    return langs


CALLOUT_RE = re.compile(r"^\s*\[!(\w+)\](.*)$", re.S)
CALLOUT_LABELS = {
    "note": "笔记",
    "info": "信息",
    "tip": "提示",
    "important": "重要",
    "success": "成功",
    "question": "问题",
    "warning": "警告",
    "failure": "失败",
    "danger": "危险",
    "bug": "Bug",
    "example": "例子",
    "quote": "引用",
    "abstract": "摘要",
    "todo": "待办",
}


def _style_callouts(soup) -> None:
    """Turn Obsidian-style callouts (`> [!note] title`) into styled boxes.

    python-markdown merges adjacent blockquote lines into one <blockquote>,
    so a blockquote may contain several callout segments plus plain quote
    content; split them apart here.
    """
    for bq in list(soup.find_all("blockquote")):
        children = list(bq.children)
        has_marker = any(
            ch.name == "p" and CALLOUT_RE.match(ch.get_text())
            for ch in children
        )
        if not has_marker:
            continue

        segments: list[tuple[str, list]] = []
        current: list = []
        current_kind = "plain"
        for ch in children:
            if ch.name == "p":
                m = CALLOUT_RE.match(ch.get_text())
                if m:
                    if current:
                        segments.append((current_kind, current))
                    current = [ch]
                    current_kind = m.group(1).lower()
                    continue
            current.append(ch)
        if current:
            segments.append((current_kind, current))

        for kind, els in segments:
            if kind == "plain":
                nbq = soup.new_tag("blockquote")
                for el in els:
                    nbq.append(el.extract())
                bq.insert_before(nbq)
                continue

            div = soup.new_tag("div")
            div["class"] = "callout callout-" + kind
            title = soup.new_tag("div")
            title["class"] = "callout-title"
            header = els[0]
            # the marker line and the first content line may be merged into one
            # <p> joined by <br/>; keep the marker line as the title and move
            # the rest into the body
            br = header.find("br")
            title_nodes = []
            body_head = []
            seen_br = False
            for node in list(header.children):
                if not seen_br:
                    if node is br:
                        seen_br = True
                        continue
                    title_nodes.append(node)
                else:
                    body_head.append(node)
            if title_nodes and isinstance(title_nodes[0], str):
                m = CALLOUT_RE.match(title_nodes[0])
                if m:
                    rest = m.group(2).strip()
                    if rest:
                        title_nodes[0] = rest
                    else:
                        title_nodes.pop(0)
            header.extract()
            if title_nodes:
                for node in title_nodes:
                    title.append(node)
            else:
                title.string = CALLOUT_LABELS.get(kind, kind)
            body = soup.new_tag("div")
            body["class"] = "callout-body"
            for node in body_head:
                body.append(node)
            for el in els[1:]:
                body.append(el.extract())
            div.append(title)
            div.append(body)
            bq.insert_before(div)
        bq.decompose()


def _md_instance() -> md_lib.Markdown:
    return md_lib.Markdown(
        extensions=[
            "extra",
            "codehilite",
            "toc",
            "sane_lists",
            "attr_list",
            # ~~删除线~~ and $...$ / $$...$$ LaTeX (rendered client-side by KaTeX)
            "pymdownx.tilde",
            "pymdownx.arithmatex",
        ],
        extension_configs={
            "codehilite": {
                "guess_lang": False,
                "css_class": "highlight",
                "linenums": False,
            },
            "toc": {
                "permalink": False,
                "toc_depth": "1-6",
                "slugify": _heading_slugify,
            },
            "pymdownx.tilde": {"subscript": False},
            "pymdownx.arithmatex": {"generic": True},
        },
    )


def find_asset(name: str, src_file: Path, ctx: MarkdownContext) -> Path | None:
    """Locate an asset file by wiki-style name (Obsidian vault semantics)."""
    name = name.replace("\\", "/")
    src_dir = src_file.parent.resolve()
    root = ctx.blog_root.resolve()
    candidates: list[Path] = []

    if "/" in name:
        # explicit relative path inside the vault
        candidates += [src_dir / name, root / name, (root / "assets") / name]
    else:
        candidates += [
            src_dir / name,          # same folder as the post
            root / name,             # vault root
            (root / "assets") / name,  # vault-wide assets folder
        ]
        # any folder literally named assets
        for assets_dir in root.rglob("assets"):
            if assets_dir.is_dir():
                candidates.append(assets_dir / name)

    for cand in candidates:
        if cand.is_file():
            return cand.resolve()
    return None


def resolve_asset_out(src: Path, ctx: MarkdownContext) -> str:
    """Register an asset and return its site-root-relative output path."""
    src = src.resolve()
    root = ctx.blog_root.resolve()
    try:
        rel = src.relative_to(root).as_posix()
    except ValueError:
        digest = hashlib.sha1(str(src).encode("utf-8")).hexdigest()[:10]
        rel = f"assets/external/{quote(src.stem, safe='')}-{digest}{src.suffix.lower()}"
    return ctx.assets.register(src, rel)


def _apply_image_opts(img, opts: str) -> None:
    opts = unquote(opts)
    if not opts:
        return
    dims = re.search(r"(\d+)(?:x(\d+))?", opts)
    if not dims:
        return
    w = dims.group(1)
    h = dims.group(2)
    if h:
        img["width"] = w
        img["height"] = h
        img["style"] = "width:{w}px;height:{h}px;object-fit:cover".format(
            w=w, h=h
        )
    else:
        img["style"] = "width:{w}px".format(w=w)


def _rewrite_href(href: str, src_file: Path, page_url: str,
                  ctx: MarkdownContext, refs: list) -> str:
    base = ctx.base_path

    if href.startswith("#") or href.startswith(("http://", "https://",
                                                "mailto:", "tel:", "data:",
                                                "blob:", "javascript:")):
        return href

    if href.startswith("/"):
        if href == "/":
            # site root in a nav item: resolve page-relative so it works
            # under any deployment path (e.g. /blogtest or repo root)
            return rel_output(page_url, "index.html")
        if base and not href.startswith(base + "/"):
            return base + href
        return href

    # Resolve against the source file, then map into the output tree.
    anchor = ""
    path_part = href
    if "#" in href:
        path_part, anchor = href.split("#", 1)
        anchor = "#" + anchor

    if path_part == "index.html":
        return rel_output(page_url, "index.html") + anchor

    src_dir = src_file.parent.resolve()
    root = ctx.blog_root.resolve()
    candidates = [src_dir / path_part, root / path_part]

    if path_part.endswith(".md"):
        for cand in candidates:
            if cand.is_file():
                rel = cand.resolve().relative_to(root).as_posix()
                post = ctx.posts_by_rel.get(rel[:-3])
                if post:
                    refs.append(post.rel)
                    return rel_output(page_url, post.url) + anchor
        ctx.warn(f"link target not found: {href!r} in {src_file}")
        return href

    # dino game special case
    cleaned = path_part.lstrip("./")
    if cleaned.startswith("dino/") or cleaned == "dino":
        if cleaned in ("dino", "dino/", "dino/index.html"):
            return rel_output(page_url, "dino/index.html") + anchor

    if path_part.endswith("/"):
        for cand in candidates:
            index_md = cand / "index.md"
            if index_md.is_file():
                rel = index_md.resolve().relative_to(root).as_posix()
                post = ctx.posts_by_rel.get(rel[:-3])
                if post:
                    refs.append(post.rel)
                    return rel_output(page_url, post.url) + anchor
        # folder without its own page -> folder-aware target (each view
        # interprets it: cards filter / tree locate / graph subtree highlight)
        for cand in candidates:
            if cand.is_dir():
                folder_rel = cand.resolve().relative_to(root).as_posix()
                return rel_output(page_url, "index.html") + "#folder=" + folder_rel
        return rel_output(page_url, "index.html") + "#folder=" + path_part.rstrip("/")

    for cand in candidates:
        if cand.is_file() and not cand.is_dir():
            out_rel = resolve_asset_out(cand.resolve(), ctx)
            return rel_output(page_url, out_rel) + anchor

    ctx.warn(f"link target not found: {href!r} in {src_file}")
    return href


def render_markdown(text: str, src_file: Path, page_url: str,
                    ctx: MarkdownContext) -> Rendered:
    """Full pipeline: wiki syntax -> markdown -> link/image rewriting."""
    refs: list = []
    image_sources: list = []
    text = _parse_wiki(text)
    text, block_maths = _extract_block_math(text)
    text = _normalize_lists(text)

    body = _md_instance()
    html = body.reset().convert(text)
    soup = BeautifulSoup(html, "html.parser")

    # task lists: - [x] / - [ ] (python-markdown's extra does not handle them)
    for li in soup.find_all("li"):
        first = li.find(string=True)
        if first is None:
            continue
        m = re.match(r"^\[([ xX])\]\s+", first)
        if not m:
            continue
        checkbox = soup.new_tag(
            "input",
            type="checkbox",
            disabled="disabled",
        )
        if m.group(1).lower() == "x":
            checkbox["checked"] = "checked"
        first.replace_with(first[m.end():])
        li.insert(0, checkbox)
        li["class"] = li.get("class", []) + ["task-list-item"]

    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src.startswith(IMG_TOKEN):
            payload = src[len(IMG_TOKEN):]
            encoded_name, _, encoded_opts = payload.partition("|")
            name = unquote(encoded_name)
            opts = unquote(encoded_opts) if encoded_opts else ""
            found = find_asset(name, src_file, ctx)
            if found is None:
                ctx.warn(f"image not found: ![[{name}]] in {src_file.name}")
                img.decompose()
                continue
            out_rel = resolve_asset_out(found, ctx)
            image_sources.append(found)
            img["src"] = rel_output(page_url, out_rel)
            _apply_image_opts(img, opts)
        elif src.startswith(("http://", "https://", "data:", "blob:")):
            continue
        elif src.startswith("/"):
            base = ctx.base_path
            if base and not src.startswith(base + "/"):
                img["src"] = base + src
        else:
            # relative markdown image path
            cands = [src_file.parent.resolve() / src, ctx.blog_root.resolve() / src]
            for cand in cands:
                if cand.is_file():
                    out_rel = resolve_asset_out(cand.resolve(), ctx)
                    image_sources.append(cand.resolve())
                    img["src"] = rel_output(page_url, out_rel)
                    break
            else:
                ctx.warn(f"image not found: {src!r} in {src_file.name}")

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith(LINK_TOKEN):
            target = unquote(href[len(LINK_TOKEN):])
            anchor = ""
            if "#" in target:
                target, anchor = target.split("#", 1)
                anchor = "#" + _heading_slugify(anchor)
            post = resolve_wiki_post(target, src_file, ctx)
            if post is None:
                ctx.warn(f"wiki link not found: [[{target}]] in {src_file.name}")
                a.name = "span"
                continue
            refs.append(post.rel)
            a["href"] = rel_output(page_url, post.url) + anchor
        else:
            new_href = _rewrite_href(href, src_file, page_url, ctx, refs)
            a["href"] = new_href

    # note-style content writes one `> line` per source line; python-markdown
    # joins consecutive blockquote lines into one paragraph with soft breaks
    # that collapse to spaces. Turn those into <br> so lines stay separate.
    for bq in soup.find_all("blockquote"):
        for p in bq.find_all("p"):
            if not any(
                isinstance(node, str) and "\n" in node
                for node in p.children
            ):
                continue
            rebuilt = []
            for node in list(p.children):
                if isinstance(node, str) and "\n" in node:
                    parts = node.split("\n")
                    for i, part in enumerate(parts):
                        if part:
                            rebuilt.append(part)
                        if i < len(parts) - 1:
                            rebuilt.append(soup.new_tag("br"))
                else:
                    rebuilt.append(node)
            p.clear()
            for node in rebuilt:
                p.append(node)

    # restore `$$...$$` blocks as display math (KaTeX `\[...\]`), regardless
    # of whether they were written on their own lines
    for i, content in enumerate(block_maths):
        token = f"{BLOCK_MATH_TOKEN}{i}"
        div = soup.new_tag("div")
        div["class"] = "arithmatex"
        div.string = "\\[" + content + "\\]"
        p = soup.find("p", string=token)
        if p is not None:
            p.replace_with(div)
            continue
        node = soup.find(string=lambda s: s and token in s)
        if node is None:
            continue
        head, _, tail = node.split(token)
        node.replace_with(div)
        if head:
            div.insert_before(head)
        if tail:
            div.insert_after(tail)

    # keep each fence's language / file label on the <pre> so the front end
    # can show a small tag in the code block header
    for pre, lang in zip(soup.find_all("pre"), _collect_code_langs(text)):
        if lang:
            pre["data-lang"] = lang

    # Obsidian-style callouts: `> [!type] title` -> styled boxes
    _style_callouts(soup)

    # the page's <h1> comes from the template title; demote any in-body H1 so
    # Obsidian-style notes that use `# 第 N 节`-style titles don't duplicate
    # the page title and stay inside the h2/h3 TOC
    for h in soup.find_all("h1"):
        h.name = "h2"

    return Rendered(html=str(soup), refs=refs, image_sources=image_sources)


def resolve_wiki_post(target: str, src_file: Path,
                      ctx: MarkdownContext):
    """Resolve [[target]] to the matching Post (or None)."""
    target = target.strip().replace("\\", "/")
    root = ctx.blog_root.resolve()
    src_dir = src_file.parent.resolve()
    post = None
    if target.endswith(".md"):
        target = target[:-3]
    if "/" in target:
        post = ctx.posts_by_rel.get(target)
    if post is None:
        post = ctx.posts_by_rel.get(target)
    if post is None:
        # same-folder stem match first, then unique stem
        same_folder = [
            p for p in ctx.posts_by_rel.values()
            if p.rel.rsplit("/", 1)[-1] == target and p.rel_dir == src_dir.relative_to(root).as_posix()
        ]
        stem_matches = [
            p for p in ctx.posts_by_rel.values()
            if p.rel.rsplit("/", 1)[-1] == target
        ]
        if same_folder:
            post = same_folder[0]
        elif len(stem_matches) == 1:
            post = stem_matches[0]
    if post is None:
        return None
    return post
