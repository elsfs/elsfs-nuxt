<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
import AuthTitle from './-auth-title.vue'

interface Props {
  /** 是否处于加载处理状态 */
  loading?: boolean
  /** 登录路径 */
  loginPath?: string
  /** 标题 */
  title?: string
  /** 描述 */
  subTitle?: string
  /** 按钮文本 */
  submitButtonText?: string
  /** 描述（二维码下方提示） */
  description?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 待编码进二维码的内容（演示用，仅决定图案变化） */
  qrcodeText?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  loading: false,
  showBack: true,
  loginPath: '/auth/login',
  submitButtonText: '',
  subTitle: '',
  title: '',
  qrcodeText: 'elsfs://login',
})

const { t } = useI18n()
const router = useRouter()

/**
 * 演示环境的二维码图形：本项目未引入真实二维码生成库，
 * 这里用一个确定性伪随机方块阵模拟二维码外观。
 * 接入真实登录时可替换为 `@vueuse/integrations/useQRCode(text)` 生成的 <img>。
 */
const SIZE = 21
function seededShade(seed: string, x: number, y: number): boolean {
  // 简单 hash：x/y/seed 混合后取奇偶，保证同一个 text 图案稳定
  const h = seed.split('').reduce((acc, c) => ((acc * 31 + c.charCodeAt(0)) % 100000) | 0, 7)
  return (h + x * 3 + y * 7 + x * y) % 3 !== 0
}
const cells = computed(() => {
  const list: { x: number, y: number, on: boolean }[] = []
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const border = x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1
      // 三个定位角
      const corner = (x < 6 && y < 6) || (x >= SIZE - 6 && y < 6) || (x < 6 && y >= SIZE - 6)
      list.push({ x, y, on: border || corner || seededShade(props.qrcodeText, x, y) })
    }
  }
  return list
})

function goToLogin(): void {
  router.push(props.loginPath)
}
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ title || `${t('login.welcomeBack')} 📱` }}
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || t('qrcodeLogin.subtitle') }}
        </slot>
      </template>
    </AuthTitle>

    <div class="flex-col-center mt-6">
      <!-- 演示二维码图形 -->
      <div class="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div
          class="grid gap-px"
          :style="{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }"
        >
          <template
            v-for="cell in cells"
            :key="`${cell.x}-${cell.y}`"
          >
            <span
              class="size-2.5"
              :class="cell.on ? 'bg-foreground' : 'bg-transparent'"
            />
          </template>
        </div>
      </div>

      <p class="mt-4 text-sm text-muted-foreground">
        <slot name="description">
          {{ description || t('qrcodeLogin.prompt') }}
        </slot>
      </p>
    </div>

    <ElButton
      v-if="showBack"
      type="default"
      plain
      class="mt-4 w-full"
      @click="goToLogin()"
    >
      {{ t('common.back') }}
    </ElButton>
  </div>
</template>
