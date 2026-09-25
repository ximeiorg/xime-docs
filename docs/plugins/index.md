# Xime 插件

Xime 的插件为 **TypeScript 脚本插件**（由 `xipm` 编译为单文件 JavaScript，在 QuickJS 沙箱运行），以 `.xipk`（zip）格式分发，随 Xime v3.0.0+ 使用。插件可通过「扩展商店」在线安装，或从本地文件导入。

## 插件类型

| 类型 | 分组 | 说明 | 示例 |
|------|------|------|------|
| `emoji` | 表情 | 表情/颜文字/贴纸（数据由宿主渲染） | 颜文字、恶搞兔 |
| `tool` | 工具 | 工具栏面板类功能 | AI 回复、AI 帮写、千问翻译、常用语、输入统计 |
| `speech` | 语音转文本 | 在线语音识别后端 | 阿里百炼 FunAsr、火山引擎、腾讯云 |
| `clipboard_sync` | 剪贴板同步 | 多设备剪贴板同步 | WebDAV 剪贴板同步、Ximed 剪贴板同步 |
| `backup` | 备份 | 云备份传输协议 | WebDAV 云备份 |

部分插件随 APK 内置（如颜文字、恶搞兔、火山引擎等），安装后即可在插件管理中使用；其余可在「扩展商店 → 插件」中下载。

> 完整的在线插件清单以 [插件列表](/plugin-list) 页面（动态加载自插件索引）和「扩展商店 → 插件」为准。各插件源码见 [GitHub `plugins/`](https://github.com/ximeiorg/Xime/tree/main/plugins)。

## 安装插件

1. 打开「扩展商店」（设置 → 扩展 → 扩展商店）→「插件」标签页
2. 浏览并选择插件，点击下载安装
3. 或在「插件管理」中点击「从文件安装插件」，选择 `.xipk` 文件导入
4. 安装后在「插件管理」中启用插件（第三方插件首次启用需确认）

## 开发自己的插件

插件源码为 TypeScript 模块（`definePlugin` + `export default`），由 `xipm` 编译打包，无需 Android SDK。

- 想动手：看 [插件开发教程](./PLUGIN_DEV_TUTORIAL)（从零写第一个插件 → 测试 → 打包 → 热调试）
- 查字段与接口：[插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE)
