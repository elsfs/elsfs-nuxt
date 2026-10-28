<script setup lang="ts">
import type { SysDept, SysUser, SysUserPageQuery } from 'api-types/elsfs'
import {
  changeUserPasswordApi,
  deleteUsersApi,
  editUserStateApi,
  fetchDeptTreeApi,
  fetchUserPageApi,
} from 'api-types/elsfs'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 账号管理（列表页）。
 *
 * 分页查询 + 状态切换 + 删除 + 重置密码（行内弹窗，不属于编辑表单）。
 * 新增 / 编辑拆到独立页面：`/system/user/create`、`/system/user/edit/:id`，
 * 表单见 `SystemUserForm`。用户接口支持 `editState`，状态切换走批量改状态接口。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 列表 ---------- */

const {
  query,
  rows,
  loading,
  total,
  current,
  size,
  load,
  search,
  reset,
  handlePageChange,
  handleSizeChange,
} = usePagedList<SysUser, SysUserPageQuery>({
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

/* ---------- 跳转新增 / 编辑 ---------- */

function goCreate(): void {
  void navigateTo('/system/user/create')
}

function goEdit(row: SysUser): void {
  void navigateTo(`/system/user/edit/${row.userId}`)
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
  <div class="mx-auto max-w-7xl space-y-4 p-6 sm:p-8">
    <!-- 查询条件 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent="search">
        <ElFormItem label="用户名" class="mb-0">
          <ElInput
            v-model="query.username"
            placeholder="请输入用户名"
            clearable
            class="w-40"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="昵称" class="mb-0">
          <ElInput
            v-model="query.nickname"
            placeholder="请输入昵称"
            clearable
            class="w-40"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="手机号" class="mb-0">
          <ElInput
            v-model="query.phone"
            placeholder="请输入手机号"
            clearable
            class="w-40"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="部门" class="mb-0">
          <div class="w-44">
            <ElTreeSelect
              v-model="query.deptId"
              :data="deptTree"
              :props="{ label: 'label', children: 'children' }"
              node-key="value"
              placeholder="全部"
              clearable
              filterable
              :render-after-expand="false"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="状态" class="mb-0">
          <ElSelect v-model="query.status" placeholder="全部" clearable class="w-32">
            <ElOption
              v-for="option in STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="mb-0">
          <ElButton type="primary" @click="search"> 查询 </ElButton>
          <ElButton @click="reset"> 重置 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>
    <div class="flex justify-start">
      <ElButton type="primary" @click="goCreate">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增账号
      </ElButton>
    </div>
    <!-- 列表 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable v-loading="loading" :data="rows" row-key="userId" stripe class="w-full">
        <ElTableColumn prop="username" label="用户名" min-width="120" />
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
            <ElButton link type="primary" size="small" @click="goEdit(row as SysUser)">
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
      </ElTable>

      <div class="mt-3 flex justify-end">
        <ElPagination
          v-model:current-page="current"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </section>
  </div>
</template>
