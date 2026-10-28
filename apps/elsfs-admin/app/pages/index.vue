<script setup lang="ts">
/**
 * 首页只做跳转：统一进入后台分析页。
 *
 * 未登录时由全局认证中间件接管（先跳登录页，登录后再回到目标页面），
 * 因此这里不需要再判断登录态。
 */
definePageMeta({
  redirect: '/analytics',
})
</script>

<template>
  <div />
</template>
