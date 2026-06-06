<template>
  <ProfilePageSkeleton />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfilePageSkeleton from '@/components/ui/ProfilePageSkeleton.vue'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const role = localStorage.getItem('role')
  const profileRouteName = role === 'teacher' ? 'teacher-profile' : 'profile'

  await router.replace({
    name: profileRouteName,
    query: {
      email_change_uid: String(route.params.uid || ''),
      email_change_token: String(route.params.token || ''),
      email: route.query.email,
    },
  })
})
</script>
