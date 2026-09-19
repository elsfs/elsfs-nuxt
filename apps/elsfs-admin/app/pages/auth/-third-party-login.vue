<script setup lang="ts">
interface ProviderItem {
  key: string
  label: string
  icon: string
}

defineOptions({ name: 'AuthThirdPartyLogin' })

const emit = defineEmits<{ submit: [provider: string] }>()

const providers: ProviderItem[] = [
  { key: 'github', label: 'GitHub', icon: 'connection' },
  { key: 'google', label: 'Google', icon: 'chrome-filled' },
  { key: 'wechat', label: '微信', icon: 'chat-dot-round' },
  { key: 'qq', label: 'QQ', icon: 'message' },
  { key: 'dingding', label: '钉钉', icon: 'chat-dot-square' },
]

function onSelect(provider: ProviderItem): void {
  emit('submit', provider.key)
}
</script>

<template>
  <div>
    <!-- 分隔线 -->
    <div class="mt-5 flex items-center justify-between gap-4">
      <span class="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      <span class="text-muted-foreground shrink-0 text-xs uppercase">
        第三方登录
      </span>
      <span class="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    </div>

    <!-- 图标按钮 -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
      <ElTooltip
        v-for="provider in providers"
        :key="provider.key"
        :content="provider.label"
        placement="top"
      >
        <ElButton circle plain :aria-label="provider.label" @click="onSelect(provider)">
          <AppIcon :name="provider.icon" class="size-5" />
        </ElButton>
      </ElTooltip>
    </div>
  </div>
</template>
