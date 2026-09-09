<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { RegisterFormValues } from '~/composables/useAuthValidation'

interface Props {
  /** 是否处于提交加载状态 */
  loading?: boolean
  /** 登录路径 */
  loginPath?: string
  /** 标题 */
  title?: string
  /** 描述 */
  subTitle?: string
  /** 提交按钮文本 */
  submitButtonText?: string
}

defineOptions({ name: 'AuthRegister' })

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loginPath: '/login',
  submitButtonText: '',
  subTitle: '',
  title: '',
})

const emit = defineEmits<{ submit: [values: RegisterFormValues] }>()

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const { meta: passwordMeta } = usePasswordStrength()

const { registerSchema } = useAuthValidation()

const { handleSubmit, isSubmitting } = useForm<RegisterFormValues>({
  validationSchema: registerSchema,
  initialValues: {
    username: '', email: '', password: '',
    confirmPassword: '', agree: false,
  },
})

const { value: username, errorMessage: usernameError } = useField<string>('username')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')
const { value: agree, errorMessage: agreeError } = useField<boolean>('agree')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const strength = computed(() => passwordMeta(password.value || ''))
const errorMessage = computed(() => (auth.errorCode ? t(`errors.${auth.errorCode}`) : ''))

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
        {{ title || `${t('register.title')} 🚀` }}
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || t('register.subtitle') }}
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

    <form
      novalidate
      class="space-y-5"
      @submit="onSubmit"
    >
      <ElFormItem
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('register.username')"
        :error="usernameError"
      >
        <ElInput
          v-model="username"
          :placeholder="t('register.usernamePlaceholder')"
          autocomplete="username"
        >
          <template #prefix>
            <AppIcon
              name="user"
              class="size-4 text-dimmed"
            />
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('register.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          :placeholder="t('register.emailPlaceholder')"
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
        :label="t('register.password')"
        :error="passwordError"
      >
        <ElInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('register.passwordPlaceholder')"
          autocomplete="new-password"
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

      <!-- 密码强度指示器 -->
      <div
        v-if="password"
        class="-mt-1.5 space-y-1.5"
      >
        <div class="flex gap-1.5">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1 flex-1 overflow-hidden rounded-full bg-slate-200/80 transition-colors duration-300 dark:bg-white/10"
            :class="i <= strength.score ? strength.bar : ''"
          />
        </div>
        <p
          class="flex items-center gap-1 text-xs"
          :class="strength.text"
        >
          <AppIcon
            name="odometer"
            class="size-3"
          />
          {{ t('register.strength') }}：{{ strength.label }}
        </p>
      </div>

      <ElFormItem
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('register.confirmPassword')"
        :error="confirmPasswordError"
      >
        <ElInput
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          :placeholder="t('register.confirmPasswordPlaceholder')"
          autocomplete="new-password"
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
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <AppIcon
                :name="showConfirmPassword ? 'hide' : 'view'"
                class="size-4"
              />
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem :error="agreeError">
        <ElCheckbox v-model="agree">
          <template #label>
            <span class="text-sm text-muted-foreground">
              {{ t('register.agreePrefix') }}
              <a
                href="#"
                class="font-medium text-primary hover:underline"
                @click.prevent
              >
                {{ t('register.terms') }}
              </a>
            </span>
          </template>
        </ElCheckbox>
      </ElFormItem>

      <ElButton
        type="primary"
        class="w-full"
        native-type="submit"
        :loading="isSubmitting || loading"
      >
        {{ submitButtonText || t('register.submit') }}
      </ElButton>
    </form>

    <p class="mt-4 text-center text-sm text-muted-foreground">
      {{ t('common.backToLogin') }}
      <span
        class="vben-link text-sm font-normal"
        @click="goToLogin()"
      >
        {{ t('login.title') }}
      </span>
    </p>
  </div>
</template>
