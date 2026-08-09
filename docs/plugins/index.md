# Xime 插件

Xime 的插件为 **Lua 脚本插件**，以 `.xipk`（zip）格式分发，随 Xime v2.6.0+ 使用。插件可通过「扩展商店」在线安装，或从本地文件导入。

## 内置插件

以下插件随 Xime APK 内置，启用输入法后即可在插件管理中使用（无需单独安装）：

### Kaomoji（颜文字）

**版本：** 2.1.0

**说明：** 预定义颜文字表情包，包含 174 个常用日式颜文字如 `(^_^)`、`(T_T)`、`(≧▽≦)`，支持按文本搜索。

**源码：** [GitHub](https://github.com/ximeiorg/Xime/tree/main/plugins/kaomoji)

---

### Meme Bunny（恶搞兔）

**版本：** 2.1.0

**说明：** 恶搞兔表情包，从 `resources/emojis/` 加载表情图片，插入文本为 `[表情<文件名>]`。

**源码：** [GitHub](https://github.com/ximeiorg/Xime/tree/main/plugins/meme-bunny)

---

### Volc ASR（火山引擎语音识别）

**版本：** 1.0.0

**说明：** 火山引擎（火山方舟）WebSocket 流式语音识别，二进制协议 + gzip 压缩，支持中间结果。安装后在「设置 → 语音转文本」中配置 API Key 并选择使用。

**源码：** [GitHub](https://github.com/ximeiorg/Xime/tree/main/plugins/volc-asr)

---

## 在线插件

### FunAsr（阿里百炼语音识别）

**版本：** 1.1.0

**说明：** 阿里百炼 FunAsr 在线语音识别（WebSocket 流式，自带标点，高准确率）。可在「扩展商店 → 插件」中下载，安装后在「设置 → 语音转文本」中配置 API Key 并选择使用。

**源码：** [GitHub](https://github.com/ximeiorg/Xime/tree/main/plugins/funasr-asr)

---

## 安装插件

1. 打开「扩展商店」（设置 → 扩展 → 扩展商店）→「插件」标签页
2. 浏览并选择插件，点击下载安装
3. 或在「插件管理」中点击「从文件安装插件」，选择 `.xipk` 文件导入
4. 安装后在「插件管理」中启用插件（第三方插件首次启用需确认）

## 开发自己的插件

插件为纯 Lua 脚本，无需编译。查看 [插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE) 了解如何开发。
