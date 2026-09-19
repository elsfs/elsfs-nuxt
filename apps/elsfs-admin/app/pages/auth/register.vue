<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

import AuthTitle from './-auth-title.vue'
import type { RegisterFormValues } from './useAuthValidation.ts'
import { loginPath } from './useAuthValidation.ts'
import { usePasswordStrength } from './usePasswordStrength.ts'

definePageMeta({ layout: 'auth', middleware: 'guest' })

defineOptions({ name: 'AuthRegister' })

const auth = useAuthStore()
const router = useRouter()
const { meta: passwordMeta } = usePasswordStrength()

/** ElForm 实例，用于触发校验与重置 */
const ruleFormRef = ref<FormInstance>()

/** 注册表单数据模型 */
const ruleForm = reactive<RegisterFormValues>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
})

/**
 * 基于 async-validator（Element Plus 表单校验引擎）的校验规则。
 */
const rules = computed<FormRules<RegisterFormValues>>(() => ({
  username: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { min: 3, message: '用户名至少需要 3 个字符', trigger: 'blur' },
    { max: 20, message: '用户名不能超过 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      message: '密码需包含大写字母、小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== ruleForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  agree: [
    {
      validator: (_rule, value, callback) => {
        if (value !== true) {
          callback(new Error('请先同意服务条款与隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}))

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const strength = computed(() => passwordMeta(ruleForm.password || ''))
const errorMessage = computed(() => authErrorMessage(auth.errorCode))
const loading = computed(() => auth.status === 'loading')
const submitting = ref(false)

/** 提交：先跑 async-validator 校验，通过后再注册 */
async function onSubmit(): Promise<void> {
  const formEl = ruleFormRef.value
  if (!formEl) return
  try {
    await formEl.validate()
  } catch {
    // 校验未通过，错误信息由 ElFormItem 内联展示
    return
  }
  submitting.value = true
  try {
    await auth.register({
      username: ruleForm.username,
      email: ruleForm.email,
      password: ruleForm.password,
    })
    ElMessage.success('注册成功，正在跳转...')
    await router.push('/')
  } catch {
    // 错误码已写入 store，由 Alert 展示
  } finally {
    submitting.value = false
  }
}

function goToLogin(): void {
  router.push(loginPath.login)
}
</script>

<template>
  <div>
    <AuthTitle>
      创建账号 🚀
      <template #desc>
        注册一个免费账号，开始你的旅程
      </template>
    </AuthTitle>

    <ElAlert v-if="errorMessage" type="error" show-icon class="mb-6" :title="errorMessage" />

    <ElForm
      ref="ruleFormRef"
      label-position="top"
      :model="ruleForm"
      :rules="rules"
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model="ruleForm.username"
          size="large"
          placeholder="请输入用户名"
          autocomplete="username"
        >
          <template #prefix>
            <AppIcon name="user" class="text-dimmed size-4" />
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="邮箱" prop="email">
        <ElInput
          v-model="ruleForm.email"
          type="email"
          size="large"
          placeholder="you@example.com"
          autocomplete="email"
        >
          <template #prefix>
            <AppIcon name="message" class="text-dimmed size-4" />
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="密码" prop="password">
        <ElInput
          v-model="ruleForm.password"
          size="large"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          autocomplete="new-password"
        >
          <template #prefix>
            <AppIcon name="lock" class="text-dimmed size-4" />
          </template>
          <template #suffix>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <AppIcon :name="showPassword ? 'hide' : 'view'" class="size-4" />
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <!-- 密码强度指示器 -->
      <div v-if="ruleForm.password" class="-mt-2 mb-4 space-y-1.5">
        <div class="flex gap-1.5">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1 flex-1 overflow-hidden rounded-full bg-slate-200/80 transition-colors duration-300 dark:bg-white/10"
            :class="i <= strength.score ? strength.bar : ''"
          />
        </div>
        <p class="flex items-center gap-1 text-xs" :class="strength.text">
          <AppIcon name="odometer" class="size-3" />
          密码强度：{{ strength.label }}
        </p>
      </div>

      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="ruleForm.confirmPassword"
          size="large"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入密码"
          autocomplete="new-password"
        >
          <template #prefix>
            <AppIcon name="key" class="text-dimmed size-4" />
          </template>
          <template #suffix>
            <button
              type="button"
              class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <AppIcon :name="showConfirmPassword ? 'hide' : 'view'" class="size-4" />
            </button>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem prop="agree">
        <ElCheckbox v-model="ruleForm.agree">
          <template #label>
            <span class="text-muted-foreground text-sm">
              我已阅读并同意
              <a href="#" class="text-primary font-medium hover:underline" @click.prevent>
                《服务条款》与《隐私政策》
              </a>
            </span>
          </template>
        </ElCheckbox>
      </ElFormItem>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="submitting || loading"
      >
        注 册
      </ElButton>
    </ElForm>

    <p class="text-muted-foreground mt-4 text-center text-sm">
      已有账号？返回登录
      <span class="vben-link text-sm font-normal" @click="goToLogin()">
        欢迎回来
      </span>
    </p>
  </div>
</template>
