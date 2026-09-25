# 插件开发教程

本教程带你从零写出、测试并运行第一个 Xime 插件。

> **适用版本**：Xime **v3.0.0+**。v3 起插件为 **TypeScript** 源码，经 `xipm` 编译为单文件 JavaScript，在宿主 QuickJS 沙箱中运行。旧版 Lua 插件架构已被替换（Lua 插件无法在 v3 宿主加载）。
>
> 本页是**手把手教程**；完整字段与接口清单见 [插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE)。

## 你将做出什么

教程分三步，逐步引入插件系统的核心概念：

| 步骤 | 插件 | 你会学到 |
|------|------|----------|
| 第 1 步 | **心情表情**（emoji 插件） | 插件包结构、`manifest.json`、`definePlugin`、扩展点、编译与打包 |
| 第 2 步 | 编写并运行测试 | `xipm test`、mock host、断言 |
| 第 3 步 | **每日一言**（tool 插件） | 工具面板、配置表单、`host.http` 网络请求、错误处理、网络白名单 |
| 进阶 | **输入统计**（tool 插件） | 订阅宿主下行事件（`events`）、持久化、被动展示面板 |

## 插件系统速览

Xime 插件是**纯脚本**，不需要 Android SDK、不需要编译 APK：

```
main.ts（你写的 TypeScript 模块）
   │  xipm build：类型剥离 + 多文件 import 内联 + 压缩
   ▼
main.js（IIFE 单文件，定义 globalThis.plugin）
   │  xipm pack：与 manifest.json、resources/ 一起打成 zip
   ▼
my-plugin-0.1.0.xipk ── 安装 ──▶ files/plugins/<id>/
   │
   ▼
宿主 QuickJS 沙箱执行 main.js，按 manifest 声明的扩展点与能力调用
```

插件与宿主之间只有三条通路：

1. **扩展点（Extensions，本体）**：插件实现的能力，如 `emoji`、`panel`、`speech`、`clipboardSync`、`backup`、`transform`，宿主按点调用。
2. **下行事件（Events）**：宿主 → 插件的通知，如 `text_committed`、`input_changed`、`quick_send_changed`。
3. **上行服务（Services）**：插件 → 宿主的能力调用，即 `host.*` 白名单（网络、配置、资源、加密等），按 manifest 能力声明注入。

::: tip 沙箱安全
插件只能通过 `host` 访问外界。未在 `network.hosts` 声明的域名无法联网，未在 manifest 声明的能力不会注入。QuickJS 精简环境**没有** `setTimeout` / `setInterval` / `URL` / `fetch` / `Intl`，网络与 IO 一律走 `host`。
:::

## 准备环境

开发插件需要：

- **Rust 工具链**（构建 `xipm` CLI）：<https://rustup.rs>
- 可选：**Node.js**，仅用于 `tsc` 类型检查（`xipm` 编译只做类型剥离，不做类型检查）
- 真机调试需要 **adb** 与一台已安装 Xime 的 Android 设备

构建 `xipm`：

```bash
git clone https://github.com/ximeiorg/Xime.git
cd Xime/tools/xime-plugin

# 开发即用
cargo run -- --help

# 或构建二进制（推荐，命令名 xipm）
cargo build --release
./target/release/xipm --help
```

后续示例用 `xipm` 代指该二进制；若用 `cargo run`，写成 `cargo run -- <子命令>` 即可。

## 第 1 步：写一个 emoji 插件

### 1.1 创建骨架

```bash
cd tools/xime-plugin
xipm init mood-emoji --type emoji --parent /tmp/xime-demo
```

生成的结构：

```
/tmp/xime-demo/mood-emoji/
├── main.ts            入口源码（含最小示例）
├── main.test.ts       测试骨架
├── manifest.json      清单（支持 // 注释与尾逗号）
├── xime-plugin.d.ts   SDK 类型定义（主机 API + 插件契约 + 环境 API）
├── tsconfig.json      类型检查配置
└── resources/         资源目录（图片由宿主渲染）
```

`--type` 可选 `tool` / `emoji` / `speech` / `clipboard_sync` / `backup`，只是骨架默认值，真正的能力以 `manifest.json` 为准。

### 1.2 认识 manifest.json

```jsonc
{
  "id": "com.example.mood_emoji",   // 反域名命名空间，≤64，字母/数字/下划线/连字符/点
  "name": "心情表情",
  "description": "一组表达心情的颜文字",
  "version": "0.1.0",
  "type": "emoji",                   // tool / emoji / speech / clipboard_sync / backup
  "entry": "main.js",                // 固定为编译产物 main.js
  "platforms": ["android"],          // 目标平台，缺省视为 ["android"]
  "minHostVersion": "3.0.0",
  "capabilities": {
    "emoji": { "supportsSearch": true, "columns": 3, "itemHeightDp": 32 }
  }
}
```

关键点：

- **`entry` 固定 `main.js`**——`xipm` 的编译产物，不要手写。
- **`minHostVersion` / `maxHostVersion`** 决定宿主能否安装/加载；插件 API v3 对应 `3.0.0`。
- **`capabilities`** 是宿主消费能力的唯一来源。类型决定了需要声明哪些能力（见下表）。

| type | 实现的扩展点 | 相关 capabilities | 宿主集成点 |
|------|-------------|------------------|-----------|
| `emoji` | `emoji` | `emoji` | 候选栏表情页签 |
| `tool` | `panel`（+ 可选 `transform`） | `tool` / `toolbarButtons` / `candidate_transform` | 工具栏按钮 → 面板 |
| `speech` | `speech` | `speech` | 麦克风键 |
| `clipboard_sync` | `clipboardSync` | `clipboard_sync.protocols` | 剪贴板后台同步 |
| `backup` | `backup` | `backup.protocols` | 云备份设置页 |

### 1.3 写插件逻辑

把 `main.ts` 替换为：

```ts
// 心情表情：data-only 插件，表情由宿主渲染，插件只提供数据
const EMOJIS: XimeEmojiItem[] = [
  { id: 'happy', text: '(＾▽＾)' },
  { id: 'sad', text: '(；_；)' },
  { id: 'angry', text: '(╬ Ò﹏Ó)' },
  { id: 'sleepy', text: '(－_－) zzZ' },
  { id: 'love', text: '(♡´▽`♡)' },
];

const plugin = definePlugin({
  onLoad(): void {
    host.log('心情表情已加载');
  },

  emoji: {
    listCategories(): string[] {
      return ['心情'];
    },

    query(q: XimeEmojiQuery): XimeEmojiItem[] {
      const keyword = (q.keyword || '').trim();
      const hits = keyword === ''
        ? EMOJIS
        : EMOJIS.filter((e) => e.text.includes(keyword));
      return hits.slice(0, q.topK ?? 50);
    },

    icon(): XimeIcon {
      return { text: '☺' };
    },
  },
});

export default plugin;
```

要点：

- **不要写 `import`**：`definePlugin`、`host`、`XimeEmojiItem` 等全是 `xime-plugin.d.ts` 里的**全局声明**，直接使用。
- 入口用 `export default plugin;`，`xipm` 会编译成 `var plugin = (function(){ ... })();`，即宿主约定的 `globalThis.plugin`。
- 扩展点方法可以 `async`（宿主会等待），但 `transform.candidates` 等热路径必须同步。
- 想拆分代码就建 `libs/*.ts` 并 `import`，`xipm` 构建时自动内联成单文件。

### 1.4 类型检查（可选）

`xipm` 编译不做类型检查，建议单独跑一次：

```bash
npx -p typescript tsc -p /tmp/xime-demo/mood-emoji/tsconfig.json --noEmit
```

### 1.5 编译

```bash
xipm build /tmp/xime-demo/mood-emoji --out /tmp/xime-demo/out
# 产物：/tmp/xime-demo/out/mood-emoji/main.js（+ manifest.json、resources/）
```

## 第 2 步：测试插件

插件测试无需真机：`xipm test` 内嵌与真机同款的 QuickJS 引擎，注入符合 v3 契约的 mock host。

编辑 `main.test.ts`：

```ts
test('返回全部心情表情', () => {
  const p = (globalThis as any).plugin;
  const items = p.emoji.query({});
  assert.equal(items.length, 5, '应返回 5 个表情');
});

test('按关键字过滤', () => {
  const p = (globalThis as any).plugin;
  const items = p.emoji.query({ keyword: '♡' });
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'love');
});

test('topK 生效', () => {
  const p = (globalThis as any).plugin;
  assert.equal(p.emoji.query({ topK: 2 }).length, 2);
});
```

先编译再测试（测试基于 `build/plugin-js` 下的产物运行）：

```bash
xipm build /tmp/xime-demo/mood-emoji
xipm test  /tmp/xime-demo/mood-emoji
```

测试环境要点：

- **绝不真实联网**：`host.http` / `host.ws` / SSE 必须用 `__ximeMock.addHttpResponse()` / `addWs()` / `addSse()` 显式 stub，未注册的请求会 reject `E_NETWORK`。
- **可断言调用记录**：`__ximeMock.httpRequests` / `sentWs` / `asrEvents` / `quickSend` / `clipboard`。
- **可控时钟**：`__ximeMock.setClock(epochSeconds)` 固定 `host.crypto.utcTime` / `epochSeconds`。
- **日志透出**：插件里的 `console.log` 会带前缀输出到终端。
- 没有测试文件时可用 `xipm test <dir> --smoke` 只做加载冒烟。

## 第 3 步：写一个 tool 插件（面板 + 配置 + 网络）

tool 插件通过 `panel` 扩展点在工具栏提供入口。`capabilities.tool.display` 有两种呈现：

- **`passive`**：宿主渲染全屏纯展示面板（`InfoPanel`），`ui` 节点树承载展示与按钮，`items` 供点选上屏。
- **`direct`**：在输入框下方渲染控件行，适合轻量表单。

下面做一个「每日一言」插件：点按钮拉取一句随机句子，点候选上屏。

### 3.1 创建骨架

```bash
xipm init daily-quote --type tool --parent /tmp/xime-demo
```

### 3.2 manifest.json

```jsonc
{
  "id": "com.example.daily_quote",
  "name": "每日一言",
  "icon": "言",
  "description": "拉取一句随机句子，点选上屏",
  "version": "0.1.0",
  "type": "tool",
  "entry": "main.js",
  "platforms": ["android"],
  "minHostVersion": "3.0.0",
  "toolbarButtons": [
    {
      "id": "com.example.daily_quote:open",
      "label": "每日一言",
      "action": "open_panel"
    }
  ],
  "network": {
    "hosts": ["v1.hitokoto.cn"]      // 联网必须先在这里声明
  },
  "capabilities": {
    "tool": { "display": "passive" }
  }
}
```

::: warning 网络域名必须声明
`host.http` / `host.ws` 的连接地址会经过白名单校验：域名必须在 `network.hosts` 中声明，且经用户在插件管理页授权后才能放行。若服务器地址由用户填写，改用 `"network": { "allowCustomHosts": true }`，用户保存配置后自动获得授权。
:::

### 3.3 main.ts

```ts
const KEY_API_BASE = 'apiBase';
const DEFAULT_API_BASE = 'https://v1.hitokoto.cn';

let items: XimePanelItem[] = [];
let lastError = '';
let loading = false;

function buildUi(): XimeUiNode[] {
  const ui: XimeUiNode[] = [{ type: 'section', label: '每日一言' }];
  if (items.length > 0) {
    ui.push({ type: 'text', value: '点击候选直接上屏', style: 'caption' });
  } else {
    ui.push({ type: 'text', value: '点击下方按钮获取一句话', style: 'caption' });
  }
  if (lastError !== '') {
    ui.push({ type: 'text', value: lastError, style: 'caption' });
  }
  ui.push({ type: 'button', label: '来一句', key: 'fetch' });
  return ui;
}

const plugin = definePlugin({
  // 配置表单：宿主在插件中心的设置页渲染，字段 key 直接绑定 host.config
  settings: {
    schema(): XimeUiNode[] {
      return [
        {
          key: KEY_API_BASE,
          label: '接口地址',
          type: 'text',
          defaultValue: DEFAULT_API_BASE,
          helpText: '一言 API 的基地址',
        },
      ];
    },
  },

  panel: {
    state(_input: XimePanelInput): XimePanelState {
      return { items, ui: buildUi(), loading };
    },

    async onAction(input: XimePanelActionEvent): Promise<void> {
      if (input.actionId !== 'fetch') return;
      if (loading) return;

      loading = true;
      lastError = '';
      const base = (host.config.get(KEY_API_BASE) || DEFAULT_API_BASE).replace(/\/+$/, '');
      const url = base + '/?encode=json';

      try {
        const resp = await host.http.request('GET', url, {}, null, 10000);
        if (resp.status !== 200) {
          lastError = '接口返回 ' + String(resp.status);
          host.logError(lastError + ': ' + resp.text);
          return;
        }
        let data: unknown = null;
        try {
          data = JSON.parse(resp.text);
        } catch (e) {
          data = null;                    // JSON.parse 对非法输入抛异常，需 try/catch
        }
        const text = data !== null && typeof data === 'object'
          ? String((data as Record<string, unknown>).hitokoto ?? '')
          : '';
        items = text !== '' ? [{ id: '1', text }] : [];
        if (items.length === 0) lastError = '未解析到内容，请重试';
      } catch (e) {
        // async 服务失败会 throw XimeError（带 code / message）
        const err = e as XimeError;
        lastError = '请求失败：' + (err.code || '') + ' ' + (err.message || '未知错误');
        host.logError(lastError);
      } finally {
        loading = false;
      }
    },

    onItemClick(_input: XimePanelItemClickEvent): void {
      // passive 面板点选上屏由宿主完成；这里重置状态，下次打开回到初始态
      items = [];
      lastError = '';
    },
  },
});

export default plugin;
```

要点：

- `panel.state` 可 `async`，宿主会等待并显示 `loading` 态；`onAction` 里适合 `await` 长任务。
- `host.http.request(method, url, headers, body?, timeoutMillis?)` 是 **async**，失败 throw `XimeError`（`code` / `message`）；body 必须是 `Uint8Array`（用 `new TextEncoder().encode(...)`）。
- 配置用 `host.config.get/set`，每个插件独立存储；`getJson<T>()` 可读 JSON（非法输入返回 `null`，不抛异常）。

### 3.4 测试（含网络 stub）

```ts
test('获取一言', async () => {
  __ximeMock.addHttpResponse('GET', 'https://v1.hitokoto.cn/?encode=json', {
    status: 200,
    text: JSON.stringify({ hitokoto: '山重水复疑无路' }),
  });

  const p = (globalThis as any).plugin;
  await p.panel.onAction({ actionId: 'fetch' });

  const state = p.panel.state({ inputText: '' });
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].text, '山重水复疑无路');
  assert.equal(__ximeMock.httpRequests.length, 1);
});

test('未声明的域名被拒绝', async () => {
  await assert.rejects(
    host.http.request('GET', 'https://other.example.com/', {}),
    '未 stub 的请求应被拒绝'
  );
});
```

```bash
xipm build /tmp/xime-demo/daily-quote
xipm test  /tmp/xime-demo/daily-quote
```

### 3.5 打包

```bash
xipm pack /tmp/xime-demo/daily-quote --out /tmp/xime-demo/out --release-dir /tmp/xime-demo/release
# → /tmp/xime-demo/release/daily-quote-0.1.0.xipk
```

`pack` 默认压缩（compress + 局部变量 mangle，体积约 -40%）；调试期可用 `--no-minify`。

## 安装到手机

三种方式：

1. **从文件安装**：把 `.xipk` 传到手机，在「设置 → 插件管理 → 从文件安装插件」导入（标记为第三方）。
2. **无线导入**：通过「浏览器导入」页面上传 `.xipk`。
3. **热调试**（推荐开发时用）：见下一节。

第三方插件首次启用会弹出确认；插件只能联网到 `network` 中声明的域名。

## 热调试 `xipm dev`

开发时不必手动传文件——`xipm dev` 会 watch 源码、自动编译打包、adb 推送并触发热重载，同时跟随日志：

```bash
xipm dev /tmp/xime-demo/daily-quote
xipm logs /tmp/xime-demo/daily-quote            # 实时日志
xipm logs /tmp/xime-demo/daily-quote --history  # 历史错误（需 debug 包）
```

真机要求：

- 需要**插件开发模式**开关：在宿主「设置 → 关于 → 连点设备信息 7 次（1.5s 内）」解锁后开启。开关关闭时热安装入口会秒退。
- debug 包与 release 包均包含热安装组件；release 包需手动开启上述开关。
- 多设备/无线调试用 `--device <serial>`；无线调试先 `adb pair` + `adb connect`。

热更新采用“仅内置版本更高才覆盖”的版本守卫，开发中的热更新版本不会被启动时的内置同步回滚。

## 进阶：响应宿主事件

插件可订阅宿主下行事件。先在 manifest 声明，再在 `events` 槽实现对应回调：

```jsonc
"capabilities": {
  "tool": { "display": "passive" },
  "events": ["input_changed", "text_committed"]
}
```

```ts
const plugin = definePlugin({
  events: {
    onTextCommitted(e: XimeTextCommittedEvent): void {
      // e.committedText / e.sessionTotalChars / e.sessionTotalCommits / e.isPaste
      if (e.isPaste) return;               // 粘贴性质上屏不计打字量
      host.config.set('total', String(parseInt(host.config.get('total') || '0') + 1));
    },
    onInputChanged(e: XimeInputChangedEvent): void {
      // e.inputText：当前编码快照（高频，仅内存处理）
    },
  },
});
```

可用事件：`input_changed`、`text_committed`、`quick_send_changed`（见 [插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE#下行事件-events)）。

## 常用速查

| 能力 | API | 说明 |
|------|-----|------|
| 日志 | `host.log` / `host.logError` | 输出到 logcat（tag 含插件 id），`console.*` 同义 |
| 配置 | `host.config.get/set/getJson/remove/keys` | 每插件独立存储 |
| 资源 | `host.resource.path(name)` / `list(dir)` | `resources/` 下文件路径；图片由宿主渲染 |
| 编码 | `host.crypto.sha256/hmacSha256/hmacSha1/hex/base64/utcTime/epochSeconds` | 签名与编码（同步） |
| 二进制 | `host.bin.int32be/uint32be`、`host.zlib.gzip/gunzip` | 二进制协议（zlib 为 async） |
| 网络 | `host.http.request/stream/closeStream`、`host.ws.connect/sendText/sendBinary/close` | async，域名需声明 |
| 语音 | `host.asr.emitFinal/emitPartial/emitError/emitState` | speech 插件上报结果 |
| 其它 | `host.uuid()`、`host.quickSend.list()`、`host.clipboard.get()` | 按 manifest 能力注入 |
| 探测 | `host.has(name)` / `host.capabilities` | 运行时判断能力是否注入 |

环境 API：`console`、`TextEncoder` / `TextDecoder`、`atob` / `btoa` 由宿主补齐；**没有** `setTimeout` / `URL` / `fetch` / `Intl`。字节一律 `Uint8Array`；`subarray()` 子视图跨宿主桥会变 `null`，需 `new Uint8Array(view)` 复制。

## 学习现有插件

仓库 `plugins/` 下有完整实现，建议对照阅读：

| 插件 | 类型 | 学习点 |
|------|------|--------|
| `kaomoji` / `meme-bunny` | emoji | 表情数据与图片资源 |
| `typing-stats` | tool | 下行事件、持久化、被动展示面板 |
| `ai-reply` / `ai-write` | tool | 面板 + 配置表单 + `host.http` + 长超时 |
| `qwen-translate` | tool | 翻译面板与模型调用 |
| `quick-phrase` | tool | `transform` 候选词变换 + `host.quickSend` |
| `funasr-asr` / `volc-asr` / `tencent-asr` | speech | `host.ws` / `host.http` 流式与签名 |
| `webdav-backup` | backup | WebDAV 传输协议 |
| `webdav-clipboard-sync` / `ximed-clipboard-sync` | clipboard_sync | 剪贴板同步协议 |

## 排错

| 现象 | 原因 / 解决 |
|------|------------|
| 加载失败“未定义全局对象 plugin” | `main.ts` 必须 `export default`（`xipm` 会编译为 `globalThis.plugin`） |
| TS 报找不到 `definePlugin` / `host` | 确认 `tsconfig.json` 的 `include` 含 `xime-plugin.d.ts` |
| `xipm test` 报“未注册该请求的 stub” | 测试禁止真实联网，用 `__ximeMock.addHttpResponse/addWs/addSse` stub |
| `JSON.parse('')` 抛异常 | 原生语义，用 `try/catch` 或保证输入合法 |
| 请求体为空 | body 必须是 `Uint8Array`，用 `new TextEncoder().encode(...)` |
| 请求被拒绝 `E_DENIED` | 域名未在 `network.hosts` 声明或用户未授权 |
| 真机看不到 `console.log` | 用 `xipm logs <dir>`（console 已落盘）；确认代码确实执行到该行 |
| `xipm dev` 报“未检测到在线设备” | `adb devices` 确认授权；无线调试先 `adb pair` + `adb connect` |
| `xipm dev` 报“未收到设备回执” | 宿主较旧或未开启插件开发模式，用 `xipm logs` 查看设备日志 |

更多问题见 [插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE)。
