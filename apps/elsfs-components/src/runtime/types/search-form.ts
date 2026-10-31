/**
 * 顶部搜索表单的字段配置。
 *
 * 页面只声明「字段是什么」，由 `EleSearchForm` 统一渲染控件、label 宽度与查询/重置按钮，
 * 保证各列表页的搜索区样式和交互一致。
 */

/** select 选项，与 `ElOption` 对齐 */
export interface SearchFormOption {
  label: string
  value: string | number | boolean
}

/** 支持的搜索控件类型 */
export type SearchFormFieldType = 'input' | 'select' | 'tree-select'

/** 搜索字段配置 */
export interface SearchFormField {
  /** 控件类型 */
  type: SearchFormFieldType
  /** 标签文案；同时参与 label 宽度自动计算 */
  label: string
  /** 绑定到查询对象上的字段名（如 `roleName`） */
  prop: string
  /** 占位文案：input 默认「请输入{label}」，select / tree-select 默认「全部」 */
  placeholder?: string
  /** 是否可清空，默认 true */
  clearable?: boolean
  /** 控件宽度，默认 `160px` */
  width?: string
  /** select 的选项 */
  option?: SearchFormOption[]
  /** tree-select 的树数据 */
  data?: object[]
  /** tree-select 的字段映射，默认「下拉选项」形态由页面传入 */
  props?: Record<string, string>
  /** tree-select 的节点 key，默认 `value` */
  nodeKey?: string
  /** tree-select 是否可搜索 */
  filterable?: boolean
  /** tree-select 是否展开后再渲染子节点，默认 false */
  renderAfterExpand?: boolean
}
