<script setup lang="ts">
import type { SysRole, SysRoleForm } from 'api-types/elsfs'
import { addRoleApi, editRoleApi, fetchRoleByIdApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 角色新增 / 编辑表单（列表页与独立编辑页共用）。
 *
 * 传 `roleId` 表示编辑：先拉详情回填；不传表示新增。
 * 提交成功后回到角色列表 `/system/role`。
 */
const props = defineProps<{
  roleId?: string
}>()

const api = useApi()
const router = useRouter()

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

onMounted(async () => {
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
})

function backToList(): void {
  void router.push('/system/role')
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
    backToList()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4 p-6 sm:p-8">
    <!-- 页头 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <ElButton link type="primary" class="!px-0" @click="backToList">
            <AppIcon name="lucide--arrow-left" class="mr-1 size-4" />
            返回列表
          </ElButton>
        </div>
        <h1 class="mt-1 text-xl font-bold sm:text-2xl">
          {{ title }}
        </h1>
        <p class="text-muted-foreground mt-1 text-sm">
          {{
            isEdit
              ? '修改角色信息后保存，返回列表即可看到最新数据。'
              : '填写角色信息，保存后自动返回角色列表。'
          }}
        </p>
      </div>
    </div>

    <!-- 表单 -->
    <section v-loading="loading" class="border-border bg-card rounded-xl border p-4 sm:p-6">
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
        <ElFormItem>
          <ElButton @click="backToList"> 取消 </ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>
  </div>
</template>
