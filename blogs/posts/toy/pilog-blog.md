---
title: 用 pilog 搭建像素风博客
date: 2026-07-30
tags:
- 项目
highlight: true
preview: 一套个人自制的轻量静态博客框架：所有东西都可以用Markdown修改。 读取 `blogs/` 目录下的 Markdown，生成卡片 / 清单 / 图谱三种视图，Chrome小恐龙风格。
preview_image: assets/cover-pixel.png
---

# 用 pilog 搭建像素风博客

**pilog** 是个人自制的**所见即所得**的超轻量静态博客生成器。

只需要在 Obsidian 里打开  `blogs/` 目录写 Markdown，然后可以这么用：

- `python pilog.py build` ：构建成带三种视图的静态站点。

- `python pilog.py serve --watch` ：本地预览并打开**控制台**（想改哪里点哪里）。

pilog没有数据库、没有后端，只有一个个 Markdown 文件和一个负责构建的脚本。

## 三种视图

**pilog** 生成的页面顶端可以切换三种视图，它们描述的是同一棵内容树：

1. **卡片视图** — 每条博客以卡片形式预览，右侧或整体是缩放后的预览图；
2. **清单视图** — 以类似 Windows 文件树的层级结构展示全部博客；
3. **图谱视图** — 以关系图谱展示目录层级与文章之间的引用关系，右上角提供缩放滑条、方向键平移与一键回到中心节点。

在三种视图的右下角，还有一个完全还原的小恐龙游戏。
## 用 Obsidian 管理文章仓库

**pilog** 不想做第二个 Obsidian/Typora/... ，而只是额外给它们写好的东西造一个网站。

把 `blogs/` 目录直接作为 Obsidian 仓库打开，就能获得双向链接、图谱视图等本地能力。
- 文章引用：额外支持Obsidian式的 `[[另一篇文章]]` 写法。
- 图片引用：额外支持 `![[图片名.png]]` 写法，推荐在控制台中将 pilog 的附件默认保存位置和 Obsidian 的设置保持一致，例如 `assets` 。
- 提示框：`> [!note] 标题` 这类 Obsidian callout 会渲染成彩色提示框（支持 note / warning / example / tip / danger / question 等类型）。

比如以下是图片引用的经典写法：

`![像素封面](assets/cover-pixel.png)`
![像素封面](assets/cover-pixel.png)

以下是图片引用的Obsidian式语法。
当然，我们把 Obsidian 的全局引用与宽度控制也带过来了：

`![[cover-pixel.png|240]]`
![[cover-pixel.png|240]]
## pilog 额外提供的便利

除了基础 Markdown，pilog 还提供下面这些开箱即用的能力。它们都可以在工作台里可视化配置，也可以直接改文件。

### 一篇文章能配置什么（front matter）

在文章开头的 `---` 之间可以写以下字段，全部可省略：

| 字段 | 类型 | 作用 | 缺省行为 |
| --- | --- | --- | --- |
| `title` | str | 文章标题 | 取正文第一个标题，再没有则用文件名 |
| `date` | str | 发布日期，如 `2026-07-01` | 取文件修改时间 |
| `tags` | list/str | 标签，如 `[pilog, meta]` 或 `pilog, meta` | 无标签 |
| `preview` | str | 卡片视图的预览文本，支持 Markdown | 自动截取正文（跳过标题与代码块） |
| `preview_image` | str | 封面图路径；GIF 会保留动画 | 用正文第一张图 |
| `pin` | bool | 置顶，只影响卡片视图 | false |
| `highlight` | bool | 高亮：三种视图都加黄色描边 | false |
| `hidden`（兼容迁移来的 `hideInList`） | bool | 隐藏：文件保留在仓库、可继续编辑，但不生成页面、不发布 | false |
| `draft` | bool | 草稿：完全不进入构建 | false |
| `feature` | bool/str | 全局封面：卡片整卡显示封面并调浅，文章顶部显示不调浅的原图头图；也可以直接写图片路径 | 关 |
| `order` | number | 手动排序（置顶组内、日期之前） | 按日期 |
| `chapters_per_page` | int | 超长文章按章节分页：正文按标题切成章节，同一链接下客户端切换，每页同时显示 N 章 | 不分页 |

```yaml
---
title: 我的文章
date: 2026-07-01
tags: [随笔]
preview: 一句话介绍这篇文章。
preview_image: assets/封面.png
pin: false
highlight: true
feature: true
---
```

### 站点级配置（config.json / 工作台「配置」页）

| 配置 | 作用 |
| --- | --- |
| `title` / `subtitle` / `author` / `footer_text` | 站点名称、副标题、作者、页脚文字 |
| `blog_dir` / `out_dir` | 内容目录与构建输出目录 |
| `base_path` / `site_url` | 部署子路径与线上绝对地址（改这两个就能整体搬走） |
| `default_view` | 首页默认视图：卡片 / 清单 / 图谱 |
| `cards_per_page` | 卡片视图每页数量 |
| `collapse_threshold` | 文章多时目录 / 图谱的默认折叠阈值 |
| `use_google_fonts` | 是否加载自托管字体（Inter + JetBrains Mono，woff2 已随仓库分发） |
| `show_dino` | 右下角小恐龙游戏开关 |
| `socials` | 社交账号图标：GitHub / X / Bilibili / 微博 / 邮箱 / RSS |
| `giscus` | 评论（GitHub Discussions 驱动） |
| `publish` | 发布目标：仓库、分支、令牌文件 |

### 工作台

`python pilog.py serve --watch` 后打开 `http://127.0.0.1:8000/manager`：

- 所见即所得：替换头图 / 背景、增删改导航、拖拽卡片排序、双击任意文章编辑、把图片拖到卡片右侧设为封面；
- 文件管理：拖入图片（可裁剪、缩放、旋转、加文字、画笔），拖入 Markdown 或整个文件夹（自动解析图片与文章引用，缺失项列出由你决定保留还是移除）；
- 撤销 / 重做 + 变更记录（显示每次操作改动了哪些本地文件）；
- 配置页：上述站点配置、发布到 GitHub、一键恢复默认；Ctrl+S 保存。

### 命令行

- `python pilog.py build` —— 构建站点；
- `python pilog.py serve --watch` —— 本地预览 + 自动重建；
- `python pilog.py list` —— 列出文章（`--json` 输出结构化数据）；
- `python pilog.py import 路径... --dir 目标目录` —— 批量导入 Markdown / 图片 / 整个目录；
- `python pilog.py delete 文章rel` —— 删除文章；
- `python pilog.py publish -m "说明"` —— 构建 → 提交 → 推送。

### 发布与评论

- `publish` 使用 fine-grained token（只需 Contents: Read and write），只做 add / commit / push，绝不执行删除操作；令牌只保存在本地 gitignore 的文件里，不会进仓库；
- 评论由 giscus 驱动（GitHub Discussions），配置 `giscus` 段即可；
- 自动生成 RSS。

## 经典Markdown语法备查

| 语法 | 效果 |
| --- | --- |
| `**加粗**` | **加粗** |
| `*斜体*` | *斜体* |
| `` `行内代码` `` | `行内代码` |
| `~~删除线~~` | ~~删除线~~ |

- 无序列表项
- 另一项
  - 嵌套项

1. 有序列表
2. 第二项

> 引用块用来引用他人观点[^1]。

[^1]: 脚注内容会显示在页面底部。

行内公式用单个 `$` 包裹：$E = mc^2$。

整行公式用双 `$` 包裹，由 KaTeX 渲染：

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

任务列表：

- [x] 已完成的
- [ ] 待办事项

## 断网小恐龙，入住博客角落

主页右下角藏着一只 Chrome 断网页小恐龙。点开它，就可以在写博客的间隙跑两步：

- `空格` / `↑`：跳跃
- `↓`：下蹲（空中可急降）
- `Enter`：重新开始

游戏整体复刻了 Chromium 官方的像素配色与手感，也定义了本站的视觉语言：灰白底、锐利直角、没有多余的圆角。

想直接玩，点这里：[开始游戏](dino/index.html)。

相关：[[10pi|玩具箱索引]]
