<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { LoginFormValues } from '~/composables/useAuthValidation'

interface Props {
  /** 过期提示标题 */
  title?: string
  /** 过期提示副标题 */
  subTitle?: string
  /** 登录成功后跳转路径 */
  redirect?: string
}

defineOptions({ name: 'AuthLoginExpiredModal' })

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subTitle: '',
  redirect: '/',
})

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const { loginSchema } = useAuthValidation()

const { handleSubmit, isSubmitting } = useForm<LoginFormValues>({
  validationSchema: loginSchema,
  initialValues: { email: '', password: '', remember: false },
})

const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

const showPassword = ref(false)
const errorMessage = computed(() => (auth.errorCode ? t(`errors.${auth.errorCode}`) : ''))

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values)
    open.value = false
    await router.push(props.redirect)
  }
  catch {
    // 错误码已写入 store，由 errorMessage 展示
  }
})
</script>

<template>
  <ElDialog
    v-model="open"
    width="440"
    :show-close="false"
    :close-on-click-modal="false"
    align-center
    class="rounded-2xl"
    destroy-on-close
  >
    <template #header>
      <div class="flex flex-col items-center gap-2 pt-4 text-center">
        <div class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <AppIcon
            name="unlock"
            class="size-7"
          />
        </div>
        <h3 class="mt-1 text-lg font-bold text-foreground">
          {{ title || t('login.loginAgainTitle') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ subTitle || t('login.loginAgainSubTitle') }}
        </p>
      </div>
    </template>

    <ElAlert
      v-if="errorMessage"
      type="error"
      show-icon
      class="mb-4"
      :title="errorMessage"
    />

    <ElForm
      label-position="top"
      novalidate
      class="auth-form space-y-4"
      @submit="onSubmit"
    >
      <ElFormItem
        :label="t('login.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          size="large"
          :placeholder="t('login.emailPlaceholder')"
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

      <ElFormItem
        :label="t('login.password')"
        :error="passwordError"
      >
        <ElInput
          v-model="password"
          size="large"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('login.passwordPlaceholder')"
          autocomplete="current-password"
        >
          <template #prefix>
            <AppIcon
              name="lock"
              class="size-4 text-dimmed"
            />
          </template>
          <template #suffix>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <AppIcon
                :name="showPassword ? 'hide' : 'view'"
                class="size-4"
              />
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting"
      >
        {{ t('common.login') }}
      </ElButton>
    </ElForm>
  </ElDialog>
</template>
