<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const auth = useAuthStore()

/** 演示用的概览卡片，真实项目里换成接口数据即可 */
const stats = [
  { key: 'visits', label: '今日访问', value: '8,846', icon: 'data-line' },
  { key: 'newUsers', label: '新增用户', value: '328', icon: 'user' },
  { key: 'tickets', label: '待办工单', value: '12', icon: 'tickets' },
  { key: 'revenue', label: '今日销售额', value: '¥128,430', icon: 'money' },
] as const
</script>

<template>
  <div class="mx-auto max-w-5xl p-6 sm:p-8">
    <h1 class="text-xl font-bold sm:text-2xl">欢迎来到你的仪表盘</h1>

    <p v-if="auth.user" class="text-muted-foreground mt-2 text-sm">
      当前登录用户：{{ auth.user.email }}
    </p>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in stats"
        :key="item.key"
        class="border-border bg-card rounded-xl border p-4"
      >
        <div class="text-muted-foreground flex items-center justify-between">
          <span class="text-xs">{{ item.label }}</span>
          <AppIcon :name="item.icon" class="size-4" />
        </div>
        <div class="mt-3 text-xl font-semibold">
          {{ item.value }}
        </div>
      </div>
    </div>

    <p
      class="border-border text-muted-foreground mt-6 rounded-xl border border-dashed p-5 text-sm leading-relaxed"
    >
      左侧是收藏的菜单，点击顶栏左上角的「全部菜单」可以随时增删。
    </p>
  </div>
</template>
