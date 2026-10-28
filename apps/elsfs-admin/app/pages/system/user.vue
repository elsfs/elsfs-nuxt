<script setup lang="ts">
import type { SysDept, SysUser, SysUserCreateForm, SysUserPageQuery } from 'api-types/elsfs'
import {
  addUserApi,
  changeUserPasswordApi,
  deleteUsersApi,
  editUserApi,
  editUserStateApi,
  fetchDeptTreeApi,
  fetchPostListApi,
  fetchRoleListApi,
  fetchUserByIdApi,
  fetchUserDeptIdsApi,
  fetchUserPageApi,
  fetchUserPostIdsApi,
  fetchUserRoleIdsApi,
} from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 账号管理。
 *
 * 分页查询 + 新增 / 编辑 / 删除 + 状态切换 + 重置密码，编辑时同时维护账号的角色、
 * 部门、职务绑定关系。用户接口支持 `editState`，状态切换走批量改状态接口，
 * 不再整条记录更新。
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

/* ---------- 下拉选项（角色 / 部门 / 职务） ---------- */

interface SelectOption {
  label: string
  value: string
}

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
const roleOptions = ref<SelectOption[]>([])
const postOptions = ref<SelectOption[]>([])

async function loadDeptOptions(): Promise<void> {
  try {
    deptTree.value = toDeptTreeOptions(await fetchDeptTreeApi(api))
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '部门树加载失败'))
  }
}

async function loadRoleOptions(): Promise<void> {
  try {
    const roles = await fetchRoleListApi(api)
    roleOptions.value = roles.map((role) => ({ label: role.roleName, value: role.roleId }))
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '角色列表加载失败'))
  }
}

async function loadPostOptions(): Promise<void> {
  try {
    const posts = await fetchPostListApi(api)
    postOptions.value = posts.map((post) => ({ label: post.postName, value: post.postId }))
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '职务列表加载失败'))
  }
}

onMounted(() => {
  void load()
  // 选项加载失败只提示，不影响主列表
  void loadDeptOptions()
  void loadRoleOptions()
  void loadPostOptions()
})

/* ---------- 新增 / 编辑弹窗 ---------- */

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface UserFormModel {
  userId?: string
  username: string
  nickname: string
  phone: string
  email: string
  sex: string
  birthday: string
  status: string
  roleIds: string[]
  deptIds: string[]
  postIds: string[]
}

function createUserForm(): UserFormModel {
  return {
    username: '',
    nickname: '',
    phone: '',
    email: '',
    sex: '0',
    birthday: '',
    status: '0',
    roleIds: [],
    deptIds: [],
    postIds: [],
  }
}

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editUserId = ref<string | null>(null)
const form = reactive<UserFormModel>(createUserForm())

const dialogTitle = computed(() => (editUserId.value ? '编辑账号' : '新增账号'))

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  // 手机号可以为空，非空时才校验格式
  phone: [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
}

function openCreate(): void {
  editUserId.value = null
  Object.assign(form, createUserForm())
  dialogVisible.value = true
}

async function openEdit(row: SysUser): Promise<void> {
  try {
    // 详情与已绑定的角色 / 部门 / 职务并行加载
    const [detail, roleIds, deptIds, postIds] = await Promise.all([
      fetchUserByIdApi(api, row.userId),
      fetchUserRoleIdsApi(api, row.userId),
      fetchUserDeptIdsApi(api, row.userId),
      fetchUserPostIdsApi(api, row.userId),
    ])
    editUserId.value = detail.userId
    Object.assign(form, createUserForm(), {
      userId: detail.userId,
      username: detail.username,
      nickname: detail.nickname ?? '',
      phone: detail.phone ?? '',
      email: detail.email ?? '',
      sex: detail.sex ?? '0',
      birthday: detail.birthday ?? '',
      status: detail.status ?? '0',
      roleIds: [...roleIds],
      deptIds: [...deptIds],
      postIds: [...postIds],
    })
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '账号信息加载失败'))
  }
}

/** 组装提交给后端的对象：角色 / 部门 / 职务用数组，空数组表示清空 */
function buildUserPayload(): SysUserCreateForm {
  return {
    username: form.username,
    nickname: form.nickname,
    phone: form.phone,
    email: form.email,
    sex: form.sex,
    birthday: form.birthday,
    status: form.status,
    roleIds: [...form.roleIds],
    deptIds: [...form.deptIds],
    postIds: [...form.postIds],
  }
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
    const payload = buildUserPayload()
    if (editUserId.value) {
      await editUserApi(api, { ...payload, userId: editUserId.value })
      ElMessage.success('修改成功')
    } else {
      await addUserApi(api, payload)
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
    <!-- 页头 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold sm:text-2xl">账号管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          维护后台账号，并给账号分配角色、部门与职务。
        </p>
      </div>
      <ElButton type="primary" @click="openCreate">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增账号
      </ElButton>
    </div>

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
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
        <ElFormItem label="用户名" prop="username">
          <ElInput
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="Boolean(editUserId)"
          />
        </ElFormItem>
        <ElFormItem label="昵称" prop="nickname">
          <ElInput v-model="form.nickname" placeholder="请输入昵称" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="form.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="form.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="性别" prop="sex">
          <ElRadioGroup v-model="form.sex">
            <ElRadio v-for="option in SEX_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="生日" prop="birthday">
          <ElDatePicker
            v-model="form.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择生日"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="角色" prop="roleIds">
          <ElSelect
            v-model="form.roleIds"
            multiple
            collapse-tags
            clearable
            placeholder="请选择角色"
          >
            <ElOption
              v-for="option in roleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="部门" prop="deptIds">
          <ElTreeSelect
            v-model="form.deptIds"
            :data="deptTree"
            :props="{ label: 'label', children: 'children' }"
            node-key="value"
            multiple
            show-checkbox
            check-strictly
            clearable
            filterable
            :render-after-expand="false"
            placeholder="请选择部门"
          />
        </ElFormItem>
        <ElFormItem label="职务" prop="postIds">
          <ElSelect
            v-model="form.postIds"
            multiple
            collapse-tags
            clearable
            placeholder="请选择职务"
          >
            <ElOption
              v-for="option in postOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false"> 取消 </ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitForm"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
