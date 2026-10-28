<script setup lang="ts">
import type { SysDept, SysDeptForm } from 'api-types/elsfs'
import { addDeptApi, deleteDeptsApi, editDeptApi, fetchDeptTreeApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 部门管理。
 *
 * 树形表格（数据来自 `/dept/tree`）+ 新增 / 编辑 / 删除 + 状态切换。
 * 查询条件里只有部门名称，且是**前端本地过滤**，不会请求后端。
 * 后端 `editState` 对部门不支持，所以状态切换走「整条记录 edit」。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 树形数据 ---------- */

const deptTree = ref<SysDept[]>([])
const loading = ref(false)
const keyword = ref('')

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

const tableData = computed(() => filterTree(deptTree.value, keyword.value))

/* ---------- 新增 / 编辑弹窗 ---------- */

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再组装成接口类型 */
interface DeptFormModel {
  deptId?: string
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

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editDeptId = ref<string | null>(null)
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
  ...toTreeOptions(deptTree.value, editDeptId.value),
])

/** 打开「新增部门」弹窗；从行内新增子部门时传入父部门 id */
function openCreate(parentId = '0'): void {
  editDeptId.value = null
  Object.assign(form, createDeptForm(), { parentId })
  dialogVisible.value = true
}

function openEdit(row: SysDept): void {
  editDeptId.value = row.deptId
  Object.assign(form, createDeptForm(), {
    deptId: row.deptId,
    parentId: row.parentId ?? '0',
    deptName: row.deptName,
    orgCode: row.orgCode ?? '',
    orgCategory: row.orgCategory ?? 0,
    mobile: row.mobile ?? '',
    address: row.address ?? '',
    orderNo: row.orderNo ?? 1,
    status: row.status ?? '0',
    deptDesc: row.deptDesc ?? '',
  })
  dialogVisible.value = true
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
    if (editDeptId.value) {
      await editDeptApi(api, { ...buildPayload(), deptId: editDeptId.value })
      ElMessage.success('修改成功')
    } else {
      await addDeptApi(api, buildPayload())
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await loadTree()
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  } finally {
    submitting.value = false
  }
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
  <div class="mx-auto max-w-7xl space-y-4 p-6 sm:p-8">
    <!-- 页头 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold sm:text-2xl">部门管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          维护组织架构中的部门信息，支持树形层级与启停用。
        </p>
      </div>
      <ElButton type="primary" @click="openCreate('0')">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增部门
      </ElButton>
    </div>

    <!-- 本地过滤 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3">
        <ElFormItem label="部门名称" class="mb-0">
          <ElInput v-model="keyword" placeholder="请输入部门名称" clearable class="w-52" />
        </ElFormItem>
        <ElFormItem class="mb-0">
          <ElButton :loading="loading" @click="loadTree">
            <AppIcon name="lucide--refresh" class="mr-1 size-4" />
            刷新
          </ElButton>
        </ElFormItem>
      </ElForm>
    </section>

    <!-- 树形列表 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable
        :key="keyword"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
        class="w-full"
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
            <ElButton link type="primary" size="small" @click="openCreate(row.deptId)">
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
      </ElTable>

      <p
        v-if="!loading && !tableData.length"
        class="text-muted-foreground mt-3 text-center text-sm"
      >
        暂无部门数据
      </p>
    </section>

    <!-- 新增 / 编辑 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editDeptId ? '编辑部门' : '新增部门'"
      width="600px"
      destroy-on-close
    >
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
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false"> 取消 </ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitForm"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
