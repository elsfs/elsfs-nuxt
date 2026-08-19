<script setup lang="ts">
import { useField, useForm } from 'vee-validate'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const { meta: passwordMeta } = usePasswordStrength()

const { registerSchema } = useAuthValidation()

const { handleSubmit, isSubmitting, resetForm } = useForm<RegisterFormValues>({
  validationSchema: registerSchema,
  initialValues: { username: '', email: '', password: '', confirmPassword: '', agree: false },
})

const { value: username, errorMessage: usernameError } = useField<string>('username')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')
const { value: agree, errorMessage: agreeError } = useField<boolean>('agree')

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

const strength = computed(() => passwordMeta(password.value || ''))
const errorMessage = computed(() => (auth.errorCode ? t(`errors.${auth.errorCode}`) : ''))

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.register({
      username: values.username,
      email: values.email,
      password: values.password,
    })
    successMessage.value = t('register.success')
    await router.push('/')
  }
  catch {
    // 错误码已写入 store，由 errorMessage 展示
  }
})

function handleReset() {
  resetForm()
  auth.reset()
  successMessage.value = ''
}
</script>

<template>
  <div>
    <header class="mb-8 text-center">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ t('register.title') }}
      </h1>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {{ t('register.subtitle') }}
      </p>
    </header>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      class="mb-6"
      :title="errorMessage"
    />

    <UAlert
      v-if="successMessage"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      class="mb-6"
      :title="successMessage"
    />

    <form
      novalidate
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        :label="t('register.username')"
        :error="usernameError"
      >
        <UInput
          v-model="username"
          size="lg"
          :placeholder="t('register.usernamePlaceholder')"
          autocomplete="username"
        >
          <template #leading>
            <UIcon
              name="i-lucide-user"
              class="size-4"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        :label="t('register.email')"
        :error="emailError"
      >
        <UInput
          v-model="email"
          type="email"
          size="lg"
          :placeholder="t('register.emailPlaceholder')"
          autocomplete="email"
        >
          <template #leading>
            <UIcon
              name="i-lucide-mail"
              class="size-4"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        :label="t('register.password')"
        :error="passwordError"
      >
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          size="lg"
          :placeholder="t('register.passwordPlaceholder')"
          autocomplete="new-password"
        >
          <template #leading>
            <UIcon
              name="i-lucide-lock"
              class="size-4"
            />
          </template>
          <template #trailing>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="size-4"
              />
            </button>
          </template>
        </UInput>
      </UFormField>

      <!-- 密码强度指示器 -->
      <div
        v-if="password"
        class="-mt-2 space-y-1.5"
      >
        <div class="flex gap-1.5">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300 dark:bg-white/10"
            :class="i <= strength.score ? strength.bar : ''"
          />
        </div>
        <p
          class="text-xs"
          :class="strength.text"
        >
          {{ t('register.strength') }}：{{ strength.label }}
        </p>
      </div>

      <UFormField
        :label="t('register.confirmPassword')"
        :error="confirmPasswordError"
      >
        <UInput
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          size="lg"
          :placeholder="t('register.confirmPasswordPlaceholder')"
          autocomplete="new-password"
        >
          <template #leading>
            <UIcon
              name="i-lucide-lock-keyhole"
              class="size-4"
            />
          </template>
          <template #trailing>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <UIcon
                :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="size-4"
              />
            </button>
          </template>
        </UInput>
      </UFormField>

      <UFormField :error="agreeError">
        <UCheckbox v-model="agree">
          <template #label>
            <span class="text-sm text-slate-600 dark:text-slate-300">
              {{ t('register.agreePrefix') }}
              <a
                href="#"
                class="font-medium text-primary-500 hover:underline"
                @click.prevent
              >
                {{ t('register.terms') }}
              </a>
            </span>
          </template>
        </UCheckbox>
      </UFormField>

      <UButton
        type="submit"
        size="lg"
        class="w-full justify-center"
        :loading="isSubmitting"
      >
        <template #label>
          {{ isSubmitting ? t('register.submitLoading') : t('register.submit') }}
        </template>
      </UButton>

      <div class="text-center">
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          @click="handleReset"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="size-3"
          />
          {{ t('common.reset') }}
        </button>
      </div>
    </form>

    <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('common.backToLogin') }}
      <NuxtLink
        to="/login"
        class="font-medium text-primary-500 transition-colors hover:text-primary-600 hover:underline"
      >
        {{ t('login.title') }}
      </NuxtLink>
    </p>
  </div>
</template>
