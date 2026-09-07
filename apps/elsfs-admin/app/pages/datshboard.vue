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

    <UButton
      color="error"
      variant="soft"
      class="mt-6"
      @click="handleLogout"
    >
      <template #leading>
        <UIcon
          name="i-lucide-log-out"
          class="size-4"
        />
      </template>
      {{ t('common.logout') }}
    </UButton>
  </div>
</template>
