<script setup lang="ts">
import LoadingHide from '~/components/loadingHide.vue'
import type { AiEmbeddingStore } from 'api-types/ai/aiEmbeddingStore'

const  s=reactive<AiEmbeddingStore>({
  storeId:""
});
</script>

<template>
  <LoadingHide />
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
