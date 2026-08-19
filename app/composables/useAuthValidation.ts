import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'

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
  return yup.object({
    email: yup.string()
      .required(() => t('validation.required'))
      .email(() => t('validation.emailInvalid')),
    password: yup.string()
      .required(() => t('validation.required'))
      .min(8, () => t('validation.passwordMin', { min: 8 })),
    remember: yup.boolean(),
  })
}

/**
 * 注册表单校验 Schema（yup）。
 */
export function createRegisterSchema(t: Translate) {
  return yup.object({
    username: yup.string()
      .required(() => t('validation.required'))
      .min(3, () => t('validation.usernameMin', { min: 3 }))
      .max(20, () => t('validation.usernameMax', { max: 20 })),
    email: yup.string()
      .required(() => t('validation.required'))
      .email(() => t('validation.emailInvalid')),
    password: yup.string()
      .required(() => t('validation.required'))
      .min(8, () => t('validation.passwordMin', { min: 8 }))
      .matches(/^(?=.*[A-Z])(?=.*\d)/i, () => t('validation.passwordPattern')),
    confirmPassword: yup.string()
      .required(() => t('validation.required'))
      .oneOf([yup.ref('password')], () => t('validation.confirmMismatch')),
    agree: yup.boolean()
      .oneOf([true], () => t('validation.termsRequired')),
  })
}

/**
 * 返回绑定当前 i18n 实例的 vee-validate 类型化 Schema。
 */
export function useAuthValidation() {
  const { t } = useI18n()
  const translate: Translate = (key, params) => (params ? t(key, params) : t(key))

  return {
    loginSchema: toTypedSchema(createLoginSchema(translate)),
    registerSchema: toTypedSchema(createRegisterSchema(translate)),
  }
}
