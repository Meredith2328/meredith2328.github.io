---
preview_image: posts/migrated/post-images/reverseChess.png
title: 贴贴棋（reverseChess）介绍
date: 2026-02-26 14:13:45
tags:
- 项目
published: true
hideInList: false
feature: posts/migrated/post-images/reverseChess.png
isTop: false
---
在线游玩：[贴贴棋](https://meredith2328.github.io/reverseChess/)

<!-- more -->

贴贴棋是一个10x10的黑白棋变体小游戏，纯HTML（JavaScript）。最主要的规则如下：

1. （**复制**）如果走到的地方周围三面为空（不考虑移动前的位置，因为总是为空，下同），则任取一面置黑色。
2. （**同化**）如果一面有白棋、两面为空，则将白棋和任意一面空的同时置为黑色。
3. （**保留**）如果两面有白棋、一面为空，则啥也不做。
4. （**被同化**）如果三面有白棋，则踩过去自己变白棋。
5. 如果某方无路可走，或者只剩一个棋子，则游戏结束，确定胜负。

开局黑方有3个棋子、白方有5个棋子，每方需要尽力增加自己的棋子、消灭对方的棋子。
其余介绍看图不言自明。

相关：[[notegotya|识谱练习玩具]]
