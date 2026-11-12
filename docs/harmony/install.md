# 总览与安装

曦码鸿蒙版（ximeharmony）是 Xime 的 **HarmonyOS 输入法**。它由 Android 版移植而来：键盘与设置页用 ArkTS / ArkUI 编写，输入引擎是静态链接的 [librime](https://github.com/rime/librime)，经 NAPI 调用。

它与手机版（Android）、Windows（曦码·曜）、Linux（曦码·澈）、macOS（曦码·逸）是相互独立的产品：界面、设置程序、数据目录都不相同，但共用 Rime 的方案与词典格式。

> **内测中**：当前处于移植的第三阶段（P3），基础输入闭环、候选、主题、设置页已可用，部分增强功能仍缺项。**暂未公开发布，也没有可直接下载的安装包**，本章的安装步骤面向自行构建与真机自测。

## 与其它版本的区别

| 版本 | 平台 | 输入方式 |
|------|------|----------|
| 曦码（手机版） | Android | Android 输入法服务（InputMethodService） |
| 曦码鸿蒙版 | HarmonyOS | 输入法扩展（`InputMethodExtensionAbility`） |
| 曦码·曜（桌面版） | Windows | TSF 输入法框架 |
| 曦码·澈（Linux） | KDE Plasma（Wayland） | `zwp_input_method_v1` 虚拟键盘 |
| 曦码·逸（macOS） | macOS | InputMethodKit |

各版本的设置与用户数据不共用；Rime 方案包、词典格式通用，可以在不同版本之间导入导出。

## 主要特性

- **Rime 引擎**：字典部署、方案切换、中英态、候选、编码编辑，与 Android 版同一套 librime 与方案数据
- **输入方案**：五笔 86 / 98、五笔·拼音、五笔·繁体（含拼音）、拼音·简体、九键拼音、数字
- **键盘**：全键盘、九键（T9）、数字面板、常用符号、全量符号、表情
- **候选**：候选栏（可选显示编码）、候选展开页、候选栏最近剪贴板（30 秒窗口）、工具栏自定义
- **编码预上屏**：编码显示在应用编辑框内（平台 `setPreviewText`），不使用悬浮气泡
- **辅助**：剪贴板面板、语音转文字（华为 Core Speech Kit，离线）、按键音效与振动、按键气泡、单手模式、悬浮模式
- **外观与布局**：`xime.yaml` 驱动的主题与配色、按键高度调节、横屏分体键盘、平板/大屏档位
- **设置页**：独立应用入口，含主题、按键效果、布局与显示、输入方案、词库、智能联想、智能纠错、语音、设备互联
- **设备互联**：局域网 P2P 剪贴板同步，与 Android、macOS、ximed 互通，配对入口在设置页，详见[手机端（鸿蒙）](/device-link/harmony)

## 系统要求

- **HarmonyOS 6.0.2（API 22）及以上**，真机或模拟器
- **DevEco Studio**（含 HarmonyOS SDK 与 `hvigorw`、`hdc`）
- 构建需要 `git` 与可用的 `python3`（签名脚本与资源清单脚本会用到）
- 原生部分由 OHOS NDK 交叉编译，需保证子模块完整（首次构建会下载 Boost 1.89，约 150 MB）

## 获取源码与构建

源码当前未公开。下面假设你已拿到完整仓库（**必须带子模块**，共 7 个：librime 及其依赖、Rime 方案数据等）。

```bash
git clone --recurse-submodules <仓库地址> ximeharmony
cd ximeharmony
# librime 内的 deps 是嵌套子模块，需要再递归拉一次
git submodule update --init --recursive

DEVECO_SDK_HOME=<DevEco Studio>/sdk \
  <DevEco Studio>/tools/hvigor/bin/hvigorw assembleHap \
  --mode module -p product=default --no-daemon
```

构建产物：

```
entry/build/default/outputs/default/entry-default-signed.hap
```

### 关于签名

仓库里的 `build-profile.json5` **只保留团队共享配置，`signingConfigs` 恒为空数组**。本机签名材料放在 `signing/signing.local.json5`（已 gitignore），由 `hvigorfile.ts` 里的 `xime-local-signing` 插件在构建时注入。

- 没有 `signing/signing.local.json5` 时构建仍会成功，只是产出 **unsigned** hap，无法安装到真机；
- 用 DevEco「自动签名」后它会回写 `build-profile.json5`，提交前先执行 `python3 scripts/blank-signing-config.py` 把签名段搬回本机文件。

## 安装与启用

```bash
hdc install entry/build/default/outputs/default/entry-default-signed.hap

hdc shell ime -l                            # 列出系统输入法
hdc shell ime -s com.kingzcheung.ximeharmony  # 切换到曦码输入法
```

也可以在「设置 → 系统 → 输入法」中启用，并在任意输入框里通过键盘上的地球键切换。

> 长按地球键会打开键盘内的「选择输入法」页，直接列出已启用输入法并标出当前项，点选即可切换，不再弹系统级弹窗。

## 首次启动与数据目录

首次弹出键盘时，扩展会把随包的 Rime 方案数据从 `rawfile/rime/` 复制到自己的沙箱——`rawfile` 没有目录列举 API，拷贝清单由 `scripts/gen-rime-manifest.sh` 预生成到 `rime-manifest.json`——然后执行一次部署（首次约需数十秒）。

| 路径 | 内容 |
|------|------|
| 扩展沙箱 `filesDir/rime/` | Rime 方案源文件、用户配置、`build/` 部署产物、用户词典 |
| 扩展沙箱 `filesDir/rime/xime.custom.yaml` | 主题与行为自定义（与 `xime.yaml` 深合并） |
| 应用共享目录（`getGroupDir(data-group-id)`） | 设置页与输入法扩展共享的设置、词库快照 |
| `preferences` | 键盘高度、主题、开关类设置项 |

需要说明的几点：

- 输入法扩展运行在**独立进程与独立沙箱**，与设置页所在的 App 进程不互通。跨进程数据依赖签名 Profile 里的 `data-group-id`，自签名调试包必须使用带该字段的 Profile，否则设置页改了、键盘读不到。
- 修改方案或 `xime.custom.yaml` 后，需要在键盘菜单点「部署方案」，或在设置页的输入方案页重新部署。
- 排障日志用 `hdc shell hilog` 抓取，过滤 `XimeRimeConfig`、`XimeInputMethod` 等 TAG。

## 更新与卸载

- **更新**：直接 `hdc install` 新版本 hap 覆盖安装；用户方案与词典保留。
- **卸载**：`hdc uninstall com.kingzcheung.ximeharmony`。卸载会连同沙箱数据一起清除，需要保留时先导出方案与用户词典。
- **备份**：设置页的「词库管理」支持用户词典的备份与导出；方案可用「无线导入 / 从文件导入」重新导入。

## 已知限制

- **不移植插件体系**：`librime-lua` / `octagram` / `predict` 不参与构建，因此没有扩展商店，也无法安装 Lua 插件；个别依赖 `lua_filter` 的上游方案会打出 `error creating filter` 日志，属于预期降级，不影响出词。
- **手写输入未接入**：鸿蒙侧暂无手写引擎，方案列表里不启用 handwriting。
- **基础访问模式受限**：扩展进程处于基础访问模式时，系统会禁用网络、剪贴板、振动、扬声器等能力。相关功能做了能力探测并优雅降级，表现为「有键盘但剪贴板为空 / 没有振动 / 语音不可用」。
- **快捷短语入口未完成**：词库管理页承诺的「自定义短语」尚未落地。
- **项目仍在内测**：功能清单与界面会随版本变化，重要数据请先备份。

下一步可以看[使用与设置](/harmony/usage)，或直接查[常见问题](/harmony/faq)。
