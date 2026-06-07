<template>
  <div class="x-home">

    <!-- ===== Hero ===== -->
    <section class="x-hero">
      <div class="x-hero-bg">
        <div class="x-glow x-glow-1"></div>
        <div class="x-glow x-glow-2"></div>
      </div>
      <div class="x-hero-inner">
        <!-- 左侧文字 -->
        <div class="x-hero-text">
          <div class="x-hero-brand">
            <img src="/icon_light.svg" alt="Xime" class="x-logo" />
            <h1 class="x-hero-title">
              <span class="x-title-line">Xime</span>
              <span class="x-title-line x-gradient">曦码输入法</span>
            </h1>
          </div>
          <p class="x-hero-sub">支持五笔 / 拼音 / 自定义方案的安卓输入法</p>
          <p class="x-hero-desc">基于 Rime 引擎构建，专注简洁高效的中文输入体验</p>
          <div class="x-hero-actions">
            <a href="/usage" class="x-btn x-btn-primary">快速开始</a>
            <a href="https://github.com/ximeiorg/Xime" class="x-btn x-btn-secondary" target="_blank">GitHub</a>
          </div>
        </div>

        <!-- 右侧手机 -->
        <div class="x-hero-phone">
          <div class="x-phone-frame">
            <div class="x-phone-notch"></div>
            <div class="x-phone-screen">
              <div class="x-phone-keyboard">
                <img src="/keyboard.jpg" alt="Xime 键盘" />
              </div>
              <div class="x-phone-gradient"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 功能特色 ===== -->
    <section class="x-features" ref="featuresRef">
      <div class="x-section-label">功能特色</div>
      <h2 class="x-section-title">强大而简洁</h2>
      <p class="x-section-desc">Xime 为你带来流畅高效的输入体验</p>

      <div class="x-features-grid">
        <div
          v-for="(f, i) in features"
          :key="i"
          class="x-feature-card"
          :style="{ '--i': i }"
          ref="featureCards"
        >
          <div class="x-feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.details }}</p>
        </div>
      </div>
    </section>

    <!-- ===== 输入方案 ===== -->
    <section class="x-schemes" ref="schemesRef">
      <div class="x-section-label">输入方案</div>
      <h2 class="x-section-title">多种方案，自由选择</h2>
      <p class="x-section-desc">满足不同用户习惯的五笔与拼音输入方案</p>

      <div class="x-schemes-grid">
        <div class="x-scheme-card" v-for="(s, i) in schemes" :key="i" :style="{ '--i': i }">
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
        <h2 class="x-cta-title">立即体验 Xime</h2>
        <p class="x-cta-desc">前往 GitHub Releases 下载最新版本，开启流畅输入之旅</p>
        <div class="x-cta-actions">
          <a href="https://github.com/ximeiorg/Xime/releases" class="x-btn x-btn-primary" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            下载 Xime
          </a>
          <a href="/changelog" class="x-btn x-btn-ghost">查看更新日志</a>
        </div>
      </div>
    </section>

    <!-- footer 间距 -->
    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const features = [
  { icon: '⌨️', title: '多方案', details: '支持五笔86、五笔98及五笔拼音混输方案，支持无线导入、URL 导入自定义方案' },
  { icon: '🔧', title: 'Rime 引擎', details: '使用 Rime 输入法引擎，词库增量部署，支持 WebDAV 同步备份' },
  { icon: '🎤', title: '语音转文本', details: '支持阿里百炼在线 API 和 Sherpa 本地模型，离线可用，预缓冲防吃字' },
  { icon: '😀', title: '表情与插件', details: '表情多标签页分类，支持颜文字、表情包等扩展插件' },
  { icon: '🎨', title: '主题定制', details: '深色/浅色/跟随系统三种模式，多种键盘配色方案可选' },
  { icon: '✂️', title: '剪贴板与分词', details: '剪贴板历史管理、文本拆分、快捷发送，高效文本输入' },
  { icon: '🔢', title: '计算器', details: '数字键盘内置加减乘除计算器，计算结果直接上屏' },
  { icon: '🛠️', title: '工具栏', details: '可自定义工具栏按钮布局，常用功能一键直达' }
]

const schemes = [
  { icon: '五', name: '五笔 86', desc: '经典五笔输入方案，适用于大多数五笔用户', tags: ['标准', '普及最广'] },
  { icon: '五', name: '五笔 98', desc: '改进版五笔方案，字根分布更合理，编码更规范', tags: ['改进', '编码规范'] },
  { icon: '拼', name: '五笔拼音混输', desc: '五笔与拼音混合输入，不必须切换输入模式', tags: ['混合', '新手友好'] },
  { icon: '拼', name: '自定义方案', desc: '支持导入自定义输入方案，无限扩展可能', tags: ['灵活', '可扩展'] }
]

const featuresRef = ref<HTMLElement | null>(null)
const schemesRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('x-visible')
          sectionObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  if (featuresRef.value) sectionObserver.observe(featuresRef.value)
  if (schemesRef.value) sectionObserver.observe(schemesRef.value)
  if (ctaRef.value) sectionObserver.observe(ctaRef.value)

  // Stagger card animations
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('x-card-visible')
          cardObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.x-feature-card, .x-scheme-card').forEach((el) => {
    cardObserver.observe(el)
  })
})
</script>
