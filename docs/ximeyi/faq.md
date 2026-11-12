# 常见问题

## 在哪里下载安装包？

**暂时没有公开发布的安装包**。曦码·逸仍在内测，目前只支持从源码构建 `XimeYi.app` 后本地安装。

步骤见[总览与安装](/ximeyi/install)。

## 构建报错：找不到 librime.dylib？

构建脚本默认从本地 `libximecore` 的编译产物取动态库：

```bash
RIME_LIB_DIR="$HOME/vscode/libximecore/librime/dist/lib" ./scripts/build-app.sh release
```

如果 librime 是作为 git 依赖拉进来的，需要手动指定 `RIME_LIB_DIR` 到 `librime.dylib` 所在目录（具体路径见 `build.rs` 的输出）。改了 FFI 绑定后记得 `cargo clean`。

## 装完了，但输入法列表里找不到？

按顺序排查：

1. 确认 App 在 `~/Library/Input Methods/XimeYi.app`，不是 `dist/` 下直接运行；
2. `codesign -v --strict "$HOME/Library/Input Methods/XimeYi.app"` 校验签名，失败就重跑 `./scripts/install-app.sh`；
3. 打开 **系统设置 → 键盘 → 输入法**（macOS 15 起为 **键盘 → 文本输入 → 输入法**）点「+」添加；
4. 还是没有就**注销并重新登录**，或 `./scripts/install-app.sh --refresh`；
5. 仍然没有：`./scripts/fix-input-sources.sh --check` 看诊断输出。

## 菜单栏里出现好几份同名输入法？

已知问题：同一模式同时存在于 HIToolbox 的 `AppleEnabledInputSources`（旧）与 inputsources 的 `AppleEnabledThirdPartyInputSources`（新）两份列表里，TIS 会各自物化且不去重。

```bash
./scripts/fix-input-sources.sh          # 规范化
./scripts/install-app.sh --refresh      # 刷新菜单栏
```

安装脚本已经内置这一步，正常安装不会踩到；手工拷贝 App 或从旧版本升级时容易触发。

## 系统提示「无法验证开发者」？

当前版本是 **ad-hoc 签名**，没有做 Apple 开发者签名与公证。到 **系统设置 → 隐私与安全性** 里点「仍要打开」，或者直接在终端里运行安装脚本装到 `~/Library/Input Methods`（不经过 Gatekeeper 的隔离标记）。

## 打字没有候选窗 / 输入没反应？

- 确认菜单栏输入法已切到「曦码·逸输入法」；
- 确认 App 进程在跑：`pgrep -fl XimeYi`；
- 看日志：`tail -f "$HOME/Library/Application Support/XimeYi/ximeyi.log"`；
- 如果日志里连按键记录都没有，说明输入法没被系统激活，回到上一条「列表里找不到」；
- 如果换了新的 App 包，先退出输入法进程再切一次，避免旧进程还在响应。

## 候选窗位置不对 / 跑到屏幕外面？

候选窗位置由当前应用给出的光标矩形换算。常见触发场景：多显示器、非整数缩放（如 1.25 倍）、全屏应用与分屏（Stage Manager）。

可以先把该窗口拖到主屏再试。位置计算的具体偏差请连同应用名、屏幕配置一起反馈。

## Shift 切换中英文不生效？

- `Shift` 的按下/抬起顺序会影响结果：中文态输入编码后立刻按 `Shift`，编码会先上屏再切英文，这是按 Squirrel 行为实现的；
- `Caps Lock` 会清除当前组字；
- 部分应用会自己拦截 `Shift`，可以换一个输入框验证。

## 修改方案后不生效？

Rime 的配置修改后需要**部署**：

1. 设置程序 → 「输入方案」→ 部署；
2. 或重启输入法进程（切走再切回，或重跑安装脚本）；
3. 部署失败看 `~/Library/Application Support/XimeYi/ximeyi.log` 与 `rime/build/*.log`。

## 剪贴板同步不工作？

分通道看：

- **局域网直连**：先在「设备关联」里完成配对，再到「剪贴板 → 剪贴板同步」打开「局域网直连」开关；两台设备要在同一网段，对端离线时不会同步。完整步骤见[桌面端（曦码·逸）](/device-link/ximeyi)。
- **插件**：先装同步插件，再在「剪贴板 → 剪贴板同步」里打开对应开关。
- **两个都开**：按勾选顺序决定优先级，首个优先；直连掉线会自动让位给插件，不会两条同时推送。日志里能看到每次切换的原因。

## 数据在哪？怎么备份或重置？

```
~/Library/Application Support/XimeYi/
├── rime/           # 方案、词典、用户配置、部署产物
└── ximeyi.log      # 日志
```

- **备份**：复制整个目录，或用「同步与备份」传到 WebDAV。
- **重置**：退出输入法进程，把 `~/Library/Application Support/XimeYi` 改名或删除，下次切换回输入法会重新部署随包方案。
- **卸载**：`rm -rf "$HOME/Library/Input Methods/XimeYi.app"`。用户数据不会自动删除。

## 有 ARM64 / Intel 的通用包吗？

官方不提供预编译包，本地编译产出的是**本机架构**的 App。Apple Silicon 上编译出来的是 arm64，Intel 机器上是 x86_64；需要 Universal 包得自行用 `lipo` 合并两套产物与 dylib。

## 能装插件吗？和 Android 的插件通用吗？

能。曦码·逸的插件运行时对齐 Android 3.0 的 QuickJS 方案，表情包、符号、同步类插件可共用；旧的 mlua 插件已不再支持。插件在设置程序的「插件管理」里启用或卸载。

## 在哪里反馈问题？

曦码·逸未公开分发，问题请直接反馈给开发者，附上：

- macOS 版本与芯片（`sw_vers`、`uname -m`）
- 复现步骤：哪个应用、什么按键、预期与实际
- `~/Library/Application Support/XimeYi/ximeyi.log` 中相关时间段的日志
