import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Xime 输入法",
  description: "基于 Rime 引擎构建的 Android 输入法",
  lang: 'zh-CN',
  base: '/',
  vite: {
    server: {
      host: '127.0.0.1',
      port: 3000
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '使用文档', link: '/usage' },
      { text: '插件', link: '/plugins/' },
      { text: '更新日志', link: '/changelog' },
      { text: '下载', link: 'https://github.com/ximeiorg/Xime/releases' }
    ],

    sidebar: {
      '/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/' },
            { text: '使用文档', link: '/usage' },
            { text: '更新日志', link: '/changelog' }
          ]
        },
        {
          text: '方案与词库',
          items: [
            { text: '输入方案', link: '/features/input-scheme' },
            { text: '词库管理', link: '/features/dictionary' },
            { text: '部署方案', link: '/features/deployment' }
          ]
        },
        {
          text: '外观与交互',
          items: [
            { text: '键盘调节', link: '/features/keyboard-adjustment' }
          ]
        },
        {
          text: '智能与扩展',
          items: [
            { text: '智能联想', link: '/features/smart-prediction' },
            { text: '语音转文本', link: '/features/speech-to-text' },
            { text: '插件管理', link: '/plugins/' }
          ]
        },
        {
          text: '同步与备份',
          items: [
            { text: 'WebDAV 同步', link: '/features/webdav-sync' }
          ]
        },
        {
          text: '工具',
          items: [
            { text: '剪贴板', link: '/features/clipboard' },
            { text: '快捷发送', link: '/features/quick-send' },
            { text: '表情', link: '/features/emoji' },
            { text: '计算器', link: '/features/calculator' },
            { text: '手写输入', link: '/features/handwriting' },
            { text: '工具栏自定义', link: '/features/toolbar' },
            { text: '键盘配置自定义', link: '/features/keyboard-config' }
          ]
        },
        {
          text: '关于',
          items: [
            { text: '插件开发指南', link: '/plugins/PLUGIN_DEVELOPMENT_GUIDE' },
            { text: '测试指南', link: '/plugins/TESTING' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ximeiorg/Xime' }
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
