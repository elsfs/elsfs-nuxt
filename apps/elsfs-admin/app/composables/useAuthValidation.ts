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
      .min(1, { message: t('validation.required') })
      .refine((val, ctx) => {
        const password = (ctx.parent as { password: string }).password
        return val === password
      }, { message: t('validation.confirmMismatch') }),
    agree: z.boolean()
      .refine(val => val === true, { message: t('validation.termsRequired') }),
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
  }
}
