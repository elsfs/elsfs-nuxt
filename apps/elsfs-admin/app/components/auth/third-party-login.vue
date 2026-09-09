<script setup lang="ts">
interface ProviderItem {
  key: string
  labelKey: string
  icon: string
}

defineOptions({ name: 'AuthThirdPartyLogin' })

const emit = defineEmits<{ submit: [provider: string] }>()

const { t } = useI18n()

const providers: ProviderItem[] = [
  { key: 'github', labelKey: 'social.github', icon: 'connection' },
  { key: 'google', labelKey: 'social.google', icon: 'chrome-filled' },
  { key: 'wechat', labelKey: 'social.wechat', icon: 'chat-dot-round' },
  { key: 'qq', labelKey: 'social.qq', icon: 'message' },
  { key: 'dingding', labelKey: 'social.dingding', icon: 'chat-dot-square' },
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
      <span class="shrink-0 text-xs uppercase text-muted-foreground">
        {{ t('thirdParty.label') }}
      </span>
      <span class="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    </div>

    <!-- 图标按钮 -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
      <ElTooltip
        v-for="provider in providers"
        :key="provider.key"
        :content="t(provider.labelKey)"
        placement="top"
      >
        <ElButton
          circle
          plain
          :aria-label="t(provider.labelKey)"
          @click="onSelect(provider)"
        >
          <AppIcon
            :name="provider.icon"
            class="size-5"
          />
        </ElButton>
      </ElTooltip>
    </div>
  </div>
</template>
