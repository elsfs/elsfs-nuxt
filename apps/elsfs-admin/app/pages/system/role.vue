<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { SysMenu, SysRole, SysRolePageQuery } from 'api-types/elsfs'
import {
  addRoleApi,
  deleteRolesApi,
  editRoleApi,
  fetchMenuTreeApi,
  fetchRoleMenuIdsApi,
  fetchRolePageApi,
  saveRoleMenuApi,
} from 'api-types/elsfs'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 角色管理。
 *
 * 分页查询 + 新增 / 编辑 / 删除 + 状态切换 + 菜单授权（树形勾选）。
 * 后端 `editState` 接口对角色不支持，所以状态切换走「整条记录 edit」。
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
} = usePagedList<SysRole, SysRolePageQuery>({
  createQuery: () => ({ roleName: '', roleCode: '', status: '' }),
  fetcher: (params) => fetchRolePageApi(api, params),
})

onMounted(() => {
  void load()
})

/* ---------- 新增 / 编辑弹窗 ---------- */

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface RoleFormModel {
  roleId?: string
  roleName: string
  roleCode: string
  roleDesc: string
  orderNo: number
  status: string
}

function createRoleForm(): RoleFormModel {
  return {
    roleName: '',
    roleCode: '',
    roleDesc: '',
    orderNo: 1,
    status: '0',
  }
}

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editRoleId = ref<string | null>(null)
const form = reactive<RoleFormModel>(createRoleForm())

const rules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

function openCreate(): void {
  editRoleId.value = null
  Object.assign(form, createRoleForm())
  dialogVisible.value = true
}

function openEdit(row: SysRole): void {
  editRoleId.value = row.roleId
  Object.assign(form, createRoleForm(), {
    roleId: row.roleId,
    roleName: row.roleName,
    roleCode: row.roleCode,
    roleDesc: row.roleDesc ?? '',
    orderNo: row.orderNo ?? 1,
    status: row.status ?? '0',
  })
  dialogVisible.value = true
}

async function submitForm(): Promise<void> {
  const formEl = formRef.value
  if (!formEl) {
    return
  }
  try {
    await formEl.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editRoleId.value) {
      await editRoleApi(api, { ...form })
      ElMessage.success('修改成功')
    } else {
      await addRoleApi(api, { ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await load()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  } finally {
    submitting.value = false
  }
}

/* ---------- 状态 / 删除 ---------- */

async function toggleStatus(row: SysRole, enabled: boolean): Promise<void> {
  const status = enabled ? '0' : '1'
  try {
    await editRoleApi(api, { ...row, status })
    row.status = status
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysRole): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.roleName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteRolesApi(api, [row.roleId])
    ElMessage.success('删除成功')
    await load()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

/* ---------- 菜单授权 ---------- */

/** ElTree 暴露出来、这里用到的两个方法 */
interface MenuTreeExpose {
  getCheckedKeys: (leafOnly?: boolean) => (string | number)[]
  getHalfCheckedKeys: () => (string | number)[]
}

const menuDialogVisible = ref(false)
const menuDialogLoading = ref(false)
const menuSaving = ref(false)
const menuDialogRole = ref<SysRole | null>(null)
const menuTree = shallowRef<SysMenu[]>([])
const checkedMenuIds = ref<string[]>([])
const menuTreeRef = ref<MenuTreeExpose>()

async function openMenuDialog(row: SysRole): Promise<void> {
  menuDialogRole.value = row
  checkedMenuIds.value = []
  menuDialogLoading.value = true
  try {
    if (!menuTree.value.length) {
      menuTree.value = await fetchMenuTreeApi(api)
    }
    checkedMenuIds.value = await fetchRoleMenuIdsApi(api, row.roleId)
    menuDialogVisible.value = true
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '菜单加载失败'))
  } finally {
    menuDialogLoading.value = false
  }
}

async function saveMenuAuth(): Promise<void> {
  const role = menuDialogRole.value
  const tree = menuTreeRef.value
  if (!role || !tree) {
    return
  }
  // 父节点是半选状态时也要一起提交，否则父级菜单不会出现在授权结果里
  const menuIds = [...tree.getCheckedKeys(false), ...tree.getHalfCheckedKeys()].map((key) =>
    String(key),
  )
  if (!menuIds.length) {
    ElMessage.warning('请至少勾选一个菜单（后端不支持清空全部授权）')
    return
  }
  menuSaving.value = true
  try {
    await saveRoleMenuApi(api, { roleId: role.roleId, menuIds })
    ElMessage.success('授权成功')
    menuDialogVisible.value = false
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  } finally {
    menuSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-6 sm:p-8">
    <!-- 页头 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold sm:text-2xl">
          角色管理
        </h1>
        <p class="text-muted-foreground mt-1 text-sm">
          维护角色信息，并给角色分配可访问的菜单。
        </p>
      </div>
      <ElButton type="primary" @click="openCreate">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增角色
      </ElButton>
    </div>

    <!-- 查询条件 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent="search">
        <ElFormItem label="角色名称" class="mb-0">
          <ElInput
            v-model="query.roleName"
            placeholder="请输入角色名称"
            clearable
            class="w-44"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="角色编码" class="mb-0">
          <ElInput
            v-model="query.roleCode"
            placeholder="请输入角色编码"
            clearable
            class="w-44"
            @keyup.enter="search"
          />
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
          <ElButton type="primary" @click="search">
            查询
          </ElButton>
          <ElButton @click="reset">
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </section>

    <!-- 列表 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable v-loading="loading" :data="rows" row-key="roleId" stripe class="w-full">
        <ElTableColumn type="index" label="#" width="56" align="center" />
        <ElTableColumn prop="roleName" label="角色名称" min-width="140" />
        <ElTableColumn prop="roleCode" label="角色编码" min-width="140" />
        <ElTableColumn prop="roleDesc" label="角色描述" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="orderNo" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === '0'"
              @change="(value: string | number | boolean) => toggleStatus(row as SysRole, Boolean(value))"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createAt" label="创建时间" width="170" />
        <ElTableColumn label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row as SysRole)">
              编辑
            </ElButton>
            <ElButton link type="primary" size="small" @click="openMenuDialog(row as SysRole)">
              菜单授权
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysRole)">
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

    <!-- 新增 / 编辑 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editRoleId ? '编辑角色' : '新增角色'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
        <ElFormItem label="角色名称" prop="roleName">
          <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色编码" prop="roleCode">
          <ElInput v-model="form.roleCode" placeholder="请输入角色编码" />
        </ElFormItem>
        <ElFormItem label="排序" prop="orderNo">
          <ElInputNumber v-model="form.orderNo" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="角色描述" prop="roleDesc">
          <ElInput v-model="form.roleDesc" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">
          取消
        </ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitForm">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <!-- 菜单授权 -->
    <ElDialog
      v-model="menuDialogVisible"
      :title="`菜单授权 - ${menuDialogRole?.roleName ?? ''}`"
      width="560px"
      destroy-on-close
    >
      <div v-loading="menuDialogLoading" class="max-h-[60vh] overflow-y-auto">
        <ElTree
          ref="menuTreeRef"
          :data="menuTree"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="checkedMenuIds"
          :props="{ label: 'menuName', children: 'children' }"
        />
      </div>
      <template #footer>
        <ElButton @click="menuDialogVisible = false">
          取消
        </ElButton>
        <ElButton type="primary" :loading="menuSaving" @click="saveMenuAuth">
          保存授权
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
