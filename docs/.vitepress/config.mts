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
    // ── 文档结构（2026-11-11 调整）──
    // 1. 落地页只有一个：/（CustomHome），Android / Windows / Linux 三端共用；
    //    /mobile/、/pc/、/ximeche/ 的 index 都重定向到各自的安装/使用页，不再单独做落地页。
    // 2. 通用功能文档统一放 /features/，页首标注适用平台；平台差异写进平台文档。
    // 3. 安装、启用、设置程序、数据目录按平台分开：/mobile/、/pc/、/ximeche/。
    // 4. 设备互联（/device-link/）是跨设备功能，单独成区。
    nav: [
      { text: '首页', link: '/' },
      {
        text: '文档',
        items: [
          { text: '功能文档', link: '/features/' },
          { text: 'Android 使用文档', link: '/mobile/usage' },
          { text: 'Windows 使用文档', link: '/pc/usage' },
          { text: 'Linux 使用文档', link: '/ximeche/install' }
        ]
      },
      {
        text: '设备互联',
        items: [
          { text: '使用指南', link: '/device-link/' },
          { text: '手机端（Android）', link: '/device-link/android' },
          { text: '桌面端（ximed）', link: '/device-link/ximed' },
          { text: '常见问题', link: '/device-link/faq' }
        ]
      },
      {
        text: '资源',
        items: [
          { text: '方案市场', link: '/rime-list' },
          { text: '模型', link: '/model-list' },
          { text: '布局', link: '/layout-list' },
          { text: '插件', link: '/plugin-list' }
        ]
      },
      {
        text: '帮助',
        items: [
          { text: 'Android 常见问题', link: '/mobile/faq' },
          { text: 'Windows 常见问题', link: '/pc/faq' },
          { text: 'Linux 常见问题', link: '/ximeche/faq' },
          { text: 'Android 更新日志', link: '/mobile/changelog' },
          { text: 'Windows 更新日志', link: '/pc/changelog' }
        ]
      }
    ],

    sidebar: {
      '/features/': [
        {
          text: '功能文档',
          items: [{ text: '功能总览', link: '/features/' }]
        },
        {
          text: '输入与词库',
          items: [
            { text: '输入方案', link: '/features/input-scheme' },
            { text: '词库管理', link: '/features/dictionary' },
            { text: '部署方案', link: '/features/deployment' }
          ]
        },
        {
          text: '外观与交互',
          items: [
            { text: '键盘调节', link: '/features/keyboard-adjustment' },
            { text: '按键外观与彩色键盘', link: '/features/keyboard-appearance' },
            { text: '悬浮键盘', link: '/features/floating-keyboard' },
            { text: '工具栏自定义', link: '/features/toolbar' },
            { text: '键盘配置（新版）', link: '/features/keyboard-config-v2' },
            { text: '键盘配置（旧版）', link: '/features/keyboard-config' }
          ]
        },
        {
          text: '工具',
          items: [
            { text: '剪贴板', link: '/features/clipboard' },
            { text: '快捷发送', link: '/features/quick-send' },
            { text: '表情', link: '/features/emoji' },
            { text: '计算器', link: '/features/calculator' },
            { text: '手写输入', link: '/features/handwriting' }
          ]
        },
        {
          text: '智能与语音',
          items: [
            { text: '语音转文本', link: '/features/speech-to-text' },
            { text: '智能联想', link: '/features/smart-prediction' },
            { text: '智能纠错', link: '/features/correction' }
          ]
        },
        {
          text: '扩展与同步',
          items: [
            { text: '扩展商店', link: '/features/extension-store' },
            { text: '云备份', link: '/features/cloud-backup' },
            { text: '设备互联', link: '/device-link/' },
            { text: '插件', link: '/plugins/' }
          ]
        },
        {
          text: '旧版',
          items: [
            { text: 'WebDAV 同步（已移除）', link: '/features/webdav-sync' }
          ]
        }
      ],
      '/mobile/': [
        {
          text: '开始',
          items: [
            { text: '使用文档', link: '/mobile/usage' },
            { text: '常见问题', link: '/mobile/faq' },
            { text: '更新日志', link: '/mobile/changelog' }
          ]
        },
        {
          text: '功能文档',
          items: [
            { text: '功能总览', link: '/features/' },
            { text: '输入方案', link: '/features/input-scheme' },
            { text: '剪贴板', link: '/features/clipboard' },
            { text: '语音转文本', link: '/features/speech-to-text' },
            { text: '键盘调节', link: '/features/keyboard-adjustment' },
            { text: '悬浮键盘', link: '/features/floating-keyboard' },
            { text: '手写输入', link: '/features/handwriting' },
            { text: '智能联想', link: '/features/smart-prediction' },
            { text: '智能纠错', link: '/features/correction' }
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
          text: 'Windows（曦码·曜）',
          items: [
            { text: '总览与安装', link: '/pc/usage' },
            { text: '输入方案（Windows）', link: '/pc/input-scheme' },
            { text: '计算器', link: '/features/calculator' },
            { text: '常见问题', link: '/pc/faq' },
            { text: '更新日志', link: '/pc/changelog' }
          ]
        },
        {
          text: '功能文档',
          items: [
            { text: '功能总览', link: '/features/' },
            { text: '剪贴板', link: '/features/clipboard' },
            { text: '语音转文本', link: '/features/speech-to-text' },
            { text: '云备份', link: '/features/cloud-backup' }
          ]
        }
      ],
      // 设备互联是跨设备形态的功能分区（Android + ximed 桌面端）。
      '/device-link/': [
        {
          text: '设备互联',
          items: [
            { text: '使用指南', link: '/device-link/' },
            { text: '手机端（Android）', link: '/device-link/android' },
            { text: '桌面端（ximed）', link: '/device-link/ximed' },
            { text: '常见问题', link: '/device-link/faq' }
          ]
        }
      ],
      // 曦码·澈是 Linux 原生输入法，与「曦码·曜」（Windows）是两条独立产品线。
      '/ximeche/': [
        {
          text: '曦码·澈（Linux）',
          items: [
            { text: '总览与安装', link: '/ximeche/install' },
            { text: '使用与设置', link: '/ximeche/usage' },
            { text: '常见问题', link: '/ximeche/faq' }
          ]
        },
        {
          text: '功能文档',
          items: [
            { text: '功能总览', link: '/features/' },
            { text: '输入方案', link: '/features/input-scheme' },
            { text: '剪贴板', link: '/features/clipboard' },
            { text: '语音转文本', link: '/features/speech-to-text' },
            { text: '扩展商店', link: '/features/extension-store' },
            { text: '云备份', link: '/features/cloud-backup' }
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
