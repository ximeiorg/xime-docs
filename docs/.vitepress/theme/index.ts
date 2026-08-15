import DefaultTheme from 'vitepress/theme'
import './custom.css'
import CustomHome from './components/CustomHome.vue'
import CustomPluginList from './components/CustomPluginList.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomHome', CustomHome)
    app.component('CustomPluginList', CustomPluginList)
  }
}
