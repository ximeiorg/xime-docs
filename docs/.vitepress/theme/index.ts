import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import CopyMarkdown from './components/CopyMarkdown.vue'
import CustomHome from './components/CustomHome.vue'
import CustomPluginList from './components/CustomPluginList.vue'
import CustomRimeList from './components/CustomRimeList.vue'
import CustomModelList from './components/CustomModelList.vue'
import CustomLayoutList from './components/CustomLayoutList.vue'
import CustomFaq from './components/CustomFaq.vue'
import CustomFooterGate from './components/CustomFooterGate.vue'
import PlatTabs from './components/PlatTabs.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 导航栏右上角：复制本页 Markdown（宽屏）
      'nav-bar-content-after': () => h(CopyMarkdown, { placement: 'nav' }),
      // 中等屏幕导航栏放不下时，改放到正文标题上方
      'doc-before': () => h(CopyMarkdown, { placement: 'inline' }),
      // 沉浸式自定义页的富页脚（文档页不渲染，仍用主题自带页脚）
      'layout-bottom': () => h(CustomFooterGate)
    })
  },
  enhanceApp({ app }) {
    app.component('CustomHome', CustomHome)
    app.component('CustomPluginList', CustomPluginList)
    app.component('CustomRimeList', CustomRimeList)
    app.component('CustomModelList', CustomModelList)
    app.component('CustomLayoutList', CustomLayoutList)
    app.component('CustomFaq', CustomFaq)
    app.component('PlatTabs', PlatTabs)
  }
}
