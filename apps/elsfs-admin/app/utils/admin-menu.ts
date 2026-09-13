import type { AppMenuLeaf, AppMenuItem } from '~/types/menu'

/**
 * 后台菜单树（mock 数据）。
 *
 * 菜单名称属于业务数据而不是界面文案，因此这里直接写中文，不走 i18n；
 * 接入真实后端后整棵树由接口替换即可，收藏 / 搜索逻辑无需改动。
 *
 * `path` 只在页面真实存在时填写，其余菜单统一落到占位页 `/menu/<id>`
 * （见 `resolveMenuPath`）。
 */
export const ADMIN_MENU: AppMenuItem[] = [
  {
    id: 'dashboard',
    name: '仪表盘',
    icon: 'odometer',
    children: [
      { id: 'dashboard-workbench', name: '工作台', icon: 'monitor', path: '/datshboard' },
      { id: 'dashboard-analysis', name: '数据分析', icon: 'data-analysis' },
      { id: 'dashboard-realtime', name: '实时监控', icon: 'data-line' },
    ],
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'setting',
    children: [
      { id: 'system-user', name: '用户管理', icon: 'user' },
      { id: 'system-role', name: '角色管理', icon: 'avatar' },
      { id: 'system-menu', name: '菜单权限', icon: 'menu' },
      { id: 'system-dept', name: '部门管理', icon: 'office-building' },
      { id: 'system-post', name: '岗位管理', icon: 'postcard' },
      { id: 'system-dict', name: '数据字典', icon: 'notebook' },
      { id: 'system-config', name: '参数设置', icon: 'tools' },
      { id: 'system-notice', name: '通知公告', icon: 'bell' },
      { id: 'system-job', name: '定时任务', icon: 'timer' },
      { id: 'system-file', name: '附件管理', icon: 'files' },
      { id: 'system-login-log', name: '登录日志', icon: 'key' },
      { id: 'system-operation-log', name: '操作日志', icon: 'tickets' },
      { id: 'system-monitor', name: '系统监控', icon: 'monitor' },
    ],
  },
  {
    id: 'content',
    name: '内容管理',
    icon: 'document',
    children: [
      { id: 'content-article', name: '文章列表', icon: 'document' },
      { id: 'content-category', name: '分类管理', icon: 'collection' },
      { id: 'content-tag', name: '标签管理', icon: 'price-tag' },
      { id: 'content-comment', name: '评论管理', icon: 'chat-dot-round' },
      { id: 'content-material', name: '素材库', icon: 'picture' },
      { id: 'content-column', name: '专栏管理', icon: 'reading' },
      { id: 'content-page', name: '页面装修', icon: 'magic-stick' },
      { id: 'content-recycle', name: '回收站', icon: 'delete' },
    ],
  },
  {
    id: 'goods',
    name: '商品管理',
    icon: 'goods',
    children: [
      { id: 'goods-list', name: '商品列表', icon: 'goods' },
      { id: 'goods-spec', name: '规格属性', icon: 'operation' },
      { id: 'goods-brand', name: '品牌管理', icon: 'medal' },
      { id: 'goods-category', name: '类目管理', icon: 'grid' },
      { id: 'goods-stock', name: '库存预警', icon: 'warning' },
      { id: 'goods-price', name: '价格策略', icon: 'discount' },
      { id: 'goods-supplier', name: '供应商管理', icon: 'list' },
      { id: 'goods-recycle', name: '商品回收站', icon: 'delete' },
    ],
  },
  {
    id: 'order',
    name: '订单中心',
    icon: 'shopping-cart',
    children: [
      { id: 'order-list', name: '订单列表', icon: 'list' },
      { id: 'order-refund', name: '退款审核', icon: 'refresh' },
      { id: 'order-ship', name: '发货管理', icon: 'van' },
      { id: 'order-service', name: '售后工单', icon: 'service' },
      { id: 'order-logistics', name: '物流跟踪', icon: 'location' },
      { id: 'order-bill', name: '对账单', icon: 'tickets' },
      { id: 'order-invoice', name: '发票管理', icon: 'postcard' },
      { id: 'order-abnormal', name: '异常订单', icon: 'warning' },
    ],
  },
  {
    id: 'marketing',
    name: '营销中心',
    icon: 'promotion',
    children: [
      { id: 'marketing-coupon', name: '优惠券', icon: 'discount' },
      { id: 'marketing-seckill', name: '秒杀活动', icon: 'alarm-clock' },
      { id: 'marketing-group', name: '拼团活动', icon: 'present' },
      { id: 'marketing-member', name: '会员卡', icon: 'wallet' },
      { id: 'marketing-points', name: '积分商城', icon: 'coin' },
      { id: 'marketing-distribution', name: '分销推广', icon: 'share' },
      { id: 'marketing-sms', name: '短信模板', icon: 'message' },
      { id: 'marketing-poster', name: '活动海报', icon: 'picture' },
    ],
  },
  {
    id: 'finance',
    name: '财务中心',
    icon: 'money',
    children: [
      { id: 'finance-income', name: '收入流水', icon: 'trend-charts' },
      { id: 'finance-withdraw', name: '提现审核', icon: 'wallet' },
      { id: 'finance-settlement', name: '结算单', icon: 'tickets' },
      { id: 'finance-cost', name: '成本核算', icon: 'coin' },
      { id: 'finance-invoice-title', name: '发票抬头', icon: 'postcard' },
      { id: 'finance-tax', name: '税务配置', icon: 'set-up' },
    ],
  },
  {
    id: 'report',
    name: '数据报表',
    icon: 'data-line',
    children: [
      { id: 'report-sales', name: '销售报表', icon: 'histogram' },
      { id: 'report-traffic', name: '流量分析', icon: 'pie-chart' },
      { id: 'report-profile', name: '用户画像', icon: 'user-filled' },
      { id: 'report-funnel', name: '转化漏斗', icon: 'filter' },
      { id: 'report-board', name: '实时看板', icon: 'data-board' },
      { id: 'report-export', name: '导出中心', icon: 'download' },
    ],
  },
  {
    id: 'dev',
    name: '开发者',
    icon: 'cpu',
    children: [
      { id: 'dev-key', name: '接口密钥', icon: 'key' },
      { id: 'dev-webhook', name: 'Webhook 配置', icon: 'link' },
      { id: 'dev-job', name: '定时任务', icon: 'timer' },
      { id: 'dev-env', name: '环境变量', icon: 'set-up' },
      { id: 'dev-generator', name: '代码生成', icon: 'magic-stick' },
      { id: 'dev-doc', name: '接口文档', icon: 'notebook' },
      { id: 'dev-log', name: '系统日志', icon: 'document-copy' },
    ],
  },
]

/** 叶子菜单：带父级信息，供收藏列表分组展示 */
export function flattenMenuTree(list: AppMenuItem[] = ADMIN_MENU): AppMenuLeaf[] {
  return list.flatMap(item =>
    item.children?.length
      ? item.children.map(child => ({
          ...child,
          parentId: item.id,
          parentName: item.name,
          parentIcon: item.icon,
        }))
      : [{
          ...item,
          parentId: item.id,
          parentName: item.name,
          parentIcon: item.icon,
        }],
  )
}

/**
 * 菜单图标方块配色：按一级菜单 id 稳定分配（换页 / 重新收藏都保持同色）。
 * 类名必须写成字面量，Tailwind 才能扫描到；亮度分开写，暗色下用 400/20 底 + 300 前景。
 */
const MENU_TILE_CLASSES: Record<string, string> = {
  dashboard: 'bg-sky-500/15 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300',
  system: 'bg-violet-500/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300',
  content: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300',
  goods: 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300',
  order: 'bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300',
  marketing: 'bg-cyan-500/15 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300',
  finance: 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300',
  report: 'bg-teal-500/15 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300',
  dev: 'bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300',
}

/** 方形图标块的底色：分类没登记时回落到中性色 */
export function menuTileClass(categoryId?: string): string {
  return (categoryId ? MENU_TILE_CLASSES[categoryId] : undefined) ?? 'bg-muted text-muted-foreground'
}

/** 菜单地址：没有真实页面的菜单统一落到占位页 */
export function resolveMenuPath(item: AppMenuItem): string {
  return item.path ?? `/menu/${item.id}`
}

/**
 * 按关键字过滤菜单树。
 * 父级命中时保留其全部子级，否则只保留命中的子级；无命中的分组整组丢弃。
 */
export function filterMenuTree(list: AppMenuItem[], keyword: string): AppMenuItem[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) {
    return list
  }

  return list
    .map((item) => {
      const children = item.children ?? []
      const nameMatch = item.name.toLowerCase().includes(kw)
      const matchedChildren = children.filter(child => child.name.toLowerCase().includes(kw))

      if (!children.length) {
        return nameMatch ? item : null
      }
      if (!nameMatch && !matchedChildren.length) {
        return null
      }
      return { ...item, children: nameMatch ? children : matchedChildren }
    })
    .filter((item): item is AppMenuItem => item !== null)
}
