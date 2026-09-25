# 插件开发完整指南

> **版本要求**：本文档面向 **Xime v3.0.0+**。v3 起插件为 **TypeScript** 源码，由 `xipm` 编译为单文件 JavaScript 在 QuickJS 沙箱运行。v2.6 的 Lua 插件架构（`main.lua` / `getEmojis()` / `host.json`）已被替换，Lua 插件无法在 v3 宿主加载。
>
> 想先动手？看 [插件开发教程](./PLUGIN_DEV_TUTORIAL)。本页是字段与接口的完整参考。

## 插件系统架构

```
main.ts（TypeScript 模块，definePlugin + export default）
   │  xipm build：类型剥离 + 相对 import 内联 + 可选压缩
   ▼
main.js（IIFE 单文件，定义 globalThis.plugin）
   │  xipm pack：与 manifest.json、resources/ 打包为 zip
   ▼
<name>-<version>.xipk ── 安装解压 ──▶ files/plugins/<id>/
   ▼
宿主 QuickJS 沙箱：按 manifest 扩展点路由调用，按能力注入 host
```

核心特性：

- 插件**不需要编译 APK、不需要 Android SDK**，源码为 TypeScript
- 插件逻辑在 QuickJS 沙箱内运行，脚本错误不导致宿主崩溃，并写入错误日志
- 每个插件拥有独立的 JS 运行时上下文与配置存储，互不干扰
- 插件只能通过 `host` API 访问宿主能力；联网域名必须声明并经用户授权

## 插件包结构

```
my-plugin/
├── main.ts           源码：definePlugin + export default
├── main.test.ts      测试（xipm test；不进 xipk）
├── libs/*.ts         可选：相对 import 的拆分模块（构建时内联）
├── manifest.json     清单（宿主解析；宽松 JSON 支持 // 注释与尾逗号）
├── resources/        资源文件（图片由宿主渲染，插件只拿路径）
├── xime-plugin.d.ts  SDK 类型定义（xipm init 释放；tsconfig include）
└── tsconfig.json     类型检查配置
```

`xipm pack` 只把 `main.js`、`manifest.json`、`resources/` 打进 `.xipk`。

## manifest.json 字段

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | string | ✅ | — | 唯一标识：字母/数字/下划线/连字符，点号分段，≤64 |
| `type` | string | ✅ | — | `tool` / `emoji` / `speech` / `clipboard_sync` / `backup` / `prediction` / `unknown` |
| `entry` | string | ✅ | `main.js` | 入口脚本（编译产物，固定 `main.js`） |
| `version` | string | ✅ | `0.0.0` | 语义化版本 |
| `name` | string | | = id | 展示名 |
| `icon` | string | | — | 顶层图标：文字或 `resources/` 下图片文件名 |
| `description` | string | | `""` | 描述 |
| `platforms` | string[] | | `["android"]` | 目标平台；宿主按平台门禁加载 |
| `minHostVersion` | string | | — | 最低主应用版本（不满足拒绝安装/加载） |
| `maxHostVersion` | string | | — | 最高主应用版本（含） |
| `network.hosts` | string[] | | `[]` | 允许联网的域名/ IPv4 白名单 |
| `network.allowCustomHosts` | boolean | | `false` | 允许用户自定义服务器域名（保存配置后自动授权） |
| `toolbarButtons` | object[] | | `[]` | 工具栏入口按钮（tool 插件） |
| `capabilities` | object | | — | 能力声明（宿主消费能力的唯一来源，见下） |

> `activation` / `configSchema` 等旧字段宿主**不消费**：激活方式由 `type` 推导（见分类表），配置表单由插件的 `settings.schema()` 提供。

### capabilities

| 键 | 适用 type | 说明 |
|----|-----------|------|
| `emoji` | emoji | `supportsSearch` / `columns` / `itemHeightDp` |
| `tool.display` | tool | `direct`（结果直接上屏）或 `passive`（面板展示 `items` 点选） |
| `speech` | speech | `inputMode` / `supportsPartialResults` / `requiresNetwork` |
| `clipboard_sync.protocols` | clipboard_sync | 声明支持的同步协议（如 `webdav`），启动前硬校验 |
| `backup.protocols` | backup | 备份传输协议 |
| `events` | 任意 | 订阅的下行事件（snake_case），未声明不建立投递通道 |
| `candidate_transform` | tool | 候选词变换（hot path，15ms 硬超时） |
| `quick_send_read` | 任意 | 注入 `host.quickSend` |
| `clipboard_read` | 任意 | 注入 `host.clipboard` |

### toolbarButtons

```jsonc
"toolbarButtons": [
  { "id": "com.example.my_plugin:open", "label": "我的插件", "icon": "icon.png", "action": "open_panel" }
]
```

`id` 建议用 `插件id:动作` 形式；`action` 当前仅 `open_panel`（打开该插件面板）。

### 插件分类与激活

| type | 分组 | 激活 | 扩展点 |
|------|------|------|--------|
| `emoji` | 表情 | 多选 | `emoji` |
| `speech` | 语音转文本 | 单选 | `speech` |
| `clipboard_sync` | 剪贴板同步 | 单选 | `clipboardSync` |
| `backup` | 备份 | 单选 | `backup` |
| `tool` | 工具 | 多选 | `panel`（+ 可选 `transform`） |
| `prediction` | 智能预测（预留） | 多选 | — |
| `unknown` | 其他 | 无 | — |

## 入口脚本与插件定义

`main.ts` 用 `definePlugin` 定义、`export default` 导出。构建产物为 `var plugin = (function () { ... })();`，即宿主约定的 `globalThis.plugin`。

```ts
const plugin = definePlugin({
  onLoad(): void { host.log('loaded'); },          // 可选；宿主等待 Promise settle
  onUnload(): void { /* 释放资源 */ },

  events: { onTextCommitted(e) { /* ... */ } },
  settings: { schema() { return [ /* 表单 */ ]; } },
  panel: { state(input) { return { items: [], ui: [] }; } },
  // emoji / speech / clipboardSync / backup / transform ...
});

export default plugin;
```

- `definePlugin<T extends XimePluginSpec>` 对扩展点名与方法签名做**编译期校验**（拼错直接报错）。
- `definePlugin` / `host` / `XimeError` / `Xime*` 均为 `xime-plugin.d.ts` 的**全局声明，无需 import**；`host` 是运行时全局对象。
- 未实现的扩展点宿主不调用；函数抛错时宿主记录错误并降级，不崩溃。
- 扩展点按需 `async`：`onLoad` / `onUnload`、`panel.state` / `onAction`、`speech.*`、`clipboardSync.*`、`backup.*` 可返回 Promise；`transform.candidates` 必须同步。

## 能力三轨模型

1. **Extensions（本体）**：插件实现的扩展点，宿主按点路由。
2. **Events（下行）**：宿主 → 插件通知，manifest `capabilities.events` 声明后投递到 `events` 槽。
3. **Services（上行）**：插件 → 宿主，`host.*` 白名单，按 manifest 能力注入。

## 扩展点

### emoji（表情）

data-only：宿主渲染页签/网格/搜索，插件只提供数据。

| 方法 | 说明 |
|------|------|
| `listCategories(): string[]` | 分类列表 |
| `query(q: XimeEmojiQuery): XimeEmojiItem[]` | 查询；`q.category` / `q.keyword` / `q.topK` |
| `icon?(): XimeIcon` | 图标，`{ text }` 或 `{ assetName }` |

```ts
const EMOJIS: XimeEmojiItem[] = [
  { id: '1', text: '(^_^)' },
  { id: '2', text: '(T_T)', insertText: ':(' },        // insertText 覆盖插入内容
  { id: '3', text: '贴纸', imageUrl: host.resource.path('emoji/1.png') ?? undefined },
];
```

### panel（工具面板）

declarative：插件不自绘 UI，返回 `ui` 节点树 + `items` 候选，宿主渲染。

| 方法 | 说明 |
|------|------|
| `state(input): XimePanelState \| Promise<...>` | `{ inputText?, items, ui?, loading? }` |
| `onInput?(input): void` | ui 树内输入组件变化（同步入口） |
| `onAction?(input): void \| Promise<void>` | 按钮/操作点击（可声明 `confirm`） |
| `onItemClick?(input): void` | 候选点选（上屏由宿主完成） |

`ui` 节点白名单（`XimeUiNode`）：

- passive 面板：`section` / `text` / `metric` / `divider` / `button`（`key` 即 `actionId`）
- direct 面板：`text`（带 `key` 即输入框）/ `select` / `button` / `section` / `divider`
- settings 表单：`input` / `textarea` / `secret` / `select` / `multi_select` / `switch` / `number`

### speech（语音识别）

headless：宿主管理录音与状态机，插件做识别后端，结果经 `host.asr.emit*` 上报。

| 方法 | 说明 |
|------|------|
| `isConfigured?(): boolean` | 配置是否就绪（缺省按 settings 的 `required` 判定） |
| `configure(): boolean \| Promise<boolean>` | 开始前初始化一次；false 中止启动 |
| `start(): boolean \| Promise<boolean>` | 开始识别 |
| `feed(chunk: Uint8Array)` | 音频帧（PCM 16k/mono/16bit）；`await` 天然提供顺序与背压 |
| `stop()` / `cancel()` | 正常结束 / 取消 |

### clipboardSync（剪贴板同步）

| 方法 | 说明 |
|------|------|
| `push(profile): boolean \| Promise<boolean>` | 推送本地剪贴板 |
| `pull(): XimeClipboardProfile \| null \| Promise<...>` | 拉取远端（null = 无变更/失败） |
| `test(): string \| boolean \| null \| Promise<...>` | 连接测试（null = 成功） |

`XimeClipboardProfile` 字段：`type` / `hash` / `text` / `hasData` / `dataName` / `size` / `source`。

### backup（云备份）

宿主负责生成/恢复备份包（zip），插件只实现传输协议：`push(args)` / `pull(id)` / `list()` / `remove(id)` / `test()`。`push` 的 `args = { name, archive: Uint8Array }`。

### transform（候选词变换）

hot path（按键路径，15ms 硬超时，必须纯内存同步）：

```ts
transform: {
  candidates(req: XimeTransformRequest): XimeTransformResponse | null {
    // req: { inputText, preedit, asciiMode, candidates: [{ text, comment? }] }
    // 返回 null = 不干预；否则按 engineIndex 修改或新增文本候选
    return null;
  },
}
```

### settings（配置表单）

```ts
settings: {
  schema(): XimeUiNode[] {
    return [
      { key: 'apiKey', label: 'API Key', type: 'secret', required: true, helpText: '……' },
      { key: 'region', label: '区域', type: 'select', options: ['cn-north-1', 'cn-east-1'] },
    ];
  },
  options?(key: string): string[] {   // select / multi_select 的动态选项
    return [];
  },
}
```

配置改动即持久化到独立的 `plugin_cfg_<pluginId>` 存储；`switch` 值为 `"true"` / `"false"`；`multi_select` 以逗号拼接存储。

## 下行事件（events）

manifest 声明 `capabilities.events: ["text_committed"]` 后，宿主投递到 `events` 槽（方法名 = `on` + 事件名 PascalCase）：

| 事件 | 槽方法 | payload |
|------|--------|---------|
| `input_changed` | `onInputChanged` | `{ inputText }`（高频，仅内存态） |
| `text_committed` | `onTextCommitted` | `{ committedText, sessionTotalChars, sessionTotalCommits, isPaste }` |
| `quick_send_changed` | `onQuickSendChanged` | `{ count }` |

`sessionXxx` 为宿主进程生命周期累计（conflated 快照，用差值增量；宿主重启归零时差值为负，需按新会话处理）；`isPaste` 为粘贴性质上屏，不计打字量。

## host API

宿主注入的全局白名单，按 manifest 能力注入；未声明的子能力为 `undefined`，推荐用 `host.has(name)` 探测。

| 能力 | API | 同步/异步 |
|------|-----|----------|
| 日志 | `host.log(msg)` / `host.logError(msg)` | 同步 |
| 配置 | `host.config.get(key)` / `getJson<T>(key)` / `set(key, value)` / `remove(key)` / `keys()` | 同步 |
| 资源 | `host.resource.path(name)` | 同步 |
| 资源 | `host.resource.list(dir)` | **async** |
| 二进制 | `host.bin.int32be(n)` / `uint32be(n)` | 同步 |
| 压缩 | `host.zlib.gzip(data)` / `gunzip(data)` | **async** |
| 加密 | `host.crypto.sha256 / hmacSha256 / hmacSha1 / hex / base64 / utcTime / epochSeconds` | 同步 |
| HTTP | `host.http.request(method, url, headers, body?, timeoutMillis?)` | **async** |
| HTTP 流 | `host.http.stream(url, headers, timeoutMillis?, method?, body?)` / `closeStream(sessionId)` | **async** |
| WS | `host.ws.connect(url, headers?)` / `sendText` / `sendBinary` / `close`；`getState()` | async / getState 同步 |
| ASR | `host.asr.emitFinal / emitPartial / emitError / emitState` | 同步 |
| 快捷发送 | `host.quickSend.list()` | 同步 |
| 剪贴板 | `host.clipboard.get()` | 同步 |
| 其它 | `host.uuid()`、`host.sdkVersion`、`host.capabilities`、`host.has(name)` | 同步 |

**异步服务失败会 throw `XimeError`**（`code` + `message`），用 `try/catch`：

```ts
try {
  const resp = await host.http.request('POST', url, headers, body, 60000);
} catch (e) {
  host.logError((e as XimeError).code + ': ' + (e as Error).message);
}
```

错误码：`E_NETWORK` / `E_TIMEOUT` / `E_DENIED` / `E_INVALID` / `E_IO` / `E_INTERNAL` / `E_UNKNOWN`。

### 网络回调槽

- `host.ws.connect` 建立后：`ws.onOpen` / `onMessage(text)` / `onBinary(Uint8Array)` / `onError(msg)` / `onClose`
- `host.http.stream` 建立后：`sse.onData(sessionId, text)` / `onDone(sessionId, fullText)` / `onError(sessionId, msg)`

## 语言基线与沙箱限制

- **ES2020**：class / async / 可选链 / 空值合并 / BigInt / Set / Map / TypedArray / Proxy / Promise / Date / JSON / RegExp 均可用。
- 宿主补齐：`console`（转发 `host.log`）、`TextEncoder` / `TextDecoder`、`atob` / `btoa`。
- **不可用**：`setTimeout` / `setInterval`、`URL` / `URLSearchParams`、`fetch`、`Intl`（网络与 IO 一律走 `host`）。
- **字节**一律 `Uint8Array`；`subarray()` 子视图跨宿主桥会变 `null`，需 `new Uint8Array(view)` 复制。
- **JSON**：用原生 `JSON.parse` / `JSON.stringify`；`JSON.parse` 对非法输入**抛异常**，需 `try/catch`。

## 网络与安全

- **域名白名单**：连接地址必须命中 `network.hosts`（或 `allowCustomHosts` 下由用户配置的域名），且经用户授权；否则 `E_DENIED`。
- **信任等级**：内置（随 APK 分发）与市场远程下载视为**官方**；本地文件导入视为**第三方**。第三方插件首次启用需确认，且不能静默访问未授权域名。
- **平台门禁**：`platforms` 不含当前平台时不加载。
- **版本门禁**：`minHostVersion` / `maxHostVersion` 不满足时拒绝安装/加载。

## 工具链 `xipm`

| 命令 | 作用 |
|------|------|
| `xipm init <name> --type <t> [--parent <dir>]` | 生成插件骨架（别名 `new`） |
| `xipm build [dir] [--all] [--plugins-dir plugins] [--out build/plugin-js] [--minify]` | 编译为单文件 `main.js` |
| `xipm pack [dir] [--all] [--release-dir build/plugin-release] [--no-minify] [--with-assets]` | 编译 + 打包 `.xipk` |
| `xipm check [dir] [--all]` | 校验 `manifest.json` 字段/命名空间/类型与能力一致性 |
| `xipm test [dir] [--all] [--smoke]` | 内嵌 QuickJS + mock host 运行 `main.test.ts`（无需真机） |
| `xipm dev [dir] [--device <serial>] [--no-logs] [--package <pkg>]` | 真机热调试：watch → 编译打包 → adb 推送 → 热重载 → 跟随日志 |
| `xipm logs [dir] [--history] [--lines N] [--json]` | 真机插件日志（实时 / 历史错误） |

仓库内常用：

```bash
# 编译全部插件（测试前置）
cd tools/xime-plugin
cargo run -- build --all --plugins-dir ../../plugins --out ../../build/plugin-js

# 校验全部清单 / 打包全部 xipk
cargo run -- check --all --plugins-dir ../../plugins
bash ../../scripts/build-plugins.sh --with-assets

# 宿主侧测试（需先构建插件）
./gradlew :plugin-core:testDebugUnitTest :app:testDebugUnitTest
```

## 测试

插件测试用 `xipm test`，无需真机：`main.ts` 编译产物 + `main.test.ts` 在同一 QuickJS 引擎加载，注入 v3 契约的 mock host。

```ts
test('名称', async () => {
  assert.equal(actual, expected, '说明');                 // ok / equal / deepEqual / throws / rejects
  __ximeMock.addHttpResponse('GET', url, { status: 200, text: 'pong' });
  const resp = await host.http.request('GET', url, {});
  assert.equal(__ximeMock.httpRequests.length, 1);
});
```

- 网络 / WS / SSE 必须显式 stub（`addHttpResponse` / `addWs` / `addSse`），未注册即 reject `E_NETWORK`，**绝不真实联网**。
- 可断言：`httpRequests` / `sentWs` / `asrEvents` / `quickSend` / `clipboard`。
- 可控时钟：`__ximeMock.setClock(epochSeconds)`。

宿主侧（Kotlin）测试见 [测试指南](./TESTING)。

## 打包与内置

```bash
# 全部插件 → build/plugin-release/*.xipk，并同步内置插件到 app assets
bash scripts/build-plugins.sh --with-assets

# 单插件
xipm pack plugins/my-plugin --with-assets
```

- 内置插件放在 `app/src/main/assets/plugins/`，debug 构建启动时自动安装。
- 宿主启动同步内置 assets 插件时采用“仅内置版本更高才覆盖”的版本守卫。
- 压缩为 zip，条目使用 `/` 分隔且带 UTF-8 flag（脚本已处理）。

安装方式：

1. **扩展商店 → 插件**：浏览下载（官方信任）
2. **插件管理 → 从文件安装插件**：导入 `.xipk`（第三方信任）
3. **浏览器导入**：无线导入页面上传 `.xipk`
4. **热调试**：`xipm dev`（需开启插件开发模式）

## 版本兼容

- 插件包要求 Xime **v3.0.0+**（v3 TypeScript 插件契约）
- 建议按实际依赖的宿主能力声明 `minHostVersion` / `maxHostVersion`
- 版本比较忽略预发布/构建后缀（如 `3.0.0-beta2` 按 `3.0.0` 比较）

## 相关文档

- [插件开发教程](./PLUGIN_DEV_TUTORIAL) — 从零到热调试
- [测试指南](./TESTING) — 宿主侧测试
- SDK 类型：`tools/xime-plugin/templates/xime-plugin.d.ts`
- manifest schema：`docs/sdk/manifest.schema.json`
- 源码与示例：<https://github.com/ximeiorg/Xime>（`plugin-core/`、`plugins/`、`tools/xime-plugin/`）
