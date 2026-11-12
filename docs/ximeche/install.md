# 总览与安装

曦码·澈（XimeChe）是 Xime 的 **Linux 桌面版输入法**。它用 Rust 编写，不依赖 ibus 或 fcitx，直接对接 KDE（KWin）的 Wayland 输入法协议和 librime 引擎。

它与手机版、Windows 桌面版（曦码·曜）是三个独立产品：界面、设置程序、数据目录都不相同，但共用 Rime 的方案与词典格式。

> **Beta 预览**：当前版本面向 KDE Plasma 的 Wayland 会话，部分功能仍在完善。只支持 KDE，不支持 GNOME，也不支持 X11 会话。使用前请先备份 `~/.config/xime`。

## 与其它版本的区别

| 版本 | 平台 | 输入方式 |
|------|------|----------|
| 曦码（手机版） | Android | Android 输入法服务 |
| 曦码·曜（桌面版） | Windows | TSF 输入法框架 |
| 曦码·澈（Linux） | KDE Plasma（Wayland） | `zwp_input_method_v1` 虚拟键盘 |

三者的设置与用户数据不共用；Rime 方案包、词典格式是通用的，可以在不同版本之间导入导出。

## 主要特性

- **原生 Wayland 输入法**：直接作为 KWin 的虚拟键盘运行，不需要 ibus / fcitx 中转
- **librime 引擎**：复用 Rime 的方案、词库与用户词典
- **自带方案**：五笔 86/98、五笔拼音、九键拼音、简体拼音、简入繁出、大写数字等
- **自绘候选窗**：纯 Rust 渲染（tiny-skia + cosmic-text），支持编码提示、候选高亮、字根反查
- **托盘常驻**：中英状态、方案切换、语音输入、重新部署、退出
- **设置程序**：输入方案、词典、外观、快捷键、扩展商店、插件、语音、剪贴板、备份
- **剪贴板能力**：历史、快捷发送、表情、符号面板，点击即可上屏
- **本地语音输入**：下载模型后离线识别，默认快捷键 `Ctrl+Alt+V`
- **多发行版打包**：deb、rpm、Arch 包、通用 tar.gz

## 系统要求

- **KDE Plasma 的 Wayland 会话**（KWin）。X11 会话不支持。
- **不支持 GNOME**。项目明确只面向 KDE，其他桌面环境请勿尝试。
- 运行库：`librime`、`libxkbcommon`、`libwayland-client`、DBus、`hicolor-icon-theme` 等；安装包会声明依赖。
- 官方二进制为 x86_64；其他架构需要从源码编译。
- 仅对 Wayland 应用生效，X11 应用不经过这条输入法链路。

> 登录时请在登录界面选择「Plasma（Wayland）」，不要选 X11。

## 下载与安装

前往 [XimeChe Releases](https://github.com/ximeiorg/XimeChe/releases) 下载对应发行版的安装包。

<PlatTabs :labels="['Debian / Ubuntu', 'Fedora / openSUSE', 'Arch', '通用 tar.gz']">
  <template #tab0>

```bash
sudo apt install ./xime_*_amd64.deb
```

deb 包在 Ubuntu 24.04 环境构建，要求 **Ubuntu 24.04+ / Debian 13+**（glibc 2.39+）。更老的发行版需要自行编译。

  </template>
  <template #tab1>

```bash
# Fedora / RHEL
sudo dnf install ./xime-*.rpm

# openSUSE
sudo zypper install ./xime-*.rpm
```

  </template>
  <template #tab2>

```bash
sudo pacman -U xime-*.pkg.tar.zst
```

Release 同时提供 `xime-<版本>-aur.tar.gz`，其中是版本号已经对好的 `PKGBUILD`、`.SRCINFO` 与安装钩子，便于提交 AUR 或本地构建。

  </template>
  <template #tab3>

```bash
sudo tar -C / -xzf xime-*-x86_64-linux.tar.gz
```

压缩包解开就是 `/usr` 下的安装布局，适合没有对应包格式的发行版。

  </template>
</PlatTabs>

## 在 KDE 中启用

安装后需要把 KWin 的虚拟键盘指向 Xime，然后重新登录。**KWin 只在启动时装配虚拟键盘，改完必须注销重登**（或重启）。

### 方式一：系统设置

打开 **系统设置** 中的 **虚拟键盘** 项（通常在「输入设备」分类下，不同 Plasma 版本位置略有差异），选择 **Xime Wayland 启动器**（英文界面为 `Xime Wayland Launcher`）。

### 方式二：命令行

```bash
kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboard xime-launcher.desktop
kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboardEnabled true
qdbus6 org.kde.KWin /KWin reconfigure
```

Plasma 5 使用 `kwriteconfig5` / `qdbus`，参数相同。

重新登录后，在任意输入框点击，候选窗应出现在光标附近，系统托盘出现 **ZH / EN** 图标。如果没出现，见[常见问题](/ximeche/faq)。

### 打开设置

- 托盘右键 → **设置...**
- 或在终端运行 `xime-setup`
- 或在应用菜单中搜索「曦码·澈设置」

## 首次启动与数据目录

首次运行时，daemon 会把随包方案数据复制到用户目录，并创建默认配置。

| 路径 | 内容 |
|------|------|
| `~/.config/xime/` | 配置根目录 |
| `~/.config/xime/rime/` | Rime 方案源文件、用户配置、`build/` 部署产物、用户词典 |
| `~/.config/xime/xime.custom.yaml` | 外观与行为自定义 |
| `~/.config/xime/clipboard.db` | 剪贴板历史与快捷发送 |
| `~/.config/xime/plugins/` | 已安装插件 |
| `~/.config/xime/models/` | 语音等本地模型 |
| `~/.config/xime/p2p/` | 设备关联的身份与配对表（开发中） |
| `~/.config/xime/xime.log.YYYY-MM-DD` | 按天轮转的运行日志 |
| `/usr/share/xime/` | 随包资源：方案种子、图标、语音运行库 |

开发安装时，随包资源在 `~/.local/share/xime/`。

方案数据首次会从 `/usr/share/xime/rime-data` 复制到 `~/.config/xime/rime/`。之后修改方案或配置，需要在托盘菜单点「重新部署」或在设置程序点「部署方案」。

## 更新与卸载

- **更新**：用包管理器安装新版本即可；用户配置与词典保留。
- **卸载**：用包管理器移除软件包。开发安装可运行仓库中的 `uninstall.sh`。
- **清理配置**：确认不再需要后，删除 `~/.config/xime`。这一步会丢失方案、词典、剪贴板与配对信息。
- **还原虚拟键盘**：卸载后如果 KWin 仍指向 Xime，请把 `kwinrc` 的 `[Wayland] VirtualKeyboard` 清空或改回其他输入法，然后重新登录。

```bash
kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboard ""
```

## 已知限制

- 仅支持 KDE Plasma 的 Wayland 会话；GNOME、X11 均不支持。
- 仅对 Wayland 应用生效。
- 项目处于 Beta 预览，界面和功能可能随版本变化。
- 部分终端应用中 `Ctrl+C` / `Ctrl+X` 可能不生效（Wayland 修饰键转发的已知限制）。
- 设备关联/设备互传仍在开发，暂不作为稳定功能（见[使用与设置](/ximeche/usage#设备互传-开发中)）。
- 未提供 Flatpak / Snap / Nix 包：输入法守护进程必须作为 KWin 的虚拟键盘客户端运行，沙箱环境拿不到 `WAYLAND_SOCKET`。

下一步可以看[使用与设置](/ximeche/usage)，或直接查[常见问题](/ximeche/faq)。
