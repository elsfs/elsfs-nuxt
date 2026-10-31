<script setup lang="ts">
import { computed } from 'vue'

/**
 *
 * 对 `ElPagination` 的薄封装：
 * - `v-model:page` / `v-model:rows` 双向绑定页码与每页条数（对应原组件的 `update:page` / `update:rows`）；
 * - 页码或每页条数变化时统一 `emit('change', { page, rows })`，页面只需监听一个事件即可重新查询；
 * - `small` 切换紧凑布局（隐藏跳页说明与页数选择），小型列表/弹窗里用；
 * - 其余属性（如 `hide-on-single-page`）通过 `$attrs` 透传给 `ElPagination`。
 *
 * 用法：
 * ```vue
 * <ElePagination
 *   v-model:page="current"
 *   v-model:rows="size"
 *   :total="total"
 *   :page-sizes="[10, 20, 50, 100]"
 *   @change="handlePaginationChange"
 * />
 * ```
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** 当前页码 */
    page: number
    /** 每页条数 */
    rows: number
    /** 总条数 */
    total: number
    /** 小型紧凑分页 */
    small?: boolean
    /** 每页条数选项 */
    pageSizes?: number[]
    /** 分页布局；不传时按 `small` 自动推导 */
    layout?: string
  }>(),
  {
    small: false,
    pageSizes: () => [10, 20, 30, 40, 50],
    layout: '',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
  'update:rows': [rows: number]
  change: [payload: { page: number; rows: number }]
}>()

const page = computed({
  get: () => props.page,
  set: (value: number) => emit('update:page', value),
})

const rows = computed({
  get: () => props.rows,
  set: (value: number) => emit('update:rows', value),
})

const resolvedLayout = computed<string>(() => {
  if (props.layout) {
    return props.layout
  }
  return props.small ? 'prev, jumper, pager, next' : 'total, sizes, prev, pager, next, jumper'
})

/** 页码 / 每页条数变化后统一对外抛一个 change，页面只监听它重新查询 */
function handlePagination(payload: { page: number; rows: number }): void {
  emit('change', payload)
}

function handleSizeChange(value: number): void {
  handlePagination({ page: props.page, rows: value })
}

function handleCurrentChange(value: number): void {
  handlePagination({ page: value, rows: props.rows })
}
</script>

<template>
  <ElPagination
    v-model:current-page="page"
    v-model:page-size="rows"
    :background="!small"
    :layout="resolvedLayout"
    :page-sizes="pageSizes"
    :total="total"
    :size="small ? 'small' : 'default'"
    :class="small ? 'pagination--small' : ''"
    v-bind="$attrs"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<style scoped>
.pagination--small {
  --el-pagination-font-size-small: 14px;
}

/* 小型分页：隐藏跳页说明与每页条数选择 */
.pagination--small :deep(.el-pagination__goto),
.pagination--small :deep(.el-pagination__classifier),
.pagination--small :deep(.el-pager > li:not(:last-child)) {
  display: none;
}

/* 跳页输入框后补「/ 总页数」，省掉「前往」文案 */
.pagination--small :deep(.el-pagination__jump) {
  position: relative;
  margin-right: 2px;
  margin-left: 12px;
  padding-right: 20px;
}

.pagination--small :deep(.el-pagination__jump::after) {
  position: absolute;
  top: 50%;
  right: 0;
  content: '/';
  transform: translateY(-50%);
}

.pagination--small :deep(.el-pagination__editor.el-input--small) {
  width: 48px;
  font-size: var(--el-pagination-font-size-small);
}

.pagination--small :deep(.btn-prev .el-icon),
.pagination--small :deep(.btn-next .el-icon) {
  font-size: var(--el-pagination-font-size-small);
}
</style>
