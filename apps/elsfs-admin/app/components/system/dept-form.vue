<script setup lang="ts">
import type { SysDept, SysDeptForm } from 'api-types/elsfs'
import { addDeptApi, editDeptApi, fetchDeptByIdApi, fetchDeptTreeApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 部门新增 / 编辑表单（新增页与独立编辑页共用）。
 *
 * 传 `deptId` 表示编辑：先拉详情回填；不传表示新增。
 * 新增时若地址栏带 `?parentId=<deptId>`（列表页行内「新增子部门」），用它预填上级部门。
 * 提交成功后回到部门列表 `/system/dept`。
 */
const props = defineProps<{
  deptId?: string
}>()

const api = useApi()
const router = useRouter()
const route = useRoute()

const isEdit = computed(() => Boolean(props.deptId))
const title = computed(() => (isEdit.value ? '编辑部门' : '新增部门'))
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const deptTree = ref<SysDept[]>([])

/** 表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface DeptFormModel {
  parentId: string
  deptName: string
  orgCode: string
  orgCategory: number
  mobile: string
  address: string
  orderNo: number
  status: string
  deptDesc: string
}

function createDeptForm(): DeptFormModel {
  return {
    parentId: '0',
    deptName: '',
    orgCode: '',
    orgCategory: 0,
    mobile: '',
    address: '',
    orderNo: 1,
    status: '0',
    deptDesc: '',
  }
}

const form = reactive<DeptFormModel>(createDeptForm())

const rules: FormRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

/* ---------- 上级部门选项 ---------- */

interface DeptTreeOption {
  value: string
  label: string
  disabled?: boolean
  children?: DeptTreeOption[]
}

/**
 * 把部门树递归映射成 ElTreeSelect 需要的数据。
 * 编辑时禁用自身及全部子孙，避免把部门挂到自己或自己的下级下面。
 */
function toTreeOptions(
  nodes: SysDept[],
  disabledId: string | null,
  disabledSubtree = false,
): DeptTreeOption[] {
  return nodes.map((node) => {
    const disabled = disabledSubtree || node.deptId === disabledId
    const children = node.children?.length ? toTreeOptions(node.children, disabledId, disabled) : []
    return children.length
      ? { value: node.deptId, label: node.deptName, disabled, children }
      : { value: node.deptId, label: node.deptName, disabled }
  })
}

const deptTreeOptions = computed<DeptTreeOption[]>(() => [
  { value: '0', label: '顶级部门' },
  ...toTreeOptions(deptTree.value, props.deptId ?? null),
])

/* ---------- 初始化 ---------- */

onMounted(async () => {
  // 新增：行内「新增子部门」跳转过来时带 ?parentId=<deptId>
  if (!props.deptId) {
    const parentId = route.query.parentId
    if (typeof parentId === 'string' && parentId) {
      form.parentId = parentId
    }
  }
  loading.value = true
  try {
    deptTree.value = await fetchDeptTreeApi(api)
    if (props.deptId) {
      const dept: SysDept = await fetchDeptByIdApi(api, props.deptId)
      Object.assign(form, createDeptForm(), {
        parentId: dept.parentId ?? '0',
        deptName: dept.deptName,
        orgCode: dept.orgCode ?? '',
        orgCategory: dept.orgCategory ?? 0,
        mobile: dept.mobile ?? '',
        address: dept.address ?? '',
        orderNo: dept.orderNo ?? 1,
        status: dept.status ?? '0',
        deptDesc: dept.deptDesc ?? '',
      })
    }
  } catch (error) {
    ElMessage.error(toErrorMessage(error, props.deptId ? '部门详情加载失败' : '部门树加载失败'))
  } finally {
    loading.value = false
  }
})

function backToList(): void {
  void router.push('/system/dept')
}

/** 组装提交给后端的表单对象（空字符串转 null，避免把空串写进库） */
function buildPayload(): SysDeptForm {
  return {
    parentId: form.parentId,
    deptName: form.deptName,
    orgCode: form.orgCode || null,
    orgCategory: form.orgCategory,
    mobile: form.mobile || null,
    address: form.address || null,
    orderNo: form.orderNo,
    status: form.status,
    deptDesc: form.deptDesc || null,
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
    if (props.deptId) {
      await editDeptApi(api, { ...buildPayload(), deptId: props.deptId })
      ElMessage.success('修改成功')
    } else {
      await addDeptApi(api, buildPayload())
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
              ? '修改部门信息后保存，返回列表即可看到最新数据。'
              : '填写部门信息，保存后自动返回部门列表。'
          }}
        </p>
      </div>
    </div>

    <!-- 表单 -->
    <section v-loading="loading" class="border-border bg-card rounded-xl border p-4 sm:p-6">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="上级部门" prop="parentId">
          <ElTreeSelect
            v-model="form.parentId"
            :data="deptTreeOptions"
            placeholder="请选择上级部门"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="部门名称" prop="deptName">
          <ElInput v-model="form.deptName" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="机构编码" prop="orgCode">
          <ElInput v-model="form.orgCode" placeholder="请输入机构编码" />
        </ElFormItem>
        <ElFormItem label="机构类别" prop="orgCategory">
          <ElInputNumber v-model="form.orgCategory" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="mobile">
          <ElInput v-model="form.mobile" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="form.address" placeholder="请输入地址" />
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
        <ElFormItem label="部门描述" prop="deptDesc">
          <ElInput v-model="form.deptDesc" type="textarea" :rows="3" placeholder="请输入部门描述" />
        </ElFormItem>
        <ElFormItem>
          <ElButton @click="backToList"> 取消 </ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>
  </div>
</template>
