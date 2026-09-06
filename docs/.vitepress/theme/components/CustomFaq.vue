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
        <div class="x-section-label">帮助中心</div>
        <div class="xidx-eyebrow">FAQ &amp; VIDEOS</div>
        <h1 class="x-hero-title"><span class="x-title-shine">常见问题</span></h1>
        <p class="xidx-sub">视频演示 · 图文问答，帮你快速上手</p>
        <p class="xidx-desc">
          这里汇集了常见问题的视频演示与图文解答。没有找到答案？
          欢迎到 GitHub Issues 提问。
        </p>
        <div class="xidx-actions">
          <a href="#videos" class="x-btn x-btn-primary">看视频</a>
          <a href="#faq" class="x-btn x-btn-glass">查问题</a>
          <a href="https://github.com/ximeiorg/Xime/issues" class="x-btn x-btn-glass" target="_blank" rel="noopener">提问</a>
        </div>
      </div>
    </section>

    <!-- ===== 视频 ===== -->
    <section id="videos" class="xidx-section" ref="videosRef">
      <div class="x-section-head">
        <div class="x-section-label">视频演示</div>
        <h2 class="x-section-title">看视频，更快上手</h2>
        <p class="x-section-desc">来自 B 站的教程与问题演示，点击即可播放</p>
      </div>

      <div class="xfq-video-grid">
        <div
          v-for="(v, i) in videos"
          :key="v.bvid"
          class="x-glass-card xfq-video-card"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <div class="xfq-video-frame">
            <iframe
              :src="`//player.bilibili.com/player.html?bvid=${v.bvid}&page=1&autoplay=0&danmaku=0`"
              scrolling="no"
              frameborder="no"
              framespacing="0"
              allowfullscreen="true"
              :title="v.title"
              loading="lazy"
            ></iframe>
          </div>
          <div class="xfq-video-info">
            <span class="xidx-badge" :class="{ 'xidx-badge-solid': v.kind === 'tutorial' }">
              {{ v.kind === 'tutorial' ? '教程' : '演示' }}
            </span>
            <h3 class="xfq-video-title">{{ v.title }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section id="faq" class="xidx-section" ref="faqRef">
      <div class="x-section-head">
        <div class="x-section-label">常见问题</div>
        <h2 class="x-section-title">快速找到答案</h2>
        <p class="x-section-desc">按分类筛选或搜索关键词</p>
      </div>

      <div class="xfq-tools">
        <div class="xfq-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索问题关键词…"
            aria-label="搜索常见问题"
          />
        </div>
        <div class="xidx-tabs" role="tablist">
          <button
            class="xidx-tab"
            :class="{ 'x-active': active === 'all' }"
            role="tab"
            :aria-selected="active === 'all'"
            @click="active = 'all'"
          >全部</button>
          <button
            v-for="c in faqCategories"
            :key="c"
            class="xidx-tab"
            :class="{ 'x-active': active === c }"
            role="tab"
            :aria-selected="active === c"
            @click="active = c"
          >{{ c }}</button>
        </div>
      </div>

      <div class="xfq-list">
        <div
          v-for="(f, i) in filtered"
          :key="f.q"
          class="x-glass-card xfq-item"
          :class="{ 'x-open': open === f.q }"
          :style="{ '--i': i }"
          @mousemove="spotlightMove"
        >
          <button class="xfq-question" :aria-expanded="open === f.q" @click="toggle(f.q)">
            <span class="xfq-cat">{{ f.category }}</span>
            <span class="xfq-q-text">{{ f.q }}</span>
            <svg class="xfq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="xfq-answer-wrap">
            <div class="xfq-answer">
              <p>{{ f.a }}</p>
              <div class="xfq-answer-links">
                <a v-if="f.video" class="xidx-link" href="#videos">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  观看视频演示
                </a>
                <a v-if="f.linkHref" class="xidx-link" :href="f.linkHref">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  {{ f.linkText }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filtered.length" class="xidx-empty">
        <p>没有匹配「{{ keyword }}」的问题，换个关键词试试，或到 GitHub Issues 提问。</p>
      </div>

      <div class="xidx-more">
        <a href="https://github.com/ximeiorg/Xime/issues" class="x-btn x-btn-glass" target="_blank" rel="noopener">GitHub Issues</a>
        <a href="/usage" class="x-btn x-btn-glass">完整使用文档</a>
      </div>
    </section>

    <div class="x-footer-gap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useImmersivePage, spotlightMove } from '../immersive'
import { videos, faqs, faqCategories } from '../faqData'

useImmersivePage()

const active = ref('all')
const keyword = ref('')
const open = ref<string | null>(null)

const filtered = computed(() =>
  faqs.filter((f) => {
    if (active.value !== 'all' && f.category !== active.value) return false
    const kw = keyword.value.trim()
    if (kw && !(f.q + f.a).toLowerCase().includes(kw.toLowerCase())) return false
    return true
  })
)

function toggle(q: string) {
  open.value = open.value === q ? null : q
}

const videosRef = ref<HTMLElement | null>(null)
const faqRef = ref<HTMLElement | null>(null)
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

  if (videosRef.value) sectionObserver.observe(videosRef.value)
  if (faqRef.value) sectionObserver.observe(faqRef.value)
})

onUnmounted(() => {
  sectionObserver?.disconnect()
})
</script>
