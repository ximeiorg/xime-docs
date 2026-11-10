# 按键外观与彩色键盘

::: info 适用平台
**仅 Android**。这是触屏键盘或 Android 端专属功能，Windows / Linux 桌面版没有对应入口。
:::


> **版本要求**：v3.5.0+

Xime 支持在 `xime.custom.yaml` 里对单个按键设置圆角和背景。可以用它做彩色键盘、强调某个功能键，或者让按键跟随当前主题色。

## 快速开始

```yaml
metadata:
  app_name: Xime
  config_version: 1

keyboard:
  qwerty:
    keys:
      space:
        corner_radius: 22
        background: accent          # 跟随当前主题强调色
      enter:
        corner_radius: 16
        background: 0x9FEF86        # 固定色
        background_dark: 0x2F5A2F   # 暗色模式
      delete:
        background: special
```

保存到手机 `rime/xime.custom.yaml`，重新部署即可生效。

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `corner_radius` | 整数 | 该键圆角（dp）；不写时沿用 `keyboard.key` 的键盘级 / 全局圆角 |
| `background` | 颜色 / 主题色记号 | 该键背景色；不写时沿用主题按键底色 |
| `background_dark` | 颜色 / 主题色记号 | 暗色模式背景；不写时若 `background` 是主题色记号，会自动取暗色主题对应色 |

## 固定颜色

`background` / `background_dark` 可以直接写十六进制颜色：

```yaml
keyboard:
  qwerty:
    keys:
      q: { background: 0xFFFF8A80 }
      w: { background: 0x80FFB74D }              # 带透明度
      e: { background: 0xFFFFD54F, background_dark: 0xFFF57F17 }
```

- `0xRRGGBB`：不透明颜色
- `0xAARRGGBB`：带透明度
- 只写 `background` 时，暗色模式沿用同一个颜色；需要单独指定就写 `background_dark`

## 跟随主题色

如果写死颜色，用户切换主题后不会变化。把 `background` 写成主题色记号即可自动跟随：

| 记号 | 含义 |
|------|------|
| `accent` / `primary` | 主题强调色 |
| `special` | 特殊键底色（shift / 回车 / 退格等） |
| `key` | 普通键底色 |
| `keyboard` | 键盘背景色 |

```yaml
keyboard:
  qwerty:
    keys:
      space: { background: accent }
      enter: { background: primary }
      shift: { background: special }
      q: { background: key }
      comma: { background: keyboard }
```

- 大小写不敏感
- 可以带 `theme.` 前缀，例如 `theme.accent`
- 暗色模式下会自动取暗色主题的对应颜色；需要单独指定时再写 `background_dark`

## 只改外观，不丢手势

`keys.<id>` 原本是「整键替换」。为了避免彩色键盘把点按、上滑数字、长按候选弄丢，现在有两条规则：

- **只写 `corner_radius` / `background` / `background_dark`**：保留该键原有的 `tap` / `swipe_*` / `long_press` / `width`
- **同时写了任一行为字段**（`tap` / `swipe_*` / `long_press` / `width`）：仍按整键替换，未写的手势不会继承默认值

```yaml
# 只改颜色：q 的上滑数字、长按候选都保留
q: { background: accent }

# 改了手势：整键替换，需要把要保留的手势一并写上
q: { tap: "q", swipe_up: "1", background: accent }
```

## 作用范围

| 键盘 | 是否支持 |
|------|----------|
| 26 键全键盘（中文 / 英文） | ✅ |
| 数字面板 | ✅ |
| 常用符号面板 | ✅ |
| 九键 T9 | ❌ |
| 笔画 | ❌ |
| 手写 | ❌ |

## 完整示例

仓库里提供了两份可直接导入的配置：

- [`config_examples/colorful`](https://github.com/ximeiorg/Xime/tree/main/docs/config_examples/colorful)：26 键中英文 + 数字面板的彩色键盘
- [`config_examples/theme_accent`](https://github.com/ximeiorg/Xime/tree/main/docs/config_examples/theme_accent)：按键跟随主题强调色

## 小提示

- 按键背景改色后，键面文字会根据背景亮度自动选择深色或浅色。
- 按键级圆角会同步应用到该键的阴影，不会出现「两种圆角叠在一起」。
- 如果只想强调个别键（空格、回车、退格），优先用主题色记号，这样切换主题时不会破坏整体配色。
