<script setup lang="ts">
/**
 * 系统管理 - 角色管理 / 编辑角色。
 */
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  title: '编辑角色',
})

const route = useRoute()
const roleId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <SystemRoleForm :role-id="roleId" />
</template>
