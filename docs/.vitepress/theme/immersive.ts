import { onMounted, onUnmounted } from 'vue'

/**
 * 沉浸式深色页面通用处理：
 * - 给 <html> 加 x-home-view（导航栏强制深色、隐藏明暗切换）
 * - 滚动后加 x-nav-scrolled（毛玻璃导航条）
 * 进入其他页面时自动清理。
 */
export function useImmersivePage() {
  function onScroll() {
    document.documentElement.classList.toggle('x-nav-scrolled', window.scrollY > 24)
  }

  onMounted(() => {
    document.documentElement.classList.add('x-home-view')
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  })

  onUnmounted(() => {
    document.documentElement.classList.remove('x-home-view')
    document.documentElement.classList.remove('x-nav-scrolled')
    window.removeEventListener('scroll', onScroll)
  })
}

/** 卡片鼠标追随光斑：更新 --mx / --my CSS 变量 */
export function spotlightMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
