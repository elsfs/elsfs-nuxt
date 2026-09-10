<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { ForgetPasswordFormValues } from './useAuthValidation.ts'

import { useAuthValidation } from './useAuthValidation.ts'
import AuthTitle from './-auth-title.vue'

defineOptions({ name: 'AuthForgetPassword' })

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
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
    ElMessage.success(t('forgetPassword.successTitle'))
  }
  catch {
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
      {{ t('forgetPassword.title') }} 🤦🏻‍♂️
      <template #desc>
        {{ t('forgetPassword.subtitle') }}
      </template>
    </AuthTitle>

    <ElAlert
      v-if="auth.errorCode"
      type="error"
      show-icon
      class="mb-6"
      :title="t(`errors.${auth.errorCode}`)"
    />

    <ElForm
      label-position="top"
      novalidate
      class="auth-form"
      @submit="submitHandler"
    >
      <ElFormItem
        :label="t('forgetPassword.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          size="large"
          :placeholder="t('forgetPassword.emailPlaceholder')"
          autocomplete="email"
        >
          <template #prefix>
            <AppIcon
              name="message"
              class="size-4 text-dimmed"
            />
          </template>
        </ElInput>
      </ElFormItem>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || auth.status === 'loading'"
      >
        {{ t('forgetPassword.submit') }}
      </ElButton>
    </ElForm>

    <ElButton
      type="default"
      plain
      class="mt-4 w-full"
      @click="goToLogin()"
    >
      {{ t('common.back') }}
    </ElButton>
  </div>
</template>
