<script setup lang="ts">
/**
 * 富页脚只在「沉浸式自定义页」显示（首页、方案/模型/布局/插件列表、常见问题）。
 * 文档页仍用主题自带的简洁页脚，避免正文页底部过重。
 */
import { computed } from 'vue'
import { useData } from 'vitepress'
import SiteFooter from './SiteFooter.vue'

const { frontmatter } = useData()
const isCustom = computed(() => String(frontmatter.value.layout || '').startsWith('custom'))
</script>

<template>
  <SiteFooter v-if="isCustom" />
</template>
