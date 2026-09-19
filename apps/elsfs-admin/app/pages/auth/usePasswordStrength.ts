/**
 * 密码强度评估。
 * 评分规则（0-4）：
 * - 长度 >= 8  +1
 * - 同时包含大小写字母 +1
 * - 包含数字 +1
 * - 包含特殊字符 +1
 */
function calculateScore(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Z0-9]/i.test(password)) score++
  return score
}

export function usePasswordStrength() {
  const LEVELS = {
    0: { label: '太弱', bar: 'bg-red-500', text: 'text-red-500' },
    1: { label: '弱', bar: 'bg-red-500', text: 'text-red-500' },
    2: { label: '中等', bar: 'bg-yellow-500', text: 'text-yellow-500' },
    3: { label: '强', bar: 'bg-green-500', text: 'text-green-500' },
    4: { label: '非常强', bar: 'bg-emerald-500', text: 'text-emerald-500' },
  } as const

  /** 返回某个密码对应的强度元信息（颜色、文案），供进度条渲染 */
  function meta(password: string) {
    const score = calculateScore(password)
    const level = LEVELS[score as keyof typeof LEVELS]
    return {
      score,
      label: password ? level.label : '',
      bar: level.bar,
      text: level.text,
    }
  }

  return { calculateScore, meta }
}
