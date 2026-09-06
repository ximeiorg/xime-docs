<template>
  <div class="x-home">
    <div class="x-hero-bg" aria-hidden="true">
      <div class="x-blob x-blob-1"></div>
      <div class="x-blob x-blob-2"></div>
      <div class="x-grid-overlay"></div>
    </div>

    <!-- ===== Hero ===== -->
    <section class="xidx-hero">
      <div class="xidx-hero-inner">
        <div class="x-section-label">插件中心</div>
        <div class="xidx-eyebrow">LUA PLUGINS</div>
        <h1 class="x-hero-title"><span class="x-title-shine">Xime 插件</span></h1>
        <p class="xidx-sub">Lua 脚本插件 · 以 .xipk 分发 · 随 Xime v2.6.0+ 使用</p>
        <p class="xidx-desc">
          插件可为 Xime 扩展颜文字、表情包、语音识别等能力。可通过「扩展商店」在线安装，或从本地文件导入。
        </p>
        <p v-if="updatedAt" class="xidx-updated">插件索引更新于 {{ updatedAt }}</p>
        <div class="xidx-stats">
          <div class="xidx-stat">
            <b>{{ plugins.length }}</b>
            <span>全部插件</span>
          </div>
          <div class="xidx-stat">
            <b>{{ tabs.length - 1 }}</b>
            <span>插件分类</span>
          </div>
        </div>
        <div class="xidx-actions">
          <a href="#plugins" class="x-btn x-btn-primary">浏览插件</a>
          <a href="/plugins/PLUGIN_DEVELOPMENT_GUIDE" class="x-btn x-btn-glass">开发指南</a>
        </div>
      </div>
    </section>

    <!-- ===== 插件列表 ===== -->
    <section id="plugins" class="xidx-section" ref="listRef">
      <div class="x-section-head">
        <div class="x-section-label">插件列表</div>
        <h2 class="x-section-title">全部插件</h2>
        <p class="x-section-desc">从扩展商店下载后，在「插件管理」中启用即可使用</p>
      </div>

      <div v-if="!index" class="xidx-empty">
        <p>插件索引暂时无法获取，请稍后重试。</p>
      </div>

      <template v-else>
        <div class="xidx-tabs" role="tablist">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="xidx-tab"
            :class="{ 'x-active': active === t.key }"
            role="tab"
            :aria-selected="active === t.key"
            @click="active = t.key"
          >
            <span class="xidx-tab-icon">{{ t.icon }}</span>{{ t.label }}
            <span class="xidx-tab-count">{{ t.count }}</span>
          </button>
        </div>

        <div class="xidx-grid">
          <article
            v-for="(p, i) in filtered"
            :key="p.id"
            class="x-glass-card xidx-card"
            :style="{ '--i': i }"
            @mousemove="spotlightMove"
          >
            <div class="xidx-card-head">
              <div class="xidx-card-icon">{{ pluginIcon(p) }}</div>
              <span v-if="pluginTypeLabel(p)" class="xidx-badge">{{ pluginTypeLabel(p) }}</span>
            </div>
            <h3 class="xidx-card-name">{{ p.name }}</h3>
            <p class="xidx-card-desc">{{ p.description }}</p>
            <div v-if="p.tags && p.tags.length" class="xidx-card-tags">
              <span v-for="t in p.tags" :key="t" class="x-tag">{{ t }}</span>
            </div>
            <div class="xidx-card-foot">
              <span class="xidx-version">{{ displayVersion(p.currentVersion) }}</span>
              <div class="xidx-card-links">
                <a
                  v-if="latestDownload(p)"
                  :href="latestDownload(p).url"
                  target="_blank"
                  rel="noopener"
                  class="xidx-link"
                >下载 ↓</a>
                <a v-if="p.homepage" :href="p.homepage" target="_blank" rel="noopener" class="xidx-link">源码 →</a>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <!-- ===== 安装 ===== -->
    <section class="xidx-section" ref="installRef">
      <div class="x-section-head">
        <div class="x-section-label">安装插件</div>
        <h2 class="x-section-title">三步即可使用</h2>
        <p class="x-section-desc">在线安装或本地导入，按需扩展 Xime 能力</p>
      </div>

      <div class="xidx-steps">
        <div class="x-glass-card xidx-step" style="--i: 0" @mousemove="spotlightMove">
          <span class="xidx-step-num">1</span>
          <div>
            <h4>打开扩展商店</h4>
            <p>设置 → 扩展 → 扩展商店 → 「插件」标签页</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 1" @mousemove="spotlightMove">
          <span class="xidx-step-num">2</span>
          <div>
            <h4>安装插件</h4>
            <p>浏览选择插件下载安装；或在「插件管理」中「从文件安装插件」导入 .xipk 文件</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 2" @mousemove="spotlightMove">
          <span class="xidx-step-num">3</span>
          <div>
            <h4>启用插件</h4>
            <p>安装后在「插件管理」中启用（第三方插件首次启用需确认）</p>
          </div>
        </div>
      </div>

      <div class="xidx-more">
        <a href="/features/extension-store" class="x-btn x-btn-glass">了解扩展商店</a>
        <a href="/plugins/PLUGIN_DEVELOPMENT_GUIDE" class="x-btn x-btn-glass">插件开发指南</a>
        <a href="/plugins/TESTING" class="x-btn x-btn-glass">测试指南</a>
      </div>
    </section>

    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { useImmersivePage, spotlightMove } from '../immersive'

useImmersivePage()

const { frontmatter } = useData()

const index = computed(() => (frontmatter.value as any)?.pluginIndex ?? null)
const plugins = computed<any[]>(() => index.value?.plugins ?? [])
const updatedAt = computed(() => index.value?.updated_at ?? '')

/** 分类定义，顺序即标签顺序；索引里未归类的归入「其他」 */
const GROUPS = [
  { key: 'speech', label: '语音识别', icon: '🎤' },
  { key: 'emoji', label: '表情', icon: '😀' },
  { key: 'clipboard_sync', label: '剪贴板同步', icon: '📋' },
  { key: 'backup', label: '云备份', icon: '☁️' },
  { key: 'tool', label: 'AI 与工具', icon: '🧰' }
]

const active = ref('all')

const tabs = computed(() => {
  const countBy = new Map<string, number>()
  for (const p of plugins.value) {
    const key = p.pluginType || 'other'
    countBy.set(key, (countBy.get(key) ?? 0) + 1)
  }
  const list = [{ key: 'all', label: '全部', icon: '✨', count: plugins.value.length }]
  for (const g of GROUPS) {
    if (countBy.has(g.key)) list.push({ ...g, count: countBy.get(g.key)! })
  }
  for (const [key, count] of countBy) {
    if (!GROUPS.some((g) => g.key === key)) {
      list.push({ key, label: '其他', icon: '🧩', count })
    }
  }
  return list
})

const filtered = computed(() =>
  active.value === 'all'
    ? plugins.value
    : plugins.value.filter((p) => (p.pluginType || 'other') === active.value)
)

/** 版本号展示：纯数字开头补 v 前缀，master / v1.0 等原样展示 */
function displayVersion(v?: string): string {
  if (!v) return '—'
  return /^\d/.test(v) ? `v${v}` : v
}

function pluginIcon(p: any): string {
  switch (p.pluginType) {
    case 'speech':
      return '🎤'
    case 'clipboard_sync':
      return '📋'
    case 'backup':
      return '☁️'
    case 'tool':
      return '🧰'
    case 'emoji':
      if (/颜文字/.test(p.name)) return '(^_^)'
      if (/恶搞|贴纸/.test(p.name)) return '🐰'
      return '😀'
    default:
      return '🧩'
  }
}

function pluginTypeLabel(p: any): string {
  return p.type === 'built-in' ? '内置' : ''
}

function latestDownload(p: any) {
  return p.versions?.[0]?.downloadUrl?.[0]
}

const listRef = ref<HTMLElement | null>(null)
const installRef = ref<HTMLElement | null>(null)
let sectionObserver: IntersectionObserver | null = null

onMounted(() => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('x-visible')
          sectionObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )

  if (listRef.value) sectionObserver.observe(listRef.value)
  if (installRef.value) sectionObserver.observe(installRef.value)
})

onUnmounted(() => {
  sectionObserver?.disconnect()
})
</script>
