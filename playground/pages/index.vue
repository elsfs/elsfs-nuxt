<script setup lang="ts">
import { useWebsiteStore } from '~/stores/website.ts'

const website = useWebsiteStore()

await callOnce(website.fetch)
</script>

<template>
  <main>
    <h1>{{ website.name }}</h1>
    <p>{{ website.description }}</p>
    <h1>首页</h1>
    <NuxtLink to="/about">关于页面</NuxtLink>
  </main>

</template>
