<template>
  <footer id="site-footer" class="x-site-footer">
    <div class="xsf-glow" aria-hidden="true"></div>

    <div class="xsf-main">
      <!-- 品牌区 -->
      <div class="xsf-brand">
        <div class="xsf-logo" aria-hidden="true">曦</div>
        <div class="xsf-brand-text">
          <p class="xsf-name">曦码输入法</p>
          <p class="xsf-eyebrow">XIME IME</p>
        </div>
        <p class="xsf-tagline">
          基于 Rime 引擎的跨平台中文输入法。五笔、拼音与自定义方案，
          端侧模型驱动联想与标点，数据只留在你的设备上。
        </p>

        <ul class="xsf-plats">
          <li v-for="p in platforms" :key="p.name">
            <a :href="p.link">
              <span class="xsf-dot" :class="p.cls"></span>{{ p.name }}
            </a>
          </li>
        </ul>

        <div class="xsf-social">
          <a href="https://github.com/ximeiorg" target="_blank" rel="noopener" aria-label="GitHub 组织">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 5 18.3 5.3 18.3 5.3c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/></svg>
            GitHub
          </a>
          <a href="https://blog.ximei.me" target="_blank" rel="noopener" aria-label="博客">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            博客
          </a>
        </div>
      </div>

      <!-- 链接区 -->
      <nav class="xsf-cols" aria-label="站点导航">
        <div v-for="group in groups" :key="group.title" class="xsf-col">
          <p class="xsf-col-title">{{ group.title }}</p>
          <ul>
            <li v-for="link in group.links" :key="link.text">
              <a
                :href="link.href"
                :title="link.desc"
                v-bind="link.ext ? { target: '_blank', rel: 'noopener' } : {}"
              >
                {{ link.text }}
                <span v-if="link.note" class="xsf-note">{{ link.note }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="xsf-bottom">
      <p class="xsf-copy">
        <span>© 2024–2026 Xime</span>
        <span class="xsf-sep">·</span>
        <span>Android / Windows / Linux 端与本站文档以 GPL-3.0 开源</span>
        <span class="xsf-sep">·</span>
        <span>鸿蒙与 macOS 版闭源内测</span>
      </p>
      <p class="xsf-meta">
        本站由 <a href="https://vitepress.dev" target="_blank" rel="noopener">VitePress</a> 构建
        <span class="xsf-sep">·</span>
        <a href="https://github.com/ximeiorg/xime-docs" target="_blank" rel="noopener">参与完善文档</a>
        <span class="xsf-sep">·</span>
        <a href="#" @click.prevent="toTop">回到顶部</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const platforms = [
  { name: 'Android', link: '/mobile/usage', cls: 'is-ok' },
  { name: '鸿蒙', link: '/harmony/install', cls: 'is-inner' },
  { name: 'Windows', link: '/pc/usage', cls: 'is-beta' },
  { name: 'Linux', link: '/ximeche/install', cls: 'is-beta' },
  { name: 'macOS', link: '/ximeyi/install', cls: 'is-inner' }
]

const groups = [
  {
    title: '产品',
    links: [
      { text: 'Android 版', href: '/mobile/usage', note: '稳定版' },
      { text: '鸿蒙版', href: '/harmony/install', note: '内测' },
      { text: 'Windows 版', href: '/pc/usage', note: 'Beta' },
      { text: 'Linux 版', href: '/ximeche/install', note: 'Beta' },
      { text: 'macOS 版', href: '/ximeyi/install', note: '内测' }
    ]
  },
  {
    title: '资源',
    links: [
      { text: '方案市场', href: '/rime-list' },
      { text: '模型库', href: '/model-list' },
      { text: '布局库', href: '/layout-list' },
      { text: '插件中心', href: '/plugin-list' },
      { text: '设备互联', href: '/device-link/' }
    ]
  },
  {
    title: '帮助',
    links: [
      { text: '功能文档', href: '/features/' },
      { text: '常见问题', href: '/mobile/faq' },
      { text: '扩展商店', href: '/features/extension-store' },
      { text: '更新日志', href: '/mobile/changelog' },
      { text: '设备互联常见问题', href: '/device-link/faq' }
    ]
  },
  {
    title: '开源项目',
    links: [
      { text: 'Xime', href: 'https://github.com/ximeiorg/Xime', note: 'Android', ext: true, desc: '安卓输入法，Kotlin + Rime，1.4k Star' },
      { text: 'XimeYao', href: 'https://github.com/ximeiorg/XimeYao', note: 'Windows', ext: true, desc: 'Windows 五笔/拼音输入法，Rust' },
      { text: 'XimeChe', href: 'https://github.com/ximeiorg/XimeChe', note: 'Linux', ext: true, desc: 'Linux 原生输入法，Rust + KWin' },
      { text: 'xime-docs', href: 'https://github.com/ximeiorg/xime-docs', note: '本站', ext: true, desc: '本站文档源文件，欢迎 PR' },
      { text: '全部 29 个仓库', href: 'https://github.com/ximeiorg', note: '→', ext: true, desc: '输入法、模型与方案库都在这个组织下' }
    ]
  }
]

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
