<script setup lang="ts">
const route = useRoute()

const links = computed(() => [
  {
    label: '文档',
    icon: 'i-lucide-book-open',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs') && !route.path.startsWith('/docs/studio'),
  }, {
    label: 'Studio',
    icon: 'i-lucide-file-pen-line',
    to: 'https://nuxt.studio',
    target: '_blank',
  }, {
    label: '模板',
    icon: 'i-lucide-layout-template',
    to: '/templates',
  }, {
    label: '博客',
    icon: 'i-lucide-file-text',
    to: '/blog',
  },
])
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
  />
</template>
