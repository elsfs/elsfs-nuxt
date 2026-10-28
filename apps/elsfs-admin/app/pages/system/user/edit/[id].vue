<script setup lang="ts">
/**
 * 系统管理 - 账号管理 / 编辑账号。
 */
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  title: '编辑账号',
})

const route = useRoute()
const userId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <SystemUserForm :user-id="userId" />
</template>
