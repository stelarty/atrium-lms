<template>
  <BaseModal
    :model-value="modelValue"
    title="Проверка задания"
    wide
    variant="secondary"
    class="widget-teacher-gradebook-review-modal"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('close')"
  >
    <div v-if="submission" class="widget-teacher-gradebook-review">
        <section class="widget-teacher-gradebook-review__card">
          <h4 class="widget-teacher-gradebook-review__card-title">Работа студента</h4>
          <BaseButton
            type="contained"
            variant="secondary"
            width="fit"
            :disabled="!canDownloadStudentWork"
            @click="handleDownloadStudentWork"
          >
            Скачать работу
          </BaseButton>
        </section>

        <section class="widget-teacher-gradebook-review__card">
          <h4 class="widget-teacher-gradebook-review__card-title">Проверенное задание</h4>

          <div
            v-if="!draft.reviewFile"
            class="widget-teacher-gradebook-review__upload"
            :class="{ 'widget-teacher-gradebook-review__upload--dragging': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <img
              :src="fileUploadIllustration"
              alt=""
              class="widget-teacher-gradebook-review__upload-image"
              width="133"
              height="133"
            />
            <p class="widget-teacher-gradebook-review__upload-text">
              Перетащите файл с решением в эту область
              <br />
              или выберите с устройства
            </p>
            <BaseButton type="contained" variant="secondary" width="fit" @click="openFilePicker">
              Выбрать файл
            </BaseButton>
          </div>

          <MaterialFileList
            v-else
            :files="[draft.reviewFile]"
            removable
            @removeFile="handleRemoveReviewFile"
          />

          <input
            ref="fileInputRef"
            type="file"
            class="widget-teacher-gradebook-review__file-input"
            @change="handleFileChange"
          />
        </section>

        <section class="widget-teacher-gradebook-review__card">
          <h4 class="widget-teacher-gradebook-review__card-title">Комментарий к работе</h4>
          <BaseTextarea
            :model-value="draft.comment"
            placeholder="Оставьте комментарий к работе"
            @update:model-value="handleCommentChange"
          />
        </section>

        <section class="widget-teacher-gradebook-review__card">
          <div class="widget-teacher-gradebook-review__score-head">
            <h4 class="widget-teacher-gradebook-review__card-title">Баллы</h4>
            <BaseSwitcher
              :model-value="draft.withoutScore"
              label="Без оценки"
              class="widget-teacher-gradebook-review__score-switcher"
              @update:model-value="handleWithoutScoreChange"
            />
          </div>

          <div v-if="!draft.withoutScore" class="widget-teacher-gradebook-review__score-fields">
            <BaseInput
              :model-value="draft.score"
              label="Введите балл"
              type="number"
              placeholder="0"
              @update:model-value="handleScoreChange"
            />
            <BaseInput
              :model-value="draft.maxScore"
              label="Максимальный балл"
              type="number"
              placeholder="10"
              @update:model-value="handleMaxScoreChange"
            />
          </div>
        </section>

      <p v-if="error" class="widget-teacher-gradebook-review__error">{{ error }}</p>
    </div>

    <template #footer>
      <BaseButton
        type="contained"
        variant="primary"
        width="fit"
        :disabled="!canSave || saving"
        @click="emit('save')"
      >
        {{ saving ? 'Сохранение...' : saveButtonLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseSwitcher from '@/components/base/BaseSwitcher.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import fileUploadIllustration from '@/assets/images/file-upload.svg'
import type { MaterialFileItem } from '@/types/file-upload'
import type {
  TeacherGradebookReviewDraft,
  TeacherGradebookSubmission,
} from '@/types/teacher-gradebook'
import { canDownloadTeacherGradebookSubmission } from '@/utils/teacher-gradebook-labels'
import { downloadRemoteFile, fileNameFromUrl } from '@/utils/download-file'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    submission: TeacherGradebookSubmission | null
    draft: TeacherGradebookReviewDraft
    saving?: boolean
    error?: string | null
    canSave?: boolean
    saveButtonLabel?: string
  }>(),
  {
    saving: false,
    error: null,
    canSave: false,
    saveButtonLabel: 'Отметить как проверено',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'update:draft', value: TeacherGradebookReviewDraft): void
  (event: 'close'): void
  (event: 'save'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const canDownloadStudentWork = computed(() =>
  props.submission ? canDownloadTeacherGradebookSubmission(props.submission) : false,
)

function patchDraft(patch: Partial<TeacherGradebookReviewDraft>): void {
  emit('update:draft', { ...props.draft, ...patch })
}

function handleDownloadStudentWork(): void {
  const url = props.submission?.student_work_url
  if (!url) return

  const fallbackName = props.submission?.full_name
    ? `work-${props.submission.full_name}`
    : 'student-work'

  void downloadRemoteFile(url, fileNameFromUrl(url, fallbackName))
}

function openFilePicker(): void {
  fileInputRef.value?.click()
}

function setReviewFile(file: File): void {
  const extension = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
  const nextFile: MaterialFileItem = {
    clientId: `checked-${Date.now()}`,
    originalName: file.name,
    extension,
    progress: 100,
    status: 'done',
    fileUrl: URL.createObjectURL(file),
  }

  patchDraft({
    reviewFile: nextFile,
    pendingReviewUploadFile: file,
  })
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  setReviewFile(file)
  input.value = ''
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  setReviewFile(file)
}

function handleDragLeave(event: DragEvent): void {
  const related = event.relatedTarget as Node | null
  const current = event.currentTarget as HTMLElement
  if (related && current.contains(related)) return
  isDragging.value = false
}

function handleRemoveReviewFile(): void {
  patchDraft({
    reviewFile: null,
    pendingReviewUploadFile: null,
  })
}

function handleCommentChange(value: string): void {
  patchDraft({ comment: value })
}

function handleWithoutScoreChange(value: boolean): void {
  patchDraft({ withoutScore: value })
}

function handleScoreChange(value: string): void {
  patchDraft({ score: value })
}

function handleMaxScoreChange(value: string): void {
  patchDraft({ maxScore: value })
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-teacher-gradebook-review';
</style>
