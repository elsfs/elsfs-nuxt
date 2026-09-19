<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import { authErrorMessage } from '~/utils/auth-errors'

import AuthTitle from './-auth-title.vue'
import type { ForgetPasswordFormValues } from './useAuthValidation.ts'
import { useAuthValidation } from './useAuthValidation.ts'

defineOptions({ name: 'AuthForgetPassword' })

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const router = useRouter()

const { forgetPasswordSchema } = useAuthValidation()

const { handleSubmit, isSubmitting } = useForm<ForgetPasswordFormValues>({
  validationSchema: forgetPasswordSchema,
  initialValues: { email: '' },
})

const { value: email, errorMessage: emailError } = useField<string>('email')

async function onSubmit(values: ForgetPasswordFormValues) {
  try {
    await auth.forgetPassword(values.email)
    ElMessage.success('邮件已发送')
  } catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}

const submitHandler = handleSubmit((values) => {
  onSubmit(values)
})

function goToLogin(): void {
  router.push('/auth/login')
}
</script>

<template>
  <div>
    <AuthTitle>
      重置密码 🤦🏻‍♂️
      <template #desc> 输入注册邮箱，我们将发送重置链接 </template>
    </AuthTitle>

    <ElAlert
      v-if="auth.errorCode"
      type="error"
      show-icon
      class="mb-6"
      :title="authErrorMessage(auth.errorCode)"
    />

    <ElForm label-position="top" novalidate class="auth-form" @submit="submitHandler">
      <ElFormItem label="邮箱" :error="emailError">
        <ElInput
          v-model="email"
          type="email"
          size="large"
          placeholder="you@example.com"
          autocomplete="email"
        >
          <template #prefix>
            <AppIcon name="message" class="text-dimmed size-4" />
          </template>
        </ElInput>
      </ElFormItem>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || auth.status === 'loading'"
      >
        发送重置链接
      </ElButton>
    </ElForm>

    <ElButton type="default" plain class="mt-4 w-full" @click="goToLogin()"> 返回 </ElButton>
  </div>
</template>
