<script setup lang="ts">
/**
 * 分析页（后台首页）。
 *
 * `/` 会重定向到这里；页面上的指标、趋势与占比都是静态演示数据，
 * 后端提供统计接口后，把下面的常量换成接口返回值即可。
 * 折线图 / 环形图 / 进度条都用原生 SVG + CSS 实现，没有额外引入图表库。
 */
definePageMeta({
  layout: 'admin',
})

/* ---------- 指标卡片 ---------- */

const KPI_SOURCE = [
  {
    label: '总访问量',
    value: '128,430',
    delta: '12.4%',
    up: true,
    icon: 'lucide--eye',
    color: 'text-primary',
    trend: [42, 48, 45, 62, 58, 76, 82, 90],
  },
  {
    label: '新增用户',
    value: '3,286',
    delta: '8.1%',
    up: true,
    icon: 'lucide--users',
    color: 'text-sky-500',
    trend: [18, 22, 20, 27, 25, 31, 36, 34],
  },
  {
    label: '订单量',
    value: '2,148',
    delta: '3.6%',
    up: false,
    icon: 'lucide--shopping-cart',
    color: 'text-amber-500',
    trend: [54, 48, 52, 47, 44, 46, 40, 38],
  },
  {
    label: '销售额',
    value: '¥286,900',
    delta: '16.8%',
    up: true,
    icon: 'lucide--wallet',
    color: 'text-emerald-500',
    trend: [30, 36, 33, 44, 52, 49, 60, 68],
  },
] as const

/* ---------- 访问趋势 ---------- */

const RANGES = [
  { key: 'week', label: '近 7 天' },
  { key: 'month', label: '近 30 天' },
  { key: 'quarter', label: '本季度' },
] as const

type RangeKey = (typeof RANGES)[number]['key']

interface TrendPoint {
  label: string
  visits: number
  orders: number
}

const TREND_DATA: Record<RangeKey, TrendPoint[]> = {
  week: [
    { label: '周一', visits: 3240, orders: 1820 },
    { label: '周二', visits: 2860, orders: 1610 },
    { label: '周三', visits: 3510, orders: 1980 },
    { label: '周四', visits: 4120, orders: 2360 },
    { label: '周五', visits: 4680, orders: 2540 },
    { label: '周六', visits: 5240, orders: 2870 },
    { label: '周日', visits: 4860, orders: 2410 },
  ],
  month: [
    { label: '08-01', visits: 3260, orders: 1740 },
    { label: '08-05', visits: 4120, orders: 2180 },
    { label: '08-09', visits: 3890, orders: 2020 },
    { label: '08-13', visits: 4860, orders: 2560 },
    { label: '08-17', visits: 5230, orders: 2710 },
    { label: '08-21', visits: 6180, orders: 3240 },
    { label: '08-25', visits: 7420, orders: 3860 },
    { label: '08-29', visits: 6890, orders: 3520 },
  ],
  quarter: [
    { label: '1 月', visits: 14200, orders: 7860 },
    { label: '2 月', visits: 11800, orders: 6420 },
    { label: '3 月', visits: 18600, orders: 9840 },
    { label: '4 月', visits: 20400, orders: 11260 },
    { label: '5 月', visits: 22800, orders: 12680 },
    { label: '6 月', visits: 25100, orders: 14240 },
  ],
}

const activeRange = ref<RangeKey>('week')

const CHART_WIDTH = 640
const CHART_HEIGHT = 240
const CHART_PAD = { top: 16, right: 16, bottom: 30, left: 52 }
const TICK_COUNT = 4

/** 一组数值里的最大值（空数组按 0 处理） */
function maxOf(values: readonly number[]): number {
  return values.reduce((max, value) => Math.max(max, value), 0)
}

/** 一组数值里的最小值（空数组按 0 处理） */
function minOf(values: readonly number[]): number {
  return values.reduce((min, value) => Math.min(min, value), values.at(0) ?? 0)
}

/** 把坐标轴最大值换算成「1 / 1.5 / 2 / 2.5 / 5 / 10 × 10^n」这类好读的刻度步长 */
function niceStep(value: number): number {
  if (value <= 0) {
    return 1
  }
  const rough = value / TICK_COUNT
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const residual = rough / magnitude
  let level = 10
  if (residual <= 1) {
    level = 1
  } else if (residual <= 1.5) {
    level = 1.5
  } else if (residual <= 2) {
    level = 2
  } else if (residual <= 2.5) {
    level = 2.5
  } else if (residual <= 5) {
    level = 5
  }
  return level * magnitude
}

/** 坐标轴刻度：过万的数值用「万」简写，避免标签太长 */
function formatAxis(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}万`
  }
  return String(value)
}

/** 千分位数字（静态数据，服务端与客户端结果一致） */
function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

/** 折线：把数值序列换算成 SVG polyline 的 points 字符串 */
function polyline(
  values: readonly number[],
  toX: (index: number) => number,
  toY: (value: number) => number,
): string {
  return values.map((value, index) => `${toX(index).toFixed(1)},${toY(value).toFixed(1)}`).join(' ')
}

/** 面积：折线下面填充到基线的闭合路径 */
function areaPolygon(
  values: readonly number[],
  toX: (index: number) => number,
  toY: (value: number) => number,
  baselineY: number,
): string {
  const startX = toX(0).toFixed(1)
  const endX = toX(values.length - 1).toFixed(1)
  const baseline = baselineY.toFixed(1)
  return `M ${startX},${baseline} L ${polyline(values, toX, toY)} L ${endX},${baseline} Z`
}

/** 指标卡右侧的小型趋势图：同时给出折线与面积两条路径 */
function sparkline(values: readonly number[]): { line: string; area: string } {
  const width = 120
  const height = 40
  const padding = 3
  const max = maxOf(values)
  const min = minOf(values)
  const span = max - min || 1
  const coords = values.map((value, index) => {
    const x =
      values.length > 1
        ? padding + ((width - padding * 2) * index) / (values.length - 1)
        : width / 2
    const y = height - padding - ((value - min) / span) * (height - padding * 2)
    return { x: x.toFixed(1), y: y.toFixed(1) }
  })
  const first = coords.at(0)
  const last = coords.at(-1)
  if (!first || !last) {
    return { line: '', area: '' }
  }
  const baseline = (height - padding).toFixed(1)
  return {
    line: coords.map((point) => `${point.x},${point.y}`).join(' '),
    area: `M ${first.x},${baseline} L ${coords.map((point) => `${point.x},${point.y}`).join(' ')} L ${last.x},${baseline} Z`,
  }
}

const KPI_CARDS = KPI_SOURCE.map((card) => ({ ...card, spark: sparkline(card.trend) }))

const trendChart = computed(() => {
  const points = TREND_DATA[activeRange.value]
  const values = points.flatMap((point) => [point.visits, point.orders])
  const step = niceStep(maxOf(values))
  const axisMax = step * TICK_COUNT

  const plotLeft = CHART_PAD.left
  const plotRight = CHART_WIDTH - CHART_PAD.right
  const plotTop = CHART_PAD.top
  const plotBottom = CHART_HEIGHT - CHART_PAD.bottom
  const plotWidth = plotRight - plotLeft
  const plotHeight = plotBottom - plotTop

  const toX = (index: number): number => {
    if (points.length <= 1) {
      return plotLeft + plotWidth / 2
    }
    return plotLeft + (plotWidth * index) / (points.length - 1)
  }
  const toY = (value: number): number => plotBottom - (value / axisMax) * plotHeight

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => {
    const value = step * index
    return { value, y: toY(value), text: formatAxis(value) }
  })

  const visitValues = points.map((point) => point.visits)
  const orderValues = points.map((point) => point.orders)

  return {
    plotLeft,
    plotRight,
    ticks,
    labels: points.map((point, index) => ({ text: point.label, x: toX(index) })),
    lines: [
      {
        key: 'visits',
        name: '访问量',
        color: 'text-primary',
        dot: 'bg-primary',
        total: formatNumber(visitValues.reduce((sum, value) => sum + value, 0)),
        line: polyline(visitValues, toX, toY),
        area: areaPolygon(visitValues, toX, toY, plotBottom),
      },
      {
        key: 'orders',
        name: '下单量',
        color: 'text-sky-500',
        dot: 'bg-sky-500',
        total: formatNumber(orderValues.reduce((sum, value) => sum + value, 0)),
        line: polyline(orderValues, toX, toY),
        area: areaPolygon(orderValues, toX, toY, plotBottom),
      },
    ],
  }
})

/* ---------- 访问来源 ---------- */

const TRAFFIC_SOURCES = [
  { label: '直接访问', value: 4820, color: '#8b5cf6' },
  { label: '搜索引擎', value: 3210, color: '#0ea5e9' },
  { label: '外部链接', value: 1860, color: '#10b981' },
  { label: '社交媒体', value: 980, color: '#f59e0b' },
  { label: '邮件营销', value: 420, color: '#f43f5e' },
] as const

const trafficTotal = TRAFFIC_SOURCES.reduce((total, source) => total + source.value, 0)

const trafficSources = TRAFFIC_SOURCES.map((source) => ({
  ...source,
  percent: ((source.value / trafficTotal) * 100).toFixed(1),
}))

/** 环形图：把各来源占比拼成 conic-gradient */
const donutBackground = (() => {
  let cursor = 0
  const stops = TRAFFIC_SOURCES.map((source) => {
    const start = cursor
    cursor += (source.value / trafficTotal) * 100
    return `${source.color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})()

/* ---------- 渠道转化率 / 待办 ---------- */

const CHANNELS = [
  { label: '自然搜索', rate: 46, bar: 'bg-primary' },
  { label: '内容推荐', rate: 38, bar: 'bg-sky-500' },
  { label: '付费广告', rate: 27, bar: 'bg-emerald-500' },
  { label: '社交分享', rate: 19, bar: 'bg-amber-500' },
] as const

const TODO_ITEMS = [
  {
    title: '审核本周待发布的内容草稿',
    tag: '待处理',
    tagClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    time: '今天 14:00',
  },
  {
    title: '检查角色权限变更记录',
    tag: '待处理',
    tagClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    time: '今天 16:30',
  },
  {
    title: '整理数据源连接配置',
    tag: '进行中',
    tagClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    time: '明天 10:00',
  },
  {
    title: '导出上月的操作日志报表',
    tag: '已完成',
    tagClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    time: '昨天 18:00',
  },
] as const
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-6 sm:p-8">
    <!-- 页头 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold sm:text-2xl">分析页</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          核心指标、访问趋势与流量来源总览，当前为静态演示数据。
        </p>
      </div>
      <div class="text-muted-foreground flex items-center gap-1.5 text-xs">
        <AppIcon name="lucide--calendar" class="size-3.5" />
        数据更新于今天 09:30
      </div>
    </div>

    <!-- 指标卡片 -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in KPI_CARDS"
        :key="card.label"
        class="border-border bg-card rounded-xl border p-4"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-muted-foreground text-sm">{{ card.label }}</span>
          <span
            class="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg"
            :class="card.color"
          >
            <AppIcon :name="card.icon" fallback="data-line" class="size-4" />
          </span>
        </div>
        <div class="mt-3 flex items-end justify-between gap-2">
          <div class="min-w-0">
            <div class="text-2xl font-semibold tracking-tight">
              {{ card.value }}
            </div>
            <div
              class="mt-1 flex items-center gap-1 text-xs"
              :class="
                card.up
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              "
            >
              <AppIcon
                :name="card.up ? 'lucide--arrow-up' : 'lucide--arrow-down'"
                class="size-3.5"
              />
              <span>{{ card.delta }}</span>
              <span class="text-muted-foreground">较上期</span>
            </div>
          </div>
          <svg
            class="h-10 w-24 shrink-0"
            :class="card.color"
            viewBox="0 0 120 40"
            fill="none"
            aria-hidden="true"
          >
            <path :d="card.spark.area" fill="currentColor" class="opacity-10" />
            <path
              :d="card.spark.line"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 折线图 + 环形图 -->
    <div class="grid gap-4 xl:grid-cols-3">
      <section class="border-border bg-card rounded-xl border p-4 xl:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-foreground text-sm font-semibold">访问趋势</h2>
            <p class="text-muted-foreground mt-0.5 text-xs">访问量与下单量走势</p>
          </div>
          <div class="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
            <button
              v-for="range in RANGES"
              :key="range.key"
              type="button"
              class="rounded-md px-2.5 py-1 text-xs transition-colors"
              :class="
                activeRange === range.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeRange = range.key"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span
            v-for="series in trendChart.lines"
            :key="series.key"
            class="text-muted-foreground flex items-center gap-1.5 text-xs"
          >
            <span class="size-2 rounded-full" :class="series.dot" />
            {{ series.name }}
            <span class="text-foreground font-medium">{{ series.total }}</span>
          </span>
        </div>

        <svg
          class="mt-2 w-full"
          :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
          role="img"
          aria-label="访问趋势折线图"
        >
          <g v-for="tick in trendChart.ticks" :key="tick.value">
            <line
              :x1="trendChart.plotLeft"
              :x2="trendChart.plotRight"
              :y1="tick.y"
              :y2="tick.y"
              class="stroke-border"
              stroke-dasharray="4 4"
              stroke-width="1"
            />
            <text
              :x="trendChart.plotLeft - 10"
              :y="tick.y + 4"
              text-anchor="end"
              class="fill-muted-foreground"
              font-size="11"
            >
              {{ tick.text }}
            </text>
          </g>
          <g v-for="series in trendChart.lines" :key="series.key" :class="series.color">
            <path :d="series.area" fill="currentColor" class="opacity-10" />
            <polyline
              :points="series.line"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <text
            v-for="label in trendChart.labels"
            :key="label.text"
            :x="label.x"
            :y="CHART_HEIGHT - 8"
            text-anchor="middle"
            class="fill-muted-foreground"
            font-size="11"
          >
            {{ label.text }}
          </text>
        </svg>
      </section>

      <section class="border-border bg-card flex flex-col rounded-xl border p-4">
        <div>
          <h2 class="text-foreground text-sm font-semibold">访问来源</h2>
          <p class="text-muted-foreground mt-0.5 text-xs">近 7 天各渠道占比</p>
        </div>
        <div
          class="mt-4 flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row xl:flex-col"
        >
          <div
            class="relative size-36 shrink-0 rounded-full"
            :style="{ background: donutBackground }"
          >
            <div class="bg-card absolute inset-5 rounded-full" />
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-muted-foreground text-xs">总访问</span>
              <span class="text-lg font-semibold">{{ formatNumber(trafficTotal) }}</span>
            </div>
          </div>
          <ul class="w-full min-w-0 space-y-2">
            <li
              v-for="source in trafficSources"
              :key="source.label"
              class="flex items-center gap-2 text-xs"
            >
              <span class="size-2 shrink-0 rounded-full" :style="{ background: source.color }" />
              <span class="text-muted-foreground min-w-0 flex-1 truncate">{{ source.label }}</span>
              <span class="text-foreground font-medium">{{ source.percent }}%</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- 渠道转化率 + 待办 -->
    <div class="grid gap-4 xl:grid-cols-2">
      <section class="border-border bg-card rounded-xl border p-4">
        <h2 class="text-foreground text-sm font-semibold">渠道转化率</h2>
        <p class="text-muted-foreground mt-0.5 text-xs">各推广渠道从访问到下单的转化</p>
        <ul class="mt-4 space-y-3">
          <li v-for="channel in CHANNELS" :key="channel.label">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">{{ channel.label }}</span>
              <span class="text-foreground font-medium">{{ channel.rate }}%</span>
            </div>
            <div class="bg-muted mt-1.5 h-2 w-full overflow-hidden rounded-full">
              <div
                class="h-full rounded-full"
                :class="channel.bar"
                :style="{ width: channel.rate + '%' }"
              />
            </div>
          </li>
        </ul>
      </section>

      <section class="border-border bg-card rounded-xl border p-4">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-foreground text-sm font-semibold">本周待办</h2>
            <p class="text-muted-foreground mt-0.5 text-xs">需要跟进的事项</p>
          </div>
          <span class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
            {{ TODO_ITEMS.length }} 项
          </span>
        </div>
        <ul class="divide-border mt-2 divide-y">
          <li
            v-for="item in TODO_ITEMS"
            :key="item.title"
            class="flex items-start justify-between gap-3 py-2.5"
          >
            <div class="flex min-w-0 items-start gap-2">
              <span class="mt-1.5 size-1.5 shrink-0 rounded-full" :class="item.dot" />
              <span class="text-foreground min-w-0 truncate text-sm">{{ item.title }}</span>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span class="rounded-full px-1.5 py-0.5 text-[11px]" :class="item.tagClass">
                {{ item.tag }}
              </span>
              <span class="text-muted-foreground text-xs">{{ item.time }}</span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
