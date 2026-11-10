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
        <div class="x-section-label">方案中心</div>
        <div class="xidx-eyebrow">RIME SCHEMAS</div>
        <h1 class="x-hero-title"><span class="x-title-shine">输入方案</span></h1>
        <p class="xidx-sub">五笔 · 拼音 · 倉頡 · 自定义方案自由扩展</p>
        <p class="xidx-desc">
          基于 Rime 引擎，内置经典方案开箱即用，还能从方案商店一键安装社区方案，
          或无线导入自己的 .yaml / .zip 方案文件。
        </p>
        <p v-if="updatedAt" class="xidx-updated">方案索引更新于 {{ updatedAt }}</p>
        <div class="xidx-stats">
          <div class="xidx-stat">
            <b>{{ schemas.length }}</b>
            <span>全部方案</span>
          </div>
          <div class="xidx-stat">
            <b>{{ remoteCount }}</b>
            <span>在线方案</span>
          </div>
          <div class="xidx-stat">
            <b>{{ builtinCount }}</b>
            <span>内置方案</span>
          </div>
        </div>
        <div class="xidx-actions">
          <a href="#list" class="x-btn x-btn-primary">浏览方案</a>
          <a href="/features/input-scheme" class="x-btn x-btn-glass">使用文档</a>
        </div>
      </div>
    </section>

    <!-- ===== 方案列表 ===== -->
    <section id="list" class="xidx-section" ref="listRef">
      <div class="x-section-head">
        <div class="x-section-label">方案列表</div>
        <h2 class="x-section-title">全部方案</h2>
        <p class="x-section-desc">在「扩展商店 → 方案」中下载，或通过无线导入安装</p>
      </div>

      <div v-if="!index" class="xidx-empty">
        <p>方案索引暂时无法获取，请稍后重试。</p>
      </div>

      <div v-else class="xidx-grid">
        <article
          v-for="(s, i) in schemas"
          :key="s.id"
          class="x-glass-card xidx-card"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <div class="xidx-card-head">
            <div class="xidx-card-icon">{{ schemaIcon(s) }}</div>
            <span class="xidx-badge" :class="{ 'xidx-badge-solid': s.type === 'built-in' }">
              {{ s.type === 'built-in' ? '内置' : '在线' }}
            </span>
          </div>
          <h3 class="xidx-card-name">
            {{ s.name }}<span v-if="s.author" class="xidx-card-author">@{{ s.author }}</span>
          </h3>
          <p class="xidx-card-desc">{{ s.description }}</p>
          <div v-if="s.tags && s.tags.length" class="xidx-card-tags">
            <span v-for="t in s.tags" :key="t" class="x-tag">{{ t }}</span>
          </div>
          <div class="xidx-card-foot">
            <span class="xidx-version">{{ displayVersion(s.currentVersion) }}</span>
            <div class="xidx-card-links">
              <a
                v-if="latestDownload(s)"
                :href="latestDownload(s).url"
                target="_blank"
                rel="noopener"
                class="xidx-link"
              >下载 ↓</a>
              <a v-if="s.homepage" :href="s.homepage" target="_blank" rel="noopener" class="xidx-link">源码 →</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== 安装 ===== -->
    <section class="xidx-section" ref="installRef">
      <div class="x-section-head">
        <div class="x-section-label">安装方案</div>
        <h2 class="x-section-title">三步即可使用</h2>
        <p class="x-section-desc">商店安装或无线导入，安装后部署即可上屏</p>
      </div>

      <div class="xidx-steps">
        <div class="x-glass-card xidx-step" style="--i: 0" @mousemove="spotlightMove">
          <span class="xidx-step-num">1</span>
          <div>
            <h4>打开方案商店</h4>
            <p>设置 → 方案与词库 → 输入方案 → 扩展商店</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 1" @mousemove="spotlightMove">
          <span class="xidx-step-num">2</span>
          <div>
            <h4>安装方案</h4>
            <p>选择方案在线安装；也可在电脑浏览器打开本页下载后，通过「无线导入」安装 .yaml / .zip 文件</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 2" @mousemove="spotlightMove">
          <span class="xidx-step-num">3</span>
          <div>
            <h4>部署并启用</h4>
            <p>勾选启用的方案，点击「部署」生成词库，切换后即可输入</p>
          </div>
        </div>
      </div>

      <div class="xidx-more">
        <a href="/features/input-scheme" class="x-btn x-btn-glass">输入方案文档</a>
        <a href="/features/dictionary" class="x-btn x-btn-glass">词库管理</a>
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

const index = computed(() => (frontmatter.value as any)?.rimeIndex ?? null)
const schemas = computed<any[]>(() => index.value?.schemas ?? [])
const updatedAt = computed(() => index.value?.updated_at ?? '')
const remoteCount = computed(() => schemas.value.filter((s) => s.type !== 'built-in').length)
const builtinCount = computed(() => schemas.value.filter((s) => s.type === 'built-in').length)

function schemaIcon(s: any): string {
  if (/倉頡|仓颉/.test(s.name + (s.tags || []).join())) return '倉'
  if (/粤/.test(s.name + (s.tags || []).join())) return '粤'
  if (/双拼/.test(s.name)) return '双'
  if (/拼音|pinyin/i.test(s.name + s.id) && !/五笔/.test(s.name)) return '拼'
  if (/五笔|wubi/i.test(s.name + s.id)) return '五'
  return s.name?.charAt(0) ?? '方'
}

function latestDownload(s: any) {
  return s.versions?.[0]?.downloadUrl?.[0]
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
