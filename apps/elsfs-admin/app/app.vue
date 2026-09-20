<script setup lang="ts">
import LoadingHide from '~/components/loadingHide.vue'
import type { AiEmbeddingStore } from 'api-types/ai/aiEmbeddingStore'
import  {requestPath,useRequestHandle} from 'api-types/ai/aiEmbeddingStore'
import  { useRequestHandle} from 'api-types/ai/aiEmbeddingStore'

requestPath.getByIdPath

const aiEmbeddingStore = ref<AiEmbeddingStore>()

</script>

<template>
  <LoadingHide />
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
