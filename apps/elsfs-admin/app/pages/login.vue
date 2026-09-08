<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const { loginSchema } = useAuthValidation()

const { handleSubmit, isSubmitting, resetForm } = useForm<LoginFormValues>({
  validationSchema: loginSchema,
  initialValues: { email: '', password: '', remember: false },
})

const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: remember } = useField<boolean>('remember')

const showPassword = ref(false)
const errorMessage = computed(() => (auth.errorCode ? t(`errors.${auth.errorCode}`) : ''))

const socialProviders = [
  { key: 'github', icon: 'i-lucide-github', labelKey: 'social.github' },
  { key: 'google', icon: 'i-lucide-chrome', labelKey: 'social.google' },
  { key: 'wechat', icon: 'i-lucide-message-circle', labelKey: 'social.wechat' },
]
const socialLoading = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
  catch {
    // 错误码已写入 store，由 errorMessage 展示
  }
})

function handleReset() {
  resetForm()
  auth.reset()
}

async function handleSocial(provider: string) {
  socialLoading.value = provider
  try {
    await auth.socialLogin(provider)
    await router.push('/')
  }
  catch {
    // 错误码已写入 store
  }
  finally {
    socialLoading.value = null
  }
}
</script>

<template>
  <div>
    <header class="mb-8 text-center">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ t('login.title') }}
      </h1>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {{ t('login.subtitle') }}
      </p>
    </header>

    <ElAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
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
        :label="t('login.email')"
        :error="emailError"
      >
        <ElInput
          v-model="email"
          type="email"
          :placeholder="t('login.emailPlaceholder')"
          autocomplete="email"
        >
          <template #leading>
            <ElIcon
              name="i-lucide-mail"
              class="size-4 text-dimmed"
            />
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem
        orientation="horizontal"
        :ui="{ container: 'flex-1' }"
        :label="t('login.password')"
        :error="passwordError"
      >
        <ElInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('login.passwordPlaceholder')"
          autocomplete="current-password"
        >
          <template #leading>
            <ElIcon
              name="i-lucide-lock"
              class="size-4 text-dimmed"
            />
          </template>
          <template #trailing>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <ElIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="size-4"
              />
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <div class="flex items-center justify-between">
        <ElCheckbox
          v-model="remember"
          :label="t('login.rememberMe')"
        />
      </div>

      <ElButton
        type="primary"
        block
        :loading="isSubmitting"
        :label="isSubmitting ? t('login.submitLoading') : t('login.submit')"
      />

      <div class="text-center">
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          @click="handleReset"
        >
          <ElIcon
            name="i-lucide-rotate-ccw"
            class="size-3"
          />
          {{ t('common.reset') }}
        </button>
      </div>
    </form>

    <div class="my-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
      <span class="text-xs font-medium text-slate-400">{{ t('common.orContinueWith') }}</span>
      <div class="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
    </div>

    <div class="grid grid-cols-3 gap-3">
      <ElButton
        v-for="provider in socialProviders"
        :key="provider.key"
        variant="outline"
        class="py-2.5"
        :loading="socialLoading === provider.key"
        :aria-label="t(provider.labelKey)"
        @click="handleSocial(provider.key)"
      >
        <template #leading>
          <ElIcon
            :name="provider.icon"
            class="size-4"
          />
        </template>
      </ElButton>
    </div>

    <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('common.goRegister') }}
      <NuxtLink
        to="/register"
        class="font-medium text-primary-500 transition-colors hover:text-primary-600 hover:underline"
      >
        {{ t('register.title') }}
      </NuxtLink>
    </p>
  </div>
</template>
