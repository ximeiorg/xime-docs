/** B 站视频数据，后续新增内容直接在数组里追加 */

export interface FaqVideo {
  bvid: string
  title: string
  /** faq = 常见问题演示，tutorial = 教程 */
  kind: 'faq' | 'tutorial'
}

export const videos: FaqVideo[] = [
  {
    bvid: 'BV1Bq4o6tEu9',
    title: '曦码输入法用万象方案时怎么切双拼？',
    kind: 'faq'
  },
  {
    bvid: 'BV1A6496fEBF',
    title: '曦码输入法 WebDAV 跨设备同步剪贴板插件演示',
    kind: 'faq'
  },
  {
    bvid: 'BV1Pvgx6rEfv',
    title: '如何自定义你的键盘：五笔字根、小鹤双拼韵母、微软双拼分号键',
    kind: 'tutorial'
  }
]
