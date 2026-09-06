import DefaultTheme from 'vitepress/theme'
import './custom.css'
import CustomHome from './components/CustomHome.vue'
import CustomPluginList from './components/CustomPluginList.vue'
import CustomRimeList from './components/CustomRimeList.vue'
import CustomModelList from './components/CustomModelList.vue'
import CustomFaq from './components/CustomFaq.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomHome', CustomHome)
    app.component('CustomPluginList', CustomPluginList)
    app.component('CustomRimeList', CustomRimeList)
    app.component('CustomModelList', CustomModelList)
    app.component('CustomFaq', CustomFaq)
  }
}
