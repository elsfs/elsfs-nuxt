<script setup lang="ts">
import type { SysPost, SysPostForm } from 'api-types/elsfs'
import { addPostApi, editPostApi, fetchPostByIdApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 职位新增 / 编辑表单（独立新增页与编辑页共用）。
 *
 * 传 `postId` 表示编辑：先拉详情回填；不传表示新增。
 * 提交成功后回到职位列表 `/system/SysPost`。
 */
const props = defineProps<{
  postId?: string
}>()

const api = useApi()
const router = useRouter()

const isEdit = computed(() => Boolean(props.postId))
const title = computed(() => (isEdit.value ? '编辑职位' : '新增职位'))
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

/** 表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface PostFormModel {
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

const form = reactive<PostFormModel>(createPostForm())

const rules: FormRules = {
  postName: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  postCode: [{ required: true, message: '请输入职务编码', trigger: 'blur' }],
  postRank: [{ required: true, message: '请输入职级', trigger: 'blur' }],
}

onMounted(async () => {
  if (!props.postId) {
    return
  }
  loading.value = true
  try {
    const post: SysPost = await fetchPostByIdApi(api, props.postId)
    Object.assign(form, createPostForm(), {
      postName: post.postName,
      postCode: post.postCode,
      postRank: post.postRank ?? '',
      orderNo: post.orderNo ?? 1,
      status: post.status ?? '0',
      remark: post.remark ?? '',
    })
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '职务详情加载失败'))
  } finally {
    loading.value = false
  }
})

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

function backToList(): void {
  void router.push('/system/SysPost')
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
    if (props.postId) {
      await editPostApi(api, { ...buildPayload(), postId: props.postId })
      ElMessage.success('修改成功')
    } else {
      await addPostApi(api, buildPayload())
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
              ? '修改职务信息后保存，返回列表即可看到最新数据。'
              : '填写职务信息，保存后自动返回职位列表。'
          }}
        </p>
      </div>
    </div>

    <!-- 表单 -->
    <section v-loading="loading" class="border-border bg-card rounded-xl border p-4 sm:p-6">
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
        <ElFormItem>
          <ElButton @click="backToList"> 取消 </ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>
  </div>
</template>
