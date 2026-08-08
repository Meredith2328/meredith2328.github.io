---
title: 夏夜将终：一个乐队官网的诞生
date: 2026-07-16
tags:
- 奇怪的东西
preview: 2026 年夏末，因为夜鹿（ヨルシカ）走到一起的校园乐队「夏夜将终」，把官网复刻成了 Yorushika 官网的样子。
---

# 夏夜将终：一个乐队官网的诞生

2023 年夏末，几个学生因为夜鹿（ヨルシカ / Yorushika）走到了一起，组了一支校园乐队，名字叫「夏夜将终」。

后来，他们给自己做了一个 [夏夜将终 OFFICIAL SITE](https://meredith2328.github.io/xyjz/) 。就像是 [ヨルシカ OFFICIAL SITE](https://yorushika.com/) 一样。

所有内容（简介、作品、演出、歌词……）都统一在 [Meredith2328/xyjz](https://github.com/Meredith2328/xyjz) 的 `content/` 文件夹里的 `.md` 文件里：

```text
content/
├── band.md      # 乐队简介、成员
├── works.md     # 翻唱作品
├── shows.md     # 演出
├── site.md      # 站点名、配色、B站账号
└── lyrics/      # 歌词，一首一个文件
```

改完推送，GitHub 的自动化流程会自动把 Markdown 编译成网站数据，然后直接上线。

内容与展示分离、自动化构建和部署。

更新内容时，只需要改这里的 Markdown 就行。

ps. 向梦幻般绚烂的乐队生活致敬。

> 所以夏夜其实还不会结束——
