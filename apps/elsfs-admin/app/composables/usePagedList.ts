import type { SysPageQuery, SysPageResult } from 'api-types/elsfs'

import { toErrorMessage } from '~/utils/api-error'

export interface UsePagedListOptions<T, Q extends object> {
  /** 查询表单的初始值（「重置」时也用它还原） */
  createQuery: () => Q
  /** 后端分页接口：`current` / `size` 由 composable 统一追加 */
  fetcher: (params: Q & SysPageQuery) => Promise<SysPageResult<T>>
}

/**
 * 列表页通用的「查询表单 + 分页 + 加载状态」状态机。
 *
 * 用法：
 * ```ts
 * const { query, rows, loading, total, current, size, load, search, reset, handlePageChange, handleSizeChange } =
 *   usePagedList<SysRole, SysRolePageQuery>({
 *     createQuery: () => ({ roleName: '', roleCode: '', status: '' }),
 *     fetcher: (params) => fetchRolePageApi(api, params),
 *   })
 * onMounted(() => void load())
 * ```
 * 查询条件里空串 / null / undefined 会被自动剔除，避免后端把空串当成有效过滤条件。
 */
export function usePagedList<T, Q extends object>({
  createQuery,
  fetcher,
}: UsePagedListOptions<T, Q>) {
  const query = reactive(createQuery()) as unknown as Q
  const rows = shallowRef<T[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

  function buildParams(): Q & SysPageQuery {
    const params: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value
      }
    }
    return { ...params, current: current.value, size: size.value } as Q & SysPageQuery
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      const page = await fetcher(buildParams())
      rows.value = page.records ?? []
      total.value = page.total ?? 0
      if (typeof page.current === 'number') {
        current.value = page.current
      }
      if (typeof page.size === 'number') {
        size.value = page.size
      }
    } catch (error) {
      ElMessage.error(toErrorMessage(error, '列表加载失败'))
    } finally {
      loading.value = false
    }
  }

  /** 查询：回到第一页 */
  function search(): Promise<void> {
    current.value = 1
    return load()
  }

  /** 重置查询条件：还原初始值并回到第一页 */
  function reset(): Promise<void> {
    Object.assign(query as Record<string, unknown>, createQuery())
    current.value = 1
    return load()
  }

  function handlePageChange(page: number): void {
    current.value = page
    void load()
  }

  function handleSizeChange(value: number): void {
    size.value = value
    current.value = 1
    void load()
  }

  return {
    query,
    rows,
    total,
    current,
    size,
    loading,
    load,
    search,
    reset,
    handlePageChange,
    handleSizeChange,
  }
}
