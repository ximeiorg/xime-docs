# 常见问题

## 支持哪些桌面环境？

只支持 **KDE Plasma 的 Wayland 会话**（KWin）。不支持 GNOME，也不支持 X11 会话。

曦码·澈是一个独立的 Wayland 输入法客户端，靠 KWin 的虚拟键盘机制启动；GNOME 和其他合成器没有对应的接入方式。登录时请选择「Plasma（Wayland）」。

## 安装后在 KDE 里找不到或启用不了？

按顺序检查：

1. **确认是 Wayland 会话**：`echo $XDG_SESSION_TYPE` 应输出 `wayland`。
2. **设置虚拟键盘**：系统设置中的「虚拟键盘」项，选择「Xime Wayland 启动器」。
3. 或用命令行：

   ```bash
   kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboard xime-launcher.desktop
   kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboardEnabled true
   qdbus6 org.kde.KWin /KWin reconfigure
   ```

4. **注销并重新登录**。KWin 只在启动时装配虚拟键盘，改完不重登通常不生效。
5. 确认 daemon 在运行：`pgrep -a xime-daemon`。

## 打字没有候选窗 / 输入没反应？

- 确认当前应用是 **Wayland 应用**；X11 应用不经过这条输入法链路。
- 确认 KWin 的虚拟键盘已设为 Xime，并已重新登录。
- 确认没有同时启用 ibus / fcitx 的 Wayland 虚拟键盘；KWin 同一时间只应有一个。
- 看日志：`~/.config/xime/xime.log.*`，末尾通常有连接或按键处理失败的原因。
- 如果托盘没有 ZH/EN 图标，说明 daemon 没有作为输入法激活；先处理上一条「启用不了」。

## 和 ibus / fcitx 冲突吗？

曦码·澈不依赖 ibus 或 fcitx，也不会作为它们的插件运行。装在一起通常不会互相破坏，但 **KWin 的虚拟键盘只能选一个**：

- 用曦码·澈时，把虚拟键盘设为 `xime-launcher.desktop`。
- 切回 ibus / fcitx 时，在系统设置里改回对应项，并重新登录。

不建议同时让两个输入法争抢虚拟键盘；表现通常是按键被吞或输入法反复激活/失活。

## 终端里 Ctrl+C 没反应？

这是当前版本在 Wayland 修饰键转发上的已知限制：为了保证系统级 `Ctrl` 不被卡住，daemon 不缓存、不重复转发修饰态，代价是部分终端应用收不到 `Ctrl+C` / `Ctrl+X` 的 SIGINT。

需要中断命令时，可以暂时使用终端菜单的「发送信号」、`kill` 命令，或切到其他输入法。后续版本会继续处理这个限制。

## 修改方案后不生效？

Rime 的配置修改后需要**部署**：

1. 托盘右键 →「重新部署」；或设置程序 →「输入方案」→「部署方案」。
2. 等待几秒，部署完成会弹出通知（失败也会提示）。
3. 部署失败时查看 `~/.config/xime/xime.log.*` 与 `~/.config/xime/rime/build/*.log`。

## 怎么导入第三方方案？

设置 →「输入方案」→「导入方案」，支持 `.zip` / `.tar.gz`，可以拖入窗口、选择本地文件或填写 URL。导入后启用方案并部署。

曦码·澈默认只使用随包的 `rime-wubi` 方案集，不会混入系统 librime-data 里的方案；第三方方案需要自行导入。

## 候选词数量、字体、主题在哪里改？

设置 →「外观」：

- 浅色 / 深色 / 跟随系统
- 浅色、深色配色方案
- 候选字号、候选数量（1–10，第 10 个用 `0` 选）、候选窗圆角

修改后点「保存外观设置」。不满意可以「撤销上一次修改」。

## 数据在哪里？怎么备份或重置？

配置与用户数据都在 `~/.config/xime/`：

- `rime/`：方案、词典、用户配置与部署产物
- `clipboard.db`：剪贴板历史、快捷发送
- `plugins/`、`models/`：插件与语音模型
- `p2p/`：设备关联身份与配对表

备份可以直接复制整个目录，也可以用设置里的「同步与备份」页传到 WebDAV。重置时先退出输入法，再把 `~/.config/xime` 改名或删除；下次启动会重新生成默认配置。

## 语音输入没反应？

- 先在「设置 → 语音转文本」下载一个模型；没有模型不会开始识别。
- 把光标放进输入框，确认输入法处于激活状态（托盘有 ZH/EN）。
- 按 `Ctrl+Alt+V`，或点托盘菜单「语音输入」。
- 输入法未激活时无法上屏，会提示先点击输入框。
- 仍失败时查看日志中的 speech 相关行。

## 设备互传配对成功但不同步？

「设备关联 / 设备互传」仍在开发中，当前版本：

- 已能完成配对与 P2P 连接；
- 接收到的文本进入 `clipboard.db`，可在候选栏「剪切板」面板中点击上屏；
- **尚未自动写入系统剪贴板**，因此不能直接 `Ctrl+V`；
- 尚未完成双机实测，行为可能随版本变化。

如果只是想把剪贴板同步起来，建议暂时使用「同步插件」通道。协议细节见[设备互联](/device-link/)。

## 卸载后 KWin 还指向 Xime？

清空 KWin 的虚拟键盘配置并重新登录：

```bash
kwriteconfig6 --file kwinrc --group Wayland --key VirtualKeyboard ""
```

开发安装可以运行仓库里的 `uninstall.sh`；配置默认保留在 `~/.config/xime`，需要彻底删除时加 `--purge` 或手动删除。

## 有 ARM64 或其他架构的包吗？

官方 Release 目前提供 x86_64 的 deb、rpm、Arch 包与通用 tar.gz。其他架构需要从源码编译：

```bash
cargo build --release
```

再按发行版打包或使用 `packaging/stage.sh` 铺安装树。deb 包要求 Ubuntu 24.04+ / Debian 13+（glibc 2.39+）；更老的发行版请自行编译。

## 在哪里反馈问题？

到 [XimeChe Issues](https://github.com/ximeiorg/XimeChe/issues) 提问，附上：

- 发行版与 KDE Plasma 版本
- `echo $XDG_SESSION_TYPE` 与是否 Wayland
- `~/.config/xime/xime.log.*` 中相关时间段的日志
- 复现步骤（哪个应用、什么按键、预期与实际）
