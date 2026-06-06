<!-- App.vue -->
<template>
  <div class="app">
    <AppRouteSkeleton v-if="!isRouterReady && !isAuthCallbackPage" />

    <RouterView v-else />

    <!-- <AppCookieNotice /> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppRouteSkeleton from '@/components/ui/AppRouteSkeleton.vue'
import AppCookieNotice from '@/components/AppCookieNotice.vue'

const router = useRouter()
const isRouterReady = ref(false)
const isAuthCallbackPage = computed(() => window.location.pathname.includes('/auth/callback'))

onMounted(async () => {
  await router.isReady()
  isRouterReady.value = true
})
</script>
