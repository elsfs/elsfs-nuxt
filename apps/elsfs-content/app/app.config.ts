export default defineAppConfig({
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
