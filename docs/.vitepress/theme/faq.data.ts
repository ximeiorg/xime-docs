/**
 * FAQ 数据加载器:构建时从 docs/faq-items/*.md 收集常见问题。
 *
 * 新增一条问答:在该目录新建 md 文件即可,无需改任何代码——
 *   - frontmatter 的 category / q 必填,linkHref / linkText 可选;
 *   - 正文即答案,支持完整 Markdown(列表、代码块、图片、链接等);
 *   - 正文里直接写 B 站视频链接即可内嵌播放器,如:
 *     [视频演示:标题](https://www.bilibili.com/video/BVxxxxxxxx)
 *   - 显示顺序由 frontmatter 的 order 字段控制(小的在前),
 *     未写 order 的新文件会排在最后,文件名无需编号。
 */
import { createContentLoader } from 'vitepress'

export interface FaqItem {
  category: string
  q: string
  /** 答案正文渲染后的 HTML(B 站链接已替换为内嵌播放器) */
  html: string
  /** 答案纯文本,用于站内搜索过滤 */
  text: string
  /** 可选文档链接 */
  linkHref?: string
  linkText?: string
}

declare const data: FaqItem[]
export { data }

/** 把答案里的 B 站视频链接替换为内嵌 iframe 播放器 */
function embedBiliVideos(html: string): string {
  return html.replace(
    /<a[^>]*href="https?:\/\/(?:www\.)?bilibili\.com\/video\/(BV[0-9A-Za-z]+)\/?[^"]*"[^>]*>[\s\S]*?<\/a>/g,
    (_, bvid: string) =>
      `<span class="xfq-video-embed"><iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=0&danmaku=0" scrolling="no" frameborder="no" framespacing="0" allowfullscreen="true" loading="lazy" title="视频演示"></iframe></span>`
  )
}

export default createContentLoader('/faq-items/*.md', {
  render: true,
  transform(raw): FaqItem[] {
    return [...raw]
      .sort((a, b) => {
        const oa = Number((a.frontmatter as Record<string, any>).order ?? Infinity)
        const ob = Number((b.frontmatter as Record<string, any>).order ?? Infinity)
        return oa - ob || a.url.localeCompare(b.url)
      })
      .map(({ frontmatter, html }) => {
        const fm = frontmatter as Record<string, any>
        const htmlText = embedBiliVideos(html ?? '')
        return {
          category: String(fm.category ?? ''),
          q: String(fm.q ?? ''),
          html: htmlText,
          text: htmlText.replace(/<[^>]+>/g, ''),
          linkHref: fm.linkHref,
          linkText: fm.linkText
        }
      })
  }
})
