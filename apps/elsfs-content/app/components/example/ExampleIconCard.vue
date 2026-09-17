<script setup>
defineProps({
  title: {
    type: String,
    default: '默认标题',
  },
  description: {
    type: String,
    default: '默认描述',
  },
  icon: {
    type: String,
    default: 'IconMarkdown',
  },
})
</script>

<template>
  <div class="rounded border bg-white p-6 dark:border-gray-700 dark:bg-black">
    <UIcon :name="icon" class="h-20 w-20" />
    <h2 class="mb-2 text-3xl font-semibold">
      {{ title }}
    </h2>
    <p>{{ description }}</p>
  </div>
</template>
