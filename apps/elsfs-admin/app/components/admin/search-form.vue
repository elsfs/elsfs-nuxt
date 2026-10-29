<script setup lang="ts">
import type { FormInstance } from 'element-plus'

import type { SearchFormField } from '~/types/search-form'

/**
 *
 * - 字段由 `fields` 配置驱动（input / select / tree-select），页面只声明字段，不写控件模板；
 * - label 宽度按最长标签自动计算（`labelWidth` 可覆盖），保证多行时各列对齐；
 * - 查询 / 重置按钮固定在字段行末尾，「新增」等操作按钮通过 `#button` 插槽放在下一行；
 * - `#suffix` 插槽可追加按钮（例如刷新）。
 *
 * 用法：
 * ```ts
 * const SEARCH_FIELDS: SearchFormField[] = [
 *   { type: 'input', label: '角色名称', prop: 'roleName' },
 *   { type: 'select', label: '状态', prop: 'status', option: STATUS_OPTIONS },
 * ]
 * ```
 * ```vue
 * <AdminSearchForm :fields="SEARCH_FIELDS" :form="query" :loading="loading" @search="search" @reset="reset">
 *   <template #button>
 *     <ElButton type="primary">新增角色</ElButton>
 *   </template>
 * </AdminSearchForm>
 * ```
 */
const props = withDefaults(
  defineProps<{
    /** 搜索字段配置 */
    fields: SearchFormField[]
    /** 查询条件对象（页面传入 reactive 对象，组件内直接读写，不复制） */
    form: object
    /** 查询中状态：查询按钮 loading，按钮禁用 */
    loading?: boolean
    /** 是否显示查询按钮 */
    showSearch?: boolean
    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 查询按钮文案 */
    searchText?: string
    /** 按钮对齐方式 */
    operateAlign?: 'start' | 'end'
    /** 手动指定 label 宽度（数字按 px 处理）；不传时按最长 label 自动计算 */
    labelWidth?: string | number
  }>(),
  {
    loading: false,
    showSearch: true,
    showReset: true,
    searchText: '查询',
    operateAlign: 'start',
    labelWidth: '',
  },
)

const emit = defineEmits<{
  search: []
  reset: []
}>()

const formRef = ref<FormInstance>()

/** 页面传入的查询对象：按字段名直接读写，保证组件与页面状态同步 */
const model = computed<Record<string, string>>(() => props.form as Record<string, string>)

/** label 宽度：参考 xjSearchForm 按最长标签的字符数计算（中文约 14px/字），最少 54px */
const resolvedLabelWidth = computed<string>(() => {
  if (props.labelWidth !== '') {
    return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
  }
  const maxLength = props.fields.reduce((max, field) => Math.max(max, field.label.length), 0)
  return `${Math.max(maxLength * 14 + 12, 54)}px`
})

function fieldValue(field: SearchFormField): string {
  return model.value[field.prop] ?? ''
}

function setFieldValue(field: SearchFormField, value: unknown): void {
  model.value[field.prop] = (value ?? '') as string
}

function fieldStyle(field: SearchFormField): { width: string } {
  return { width: field.width ?? '160px' }
}

function handleSearch(): void {
  emit('search')
}

function handleReset(): void {
  emit('reset')
}
</script>

<template>
  <div class="search-form mb-3 shrink-0">
    <ElForm
      ref="formRef"
      inline
      :model="model"
      :label-width="resolvedLabelWidth"
      class="flex flex-wrap items-center gap-x-3 gap-y-2"
      @submit.prevent
    >
      <ElFormItem v-for="field in fields" :key="field.prop" :label="field.label" :prop="field.prop">
        <ElInput
          v-if="field.type === 'input'"
          :model-value="fieldValue(field)"
          :placeholder="field.placeholder ?? `请输入${field.label}`"
          :clearable="field.clearable ?? true"
          :style="fieldStyle(field)"
          @update:model-value="(value: string) => setFieldValue(field, value)"
          @keyup.enter="handleSearch"
        />
        <ElSelect
          v-else-if="field.type === 'select'"
          :model-value="fieldValue(field)"
          :placeholder="field.placeholder ?? '全部'"
          :clearable="field.clearable ?? true"
          :style="fieldStyle(field)"
          @update:model-value="(value: unknown) => setFieldValue(field, value)"
        >
          <ElOption
            v-for="option in field.option ?? []"
            :key="String(option.value)"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
        <ElTreeSelect
          v-else-if="field.type === 'tree-select'"
          :model-value="fieldValue(field)"
          :data="field.data ?? []"
          :props="field.props"
          :node-key="field.nodeKey ?? 'value'"
          :placeholder="field.placeholder ?? '全部'"
          :clearable="field.clearable ?? true"
          :filterable="field.filterable"
          :render-after-expand="field.renderAfterExpand ?? false"
          :style="fieldStyle(field)"
          @update:model-value="(value: unknown) => setFieldValue(field, value)"
        />
      </ElFormItem>

      <ElFormItem>
        <div
          class="flex w-full flex-wrap items-center gap-2"
          :class="operateAlign === 'end' ? 'justify-end' : 'justify-start'"
        >
          <ElButton
            v-if="showSearch"
            type="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleSearch"
          >
            <AppIcon name="lucide--search" class="mr-1 size-4" />
            {{ searchText }}
          </ElButton>
          <ElButton v-if="showReset" :disabled="loading" @click="handleReset">
            <AppIcon name="lucide--rotate-ccw" class="mr-1 size-4" />
            重置
          </ElButton>
          <slot name="suffix" />
        </div>
      </ElFormItem>
    </ElForm>

    <!-- 操作按钮行：新增 / 批量操作等，与查询区同属一张卡片 -->
    <div v-if="$slots.button" class="mt-3 flex flex-wrap items-center gap-2">
      <slot name="button" />
    </div>
  </div>
</template>

<style scoped>
/* 搜索表单用 flex + gap 排版，清掉 Element Plus inline 表单默认的右/下外边距 */
.search-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

.search-form :deep(.el-form-item__label) {
  padding-right: 8px;
}
</style>
