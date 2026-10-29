<script setup lang="ts">
import type { SysPost, SysPostPageQuery } from 'api-types/elsfs'
import { deletePostsApi, editPostApi, fetchPostPageApi } from 'api-types/elsfs'

import type { SearchFormField } from '~/types/search-form'
import { toErrorMessage } from '~/utils/api-error'

import PostForm from './-post-form.vue'

/**
 * 系统管理 - 职位管理（列表页）。
 *
 * 分页查询 + 状态切换（整条记录 edit）+ 删除。
 * 新增 / 编辑用弹窗表单（`./-post-form.vue`），保存成功后刷新列表。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 搜索字段 ---------- */

const SEARCH_FIELDS: SearchFormField[] = [
  { type: 'input', label: '职务名称', prop: 'postName' },
  { type: 'input', label: '职务编码', prop: 'postCode' },
  { type: 'select', label: '状态', prop: 'status', option: STATUS_OPTIONS, placeholder: '全部' },
]

/* ---------- 列表 ---------- */

const { query, rows, loading, total, current, size, load, search, reset } = usePagedList<
  SysPost,
  SysPostPageQuery
>({
  createQuery: () => ({ postName: '', postCode: '', status: '' }),
  fetcher: (params) => fetchPostPageApi(api, params),
})

onMounted(() => {
  void load()
})

/* ---------- 分页 ---------- */

/** 页码 / 每页条数已由 v-model 同步到 current / size，这里只需重新查询 */
function handlePaginationChange(): void {
  void load()
}

/* ---------- 新增 / 编辑弹窗 ---------- */

const formVisible = ref(false)
const editingId = ref<string>()

function openCreate(): void {
  editingId.value = undefined
  formVisible.value = true
}

function openEdit(row: SysPost): void {
  editingId.value = row.postId
  formVisible.value = true
}

function handleSaved(): void {
  void load()
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
          新增职位
        </ElButton>
      </template>
    </AdminSearchForm>
    <!-- 列表 -->
    <section class="border-border bg-card flex min-h-0 flex-1 flex-col rounded-xl border p-4">
      <AdminTable :loading="loading" :data="rows" row-key="postId">
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

    <PostForm v-model:visible="formVisible" :post-id="editingId" @success="handleSaved" />
  </AdminContainerCard>
</template>
