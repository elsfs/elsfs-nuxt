import { z } from 'zod'

export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export interface RegisterFormValues {
  username: string
  email: string
  password: string
  confirmPassword: string
  agree: boolean
}

/** 手机号 / 邮箱 + 验证码登录 */
export interface CodeLoginFormValues {
  email: string
  code: string
}

/** 忘记密码（发送重置邮件） */
export interface ForgetPasswordFormValues {
  email: string
}

/** i18n 翻译函数（vue-i18n 的 t 的简化签名） */
type Translate = (key: string, params?: Record<string, unknown>) => string

/**
 * 登录表单校验 Schema（yup）。
 * 校验消息使用函数形式，在「校验发生时」才调用 t()，因此语言切换后消息即时生效。
 */
export function createLoginSchema(t: Translate) {
  return z.object({
    email: z.string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.emailInvalid') }),
    password: z.string()
      .min(1, { message: t('validation.required') })
      .min(8, { message: t('validation.passwordMin', { min: 8 }) }),
    remember: z.boolean(),
  })
}

/**
 * 注册表单校验 Schema（yup）。
 */

export function createRegisterSchema(t: Translate) {
  return z.object({
    username: z.string()
      .min(1, { message: t('validation.required') })
      .min(3, { message: t('validation.usernameMin', { min: 3 }) })
      .max(20, { message: t('validation.usernameMax', { max: 20 }) }),
    email: z.string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.emailInvalid') }),
    password: z.string()
      .min(1, { message: t('validation.required') })
      .min(8, { message: t('validation.passwordMin', { min: 8 }) })
      .regex(/^(?=.*[A-Z])(?=.*\d)/, { message: t('validation.passwordPattern') }),
    confirmPassword: z.string()
      .min(1, { message: t('validation.required') }),
    agree: z.boolean()
      .refine(val => val === true, { message: t('validation.termsRequired') }),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: t('validation.confirmMismatch'),
      })
    }
  })
}

/**
 * 返回绑定当前 i18n 实例的 vee-validate 类型化 Schema。
 */
export function useAuthValidation() {
  const { t } = useI18n()
  const translate: Translate = (key, params) => (params ? t(key, params) : t(key))

  return {
    loginSchema: createLoginSchema(translate),
    registerSchema: createRegisterSchema(translate),
    codeLoginSchema: createCodeLoginSchema(translate),
    forgetPasswordSchema: createForgetPasswordSchema(translate),
  }
}

/**
 * 验证码登录 Schema。
 * - code 仅为演示用 6 位数字；实际项目应通过后端发送并在服务端校验。
 */
export function createCodeLoginSchema(t: Translate) {
  return z.object({
    email: z.string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.emailInvalid') }),
    code: z.string()
      .min(1, { message: t('validation.required') })
      .regex(/^\d{6}$/, { message: t('validation.codeInvalid') }),
  })
}

/**
 * 忘记密码（发送重置邮件）Schema。
 */
export function createForgetPasswordSchema(t: Translate) {
  return z.object({
    email: z.string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.emailInvalid') }),
  })
}
