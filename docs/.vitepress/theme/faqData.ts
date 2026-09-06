/** B 站视频与常见问题数据，后续新增内容直接在数组里追加 */

export interface FaqVideo {
  bvid: string
  title: string
  /** faq = 常见问题演示，tutorial = 教程 */
  kind: 'faq' | 'tutorial'
}

export interface FaqItem {
  category: string
  q: string
  a: string
  /** 可选关联视频的 bvid */
  video?: string
  /** 可选文档链接 */
  linkHref?: string
  linkText?: string
}

export const videos: FaqVideo[] = [
  {
    bvid: 'BV1Bq4o6tEu9',
    title: '曦码输入法用万象方案时怎么切双拼？',
    kind: 'faq'
  },
  {
    bvid: 'BV1A6496fEBF',
    title: '曦码输入法 WebDAV 跨设备同步剪贴板插件演示',
    kind: 'faq'
  },
  {
    bvid: 'BV1Pvgx6rEfv',
    title: '如何自定义你的键盘：五笔字根、小鹤双拼韵母、微软双拼分号键',
    kind: 'tutorial'
  }
]

export const faqCategories = [
  '基础使用',
  '方案与词库',
  '语音输入',
  '同步与备份',
  '个性化'
]

export const faqs: FaqItem[] = [
  {
    category: '基础使用',
    q: '如何启用曦码输入法？',
    a: '安装后打开 Xime 应用：① 点击「启用输入法」进入系统设置，打开 Xime 输入法开关；② 返回应用点击「选择输入法」，在弹窗中选择曦码即可。',
    linkHref: '/usage',
    linkText: '完整安装步骤'
  },
  {
    category: '基础使用',
    q: '如何切换中英文？',
    a: '点击键盘候选栏左侧的「中/英」按钮即可切换；Shift 键用于切换英文大小写。'
  },
  {
    category: '基础使用',
    q: '主题切换后没有变化？',
    a: '主题切换需要重启输入法才能生效：切换到其他输入法再切回来，或重启设备。'
  },
  {
    category: '基础使用',
    q: '为什么有些候选词没有显示编码？',
    a: '部分词条可能没有编码注释信息，这取决于 Rime 方案的配置。'
  },
  {
    category: '基础使用',
    q: '切换输入方案后没有生效？',
    a: '切换方案后，需要在输入法菜单中点击「重载配置」，等待几秒即可生效。'
  },
  {
    category: '方案与词库',
    q: '内置了哪些输入方案？',
    a: '内置五笔 86（含拼音混输）、简体拼音、T9 九宫格拼音等方案；更多社区方案可在「扩展商店 → 方案」中安装，完整列表见方案中心。',
    linkHref: '/rime-list',
    linkText: '前往方案中心'
  },
  {
    category: '方案与词库',
    q: '用万象方案时怎么切双拼？',
    a: '万象方案的双拼切换方式见下方视频演示。',
    video: 'BV1Bq4o6tEu9'
  },
  {
    category: '方案与词库',
    q: '怎么导入自己的 Rime 方案？',
    a: '在输入法键盘点击右上角菜单 →「浏览器导入」，手机和电脑连接同一网络，在电脑浏览器中输入手机显示的地址，上传 .yaml / .zip 方案文件，回到应用点击「部署」即可生效。',
    linkHref: '/features/input-scheme',
    linkText: '输入方案文档'
  },
  {
    category: '语音输入',
    q: '语音识别需要联网吗？',
    a: '不强制。本地离线识别模型（v2.6.0+）下载后完全离线运行，语音数据不上传；也可以安装阿里百炼 FunAsr、火山引擎等在线 ASR 插件获得更高准确率，在线识别需要网络。',
    linkHref: '/features/speech-to-text',
    linkText: '语音转文本文档'
  },
  {
    category: '语音输入',
    q: '语音功能不能用，提示无权限？',
    a: '语音转文本需要录音权限。请到系统设置 → 应用 → 曦码输入法 → 权限中允许「麦克风」；在线识别还需要网络权限。'
  },
  {
    category: '同步与备份',
    q: '如何跨设备同步剪贴板？',
    a: '安装「WebDAV 剪贴板同步」插件，配置同一 WebDAV 账号即可在多台设备间双向同步剪贴板文本，配置方式见下方视频演示。',
    video: 'BV1A6496fEBF'
  },
  {
    category: '同步与备份',
    q: '怎么备份我的方案、词库和设置？',
    a: '云备份（v2.8.0+）通过备份插件将 Rime 配置与词库、应用设置、插件及插件配置打包备份到云端（如 WebDAV），并支持一键恢复。旧版内置 WebDAV 同步已在 v2.8.0 移除，由备份插件替代。',
    linkHref: '/features/cloud-backup',
    linkText: '云备份文档'
  },
  {
    category: '个性化',
    q: '如何自定义键盘按键？',
    a: '通过 xime.custom.yaml 配置文件可以自定义按键的单击、上滑、下滑、长按行为，例如五笔字根、小鹤双拼韵母、分号键等。具体写法见全键盘配置教程，也可先看下方视频了解能做什么。',
    video: 'BV1Pvgx6rEfv',
    linkHref: '/features/keyboard-config',
    linkText: '全键盘配置教程'
  },
  {
    category: '个性化',
    q: '可以更换键盘字体吗？',
    a: '可以（v2.8.0+）。在「输入方案 → 浏览器导入」中上传 .ttf / .otf / .woff / .woff2 字体文件（自动保存到 rime/fonts/），然后在 xime.custom.yaml 的 keyboard.fonts 中分别指定按键、字根、候选等字体，重新部署生效。',
    linkHref: '/features/keyboard-config',
    linkText: '字体配置说明'
  }
]
