<template>
  <div class="xpl-page">

    <!-- ===== Hero ===== -->
    <section class="xpl-hero">
      <div class="xpl-hero-bg">
        <div class="x-glow x-glow-1"></div>
        <div class="x-glow x-glow-2"></div>
      </div>
      <div class="xpl-hero-inner">
        <div class="x-section-label">插件中心</div>
        <h1 class="xpl-hero-title">Xime 插件</h1>
        <p class="xpl-hero-sub">Lua 脚本插件 · 以 .xipk 分发 · 随 Xime v2.6.0+ 使用</p>
        <p class="xpl-hero-desc">
          插件可为 Xime 扩展颜文字、表情包、语音识别等能力。可通过「扩展商店」在线安装，或从本地文件导入。
        </p>
        <p v-if="updatedAt" class="xpl-updated">插件索引更新于 {{ updatedAt }}</p>
        <div class="xpl-stats">
          <div class="xpl-stat">
            <b>{{ plugins.length }}</b>
            <span>全部插件</span>
          </div>
        </div>
        <div class="xpl-hero-actions">
          <a href="#plugins" class="x-btn x-btn-primary">浏览插件</a>
          <a href="/plugins/PLUGIN_DEVELOPMENT_GUIDE" class="x-btn x-btn-secondary">开发指南</a>
        </div>
      </div>
    </section>

    <!-- ===== 插件列表 ===== -->
    <section id="plugins" class="xpl-section" ref="listRef">
      <div class="x-section-label">插件列表</div>
      <h2 class="x-section-title">全部插件</h2>
      <p class="x-section-desc">从扩展商店下载后，在「插件管理」中启用即可使用</p>

      <div v-if="!index" class="xpl-empty">
        <p>插件索引暂时无法获取，请稍后重试。</p>
      </div>

      <div v-else class="xpl-grid">
        <article
          v-for="(p, i) in plugins"
          :key="p.id"
          class="xpl-card"
          :style="{ '--i': i }"
        >
          <div class="xpl-card-head">
            <div class="xpl-card-icon">{{ pluginIcon(p) }}</div>
            <span class="xpl-badge">{{ pluginTypeLabel(p) }}</span>
          </div>
          <h3 class="xpl-card-name">{{ p.name }}</h3>
          <p class="xpl-card-desc">{{ p.description }}</p>
          <div v-if="p.tags && p.tags.length" class="xpl-card-tags">
            <span v-for="t in p.tags" :key="t" class="x-tag">{{ t }}</span>
          </div>
          <div class="xpl-card-foot">
            <span class="xpl-version">v{{ p.currentVersion }}</span>
            <div class="xpl-card-links">
              <a
                v-if="latestDownload(p)"
                :href="latestDownload(p).url"
                target="_blank"
                rel="noopener"
                class="xpl-link"
              >下载 ↓</a>
              <a :href="p.homepage" target="_blank" rel="noopener" class="xpl-link">源码 →</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== 安装 ===== -->
    <section class="xpl-section" ref="installRef">
      <div class="x-section-label">安装插件</div>
      <h2 class="x-section-title">三步即可使用</h2>
      <p class="x-section-desc">在线安装或本地导入，按需扩展 Xime 能力</p>

      <div class="xpl-steps">
        <div class="xpl-step">
          <span class="xpl-step-num">1</span>
          <div>
            <h4>打开扩展商店</h4>
            <p>设置 → 扩展 → 扩展商店 → 「插件」标签页</p>
          </div>
        </div>
        <div class="xpl-step">
          <span class="xpl-step-num">2</span>
          <div>
            <h4>安装插件</h4>
            <p>浏览选择插件下载安装；或在「插件管理」中「从文件安装插件」导入 .xipk 文件</p>
          </div>
        </div>
        <div class="xpl-step">
          <span class="xpl-step-num">3</span>
          <div>
            <h4>启用插件</h4>
            <p>安装后在「插件管理」中启用（第三方插件首次启用需确认）</p>
          </div>
        </div>
      </div>

      <div class="xpl-more">
        <a href="/features/extension-store" class="x-btn x-btn-secondary">了解扩展商店</a>
        <a href="/plugins/PLUGIN_DEVELOPMENT_GUIDE" class="x-btn x-btn-secondary">插件开发指南</a>
        <a href="/plugins/TESTING" class="x-btn x-btn-secondary">测试指南</a>
      </div>
    </section>

    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const index = computed(() => (frontmatter.value as any)?.pluginIndex ?? null)
const plugins = computed(() => index.value?.plugins ?? [])
const updatedAt = computed(() => index.value?.updated_at ?? '')

function pluginIcon(p: any): string {
  switch (p.pluginType) {
    case 'speech':
      return '🎤'
    case 'clipboard_sync':
      return '📋'
    case 'emoji':
      if (/颜文字/.test(p.name)) return '(^_^)'
      if (/恶搞|贴纸/.test(p.name)) return '🐰'
      return '😀'
    default:
      return '🧩'
  }
}

function pluginTypeLabel(p: any): string {
  switch (p.pluginType) {
    case 'speech':
      return '语音'
    case 'emoji':
      return '表情'
    case 'clipboard_sync':
      return '剪贴板'
    default:
      return '插件'
  }
}

function latestDownload(p: any) {
  return p.versions?.[0]?.downloadUrl?.[0]
}

const listRef = ref<HTMLElement | null>(null)
const installRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('xpl-visible')
          sectionObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  if (listRef.value) sectionObserver.observe(listRef.value)
  if (installRef.value) sectionObserver.observe(installRef.value)

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('xpl-card-visible')
          cardObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.xpl-card, .xpl-step').forEach((el) => {
    cardObserver.observe(el)
  })
})
</script>

<style scoped>
.xpl-page {
  --xpl-max-w: 1100px;
  position: relative;
  overflow: hidden;
  background: var(--vp-c-bg);
  min-height: calc(100vh - var(--vp-nav-height));
}

/* ---- Hero ---- */
.xpl-hero {
  position: relative;
  z-index: 1;
  overflow: hidden;
}
.xpl-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.xpl-hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 3rem;
  text-align: center;
  min-height: calc(100vh - var(--vp-nav-height));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.xpl-hero-title {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  padding-bottom: 0.1em;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}
.xpl-hero-title {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.xpl-hero-sub {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.6rem;
}
.xpl-hero-desc {
  max-width: 640px;
  margin: 0 auto 0.5rem;
  font-size: 0.98rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}
.xpl-updated {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-bottom: 2rem;
}
.xpl-hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ---- Stats ---- */
.xpl-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}
.xpl-stat {
  min-width: 100px;
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
}
.xpl-stat b {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1.2;
}
.xpl-stat span {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

/* ---- Sections ---- */
.xpl-section {
  position: relative;
  z-index: 1;
  max-width: var(--xpl-max-w);
  margin: 0 auto;
  padding: 3rem 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.xpl-section.xpl-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---- Grid & Cards ---- */
.xpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.xpl-empty {
  padding: 3rem;
  text-align: center;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-border);
  border-radius: 14px;
}
.xpl-card {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  padding: 1.5rem;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30px);
}
.xpl-card.xpl-card-visible {
  animation: xplCardIn 0.5s ease-out calc(var(--i, 0) * 0.08s) both;
}
.xpl-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 32px rgba(143, 115, 226, 0.08);
  transform: translateY(-5px);
}
.dark .xpl-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.xpl-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.xpl-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  height: 46px;
  padding: 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 12px;
  white-space: nowrap;
  transition: transform 0.3s ease;
}
.xpl-card:hover .xpl-card-icon {
  transform: scale(1.08) rotate(-5deg);
}
.xpl-badge {
  display: inline-block;
  padding: 0.18rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
}
.xpl-card-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.4rem;
}
.xpl-card-desc {
  flex: 1;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.65;
  margin-bottom: 0.75rem;
}
.xpl-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.xpl-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.xpl-card-links {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.xpl-version {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  padding: 0.15rem 0.55rem;
}
.xpl-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.xpl-link:hover {
  color: var(--vp-c-brand-2);
}

/* ---- Steps ---- */
.xpl-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.xpl-step {
  display: flex;
  gap: 0.9rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  padding: 1.25rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.xpl-step.xpl-card-visible {
  animation: xplCardIn 0.5s ease-out calc(var(--i, 0) * 0.1s) both;
}
.xpl-step-num {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-radius: 9px;
}
.xpl-step h4 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
}
.xpl-step p {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* ---- More links ---- */
.xpl-more {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

@keyframes xplCardIn {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .xpl-hero-title { font-size: 3rem; }
  .xpl-hero-inner { padding: 3rem 1rem 2rem; }
  .xpl-section { padding: 2.5rem 1rem; }
  .xpl-stats { gap: 0.6rem; }
  .xpl-stat { min-width: 80px; padding: 0.7rem 0.8rem; }
  .xpl-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .xpl-hero-actions, .xpl-more { flex-direction: column; align-items: center; }
  .xpl-hero-actions .x-btn, .xpl-more .x-btn { width: 100%; justify-content: center; }
}
</style>
