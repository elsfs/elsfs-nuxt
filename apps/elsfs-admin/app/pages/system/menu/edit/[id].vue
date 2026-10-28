<script setup lang="ts">
/**
 * 系统管理 - 菜单管理 / 编辑菜单。
 */
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  title: '编辑菜单',
})

const route = useRoute()
const menuId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <SystemMenuForm :menu-id="menuId" />
</template>
