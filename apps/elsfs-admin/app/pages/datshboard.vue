<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-8">
    <h1 class="text-2xl font-bold">
      欢迎来到你的仪表盘
    </h1>

    <div
      v-if="auth.user"
      class="mt-4 text-sm text-slate-600"
    >
      当前登录用户：{{ auth.user.email }}
    </div>

    <ElButton
      type="danger"
      class="mt-6"
      @click="handleLogout"
    >
      <AppIcon
        name="switch-button"
        class="size-4"
      />
      {{ t('common.logout') }}
    </ElButton>
  </div>
</template>
