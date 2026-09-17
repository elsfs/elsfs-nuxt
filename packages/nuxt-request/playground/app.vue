<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
import { RequestClient } from 'nuxt-request/runtime'

const client = new RequestClient({ baseURL: '/api' })
console.log(client.getBaseUrl())
</script>
