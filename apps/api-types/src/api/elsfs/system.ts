import type { RequestClient } from 'nuxt-request/runtime'

/**
 * 系统管理接口契约（菜单 / 部门 / 职务 / 角色 / 用户）。
 *
 * - 后端统一响应信封 `{ code, message, result }` 由 `createApiClient` 的响应拦截器拆掉，
 *   这里的函数直接返回 `result` 的内容（分页接口返回 {@link SysPageResult}）；
 * - 分页参数统一是 `current`（从 1 开始）+ `size`；
 * - 批量删除统一用 `DELETE` + 请求体 id 数组；
 * - 菜单 / 部门是树形结构，列表接口直接返回带 `children` 的树。
 *
 * @see http://192.168.0.104:6002/swagger-ui/index.html
 */

/** 后端实体公共字段 */
export interface SysEntityBase {
  /** 创建时间（后端格式：`yyyy-MM-dd HH:mm:ss`） */
  createAt?: string | null
  /** 更新时间（后端格式：`yyyy-MM-dd HH:mm:ss`） */
  updateAt?: string | null
  createBy?: string | null
  updateBy?: string | null
  /** 删除标记：`0` 未删除 */
  deleteFlag?: string | null
  /** 拼音码（后端自动生成） */
  pinyinCode?: string | null
  /** 五笔码（后端自动生成） */
  wubiCode?: string | null
}

/** 排序字段 */
export interface SysOrderItem {
  column: string
  asc?: boolean
}

/** 分页查询公共参数 */
export interface SysPageQuery {
  current?: number
  size?: number
  startDate?: string
  endDate?: string
  orders?: SysOrderItem[]
}

/** 分页结果（MyBatis-Plus IPage） */
export interface SysPageResult<T> {
  current: number
  pages: number
  records: T[]
  size: number
  total: number
}

/** 修改状态入参（后端 EditStateCo） */
export interface SysEditStatePayload {
  ids: string[]
  /** 目标状态：`0` 正常 / `1` 停用 */
  status: number
  /** 状态列名，后端默认按 `status` 处理 */
  column: string
}

/* ------------------------------------------------------------------ *
 * 菜单管理
 * ------------------------------------------------------------------ */

/** 菜单类型：`0` 目录 / `1` 菜单 */
export type SysMenuType = '0' | '1'

/** 系统菜单（后端 SysMenu，同时用于树和表单） */
export interface SysMenu extends SysEntityBase {
  id: string
  menuId: string
  parentId?: string | null
  menuName: string
  /** 路由地址 */
  routePath?: string | null
  /** 组件路径（目录一般是 `BasicLayout`，菜单是页面路径） */
  component?: string | null
  /** iconify 图标名（如 `mdi:cloud-key-outline`） */
  icon?: string | null
  /** 是否在侧边菜单显示 */
  isShow?: boolean | null
  /** 是否缓存页面 */
  keepAlive?: boolean | null
  /** 是否外链 */
  isExt?: boolean | null
  /** 排序 */
  orderNo?: number | null
  /** 菜单类型 */
  type?: SysMenuType | string | null
  typeName?: string | null
  /** 状态：`0` 正常 / `1` 停用 */
  status?: string | null
  children?: SysMenu[]
}

/** 新增 / 编辑菜单的表单数据（编辑时带 menuId） */
export type SysMenuForm = Omit<SysMenu, 'id' | 'menuId' | 'children'> & {
  id?: string
  menuId?: string
}

/** 获取完整菜单树（新增 / 编辑弹窗的「上级菜单」选择也用这棵树） */
export function fetchMenuTreeApi(client: RequestClient): Promise<SysMenu[]> {
  return client.get<SysMenu[]>('/menu/tree')
}

/** 按 id 查询菜单 */
export function fetchMenuByIdApi(client: RequestClient, menuId: string): Promise<SysMenu> {
  return client.get<SysMenu>(`/menu/getById/${menuId}`)
}

/** 新增菜单 */
export function addMenuApi(client: RequestClient, data: SysMenuForm): Promise<SysMenu> {
  return client.post<SysMenu>('/menu/add', data)
}

/** 编辑菜单 */
export function editMenuApi(client: RequestClient, data: SysMenuForm): Promise<boolean> {
  return client.put<boolean>('/menu/edit', data)
}

/** 批量删除菜单 */
export function deleteMenusApi(client: RequestClient, menuIds: string[]): Promise<boolean> {
  return client.delete<boolean>('/menu/del', { data: menuIds })
}

/* ------------------------------------------------------------------ *
 * 部门管理
 * ------------------------------------------------------------------ */

/** 系统部门（后端 SysDept） */
export interface SysDept extends SysEntityBase {
  id: string
  deptId: string
  parentId?: string | null
  deptName: string
  /** 机构编码 */
  orgCode?: string | null
  /** 机构类别 */
  orgCategory?: number | null
  /** 联系电话 */
  mobile?: string | null
  /** 地址 */
  address?: string | null
  /** 排序 */
  orderNo?: number | null
  /** 状态：`0` 正常 / `1` 停用 */
  status?: string | null
  /** 部门描述 */
  deptDesc?: string | null
  children?: SysDept[]
}

/** 新增 / 编辑部门的表单数据（编辑时带 deptId） */
export type SysDeptForm = Omit<SysDept, 'id' | 'deptId' | 'children'> & {
  id?: string
  deptId?: string
}

/** 获取部门树（上级部门选择、用户页的部门筛选共用这棵树） */
export function fetchDeptTreeApi(client: RequestClient): Promise<SysDept[]> {
  return client.get<SysDept[]>('/dept/tree')
}

/** 按 id 查询部门 */
export function fetchDeptByIdApi(client: RequestClient, deptId: string): Promise<SysDept> {
  return client.get<SysDept>(`/dept/getById/${deptId}`)
}

/** 新增部门 */
export function addDeptApi(client: RequestClient, data: SysDeptForm): Promise<SysDept> {
  return client.post<SysDept>('/dept/add', data)
}

/** 编辑部门 */
export function editDeptApi(client: RequestClient, data: SysDeptForm): Promise<boolean> {
  return client.put<boolean>('/dept/edit', data)
}

/** 批量删除部门 */
export function deleteDeptsApi(client: RequestClient, deptIds: string[]): Promise<boolean> {
  return client.delete<boolean>('/dept/del', { data: deptIds })
}

/* ------------------------------------------------------------------ *
 * 职务（岗位）管理
 * ------------------------------------------------------------------ */

/** 系统职务（后端 SysPost） */
export interface SysPost extends SysEntityBase {
  postId: string
  postCode: string
  postName: string
  /** 职级 */
  postRank?: string | null
  /** 排序 */
  orderNo?: number | null
  /** 状态：`0` 正常 / `1` 停用 */
  status?: string | null
  remark?: string | null
}

/** 新增 / 编辑职务的表单数据（编辑时带 postId） */
export type SysPostForm = Omit<SysPost, 'postId'> & { postId?: string }

/** 职务分页查询参数 */
export interface SysPostPageQuery extends SysPageQuery {
  postCode?: string
  postName?: string
  status?: string
}

/** 分页查询职务 */
export function fetchPostPageApi(
  client: RequestClient,
  params: SysPostPageQuery,
): Promise<SysPageResult<SysPost>> {
  return client.get<SysPageResult<SysPost>>('/post/page', { params })
}

/** 查询全部职务（下拉选项） */
export function fetchPostListApi(client: RequestClient): Promise<SysPost[]> {
  return client.get<SysPost[]>('/post/list')
}

/** 按 id 查询职务 */
export function fetchPostByIdApi(client: RequestClient, postId: string): Promise<SysPost> {
  return client.get<SysPost>(`/post/getById/${postId}`)
}

/** 新增职务 */
export function addPostApi(client: RequestClient, data: SysPostForm): Promise<SysPost> {
  return client.post<SysPost>('/post/add', data)
}

/** 编辑职务 */
export function editPostApi(client: RequestClient, data: SysPostForm): Promise<boolean> {
  return client.put<boolean>('/post/edit', data)
}

/** 批量删除职务 */
export function deletePostsApi(client: RequestClient, postIds: string[]): Promise<boolean> {
  return client.delete<boolean>('/post/del', { data: postIds })
}

/* ------------------------------------------------------------------ *
 * 角色管理
 * ------------------------------------------------------------------ */

/** 系统角色（后端 SysRole） */
export interface SysRole extends SysEntityBase {
  roleId: string
  roleName: string
  roleCode: string
  roleDesc?: string | null
  /** 排序 */
  orderNo?: number | null
  /** 状态：`0` 正常 / `1` 停用 */
  status?: string | null
}

/** 新增 / 编辑角色的表单数据（编辑时带 roleId） */
export type SysRoleForm = Omit<SysRole, 'roleId'> & { roleId?: string }

/** 角色分页查询参数 */
export interface SysRolePageQuery extends SysPageQuery {
  roleName?: string
  roleCode?: string
  status?: string
}

/** 角色菜单授权入参（后端「更新角色菜单」） */
export interface SysRoleMenuPayload {
  roleId: string
  menuIds: string[]
}

/** 分页查询角色 */
export function fetchRolePageApi(
  client: RequestClient,
  params: SysRolePageQuery,
): Promise<SysPageResult<SysRole>> {
  return client.get<SysPageResult<SysRole>>('/role/page', { params })
}

/** 查询全部角色（用户页的角色下拉共用） */
export function fetchRoleListApi(client: RequestClient): Promise<SysRole[]> {
  return client.get<SysRole[]>('/role/list')
}

/** 按 id 查询角色 */
export function fetchRoleByIdApi(client: RequestClient, roleId: string): Promise<SysRole> {
  return client.get<SysRole>(`/role/getById/${roleId}`)
}

/** 新增角色 */
export function addRoleApi(client: RequestClient, data: SysRoleForm): Promise<SysRole> {
  return client.post<SysRole>('/role/add', data)
}

/** 编辑角色 */
export function editRoleApi(client: RequestClient, data: SysRoleForm): Promise<boolean> {
  return client.put<boolean>('/role/edit', data)
}

/** 批量删除角色 */
export function deleteRolesApi(client: RequestClient, roleIds: string[]): Promise<boolean> {
  return client.delete<boolean>('/role/del', { data: roleIds })
}

/** 查询角色已授权的菜单 id 列表 */
export function fetchRoleMenuIdsApi(client: RequestClient, roleId: string): Promise<string[]> {
  return client.get<string[]>(`/roleMenu/getMenuIdByRoleId/${roleId}`)
}

/**
 * 保存角色菜单授权。
 *
 * 注意：后端批量插入实现不能接受空数组（会抛 SQL 语法错误），
 * 所以 UI 至少要选择一个菜单再调用。
 */
export function saveRoleMenuApi(client: RequestClient, data: SysRoleMenuPayload): Promise<unknown> {
  return client.post('/roleMenu/saveRoleMenu', data)
}

/* ------------------------------------------------------------------ *
 * 用户（账号）管理
 * ------------------------------------------------------------------ */

/** 系统用户（后端 SysUser） */
export interface SysUser extends SysEntityBase {
  userId: string
  username: string
  avatar?: string | null
  email?: string | null
  phone?: string | null
  tenantId?: string | null
  nickname?: string | null
  /** 性别：`1` 男 / `2` 女 / `0` 未知 */
  sex?: string | null
  /** 生日（`yyyy-MM-dd`） */
  birthday?: string | null
  /** 状态：`0` 正常 / `1` 停用 */
  status?: string | null
}

/** 新增用户时 userId 由后端生成 */
export type SysUserCreateForm = Omit<SysUser, 'userId'> & {
  userId?: string
  roleIds?: string[]
  deptIds?: string[]
  postIds?: string[]
}

/** 用户分页查询参数（roleIds / deptId 用于按角色、部门过滤） */
export interface SysUserPageQuery extends SysPageQuery {
  username?: string
  nickname?: string
  phone?: string
  email?: string
  status?: string
  roleIds?: string[]
  deptId?: string
}

/** 给用户绑定角色 */
export interface SysUserRolePayload {
  userIds: string[]
  roleId: string
}

/** 删除用户角色绑定 */
export interface SysUserRoleDeletePayload {
  userId: string
  roleId: string
}

/** 给用户绑定部门 */
export interface SysUserDeptPayload {
  userIds: string[]
  deptId: string
}

/** 删除用户部门绑定 */
export interface SysUserDeptDeletePayload {
  userId: string
  deptId: string
}

/** 修改密码入参（后端要求：≥8 位，且包含字母、数字、特殊字符） */
export interface SysChangePasswordPayload {
  username: string
  password: string
}

/** 分页查询用户 */
export function fetchUserPageApi(
  client: RequestClient,
  params: SysUserPageQuery,
): Promise<SysPageResult<SysUser>> {
  return client.get<SysPageResult<SysUser>>('/user/page', { params })
}

/** 按 id 查询用户 */
export function fetchUserByIdApi(client: RequestClient, userId: string): Promise<SysUser> {
  return client.get<SysUser>(`/user/getById/${userId}`)
}

/** 新增用户（roleIds / deptIds / postIds 会一起保存） */
export function addUserApi(client: RequestClient, data: SysUserCreateForm): Promise<SysUser> {
  return client.post<SysUser>('/user/add', data)
}

/** 编辑用户（roleIds / deptIds / postIds 传空数组表示清空） */
export function editUserApi(client: RequestClient, data: SysUserCreateForm): Promise<boolean> {
  return client.put<boolean>('/user/edit', data)
}

/** 批量删除用户 */
export function deleteUsersApi(client: RequestClient, userIds: string[]): Promise<boolean> {
  return client.delete<boolean>('/user/del', { data: userIds })
}

/** 修改用户状态（`0` 正常 / `1` 停用，用户接口支持 editState） */
export function editUserStateApi(
  client: RequestClient,
  data: SysEditStatePayload,
): Promise<boolean> {
  return client.put<boolean>('/user/editState', data)
}

/** 查询用户已绑定的角色 id */
export function fetchUserRoleIdsApi(client: RequestClient, userId: string): Promise<string[]> {
  return client.get<string[]>(`/user/role/getUserRoleIds/${userId}`)
}

/** 给用户绑定角色 */
export function addUserRoleApi(client: RequestClient, data: SysUserRolePayload): Promise<unknown> {
  return client.post('/user/role/addUserRole', data)
}

/** 删除用户角色绑定 */
export function deleteUserRoleApi(
  client: RequestClient,
  data: SysUserRoleDeletePayload,
): Promise<unknown> {
  return client.delete('/user/role/deleteUserRole', { data })
}

/** 查询用户已绑定的部门 id */
export function fetchUserDeptIdsApi(client: RequestClient, userId: string): Promise<string[]> {
  return client.get<string[]>(`/user/dept/getByUserId/${userId}`)
}

/** 给用户绑定部门 */
export function bindUserDeptApi(client: RequestClient, data: SysUserDeptPayload): Promise<unknown> {
  return client.post('/user/dept/bindUserDept', data)
}

/** 删除用户部门绑定 */
export function deleteUserDeptApi(
  client: RequestClient,
  data: SysUserDeptDeletePayload,
): Promise<unknown> {
  return client.delete('/user/dept/deleteUserDept', { data })
}

/** 查询用户已绑定的职务 id（返回的是职务主键） */
export function fetchUserPostIdsApi(client: RequestClient, userId: string): Promise<string[]> {
  return client.get<string[]>(`/user/post/getByUserId/${userId}`)
}

/** 修改用户密码 */
export function changeUserPasswordApi(
  client: RequestClient,
  data: SysChangePasswordPayload,
): Promise<boolean> {
  return client.put<boolean>('/user/changePassword', data)
}
