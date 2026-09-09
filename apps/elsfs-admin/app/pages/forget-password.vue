<script setup lang="ts">
import type { ForgetPasswordFormValues } from '~/composables/useAuthValidation'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const auth = useAuthStore()

async function onSubmit(values: ForgetPasswordFormValues) {
  try {
    await auth.forgetPassword(values.email)
    ElMessage.success(t('forgetPassword.successTitle'))
  }
  catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}
</script>

<template>
  <AuthForgetPassword
    :loading="auth.status === 'loading'"
    @submit="onSubmit"
  />
</template>
