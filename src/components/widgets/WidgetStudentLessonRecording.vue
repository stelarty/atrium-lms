<template>
  <section class="widget-student-lesson-recording" aria-label="Запись занятия">
    <div class="widget-student-lesson-recording__preview" aria-hidden="true">
      <img
        class="widget-student-lesson-recording__preview-image"
        :src="recordingPreviewImage"
        alt=""
        width="80"
        height="56"
      />
    </div>

    <p class="widget-student-lesson-recording__title">Урок доступен в записи по ссылке</p>

    <BaseChip
      class="widget-student-lesson-recording__link"
      variant="additional"
      :href="recordingUrl"
      :title="recordingUrl"
    >
      {{ linkLabel }}
    </BaseChip>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChip from '@/components/base/BaseChip.vue'
import recordingPreviewImage from '@/assets/images/lesson-recording-preview.png'
import { formatStudentLessonRecordingLinkLabel } from '@/utils/student-lesson-recording'

const props = defineProps<{
  recordingUrl: string
}>()

const linkLabel = computed(() => formatStudentLessonRecordingLinkLabel(props.recordingUrl))
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-student-lesson-recording.scss';
</style>
