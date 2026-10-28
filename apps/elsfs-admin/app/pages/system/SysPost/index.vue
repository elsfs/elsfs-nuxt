<script setup lang="ts">
import type { SysPost, SysPostPageQuery } from 'api-types/elsfs'
import { deletePostsApi, editPostApi, fetchPostPageApi } from 'api-types/elsfs'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 职位管理（列表页）。
 *
 * 分页查询 + 状态切换（整条记录 edit）+ 删除。
 * 新增 / 编辑拆到独立页面：`/system/SysPost/create`、`/system/SysPost/edit/:id`。
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

/* ---------- 跳转新增 / 编辑 ---------- */

function goCreate(): void {
  void navigateTo('/system/SysPost/create')
}

function goEdit(row: SysPost): void {
  void navigateTo(`/system/SysPost/edit/${row.postId}`)
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
    <!-- 查询条件 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent="search">
        <ElFormItem label="职务名称" class="mb-0">
          <div class="w-44">
            <ElInput
              v-model="query.postName"
              placeholder="请输入职务名称"
              clearable
              @keyup.enter="search"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="职务编码" class="mb-0">
          <div class="w-44">
            <ElInput
              v-model="query.postCode"
              placeholder="请输入职务编码"
              clearable
              @keyup.enter="search"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="状态" class="mb-0">
          <div class="w-32">
            <ElSelect v-model="query.status" placeholder="全部" clearable>
              <ElOption
                v-for="option in STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </div>
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
        新增职位
      </ElButton>
    </div>
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
            <ElButton link type="primary" size="small" @click="goEdit(row as SysPost)">
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
  </div>
</template>
