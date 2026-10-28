/**
 * 系统管理页面共用的下拉选项与状态文案。
 *
 * 后端状态统一是字符串：`0` 正常、`1` 停用；性别 `1` 男、`2` 女、`0` 未知；
 * 菜单类型 `0` 目录、`1` 菜单（后端没有按钮类型）。
 */

export interface SysOption {
  label: string
  value: string
}

/** 状态：正常 / 停用 */
export const STATUS_OPTIONS: SysOption[] = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
]

/** 性别选项 */
export const SEX_OPTIONS: SysOption[] = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
  { label: '未知', value: '0' },
]

/** 菜单类型选项 */
export const MENU_TYPE_OPTIONS: SysOption[] = [
  { label: '目录', value: '0' },
  { label: '菜单', value: '1' },
]

/** 状态文案：除 `1` 外都按正常处理（兼容 null / 空串） */
export function statusText(status?: string | null): string {
  return status === '1' ? '停用' : '正常'
}

/** ElTag 的类型：停用红色、正常绿色 */
export function statusTagType(status?: string | null): 'success' | 'danger' {
  return status === '1' ? 'danger' : 'success'
}

/** 性别文案 */
export function sexText(sex?: string | null): string {
  const option = SEX_OPTIONS.find((item) => item.value === sex)
  return option?.label ?? '未知'
}

/** 菜单类型文案 */
export function menuTypeText(type?: string | null): string {
  return type === '0' ? '目录' : '菜单'
}

/** 把树形数据拍平成下拉选项（idKey / nameKey 指定取哪个字段） */
export function flattenTreeOptions<T extends Record<string, unknown>>(
  list: T[],
  idKey: keyof T,
  nameKey: keyof T,
  excludeId?: string,
): { label: string; value: string; disabled?: boolean }[] {
  const options: { label: string; value: string; disabled?: boolean }[] = []
  const walk = (nodes: T[]): void => {
    for (const node of nodes) {
      const id = String(node[idKey] ?? '')
      if (id) {
        options.push({
          label: String(node[nameKey] ?? ''),
          value: id,
          disabled: id === excludeId,
        })
      }
      const children = node.children
      if (Array.isArray(children) && children.length) {
        walk(children as T[])
      }
    }
  }
  walk(list)
  return options
}
