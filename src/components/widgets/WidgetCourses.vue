<!-- src/components/widgets/WidgetCourses.vue -->
<template>
  <div class="widget-courses">
    <h2 class="widget-courses__heading">Ваши курсы</h2>

    <!-- Табы -->

    <!-- Табы → теперь через WidgetSegmentControl -->
    <WidgetSegmentControl v-model="currentTabId" class="widget-courses__tabs" :tabs="tabs" />
   

    <ul class="widget-courses__list" role="tabpanel">
      <li
        v-for="course in filteredCourses"
        :key="course.course_id"
        class="widget-courses__item"
        :class="{
          'widget-courses__item--expired': course.status === 'expired',
          'widget-courses__item--completed': course.status === 'completed',
        }"
      >
        <div class="widget-courses__content">
          <!-- widget-courses__name -->
          <h3 class="widget-courses__name">{{ course.course_name }}</h3>

          <p
            class="widget-courses__access"
            :class="{
              'widget-courses__access--success': course.status === 'active',
              'widget-courses__access--danger': course.status === 'inactive',
              'widget-courses__access--secondary': ['completed', 'expired'].includes(course.status),
            }"
          >
            {{ getCourseStatusText(course) }}
          </p>
        </div>

        <!-- Кнопка продления -->
        <BaseButton
          v-if="course.extension_available"
          variant="primary"
          type="contained"
          width="fit"
          @click="handleExtendCourse(course.course_id)"
        >
          Продлить доступ
        </BaseButton>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { addCourseExtensionToCart } from '@/api/cart'
import type { Course } from '@/api/types/profile'
import { getOlympBasketUrl } from '@/utils/env'
import WidgetSegmentControl from './WidgetSegmentControl.vue'

const props = defineProps<{
  courses: Course[]
}>()

const currentTabId = ref<string | number>('all')

const tabs = [
  { label: 'Все', id: 'all' },
  { label: 'Активные', id: 'active' },
  { label: 'Неактивные', id: 'inactive' },
  { label: 'Завершённые', id: 'completed' },
]

const filteredCourses = computed(() => {
  const map = {
    all: props.courses,
    active: props.courses.filter((c) => c.status === 'active'),
    inactive: props.courses.filter((c) => c.status === 'inactive'),
    completed: props.courses.filter((c) => c.status === 'completed' || c.status === 'expired'),
  }
  return map[currentTabId.value as keyof typeof map] || []
})

const handleExtendCourse = async (courseId: number): Promise<void> => {
  try {
    await addCourseExtensionToCart(courseId, 'monthly')
    window.open(getOlympBasketUrl(), '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('[WidgetCourses] Ошибка при продлении курса', error)
  }
}

const nonEmpty = (value: string | null | undefined): string | null => {
  if (value == null) return null
  const t = String(value).trim()
  return t.length > 0 ? t : null
}

const getCourseStatusText = (course: Course): string => {
  const accessUntil = nonEmpty(course.access_until)
  const materialsUntil = nonEmpty(course.course_materials_until)

  switch (course.status) {
    case 'active':
      if (accessUntil) return `Доступ к курсу до ${accessUntil}`
      if (materialsUntil) return `Материалы курса доступны до ${materialsUntil}`
      return 'Активный курс'
    case 'inactive':
      return 'Доступ к курсу ограничен. Требуется продление'
    case 'completed':
      if (accessUntil) return `Курс завершился, записи доступны до ${accessUntil}`
      if (materialsUntil) return `Курс завершился, материалы были доступны до ${materialsUntil}`
      return 'Курс завершился'
    case 'expired':
      return 'Курс завершился, учебные материалы больше недоступны'
    default:
      return ''
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-courses';
</style>
