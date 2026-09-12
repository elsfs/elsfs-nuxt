export const formatDateByLocale = (d: string | number | Date, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  return new Date(d).toLocaleDateString('zh-CN', options)
}

export const TEMPLATE_BADGES = {
  'free': {
    color: 'secondary' as const,
    label: '免费',
  },
  'nuxt-ui': {
    color: 'primary' as const,
    label: 'Nuxt UI',
  },
}

export const POST_TYPE_LABELS: Record<string, string> = {
  blog: '博客',
  changelog: '更新日志',
}

export const POST_CATEGORY_LABELS: Record<string, string> = {
  release: '发布',
  studio: '工作室',
  content: '内容',
  migration: '迁移',
  docus: 'Docus',
}

export const formatPostType = (type?: string) => (type ? (POST_TYPE_LABELS[type] ?? type) : '')

export const formatCategory = (category?: string) => (category ? (POST_CATEGORY_LABELS[category.toLowerCase()] ?? category) : '')
