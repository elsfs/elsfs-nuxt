<script setup lang="ts">
import { useField, useForm } from 'vee-validate'
import { onBeforeUnmount } from 'vue'

import type { CodeLoginFormValues } from '~/composables/useAuthValidation'

interface Props {
  /** 是否处于登录提交加载状态 */
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

defineOptions({ name: 'AuthCodeLogin' })

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loginPath: '/login',
  submitButtonText: '',
  subTitle: '',
  title: '',
  showBack: true,
})

const emit = defineEmits<{ submit: [values: CodeLoginFormValues] }>()

const { t } = useI18n()
const auth = useAuthStore()
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
    // 错误码已写入 store，可由父层展示；此处仅停止倒计时
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

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})

function goToLogin(): void {
  router.push(props.loginPath)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ title || `${t('login.welcomeBack')} 📲` }}
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || t('codeLogin.subtitle') }}
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
        :label="t('codeLogin.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
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
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('codeLogin.code')"
        :error="codeError"
      >
        <ElInput
          v-model="code"
          inputmode="numeric"
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
        class="w-full"
        native-type="submit"
        :loading="isSubmitting || loading"
      >
        {{ submitButtonText || t('codeLogin.submit') }}
      </ElButton>
    </form>

    <ElButton
      v-if="showBack"
      type="default"
      plain
      class="mt-4 w-full"
      @click="goToLogin()"
    >
      {{ t('common.back') }}
    </ElButton>
  </div>
</template>
