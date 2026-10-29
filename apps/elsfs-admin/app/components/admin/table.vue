<script setup lang="ts">
import type { StyleValue } from 'vue'

/**
 * 表格（`ElTable` 的薄封装）。
 *
 * - 默认开启 `border` / `stripe` / `scrollbar-always-on`，并挂上 `ele-table` 类名；
 * - `loading` 直接驱动 `v-loading`（不用在页面里再写指令）；
 * - 默认占满父容器剩余高度（`fill`）：表数据超出时在表格内部滚动，表头固定；
 *   父容器需要是 flex 布局（列表页里是 `flex-1` 的卡片 `<section>`）；
 *   有分页时把 `AdminPagination` 放在组件后面，它自然贴在底部；
 * - 其余 props / 事件 / 透传属性全部交给 `ElTable`，列仍然用 `ElTableColumn`
 *   直接写在默认插槽里，`append` / `empty` 插槽也会转发给 `ElTable`。
 *
 * 用法：
 * ```vue
 * <AdminContainerCard class="h-full">
 *   <AdminSearchForm ... />
 *   <section class="flex min-h-0 flex-1 flex-col p-4">
 *     <AdminTable :loading="loading" :data="rows" row-key="id">
 *       <ElTableColumn prop="name" label="名称" />
 *     </AdminTable>
 *     <div class="mt-3 flex shrink-0 justify-end">
 *       <AdminPagination v-model:page="current" v-model:rows="size" :total="total" />
 *     </div>
 *   </section>
 * </AdminContainerCard>
 * ```
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** 加载中（内部套 `v-loading`） */
    loading?: boolean
    /** 是否占满父容器剩余高度（表体内部滚动、表头固定），默认 true */
    fill?: boolean
    /** 表格高度；`fill` 时用默认的 100% 即可，固定在页面里的表格可传具体数值 */
    height?: string | number
    /** 是否显示纵向边框，默认 true */
    border?: boolean
    /** 是否斑马纹，默认 true */
    stripe?: boolean
    /** 横向滚动条常显，默认 true */
    scrollbarAlwaysOn?: boolean
    /** 表头单元格类名，默认 `ele-table-header` */
    headerCellClassName?: string
    /** 高亮行背景色（配合保留的 `activeRowBgColor` 使用） */
    activeRowBgColor?: string
  }>(),
  {
    loading: false,
    fill: true,
    height: '100%',
    border: true,
    stripe: true,
    scrollbarAlwaysOn: true,
    headerCellClassName: 'ele-table-header',
    activeRowBgColor: '#E3F2FD',
  },
)

const attrs = useAttrs()

/** class / style 落到外层布局容器（负责占满高度），其余属性透传给 ElTable */
const wrapperClass = computed(() => [
  'admin-table',
  props.fill ? 'flex min-h-0 min-w-0 flex-1 flex-col' : '',
  attrs.class,
])

const tableAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="wrapperClass" :style="attrs.style as StyleValue">
    <ElTable
      v-loading="props.loading"
      v-bind="tableAttrs"
      :height="props.height"
      :border="props.border"
      :stripe="props.stripe"
      :scrollbar-always-on="props.scrollbarAlwaysOn"
      :header-cell-class-name="props.headerCellClassName"
      class="ele-table w-full"
    >
      <slot />
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </ElTable>
  </div>
</template>

<style scoped>
/* 表头与每一行数据保持同一高度（默认 35px），行内内容垂直居中；
 * 单元格上下 padding 归零，否则表头 35px 而含 ElSwitch/按钮的数据行会被撑到 48px 左右。 */
.admin-table {
  --admin-table-row-height: 35px;
}

/* 表头文字加粗 */
.admin-table :deep(.el-table__header-wrapper th.el-table__cell) {
  font-weight: 700;
  /* 表头常态背景色 */
  background-color: #f0f5ff;   /* 极浅蓝，清爽 */
  color: #1f2d3d;              /* 深蓝灰，与浅蓝底协调 */
}
/**
选中表头的单元格 th
选中表体数据行的单元格 td
 */
.admin-table :deep(.el-table__header-wrapper th.el-table__cell),
.admin-table :deep(.el-table__body-wrapper .el-table__row > td.el-table__cell) {
  height: var(--admin-table-row-height);
  padding-top: 0;
  padding-bottom: 0;
}

.admin-table :deep(.el-table__body-wrapper .el-table__row) {
  height: var(--admin-table-row-height);
}
</style>
