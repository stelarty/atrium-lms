<template>
  <section class="teacher-course-settings-view"
    :class="{ 'teacher-course-settings-view--roles': activeTab === 'roles' }">
    <WidgetSegmentControl v-model="activeTab" class="teacher-course-settings-view__segment" :tabs="settingsTabs" />

    <div class="teacher-course-settings-view__content">
      <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
        <template v-if="activeTab === 'general'">
          <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
            <Skeleton v-if="showGeneralSkeleton" type="rect" size="full" height="400px" animated variant="light" />
            <CourseSettingsGeneralTab v-else class="teacher-course-settings-view__general" />
            <!-- <CourseSettingsGeneralTab  class="teacher-course-settings-view__general" /> -->
          </Transition>
        </template>

        <template v-else-if="activeTab === 'roles'">
          <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
            <Skeleton v-if="showRolesSkeleton" type="rect" size="full" height="100px" animated variant="light" />
            <CourseSettingsRolesTab v-else :course-id="courseId" class="teacher-course-settings-view__roles" />
            <!-- <CourseSettingsRolesTab :course-id="courseId" class="teacher-course-settings-view__roles" /> -->
          </Transition>
        </template>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import CourseSettingsGeneralTab from './_settings/CourseSettingsGeneralTab.vue'
import CourseSettingsRolesTab from './_settings/CourseSettingsRolesTab.vue'
import {
  useTeacherCourseSettings,
  useTeacherCourseSettingsTabsLoader,
} from '@/composables/useTeacherCourseSettings'

const { activeTab, settingsTabs } = useTeacherCourseSettings()

const route = useRoute()
const courseId = computed(() => Number(route.params.id))

const { showGeneralSkeleton, showRolesSkeleton } = useTeacherCourseSettingsTabsLoader(
  courseId,
  activeTab,
)

const sectionMode = computed(() => route.query.sectionMode as string | undefined)
const sectionId = computed(() => route.query.sectionId as string | undefined)

watch([sectionMode, sectionId], ([newSectionMode, newSectionId]) => {
  if ((newSectionMode || newSectionId) && activeTab.value !== 'general') {
    activeTab.value = 'general'
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.teacher-course-settings-view {
  @include responsive-prop(padding, ($m8, $m12, null));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $m8;
  border-radius: $m8;
  background-color: $surface-default-tertiary;
  transition: background-color 0.6s ease-in-out;

  &--roles {
    background-color: $surface-default-primary;
  }

  &__segment {
    align-self: center;
  }

  &__content {
    width: 100%;
  }

  &__general {
    width: 100%;
    max-width: 394px;
    margin: 0 auto;
  }

  &__roles {
    width: 100%;
  }
}
</style>
