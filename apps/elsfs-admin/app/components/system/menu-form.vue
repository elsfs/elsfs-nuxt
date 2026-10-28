<script setup lang="ts">
import type { SysMenu, SysMenuForm } from 'api-types/elsfs'
import { addMenuApi, editMenuApi, fetchMenuByIdApi, fetchMenuTreeApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 菜单新增 / 编辑表单（独立新增页与编辑页共用）。
 *
 * 传 `menuId` 表示编辑：先拉详情回填；不传表示新增（可带 `?parentId=<menuId>` 预填上级菜单）。
 * 提交成功后回到菜单列表 `/system/menu`。
 */
const props = defineProps<{
  menuId?: string
}>()

const api = useApi()
const router = useRouter()
const route = useRoute()

const isEdit = computed(() => Boolean(props.menuId))
const title = computed(() => (isEdit.value ? '编辑菜单' : '新增菜单'))
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const menuTree = shallowRef<SysMenu[]>([])

/** 表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
interface MenuFormModel {
  parentId: string
  menuName: string
  type: string
  routePath: string
  component: string
  icon: string
  orderNo: number
  isShow: boolean
  keepAlive: boolean
  isExt: boolean
  status: string
}

function createMenuForm(): MenuFormModel {
  return {
    parentId: '0',
    menuName: '',
    type: '0',
    routePath: '',
    component: '',
    icon: '',
    orderNo: 1,
    isShow: true,
    keepAlive: false,
    isExt: false,
    status: '0',
  }
}

const form = reactive<MenuFormModel>(createMenuForm())

/** ElTreeSelect 的节点结构（字段名沿用默认 value / label / children） */
interface MenuTreeOption {
  value: string
  label: string
  disabled?: boolean
  children?: MenuTreeOption[]
}

/**
 * 把菜单树递归映射成上级菜单选项。
 * 编辑时禁用自身及全部子孙，避免把菜单挂到自己或自己的下级下面。
 */
function toTreeOptions(
  nodes: SysMenu[],
  disabledId: string | null,
  disabledSubtree = false,
): MenuTreeOption[] {
  return nodes.map((node) => {
    const disabled = disabledSubtree || node.menuId === disabledId
    const children = node.children?.length ? toTreeOptions(node.children, disabledId, disabled) : []
    return children.length
      ? { value: node.menuId, label: node.menuName, disabled, children }
      : { value: node.menuId, label: node.menuName, disabled }
  })
}

const menuOptions = computed<MenuTreeOption[]>(() => [
  { value: '0', label: '顶级菜单' },
  ...toTreeOptions(menuTree.value, props.menuId ?? null),
])

const rules: FormRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  orderNo: [{ required: true, message: '请输入排序', trigger: 'blur' }],
}

/** 新增页的 `?parentId=<menuId>` 预填上级菜单 */
function resolveQueryParentId(): string {
  const raw = route.query.parentId
  const parentId = Array.isArray(raw) ? raw[0] : raw
  return parentId ? String(parentId) : '0'
}

async function loadMenuTree(): Promise<void> {
  try {
    menuTree.value = await fetchMenuTreeApi(api)
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '菜单加载失败'))
  }
}

async function fillFormByMenuId(): Promise<void> {
  if (!props.menuId) {
    Object.assign(form, createMenuForm(), { parentId: resolveQueryParentId() })
    return
  }
  loading.value = true
  try {
    const menu: SysMenu = await fetchMenuByIdApi(api, props.menuId)
    Object.assign(form, createMenuForm(), {
      parentId: menu.parentId || '0',
      menuName: menu.menuName,
      type: menu.type ?? '0',
      routePath: menu.routePath ?? '',
      component: menu.component ?? '',
      icon: menu.icon ?? '',
      orderNo: menu.orderNo ?? 1,
      isShow: menu.isShow ?? true,
      keepAlive: menu.keepAlive ?? false,
      isExt: menu.isExt ?? false,
      status: menu.status ?? '0',
    })
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '菜单详情加载失败'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadMenuTree(), fillFormByMenuId()])
})

function backToList(): void {
  void router.push('/system/menu')
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
    const payload: SysMenuForm = {
      ...form,
      parentId: form.parentId || '0',
      // 后端 menu/add 要求 orderNo 非空
      orderNo: form.orderNo ?? 1,
    }
    if (props.menuId) {
      await editMenuApi(api, { ...payload, menuId: props.menuId })
      ElMessage.success('修改成功')
    } else {
      await addMenuApi(api, payload)
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
              ? '修改菜单信息后保存，返回列表即可看到最新数据。'
              : '填写菜单信息，保存后自动返回菜单列表。'
          }}
        </p>
      </div>
    </div>

    <!-- 表单 -->
    <section v-loading="loading" class="border-border bg-card rounded-xl border p-4 sm:p-6">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="上级菜单" prop="parentId">
          <ElTreeSelect
            v-model="form.parentId"
            :data="menuOptions"
            default-expand-all
            placeholder="请选择上级菜单"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="菜单名称" prop="menuName">
          <ElInput v-model="form.menuName" placeholder="请输入菜单名称" />
        </ElFormItem>
        <ElFormItem label="菜单类型" prop="type">
          <ElRadioGroup v-model="form.type">
            <ElRadio v-for="option in MENU_TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="路由地址" prop="routePath">
          <ElInput v-model="form.routePath" placeholder="如 /system/dept" />
        </ElFormItem>
        <ElFormItem label="组件路径" prop="component">
          <ElInput
            v-model="form.component"
            :placeholder="
              form.type === '0' ? '目录填 BasicLayout' : '菜单填页面路径，如 system/dept'
            "
          />
        </ElFormItem>
        <ElFormItem label="图标" prop="icon">
          <div class="flex w-full items-center gap-2">
            <ElInput v-model="form.icon" placeholder="如 mdi:home" class="flex-1" />
            <AppIcon :name="form.icon || 'menu'" fallback="menu" class="size-5" />
          </div>
        </ElFormItem>
        <ElFormItem label="排序" prop="orderNo">
          <ElInputNumber v-model="form.orderNo" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="是否显示" prop="isShow">
          <ElSwitch v-model="form.isShow" />
        </ElFormItem>
        <ElFormItem label="是否缓存" prop="keepAlive">
          <ElSwitch v-model="form.keepAlive" />
        </ElFormItem>
        <ElFormItem label="是否外链" prop="isExt">
          <ElSwitch v-model="form.isExt" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem>
          <ElButton @click="backToList"> 取消 </ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> 保存 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>
  </div>
</template>
