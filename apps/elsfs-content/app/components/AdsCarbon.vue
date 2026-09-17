<script setup lang="ts">
const el = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!el.value) {
    return
  }
  if (document.querySelector('#_carbonads_js')) {
    return
  }

  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute(
    'src',
    'https://cdn.carbonads.com/carbon.js?serve=CWYIPK7W&placement=contentnuxtcom',
  )
  script.setAttribute('id', '_carbonads_js')

  el.value?.appendChild(script)
})
</script>

<template>
  <div ref="el" class="carbon" />
</template>

<style scoped>
@reference "../assets/css/main.css";

.carbon :deep(#carbonads) {
  @apply bg-muted hover:bg-elevated relative min-h-[220px] w-full rounded-md p-2.5 transition-colors;

  .carbon-img {
    @apply flex w-full justify-center;

    & > img {
      @apply w-full !max-w-full rounded-sm;
    }
  }

  .carbon-text {
    @apply flex pt-2 text-[13px] font-medium text-pretty transition-colors;
  }

  .carbon-poweredby {
    @apply text-muted block pt-2 text-xs;
  }

  &:hover {
    .carbon-text {
      @apply text-highlighted;
    }
  }
}
</style>
