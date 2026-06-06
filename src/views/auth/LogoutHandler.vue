<!-- src/views/auth/LogoutHandler.vue -->
<template><div style="display: none"></div></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.clearSession()
  router.replace('/access-denied')
})
</script>
