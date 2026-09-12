<template>
  <div>
    <h2 class="text-lg font-semibold mt-5">
      功能特性
    </h2>
    <UAccordion
      :items="features"
      multiple
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  features: {
    label: string
    content: string
  }[]
}>()
</script>
