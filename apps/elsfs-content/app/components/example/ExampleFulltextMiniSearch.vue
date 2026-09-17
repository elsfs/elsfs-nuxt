<script setup lang="ts">
import MiniSearch from 'minisearch'

const query = ref('')
const { data } = await useAsyncData('search-data', () => queryCollectionSearchSections('docs'))

const miniSearch = new MiniSearch({
  fields: ['title', 'content'],
  storeFields: ['title', 'content'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
  },
})

// Add data to the MiniSearch instance
miniSearch.addAll(toValue(data.value || []))
const result = computed(() => miniSearch.search(toValue(query)).slice(0, 10))
</script>

<template>
  <UContainer class="p-4">
    <UCard>
      <UInput v-model="query" placeholder="搜索..." class="w-full" />
      <ul>
        <li v-for="link of result" :key="link.id" class="mt-2">
          <UButton variant="ghost" class="w-full" :to="link.id">
            <div class="flex flex-col">
              <span class="font-semibold text-black dark:text-white">{{ link.title }}</span>
              <span class="truncate text-xs text-gray-500">
                {{ link.content?.slice(0, 100) }}...
              </span>
            </div>
          </UButton>
        </li>
      </ul>
    </UCard>
  </UContainer>
</template>
