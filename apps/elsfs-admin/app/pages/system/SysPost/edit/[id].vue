<script setup lang="ts">
/**
 * 系统管理 - 职位管理 / 编辑职位。
 */
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  title: '编辑职位',
})

const route = useRoute()
const postId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <SystemPostForm :post-id="postId" />
</template>
