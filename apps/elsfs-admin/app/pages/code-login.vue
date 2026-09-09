<script setup lang="ts">
import type { CodeLoginFormValues } from '~/composables/useAuthValidation'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function onSubmit(values: CodeLoginFormValues) {
  try {
    await auth.codeLogin(values)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
  catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}
</script>

<template>
  <AuthCodeLogin
    :loading="auth.status === 'loading'"
    @submit="onSubmit"
  />
</template>
