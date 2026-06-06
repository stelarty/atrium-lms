<!-- src/views/common/HomeRedirect.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import AppRouteSkeleton from '@/components/ui/AppRouteSkeleton.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

onMounted(async () => {
  // 1. Если есть кэшированный маршрут → используем его сразу
  if (userStore.preferredHomeRoute) {
    await router.replace(userStore.preferredHomeRoute)
    return
  }

  if (!authStore.isAuthenticated) {
    await router.replace('/access-denied')
    return
  }

  // 3. Загружаем профиль → это установит preferredHomeRoute
  await userStore.fetchProfileData()

  const target = userStore.profile?.courses?.length
    ? userStore.preferredHomeRoute!
    : '/access-denied'

  await router.replace(target)
})
</script>

<template>
  <AppRouteSkeleton />
</template>
