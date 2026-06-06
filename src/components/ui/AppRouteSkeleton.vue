<template>
  <ProfilePageSkeleton v-if="skeletonType === 'profile'" />
  <CoursePageSkeleton v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CoursePageSkeleton from '@/components/ui/CoursePageSkeleton.vue'
import ProfilePageSkeleton from '@/components/ui/ProfilePageSkeleton.vue'

const route = useRoute()

const routePath = computed(() => {
  const currentPath = route.path && route.path !== '/' ? route.path : window.location.pathname
  if (currentPath && currentPath !== '/') return currentPath

  return localStorage.getItem('preferredHomeRoute') || currentPath
})

const skeletonType = computed<'course' | 'profile'>(() => {
  if (routePath.value.includes('/profile')) return 'profile'

  return 'course'
})
</script>
