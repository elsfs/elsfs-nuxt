<script setup lang="ts">
definePageMeta({
  layout: 'orange',
  layoutTransition: {
    name: 'slide-in',
  },
})
useSeoMeta({
  title: '我的精彩网站',
  ogTitle: '我的精彩网站',
  description: '这是我的精彩网站，让我为你详细介绍。',
  ogDescription: '这是我的精彩网站，让我为你详细介绍。',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <h1>关于页面</h1>
    <NuxtLink to="/apps/elsfs-admin/app/public">首页</NuxtLink>
  </div>
</template>
