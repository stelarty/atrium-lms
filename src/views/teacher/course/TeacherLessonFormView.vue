<template>
  <div class="teacher-lesson-form-view">
    <div class="teacher-lesson-form-view__inner">
      <div class="teacher-lesson-form-view__container">
        <div class="teacher-lesson-form-view__header">
          <BaseIconButton class="teacher-lesson-form-view__back-button" variant="secondary" type="contained"
            aria-label="Назад" @click="goBack">
            <UiIcon name="arrow" direction="left" size="20" />
          </BaseIconButton>
          <h2 class="teacher-lesson-form-view__title">
            {{ isEditing ? 'Редактирование занятия' : 'Создание нового занятия' }}
          </h2>
        </div>

        <div class="teacher-lesson-form-view__content">
          <WidgetSectionCard title="Основное">
            <BaseInput v-model="draft.title" label="Название занятия" placeholder="Введите название занятия"
              :error="fieldErrors.title" />

            <div class="teacher-lesson-form-view__grid">
              <BaseSelect v-model="draft.part" label="Блок / месяц" :options="partsOptions" :error="fieldErrors.part" />

              <BaseSelect v-if="courseStore.createdCourse?.display_mode === 'custom_sections'" v-model="draft.section"
                label="Раздел" :options="sectionsOptions" :error="fieldErrors.section" />

              <BaseInput v-model="draft.duration_minutes" label="Длительность (мин)" placeholder="90" type="number"
                :error="fieldErrors.duration_minutes" />
            </div>

            <BaseSelect v-if="hasDifficultyLevels" v-model="draft.difficulty_level" label="Уровень сложности"
              :options="difficultyOptions" :error="fieldErrors.difficulty_level" />
          </WidgetSectionCard>

          <WidgetSectionCard title="Тип занятия">
            <WidgetSegmentControl v-model="activeLessonType" :tabs="lessonTypeOptions" width="stretch" />

            <template v-if="activeLessonType === 'live'">
              <div class="teacher-lesson-form-view__grid">
                <BaseDate v-model="draft.date" label="Дата занятия" :error="fieldErrors.date" />

                <BaseInput v-model="draft.time" label="Время занятия" placeholder="12:00" type="time"
                  :error="fieldErrors.time" />
              </div>

              <BaseInput v-model="draft.lesson_url" label="Ссылка на конференцию"
                hint="Если оставить пустым, бекенд подставит ссылку из настроек курса" placeholder="https://example.com"
                type="url" :error="fieldErrors.lesson_url" />

              <BaseInput v-model="draft.recording_url" label="Ссылка на запись эфира"
                placeholder="https://example.com/recording" type="url" :error="fieldErrors.recording_url" />
            </template>

            <template v-else-if="activeLessonType === 'recording'">
              <BaseButton variant="secondary" type="contained" width="full" @click="triggerLessonVideoUpload">
                <span>Выбрать видеофайл</span>
              </BaseButton>
              <p class="teacher-lesson-form-view__hint">Форматы: AVI, MP4, MKV</p>

              <MaterialFileList
                :files="lessonVideoFiles"
                empty-text="Файл записи пока не выбран"
                @removeFile="removeLessonVideoFile"
              />
            </template>

            <template v-else>
              <div class="teacher-lesson-form-view__hint">Видео для этого занятия не требуется</div>
            </template>
          </WidgetSectionCard>

          <CourseSettingsMaterialsSection
            section-title="Материалы урока"
            :materials="lessonMaterialsList"
            :allowed-accept="materialsAccept"
            :is-saving="isLoading || hasActiveMaterialUploads"
            :upload-error="lessonMaterialsUploadError"
            show-teacher-comment
            v-model:teacher-comment="draft.teacher_comment"
            @upload-files="uploadLessonMaterialFiles"
            @remove-file="removeLessonMaterialFile"
          />

          <WidgetSectionCard title="Домашнее задание">
            <template #action>
              <BaseButton variant="secondary" type="contained" width="fit" @click="addHomework">
                Добавить
              </BaseButton>
            </template>
            <div v-for="(hw, index) in homeworks" :key="hw.id" class="teacher-lesson-form-view__homework-item">
              <WidgetSegmentControl v-model="hw.type" :tabs="homeworkTypeOptions" width="stretch" />

              <BaseInput v-if="hw.type === 'test'" v-model="hw.url" label="Ссылка на тест"
                placeholder="Вставьте ссылку на тест" type="url" :error="fieldErrors[`homework_${hw.id}_url`]" />

              <template v-else-if="hw.type === 'oral' || hw.type === 'written'">
                <BaseButton
                  variant="primary"
                  type="contained"
                  width="full"
                  :disabled="isUploadingHomeworkFiles"
                  @click="triggerHomeworkFileUpload(hw.id)"
                >
                  <span>Добавить файл</span>
                </BaseButton>

                <MaterialFileList
                  :files="hw.files"
                  empty-text="Файл пока не выбран"
                  @removeFile="removeHomeworkFile(hw.id, $event)"
                />

                <p
                  v-if="homeworkFileUploadError"
                  class="teacher-lesson-form-view__submit-error"
                >
                  {{ homeworkFileUploadError }}
                </p>
              </template>
              <template v-if="hw.type !== 'none'">
                <div class="teacher-lesson-form-view__grid">
                  <BaseDate v-model="hw.deadline_date" label="Дата дедлайна"
                    :error="fieldErrors[`homework_${hw.id}_deadline_date`]" />
                  <BaseInput v-model="hw.deadline_time" label="Время дедлайна" placeholder="12:00" type="time"
                    :error="fieldErrors[`homework_${hw.id}_deadline_time`]" />
                </div>

                <BaseInput v-model="hw.points" label="Максимальный балл за задание" type="number"
                  placeholder="Введите значение" :error="fieldErrors[`homework_${hw.id}_points`]" />
              </template>

              <BaseButton v-if="index > 0" variant="secondary" type="contained" width="fit"
                @click="removeHomework(hw.id)">
                Удалить
              </BaseButton>
            </div>
          </WidgetSectionCard>

          <input ref="fileInputRef" type="file" multiple class="teacher-lesson-form-view__file-input"
            @change="handleFileUpload" />

          <div class="teacher-lesson-form-view__actions">
            <BaseButton v-if="isEditing" width="adaptive" variant="error" type="contained"
              :disabled="isLoading || hasActiveMaterialUploads || isUploadingHomeworkFiles" @click="handleDelete">
              Удалить занятие
            </BaseButton>

            <div class="teacher-lesson-form-view__actions-primary">
              <BaseButton variant="primary" width="adaptive" type="contained"
                :disabled="isLoading || hasActiveMaterialUploads || isUploadingHomeworkFiles" @click="handleSave">
                <!-- <UiIcon name="publish" size="18" /> -->
                {{
                  isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать занятие'
                }}
              </BaseButton>
            </div>
          </div>

          <p v-if="hasActiveMaterialUploads" class="teacher-lesson-form-view__submit-error">
            Дождитесь окончания загрузки материалов
          </p>
          <p v-else-if="isUploadingHomeworkFiles" class="teacher-lesson-form-view__submit-error">
            Дождитесь окончания загрузки файлов домашнего задания
          </p>
          <p v-else-if="homeworkFileUploadError" class="teacher-lesson-form-view__submit-error">
            {{ homeworkFileUploadError }}
          </p>
          <p v-else-if="error" class="teacher-lesson-form-view__submit-error">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <BaseModal v-model="isDeleteConfirmOpen" title="Вы уверены, что хотите удалить занятие?" @close="isDeleteConfirmOpen = false">
      <template #footer>
        <div class="teacher-lesson-form-view__modal-footer">
          <BaseButton variant="secondary" type="contained" width="fit" @click="isDeleteConfirmOpen = false">
            Отмена
          </BaseButton>
          <BaseButton variant="error" type="contained" width="fit" @click="confirmLessonDelete">
            Удалить занятие
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseDate from '@/components/base/BaseDate.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import { useLessonCreation } from '@/composables/useLessonCreation'
import { useLessonHomeworkFiles } from '@/composables/useLessonHomeworkFiles'
import { useLessonMaterials } from '@/composables/useLessonMaterials'
import { applyProgramLessonsResponse } from '@/composables/useTeacherProgramLessons'
import { useCourseStore } from '@/stores/useCourseStore'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'
import type { LmsLessonType } from '@/types/lesson'
import type { MaterialFileItem } from '@/types/file-upload'
import CourseSettingsMaterialsSection from '@/views/teacher/course/_settings/_general/CourseSettingsMaterialsSection.vue'

type PendingUploadType = 'lesson_video' | 'homework_file'

const router = useRouter()
const route = useRoute()
const courseStore = useCourseStore()

const lessonId = computed(() => route.params.lessonId as string | undefined)
const courseId = computed(() => route.params.courseId as string | number)
const partIdFromQuery = computed(() => route.query.partId as string | undefined)
const isEditing = computed(() => Boolean(lessonId.value))

const isDeleteConfirmOpen = ref(false)

const {
  draft,
  isLoading,
  error,
  fieldErrors,
  hasDifficultyLevels,
  partsOptions,
  sectionsOptions,
  loadCourseStructure,
  loadLessonDetails,
  saveLesson,
  updateLessonData,
  removeLesson,
  homeworks,
  addHomework,
  removeHomework,
  appendHomeworkFiles,
  updateHomeworkFile,
  removeHomeworkFile,
} = useLessonCreation(courseId.value)

const numericCourseId = computed(() => Number(courseId.value))
const resolvedLessonId = computed(() =>
  lessonId.value ? Number(lessonId.value) : null,
)

const {
  materials: lessonMaterialsList,
  uploadError: lessonMaterialsUploadError,
  hasMaterialChanges,
  uploadFiles: uploadLessonMaterialFiles,
  removeFile: removeLessonMaterialFile,
  getFileIds: getLessonMaterialFileIds,
  setExistingMaterials,
  clearMaterials,
} = useLessonMaterials(numericCourseId, resolvedLessonId)

const {
  isUploading: isUploadingHomeworkFiles,
  error: homeworkFileUploadError,
  uploadFiles: uploadHomeworkFiles,
} = useLessonHomeworkFiles(numericCourseId)

const hasActiveMaterialUploads = computed(() =>
  lessonMaterialsList.value.some((item) =>
    ['pending', 'uploading', 'finalizing'].includes(item.status),
  ),
)

const materialsAccept =
  '.mp3,.mp4,.pdf,.ppt,.pptx,.txt,.doc,.docx,.rtf,.odt,.djvu,.jpg,.jpeg,.png,.webp,.gif'

const activeLessonType = ref<LmsLessonType>('live')
const pendingUploadType = ref<PendingUploadType>('lesson_video')
const pendingHomeworkId = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const lessonVideoFiles = ref<MaterialFileItem[]>([])

const lessonTypeOptions = [
  { label: 'Эфир', id: 'live' },
  { label: 'Запись', id: 'recording' },
  { label: 'Без видео', id: 'no_video' },
]

const homeworkTypeOptions = [
  { label: 'Тест', id: 'test' },
  { label: 'Устно', id: 'oral' },
  { label: 'Письменно', id: 'written' },
  { label: 'Без', id: 'none' },
]

const difficultyOptions: BaseSelectOption[] = [
  { value: 'easy', label: 'Легкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Сложный' },
]

watch(activeLessonType, (value) => {
  draft.lesson_type = value

  if (value !== 'live') {
    draft.date = null
    draft.time = ''
    draft.lesson_url = ''
    draft.recording_url = ''
  }
})

const createLocalFileItem = (file: File): MaterialFileItem => ({
  clientId: `${Date.now()}-${crypto.randomUUID()}`,
  originalName: file.name,
  fileUrl: URL.createObjectURL(file),
  extension: file.name.split('.').pop()?.toUpperCase() || 'FILE',
  progress: 100,
  status: 'done',
})

const openFilePicker = (type: PendingUploadType): void => {
  pendingUploadType.value = type
  fileInputRef.value?.click()
}

const triggerLessonVideoUpload = (): void => openFilePicker('lesson_video')
const triggerHomeworkFileUpload = (homeworkId: string): void => {
  pendingHomeworkId.value = homeworkId
  openFilePicker('homework_file')
}
const removeLessonVideoFile = (clientId: string): void => {
  lessonVideoFiles.value = lessonVideoFiles.value.filter((file) => file.clientId !== clientId)
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (files.length === 0) {
    pendingHomeworkId.value = null
    input.value = ''
    return
  }

  if (pendingUploadType.value === 'lesson_video') {
    const file = files[0]
    if (!file) return

    // TODO(backend files): заменить локальную имитацию на загрузку записи и поле/ID,
    // которое согласует бекенд для занятия типа recording.
    lessonVideoFiles.value = [createLocalFileItem(file)]
  }

  if (pendingUploadType.value === 'homework_file' && pendingHomeworkId.value) {
    const homeworkId = pendingHomeworkId.value

    await uploadHomeworkFiles(
      files,
      (items: MaterialFileItem[]) => appendHomeworkFiles(homeworkId, items),
      (clientId: string, patch: Partial<MaterialFileItem>) =>
        updateHomeworkFile(homeworkId, clientId, patch),
    )
  }

  pendingHomeworkId.value = null
  input.value = ''
}

const goBack = (): void => {
  router.back()
}

const handleSave = async (): Promise<void> => {
  if (hasActiveMaterialUploads.value || isUploadingHomeworkFiles.value) return

  // Защита от stale-вкладок: если в текущей вкладке материалы не трогали,
  // не отправляем materials и не перетираем актуальные связи на бэкенде.
  const shouldSendMaterials = !isEditing.value || hasMaterialChanges.value
  const materialIds = shouldSendMaterials ? getLessonMaterialFileIds() : undefined
  const programResponse = isEditing.value
    ? await updateLessonData(Number(lessonId.value), materialIds)
    : await saveLesson(materialIds)

  if (programResponse) {
    applyProgramLessonsResponse(numericCourseId.value, programResponse)
    router.back()
    return
  }

  if (error.value) {
    console.error('[TeacherLessonForm] Ошибка сохранения', error.value)
  }
}

const handleDelete = (): void => {
  if (!lessonId.value) return
  isDeleteConfirmOpen.value = true
}

const confirmLessonDelete = async (): Promise<void> => {
  if (!lessonId.value) return
  isDeleteConfirmOpen.value = false

  const programResponse = await removeLesson(Number(lessonId.value))
  if (programResponse) {
    applyProgramLessonsResponse(numericCourseId.value, programResponse)
    router.back()
    return
  }

  if (error.value) {
    console.error('[TeacherLessonForm] Ошибка удаления', error.value)
  }
}

async function loadLessonForEdit(id: string): Promise<void> {
  const lesson = await loadLessonDetails(id)
  if (!lesson) return

  activeLessonType.value = lesson.lesson_type

  if (lesson.materials?.length) {
    setExistingMaterials(lesson.materials)
  } else {
    clearMaterials()
  }
}

watch(
  [() => isEditing.value, () => lessonId.value],
  async ([editing, id]) => {
    if (!editing || !id) {
      clearMaterials()
      return
    }
    await loadLessonForEdit(id)
  },
  { immediate: true },
)

onMounted(async () => {
  await loadCourseStructure()

  if (partIdFromQuery.value) {
    draft.part = Number(partIdFromQuery.value)
  }
})
</script>

<style scoped lang="scss">
.teacher-lesson-form-view {
  width: 100%;
  max-width: 100%;
  border-radius: $m12;
  background: $surface-default-tertiary;

  &__inner {
    @include flex-center();
    @include responsive-prop(padding, ($m8, $m12, null));
  }

  &__container {
    @include flex-center(column, flex-start, flex-start);
    @include responsive-prop(gap, ($m8, $m12, null));
    width: 100%;
    max-width: 454px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $m4;
    width: 100%;
  }

  &__header {
    @include flex-center();
    gap: $m5;
  }

  &__title {
    @include font-titles-bodyheader;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $m4;
  }

  &__hint {
    @include font-body-caption();
    color: $text-default-secondary;
  }

  &__file-input {
    display: none;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $m6;
    margin-top: $m10;
  }

  &__actions-primary {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    flex: 1;
    gap: $m6;


  }

  &__homework-item {
    @include responsive-prop(padding, ($m8, $m12, null));
    display: flex;
    flex-direction: column;
    gap: $m8;
    border: 1px solid $surface-default-stroke;
    border-radius: $m8;
  }



  &__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $m3;
    width: 100%;
  }

  &__submit-error {
    @include font-body-caption();
    color: $text-default-danger;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .teacher-lesson-form-view {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column;
    }

    &__actions-primary {
      flex-direction: column;
    }
  }
}
</style>
