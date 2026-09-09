<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { LoginFormValues } from '~/composables/useAuthValidation'

interface Props {
  /** 是否处于提交加载状态 */
  loading?: boolean
  /** 标题 */
  title?: string
  /** 描述 */
  subTitle?: string
  /** 主按钮文本 */
  submitButtonText?: string
  codeLoginPath?: string
  qrcodeLoginPath?: string
  registerPath?: string
  forgetPasswordPath?: string
  showRememberMe?: boolean
  showForgetPassword?: boolean
  showCodeLogin?: boolean
  showQrcodeLogin?: boolean
  showThirdPartyLogin?: boolean
  showRegister?: boolean
}

defineOptions({ name: 'AuthLogin' })

withDefaults(defineProps<Props>(), {
  loading: false,
  title: '',
  subTitle: '',
  submitButtonText: '',
  codeLoginPath: '/code-login',
  qrcodeLoginPath: '/qrcode-login',
  registerPath: '/register',
  forgetPasswordPath: '/forget-password',
  showRememberMe: true,
  showForgetPassword: true,
  showCodeLogin: true,
  showQrcodeLogin: true,
  showThirdPartyLogin: true,
  showRegister: true,
})

const emit = defineEmits<{
  submit: [values: LoginFormValues]
  social: [provider: string]
}>()

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
const { value: remember } = useField<boolean>('remember')

const showPassword = ref(false)

const errorMessage = computed(() => (auth.errorCode ? t(`errors.${auth.errorCode}`) : ''))

const onSubmit = handleSubmit((values) => {
  // 记住账号（仅浏览器环境）
  if (values.remember) {
    localStorage.setItem('elsfs_remember_email', values.email)
  }
  else {
    localStorage.removeItem('elsfs_remember_email')
  }
  emit('submit', values)
})

function handleSocial(provider: string): void {
  emit('social', provider)
}

function goTo(path: string): void {
  router.push(path)
}
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ title || `${t('login.welcomeBack')} 👋🏻` }}
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || t('login.subtitle') }}
        </slot>
      </template>
    </AuthTitle>

    <ElAlert
      v-if="errorMessage"
      type="error"
      show-icon
      class="mb-6"
      :title="errorMessage"
    />

    <ElForm
      label-position="top"
      novalidate
      class="auth-form"
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

      <!-- 记住我 / 忘记密码 -->
      <div class="flex items-center justify-between">
        <ElCheckbox
          v-if="showRememberMe"
          v-model="remember"
        >
          {{ t('login.rememberMe') }}
        </ElCheckbox>
        <span
          v-if="showForgetPassword"
          class="vben-link text-sm font-normal"
          @click="goTo(forgetPasswordPath)"
        >
          {{ t('login.forgotPassword') }}
        </span>
      </div>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || loading"
      >
        {{ submitButtonText || t('common.login') }}
      </ElButton>
    </ElForm>

    <!-- 手机验证码 / 二维码登录入口 -->
    <div
      v-if="showCodeLogin || showQrcodeLogin"
      class="mt-4 flex items-center justify-between gap-3"
    >
      <ElButton
        v-if="showCodeLogin"
        class="flex-1"
        type="default"
        plain
        @click="goTo(codeLoginPath)"
      >
        <AppIcon
          name="key"
          class="mr-1 size-4"
        />
        {{ t('login.mobileLogin') }}
      </ElButton>
      <ElButton
        v-if="showQrcodeLogin"
        class="flex-1"
        type="default"
        plain
        @click="goTo(qrcodeLoginPath)"
      >
        <AppIcon
          name="monitor"
          class="mr-1 size-4"
        />
        {{ t('login.qrcodeLogin') }}
      </ElButton>
    </div>

    <!-- 第三方登录 -->
    <slot name="third-party-login">
      <AuthThirdPartyLogin
        v-if="showThirdPartyLogin"
        @submit="handleSocial"
      />
    </slot>

    <!-- 注册引导 -->
    <slot name="to-register">
      <div
        v-if="showRegister"
        class="mt-4 text-center text-sm text-muted-foreground"
      >
        {{ t('login.noAccountTip') }}
        <span
          class="vben-link text-sm font-normal"
          @click="goTo(registerPath)"
        >
          {{ t('login.createAccount') }}
        </span>
      </div>
    </slot>
  </div>
</template>
