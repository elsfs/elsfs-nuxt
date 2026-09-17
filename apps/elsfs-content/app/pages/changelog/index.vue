<script setup lang="ts">
const containers = useTemplateRef<HTMLDivElement[]>('containers') as Ref<HTMLDivElement[]>
const marker = useTemplateRef<HTMLDivElement>('marker') as Ref<HTMLDivElement>
const dots = useTemplateRef<HTMLDivElement[]>('dots') as Ref<HTMLDivElement[]>
const markerTop = ref(0)
const PAGE_SIZE = 5
const loadedPages = ref(1)

const { y } = useWindowScroll()
const { isScrolling, arrivedState } = useScroll(document)

const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('changelog-landing', () =>
  queryCollection('landing').path('/changelog').first(),
)
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: posts } = await useAsyncData('changelog-posts', () =>
  queryCollection('posts')
    .where('path', 'LIKE', '/changelog%')
    .where('draft', '=', 0)
    .order('date', 'DESC')
    .all(),
)

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})

const paginatedPosts = computed(() =>
  canLoadMore.value
    ? posts.value?.slice(0, loadedPages.value * PAGE_SIZE) || []
    : posts.value || [],
)
const canLoadMore = computed(() => (posts.value?.length || 0) / PAGE_SIZE > loadedPages.value)
function loadMore() {
  loadedPages.value++
}

watch(
  () => y.value,
  () => {
    markerTop.value = y.value

    for (let i = 0; i < dots.value.length; i++) {
      // Height is the sum of all the previous containers
      const containersHeight = containers.value.map(
        (container) => container.getBoundingClientRect().height,
      )
      const height = containersHeight.slice(0, i).reduce((acc, curr) => acc + curr, 0)

      // If the marker is located between the top of the container and the bottom of the container (variant with the gap), it is highlighted
      const GAP = 150
      if (
        markerTop.value >= height - GAP &&
        markerTop.value <= height + containersHeight[i]! - GAP
      ) {
        dots.value[i]!.classList.add('neon')
      } else {
        dots.value[i]!.classList.remove('neon')
      }
    }
  },
)

watch(
  () => arrivedState.bottom,
  () => {
    if (arrivedState.bottom && canLoadMore.value) {
      loadMore()
    }
  },
)
</script>

<template>
  <UPage>
    <UPageHero :title="page?.title" :description="page?.description" />

    <UPageBody>
      <UContainer>
        <div class="relative">
          <div
            ref="marker"
            class="neon marker absolute hidden rounded-full bg-gray-500 lg:block dark:bg-gray-400"
            :style="{
              left: '153px',
              top: `${markerTop}px`,
              height: `${isScrolling ? 40 : 0}px`,
              width: '2px',
            }"
          />

          <ul class="flex flex-col">
            <li
              v-for="(post, index) in paginatedPosts"
              :key="post.id"
              ref="containers"
              class="flex flex-col"
            >
              <div class="flex flex-col lg:flex-row">
                <div class="-mt-2 flex w-full pb-4 lg:max-w-[150px] lg:pb-0">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    <time>{{ formatDateByLocale(post.date) }}</time>
                  </p>
                </div>
                <div class="relative hidden lg:flex lg:min-w-[150px]">
                  <div
                    ref="dots"
                    class="hidden h-2 w-2 rounded-full bg-(--ui-primary) lg:block"
                    :class="{ neon: index === 0 }"
                  />

                  <div class="absolute top-0.5 left-[3.5px] h-full w-[1px] bg-(--ui-primary)" />
                </div>
                <div class="pb-32">
                  <UBlogPost
                    :key="index"
                    :title="post.title"
                    :description="post.description"
                    :image="{ ...post.image, height: 915 }"
                    :to="post.path"
                    :authors="post.authors"
                    variant="naked"
                    :ui="{
                      body: '!px-0',
                      header: 'aspect-auto',
                    }"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<style lang="postcss" scoped>
.neon {
  box-shadow:
    0 0 1px rgb(0 220 128),
    0 0 15px rgb(0 220 128),
    0 0 1px rgb(0 220 128),
    0 0 6px rgb(0 220 128),
    0 0 12px rgb(0 220 128),
    0 0 22px rgb(0 220 128);
  transition: all 1s ease;
}

.marker {
  transition:
    top 0.2s linear,
    height 0.4s ease,
    width 0.3s ease,
    left 0.3s ease;
}
</style>
