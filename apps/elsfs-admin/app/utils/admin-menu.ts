import type { AdminMenuLeaf, AdminMenuItem, BackendMenu, BackendMenuResponse } from '~/types/menu'

/**
 * 后端菜单接口的 mock 响应（`{ code, data, error, message }`）。
 *
 * `data` 里的节点就是后端下发的结构（参考 vben / onehip）：
 * ```
 * { name, path, redirect, component, meta: { title, icon, order, affixTab, keepAlive, authority, ... }, children }
 * ```
 * - `meta.title` 可以是 i18n key（`demos.title`），也可以是字面文案；展示时用 `useMenuTitle()` 解析
 * - `meta.icon` 可以是 iconify 名（`mdi:cloud-key-outline`）或 Element Plus 短名（`user`），交给 `AppIcon`
 * - `meta.order` 决定同级排序；`meta.affixTab` 的菜单在多页签里固定不可关闭
 * - `meta.id` 是我们额外要求后端带的稳定 id（收藏只存它）；没带就退回 name / path
 * - `path` 指向真实页面，本仓库 mock 里只有 `/datshboard` 存在，其余会落到占位页 `/menu/<id>`
 *   （见 `useMenuPath`）
 *
 * 接真实接口时把这份常量换成 `$fetch<BackendMenuResponse>(...)` 即可，
 * 抽屉 / 搜索 / 收藏 / 多页签都不用改。
 */
export const ADMIN_MENU_RESPONSE: BackendMenuResponse = {
  code: 0,
  message: 'ok',
  error: null,
  data: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      meta: { id: 'dashboard', title: '仪表盘', icon: 'odometer', order: -1 },
      children: [
        {
          name: 'Overview',
          path: '/dashboard/overview',
          meta: { id: 'dashboard-overview', title: '概览', order: 0 },
          children: [
            {
              name: 'Workbench',
              path: '/datshboard',
              meta: { id: 'dashboard-workbench', title: '工作台', icon: 'monitor', affixTab: true },
            },
            {
              name: 'Realtime',
              path: '/dashboard/realtime',
              meta: { id: 'dashboard-realtime', title: '实时监控', icon: 'mdi:monitor-eye' },
            },
          ],
        },
        {
          name: 'DashboardReport',
          path: '/dashboard/report',
          meta: { id: 'dashboard-report', title: '统计分析', order: 1 },
          children: [
            {
              name: 'Analysis',
              path: '/dashboard/analysis',
              meta: { id: 'dashboard-analysis', title: '数据分析', icon: 'data-analysis' },
            },
            {
              name: 'Daily',
              path: '/dashboard/daily',
              meta: { id: 'dashboard-daily', title: '日报', icon: 'histogram' },
            },
            {
              name: 'Weekly',
              path: '/dashboard/weekly',
              meta: { id: 'dashboard-weekly', title: '周报', icon: 'trend-charts' },
            },
            {
              name: 'Monthly',
              path: '/dashboard/monthly',
              meta: { id: 'dashboard-monthly', title: '月报', icon: 'pie-chart' },
            },
          ],
        },
      ],
    },
    {
      name: 'System',
      path: '/system',
      meta: { id: 'system', title: '系统管理', icon: 'setting', order: 100 },
      children: [
        {
          name: 'SystemOrg',
          path: '/system/org',
          meta: { id: 'system-org', title: '组织架构' },
          children: [
            {
              name: 'SystemUser',
              path: '/system/user',
              meta: { id: 'system-user', title: '用户管理', icon: 'user' },
            },
            {
              name: 'SystemRole',
              path: '/system/role',
              meta: { id: 'system-role', title: '角色管理', icon: 'avatar' },
            },
            {
              name: 'SystemDept',
              path: '/system/dept',
              meta: { id: 'system-dept', title: '部门管理', icon: 'office-building' },
            },
            {
              name: 'SystemPost',
              path: '/system/post',
              meta: { id: 'system-post', title: '岗位管理', icon: 'postcard' },
            },
          ],
        },
        {
          name: 'SystemPermission',
          path: '/system/permission',
          meta: { id: 'system-permission', title: '权限配置', order: 1 },
          children: [
            {
              name: 'SystemMenu',
              path: '/system/menu',
              meta: { id: 'system-menu', title: '菜单权限', icon: 'menu' },
            },
            {
              name: 'SystemDataPermission',
              path: '/system/data-permission',
              meta: { id: 'system-data-permission', title: '数据权限', icon: 'lock' },
            },
            {
              name: 'SystemApiPermission',
              path: '/system/api-permission',
              meta: { id: 'system-api-permission', title: '接口权限', icon: 'key' },
            },
          ],
        },
        {
          name: 'SystemConfig',
          path: '/system/config',
          meta: { id: 'system-config-group', title: '系统配置', order: 2 },
          children: [
            {
              name: 'SystemParam',
              path: '/system/param',
              meta: { id: 'system-config', title: '参数设置', icon: 'tools' },
            },
            {
              name: 'SystemDict',
              path: '/system/dict',
              meta: { id: 'system-dict', title: '数据字典', icon: 'notebook' },
            },
            {
              name: 'SystemNotice',
              path: '/system/notice',
              meta: { id: 'system-notice', title: '通知公告', icon: 'bell' },
            },
            {
              name: 'SystemFile',
              path: '/system/file',
              meta: { id: 'system-file', title: '附件管理', icon: 'files' },
            },
            {
              name: 'SystemJob',
              path: '/system/job',
              meta: { id: 'system-job', title: '定时任务', icon: 'timer' },
            },
          ],
        },
        {
          name: 'SystemLog',
          path: '/system/log',
          meta: { id: 'system-log', title: '日志监控', order: 3 },
          children: [
            {
              name: 'SystemLoginLog',
              path: '/system/login-log',
              meta: { id: 'system-login-log', title: '登录日志', icon: 'key' },
            },
            {
              name: 'SystemOperationLog',
              path: '/system/operation-log',
              meta: { id: 'system-operation-log', title: '操作日志', icon: 'tickets' },
            },
            {
              name: 'SystemMonitor',
              path: '/system/monitor',
              meta: { id: 'system-monitor', title: '系统监控', icon: 'monitor' },
            },
          ],
        },
      ],
    },
    {
      name: 'Content',
      path: '/content',
      meta: { id: 'content', title: '内容管理', icon: 'document', order: 200 },
      children: [
        {
          name: 'ContentArticle',
          path: '/content/article',
          meta: { id: 'content-article-group', title: '文章内容' },
          children: [
            {
              name: 'ContentArticleList',
              path: '/content/article-list',
              meta: { id: 'content-article', title: '文章列表', icon: 'document' },
            },
            {
              name: 'ContentColumn',
              path: '/content/column',
              meta: { id: 'content-column', title: '专栏管理', icon: 'reading' },
            },
            {
              name: 'ContentPage',
              path: '/content/page',
              meta: { id: 'content-page', title: '页面装修', icon: 'magic-stick' },
            },
          ],
        },
        {
          name: 'ContentTaxonomy',
          path: '/content/taxonomy',
          meta: { id: 'content-taxonomy', title: '分类标签', order: 1 },
          children: [
            {
              name: 'ContentCategory',
              path: '/content/category',
              meta: { id: 'content-category', title: '分类管理', icon: 'collection' },
            },
            {
              name: 'ContentTag',
              path: '/content/tag',
              meta: { id: 'content-tag', title: '标签管理', icon: 'price-tag' },
            },
          ],
        },
        {
          name: 'ContentInteract',
          path: '/content/interact',
          meta: { id: 'content-interact', title: '互动素材', order: 2 },
          children: [
            {
              name: 'ContentComment',
              path: '/content/comment',
              meta: { id: 'content-comment', title: '评论管理', icon: 'chat-dot-round' },
            },
            {
              name: 'ContentMaterial',
              path: '/content/material',
              meta: { id: 'content-material', title: '素材库', icon: 'picture' },
            },
            {
              name: 'ContentRecycle',
              path: '/content/recycle',
              meta: { id: 'content-recycle', title: '回收站', icon: 'delete' },
            },
          ],
        },
      ],
    },
    {
      name: 'Goods',
      path: '/goods',
      meta: { id: 'goods', title: '商品管理', icon: 'goods', order: 300 },
      children: [
        {
          name: 'GoodsBase',
          path: '/goods/base',
          meta: { id: 'goods-base', title: '商品资料' },
          children: [
            {
              name: 'GoodsList',
              path: '/goods/list',
              meta: { id: 'goods-list', title: '商品列表', icon: 'goods' },
            },
            {
              name: 'GoodsSpec',
              path: '/goods/spec',
              meta: { id: 'goods-spec', title: '规格属性', icon: 'operation' },
            },
            {
              name: 'GoodsBrand',
              path: '/goods/brand',
              meta: { id: 'goods-brand', title: '品牌管理', icon: 'medal' },
            },
            {
              name: 'GoodsCategory',
              path: '/goods/category',
              meta: { id: 'goods-category', title: '类目管理', icon: 'grid' },
            },
          ],
        },
        {
          name: 'GoodsStock',
          path: '/goods/stock',
          meta: { id: 'goods-stock-group', title: '库存与价格', order: 1 },
          children: [
            {
              name: 'GoodsStockWarning',
              path: '/goods/stock-warning',
              meta: { id: 'goods-stock', title: '库存预警', icon: 'warning' },
            },
            {
              name: 'GoodsPrice',
              path: '/goods/price',
              meta: { id: 'goods-price', title: '价格策略', icon: 'discount' },
            },
            {
              name: 'GoodsSupplier',
              path: '/goods/supplier',
              meta: { id: 'goods-supplier', title: '供应商管理', icon: 'list' },
            },
            {
              name: 'GoodsRecycle',
              path: '/goods/recycle',
              meta: { id: 'goods-recycle', title: '商品回收站', icon: 'delete' },
            },
          ],
        },
      ],
    },
    {
      name: 'Order',
      path: '/order',
      meta: { id: 'order', title: '订单中心', icon: 'shopping-cart', order: 400 },
      children: [
        {
          name: 'OrderManage',
          path: '/order/manage',
          meta: { id: 'order-manage', title: '订单处理' },
          children: [
            {
              name: 'OrderList',
              path: '/order/list',
              meta: { id: 'order-list', title: '订单列表', icon: 'list' },
            },
            {
              name: 'OrderAbnormal',
              path: '/order/abnormal',
              meta: { id: 'order-abnormal', title: '异常订单', icon: 'warning' },
            },
            {
              name: 'OrderShip',
              path: '/order/ship',
              meta: { id: 'order-ship', title: '发货管理', icon: 'van' },
            },
            {
              name: 'OrderLogistics',
              path: '/order/logistics',
              meta: { id: 'order-logistics', title: '物流跟踪', icon: 'location' },
            },
          ],
        },
        {
          name: 'OrderAfter',
          path: '/order/after',
          meta: { id: 'order-after', title: '售后与财务', order: 1 },
          children: [
            {
              name: 'OrderService',
              path: '/order/service',
              meta: { id: 'order-service', title: '售后工单', icon: 'service' },
            },
            {
              name: 'OrderRefund',
              path: '/order/refund',
              meta: { id: 'order-refund', title: '退款审核', icon: 'refresh' },
            },
            {
              name: 'OrderBill',
              path: '/order/bill',
              meta: { id: 'order-bill', title: '对账单', icon: 'tickets' },
            },
            {
              name: 'OrderInvoice',
              path: '/order/invoice',
              meta: { id: 'order-invoice', title: '发票管理', icon: 'postcard' },
            },
          ],
        },
      ],
    },
    {
      name: 'Marketing',
      path: '/marketing',
      meta: { id: 'marketing', title: '营销中心', icon: 'promotion', order: 500 },
      children: [
        {
          name: 'MarketingPromo',
          path: '/marketing/promo',
          meta: { id: 'marketing-promo', title: '营销活动' },
          children: [
            {
              name: 'MarketingCoupon',
              path: '/marketing/coupon',
              meta: { id: 'marketing-coupon', title: '优惠券', icon: 'discount' },
            },
            {
              name: 'MarketingSeckill',
              path: '/marketing/seckill',
              meta: { id: 'marketing-seckill', title: '秒杀活动', icon: 'alarm-clock' },
            },
            {
              name: 'MarketingGroup',
              path: '/marketing/group',
              meta: { id: 'marketing-group', title: '拼团活动', icon: 'present' },
            },
            {
              name: 'MarketingPoster',
              path: '/marketing/poster',
              meta: { id: 'marketing-poster', title: '活动海报', icon: 'picture' },
            },
          ],
        },
        {
          name: 'MarketingMember',
          path: '/marketing/member',
          meta: { id: 'marketing-member-group', title: '会员运营', order: 1 },
          children: [
            {
              name: 'MarketingMemberCard',
              path: '/marketing/member-card',
              meta: { id: 'marketing-member', title: '会员卡', icon: 'wallet' },
            },
            {
              name: 'MarketingPoints',
              path: '/marketing/points',
              meta: { id: 'marketing-points', title: '积分商城', icon: 'coin' },
            },
            {
              name: 'MarketingDistribution',
              path: '/marketing/distribution',
              meta: { id: 'marketing-distribution', title: '分销推广', icon: 'share' },
            },
          ],
        },
        {
          name: 'MarketingTouch',
          path: '/marketing/touch',
          meta: { id: 'marketing-touch', title: '消息触达', order: 2 },
          children: [
            {
              name: 'MarketingSms',
              path: '/marketing/sms',
              meta: { id: 'marketing-sms', title: '短信模板', icon: 'message' },
            },
            {
              name: 'MarketingInsite',
              path: '/marketing/insite',
              meta: { id: 'marketing-insite', title: '站内信', icon: 'bell' },
            },
            {
              name: 'MarketingPush',
              path: '/marketing/push',
              meta: { id: 'marketing-push', title: '推送任务', icon: 'notification' },
            },
          ],
        },
      ],
    },
    {
      name: 'Finance',
      path: '/finance',
      meta: { id: 'finance', title: '财务中心', icon: 'money', order: 600 },
      children: [
        {
          name: 'FinanceFlow',
          path: '/finance/flow',
          meta: { id: 'finance-flow', title: '资金流水' },
          children: [
            {
              name: 'FinanceIncome',
              path: '/finance/income',
              meta: { id: 'finance-income', title: '收入流水', icon: 'trend-charts' },
            },
            {
              name: 'FinanceWithdraw',
              path: '/finance/withdraw',
              meta: { id: 'finance-withdraw', title: '提现审核', icon: 'wallet' },
            },
            {
              name: 'FinanceSettlement',
              path: '/finance/settlement',
              meta: { id: 'finance-settlement', title: '结算单', icon: 'tickets' },
            },
          ],
        },
        {
          name: 'FinanceConfig',
          path: '/finance/config',
          meta: { id: 'finance-config', title: '财务配置', order: 1 },
          children: [
            {
              name: 'FinanceCost',
              path: '/finance/cost',
              meta: { id: 'finance-cost', title: '成本核算', icon: 'coin' },
            },
            {
              name: 'FinanceInvoiceTitle',
              path: '/finance/invoice-title',
              meta: { id: 'finance-invoice-title', title: '发票抬头', icon: 'postcard' },
            },
            {
              name: 'FinanceTax',
              path: '/finance/tax',
              meta: { id: 'finance-tax', title: '税务配置', icon: 'set-up' },
            },
          ],
        },
      ],
    },
    {
      name: 'Report',
      path: '/report',
      meta: { id: 'report', title: '数据报表', icon: 'data-line', order: 700 },
      children: [
        {
          name: 'ReportSales',
          path: '/report/sales',
          meta: { id: 'report-sales-group', title: '销售报表' },
          children: [
            {
              name: 'ReportSalesList',
              path: '/report/sales-list',
              meta: { id: 'report-sales', title: '销售报表', icon: 'histogram' },
            },
            {
              name: 'ReportProduct',
              path: '/report/product',
              meta: { id: 'report-product', title: '商品报表', icon: 'goods' },
            },
            {
              name: 'ReportMember',
              path: '/report/member',
              meta: { id: 'report-member', title: '会员报表', icon: 'user-filled' },
            },
          ],
        },
        {
          name: 'ReportTraffic',
          path: '/report/traffic',
          meta: { id: 'report-traffic-group', title: '流量与转化', order: 1 },
          children: [
            {
              name: 'ReportTrafficList',
              path: '/report/traffic-list',
              meta: { id: 'report-traffic', title: '流量分析', icon: 'pie-chart' },
            },
            {
              name: 'ReportProfile',
              path: '/report/profile',
              meta: { id: 'report-profile', title: '用户画像', icon: 'user-filled' },
            },
            {
              name: 'ReportFunnel',
              path: '/report/funnel',
              meta: { id: 'report-funnel', title: '转化漏斗', icon: 'filter' },
            },
          ],
        },
        {
          name: 'ReportTools',
          path: '/report/tools',
          meta: { id: 'report-tools', title: '报表工具', order: 2 },
          children: [
            {
              name: 'ReportBoard',
              path: '/report/board',
              meta: { id: 'report-board', title: '实时看板', icon: 'data-board' },
            },
            {
              name: 'ReportExport',
              path: '/report/export',
              meta: { id: 'report-export', title: '导出中心', icon: 'download' },
            },
          ],
        },
      ],
    },
    {
      name: 'Dev',
      path: '/dev',
      meta: { id: 'dev', title: '开发者', icon: 'cpu', order: 800 },
      children: [
        {
          name: 'DevOpen',
          path: '/dev/open',
          meta: { id: 'dev-open', title: '开放能力' },
          children: [
            {
              name: 'DevKey',
              path: '/dev/key',
              meta: { id: 'dev-key', title: '接口密钥', icon: 'key' },
            },
            {
              name: 'DevWebhook',
              path: '/dev/webhook',
              meta: { id: 'dev-webhook', title: 'Webhook 配置', icon: 'link' },
            },
            {
              name: 'DevDoc',
              path: '/dev/doc',
              meta: { id: 'dev-doc', title: '接口文档', icon: 'notebook' },
            },
          ],
        },
        {
          name: 'DevOps',
          path: '/dev/ops',
          meta: { id: 'dev-ops', title: '运维工具', order: 1 },
          children: [
            {
              name: 'DevJob',
              path: '/dev/job',
              meta: { id: 'dev-job', title: '定时任务', icon: 'timer' },
            },
            {
              name: 'DevEnv',
              path: '/dev/env',
              meta: { id: 'dev-env', title: '环境变量', icon: 'set-up' },
            },
            {
              name: 'DevLog',
              path: '/dev/log',
              meta: { id: 'dev-log', title: '系统日志', icon: 'document-copy' },
            },
            {
              name: 'DevGenerator',
              path: '/dev/generator',
              meta: { id: 'dev-generator', title: '代码生成', icon: 'magic-stick' },
            },
          ],
        },
      ],
    },
    {
      // 这段就是后端接口样例的 Demos 分支：i18n key 标题 + iconify 图标 + order 排序
      // （`ic:` 图标集没装，AppIcon 会回落到兜底图标；`/demos/**` 页面不存在，会落到占位页）
      name: 'Demos',
      path: '/demos',
      redirect: '/demos/access',
      meta: {
        id: 'demos',
        icon: 'ic:baseline-view-in-ar',
        keepAlive: true,
        order: 1000,
        title: 'demos.title',
      },
      children: [
        {
          name: 'AccessDemos',
          path: '/demos/access',
          redirect: '/demos/access/page-control',
          meta: {
            id: 'demos-access',
            icon: 'mdi:cloud-key-outline',
            title: 'demos.access.backendPermissions',
          },
          children: [
            {
              name: 'AccessPageControlDemo',
              path: '/demos/access/page-control',
              component: '/demos/access/index',
              meta: {
                id: 'demos-access-page-control',
                icon: 'mdi:page-previous-outline',
                title: 'demos.access.pageAccess',
              },
            },
            {
              name: 'AccessButtonControlDemo',
              path: '/demos/access/button-control',
              component: '/demos/access/button-control',
              meta: {
                id: 'demos-access-button-control',
                icon: 'mdi:button-cursor',
                title: 'demos.access.buttonControl',
              },
            },
            {
              name: 'AccessMenuVisible403Demo',
              path: '/demos/access/menu-visible-403',
              component: '/demos/access/menu-visible-403',
              meta: {
                id: 'demos-access-menu-visible-403',
                authority: ['no-body'],
                icon: 'mdi:button-cursor',
                menuVisibleWithForbidden: true,
                title: 'demos.access.menuVisible403',
              },
            },
            {
              name: 'AccessSuperVisibleDemo',
              path: '/demos/access/super-visible',
              component: '/demos/access/super-visible',
              meta: {
                id: 'demos-access-super-visible',
                icon: 'mdi:button-cursor',
                title: 'demos.access.superVisible',
              },
            },
          ],
        },
      ],
    },
  ],
}

/** 菜单原始数据（后端 `data` 字段） */
export const ADMIN_MENU_RAW: BackendMenu[] = ADMIN_MENU_RESPONSE.data

/** 把后端节点抹平成内部节点：id / title / 排序 */
function normalizeNode(node: BackendMenu): AdminMenuItem {
  const meta = node.meta ?? {}
  const title = meta.title ?? node.name ?? node.path ?? ''
  // 真实接口的 id 在顶层，mock 里放在 meta.id
  const id = node.id ?? meta.id ?? node.name ?? node.path ?? title

  return {
    id,
    title,
    icon: meta.icon,
    path: node.path,
    redirect: node.redirect,
    meta,
    children: node.children?.length ? normalizeAdminMenus(node.children) : undefined,
  }
}

/**
 * 规范化后端菜单：按 `meta.order` 排序（没有 order 的当 0），并递归处理 children。
 * 后端换成真实接口后直接喂这个函数即可。
 */
export function normalizeAdminMenus(list: BackendMenu[]): AdminMenuItem[] {
  return [...list]
    .toSorted((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0))
    .map(normalizeNode)
}

/**
 * 展平出所有叶子菜单（最深层、可点击可收藏的项），
 * 同时带上所属一级菜单（子系统）与二级分组的信息。
 */
export function flattenMenuTree(list: AdminMenuItem[]): AdminMenuLeaf[] {
  const leaves: AdminMenuLeaf[] = []

  function walk(nodes: AdminMenuItem[], root: AdminMenuItem, group?: AdminMenuItem): void {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children, root, group ?? node)
        continue
      }
      leaves.push({
        ...node,
        rootId: root.id,
        rootTitle: root.title,
        rootIcon: root.icon,
        groupId: group?.id,
        groupTitle: group?.title,
      })
    }
  }

  for (const root of list) {
    if (root.children?.length) {
      walk(root.children, root)
      continue
    }
    leaves.push({ ...root, rootId: root.id, rootTitle: root.title, rootIcon: root.icon })
  }

  return leaves
}

/** 统计一棵菜单树里的叶子菜单数量 */
export function countMenuLeaves(list: AdminMenuItem[]): number {
  return list.reduce(
    (total, item) => total + (item.children?.length ? countMenuLeaves(item.children) : 1),
    0,
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
  return (
    (categoryId ? MENU_TILE_CLASSES[categoryId] : undefined) ?? 'bg-muted text-muted-foreground'
  )
}

/** 菜单地址：没有真实页面时统一落到占位页（真实路由判断在 `useMenuPath` 里） */
export function fallbackMenuPath(item: AdminMenuItem): string {
  return `/menu/${item.id}`
}

/**
 * 按关键字递归过滤菜单树（层级不限）。
 * 某一级名称命中时保留它的整棵子树，否则只保留命中的子级；整棵都没命中就丢弃。
 * 标题可能是 i18n key，所以这里额外接受一个「取显示名」的函数。
 */
export function filterMenuTree(
  list: AdminMenuItem[],
  keyword: string,
  toDisplay: (title: string) => string = (title) => title,
): AdminMenuItem[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) {
    return list
  }

  return list
    .map((item) => {
      if (toDisplay(item.title).toLowerCase().includes(kw)) {
        return item
      }
      const children = item.children ?? []
      if (!children.length) {
        return null
      }
      const matched = filterMenuTree(children, kw, toDisplay)
      return matched.length ? { ...item, children: matched } : null
    })
    .filter((item): item is AdminMenuItem => item !== null)
}
