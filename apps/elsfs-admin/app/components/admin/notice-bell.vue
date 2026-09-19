<script setup lang="ts">
/**
 * 顶栏消息铃铛（参考 onehip-frontend 的 navbar message）。
 * 未读数取 mock 数据长度，点条目暂未接详情页。
 */
interface AppNotice {
  id: string
  title: string
  brief: string
  time: string
}

/** mock 数据：真实项目换成接口 */
const NOTICES: Record<'notice' | 'announcement', AppNotice[]> = {
  notice: [
    {
      id: 'notice-1',
      title: '系统维护通知',
      brief: '本周六 22:00 - 24:00 进行数据库升级，期间系统暂停服务。',
      time: '2026-09-10 09:30',
    },
    {
      id: 'notice-2',
      title: '权限变更提醒',
      brief: '你负责的「订单中心」新增了「退款审核」权限，请知悉。',
      time: '2026-09-09 17:12',
    },
    {
      id: 'notice-3',
      title: '待办工单提醒',
      brief: '有 12 条售后工单超过 24 小时未处理，请尽快跟进。',
      time: '2026-09-09 08:05',
    },
  ],
  announcement: [
    {
      id: 'announcement-1',
      title: 'V2.3.0 版本发布',
      brief: '新增顶部多页签、收藏夹拖拽排序、全部菜单检索与暗色主题。',
      time: '2026-09-08 10:00',
    },
  ],
}

const TABS = [
  { value: 'notice', label: '通知' },
  { value: 'announcement', label: '公告' },
] as const

const activeType = ref<'notice' | 'announcement'>('notice')
const list = computed(() => NOTICES[activeType.value])
const unread = computed(() => NOTICES.notice.length)
</script>

<template>
  <ElPopover :width="360" trigger="hover" placement="bottom-end">
    <template #reference>
      <ElBadge :value="unread" :hidden="unread === 0" class="block">
        <button
          type="button"
          class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
          aria-label="通知"
        >
          <AppIcon name="bell" class="size-4" />
        </button>
      </ElBadge>
    </template>

    <div class="flex flex-col">
      <!-- 通知 / 公告 -->
      <div class="border-border flex items-center gap-1 border-b px-1 pb-2">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          type="button"
          class="rounded-md px-2 py-1 text-sm transition-colors"
          :class="
            activeType === tab.value
              ? 'bg-accent text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="max-h-80 overflow-y-auto py-1">
        <div
          v-for="item in list"
          :key="item.id"
          class="hover:bg-accent cursor-pointer rounded-lg px-2 py-2 transition-colors"
        >
          <p class="text-foreground truncate text-sm font-medium">
            {{ item.title }}
          </p>
          <p class="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
            {{ item.brief }}
          </p>
          <p class="text-muted-foreground/80 mt-1 text-[11px]">
            发布时间：{{ item.time }}
          </p>
        </div>

        <div
          v-if="!list.length"
          class="text-muted-foreground flex flex-col items-center gap-2 py-10 text-xs"
        >
          <AppIcon name="bell" class="size-6 opacity-40" />
          暂无相关数据
        </div>
      </div>
    </div>
  </ElPopover>
</template>
