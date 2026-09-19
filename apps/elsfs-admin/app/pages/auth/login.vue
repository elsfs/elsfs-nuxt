<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

import AuthTitle from './-auth-title.vue'
import AuthThirdPartyLogin from './-third-party-login.vue'
import type { LoginFormValues } from './useAuthValidation.ts'
import {loginPath} from './useAuthValidation.ts'
interface Props {
  /** 是否处于提交加载状态 */
  loading?: boolean
  showRememberMe?: boolean
  showForgetPassword?: boolean
  showCodeLogin?: boolean
  showQrcodeLogin?: boolean
  showThirdPartyLogin?: boolean
  showRegister?: boolean
}

defineOptions({ name: 'AuthLogin' })
definePageMeta({ layout: 'auth',
  middleware: 'guest',
  alias: [loginPath.login]
})
withDefaults(defineProps<Props>(), {
  loading: false,
  showRememberMe: true,
  showForgetPassword: true,
  showCodeLogin: true,
  showQrcodeLogin: true,
  showThirdPartyLogin: true,
  showRegister: true,
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

/** ElForm 实例，用于触发校验与重置 */
const ruleFormRef = ref<FormInstance>()

/** 登录表单数据模型 */
const ruleForm = reactive<LoginFormValues>({
  username: 'admin',
  password: 'Elsfs.2023',
  remember: false,
})

/**
 * 基于 async-validator（Element Plus 表单校验引擎）的校验规则。
 */
const rules = computed<FormRules<LoginFormValues>>(() => ({
  username: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { min: 3, message: '用户名至少需要 3 个字符', trigger: 'blur' },
    { max: 20, message: '用户名不能超过 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' },
  ],
}))

const showPassword = ref(false)

const errorMessages = computed(() => authErrorMessage(auth.errorCode))
const isSubmitting = computed(() => auth.status === 'loading')

/** 提交：先跑 async-validator 校验，通过后再登录 */
async function onSubmit(): Promise<void> {
  const formEl = ruleFormRef.value
  if (!formEl) return
  try {
    await formEl.validate()
  } catch {
    // 校验未通过，错误信息由 ElFormItem 内联展示
    return
  }
  // 记住账号（仅浏览器环境）
  if (ruleForm.remember) {
    localStorage.setItem('elsfs_remember_username', ruleForm.username)
  } else {
    localStorage.removeItem('elsfs_remember_username')
  }
  try {
    await auth.login(ruleForm)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}

async function handleSocial(provider: string): Promise<void> {
  try {
    await auth.socialLogin(provider)
    await router.push('/')
  } catch {
    // 错误码已写入 store，由组件内 Alert 展示
  }
}

</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        欢迎回来 👋🏻
      </slot>
      <template #desc>
        <slot name="subTitle">
          登录你的账号以继续
        </slot>
      </template>
    </AuthTitle>

    <ElAlert v-if="errorMessages" type="error" show-icon class="mb-6" :title="errorMessages" />

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
          type="text"
          size="large"
          placeholder="请输入用户名"
          autocomplete="username"
        >
          <template #prefix>
            <AppIcon name="user" class="text-dimmed size-4" />
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="密码" prop="password">
        <ElInput
          v-model="ruleForm.password"
          size="large"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入你的密码"
          autocomplete="current-password"
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

      <!-- 记住我 / 忘记密码 -->
      <div class="flex items-center justify-between">
        <ElCheckbox v-if="showRememberMe" v-model="ruleForm.remember">
          记住我
        </ElCheckbox>
        <span
          v-if="showForgetPassword"
          class="vben-link text-sm font-normal"
          @click="router.push(loginPath.forgetPasswordPath)"
        >
          忘记密码？
        </span>
      </div>

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="isSubmitting || loading"
      >
        登录
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
        @click="router.push(loginPath.codeLoginPath)"
      >
        <AppIcon name="key" class="mr-1 size-4" />
        手机验证码登录
      </ElButton>
      <ElButton
        v-if="showQrcodeLogin"
        class="flex-1"
        type="default"
        plain
        @click="router.push(loginPath.qrcodeLoginPath)"
      >
        <AppIcon name="monitor" class="mr-1 size-4" />
        扫码登录
      </ElButton>
    </div>

    <!-- 第三方登录 -->
    <slot name="third-party-login">
      <AuthThirdPartyLogin v-if="showThirdPartyLogin" @submit="handleSocial" />
    </slot>

    <!-- 注册引导 -->
    <slot name="to-register">
      <div v-if="showRegister" class="text-muted-foreground mt-4 text-center text-sm">
        还没有账号？
        <span class="vben-link text-sm font-normal" @click="router.push(loginPath.register)">
          立即注册
        </span>
      </div>
    </slot>
  </div>
</template>
