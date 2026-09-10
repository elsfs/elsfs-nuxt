<script setup lang="ts">
defineOptions({ name: 'AuthenticationFormView' })

withDefaults(
  defineProps<{
    dataSide?: 'bottom' | 'left' | 'right' | 'top'
  }>(),
  {
    dataSide: 'left',
  },
)
</script>

<template>
  <div
    class="relative flex-col-center min-h-screen bg-background px-6 py-10 lg:flex-initial lg:px-8 dark:bg-background-deep"
  >
    <!-- 表单内容（含认证页面） -->
    <div class="side-content mt-8 w-full sm:mx-auto md:max-w-md">
      <slot />
    </div>

    <!-- 底部版权 -->
    <div
      class="absolute right-0 bottom-3 left-0 flex justify-center px-6 text-center text-xs"
    >
      <slot name="copyright" />
    </div>
  </div>
</template>
