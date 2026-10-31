<script setup lang="ts">
import type { SysRole, SysRoleForm } from 'api-types/elsfs'
import { addRoleApi, editRoleApi, fetchRoleByIdApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 角色新增 / 编辑弹窗表单。
 *
 * 由角色列表页通过 `v-model:visible` 打开；传 `roleId` 表示编辑（先拉详情回填），不传表示新增。
 * 提交成功后关闭弹窗并 emit `success`，由列表页刷新列表。
 */
const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  roleId?: string
}>()

const emit = defineEmits<{
  success: []
}>()

const api = useApi()

const isEdit = computed(() => Boolean(props.roleId))
const title = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface RoleFormModel {
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

const form = reactive<RoleFormModel>(createRoleForm())

const rules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(form, createRoleForm())
  formRef.value?.clearValidate()
}

/** 编辑模式下按 `roleId` 拉详情回填；新增模式直接返回 */
async function loadDetail(): Promise<void> {
  if (!props.roleId) {
    return
  }
  loading.value = true
  try {
    const role: SysRole = await fetchRoleByIdApi(api, props.roleId)
    Object.assign(form, createRoleForm(), {
      roleName: role.roleName,
      roleCode: role.roleCode,
      roleDesc: role.roleDesc ?? '',
      orderNo: role.orderNo ?? 1,
      status: role.status ?? '0',
    })
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '角色详情加载失败'))
  } finally {
    loading.value = false
  }
}

watch(visible, async (open) => {
  if (!open) {
    return
  }
  resetForm()
  await loadDetail()
  await nextTick()
  formRef.value?.clearValidate()
})

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
    const payload: SysRoleForm = { ...form }
    if (props.roleId) {
      await editRoleApi(api, { ...payload, roleId: props.roleId })
      ElMessage.success('修改成功')
    } else {
      await addRoleApi(api, payload)
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
    width="560px"
    :close-on-click-modal="false"
    append-to-body
  >
    <ElForm ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="96px">
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
      <ElButton @click="closeDialog"> 取消 </ElButton>
      <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
    </template>
  </ElDialog>
</template>
