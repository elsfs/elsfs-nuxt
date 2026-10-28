<script setup lang="ts">
import type { SysPost, SysPostForm, SysPostPageQuery } from 'api-types/elsfs'
import { addPostApi, deletePostsApi, editPostApi, fetchPostPageApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 职位管理。
 *
 * 分页查询 + 新增 / 编辑 / 删除 + 状态切换（整条记录 edit）。
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
} = usePagedList<SysPost, SysPostPageQuery>({
  createQuery: () => ({ postName: '', postCode: '', status: '' }),
  fetcher: (params) => fetchPostPageApi(api, params),
})

onMounted(() => {
  void load()
})

/* ---------- 新增 / 编辑弹窗 ---------- */

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface PostFormModel {
  postId?: string
  postName: string
  postCode: string
  postRank: string
  orderNo: number
  status: string
  remark: string
}

function createPostForm(): PostFormModel {
  return {
    postName: '',
    postCode: '',
    postRank: '1',
    orderNo: 1,
    status: '0',
    remark: '',
  }
}

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editPostId = ref<string | null>(null)
const form = reactive<PostFormModel>(createPostForm())

const rules: FormRules = {
  postName: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  postCode: [{ required: true, message: '请输入职务编码', trigger: 'blur' }],
  postRank: [{ required: true, message: '请输入职级', trigger: 'blur' }],
}

function openCreate(): void {
  editPostId.value = null
  Object.assign(form, createPostForm())
  dialogVisible.value = true
}

function openEdit(row: SysPost): void {
  editPostId.value = row.postId
  Object.assign(form, createPostForm(), {
    postId: row.postId,
    postName: row.postName,
    postCode: row.postCode,
    postRank: row.postRank ?? '',
    orderNo: row.orderNo ?? 1,
    status: row.status ?? '0',
    remark: row.remark ?? '',
  })
  dialogVisible.value = true
}

/** 组装提交给后端的表单对象（空字符串转 null，避免把空串写进库） */
function buildPayload(): SysPostForm {
  return {
    postName: form.postName,
    postCode: form.postCode,
    postRank: form.postRank || null,
    orderNo: form.orderNo,
    status: form.status,
    remark: form.remark || null,
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
    if (editPostId.value) {
      await editPostApi(api, { ...buildPayload(), postId: editPostId.value })
      ElMessage.success('修改成功')
    } else {
      await addPostApi(api, buildPayload())
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

async function toggleStatus(row: SysPost, enabled: boolean): Promise<void> {
  const status = enabled ? '0' : '1'
  try {
    await editPostApi(api, { ...row, status })
    row.status = status
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysPost): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除职务「${row.postName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deletePostsApi(api, [row.postId])
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
        <h1 class="text-xl font-bold sm:text-2xl">职位管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">维护职务（岗位）信息，供账号管理分配使用。</p>
      </div>
      <ElButton type="primary" @click="openCreate">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增职务
      </ElButton>
    </div>

    <!-- 查询条件 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent="search">
        <ElFormItem label="职务名称" class="mb-0">
          <ElInput
            v-model="query.postName"
            placeholder="请输入职务名称"
            clearable
            class="w-44"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="职务编码" class="mb-0">
          <ElInput
            v-model="query.postCode"
            placeholder="请输入职务编码"
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
          <ElButton type="primary" @click="search"> 查询 </ElButton>
          <ElButton @click="reset"> 重置 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>

    <!-- 列表 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable v-loading="loading" :data="rows" row-key="postId" stripe class="w-full">
        <ElTableColumn type="index" label="#" width="56" align="center" />
        <ElTableColumn prop="postName" label="职务名称" min-width="140" />
        <ElTableColumn prop="postCode" label="职务编码" min-width="140" />
        <ElTableColumn prop="postRank" label="职级" width="100" />
        <ElTableColumn prop="orderNo" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === '0'"
              @change="
                (value: string | number | boolean) => toggleStatus(row as SysPost, Boolean(value))
              "
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="createAt" label="创建时间" width="170" />
        <ElTableColumn label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row as SysPost)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysPost)">
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
      :title="editPostId ? '编辑职务' : '新增职务'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
        <ElFormItem label="职务名称" prop="postName">
          <ElInput v-model="form.postName" placeholder="请输入职务名称" />
        </ElFormItem>
        <ElFormItem label="职务编码" prop="postCode">
          <ElInput v-model="form.postCode" placeholder="请输入职务编码" />
        </ElFormItem>
        <ElFormItem label="职级" prop="postRank">
          <ElInput v-model="form.postRank" placeholder="请输入职级" />
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
        <ElFormItem label="备注" prop="remark">
          <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false"> 取消 </ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitForm"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
