<script setup lang="ts">
import type { SysMenu, SysMenuForm } from 'api-types/elsfs'
import { addMenuApi, deleteMenusApi, editMenuApi, fetchMenuTreeApi } from 'api-types/elsfs'
import type { FormInstance, FormRules } from 'element-plus'

import { toErrorMessage } from '~/utils/api-error'

/**
 * 系统管理 - 菜单管理。
 *
 * 树形表格展示完整菜单树 + 新增 / 编辑 / 删除 + 状态切换。
 * 后端 `editState` 接口对菜单不支持，所以状态切换走「整条记录 edit」。
 */
definePageMeta({
  layout: 'admin',
})

const api = useApi()

/* ---------- 菜单树 ---------- */

const loading = ref(false)
const keyword = ref('')
const menuTree = shallowRef<SysMenu[]>([])

/**
 * 本地过滤菜单树。
 *
 * - 命中节点保留整棵子树（父级命中时子级无需再逐个匹配）；
 * - 自身未命中但有子级命中的，保留该节点及过滤后的命中子级（即祖先链）；
 * - 自身与整棵子树都未命中的直接丢弃。
 */
function filterTree(nodes: SysMenu[], searchText: string): SysMenu[] {
  if (!searchText) {
    return nodes
  }
  const lowerSearch = searchText.toLowerCase()
  const result: SysMenu[] = []
  for (const node of nodes) {
    if (node.menuName.toLowerCase().includes(lowerSearch)) {
      result.push(node)
      continue
    }
    const children = node.children?.length ? filterTree(node.children, searchText) : []
    if (children.length) {
      result.push({ ...node, children })
    }
  }
  return result
}

const filteredMenus = computed(() => filterTree(menuTree.value, keyword.value.trim()))

async function load(): Promise<void> {
  loading.value = true
  try {
    menuTree.value = await fetchMenuTreeApi(api)
  } catch (error) {
    ElMessage.error(toErrorMessage(error, '菜单加载失败'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

/* ---------- 新增 / 编辑弹窗 ---------- */

/** 弹窗表单模型：所有字段在表单里都必须有值，提交时再交给接口类型 */
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

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editMenuId = ref<string | null>(null)
const form = reactive<MenuFormModel>(createMenuForm())

const menuOptions = computed<MenuTreeOption[]>(() => [
  { value: '0', label: '顶级菜单' },
  ...toTreeOptions(menuTree.value, editMenuId.value),
])

const rules: FormRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
}

/** 打开新增弹窗，parentId 为 '0' 表示顶级菜单，传行内的 menuId 表示新增子菜单 */
function openCreate(parentId = '0'): void {
  editMenuId.value = null
  Object.assign(form, createMenuForm(), { parentId })
  dialogVisible.value = true
}

function openEdit(row: SysMenu): void {
  editMenuId.value = row.menuId
  Object.assign(form, createMenuForm(), {
    parentId: row.parentId || '0',
    menuName: row.menuName,
    type: row.type ?? '0',
    routePath: row.routePath ?? '',
    component: row.component ?? '',
    icon: row.icon ?? '',
    orderNo: row.orderNo ?? 1,
    isShow: row.isShow ?? true,
    keepAlive: row.keepAlive ?? false,
    isExt: row.isExt ?? false,
    status: row.status ?? '0',
  })
  dialogVisible.value = true
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
    const payload: SysMenuForm = { ...form }
    if (editMenuId.value) {
      payload.menuId = editMenuId.value
      await editMenuApi(api, payload)
      ElMessage.success('修改成功')
    } else {
      await addMenuApi(api, payload)
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

async function toggleStatus(row: SysMenu, enabled: boolean): Promise<void> {
  const status = enabled ? '0' : '1'
  // 树节点自带 children，提交时不能带上去，否则后端会把整棵子树写回本条记录
  const { children: _children, ...rest } = row
  try {
    await editMenuApi(api, { ...rest, status })
    row.status = status
    ElMessage.success(enabled ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error(toErrorMessage(error))
  }
}

async function handleDelete(row: SysMenu): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除菜单「${row.menuName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteMenusApi(api, [row.menuId])
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
        <h1 class="text-xl font-bold sm:text-2xl">菜单管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          维护后台菜单树，配置菜单的路由、组件、图标与显示状态。
        </p>
      </div>
      <ElButton type="primary" @click="openCreate('0')">
        <AppIcon name="lucide--plus" class="mr-1 size-4" />
        新增菜单
      </ElButton>
    </div>

    <!-- 查询条件（本地过滤） -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElForm inline class="flex flex-wrap items-end gap-3" @submit.prevent>
        <ElFormItem label="菜单名称" class="mb-0">
          <ElInput v-model="keyword" placeholder="请输入菜单名称" clearable class="w-56">
            <template #prefix>
              <AppIcon name="lucide--search" class="size-4" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem class="mb-0">
          <ElButton @click="keyword = ''"> 重置 </ElButton>
        </ElFormItem>
      </ElForm>
    </section>

    <!-- 菜单树 -->
    <section class="border-border bg-card rounded-xl border p-4">
      <ElTable
        v-loading="loading"
        :data="filteredMenus"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
        empty-text="暂无菜单数据"
        class="w-full"
      >
        <ElTableColumn prop="menuName" label="菜单名称" min-width="220">
          <template #default="{ row }">
            <span class="inline-flex items-center">
              <AppIcon :name="row.icon ?? 'menu'" fallback="menu" class="mr-1 size-4" />
              <span>{{ row.menuName }}</span>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="routePath" label="路由地址" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="component" label="组件路径" min-width="170" show-overflow-tooltip />
        <ElTableColumn label="类型" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="row.type === '0' ? 'info' : 'success'" size="small">
              {{ menuTypeText(row.type) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="orderNo" label="排序" width="80" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === '0'"
              @change="
                (value: string | number | boolean) => toggleStatus(row as SysMenu, Boolean(value))
              "
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openCreate(row.menuId)">
              新增子菜单
            </ElButton>
            <ElButton link type="primary" size="small" @click="openEdit(row as SysMenu)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row as SysMenu)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>

    <!-- 新增 / 编辑 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editMenuId ? '编辑菜单' : '新增菜单'"
      width="600px"
      destroy-on-close
    >
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
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false"> 取消 </ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitForm"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
