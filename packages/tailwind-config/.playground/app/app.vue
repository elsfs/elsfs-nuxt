<script lang="ts" setup>
// 无需额外导入，直接使用类名即可
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl space-y-12">
      <!-- 1. 验证 @tailwindcss/typography -->
      <section>
        <h2 class="mb-4 text-xl font-bold">1. Typography 插件验证</h2>
        <article class="prose prose-lg prose-blue rounded-lg bg-white p-6 shadow">
          <h1>这是一篇测试文章</h1>
          <p>这段文字应该由 <code>@tailwindcss/typography</code> 自动美化排版。</p>
          <ul>
            <li>列表项一：字体、间距、颜色都会被优化</li>
            <li>列表项二：看起来会更专业、更易读</li>
          </ul>
          <blockquote>
            <p>引用块也会被美化，字体和边距都很舒服</p>
          </blockquote>
        </article>
      </section>

      <!-- 2. 验证 tw-animate-css -->
      <section>
        <h2 class="mb-4 text-xl font-bold">2. 动画库验证</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- 进入动画 -->
          <div
            class="animate-in fade-in slide-in-from-top-8 rounded-lg bg-blue-500 p-4 text-center text-white duration-700"
          >
            animate-in + fade-in + slide-in
          </div>

          <!-- 缩放动画 -->
          <div
            class="animate-in zoom-in fade-in rounded-lg bg-green-500 p-4 text-center text-white duration-700"
          >
            animate-in + zoom-in + fade-in
          </div>

          <!-- 预置动画：手风琴效果 -->
          <div class="col-span-2">
            <div
              class="accordion-down overflow-hidden rounded-lg bg-purple-500 p-4 text-center text-white"
              style="--radix-accordion-content-height: 60px"
            >
              accordion-down 动画（需配合 JS 切换）
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 验证 @iconify/tailwind4 -->
      <section>
        <h2 class="mb-4 text-xl font-bold">3. Iconify 图标验证</h2>
        <div class="flex flex-wrap gap-6 rounded-lg bg-white p-6 shadow">
          <!-- 使用 iconify 的图标，类名格式根据实际配置调整 -->
          <div class="flex flex-col items-center">
            <span class="icon-[mdi--home] text-4xl text-blue-600" />
            <span class="mt-2 text-sm">mdi:home</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="icon-[mdi--account] text-4xl text-green-600" />
            <span class="mt-2 text-sm">mdi:account</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="icon-[mdi--settings] text-4xl text-purple-600" />
            <span class="mt-2 text-sm">mdi:settings</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="icon-[mdi--heart] text-4xl text-red-600" />
            <span class="mt-2 text-sm">mdi:heart</span>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          ⚠️ 图标格式可能因 @iconify/tailwind4 配置不同而异，常见格式：<code
            >icon-[集合名--图标名]</code
          >
        </p>
      </section>

      <!-- 4. 组合验证：所有工具一起使用 -->
      <section>
        <h2 class="mb-4 text-xl font-bold">4. 组合验证</h2>
        <div
          class="prose prose-sm animate-in fade-in slide-in-from-bottom-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg duration-1000"
        >
          <div class="flex items-center gap-3">
            <span class="icon-[mdi--check-circle] text-3xl" />
            <div>
              <h3 class="m-0 font-bold text-white">所有工具集成成功！</h3>
              <p class="m-0 text-white/90">
                Typography（排版） + Animations（动画） + Icons（图标） 全部正常工作
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* scoped 样式，不会影响其他组件 */
</style>
