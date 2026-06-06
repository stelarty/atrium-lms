<template>
  <WidgetCourseWorkers :course-id="courseId" />
</template>

<script setup lang="ts">
import WidgetCourseWorkers from '@/components/widgets/WidgetCourseWorkers.vue'

defineProps<{
  courseId: number
}>()
</script>
