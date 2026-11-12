# 功能文档

五个平台（Android、鸿蒙、Windows、Linux、macOS）共用同一套 Rime 引擎与方案生态，**大部分功能是相通的**。这里按功能组织文档：先看功能本身怎么用，再按需要跳到对应平台的安装与设置说明。

::: tip 怎么看平台差异
每个功能页顶部都会标注适用平台。多数页面以 Android 界面为例，鸿蒙 / Windows / Linux / macOS 的入口、设置路径和少数交互会不同；平台专属功能（如触屏键盘调节）只出现在手机平台文档中。
:::

## 功能与平台支持

| 功能 | 说明 | Android | 鸿蒙 | Windows | Linux | macOS |
|------|------|:-------:|:----:|:-------:|:-----:|:-----:|
| [输入方案](/features/input-scheme) | 方案列表、切换、导入与部署 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [词库管理](/features/dictionary) | 用户词典、词条、快捷短语 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [部署方案](/features/deployment) | 修改方案或配置后重新部署 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [剪贴板](/features/clipboard) | 历史、图片、拖拽发送与同步 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [快捷发送](/features/quick-send) | 常用短语收藏与编码触发 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [表情](/features/emoji) | Emoji 面板与分类 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [语音转文本](/features/speech-to-text) | 本地离线识别 / 在线插件 | ✅ | ✅ | ✅ | ✅ | ✅ |
| [扩展商店](/features/extension-store) | 方案、模型、插件下载 | ✅ | — | ✅ | ✅ | ✅ |
| [云备份](/features/cloud-backup) | 配置与数据打包备份 | ✅ | — | ✅ | ✅ | ✅ |
| [计算器](/features/calculator) | 数字键盘 / `=` 前缀计算 | ✅ | — | ✅ | — | — |
| [智能联想](/features/smart-prediction) | 模型预测联想词 | ✅ | ✅ | — | — | — |
| [智能纠错](/features/correction) | 相邻键纠错候选 | ✅ | ✅ | — | — | — |
| [手写输入](/features/handwriting) | 手写识别与反查 | ✅ | — | — | — | — |
| [键盘调节](/features/keyboard-adjustment) | 触屏键盘高度与边距 | ✅ | ✅ | — | — | — |
| [悬浮键盘](/features/floating-keyboard) | 可拖动的悬浮键盘 | ✅ | ✅ | — | — | — |
| [工具栏自定义](/features/toolbar) | 候选栏工具栏按钮 | ✅ | ✅ | — | — | — |
| [键盘配置](/features/keyboard-config-v2) | 自定义按键布局与手势 | ✅ | — | — | — | — |
| [按键外观](/features/keyboard-appearance) | 单键圆角与背景色 | ✅ | ✅ | — | — | — |
| [设备互联](/device-link/) | 局域网直连同步剪贴板 | ✅ | ✅ | ✅（ximed） | 🧪 开发中 | ✅ |
| [插件](/plugins/) | 插件安装、开发与测试 | ✅ | — | ✅ | ✅ | ✅ |

> ✅ = 有对应功能；— = 当前版本无此入口；🧪 = 开发中。表格按当前文档收录情况整理，未列出的平台能力可能尚未验证。

## 按平台开始

功能能通用，但**安装、启用、设置程序和数据目录是按平台分开的**：

- **Android（曦码）**：[使用文档](/mobile/usage) · [常见问题](/mobile/faq)
- **鸿蒙（HarmonyOS）**：[总览与安装](/harmony/install) · [使用与设置](/harmony/usage) · [常见问题](/harmony/faq)
- **Windows（曦码·曜）**：[总览与安装](/pc/usage) · [常见问题](/pc/faq)
- **Linux（曦码·澈）**：[总览与安装](/ximeche/install) · [使用与设置](/ximeche/usage) · [常见问题](/ximeche/faq)
- **macOS（曦码·逸）**：[总览与安装](/ximeyi/install) · [使用与设置](/ximeyi/usage) · [常见问题](/ximeyi/faq)

## 手机端专属

触屏键盘带来一组桌面端没有的能力，这些页面只在手机平台（Android / 鸿蒙）维护：

- [键盘调节](/features/keyboard-adjustment) — 键盘高度、左右边距、横竖屏
- [悬浮键盘](/features/floating-keyboard) — 悬浮模式与拖动
- [工具栏自定义](/features/toolbar) — 候选栏按钮
- [键盘配置（新版）](/features/keyboard-config-v2) — 按键布局、手势与功能键（仅 Android）
- [按键外观](/features/keyboard-appearance) — 单键圆角与背景色
- [手写输入](/features/handwriting) — 手写识别模型（仅 Android）
- [智能联想](/features/smart-prediction) / [智能纠错](/features/correction)

> 这些页面的配置写在 `xime.custom.yaml` 或方案配置中，桌面端不会读取手机键盘的布局配置。鸿蒙版与 Android 版在这些能力上并非完全对齐，差异见[鸿蒙使用与设置](/harmony/usage)。

## 同步与互联

- [云备份](/features/cloud-backup) — 通过备份插件把配置与数据打包到云端
- [设备互联](/device-link/) — 同一局域网内手机与电脑直连同步剪贴板
- [WebDAV 同步（已移除）](/features/webdav-sync) — 旧版 Android 功能说明，仅供升级用户查阅
