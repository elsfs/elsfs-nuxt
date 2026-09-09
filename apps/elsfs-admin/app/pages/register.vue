<script setup lang="ts">
import type { RegisterFormValues } from '~/composables/useAuthValidation'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function onRegister(values: RegisterFormValues) {
  try {
    await auth.register({
      username: values.username,
      email: values.email,
      password: values.password,
    })
    ElMessage.success(t('register.success'))
    await router.push('/')
  }
  catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}
</script>

<template>
  <AuthRegister
    :loading="auth.status === 'loading'"
    @submit="onRegister"
  />
</template>
