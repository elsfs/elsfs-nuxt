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
  <div class="p-6 border bg-white dark:bg-black dark:border-gray-700 rounded">
    <UIcon
      :name="icon"
      class="w-20 h-20"
    />
    <h2 class="text-3xl font-semibold mb-2">
      {{ title }}
    </h2>
    <p>{{ description }}</p>
  </div>
</template>
