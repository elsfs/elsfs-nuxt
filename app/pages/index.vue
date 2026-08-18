<script setup lang="ts">
import { useWebsiteStore } from '~/stores/website.ts'

const website = useWebsiteStore()

await callOnce(website.fetch)
const res = await useFetch('/api/demo', {
  onResponse({ response }) {
    // 所有响应都会经过这里，包括成功和失败的
    console.log('状态码:', response.status) // 200, 404, 500...
  },
})
</script>

<template>
  <main>
    <h2> 请求的数据：{{ res.data }}</h2>
    <h2> 请求的数据：{{ res.status }}</h2>
    <h2> 请求的数据：{{ res.error }}</h2>

    <h1>{{ website.name }}</h1>
    <p>{{ website.description }}</p>
    <h1>首页</h1>
    <NuxtLink to="/about">关于页面</NuxtLink>
  </main>
</template>
