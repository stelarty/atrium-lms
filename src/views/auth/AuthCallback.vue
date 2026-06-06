<template>
  <div class="auth-callback" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { buildPotokLoginUrl } from '@/auth/authConfig'
import { pauseAuthTabSync } from '@/auth/authTabSync'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

/** Deep link from Potok `state`; generic `/`, `/student`, `/teacher` → profile decides role. */
const resolveStatePath = (state: string | null, isStaff: boolean): string | null => {
  if (!state) return null

  try {
    const path = decodeURIComponent(state)
    if (!path.startsWith('/')) return null

    if (path === '/' || path === '/student' || path === '/teacher') return null
    if (path.startsWith('/teacher') && !isStaff) return null
    if (path.startsWith('/student') && isStaff) return null

    return path
  } catch {
    return null
  }
}

const redirectAfterAuth = async (state: string | null): Promise<void> => {
  userStore.isInitialized = false
  await userStore.fetchProfileData()

  if (!userStore.profile?.courses?.length) {
    await router.replace('/access-denied')
    return
  }

  const isStaff = Boolean(userStore.profile.is_staff)
  const fromState = resolveStatePath(state, isStaff)

  if (fromState) {
    await router.replace(fromState)
    return
  }

  const home =
    userStore.preferredHomeRoute ?? (isStaff ? '/teacher' : '/student')
  await router.replace(home)
}

onMounted(async () => {
  pauseAuthTabSync()

  const code = typeof route.query.code === 'string' ? route.query.code : null
  const state = typeof route.query.state === 'string' ? route.query.state : null

  if (!code) {
    window.location.replace(buildPotokLoginUrl(window.location.origin))
    return
  }

  const ok = await authStore.exchangeAuthCode(code)
  if (!ok) {
    window.location.replace(buildPotokLoginUrl(window.location.origin))
    return
  }

  await redirectAfterAuth(state)
})
</script>

<style scoped>
.auth-callback {
  display: none;
}
</style>
