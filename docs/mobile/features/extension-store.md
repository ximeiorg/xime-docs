# 扩展商店

Xime 的扩展商店（设置 → 扩展 → 扩展商店）集中提供**输入方案、模型、插件**的下载与安装，是 v2.6.0 新增的一站式扩展中心。

## 功能概览

扩展商店分为四个标签页：

- **方案** - 浏览并下载第三方输入方案（如雾凇拼音、郑码等）
- **模型** - 浏览并下载 AI 模型（智能联想、手写识别），支持多版本选择
- **插件** - 浏览并下载脚本插件（表情、语音识别、工具等）
- **布局** - 浏览主题与布局，一键应用到当前 `xime.custom.yaml`

在「方案」「模型」标签页右上角有「本地管理」入口，可直接进入本地方案 / 本地模型管理页。

各分类标签页会显示**更新角标与可更新数量**（v3.0.0+），已安装内容有新版本时一眼可见；安装与已装内容冲突时，会弹窗列出具体的冲突明细。

## 索引机制

- 商店内容来自索引文件（`xime_index.base_urls` 配置，默认 `https://index.ximei.me/`，可配置多个镜像）
- 下载器按顺序遍历镜像，第一个成功即返回
- 索引更新自动检测，下拉可刷新

## 方案市场

- 每个方案卡片显示名称、作者、描述、版本与标签
- 支持选择特定版本下载
- 支持查看版本历史与更新日志
- 已安装方案标记安装状态，有新版时提示更新

## 模型市场

- 模型按分类浏览（联想 / 手写 / 语音 / 其他）
- 支持多版本管理与选择下载
- 下载校验 SHA-256，支持进度显示
- 已下载模型可在「设置 → 模型管理」中查看、删除
- 详情页有本地模型使用警告：*"使用本地模型是有代价的，它可能会占用内存和 CPU，导致手机发热，请斟酌使用。"*

## 插件市场

- 插件按类型分类：表情 / 语音转文本 / 智能预测 / 剪贴板同步 / 备份 / 工具 / 其他
- 卡片显示插件图标、名称、作者、版本与描述
- 支持查看网络权限声明并逐域名授权
- 下载自动校验 SHA-256，来源标记为官方信任
- 支持安装/更新/卸载管理
- 自动刷新本地已安装插件状态（v2.6.2+），已安装插件在商店中正确标记

## 布局市场

- 浏览应用布局与主题，卡片显示名称与描述
- 支持查看布局详情（详情页已重构，v3.4.3+ 交互优化）
- 点击「应用」后会**覆盖当前的 `xime.custom.yaml`**（不保留备份）；应用前会弹出确认对话框，布局自带的警告信息也会一并展示（v3.4.3+）
- 缺依赖或需更高版本时会禁用「应用」按钮

## 上架自己的内容

商店里的方案、模型、插件、布局都来自索引仓库 [ximeiorg/xime-index](https://github.com/ximeiorg/xime-index)。索引只保存**引用**——下载地址、`sha256`、版本、简介，文件本身放在作者自己的 GitHub Release 里。

| 上架内容 | 索引目录 | 作者侧产物 |
| --- | --- | --- |
| 布局 / 配色 | `src/layouts/` | `xime.custom.yaml`；含主题、字体等资源时打包为根级 zip |
| 插件（Xime 3.0+） | `src/plugins/v2/` | `.xipk`（`manifest.json` + `main.js` + `resources/`） |
| 旧版插件（Xime < 3.0） | `src/plugins/v1/` | Lua / DEX `.xipk`，仅维护旧版 App |
| 输入方案 | `src/rimes/` | `.zip` / `.tar.gz`，含 `.schema.yaml` 与 `.dict.yaml` |
| 模型 | `src/models/` | 文件清单或 `.tar.bz2` 归档 |

### 手工上架

1. 把产物上传为 GitHub Release 附件。分支归档、raw、jsDelivr 的内容会变，`sha256` 随之失效。
2. 在 `xime-index` 的 `src/<类型>/<id>.yaml` 填写版本、下载地址、`sha256`、文件大小和 License。
3. 本地校验字段、zip 结构、`schema_id`、附件哈希，再从 `upstream/main` 建分支提 PR——只改 `src/`，不碰自动生成的子索引。
4. 维护者合并后 CI 重新生成索引，商店内容随索引更新。

> 一个 PR 只做一个条目；历史版本和旧 Release 附件要保留，不要覆盖旧 tag。完整规则见 [CONTRIBUTING.md](https://github.com/ximeiorg/xime-index/blob/main/CONTRIBUTING.md)。

### 用 AI 技能上架（xime-skills）

[xime-skills](https://github.com/tiengming/xime-skills) 是面向曦码扩展生态的 Agent Skills，当前包含 `xime-index-submit` 技能，把上面的流程交给 AI 编程助手执行：读产物、算哈希、写条目、跑校验，只在 `git push` 和创建 PR 前征求你的确认。

```bash
npx skills add tiengming/xime-skills --skill xime-index-submit -g
```

`-g` 表示装到用户级目录 `~/.agents/skills/`，所有项目可用；去掉 `-g` 只装到当前项目。需要 Python 3.10+ 与 PyYAML；`gh`（自动开 PR）、`uv`、`npx` 可选，缺少时技能会给出替代步骤。

安装后直接把链接交给助手：

```text
使用 xime-index-submit 技能，把这个仓库的输入方案上架到曦码扩展商店：
https://github.com/you/rime-scheme
```

更新版本、修 PR 同理：`用 xime-index-submit 把 my_schema 更新到 1.3.0`、`用 xime-index-submit 修一下这个 PR 的 CI 失败：<链接>`。

技能按 9 个阶段执行：预检（含跨平台 `gh` 探测与登录状态）→ 分类 → 产物校验 → 下载附件实测 `sha256` → 写 `src/` 条目 → 本地校验 → 提交 PR（需你确认）→ 盯 CI → 合并后确认。它不会合并 PR、不会读取 token，也不会提交自动生成的子索引。

### 常见问题

- **找不到 `gh`**：技能先在 `PATH`、再在常见安装目录（Windows 的 `%LOCALAPPDATA%\Programs\GitHub CLI`、Scoop / Chocolatey / WinGet，macOS 的 `/opt/homebrew/bin`，Linux 的 `~/.local/bin`、`/snap/bin` 等）查找；仍然没有时会给出跨仓库比较链接，可手动创建 PR。
- **下载失败 / 网络受阻**：技能会提示是否需要代理，只列代理环境变量名、不打印值；设置 `https_proxy` 后重试，不要改用本地哈希或跳过校验。
- **`schema_id` 与 `id` 不一致**：索引文件名、条目 `id`、包内主方案的 `schema_id` 必须一致（标准写法在 `schema:` 段内）。
- **`sha256` 对不上**：先确认附件是否传错；内容确实变了要发新版本（新 tag + 新附件），不要覆盖旧 tag。
- **PR 没有 CI 检查**：上游 Validate 只监听生成路径，只改 `src/` 的 PR 本来就不触发检查，以本地校验为准。

## 相关文档

- [插件管理](/plugins/) - 插件列表与开发指南
- [智能联想](smart-prediction.md) - 模型下载与管理
- [输入方案](input-scheme.md) - 方案导入与切换
