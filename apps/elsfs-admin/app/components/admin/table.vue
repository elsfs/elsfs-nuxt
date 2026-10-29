<script setup lang="ts">
/**
 *
 * - 默认开启 `border` / `stripe` / `scrollbar-always-on`，并带上 Table 的类名：
 *   `ele-table`（表格样式见 `assets/css/main.css`）、`ele-table-header`（表头浅蓝底）；
 * - `loading` 直接驱动 `v-loading`（不用在页面里再写指令）；
 * - 其余 props / 事件 / 透传属性全部交给 `ElTable`，列仍然用 `ElTableColumn`
 *   直接写在默认插槽里，`append` / `empty` 插槽也会转发给 `ElTable`。
 *
 * 用法：
 * ```vue
 * <AdminTable :loading="loading" :data="rows" row-key="id">
 *   <ElTableColumn prop="name" label="名称" />
 * </AdminTable>
 * ```
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** 加载中（内部套 `v-loading`） */
    loading?: boolean
    /** 是否显示纵向边框，默认 true */
    border?: boolean
    /** 是否斑马纹，默认 true */
    stripe?: boolean
    /** 横向滚动条常显，默认 true */
    scrollbarAlwaysOn?: boolean
    /** 表头单元格类名，默认 `ele-table-header` */
    headerCellClassName?: string
    activeRowBgColor?: string
  }>(),
  {
    loading: false,
    border: true,
    stripe: true,
    scrollbarAlwaysOn: true,
    headerCellClassName: 'ele-table-header',
    activeRowBgColor: "#E3F2FD",
  },
)
</script>

<template>
  <ElTable
    v-loading="props.loading"
    v-bind="$attrs"
    :border="props.border"
    :stripe="props.stripe"
    :scrollbar-always-on="props.scrollbarAlwaysOn"
    :header-cell-class-name="props.headerCellClassName"
    class="flex-1 overflow-auto"
  >
    <slot />
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </ElTable>
</template>
<style lang="scss" scoped>
.ele-table {

}
</style>
