<template>
  <!-- 显式传中文 label：@nuxt/ui 的默认文案取自 UApp 的 locale，
       而 docus 用的是 zh-CN 键名、@nuxt/ui 语言表用的是 zh_cn，匹配不上会回退成英文 -->
  <UContentSearchButton
    :collapsed="false"
    label="搜索文档..."
    class="mb-8 w-full"
  />
</template>
