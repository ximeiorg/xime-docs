<template>
  <div class="x-home">

    <!-- ===== Hero ===== -->
    <section class="x-hero">
      <div class="x-hero-bg" aria-hidden="true">
        <div class="x-blob x-blob-1"></div>
        <div class="x-blob x-blob-2"></div>
        <div class="x-blob x-blob-3"></div>
        <div class="x-grid-overlay"></div>
        <div class="x-keys">
          <span
            v-for="k in keys"
            :key="k.id"
            class="x-key"
            :style="{
              left: k.left,
              width: k.size,
              height: k.size,
              fontSize: k.font,
              animationDuration: k.dur,
              animationDelay: k.delay,
              '--o': k.opacity,
              '--r0': k.r0,
              '--r1': k.r1
            }"
          >{{ k.label }}</span>
        </div>
      </div>

      <div class="x-hero-inner">
        <!-- 左侧文字 -->
        <div class="x-hero-text">
          <div class="x-hero-badge">
            <span class="x-pulse-dot"></span>
            Android · Windows · Linux 三端可用
          </div>
          <div class="x-hero-eyebrow">XIME IME</div>
          <h1 class="x-hero-title">
            <span class="x-title-shine">曦码输入法</span>
          </h1>
          <p class="x-hero-typing">
            支持<span class="x-type-word">{{ typed }}</span><span class="x-caret"></span>
          </p>
          <p class="x-hero-desc">
            一套 Rime 生态，三端可用：Android、Windows（曦码·曜）与 Linux（曦码·澈）。
            五笔、拼音、自定义方案随心切换，本地优先，纯净无广告。
          </p>
          <div class="x-hero-actions">
            <a href="#平台" class="x-btn x-btn-primary">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              选择平台
            </a>
            <a href="/features/" class="x-btn x-btn-glass">功能文档</a>
            <a href="https://github.com/ximeiorg" class="x-btn x-btn-glass" target="_blank">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 5 18.3 5.3 18.3 5.3c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/></svg>
              GitHub
            </a>
          </div>
        </div>

        <!-- 右侧：Android / Windows 预览自动切换 -->
        <div class="x-hero-phone" ref="phoneRef" @mousemove="onTilt" @mouseleave="resetTilt">
          <div class="x-phone-halo"></div>
          <div class="x-preview">
            <div class="x-preview-stage" :style="tiltStyle">
              <Transition name="xp-fade" mode="out-in">
              <div :key="preview" class="x-preview-slide">
              <div v-if="preview === 'android'" class="x-preview-phone">
                <img src="/hero-phone.webp" alt="Android 版曦码输入法界面" class="x-hero-shot" />
              </div>

              <div v-else-if="preview === 'windows'" class="x-preview-window">
                <div class="xp-titlebar">
                  <span class="xp-dot xp-dot-r"></span>
                  <span class="xp-dot xp-dot-y"></span>
                  <span class="xp-dot xp-dot-g"></span>
                  <span class="xp-title">曦码 · 桌面端（Windows / Linux）</span>
                </div>
                <div class="xp-body">
                  <PcCandidateBar />
                  <div class="xp-lines">
                    <div class="xp-line" style="width: 62%"></div>
                    <div class="xp-line" style="width: 84%"></div>
                    <div class="xp-line" style="width: 48%"></div>
                  </div>
                </div>
              </div>

              </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div class="x-scroll-hint" aria-hidden="true"><span></span></div>
    </section>

    <!-- ===== 平台支持 ===== -->
    <section class="x-platforms" id="平台" ref="platformsRef">
      <div class="x-section-head">
        <div class="x-section-label">平台支持</div>
        <h2 class="x-section-title">一个品牌，三端可用</h2>
        <p class="x-section-desc">功能大部分通用，安装与设置按平台分开</p>
      </div>

      <div class="x-plat-grid">
        <a
          v-for="(p, i) in platforms"
          :key="i"
          :href="p.link"
          class="x-glass-card x-plat-card"
          :style="{ '--i': i }"
          @mousemove="onCardMove"
        >
          <div class="x-plat-head">
            <span class="x-plat-logo">{{ p.logo }}</span>
            <span class="x-plat-status" :class="p.statusClass">{{ p.status }}</span>
          </div>
          <h3>{{ p.name }}</h3>
          <p>{{ p.desc }}</p>
          <span class="x-plat-go">查看文档 →</span>
        </a>
      </div>
    </section>

    <!-- ===== 功能特色 ===== -->
    <section class="x-features" ref="featuresRef">
      <div class="x-section-head">
        <div class="x-section-label">功能特色</div>
        <h2 class="x-section-title">强大而简洁</h2>
        <p class="x-section-desc">Xime 为你带来流畅高效的输入体验</p>
      </div>

      <div class="x-features-grid">
        <div
          v-for="(f, i) in features"
          :key="i"
          class="x-glass-card x-feature-card"
          :style="{ '--i': i }"
          ref="featureCards"
          @mousemove="onCardMove"
        >
          <div class="x-feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.details }}</p>
        </div>
      </div>
    </section>

    <!-- ===== 输入方案 ===== -->
    <section class="x-schemes" ref="schemesRef">
      <div class="x-section-head">
        <div class="x-section-label">输入方案</div>
        <h2 class="x-section-title">多种方案，自由选择</h2>
        <p class="x-section-desc">满足不同用户习惯的五笔与拼音输入方案</p>
      </div>

      <div class="x-schemes-grid">
        <div
          class="x-glass-card x-scheme-card"
          v-for="(s, i) in schemes"
          :key="i"
          :style="{ '--i': i }"
          @mousemove="onCardMove"
        >
          <div class="x-scheme-number">0{{ i + 1 }}</div>
          <div class="x-scheme-icon">{{ s.icon }}</div>
          <h3>{{ s.name }}</h3>
          <p>{{ s.desc }}</p>
          <div class="x-scheme-tags">
            <span v-for="tag in s.tags" :key="tag" class="x-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="x-cta" ref="ctaRef">
      <div class="x-cta-card">
        <div class="x-cta-glow"></div>
        <h2 class="x-cta-title">选择你的平台开始</h2>
        <p class="x-cta-desc">Android 稳定可用；Windows 处于 Beta 预览；Linux 面向 KDE Plasma 的 Wayland 会话。</p>
        <div class="x-cta-actions">
          <a href="https://github.com/ximeiorg/Xime/releases" class="x-btn x-btn-primary" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            下载 Android 版
          </a>
          <a href="https://github.com/ximeiorg/XimeYao/releases" class="x-btn x-btn-glass" target="_blank">Windows 预览版</a>
          <a href="https://github.com/ximeiorg/XimeChe/releases" class="x-btn x-btn-glass" target="_blank">Linux 版</a>
        </div>
        <p class="x-cta-sub">不确定怎么装？看 <a href="/features/">功能文档</a>，或从上方平台卡片进入对应文档。</p>
      </div>
    </section>

    <!-- footer 间距 -->
    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import PcCandidateBar from './PcCandidateBar.vue'

const platforms = [
  {
    name: 'Android（曦码）',
    logo: '🤖',
    status: '稳定版',
    statusClass: 'x-plat-status-ok',
    link: '/mobile/usage',
    desc: '触屏键盘、九键、手写、语音与剪贴板同步；安装 APK 后在系统中启用输入法即可。'
  },
  {
    name: 'Windows（曦码·曜）',
    logo: '🪟',
    status: 'Beta 预览',
    statusClass: 'x-plat-status-beta',
    link: '/pc/usage',
    desc: 'Rust + TSF 桌面输入法，托盘与候选栏、= 前缀计算器；当前为预览版，请先备份数据。'
  },
  {
    name: 'Linux（曦码·澈）',
    logo: '🐧',
    status: '开发中',
    statusClass: 'x-plat-status-beta',
    link: '/ximeche/install',
    desc: 'KDE Plasma Wayland 原生输入法，不依赖 ibus / fcitx；提供 deb、rpm、Arch 与 tar.gz。'
  }
]

const previewIds = ['android', 'windows'] as const
const preview = ref<(typeof previewIds)[number]>('android')
let previewTimer: ReturnType<typeof setInterval> | null = null

const features = [
  { icon: '⌨️', title: '多方案输入', details: '内置五笔86、五笔拼音混输、全拼、T9 九宫格方案，扩展商店一键下载，支持无线导入自定义方案' },
  { icon: '🔧', title: 'Rime 引擎', details: '基于中州韵（Rime）引擎构建，候选精准可靠，词库增量部署，完全开源' },
  { icon: '🎤', title: '语音转文本', details: '内置离线流式识别模型，离线可用不吃字，还可安装 FunAsr、火山引擎等在线语音插件' },
  { icon: '🤖', title: 'AI 智能联想', details: 'Transformer 模型预测联想词，搭配 AI 回复、AI 写作、AI 翻译等插件' },
  { icon: '😀', title: '表情与插件', details: 'Emoji 多标签页分类，颜文字、表情包等脚本插件无限扩展' },
  { icon: '🎨', title: '主题定制', details: '深色/浅色/跟随系统三种模式，多种键盘配色方案，支持导入自定义按键字体' },
  { icon: '✍️', title: '手写找字', details: '支持手写输入，手写反查五笔编码，按键下滑显示字根，边用边学拆字' },
  { icon: '☁️', title: '云备份', details: 'WebDAV 一键备份方案、配置、自造词与插件设置，换机恢复一步到位' }
]

const schemes = [
  { icon: '五', name: '五笔 86', desc: '经典五笔输入方案，适用于大多数五笔用户', tags: ['标准', '普及最广'] },
  { icon: '9', name: '九键拼音', desc: 'T9 九宫格拼音输入，拇指友好，单手操作更轻松', tags: ['九宫格', '单手友好'] },
  { icon: '拼', name: '五笔拼音混输', desc: '五笔与拼音混合输入，无需切换输入模式', tags: ['混合', '新手友好'] },
  { icon: '拼', name: '自定义方案', desc: '支持导入自定义输入方案，无限扩展可能', tags: ['灵活', '可扩展'] }
]

// ---- 打字机轮播 ----
const words = ['五笔 86', '九键拼音', '五笔拼音混输', '自定义方案', '语音输入']
const typed = ref('')
let typeTimer: ReturnType<typeof setTimeout> | null = null

function typeLoop() {
  let wi = 0, ci = 0, deleting = false
  const step = () => {
    const w = words[wi]
    if (!deleting) {
      ci++
      typed.value = w.slice(0, ci)
      if (ci === w.length) {
        deleting = true
        typeTimer = setTimeout(step, 1800)
        return
      }
      typeTimer = setTimeout(step, 140)
    } else {
      ci--
      typed.value = w.slice(0, ci)
      if (ci === 0) {
        deleting = false
        wi = (wi + 1) % words.length
        typeTimer = setTimeout(step, 400)
        return
      }
      typeTimer = setTimeout(step, 60)
    }
  }
  step()
}

// ---- 飘浮按键粒子（客户端生成，避免 SSR 不一致） ----
interface FloatKey { id: number; label: string; left: string; size: string; font: string; dur: string; delay: string; opacity: string; r0: string; r1: string }
const keys = ref<FloatKey[]>([])
const keyLabels = ['五', 'W', '八', 'Q', '字', 'Y', 'R', '根', 'T', '拼', 'U', '音', 'I', '86', 'V', '码']

function genKeys(): FloatKey[] {
  return keyLabels.map((label, i) => {
    const size = 30 + Math.random() * 34
    return {
      id: i,
      label,
      left: `${4 + Math.random() * 92}%`,
      size: `${size.toFixed(0)}px`,
      font: `${(size * 0.4).toFixed(0)}px`,
      dur: `${14 + Math.random() * 16}s`,
      delay: `${-Math.random() * 20}s`,
      opacity: (0.14 + Math.random() * 0.22).toFixed(2),
      r0: `${(Math.random() * 24 - 12).toFixed(0)}deg`,
      r1: `${(Math.random() * 40 - 20).toFixed(0)}deg`
    }
  })
}

// ---- 手机 3D 视差 ----
const tilt = reactive({ rx: 0, ry: 0 })
const tiltStyle = computed(() => ({
  transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
}))
function onTilt(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  tilt.ry = ((e.clientX - r.left) / r.width - 0.5) * 14
  tilt.rx = -((e.clientY - r.top) / r.height - 0.5) * 10
}
function resetTilt() {
  tilt.rx = 0
  tilt.ry = 0
}

// ---- 卡片鼠标追随光斑 ----
function onCardMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

const featuresRef = ref<HTMLElement | null>(null)
const platformsRef = ref<HTMLElement | null>(null)
const schemesRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const featureCards = ref<HTMLElement[] | null>(null)

let sectionObserver: IntersectionObserver | null = null
let cardObserver: IntersectionObserver | null = null

function onScroll() {
  document.documentElement.classList.toggle('x-nav-scrolled', window.scrollY > 24)
}

onMounted(() => {
  document.documentElement.classList.add('x-home-view')
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  keys.value = genKeys()
  typeLoop()
  previewTimer = setInterval(() => {
    const i = previewIds.indexOf(preview.value)
    preview.value = previewIds[(i + 1) % previewIds.length]
  }, 4200)

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('x-visible')
          sectionObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  if (platformsRef.value) sectionObserver.observe(platformsRef.value)
  if (featuresRef.value) sectionObserver.observe(featuresRef.value)
  if (schemesRef.value) sectionObserver.observe(schemesRef.value)
  if (ctaRef.value) sectionObserver.observe(ctaRef.value)

  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('x-card-visible')
          cardObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.x-plat-card, .x-feature-card, .x-scheme-card').forEach((el) => {
    cardObserver?.observe(el)
  })
})

onUnmounted(() => {
  document.documentElement.classList.remove('x-home-view')
  document.documentElement.classList.remove('x-nav-scrolled')
  window.removeEventListener('scroll', onScroll)
  if (typeTimer) clearTimeout(typeTimer)
  if (previewTimer) clearInterval(previewTimer)
  sectionObserver?.disconnect()
  cardObserver?.disconnect()
})
</script>

<style scoped>
.x-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.x-preview-stage {
  width: min(560px, 100%);
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease-out;
}

.x-preview-phone .x-hero-shot {
  width: 270px;
  animation: xBob 6s ease-in-out infinite;
}

.x-preview-window {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #17161d;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  animation: xFadeUp 0.5s ease-out both;
}

.xp-titlebar {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  background: linear-gradient(180deg, #2a2833, #201e27);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.xp-dot { width: 9px; height: 9px; border-radius: 50%; }
.xp-dot-r { background: #ff5f57; }
.xp-dot-y { background: #febc2e; }
.xp-dot-g { background: #28c840; }
.xp-title {
  margin-left: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.xp-body {
  padding: 24px;
  background:
    radial-gradient(120% 80% at 20% 0%, rgba(143, 115, 226, 0.16), transparent 60%),
    linear-gradient(180deg, #1b1a22, #15141a);
}

.xp-body :deep(.xcb-word) { font-size: 18px; }
.xp-body :deep(.xcb-num) { font-size: 14px; }
.xp-body :deep(.xcb-bar) { padding: 11px 18px; }
.xp-body :deep(.xcb-item) { padding: 7px 11px; }

.xp-lines {
  margin-top: 16px;
  padding: 14px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 10px;
}
.xp-line {
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.13);
}
.xp-line-accent {
  background: linear-gradient(90deg, #a88ff0, #7b5fe0);
}

.x-preview-slide {
  width: 100%;
  display: flex;
  justify-content: center;
}

.xp-fade-enter-active,
.xp-fade-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.xp-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.xp-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .xp-fade-enter-active,
  .xp-fade-leave-active {
    transition: none;
  }
}

@media (max-width: 960px) {
  .x-preview-stage { height: 480px; }
  .x-preview-phone .x-hero-shot { width: 230px; }
}
@media (max-width: 768px) {
  .x-preview-stage { height: 430px; }
  .x-preview-phone .x-hero-shot { width: 210px; }
}
</style>
