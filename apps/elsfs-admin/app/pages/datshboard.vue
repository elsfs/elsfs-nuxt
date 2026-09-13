<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const auth = useAuthStore()

/** 演示用的概览卡片，真实项目里换成接口数据即可 */
const stats = [
  { key: 'visits', value: '8,846', icon: 'data-line' },
  { key: 'newUsers', value: '328', icon: 'user' },
  { key: 'tickets', value: '12', icon: 'tickets' },
  { key: 'revenue', value: '¥128,430', icon: 'money' },
] as const
</script>

<template>
  <div class="mx-auto max-w-5xl p-6 sm:p-8">
    <h1 class="text-xl font-bold sm:text-2xl">
      {{ t('admin.welcomeTitle') }}
    </h1>

    <p
      v-if="auth.user"
      class="mt-2 text-sm text-muted-foreground"
    >
      {{ t('admin.currentUser') }}：{{ auth.user.email }}
    </p>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in stats"
        :key="item.key"
        class="rounded-xl border border-border bg-card p-4"
      >
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs">{{ t(`admin.stats.${item.key}`) }}</span>
          <AppIcon
            :name="item.icon"
            class="size-4"
          />
        </div>
        <div class="mt-3 text-xl font-semibold">
          {{ item.value }}
        </div>
      </div>
    </div>

    <p class="mt-6 rounded-xl border border-dashed border-border p-5 text-sm leading-relaxed text-muted-foreground">
      {{ t('admin.favoritesHint') }}
    </p>
  </div>
</template>
