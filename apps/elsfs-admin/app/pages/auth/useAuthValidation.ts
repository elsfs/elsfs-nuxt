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
  register: '/auth/register',
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



