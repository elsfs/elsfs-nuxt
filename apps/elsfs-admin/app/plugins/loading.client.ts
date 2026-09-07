// plugins/loading.client.ts
export default defineNuxtPlugin({
  name: 'loading-hide',
  setup() {
    onNuxtReady(() => {
      const loadingEl = document.getElementById('__app-loading__')

      if (loadingEl) {
        // 添加 hidden class 触发过渡
        loadingEl.classList.add('hidden')

        // 过渡结束后移除
        const onTransitionEnd = () => {
          loadingEl.remove()
          loadingEl.removeEventListener('transitionend', onTransitionEnd)
        }

        loadingEl.addEventListener('transitionend', onTransitionEnd)

        // 安全后备：如果过渡没触发，5秒后移除
        setTimeout(() => {
          if (document.getElementById('__app-loading__')) {
            loadingEl.remove()
          }
        }, 5000)
      }
    })
  },
})
