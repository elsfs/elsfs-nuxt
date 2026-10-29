<script setup lang="ts">
import type { SysMenu, SysMenuForm } from 'api-types/elsfs'
import { deleteMenusApi, editMenuApi, fetchMenuTreeApi } from 'api-types/elsfs'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 菜单管理（列表页）。
 *
 * 树形表格展示完整菜单树 + 本地过滤 + 删除 + 状态切换。
 * 新增 / 编辑拆到独立页面：`/system/menu/create`、`/system/menu/edit/:id`；
 * 行内「新增子菜单」通过 `?parentId=<menuId>` 预填上级菜单。
 * 后端 `editState` 接口对菜单不支持，所以状态切换走「整条记录 edit」。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 菜单树 ---------- */

const loading = ref(false)
const keyword = ref('')
const menuTree = shallowRef<SysMenu[]>([])

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

const filteredMenus = computed(() => filterTree(menuTree.value, keyword.value.trim()))

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

/* ---------- 跳转新增 / 编辑 ---------- */

/** 新增根菜单 */
function goCreate(): void {
  void navigateTo('/system/menu/create')
}

/** 行内新增子菜单：把父级 menuId 带过去预填 */
function goCreateChild(row: SysMenu): void {
  void navigateTo({ path: '/system/menu/create', query: { parentId: row.menuId } })
}

function goEdit(row: SysMenu): void {
  void navigateTo(`/system/menu/edit/${row.menuId}`)
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
  <AdminContainerCard>
    <!-- 查询条件（本地过滤） -->
    <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent>
      <ElFormItem label="菜单名称" class="mb-0">
        <div class="w-56">
          <ElInput v-model="keyword" placeholder="请输入菜单名称" clearable>
            <template #prefix>
              <AppIcon name="lucide--search" class="size-4" />
            </template>
          </ElInput>
        </div>
      </ElFormItem>
      <ElFormItem class="mb-0">
        <ElButton @click="keyword = ''"> 重置 </ElButton>
        <ElButton :loading="loading" @click="load"> 刷新 </ElButton>
      </ElFormItem>
    </ElForm>
    <div class="flex justify-start">
      <ElButton type="primary" @click="goCreate">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增菜单
      </ElButton>
    </div>

    <!-- 菜单树 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable
        v-loading="loading"
        :data="filteredMenus"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
        empty-text="暂无菜单数据"
        class="w-full"
      >
        <ElTableColumn prop="menuName" label="菜单名称" min-width="220">
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
            <ElButton link type="primary" size="small" @click="goCreateChild(row as SysMenu)">
              新增子菜单
            </ElButton>
            <ElButton link type="primary" size="small" @click="goEdit(row as SysMenu)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysMenu)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>
  </AdminContainerCard>
</template>
