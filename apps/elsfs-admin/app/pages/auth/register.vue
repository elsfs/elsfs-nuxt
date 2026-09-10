<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

import type { RegisterFormValues } from './useAuthValidation.ts'
import { useAuthValidation } from './useAuthValidation.ts'
import AuthTitle from './-auth-title.vue'

definePageMeta({ layout: 'auth', middleware: 'guest' })

defineOptions({ name: 'AuthRegister' })

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
const loading = computed(() => auth.status === 'loading')

const onSubmit = handleSubmit(async (values) => {
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
    // 错误码已写入 store，由 Alert 展示
  }
})

function goToLogin(): void {
  router.push('/auth/login')
}
</script>

<template>
  <div>
    <AuthTitle>
      {{ t('register.title') }} 🚀
      <template #desc>
        {{ t('register.subtitle') }}
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
        :label="t('register.username')"
        :error="usernameError"
      >
        <ElInput
          v-model="username"
          size="large"
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
        :label="t('register.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          size="large"
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
        :label="t('register.password')"
        :error="passwordError"
      >
        <ElInput
          v-model="password"
          size="large"
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
        class="-mt-2 mb-4 space-y-1.5"
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
        :label="t('register.confirmPassword')"
        :error="confirmPasswordError"
      >
        <ElInput
          v-model="confirmPassword"
          size="large"
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
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || loading"
      >
        {{ t('register.submit') }}
      </ElButton>
    </ElForm>

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
