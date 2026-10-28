<script setup lang="ts">
/**
 * 系统管理 - 部门管理 / 新增部门。
 *
 * 从列表页行内「新增子部门」进入时会带 `?parentId=<deptId>`，由表单组件预填上级部门。
 */
definePageMeta({
  layout: 'admin',
  title: '新增部门',
})
</script>

<template>
  <SystemDeptForm />
</template>
