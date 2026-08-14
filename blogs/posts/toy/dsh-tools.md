---
title: DSH 上线之后我做的几个小工具
date: 2026-08-14
tags:
- 项目
published: true
hideInList: false
---

DSH 上线之后陆陆续续折腾了几个小工具，都是自己用着顺手的东西，整理一下放在这里。

<!-- more -->

## dsh-sticky-note：便签

[github.com/Meredith2328/dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note)

左下角便签：随手记点子/感想/TODO，实时保存到归档目录，清单+悬浮归档。

功能大概是：Markdown 预览、一套编辑快捷键、草稿复用（继续写同一个文件）、一键发送到对话、历史便签查看/编辑/归档、标记保留防止自动清除。存储是按 点子/感想/TODO/归档 四个子目录分类的 md 文件，落在本地目录里，路径可以在设置里改。

做的时候比较在意的小交互（都是自己提的需求）：

- 单机历史条目 = 预备发送，双击 = 查看；
- 状态只在标题右边浅浅地显示一下，不要弹个胶囊出来；
- 打开目录的按钮只要个图标，不要那三个字。

## dsh-sidebar-mode：把模式切换塞进「新会话」按钮

[github.com/Meredith2328/dsh-sidebar-mode](https://github.com/Meredith2328/dsh-sidebar-mode)

把默认的四种模式切换塞进「新会话」按钮里，新会话创建更方便。

![示意图：新会话按钮内嵌预设标签，点击弹出预设菜单](posts/migrated/post-images/dsh-sidebar-mode.png)

点「新会话」按钮里最左边的小字就弹出预设菜单（标准 / PTC / 创造 / 极简，当前项打勾），点选即切换，跟设置里的「Agent 预设」双向同步，新会话页的徽章也跟着变。

## dsh-hotkey：Alt+Space 唤起 DSH

[github.com/Meredith2328/dsh-hotkey](https://github.com/Meredith2328/dsh-hotkey)

Alt+Space 一键唤起 / 最小化 DeepSeek Harness 的零依赖 Windows 小工具：按一下把最小化的 DSH 窗口唤起并置顶，再按一下最小化，找不到窗口就自动打开 DSH 地址。

为什么是独立小工具，而不是 skill / MCP / 插件：

- skill 只是一份给 Agent 的指令文本，不能常驻监听按键。
- MCP / Cordis 插件跑在 Harness 自己的进程或页面里，管不到窗口的最小化 / 恢复，更注册不了操作系统级全局热键。
- 全局热键 + 窗口管理必须由 OS 层的常驻进程来做，所以最合适的形式就是一个极小的 Windows 可执行程序（C# 编译，无需安装任何运行时）。

## 顺带记一下 DSH 的四种模式

DSH四种模式省流：

- 标准模式：随便用
- PTC模式：用于需要读一堆文件的场景，比如一个大的代码库，或者很多资料文件
- 极简模式：不说了
- 创造模式：适用于你想改造DSH，例如自己折腾插件等等。我觉得满足折腾需求的比例更多，对开发使用的助益取决于你的折腾的投入产出是否适合你自己
