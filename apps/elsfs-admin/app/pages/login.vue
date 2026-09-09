<script setup lang="ts">
import type { LoginFormValues } from '~/composables/useAuthValidation'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function onLogin(values: LoginFormValues) {
  try {
    await auth.login({
      email: values.email,
      password: values.password,
      remember: values.remember,
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
  catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}

async function onSocial(provider: string) {
  try {
    await auth.socialLogin(provider)
    await router.push('/')
  }
  catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}
</script>

<template>
  <AuthLogin
    :loading="auth.status === 'loading'"
    @submit="onLogin"
    @social="onSocial"
  />
</template>
