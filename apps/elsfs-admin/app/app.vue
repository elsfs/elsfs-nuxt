<script setup lang="ts">
</script>

<template>
  <!-- 首屏加载动画：位于根模板，SSR 首帧 HTML 即可见，
       由 plugins/loading.client.ts 在 Nuxt 就绪（onNuxtReady）后 fade 并移除 -->
  <div
    id="__app-loading__"
    class="loading"
  >
    <div class="loader" />
    <div class="title">
      应用名称
    </div>
  </div>

  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* ================= 首屏加载动画 ================= */
#__app-loading__ {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f4f7f9;
}

#__app-loading__.hidden {
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  transition: all 0.8s ease-out;
}

.dark #__app-loading__ {
  background: #0d0d10;
}

#__app-loading__ .title {
  margin-top: 66px;
  font-size: 28px;
  font-weight: 600;
  color: rgb(0 0 0 / 85%);
}

.dark #__app-loading__ .title {
  color: #fff;
}

#__app-loading__ .loader {
  position: relative;
  width: 48px;
  height: 48px;
}

#__app-loading__ .loader::before {
  position: absolute;
  top: 60px;
  left: 0;
  width: 48px;
  height: 5px;
  content: '';
  background: hsl(var(--primary, 210 100% 50%) / 50%);
  border-radius: 50%;
  animation: shadow-ani 0.5s linear infinite;
}

#__app-loading__ .loader::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: '';
  background: hsl(var(--primary, 210 100% 50%));
  border-radius: 4px;
  animation: jump-ani 0.5s linear infinite;
}

@keyframes jump-ani {
  15% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    border-bottom-right-radius: 40px;
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes shadow-ani {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1.2, 1);
  }
}

/* ================= 布局过渡动画 ================= */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  filter: grayscale(1);
}
</style>
