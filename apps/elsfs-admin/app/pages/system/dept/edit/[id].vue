<script setup lang="ts">
/**
 * 系统管理 - 部门管理 / 编辑部门。
 */
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  title: '编辑部门',
})

const route = useRoute()
const deptId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <SystemDeptForm :dept-id="deptId" />
</template>
