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
- `xime.db`：剪贴板历史、快捷发送（与设置程序共用同一个库）
- `plugins/`、`models/`：插件与语音模型
- `p2p/`：设备互传的本机身份与配对表；删掉等于重置身份，所有配对失效
- `clipboard_sync.toml`：剪贴板同步通道配置

备份可以直接复制整个目录，也可以用设置里的「同步与备份」页传到 WebDAV。重置时先退出输入法，再把 `~/.config/xime` 改名或删除；下次启动会重新生成默认配置。

## 语音输入没反应？

- 先在「设置 → 语音转文本」下载一个模型；没有模型不会开始识别。
- 把光标放进输入框，确认输入法处于激活状态（托盘有 ZH/EN）。
- 按 `Ctrl+Alt+V`，或点托盘菜单「语音输入」。
- 输入法未激活时无法上屏，会提示先点击输入框。
- 仍失败时查看日志中的 speech 相关行。

## 设备互传配对成功但不同步？

配对只建立信任关系，**同步开关要单独打开**。按顺序检查：

1. 「设置 → 剪贴板 → 剪贴板同步」里「局域网直连」是否已勾选；两个开关都没勾时页面会显示「同步已关闭」。
2. 「设备关联 → 已配对设备」里能看到对方，且两台设备连在同一 Wi-Fi、同一网段。
3. 对端是否在线：手机端要启用输入法；Linux 这边 `pgrep -a xime-daemon` 要有进程。
4. 路由器是否开了 AP 隔离 / 访客网络隔离；VPN 是否拦了局域网。
5. 看日志 `~/.config/xime/xime.log.*`：有 `Sync p2p: peer ... connected=true` 说明连接正常，`Sync: wrote N chars to system clipboard` 说明已写回系统剪贴板。

能收到但 `Ctrl+V` 拿到旧内容，说明系统剪贴板写入失败（日志里有 `system clipboard unavailable`），此时内容只在历史里——可在候选窗「剪切板」面板点击上屏，并确认当前是 Wayland 会话。

配对、端口与更多排查见[桌面端（曦码·澈）](/device-link/ximeche)与[设备互联](/device-link/)。

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
