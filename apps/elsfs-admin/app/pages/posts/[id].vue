<script setup lang="ts">
const route = useRoute()

// 访问 /posts/1 时，route.params.id 的值为 1
console.log(route.params.id)
definePageMeta({
  validate: async (route) => {
    // 检查 id 是否由数字组成
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id)
  },
})
</script>

<template>
  <div>
    <h1>Post: {{ route.params.id }}</h1>
    <h1>matched: {{ route.matched[0]?.components }}</h1>
  </div>
</template>
