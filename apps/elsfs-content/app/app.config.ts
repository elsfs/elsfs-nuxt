export default defineAppConfig({
  // 单语言文档站的界面语言：docus 会据此加载自带的 i18n 语言包，
  // 同时通过 @nuxt/ui 的 locale 设置 <html lang> 与组件内置文案。
  docus: {
    locale: 'zh-CN',
  },
  socials: {
    discord: 'https://discord.gg/sBXDm6e8SP',
    bluesky: 'https://go.nuxt.com/bluesky',
    x: 'https://x.com/nuxtstudio',
  },
  ui: {
    colors: {
      primary: 'green',
      secondary: 'sky',
      neutral: 'slate',
    },
    pageSection: {
      slots: {
        title: 'font-semibold lg:text-4xl',
        featureLeadingIcon: 'text-(--ui-text-highlighted)',
      },
    },
    prose: {
      // @nuxt/ui 的 CodeIcon 按代码块文件名的扩展名找图标，找不到就回退成
      // `i-vscode-icons-file-type-<ext>`；而 vscode-icons 集合里没有 csv / jsonc，
      // 这里映射到存在的等价图标，否则图标会加载失败。
      codeIcon: {
        csv: 'i-vscode-icons-file-type-excel',
        jsonc: 'i-vscode-icons-file-type-json2',
        // 中文文件名标签对应的图标映射（CodeIcon 会拿文件名/扩展名去这张表里查）
        '终端': 'i-lucide-terminal',
      },
      codePreview: {
        slots: {
          preview: 'rounded-t-none border-(--ui-border-muted) bg-(--ui-bg-muted)',
        },
      },
    },
  },
  github: {
    rootDir: 'docs',
  },
})
