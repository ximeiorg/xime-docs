# Xime 插件开发完整指南

> **版本要求**：本文档面向 **Xime v2.6.0+** 的 Lua 脚本插件架构。v2.6.0 起，Xime 用 Lua 脚本插件替换了旧的 DEX/APK 插件架构。

## 插件系统架构

Xime 采用 **Lua 脚本插件** 架构：插件包（`.xipk`，本质是 zip）内含 `manifest.yaml` 元数据、`main.lua` 入口脚本和 `resources/` 资源文件。宿主应用内置 Lua 沙箱执行插件逻辑，插件通过注入的全局 `host` API 与宿主交互。

```
┌─────────────────────────────────────────────┐
│             主应用 (Xime APK)                │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  PluginManager                       │   │
│  │  - InstallerManager  安装/卸载       │   │
│  │  - PluginLifecycleManager 加载/生命周期│   │
│  │  - XmlManager        注册表(plugins.xml)│  │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  LuaScriptRuntime (LuaJ 沙箱)        │   │
│  │  - 注入 host API（唯一宿主入口）      │   │
│  │  - 剥离危险库（os/io/luajava 等）     │   │
│  │  - 受限 require（仅 libs/ 目录）      │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  适配器按 type 分派                  │   │
│  │  - LuaEmojiPluginAdapter  → 表情     │   │
│  │  - LuaAsrPluginAdapter   → 语音识别  │   │
│  │  - LuaPluginAdapter     → 其他       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
            │ 安装（InstallerManager 解压）
            ▼
┌─────────────────────────────────────────────┐
│       插件包 (.xipk = zip)                   │
│                                              │
│  ├── manifest.yaml   # 元数据（宿主解析）     │
│  ├── main.lua        # 入口脚本（必须 return 导出表）│
│  ├── libs/           # 纯 Lua 依赖库（可选）   │
│  └── resources/      # 资源文件（icon、图片等） │
└─────────────────────────────────────────────┘
```

**核心特性**：

- 插件**不需要编译、不需要 Android SDK**，纯 Lua 脚本 + YAML 元数据
- 插件逻辑在沙箱内运行，脚本错误不会导致宿主崩溃
- 每个插件拥有独立的 Lua state 和配置存储，完全隔离
- 插件只能通过 `host` API 访问宿主能力，无法发起未授权的网络请求

## 核心概念

### 插件类型

插件的 `type` 字段决定其归属分组和宿主消费方式：

| 类型 | 分组 | 激活方式 | 消费接口 |
|------|------|---------|---------|
| `emoji` | 表情 | 多选（MULTI） | `LuaEmojiPluginAdapter` |
| `speech` | 语音转文本 | 单选（SINGLE） | `LuaAsrPluginAdapter` |
| `prediction` | 智能预测（预留） | 多选 | `LuaPluginAdapter` |
| `unknown` / 缺失 | 其他 | 无 | `LuaPluginAdapter` |

### 信任等级（Trust Level）

Lua 插件没有 APK 签名，信任等级完全由**来源**决定：

| 等级 | 来源 | UI 徽标 |
|------|------|---------|
| `TRUSTED`（官方） | 随宿主内置（`ASSET`）、市场官方索引下载（`REMOTE`） | 绿色「官方」 |
| `THIRD_PARTY`（第三方） | 用户本地文件导入（`FILE`） | 橙色「第三方」 |
| `UNKNOWN`（未知） | 仅作默认值 | 红色「未知来源」 |

非官方插件激活时会弹出确认框；第三方插件**无法静默发起任意网络请求**。

## 插件包结构

```
my-plugin/
├── manifest.yaml      # 元数据（宿主解析）
├── main.lua           # 入口脚本（必须 return 导出表）
├── libs/              # 纯 Lua 依赖库（可选，require 受限加载）
└── resources/         # 资源文件（icon、表情图等）
```

打包为 zip（`.xipk`）后导入或从插件市场下载。

## manifest.yaml 字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | String | **必填** | 无 | 插件唯一标识（反向域名风格） |
| `name` | String | 可选 | = id | 插件显示名 |
| `type` | String | 可选 | `"unknown"` | 分类：`emoji` / `speech` / `prediction` / 其他 |
| `entry` | String | 可选 | `"main.lua"` | 入口脚本（相对包根目录） |
| `version` | String | 可选 | `"0.0.0"` | 版本字符串 |
| `description` | String | 可选 | `""` | 描述 |
| `minHostVersion` | String | 可选 | 无 | 宿主最低版本（如 `2.6.0`） |
| `maxHostVersion` | String | 可选 | 无 | 宿主最高版本 |
| `network.hosts` | List\<String\> | 可选 | `[]` | 插件声明需要联网的域名 |

> **注意**：`icon`、`activation`、`capabilities`、`configSchema` 等键出现在示例 manifest 中，但宿主解析器**不消费**这些字段——它们仅为文档性约定。真正的图标来自 Lua 的 `getIcon()`，配置表单来自 Lua 的 `getSettingsSchema()`，激活方式由 `type` 映射。

示例：

```yaml
id: com.example.plugin.myplugin
name: 我的插件
description: 示例插件
version: 1.0.0
type: emoji
entry: main.lua
minHostVersion: 2.6.0

network:
  hosts:
    - api.example.com
```

### 宿主版本兼容性（可选）

`minHostVersion` / `maxHostVersion` 声明插件支持的主应用版本范围，宿主在**安装时**和**加载时**校验：

- 取值为宿主 `versionName`（如 `2.6.0` / `2.6.0-beta3`），比较时忽略预发布/构建后缀（`-beta3`），无法解析时视为兼容
- 安装时不兼容 → 安装失败并提示"当前主应用版本 vX 不在插件支持范围内（最低 vY - vZ）"
- 插件管理页对不兼容插件显示 ⚠ 标记并禁用启用开关

## 入口脚本约定

`main.lua` **必须 `return` 一个导出表（table）**，宿主读取表中的函数并按约定调用：

```lua
local plugin = {}

-- 可选生命周期回调
function plugin.onLoad() end
function plugin.onUnload() end

return plugin
```

- 数据一律用 Lua table 返回，宿主统一做 table → Kotlin 转换
- 函数不存在或抛错时宿主返回空结果，不会崩溃
- 一个插件一个 Lua state，全局环境完全隔离

## emoji 类型插件 API

必须实现的函数：

| 函数 | 返回 | 必需 |
|------|------|------|
| `getCategories()` | `string[]` | 是 |
| `getEmojis(category, searchText, topK)` | `EmojiItem[]` | 是 |

可选函数：

| 函数 | 返回 | 说明 |
|------|------|------|
| `getCategoryLayoutConfig(category)` | `{ columns?, itemHeightDp? }` | 自定义分类布局 |
| `getIcon()` | `{ text }` 或 `{ assetName }` | 插件图标 |
| `getSettingsSchema()` / `getOptions(key)` | 配置表单 | 设置界面 |

`EmojiItem` 字段：

```lua
{
  id = "emoji_1",              -- 唯一标识
  text = "(^_^)",              -- 显示与插入文本
  insertText = "(^_^)",        -- 可选，覆盖插入内容
  imageUrl = "/path/to/img",   -- 可选，图片表情（host.resource.path 获取）
  category = "颜文字",         -- 分类名称
}
```

表情图片通过 `host.resource.path("emojis/xxx.jpg")` 获取路径，**图片渲染由宿主完成，Lua 只提供路径**。

### 示例（颜文字插件）

```lua
local plugin = {}

function plugin.getCategories()
    return { "颜文字" }
end

function plugin.getEmojis(category, searchText, topK)
    local all = {
        { id = "1", text = "(^_^)", category = "颜文字" },
        { id = "2", text = "(T_T)", category = "颜文字" },
    }
    local result = all
    if searchText and searchText ~= "" then
        result = {}
        for _, e in ipairs(all) do
            if string.find(e.text, searchText, 1, true) then
                table.insert(result, e)
            end
        end
    end
    local n = topK or 50
    if #result > n then
        local t = {}
        for i = 1, n do t[i] = result[i] end
        return t
    end
    return result
end

function plugin.getCategoryLayoutConfig(category)
    return { columns = 3, itemHeightDp = 30 }
end

function plugin.getIcon()
    return { text = "థ౪థ" }
end

return plugin
```

## speech 类型插件 API

语音识别插件提供元信息层和音频流后端层。

### 元信息层

| 函数 | 返回 | 说明 |
|------|------|------|
| `getProviderId()` | string | 缺省回退到插件 id |
| `getDisplayName()` | string | 缺省回退到插件 name |
| `getCapabilities()` | table | 能力声明（见下） |
| `isConfigured()` | boolean | 是否已配置（如 API Key） |
| `getSettingsSchema()` | 配置表单 | 设置界面 |
| `getIcon()` | `{ text }` / `{ assetName }` | 插件图标 |

`getCapabilities()` 返回：

```lua
{
  inputMode = "streaming",        -- "streaming" | "batch"
  supportsPartialResults = true,  -- 是否支持中间结果
  maxRecordDurationMillis = 600000,
  requiresNetwork = true,
}
```

### 后端层（音频流式识别）

| 函数 | 返回 | 说明 |
|------|------|------|
| `initialize()` | boolean | 初始化 |
| `start()` | boolean | 开始识别 |
| `processAudioChunk(pcm)` | - | 主 App 每帧提交 PCM 数据，由 Lua 决定缓冲还是发送 |
| `stop()` | - | 停止 |
| `cancel()` | - | 取消 |
| `getState()` | number | `0=IDLE 1=LISTENING 2=PROCESSING 3=ERROR` |

**连接/协议/缓冲/结果解析全部由 Lua 承载**，宿主只提供通用原语。完整示例可参考 `plugins/funasr-asr/main.lua`（WebSocket 流式 + dashscope 协议）和 `plugins/volc-asr/main.lua`（火山引擎二进制协议 + gzip）。

## host API（宿主注入的 SDK）

插件可通过全局 `host` 表调用宿主能力：

```
host.sdkVersion                -- 字符串 "0.1.0"
host.log(msg)                  -- 日志（print 也转发到此处）
host.config.get(key) / set(key, value) / remove(key) / keys()  -- 配置（每插件独立存储）
host.resource.path(name)       -- 返回 resources/<name> 绝对路径，不存在返回 nil
host.resource.list(dir)        -- 列出 resources/<dir> 下文件名（不含子目录）
host.json.encode(table)        -- Lua table → JSON 字符串
host.json.decode(str)          -- JSON → Lua table
host.uuid()                    -- 生成 UUID
host.bin.int32be(n) / uint32be(n)  -- 大端序 4 字节编码（二进制协议用）
host.zlib.gzip(bytes) / gunzip(bytes)  -- gzip 压缩/解压
host.ws.connect(url, headers, callbacks) / sendText / sendBinary / close / getState / lastError
host.asr.emitFinal(text) / emitPartial(text) / emitError(msg) / emitState(state)
```

### host.ws（WebSocket）

协议无关的 WebSocket 原语：

- `host.ws.connect(url, headers, callbacks)` — 连接。callbacks 表支持 `onOpen`、`onMessage(text)`、`onBinary(bytes)`、`onError(msg)`、`onClose`
- `host.ws.getState()` — 返回 `0=IDLE 1=CONNECTING 2=OPEN 3=CLOSED`
- `host.ws.lastError()` — 最近一次错误原因

> **网络策略**：连接 URL 必须通过域名白名单校验。放行条件：(1) 命中官方可信池，或 (2) 域名在插件 `network.hosts` 声明内 **且** 已获用户授权。否则 `connect` 返回 `false`，可经 `lastError()` 获取原因。

### host.asr（结果回传桥）

语音插件把识别结果回传给宿主：

- `host.asr.emitFinal(text)` — 最终结果（整句上屏）
- `host.asr.emitPartial(text)` — 中间结果（实时预览）
- `host.asr.emitError(msg)` — 错误
- `host.asr.emitState(state)` — 状态更新

## 插件配置表单

插件通过 Lua 导出 `getSettingsSchema()` 声明设置表单，宿主直接渲染（无需插件 UI）：

```lua
function plugin.getSettingsSchema()
    return {
        {
            key = "apiKey",
            label = "API Key",
            type = "secret",          -- text | secret | select | multi_select | switch | number
            placeholder = "输入 API Key",
            defaultValue = "",
            helpText = "获取方式说明",
            section = "连接配置",      -- 可选，分组标题
            required = true,
        },
        {
            key = "region",
            label = "区域",
            type = "select",
            options = { "cn-north-1", "cn-east-1" },
        },
    }
end
```

字段类型与渲染方式：

| 类型 | 渲染 |
|------|------|
| `text` / `number` | 文本输入框（number 用数字键盘） |
| `secret` | 密码框 + 可见性切换 |
| `switch` | 开关（值存 `"true"` / `"false"`） |
| `select` | 下拉选择 |
| `multi_select` | 多选标签（逗号拼接存储） |

- 配置改动即持久化，存储于独立的 `plugin_cfg_<pluginId>` SharedPreferences
- 保存时校验所有 `required` 的 `secret` 字段非空
- `SELECT` / `MULTI_SELECT` 也可通过 `getOptions(key)` 动态拉取选项（如 ASR 模型列表）

## 打包与安装

### 打包

用仓库中的脚本打包（对 `plugins/` 下每个含 `manifest.yaml` 的目录生成 `<目录名>-<version>.xipk`）：

```bash
# Windows
powershell -File scripts/build-plugins.ps1

# macOS / Linux
bash scripts/build-plugins.sh
```

**关键点**：zip 条目名必须用 `/` 路径分隔符（不能用 `\`），否则 Android 侧解压时 `resources/` 会错乱。`build-plugins.sh` 内置 python3 脚本处理；`.ps1` 手动构造 zip 条目规避 `Compress-Archive` 的反斜杠问题。

打包产物输出到 `build/plugin-release/`，并复制到 `app/src/main/assets/plugins/` 随 APK 内置（debug 构建启动时自动安装）。

### 安装方式

1. **插件市场** - 「扩展商店 → 插件」标签页浏览下载（自动标记为官方信任）
2. **本地文件导入** - 插件管理页「从文件安装插件」（标记为第三方信任）
3. **浏览器导入** - 通过无线导入页面上传 `.xipk`

### 清除插件数据（调试用）

```bash
./gradlew clearPlugins      # 清除设备上的插件文件与注册表
./gradlew uninstallApp      # 完全卸载主应用
```

## 现有插件示例

| 插件 | 类型 | 特点 | 是否内置 |
|------|------|------|---------|
| kaomoji | emoji | 174 个颜文字表情，3 列布局，支持搜索 | ✅ 随 APK 内置 |
| meme-bunny | emoji | 恶搞兔表情包（6 张图片），`resources/emojis/` | ✅ 随 APK 内置 |
| funasr-asr | speech | 阿里百炼 FunAsr 在线识别（WebSocket 流式，自带标点） | 插件市场获取 |
| volc-asr | speech | 火山引擎流式识别（二进制协议 + gzip） | ✅ 随 APK 内置 |

## 常见问题

### 1. 插件无法发现或激活

- 检查 `manifest.yaml` 的 `id` 是否唯一且为反向域名风格
- 检查 `entry` 指向的脚本是否存在，且 `return` 了导出表
- 检查宿主版本是否满足 `minHostVersion` / `maxHostVersion`

### 2. 表情数据未显示

- `getEmojis()` 是否返回了正确的 table 结构（`id` / `text` / `category`）
- 插件是否已启用（表情插件为多选启用）
- 图片表情需确认 `host.resource.path()` 返回非 nil

### 3. WebSocket 连接失败

- 检查 `lastError()` 返回的原因
- 确认域名已声明在 `network.hosts` 中
- 确认插件已在插件中心为该域名授权
- 第三方插件无法连接未授权域名

### 4. 配置不生效

- 检查配置 key 与 `getSettingsSchema()` 中声明的一致
- `secret` 字段未填写时保存会被拒绝（`required` 校验）

## 参考文档

- [plugin-core 源码](https://github.com/ximeiorg/Xime/tree/main/plugin-core) - 核心实现
- [现有插件实现](https://github.com/ximeiorg/Xime/tree/main/plugins) - 学习最佳实践（funasr-asr / volc-asr / kaomoji / meme-bunny）
- [构建脚本](https://github.com/ximeiorg/Xime/tree/main/scripts) - `build-plugins.ps1` / `build-plugins.sh`

## 版本兼容

- 插件包要求 Xime **v2.6.0+**（Lua 插件架构）
- 建议声明 `minHostVersion` 为插件依赖的宿主 API 起始版本
