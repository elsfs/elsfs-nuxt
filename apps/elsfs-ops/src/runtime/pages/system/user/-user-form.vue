<script setup lang="ts">
import type { SysDept, SysUserCreateForm } from 'api-types/elsfs'
import {
  addUserApi,
  editUserApi,
  fetchDeptTreeApi,
  fetchPostListApi,
  fetchRoleListApi,
  fetchUserByIdApi,
  fetchUserDeptIdsApi,
  fetchUserPostIdsApi,
  fetchUserRoleIdsApi,
} from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 账号新增 / 编辑弹窗表单（由账号列表页打开）。
 *
 * 传 `userId` 表示编辑：每次打开弹窗先重置表单，再并行拉取详情与已绑定的角色 / 部门 / 职务后回填；
 * 不传表示新增。提交成功后关闭弹窗并通知列表刷新。
 */
const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  userId?: string
}>()

const emit = defineEmits<{
  success: []
}>()

const api = useApi()

const isEdit = computed(() => Boolean(props.userId))
const title = computed(() => (isEdit.value ? '编辑账号' : '新增账号'))
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

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

/* ---------- 表单 ---------- */

/** 表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
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

const form = reactive<UserFormModel>(createUserForm())

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  // 手机号可以为空，非空时才校验格式
  phone: [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
}

/** 重置为新增态：清空所有字段与校验状态（选项不重复清空） */
function resetForm(): void {
  Object.assign(form, createUserForm())
  formRef.value?.clearValidate()
}

/** 编辑态：拉取详情与已绑定的角色 / 部门 / 职务并回填 */
async function loadDetail(userId: string): Promise<void> {
  loading.value = true
  try {
    // 详情与已绑定的角色 / 部门 / 职务并行加载
    const [detail, roleIds, deptIds, postIds] = await Promise.all([
      fetchUserByIdApi(api, userId),
      fetchUserRoleIdsApi(api, userId),
      fetchUserDeptIdsApi(api, userId),
      fetchUserPostIdsApi(api, userId),
    ])
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
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '账号信息加载失败'))
  } finally {
    loading.value = false
  }
}

watch(visible, async (opened) => {
  if (!opened) {
    return
  }
  resetForm()
  // 选项加载失败只提示，不影响表单
  void loadDeptOptions()
  void loadRoleOptions()
  void loadPostOptions()
  const userId = props.userId
  if (userId) {
    await loadDetail(userId)
  }
  await nextTick()
  formRef.value?.clearValidate()
})

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

function closeDialog(): void {
  visible.value = false
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
    if (props.userId) {
      await editUserApi(api, { ...payload, userId: props.userId })
      ElMessage.success('修改成功')
    } else {
      await addUserApi(api, payload)
      ElMessage.success('添加成功')
    }
    visible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="720px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div v-loading="loading" class="max-h-[70vh] overflow-y-auto">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
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
    </div>
    <template #footer>
      <ElButton @click="closeDialog"> 取消 </ElButton>
      <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
    </template>
  </ElDialog>
</template>
