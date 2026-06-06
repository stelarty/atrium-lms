<!-- src/views/auth/AuthHandler.vue -->
<template>
  <main>
    <AppRouteSkeleton v-if="!error" />

    <section v-else class="auth-handler__error">
      <div class="auth-handler__error-card">
        {{ error }}
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppRouteSkeleton from '@/components/ui/AppRouteSkeleton.vue'
import { buildPotokLoginUrl } from '@/auth/authConfig'

const router = useRouter()
const error = ref<string | null>(null)

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (code) {
    router.replace({
      path: '/auth/callback',
      query: { code, state: urlParams.get('state') || undefined },
    })
    return
  }

  error.value = 'Используйте вход через Поток'
  window.location.replace(buildPotokLoginUrl(window.location.origin))
})
</script>

<style scoped lang="scss">
.auth-handler__error {
  min-height: 100vh;
  @include flex-center();
  background: $surface-default-secondary;
  padding: $m8;
}

.auth-handler__error-card {
  @include font-body-text;
  width: min(100%, 360px);
  padding: $m10;
  border-radius: $m12;
  color: $text-default-danger;
  background: $surface-default-primary;
  text-align: center;
}
</style>
