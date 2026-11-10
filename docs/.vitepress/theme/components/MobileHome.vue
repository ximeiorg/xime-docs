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
            开源免费 · 基于 Rime 引擎
          </div>
          <div class="x-hero-eyebrow">XIME · ANDROID</div>
          <h1 class="x-hero-title">
            <span class="x-title-shine">曦码输入法</span>
          </h1>
          <p class="x-hero-typing">
            支持<span class="x-type-word">{{ typed }}</span><span class="x-caret"></span>
          </p>
          <p class="x-hero-desc">
            为手机打造的高效中文输入法，五笔、拼音、自定义方案随心切换，
            词库云端同步，纯净无广告。Android 现已可用，HarmonyOS 适配中。
          </p>
          <div class="x-hero-actions">
            <a href="https://github.com/ximeiorg/Xime/releases" class="x-btn x-btn-primary" target="_blank">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              立即下载
            </a>
            <a href="/mobile/usage" class="x-btn x-btn-glass">快速开始</a>
            <a href="/mobile/features" class="x-btn x-btn-glass">功能一览</a>
          </div>
        </div>

        <!-- 右侧手机 -->
        <div class="x-hero-phone" ref="phoneRef" @mousemove="onTilt" @mouseleave="resetTilt">
          <div class="x-phone-halo"></div>
          <div class="x-hero-shot-wrap" :style="tiltStyle">
            <img src="/hero-phone.webp" alt="曦码输入法界面预览" class="x-hero-shot" />
          </div>
        </div>
      </div>

      <div class="x-scroll-hint" aria-hidden="true"><span></span></div>
    </section>

    <!-- ===== 平台支持 ===== -->
    <section class="x-platforms" id="平台支持" ref="platformsRef">
      <div class="x-section-head">
        <div class="x-section-label">平台支持</div>
        <h2 class="x-section-title">手机双平台</h2>
        <p class="x-section-desc">Android 稳定可用，HarmonyOS 适配进行中</p>
      </div>

      <div class="x-plat-grid x-plat-grid-2">
        <a
          v-for="(p, i) in platforms"
          :key="i"
          :href="p.link"
          class="x-glass-card x-plat-card"
          :class="{ 'x-plat-soon': p.soon }"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <div class="x-plat-head">
            <span class="x-plat-logo">{{ p.logo }}</span>
            <span class="x-plat-status" :class="p.soon ? 'x-plat-status-soon' : 'x-plat-status-ok'">
              {{ p.soon ? '适配中' : '稳定版可用' }}
            </span>
          </div>
          <h3>{{ p.name }}</h3>
          <p>{{ p.desc }}</p>
          <span v-if="!p.soon" class="x-plat-go">{{ p.go }} →</span>
        </a>
      </div>
    </section>

    <!-- ===== 功能特色 ===== -->
    <section class="x-features" ref="featuresRef">
      <div class="x-section-head">
        <div class="x-section-label">功能特色</div>
        <h2 class="x-section-title">强大而简洁</h2>
        <p class="x-section-desc">点击卡片查看功能详情</p>
      </div>

      <div class="x-features-grid">
        <a
          v-for="(f, i) in features"
          :key="i"
          :href="f.link"
          class="x-glass-card x-feature-card"
          :style="{ '--i': i }"
          ref="featureCards"
          @mousemove="spotlightMove"
        >
          <div class="x-feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.details }}</p>
        </a>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="x-cta" ref="ctaRef">
      <div class="x-cta-card">
        <div class="x-cta-glow"></div>
        <h2 class="x-cta-title">准备好换一种输入方式了吗？</h2>
        <p class="x-cta-desc">前往 GitHub Releases 下载最新版本，开启流畅输入之旅</p>
        <div class="x-cta-actions">
          <a href="https://github.com/ximeiorg/Xime/releases" class="x-btn x-btn-primary" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            下载 Xime
          </a>
          <a href="/mobile/changelog" class="x-btn x-btn-glass">查看更新日志</a>
          <a href="/pc/" class="x-btn x-btn-glass">还有桌面版 · 曦码·曜</a>
        </div>
      </div>
    </section>

    <!-- footer 间距 -->
    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useImmersivePage, spotlightMove } from '../immersive'

useImmersivePage()

const platforms = [
  {
    name: 'Android',
    logo: '🤖',
    soon: false,
    link: '/mobile/usage',
    go: '快速开始',
    desc: '五笔 / 拼音 / 九键 / 笔画 / 手写，方案与词库自由扩展，v3.4.3 持续更新中'
  },
  {
    name: 'HarmonyOS',
    logo: '🌈',
    soon: true,
    link: '/mobile/#平台支持',
    go: '',
    desc: '鸿蒙版适配中，敬请期待'
  }
]

const features = [
  { icon: '⌨️', title: '多方案输入', details: '内置五笔86、五笔拼音混输、全拼、九键、笔画方案，扩展商店一键下载，支持无线导入自定义方案', link: '/mobile/features/input-scheme' },
  { icon: '🧠', title: '智能纠错', details: '按错相邻键时在候选栏给出纠正候选，手动选择不干扰原输入，支持五笔与全拼', link: '/mobile/features/correction' },
  { icon: '🎤', title: '语音转文本', details: '内置离线流式识别模型，离线可用不吃字，还可安装 FunAsr、火山引擎等在线语音插件', link: '/mobile/features/speech-to-text' },
  { icon: '🤖', title: 'AI 智能联想', details: 'Transformer 模型预测联想词，搭配 AI 回复、AI 写作、AI 翻译等插件', link: '/mobile/features/smart-prediction' },
  { icon: '📋', title: '剪贴板与拖拽', details: '剪贴板历史、文本分词、快捷发送；同一 Wi-Fi 下还能与电脑直连互传剪贴板', link: '/mobile/features/clipboard' },
  { icon: '☁️', title: '云备份与同步', details: 'WebDAV 一键备份方案、配置、自造词与插件设置，多设备用户词典按时间戳合并', link: '/mobile/features/cloud-backup' }
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

const platformsRef = ref<HTMLElement | null>(null)
const featuresRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

let sectionObserver: IntersectionObserver | null = null
let cardObserver: IntersectionObserver | null = null

onMounted(() => {
  keys.value = genKeys()
  typeLoop()

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

  document.querySelectorAll('.x-plat-card, .x-feature-card').forEach((el) => {
    cardObserver?.observe(el)
  })
})

onUnmounted(() => {
  if (typeTimer) clearTimeout(typeTimer)
  sectionObserver?.disconnect()
  cardObserver?.disconnect()
})
</script>
