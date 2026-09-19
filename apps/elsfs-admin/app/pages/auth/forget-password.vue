<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

import AuthTitle from './-auth-title.vue'
import type { ForgetPasswordFormValues } from './useAuthValidation.ts'
import { loginPath } from './useAuthValidation.ts'

defineOptions({ name: 'AuthForgetPassword' })

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const router = useRouter()

/** ElForm 实例，用于触发校验与重置 */
const ruleFormRef = ref<FormInstance>()

/** 忘记密码表单数据模型 */
const ruleForm = reactive<ForgetPasswordFormValues>({
  email: '',
})

/**
 * 基于 async-validator（Element Plus 表单校验引擎）的校验规则。
 */
const rules = computed<FormRules<ForgetPasswordFormValues>>(() => ({
  email: [
    { required: true, message: '此项为必填项', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
}))

const submitting = ref(false)

const errorMessage = computed(() => authErrorMessage(auth.errorCode))

/** 提交：先跑 async-validator 校验，通过后再发送重置邮件 */
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
    await auth.forgetPassword(ruleForm.email)
    ElMessage.success('邮件已发送')
  } catch {
    // 错误码已写入 store，由组件内 Alert 展示
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
      重置密码 🤦🏻‍♂️
      <template #desc>
        输入注册邮箱，我们将发送重置链接
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

      <ElButton
        type="primary"
        class="auth-submit w-full"
        native-type="submit"
        :loading="submitting || auth.status === 'loading'"
      >
        发送重置链接
      </ElButton>
    </ElForm>

    <ElButton type="default" plain class="mt-4 w-full" @click="goToLogin()">
      返回
    </ElButton>
  </div>
</template>
