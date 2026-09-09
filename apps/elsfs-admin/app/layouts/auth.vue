<script setup lang="ts">
type AuthPanelMode = 'left' | 'center' | 'right'

const { t } = useI18n()

/** 认证面板形态：默认左侧表单 + 右侧 slogan；可切换居中或镜像 */
const authPanel = ref<AuthPanelMode>('left')
const authPanelLeft = computed(() => authPanel.value === 'left')
const authPanelRight = computed(() => authPanel.value === 'right')
const authPanelCenter = computed(() => authPanel.value === 'center')

/** 布局切换（左 / 中 / 右） */
function switchPanel(mode: AuthPanelMode): void {
  authPanel.value = mode
}

const currentYear = new Date().getFullYear()
</script>

<template>
  <div
    class="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300 select-none"
  >
    <!-- 顶部工具栏 -->
    <AuthToolbar
      :panel="authPanel"
      @change-panel="authPanel = $event"
    />

    <!-- 左侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelLeft"
      class="w-full lg:w-2/5"
      data-side="left"
    >
      <template #default>
        <slot />
      </template>
      <template #copyright>
        <div class="text-muted-foreground">
          © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
        </div>
      </template>
    </AuthenticationFormView>

    <!-- Logo -->
    <slot name="logo">
      <div
        class="absolute top-0 left-0 z-10 flex cursor-pointer"
        @click="switchPanel('left')"
      >
        <div class="mt-4 ml-4 flex items-center text-foreground sm:top-6 sm:left-6">
          <div class="mr-2.5 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <AppIcon
              name="medal"
              class="size-5"
            />
          </div>
          <p class="m-0 text-xl font-semibold">
            {{ t('common.appName') }}
          </p>
        </div>
      </div>
    </slot>

    <!-- 系统介绍（slogan 大图区：left 模式在右、right 模式在左） -->
    <div
      v-if="!authPanelCenter"
      class="relative hidden w-0 flex-1 lg:block"
      :class="authPanelRight ? 'lg:order-first' : ''"
    >
      <div class="absolute inset-0 size-full bg-background-deep dark:bg-[#070709]">
        <div class="login-background absolute inset-0" />
        <div class="relative flex size-full flex-col items-center justify-center px-8">
          <div class="flex h-40 w-64 items-center justify-center opacity-90">
            <AppIcon
              name="lucide--shield-check"
              class="size-28 text-primary drop-shadow-2xl"
            />
          </div>
          <h1 class="mt-6 text-center text-2xl font-semibold text-foreground lg:text-3xl">
            {{ t('common.brandTagline') }}
          </h1>
          <p class="mt-3 max-w-md text-center text-sm text-muted-foreground lg:text-base">
            {{ t('common.brandDescription') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 右侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelRight"
      class="w-full lg:w-2/5"
      data-side="right"
    >
      <template #default>
        <slot />
      </template>
      <template #copyright>
        <div class="text-muted-foreground">
          © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
        </div>
      </template>
    </AuthenticationFormView>

    <!-- 居中认证面板 -->
    <div
      v-if="authPanelCenter"
      class="relative flex w-full flex-1 items-center justify-center"
    >
      <div class="login-background absolute inset-0" />
      <AuthenticationFormView
        class="w-full pb-16 shadow-float shadow-primary/5 md:w-2/3 md:rounded-3xl lg:w-1/2 xl:w-[36%]"
        data-side="bottom"
      >
        <template #default>
          <slot />
        </template>
        <template #copyright>
          <div class="text-muted-foreground">
            © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
          </div>
        </template>
      </AuthenticationFormView>
    </div>
  </div>
</template>

<style>
/* ================= 认证表单：大气清晰的输入/按钮样式 =================
 * 作用于认证页面根容器 .auth-form，放大输入框、柔和边框与聚焦高亮。
 */
.auth-form .el-input__wrapper {
  min-height: 48px;
  border-radius: 10px;
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: box-shadow 0.2s ease;
}

.auth-form .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
}

.auth-form .el-input__wrapper.is-focus {
  box-shadow:
    0 0 0 1px var(--el-color-primary) inset,
    0 0 0 3px rgb(var(--el-color-primary-rgb) / 0.15);
}

.auth-form .el-input__inner {
  font-size: 15px;
}

.auth-form .el-input__prefix,
.auth-form .el-input__suffix {
  color: var(--el-text-color-placeholder);
}

/* 输入错误态 */
.auth-form .el-input.is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

/* 记住我 / 忘记密码 / 登录入口按钮字体一致 */
.auth-form .el-checkbox__label {
  font-size: 14px;
}

/* 顶部标签：清晰小号 */
.auth-form .el-form-item__label {
  height: auto;
  margin-bottom: 6px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  padding: 0;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-form .el-form-item:last-of-type {
  margin-bottom: 24px;
}

/* 字段内容错误文字 */
.auth-form .el-form-item__error {
  padding-top: 4px;
  font-size: 12px;
}

/* 提交按钮：更宽更高、主色背景 */
.auth-form .auth-submit {
  height: 48px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
}

/* ================= 认证页专用：封面面板背景光斑 ================= */
.login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 24%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}

.dark .login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 18%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}
</style>
