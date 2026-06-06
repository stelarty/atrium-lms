<template>
  <WidgetSectionCard :title="sectionTitle">
    <MaterialFileList
      :files="materials"
      empty-text="Материалов пока нет"
      @removeFile="emit('removeFile', $event)"
    />

    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="allowedAccept"
      class="course-settings-materials-section__file-input"
      @change="handleFileChange"
    />

    <BaseButton
      variant="secondary"
      type="contained"
      width="fit"
      :disabled="isSaving"
      @click="fileInput?.click()"
    >
      <span>Добавить файл</span>
    </BaseButton>

    <p v-if="uploadError" class="course-settings-materials-section__upload-error">
      {{ uploadError }}
    </p>

    <WidgetLessonTeacherComment
      v-if="showTeacherComment"
      v-model="teacherCommentModel"
      :disabled="isSaving"
    />
  </WidgetSectionCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import WidgetLessonTeacherComment from '@/components/widgets/WidgetLessonTeacherComment.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import type { MaterialFileItem } from '@/types/file-upload'

const props = withDefaults(
  defineProps<{
    materials: MaterialFileItem[]
    allowedAccept: string
    isSaving: boolean
    uploadError?: string | null
    /** Заголовок блока (по умолчанию — для настроек курса) */
    sectionTitle?: string
    showTeacherComment?: boolean
    teacherComment?: string
  }>(),
  {
    sectionTitle: 'Полезные материалы',
    showTeacherComment: false,
    teacherComment: '',
    uploadError: null,
  },
)

const emit = defineEmits<{
  (event: 'uploadFiles', files: FileList): void
  (event: 'removeFile', clientId: string): void
  (event: 'update:teacherComment', value: string): void
}>()

const teacherCommentModel = computed({
  get: () => props.teacherComment,
  set: (value: string) => emit('update:teacherComment', value),
})

const fileInput = ref<HTMLInputElement | null>(null)

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emit('uploadFiles', input.files)
  }
  input.value = ''
}
</script>

<style scoped lang="scss">
.course-settings-materials-section {
  &__file-input {
    display: none;
  }

  &__upload-error {
    @include font-body-caption();
    color: $text-default-danger;
  }
}
</style>
