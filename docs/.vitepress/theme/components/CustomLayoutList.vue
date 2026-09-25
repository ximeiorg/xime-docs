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
        <div class="x-section-label">布局中心</div>
        <div class="xidx-eyebrow">KEYBOARD LAYOUTS</div>
        <h1 class="x-hero-title"><span class="x-title-shine">键盘布局</span></h1>
        <p class="xidx-sub">数字行 · 紧凑五笔 · 社区分享</p>
        <p class="xidx-desc">
          社区分享的键盘布局，每一份都是标准的
          <a href="/features/keyboard-config">键盘配置文件</a>，下载后导入即可应用，
          也可以继续自由修改。
        </p>
        <p v-if="updatedAt" class="xidx-updated">布局索引更新于 {{ updatedAt }}</p>
        <div class="xidx-stats">
          <div class="xidx-stat">
            <b>{{ layouts.length }}</b>
            <span>全部布局</span>
          </div>
          <div class="xidx-stat">
            <b>{{ authorCount }}</b>
            <span>布局作者</span>
          </div>
        </div>
        <div class="xidx-actions">
          <a href="#list" class="x-btn x-btn-primary">浏览布局</a>
          <a href="/features/keyboard-config" class="x-btn x-btn-glass">配置文档</a>
        </div>
      </div>
    </section>

    <!-- ===== 布局列表 ===== -->
    <section id="list" class="xidx-section" ref="listRef">
      <div class="x-section-head">
        <div class="x-section-label">布局列表</div>
        <h2 class="x-section-title">全部布局</h2>
        <p class="x-section-desc">下载配置文件后，通过「浏览器导入」上传即可应用</p>
      </div>

      <div v-if="!index" class="xidx-empty">
        <p>布局索引暂时无法获取，请稍后重试。</p>
      </div>

      <div v-else class="xidx-grid">
        <article
          v-for="(l, i) in layouts"
          :key="l.id"
          class="x-glass-card xidx-card"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <div v-if="latestScreenshot(l)" class="xl-shot">
            <img
              :src="latestScreenshot(l)"
              :alt="l.name"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
          <div class="xidx-card-head">
            <div class="xidx-card-icon">{{ layoutIcon(l) }}</div>
            <span class="xidx-badge">{{ '布局' }}</span>
          </div>
          <h3 class="xidx-card-name">
            {{ l.name }}<span v-if="l.author" class="xidx-card-author">@{{ l.author }}</span>
          </h3>
          <p class="xidx-card-desc">{{ l.description }}</p>
          <div class="xidx-card-meta">
            <span v-if="latestDownload(l)">📦 {{ latestDownload(l).size ?? 'YAML' }}</span>
            <span v-if="l.appVersion">⬆️ 需要 v{{ l.appVersion.replace('>=', '') }}+</span>
            <span v-if="l.requiresSchemes && l.requiresSchemes.length">🔗 需启用方案</span>
          </div>
          <div v-if="l.tags && l.tags.length" class="xidx-card-tags">
            <span v-for="t in l.tags" :key="t" class="x-tag">{{ t }}</span>
          </div>
          <div class="xidx-card-foot">
            <span class="xidx-version">{{ displayVersion(l.currentVersion) }}</span>
            <div class="xidx-card-links">
              <a
                v-if="latestDownload(l)"
                :href="latestDownload(l).url"
                target="_blank"
                rel="noopener"
                class="xidx-link"
              >下载 YAML ↓</a>
              <a v-if="l.repo" :href="l.repo" target="_blank" rel="noopener" class="xidx-link">源码 →</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== 安装 ===== -->
    <section class="xidx-section" ref="installRef">
      <div class="x-section-head">
        <div class="x-section-label">应用布局</div>
        <h2 class="x-section-title">三步即可使用</h2>
        <p class="x-section-desc">下载配置文件导入，部署后立即生效</p>
      </div>

      <div class="xidx-steps">
        <div class="x-glass-card xidx-step" style="--i: 0" @mousemove="spotlightMove">
          <span class="xidx-step-num">1</span>
          <div>
            <h4>下载布局文件</h4>
            <p>在上方卡片点击「下载 YAML」，保存 xime.custom.yaml 到手机</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 1" @mousemove="spotlightMove">
          <span class="xidx-step-num">2</span>
          <div>
            <h4>浏览器导入</h4>
            <p>打开 Xime → 输入方案 → 浏览器导入，在同一局域网用浏览器上传该文件</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 2" @mousemove="spotlightMove">
          <span class="xidx-step-num">3</span>
          <div>
            <h4>部署生效</h4>
            <p>回到 Xime 点击「部署」，键盘即应用新布局；可参考配置文档继续微调</p>
          </div>
        </div>
      </div>

      <div class="xidx-more">
        <a href="/features/keyboard-config" class="x-btn x-btn-glass">键盘配置文档</a>
        <a href="/rime-list" class="x-btn x-btn-glass">方案中心</a>
        <a href="/model-list" class="x-btn x-btn-glass">模型中心</a>
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

const index = computed(() => (frontmatter.value as any)?.layoutIndex ?? null)
const layouts = computed<any[]>(() => index.value?.layouts ?? [])
const updatedAt = computed(() => index.value?.updated_at ?? '')
const authorCount = computed(
  () => new Set(layouts.value.map((l) => l.author).filter(Boolean)).size
)

function layoutIcon(l: any): string {
  if (/五笔|wubi/i.test(l.name + l.id)) return '五'
  if (/数字/.test(l.name)) return '数'
  return l.name?.charAt(0) ?? '键'
}

function latestDownload(l: any) {
  return l.versions?.[0]?.downloadUrl?.[0]
}

function latestScreenshot(l: any): string | null {
  return l?.screenshots?.[0] ?? null
}

/** 版本号展示：纯数字开头补 v 前缀，master / v1.0 等原样展示 */
function displayVersion(v?: string): string {
  if (!v) return '—'
  return /^\d/.test(v) ? `v${v}` : v
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

<style scoped>
.xl-shot {
  margin: -1.6rem -1.6rem 1.2rem;
  border-radius: 14px 14px 0 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(127, 127, 127, 0.15);
}
.xl-shot img {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
  object-position: bottom;
}
</style>
