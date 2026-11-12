# 总览与安装

曦码·逸（XimeYi）是 Xime 的 **macOS 输入法**。它用 Rust 编写，采用「引擎与 UI 分离」的结构：核心输入引擎是 [librime](https://github.com/rime/librime)（通过 Rust 绑定调用），平台适配层通过 `objc2-input-method-kit` 对接 macOS 的 InputMethodKit，候选窗是自绘的 `NSPanel`。

它与其他版本是相互独立的产品：界面、设置程序、数据目录都不相同，但共用 Rime 的方案与词典格式，剪贴板同步与备份也走同一套插件与 P2P 协议。

> **内测中**：核心输入闭环、候选窗、面板、设置程序都已可用，安装包与沙箱签名尚未完成。**暂未公开发布，也没有可直接下载的安装包**，本章的安装步骤面向自行构建与本地试用。

## 与其它版本的区别

| 版本 | 平台 | 输入方式 |
|------|------|----------|
| 曦码（手机版） | Android | Android 输入法服务 |
| 曦码鸿蒙版 | HarmonyOS | 输入法扩展（`InputMethodExtensionAbility`） |
| 曦码·曜（桌面版） | Windows | TSF 输入法框架 |
| 曦码·澈（Linux） | KDE Plasma（Wayland） | `zwp_input_method_v1` 虚拟键盘 |
| 曦码·逸（macOS） | macOS | InputMethodKit |

## 主要特性

- **librime 引擎**：与桌面版同一套引擎与 `libximecore` 依赖，方案、词典、用户词典完全兼容
- **自带方案**：五笔 86 / 98、五笔·拼音、五笔·繁体（含拼音）、拼音·简体、九键拼音、数字
- **自绘候选窗**：纯 Rust + AppKit 绘制，光标跟随、数字选词、翻页、点击选词，编码提示与候选样式走 `xime.config` 的 `style` 段
- **菜单面板**：候选窗右侧菜单按钮打开面板，含剪贴板、快捷发送、表情、符号、语音输入与设置入口
- **键盘行为对齐 Squirrel**：Command 组合键透传、Shift 大小写、Caps Lock、修饰键先抬后按的缓冲策略都与官方 rime 前端一致
- **设置程序**：内嵌在 App 里的独立设置应用（`XimeYiSettings.app`），界面与 Windows / Linux 共用同一份 `xime-setup` 代码
- **插件运行时**：对齐 Android 3.0 的 QuickJS 插件体系，可安装表情包、符号、同步类插件
- **剪贴板同步**：局域网 P2P 直连与插件通道，支持 `auto` 自动切换（P2P 优先、插件兜底）
- **同步与备份**：WebDAV 打包备份配置、方案、词典与用户词库
- **语音输入**：本地模型离线识别

## 系统要求

- **macOS**（Apple Silicon 与 Intel 均可本地编译，官方未提供通用包）
- **Xcode 命令行工具**（`xcode-select --install`），链接 C++ 与 ObjC 框架需要
- **Rust 工具链**（`edition 2024`，建议用当前的 stable）
- **librime 动态库**：默认取本地 `libximecore` 的编译产物（`$RIME_LIB_DIR` 指向 `librime/dist/lib`）

## 获取源码与构建

源码当前未公开。下面假设你已拿到完整仓库。

```bash
# 1. 构建输入法与设置程序，并组装自包含的 .app
./scripts/build-app.sh release
```

脚本会做三件事：

1. `cargo build --release -p ximeyi-ime -p ximeyi-setup`
2. 把 `librime`、`yaml-cpp`、`leveldb`、`snappy`、`opencc`、`marisa` 等 dylib 拷进 `Contents/Frameworks`，并把 rpath 重写成 `@rpath`
3. 组装 `dist/XimeYi.app` 并做 **ad-hoc 签名**（`codesign --sign -`）

产物：

```
dist/XimeYi.app
├── Contents/MacOS/XimeYi                        # 输入法本体（LSUIElement，无 Dock 图标）
├── Contents/MacOS/XimeYiSettings.app            # 嵌套的设置程序
├── Contents/Frameworks/*.dylib                  # 运行库
└── Contents/SharedSupport/rime/                 # 随包方案与词典
```

> 本地有 `libximecore` 仓库时，脚本还会顺带构建 `xime-sync-server` 并打包进设置程序，用于剪贴板同步的插件通道；没有则回退到 `~/.local/bin` 或 `PATH` 里查找。

## 安装与启用

```bash
# 构建 + 安装到 ~/Library/Input Methods/ + 签名校验 + 输入源去重
./scripts/install-app.sh
```

脚本会依次：构建 → 关掉正在运行的旧进程 → `ditto` 到 `~/Library/Input Methods/XimeYi.app` → `codesign --force --deep --sign -` → 运行 `scripts/fix-input-sources.sh` 做输入源去重（见下）。

然后手动添加输入法：

1. 打开 **系统设置 → 键盘 → 输入法**（macOS 15 起是 **键盘 → 文本输入 → 输入法**）
2. 点「+」或「编辑…」，在「中文（简体）」分类下找到 **曦码·逸输入法** 并添加
3. 菜单栏出现输入法图标，切换到「曦码·逸输入法」即可打字

**列表里没有它 / 出现多份同名输入法**：

```bash
./scripts/install-app.sh --refresh      # 刷新菜单栏（只重启 TextInputMenuAgent）
./scripts/fix-input-sources.sh --check  # 只诊断输入源重复注册
```

仍未出现时注销并重新登录一次。同名多行是 HIToolbox 同时持有新旧两份输入源列表导致的已知问题，`fix-input-sources.sh` 会做规范化。

## 首次启动与数据目录

首次切换到这个输入法时，它会把随包方案部署到用户目录。

| 路径 | 内容 |
|------|------|
| `~/Library/Application Support/XimeYi/rime/` | 用户数据根目录：方案源文件、用户配置、`build/` 部署产物、用户词典 |
| `~/Library/Application Support/XimeYi/ximeyi.log` | 运行日志（追加写） |
| `<XimeYi.app>/Contents/SharedSupport/rime/` | 随包方案与词典（只读，升级时被替换） |

- 修改方案或 `*.custom.yaml` 后需要在设置程序里「部署」，或重启输入法进程。
- 用户数据目录与 App 包分离，覆盖安装新版本不会丢方案和词典。
- 剪贴板历史与快捷发送由设置程序统一管理，只保存在本机，不上传。

## 更新与卸载

- **更新**：重跑 `./scripts/install-app.sh`，它会先杀掉旧进程再整包替换；用户数据保留。
- **卸载**：

  ```bash
  rm -rf "$HOME/Library/Input Methods/XimeYi.app"
  ```

  卸载后如果输入法菜单里还有残留项，注销重登，或 `./scripts/fix-input-sources.sh` 清理注册表。
- **彻底清理**：确认不再需要后删除 `~/Library/Application Support/XimeYi`，这会丢失方案、用户词典、剪贴板与设备配对信息。

## 已知限制

- **没有安装包**：暂未提供 `.dmg` / `.pkg` 安装器，只能从源码构建后用脚本安装。
- **ad-hoc 签名**：未做正式签名与公证，首次打开系统可能提示「无法验证开发者」，需在「隐私与安全性」里放行。
- **未启用 App Sandbox**：沙箱权限（含 `NSConnection` 例外）仍在计划中，当前版本与 `~/.local/bin`、插件进程的交互不加沙箱约束。
- **功能仍在补齐**：候选注释（五笔编码提示）、候选窗横向布局与字号配色、快捷发送编码命中候选栏等尚未完成；界面与行为可能随版本变化。
- **首次部署需要等待**：方案与词典编译在首次启动时进行，方案较多时会有一小段时间只有一个候选。

下一步可以看[使用与设置](/ximeyi/usage)，或直接查[常见问题](/ximeyi/faq)。
