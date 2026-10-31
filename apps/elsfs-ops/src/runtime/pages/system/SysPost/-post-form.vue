<script setup lang="ts">
import type { SysPost, SysPostForm } from 'api-types/elsfs'
import { addPostApi, editPostApi, fetchPostByIdApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'
import { STATUS_OPTIONS } from '~/utils/system-options'

/**
 * 职位新增 / 编辑弹窗表单。
 *
 * 由职位列表页通过 `v-model:visible` 打开；传 `postId` 表示编辑，打开时拉详情回填。
 * 提交成功后关闭弹窗并 emit `success`，由列表页刷新数据。
 */
const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  postId?: string
}>()

const emit = defineEmits<{
  success: []
}>()

const api = useApi()

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

function resetForm(): void {
  Object.assign(form, createPostForm())
  formRef.value?.clearValidate()
}

async function loadDetail(): Promise<void> {
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
    if (props.postId) {
      await editPostApi(api, { ...buildPayload(), postId: props.postId })
      ElMessage.success('修改成功')
    } else {
      await addPostApi(api, buildPayload())
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
      <ElButton @click="closeDialog"> 取消 </ElButton>
      <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
    </template>
  </ElDialog>
</template>
