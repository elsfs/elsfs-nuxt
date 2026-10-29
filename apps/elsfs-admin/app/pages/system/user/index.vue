<script setup lang="ts">
import type { SysDept, SysUser, SysUserPageQuery } from 'api-types/elsfs'
import {
  changeUserPasswordApi,
  deleteUsersApi,
  editUserStateApi,
  fetchDeptTreeApi,
  fetchUserPageApi,
} from 'api-types/elsfs'

import type { SearchFormField } from '~/types/search-form'
import { toErrorMessage } from '~/utils/api-error'

import UserForm from './-user-form.vue'

/**
 * 系统管理 - 账号管理（列表页）。
 *
 * 分页查询 + 状态切换 + 删除 + 重置密码（行内弹窗，不属于编辑表单）。
 * 新增 / 编辑用弹窗表单（`./-user-form.vue`），保存成功后刷新列表。
 * 用户接口支持 `editState`，状态切换走批量改状态接口。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 列表 ---------- */

const { query, rows, loading, total, current, size, load, search, reset } = usePagedList<
  SysUser,
  SysUserPageQuery
>({
  createQuery: () => ({ username: '', nickname: '', phone: '', deptId: '', status: '' }),
  fetcher: (params) => fetchUserPageApi(api, params),
})

/* ---------- 部门树筛选 ---------- */

/** 部门树映射后的节点：ElTreeSelect 只需要 value / label / children */
interface DeptTreeOption {
  value: string
  label: string
  children?: DeptTreeOption[]
}

function toDeptTreeOptions(list: SysDept[]): DeptTreeOption[] {
  return list.map((dept) => {
    const node: DeptTreeOption = { value: dept.deptId, label: dept.deptName }
    if (dept.children?.length) {
      node.children = toDeptTreeOptions(dept.children)
    }
    return node
  })
}

const deptTree = shallowRef<DeptTreeOption[]>([])

async function loadDeptOptions(): Promise<void> {
  try {
    deptTree.value = toDeptTreeOptions(await fetchDeptTreeApi(api))
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '部门树加载失败'))
  }
}

onMounted(() => {
  void load()
  // 筛选树加载失败只提示，不影响主列表
  void loadDeptOptions()
})

/* ---------- 分页 ---------- */

/** 页码 / 每页条数已由 v-model 同步到 current / size，这里只需重新查询 */
function handlePaginationChange(): void {
  void load()
}

/* ---------- 查询字段 ---------- */

/** 部门树是 shallowRef，必须在 computed 里取 `.value` 后传入组件 */
const SEARCH_FIELDS = computed<SearchFormField[]>(() => [
  { type: 'input', label: '用户名', prop: 'username' },
  { type: 'input', label: '昵称', prop: 'nickname' },
  { type: 'input', label: '手机号', prop: 'phone' },
  {
    type: 'tree-select',
    label: '部门',
    prop: 'deptId',
    data: deptTree.value,
    props: { label: 'label', children: 'children' },
    nodeKey: 'value',
    filterable: true,
    placeholder: '全部',
  },
  { type: 'select', label: '状态', prop: 'status', option: STATUS_OPTIONS, placeholder: '全部' },
])

/* ---------- 新增 / 编辑弹窗 ---------- */

const formVisible = ref(false)
const editingId = ref<string>()

function openCreate(): void {
  editingId.value = undefined
  formVisible.value = true
}

function openEdit(row: SysUser): void {
  editingId.value = row.userId
  formVisible.value = true
}

function handleSaved(): void {
  void load()
}

/* ---------- 状态 / 重置密码 / 删除 ---------- */

async function toggleStatus(row: SysUser, enabled: boolean): Promise<void> {
  try {
    await editUserStateApi(api, {
      ids: [row.userId],
      status: enabled ? 0 : 1,
      column: 'status',
    })
    row.status = enabled ? '0' : '1'
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleResetPassword(row: SysUser): Promise<void> {
  let password: string
  try {
    const result = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      inputType: 'password',
      inputPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      inputErrorMessage: '至少 8 位，且包含大写字母、小写字母、数字和特殊字符',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    password = result.value
  } catch {
    return
  }
  try {
    await changeUserPasswordApi(api, { username: row.username, password })
    ElMessage.success('密码重置成功')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysUser): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除账号「${row.username}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteUsersApi(api, [row.userId])
    ElMessage.success('删除成功')
    await load()
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
      @search="search"
      @reset="reset"
    >
      <template #button>
        <ElButton type="primary" @click="openCreate">
          <AppIcon name="lucide--plus" class="mr-1 size-4" />
          新增账号
        </ElButton>
      </template>
    </AdminSearchForm>
    <!-- 列表 -->
    <section class="border-border bg-card flex min-h-0 flex-1 flex-col rounded-xl border p-4">
      <AdminTable :loading="loading" :data="rows" row-key="userId">
        <ElTableColumn prop="username" label="用户名" min-width="120" show-overflow-tooltip  />
        <ElTableColumn prop="nickname" label="昵称" min-width="110" show-overflow-tooltip />
        <ElTableColumn prop="phone" label="手机号" width="130" />
        <ElTableColumn prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="性别" width="70" align="center">
          <template #default="{ row }">
            {{ sexText((row as SysUser).sex) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="(row as SysUser).status === '0'"
              @change="
                (value: string | number | boolean) => toggleStatus(row as SysUser, Boolean(value))
              "
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createAt" label="创建时间" width="170" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row as SysUser)">
              编辑
            </ElButton>
            <ElButton link type="primary" size="small" @click="handleResetPassword(row as SysUser)">
              重置密码
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysUser)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </AdminTable>

      <div class="mt-3 flex shrink-0 justify-end">
        <AdminPagination
          v-model:page="current"
          v-model:rows="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @change="handlePaginationChange"
        />
      </div>
    </section>

    <UserForm v-model:visible="formVisible" :user-id="editingId" @success="handleSaved" />
  </AdminContainerCard>
</template>
