<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { ForgetPasswordFormValues } from '~/composables/useAuthValidation'

interface Props {
  /** 是否处于提交加载状态 */
  loading?: boolean
  /** 登录路径（返回用） */
  loginPath?: string
  /** 标题 */
  title?: string
  /** 描述 */
  subTitle?: string
  /** 按钮文本 */
  submitButtonText?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
}

defineOptions({ name: 'AuthForgetPassword' })

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loginPath: '/login',
  submitButtonText: '',
  subTitle: '',
  title: '',
  showBack: true,
})

const emit = defineEmits<{ submit: [values: ForgetPasswordFormValues] }>()

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const { forgetPasswordSchema } = useAuthValidation()

const { handleSubmit, isSubmitting } = useForm<ForgetPasswordFormValues>({
  validationSchema: forgetPasswordSchema,
  initialValues: { email: '' },
})

const { value: email, errorMessage: emailError } = useField<string>('email')

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})

function goToLogin(): void {
  router.push(props.loginPath)
}
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ title || `${t('forgetPassword.title')} 🤦🏻‍♂️` }}
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || t('forgetPassword.subtitle') }}
        </slot>
      </template>
    </AuthTitle>

    <ElAlert
      v-if="auth.errorCode"
      type="error"
      show-icon
      class="mb-6"
      :title="t(`errors.${auth.errorCode}`)"
    />

    <form
      novalidate
      class="space-y-5"
      @submit="onSubmit"
    >
      <ElFormItem
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('forgetPassword.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
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
        block
        native-type="submit"
        :loading="isSubmitting || loading"
        :label="submitButtonText || t('forgetPassword.submit')"
      />
    </form>

    <ElButton
      v-if="showBack"
      type="default"
      plain
      block
      class="mt-4"
      @click="goToLogin()"
    >
      {{ t('common.back') }}
    </ElButton>
  </div>
</template>
