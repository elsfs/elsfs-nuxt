<script setup lang="ts">
import type { SysDept } from 'api-types/elsfs'
import { deleteDeptsApi, editDeptApi, fetchDeptTreeApi } from 'api-types/elsfs'

import type { SearchFormField } from '~/types/search-form'
import { toErrorMessage } from '~/utils/api-error'

import DeptForm from './-dept-form.vue'

/**
 * 系统管理 - 部门管理（列表页）。
 *
 * 树形表格（数据来自 `/dept/tree`）+ 删除 + 状态切换 + 本地名称过滤。
 * 查询条件里只有部门名称，且是**前端本地过滤**，不会请求后端。
 * 新增 / 编辑用弹窗表单（`-dept-form.vue`），行内「新增子部门」通过 `parentId` prop 预填上级部门。
 * 后端 `editState` 对部门不支持，所以状态切换走「整条记录 edit」。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 树形数据 ---------- */

const deptTree = ref<SysDept[]>([])
const loading = ref(false)

/* ---------- 查询条件（前端本地过滤，不请求后端） ---------- */

const query = reactive({ keyword: '' })

const SEARCH_FIELDS: SearchFormField[] = [
  { type: 'input', label: '部门名称', prop: 'keyword', width: '208px' },
]

async function loadTree(): Promise<void> {
  loading.value = true
  try {
    deptTree.value = await fetchDeptTreeApi(api)
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '部门树加载失败'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTree()
})

/**
 * 本地过滤：命中节点保留整棵子树；自身未命中但有命中子级时，只保留命中的子级。
 * 关键词去掉首尾空白后为空则原样返回。
 */
function filterTree(nodes: SysDept[], searchKey: string, isRoot = true): SysDept[] {
  const key = isRoot ? searchKey.trim() : searchKey
  if (!key) {
    return nodes
  }
  const result: SysDept[] = []
  for (const node of nodes) {
    const children = node.children?.length ? filterTree(node.children, key, false) : []
    if (node.deptName.includes(key)) {
      result.push(node)
    } else if (children.length) {
      result.push({ ...node, children })
    }
  }
  return result
}

const tableData = computed(() => filterTree(deptTree.value, query.keyword))

/** 重置查询条件：本地过滤即时生效，清空关键词即可（查询按钮 = 重新拉部门树） */
function handleReset(): void {
  query.keyword = ''
}

/* ---------- 弹窗新增 / 编辑 ---------- */

const formVisible = ref(false)
const editingId = ref<string>()
const editingParentId = ref<string>()

/** 新增部门：不传上级，表单里默认顶级部门 */
function openCreate(): void {
  editingId.value = undefined
  editingParentId.value = undefined
  formVisible.value = true
}

/** 行内新增子部门：把当前行 deptId 作为上级部门预填 */
function openCreateChild(row: SysDept): void {
  editingId.value = undefined
  editingParentId.value = row.deptId
  formVisible.value = true
}

function openEdit(row: SysDept): void {
  editingId.value = row.deptId
  editingParentId.value = undefined
  formVisible.value = true
}

function handleSaved(): void {
  void loadTree()
}

/* ---------- 状态 / 删除 ---------- */

async function toggleStatus(row: SysDept, enabled: boolean): Promise<void> {
  const status = enabled ? '0' : '1'
  // 整条更新要剥离 children，否则后端会把整棵子树当成部门字段解析
  const { children: _children, ...rest } = row
  try {
    await editDeptApi(api, { ...rest, status })
    row.status = status
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysDept): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除部门「${row.deptName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteDeptsApi(api, [row.deptId])
    ElMessage.success('删除成功')
    await loadTree()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}
</script>

<template>
  <AdminContainerCard class="h-full">
    <AdminSearchForm
      :fields="SEARCH_FIELDS"
      :form="query"
      :loading="loading"
      @search="loadTree"
      @reset="handleReset"
    >
      <template #button>
        <ElButton type="primary" @click="openCreate">
          <AppIcon name="lucide--plus" class="mr-1 size-4" />
          新增部门
        </ElButton>
      </template>
    </AdminSearchForm>
    <!-- 树形列表 -->
    <section class="border-border bg-card flex min-h-0 flex-1 flex-col rounded-xl border p-4">
      <AdminTable
        :key="query.keyword"
        :loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
      >
        <ElTableColumn prop="deptName" label="部门名称" min-width="220" />
        <ElTableColumn prop="orgCode" label="机构编码" min-width="140" />
        <ElTableColumn prop="orderNo" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === '0'"
              @change="
                (value: string | number | boolean) => toggleStatus(row as SysDept, Boolean(value))
              "
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createAt" label="创建时间" width="170" />
        <ElTableColumn label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openCreateChild(row as SysDept)">
              新增子部门
            </ElButton>
            <ElButton link type="primary" size="small" @click="openEdit(row as SysDept)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysDept)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </AdminTable>
      <p
        v-if="!loading && !tableData.length"
        class="text-muted-foreground mt-3 shrink-0 text-center text-sm"
      >
        暂无部门数据
      </p>
    </section>

    <DeptForm
      v-model:visible="formVisible"
      :dept-id="editingId"
      :parent-id="editingParentId"
      @success="handleSaved"
    />
  </AdminContainerCard>
</template>
