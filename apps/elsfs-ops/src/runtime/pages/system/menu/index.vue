<script setup lang="ts">
import type { SysMenu, SysMenuForm } from 'api-types/elsfs'
import { deleteMenusApi, editMenuApi, fetchMenuTreeApi } from 'api-types/elsfs'
import type { SearchFormField } from 'elsfs-components/types/search-form'

import { toErrorMessage } from '~/utils/api-error'
import { menuTypeText } from '~/utils/system-options'

import MenuForm from './-menu-form.vue'

/**
 * 系统管理 - 菜单管理（列表页）。
 *
 * 树形表格展示完整菜单树 + 本地过滤 + 删除 + 状态切换。
 * 新增 / 编辑用弹窗表单（`-menu-form.vue`），行内「新增子菜单」通过 `parentId` prop 预填上级菜单。
 * 后端 `editState` 接口对菜单不支持，所以状态切换走「整条记录 edit」。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 菜单树 ---------- */

const loading = ref(false)
const query = reactive({ keyword: '' })
const menuTree = shallowRef<SysMenu[]>([])

/** 顶部搜索字段：菜单名称（本地过滤，不请求后端） */
const SEARCH_FIELDS: SearchFormField[] = [
  { type: 'input', label: '菜单名称', prop: 'keyword', width: '224px' },
]

/** 重置查询条件：清空关键词即可，本地过滤会即时生效 */
function handleReset(): void {
  query.keyword = ''
}

/**
 * 本地过滤菜单树。
 *
 * - 命中节点保留整棵子树（父级命中时子级无需再逐个匹配）；
 * - 自身未命中但有子级命中的，保留该节点及过滤后的命中子级（即祖先链）；
 * - 自身与整棵子树都未命中的直接丢弃。
 */
function filterTree(nodes: SysMenu[], searchText: string): SysMenu[] {
  if (!searchText) {
    return nodes
  }
  const lowerSearch = searchText.toLowerCase()
  const result: SysMenu[] = []
  for (const node of nodes) {
    if (node.menuName.toLowerCase().includes(lowerSearch)) {
      result.push(node)
      continue
    }
    const children = node.children?.length ? filterTree(node.children, searchText) : []
    if (children.length) {
      result.push({ ...node, children })
    }
  }
  return result
}

const filteredMenus = computed(() => filterTree(menuTree.value, query.keyword.trim()))

async function load(): Promise<void> {
  loading.value = true
  try {
    menuTree.value = await fetchMenuTreeApi(api)
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '菜单加载失败'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

/* ---------- 新增 / 编辑弹窗 ---------- */

const formVisible = ref(false)
const editingId = ref<string>()
const editingParentId = ref<string>()

/** 新增根菜单：清空编辑态与上级菜单 */
function openCreate(): void {
  editingId.value = undefined
  editingParentId.value = undefined
  formVisible.value = true
}

/** 行内新增子菜单：把当前行 menuId 作为 parentId 预填上级菜单 */
function openCreateChild(row: SysMenu): void {
  editingParentId.value = row.menuId
  editingId.value = undefined
  formVisible.value = true
}

function openEdit(row: SysMenu): void {
  editingId.value = row.menuId
  editingParentId.value = undefined
  formVisible.value = true
}

/** 弹窗保存成功：刷新菜单树 */
function handleSaved(): void {
  void load()
}

/* ---------- 状态 / 删除 ---------- */

async function toggleStatus(row: SysMenu, enabled: boolean): Promise<void> {
  const status = enabled ? '0' : '1'
  // 树节点自带 children，提交时不能带上去，否则后端会把整棵子树写回本条记录
  const { children: _children, ...rest } = row
  try {
    await editMenuApi(api, { ...rest, status } as SysMenuForm)
    row.status = status
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysMenu): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除菜单「${row.menuName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteMenusApi(api, [row.menuId])
    ElMessage.success('删除成功')
    await load()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}
</script>

<template>
  <EleContainerCard class="h-full">
    <EleSearchForm
      :fields="SEARCH_FIELDS"
      :form="query"
      :loading="loading"
      @search="load"
      @reset="handleReset"
    >
      <template #button>
        <ElButton type="primary" @click="openCreate">
          <AppIcon name="lucide--plus" class="mr-1 size-4" />
          新增菜单
        </ElButton>
      </template>
    </EleSearchForm>

    <!-- 菜单树 -->
    <section class="border-border bg-card flex min-h-0 flex-1 flex-col rounded-xl border p-4">
      <EleTable
        :loading="loading"
        :data="filteredMenus"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        empty-text="暂无菜单数据"
      >
        <ElTableColumn prop="menuName" label="菜单名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="inline-flex items-center">
              <AppIcon :name="row.icon ?? 'menu'" fallback="menu" class="mr-1 size-4" />
              <span>{{ row.menuName }}</span>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="routePath" label="路由地址" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="component" label="组件路径" min-width="170" show-overflow-tooltip />
        <ElTableColumn label="类型" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="row.type === '0' ? 'info' : 'success'" size="small">
              {{ menuTypeText(row.type) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="orderNo" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === '0'"
              @change="
                (value: string | number | boolean) => toggleStatus(row as SysMenu, Boolean(value))
              "
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openCreateChild(row as SysMenu)">
              新增子菜单
            </ElButton>
            <ElButton link type="primary" size="small" @click="openEdit(row as SysMenu)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysMenu)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </EleTable>
    </section>
    <MenuForm
      v-model:visible="formVisible"
      :menu-id="editingId"
      :parent-id="editingParentId"
      @success="handleSaved"
    />
  </EleContainerCard>
</template>
