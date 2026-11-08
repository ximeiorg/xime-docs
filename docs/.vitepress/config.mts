import { defineConfig } from 'vitepress'
import { load as loadYaml } from 'js-yaml'
import { fileURLToPath } from 'node:url'
import { pageMarkdown } from './plugins/pageMarkdown'

const INDEX_BASE = 'https://index.ximei.me'
const SRC_DIR = fileURLToPath(new URL('..', import.meta.url))

const INDEX_PAGES: Record<string, { field: string; path: string }> = {
  'plugin-list.md': { field: 'pluginIndex', path: '/plugins/v2/index.yaml' },
  'rime-list.md': { field: 'rimeIndex', path: '/rimes/index.yaml' },
  'model-list.md': { field: 'modelIndex', path: '/models/index.yaml' },
  'layout-list.md': { field: 'layoutIndex', path: '/layouts/index.yaml' }
}

const indexCache: Record<string, { promise: Promise<any>; time: number }> = {}

// 缓存 60 秒：远程索引更新后无需重启 dev server 即可拿到新数据
const INDEX_TTL_MS = 60_000

function fetchIndex(path: string): Promise<any> {
  const cached = indexCache[path]
  if (cached && Date.now() - cached.time < INDEX_TTL_MS) {
    return cached.promise
  }
  const entry = {
    time: Date.now(),
    promise: fetch(INDEX_BASE + path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => loadYaml(text))
      .catch(() => null)
  }
  indexCache[path] = entry
  return entry.promise
}

export default defineConfig({
  title: "Xime 输入法",
  description: "基于 Rime 引擎构建的 Android 输入法",
  lang: 'zh-CN',
  base: '/',
  // mobile/faq-items/ 下的 md 是 FAQ 页的数据源(经 content loader 收集),不作为独立页面构建
  // dist/ 是历史产物,避免被当成 /dist/* 页面重复构建
  srcExclude: ['**/faq-items/**', '**/dist/**'],
  async transformPageData(pageData) {
    const conf = INDEX_PAGES[pageData.relativePath]
    if (!conf) return
    const index = await fetchIndex(conf.path)
    if (!index) return
    return {
      frontmatter: { ...pageData.frontmatter, [conf.field]: index }
    }
  },
  // 告诉 AI 爬虫/浏览器：本页有 Markdown 版本（Mintlify、Fumadocs 等站点同样约定）
  transformHead({ page, pageData, siteData }) {
    if (!page.endsWith('.md')) return []
    const layout = pageData.frontmatter.layout
    if ((layout && layout !== 'doc') || pageData.frontmatter.copyMarkdown === false) return []
    return [
      [
        'link',
        {
          rel: 'alternate',
          type: 'text/markdown',
          href: `${siteData.base}${page}`
        }
      ]
    ]
  },
  vite: {
    server: {
      host: '127.0.0.1',
      port: 3000
    },
    plugins: [
      // 为每个页面生成同路径的 .md 版本，供「复制 MD」按钮读取
      pageMarkdown({ srcDir: SRC_DIR, exclude: ['mobile/faq-items'] })
    ]
  },
  themeConfig: {
    // ── 设备形态分区（2026-10-31 确立）──
    // 手机版 / 桌面版各只有一份共享文档，不分具体平台；
    // 平台操作差异用 PlatTabs 组件在文内区分（示例见 docs/pc/usage.md 的安装/数据目录）。
    // 新平台加入时：在对应分区的相关页面加标签页即可；新设备形态才需要建目录 + nav 加项 + sidebar 加前缀键。
    nav: [
      { text: '首页', link: '/' },
      {
        text: '手机版',
        items: [
          { text: '主页', link: '/mobile/' },
          { text: '使用文档', link: '/mobile/usage' },
          { text: '功能一览', link: '/mobile/features' },
          { text: '更新日志', link: '/mobile/changelog' },
          { text: '常见问题', link: '/mobile/faq' },
          { text: '下载', link: 'https://github.com/ximeiorg/Xime/releases' }
        ]
      },
      {
        text: '桌面版',
        items: [
          { text: '主页', link: '/pc/' },
          { text: '使用文档', link: '/pc/usage' },
          { text: '更新日志', link: '/pc/changelog' },
          { text: '常见问题', link: '/pc/faq' },
          { text: '下载（Beta）', link: 'https://github.com/ximeiorg/XimeYao/releases' }
        ]
      },
      { text: '方案', link: '/rime-list' },
      { text: '模型', link: '/model-list' },
      { text: '布局', link: '/layout-list' },
      { text: '插件', link: '/plugin-list' }
    ],

    sidebar: {
      '/mobile/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/mobile/' },
            { text: '使用文档', link: '/mobile/usage' },
            { text: '更新日志', link: '/mobile/changelog' }
          ]
        },
        {
          text: '方案与词库',
          items: [
            { text: '输入方案', link: '/mobile/features/input-scheme' },
            { text: '词库管理', link: '/mobile/features/dictionary' },
            { text: '部署方案', link: '/mobile/features/deployment' }
          ]
        },
        {
          text: '外观与交互',
          items: [
            { text: '键盘调节', link: '/mobile/features/keyboard-adjustment' },
            { text: '按键外观与彩色键盘', link: '/mobile/features/keyboard-appearance' },
            { text: '悬浮键盘', link: '/mobile/features/floating-keyboard' }
          ]
        },
        {
          text: '智能与扩展',
          items: [
            { text: '智能联想', link: '/mobile/features/smart-prediction' },
            { text: '智能纠错', link: '/mobile/features/correction' },
            { text: '语音转文本', link: '/mobile/features/speech-to-text' },
            { text: '扩展商店', link: '/mobile/features/extension-store' },
            { text: '插件管理', link: '/plugins/' }
          ]
        },
        {
          text: '同步与备份',
          items: [
            { text: '云备份', link: '/mobile/features/cloud-backup' },
            { text: 'WebDAV 同步（已移除）', link: '/mobile/features/webdav-sync' }
          ]
        },
        {
          text: '工具',
          items: [
            { text: '剪贴板', link: '/mobile/features/clipboard' },
            { text: '快捷发送', link: '/mobile/features/quick-send' },
            { text: '表情', link: '/mobile/features/emoji' },
            { text: '计算器', link: '/mobile/features/calculator' },
            { text: '手写输入', link: '/mobile/features/handwriting' },
            { text: '工具栏自定义', link: '/mobile/features/toolbar' },
            { text: '键盘配置自定义（旧版）', link: '/mobile/features/keyboard-config' },
            { text: '键盘配置自定义（新版）', link: '/mobile/features/keyboard-config-v2' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: '插件',
          items: [
            { text: '插件管理', link: '/plugins/' },
            { text: '开发教程', link: '/plugins/PLUGIN_DEV_TUTORIAL' },
            { text: '开发指南', link: '/plugins/PLUGIN_DEVELOPMENT_GUIDE' },
            { text: '测试指南', link: '/plugins/TESTING' }
          ]
        }
      ],
      '/pc/': [
        {
          text: '桌面版（曦码·曜）',
          items: [
            { text: '总览与安装', link: '/pc/usage' },
            { text: '输入方案', link: '/pc/input-scheme' },
            { text: '计算器', link: '/pc/calculator' },
            { text: '常见问题', link: '/pc/faq' },
            { text: '更新日志', link: '/pc/changelog' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ximeiorg' }
    ],

    footer: {
      message: '基于 GPLv3 许可发布',
      copyright: 'Copyright © 2024 Xime'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})
