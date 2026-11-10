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
        <div class="x-section-label">模型中心</div>
        <div class="xidx-eyebrow">ONNX MODELS</div>
        <h1 class="x-hero-title"><span class="x-title-shine">AI 模型</span></h1>
        <p class="xidx-sub">手写识别 · 智能联想 · 语音识别 · 本地运行</p>
        <p class="xidx-desc">
          为 Xime 各项智能功能提供动力的 ONNX 模型，全部支持本地离线运行，
          数据不出设备。在「扩展商店 → 模型」中一键下载。
        </p>
        <p v-if="updatedAt" class="xidx-updated">模型索引更新于 {{ updatedAt }}</p>
        <div class="xidx-stats">
          <div class="xidx-stat">
            <b>{{ models.length }}</b>
            <span>全部模型</span>
          </div>
          <div class="xidx-stat">
            <b>{{ categories.length }}</b>
            <span>功能分类</span>
          </div>
        </div>
        <div class="xidx-actions">
          <a href="#list" class="x-btn x-btn-primary">浏览模型</a>
          <a href="/features/speech-to-text" class="x-btn x-btn-glass">语音转文本文档</a>
        </div>
      </div>
    </section>

    <!-- ===== 模型列表 ===== -->
    <section id="list" class="xidx-section" ref="listRef">
      <div class="x-section-head">
        <div class="x-section-label">模型列表</div>
        <h2 class="x-section-title">全部模型</h2>
        <p class="x-section-desc">在「扩展商店 → 模型」中下载后，于对应功能中启用</p>
      </div>

      <div v-if="!index" class="xidx-empty">
        <p>模型索引暂时无法获取，请稍后重试。</p>
      </div>

      <div v-else class="xidx-grid">
        <article
          v-for="(m, i) in models"
          :key="m.id"
          class="x-glass-card xidx-card"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <div class="xidx-card-head">
            <div class="xidx-card-icon">{{ categoryIcon(m) }}</div>
            <span class="xidx-badge">{{ categoryLabel(m) }}</span>
          </div>
          <h3 class="xidx-card-name">
            {{ m.name }}<span v-if="m.author" class="xidx-card-author">@{{ m.author }}</span>
          </h3>
          <p class="xidx-card-desc">{{ m.description }}</p>
          <div class="xidx-card-meta">
            <span v-if="m.size">📦 {{ m.size }}</span>
            <span v-if="m.appVersion">⬆️ 需要 v{{ m.appVersion.replace('>=', '') }}+</span>
          </div>
          <div v-if="m.tags && m.tags.length" class="xidx-card-tags">
            <span v-for="t in m.tags" :key="t" class="x-tag">{{ t }}</span>
          </div>
          <div class="xidx-card-foot">
            <span class="xidx-version">{{ m.currentVersion }}</span>
            <div class="xidx-card-links">
              <a v-if="m.homepage" :href="m.homepage" target="_blank" rel="noopener" class="xidx-link">源码 →</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== 安装 ===== -->
    <section class="xidx-section" ref="installRef">
      <div class="x-section-head">
        <div class="x-section-label">安装模型</div>
        <h2 class="x-section-title">三步即可使用</h2>
        <p class="x-section-desc">模型在应用内下载，全部本地离线运行</p>
      </div>

      <div class="xidx-steps">
        <div class="x-glass-card xidx-step" style="--i: 0" @mousemove="spotlightMove">
          <span class="xidx-step-num">1</span>
          <div>
            <h4>打开扩展商店</h4>
            <p>设置 → 扩展 → 扩展商店 → 「模型」标签页</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 1" @mousemove="spotlightMove">
          <span class="xidx-step-num">2</span>
          <div>
            <h4>下载模型</h4>
            <p>按需下载手写、智能联想或语音识别模型，支持断点续传</p>
          </div>
        </div>
        <div class="x-glass-card xidx-step" style="--i: 2" @mousemove="spotlightMove">
          <span class="xidx-step-num">3</span>
          <div>
            <h4>启用功能</h4>
            <p>在手写输入、智能联想、语音转文本等对应功能中开启即可</p>
          </div>
        </div>
      </div>

      <div class="xidx-more">
        <a href="/features/smart-prediction" class="x-btn x-btn-glass">智能联想文档</a>
        <a href="/features/speech-to-text" class="x-btn x-btn-glass">语音转文本文档</a>
        <a href="/features/handwriting" class="x-btn x-btn-glass">手写输入文档</a>
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

const index = computed(() => (frontmatter.value as any)?.modelIndex ?? null)
const models = computed<any[]>(() => index.value?.models ?? [])
const updatedAt = computed(() => index.value?.updated_at ?? '')
const categories = computed(() => [...new Set(models.value.map((m) => m.category).filter(Boolean))])

const CATEGORY_LABELS: Record<string, string> = {
  handwriting: '手写识别',
  prediction: '智能联想',
  asr: '语音识别',
  punctuation: '标点预测'
}
const CATEGORY_ICONS: Record<string, string> = {
  handwriting: '✍️',
  prediction: '🤖',
  asr: '🎤',
  punctuation: '❓'
}

function categoryLabel(m: any) {
  return CATEGORY_LABELS[m.category] ?? '模型'
}
function categoryIcon(m: any) {
  return CATEGORY_ICONS[m.category] ?? '🧠'
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
