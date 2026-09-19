<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { onBeforeUnmount } from 'vue'

import AuthTitle from './-auth-title.vue'
import type { CodeLoginFormValues } from './useAuthValidation'
import { loginPath } from './useAuthValidation'

definePageMeta({ layout: 'auth', middleware: 'guest' })

defineOptions({ name: 'AuthCodeLogin' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** ElForm 实例，用于触发校验与重置 */
const ruleFormRef = ref<FormInstance>()

/** 验证码登录表单数据模型 */
const ruleForm = reactive<CodeLoginFormValues>({
  email: '',
  code: '',
})

/**
 * 基于 async-validator（Element Plus 表单校验引擎）的校验规则。
 */
const rules = computed<FormRules<CodeLoginFormValues>>(() => ({
  email: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  code: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入 6 位数字验证码', trigger: 'blur' },
  ],
}))

/** 验证码发送倒计时 */
const countdown = ref(0)
const sendingCode = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const getCodeText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}s 后重新获取`
  }
  return '获取验证码'
})

const canSend = computed(() => countdown.value <= 0 && !sendingCode.value)

const errorMessage = computed(() => authErrorMessage(auth.errorCode))

async function handleSendCode(): Promise<void> {
  if (!canSend.value) return
  // 发送前先跑 async-validator 校验邮箱字段
  const formEl = ruleFormRef.value
  if (!formEl) return
  try {
    await formEl.validateField('email')
  } catch {
    return
  }
  sendingCode.value = true
  try {
    await auth.sendCode({ email: ruleForm.email.trim(), scene: 'login' })
    ElMessage.success('验证码已发送（演示：123456）')
    startCountdown()
  } catch {
    // 错误码已写入 store，由模板内 Alert 展示
  } finally {
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

const submitting = ref(false)

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
  submitting.value = true
  try {
    await auth.codeLogin({ ...ruleForm })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    // 错误码已写入 store，由模板内 Alert 展示
  } finally {
    submitting.value = false
  }
}

function goToLogin(): void {
  router.push(loginPath.login)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title"> 欢迎回来 📲 </slot>
      <template #desc>
        <slot name="subTitle">
          输入注册邮箱并获取验证码
        </slot>
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

      <ElFormItem label="验证码" prop="code">
        <ElInput
          v-model="ruleForm.code"
          inputmode="numeric"
          size="large"
          maxlength="6"
          placeholder="请输入 6 位验证码"
          autocomplete="one-time-code"
        >
          <template #prefix>
            <AppIcon name="key" class="text-dimmed size-4" />
          </template>
          <template #suffix>
            <button
              type="button"
              :disabled="!canSend"
              class="text-primary hover:text-primary-hover text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
        :loading="submitting || auth.status === 'loading'"
      >
        登录
      </ElButton>
    </ElForm>

    <ElButton type="default" plain class="mt-4 w-full" @click="goToLogin()">
      返回
    </ElButton>
  </div>
</template>
