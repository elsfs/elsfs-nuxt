<script setup lang="ts">
import { useField, useForm } from 'vee-validate'
import { onBeforeUnmount } from 'vue'
import type { CodeLoginFormValues } from './useAuthValidation'
import { useAuthValidation } from './useAuthValidation'
import AuthTitle from './-auth-title.vue'
definePageMeta({ layout: 'auth', middleware: 'guest' })

defineOptions({ name: 'AuthCodeLogin' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const { codeLoginSchema } = useAuthValidation()

const { handleSubmit, isSubmitting } = useForm<CodeLoginFormValues>({
  validationSchema: codeLoginSchema,
  initialValues: { email: '', code: '' },
})

const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: code, errorMessage: codeError } = useField<string>('code')

/** 验证码发送倒计时 */
const countdown = ref(0)
const sendingCode = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const getCodeText = computed(() => {
  if (countdown.value > 0) {
    return t('codeLogin.resendAfter', { s: countdown.value })
  }
  return t('codeLogin.getCode')
})

const canSend = computed(() => countdown.value <= 0 && !sendingCode.value)

async function handleSendCode(): Promise<void> {
  if (!canSend.value) return
  const target = email.value.trim()
  if (!target) {
    return
  }
  sendingCode.value = true
  try {
    await auth.sendCode({ email: target, scene: 'login' })
    ElMessage.success(t('codeLogin.sendSuccess'))
    startCountdown()
  }
  catch {
    // 错误码已写入 store，由模板内 Alert 展示
  }
  finally {
    sendingCode.value = false
  }
}

function startCountdown(): void {
  countdown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }, 1000)
}

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.codeLogin(values)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
  catch {
    // 错误码已写入 store，由模板内 Alert 展示
  }
})

function goToLogin(): void {
  router.push('/auth/login')
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ t('login.welcomeBack') }} 📲
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ t('codeLogin.subtitle') }}
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

    <ElForm
      label-position="top"
      novalidate
      class="auth-form"
      @submit="onSubmit"
    >
      <ElFormItem
        :label="t('codeLogin.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          size="large"
          :placeholder="t('codeLogin.emailPlaceholder')"
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
        :label="t('codeLogin.code')"
        :error="codeError"
      >
        <ElInput
          v-model="code"
          inputmode="numeric"
          size="large"
          maxlength="6"
          :placeholder="t('codeLogin.codePlaceholder')"
          autocomplete="one-time-code"
        >
          <template #prefix>
            <AppIcon
              name="key"
              class="size-4 text-dimmed"
            />
          </template>
          <template #suffix>
            <button
              type="button"
              :disabled="!canSend"
              class="text-xs font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleSendCode"
            >
              {{ getCodeText }}
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || auth.status === 'loading'"
      >
        {{ t('codeLogin.submit') }}
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
