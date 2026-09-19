import { z } from 'zod'
export interface LoginFormValues {
  username: string
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

export const loginPath = {
  login: '/login',
  register: '/register',
  codeLoginPath: '/auth/code-login',
  qrcodeLoginPath: '/auth/qrcode-login',
  registerPath: '/auth/register',
  forgetPasswordPath: '/auth/forget-password',

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

/**
 * 登录表单校验 Schema
 */
export function createLoginSchema() {
  return z.object({
    username: z.string().min(1, { message: '此项为必填项' }),
    password: z
      .string()
      .min(1, { message: '此项为必填项' })
      .min(8, { message: '密码至少需要 8 个字符' }),
    remember: z.boolean(),
  })
}

/**
 * 注册表单校验 Schema
 */

export function createRegisterSchema() {
  return z
    .object({
      username: z
        .string()
        .min(1, { message: '此项为必填项' })
        .min(3, { message: '用户名至少需要 3 个字符' })
        .max(20, { message: '用户名不能超过 20 个字符' }),
      email: z
        .string()
        .min(1, { message: '此项为必填项' })
        .email({ message: '请输入有效的邮箱地址' }),
      password: z
        .string()
        .min(1, { message: '此项为必填项' })
        .min(8, { message: '密码至少需要 8 个字符' })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
          message: '密码需包含大写字母、小写字母和数字',
        }),
      confirmPassword: z.string().min(1, { message: '此项为必填项' }),
      agree: z.boolean().refine((val) => val === true, { message: '请先同意服务条款与隐私政策' }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: '两次输入的密码不一致',
        })
      }
    })
}

/**
 * 返回 vee-validate 类型化 Schema。
 */
export function useAuthValidation() {
  return {
    loginSchema: createLoginSchema(),
    registerSchema: createRegisterSchema(),
    codeLoginSchema: createCodeLoginSchema(),
    forgetPasswordSchema: createForgetPasswordSchema(),
  }
}

/**
 * 验证码登录 Schema。
 * - code 仅为演示用 6 位数字；实际项目应通过后端发送并在服务端校验。
 */
export function createCodeLoginSchema() {
  return z.object({
    email: z
      .string()
      .min(1, { message: '此项为必填项' })
      .email({ message: '请输入有效的邮箱地址' }),
    code: z
      .string()
      .min(1, { message: '此项为必填项' })
      .regex(/^\d{6}$/, { message: '请输入 6 位数字验证码' }),
  })
}

/**
 * 忘记密码（发送重置邮件）Schema。
 */
export function createForgetPasswordSchema() {
  return z.object({
    email: z
      .string()
      .min(1, { message: '此项为必填项' })
      .email({ message: '请输入有效的邮箱地址' }),
  })
}
