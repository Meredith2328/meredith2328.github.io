# AGENTS.md

本仓库是 pilog 静态博客：Markdown 内容在 `blogs/`，构建输出在 `docs/`。

- 项目介绍：README.md
- API / 配置项文档：posts/toy/pilog-blog（内容保持克制；新增 API 或配置项时直接追加到已有表格行之后）
- 运行 Python 一律使用此解释器（依赖已装齐，系统 python 缺依赖）：`C:\Software\Miniconda\envs\moni\python.exe`（Git Bash 中为 `/c/Software/Miniconda/envs/moni/python.exe`），构建/测试/发布命令均以此为准
- 构建：`python pilog.py build`；本地预览：`python pilog.py serve --watch`
- 测试：改动构建或渲染后至少运行 `python tests/test_dom.py` 与 `python tests/test_features.py`
- 提交：`git add -A && git commit`；发布：`python pilog.py publish -m "..."`（令牌只放本地 `.publish-token*`，绝不可提交）
