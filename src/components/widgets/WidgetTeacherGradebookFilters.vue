<template>
  <div class="widget-teacher-gradebook-filters">
    <div class="widget-teacher-gradebook-filters-left">
      <WidgetPartSelector
        v-if="components.length > 0"
        :parts="components"
        :active-part="activeComponent"
        :display-mode="displayMode"
        @select="emit('select-component', $event)"
      />

      <div v-if="hasDifficultyLevels" class="widget-teacher-gradebook-filters__difficulty">
        <span class="widget-teacher-gradebook-filters__difficulty-label">Уровень</span>
        <WidgetSegmentControl
          :model-value="selectedDifficulty"
          :tabs="difficultyTabs"
          @update:model-value="emit('update:selectedDifficulty', $event as TeacherGradebookDifficultyFilter)"
        />
      </div>

      <div class="widget-teacher-gradebook-filters__selects">
        <BaseSelect
          :model-value="selectedLessonId"
          label="Занятие"
          placeholder="Выберите занятие"
          :options="lessonOptions"
          :disabled="lessonOptions.length === 0"
          teleport-panel
          @update:model-value="emit('update:selectedLessonId', normalizeSelectValue($event))"
        />

        <BaseSelect
          :model-value="selectedHomeworkId"
          label="Задание"
          placeholder="Выберите задание"
          :options="homeworkOptions"
          :disabled="homeworkOptions.length === 0"
          teleport-panel
          @update:model-value="emit('update:selectedHomeworkId', normalizeSelectValue($event))"
        />
      </div>
    </div>

    <div class="widget-teacher-gradebook-filters-right">
      <article v-if="homeworkHeader" class="widget-teacher-gradebook-filters__preview">
        <div class="widget-teacher-gradebook-filters__preview-head">
          <h3 class="widget-teacher-gradebook-filters__preview-title">
            {{ homeworkHeader.type_label }}
          </h3>
          <p class="widget-teacher-gradebook-filters__preview-deadline">
            Дедлайн:
            <span>{{ homeworkHeader.deadline_label }}</span>
          </p>
        </div>

        <template v-if="isTestHomework">
          <BaseButton
            type="contained"
            variant="primary"
            width="fit"
            target="_blank"
            :href="hasTestUrl ? homeworkHeader.test_url! : undefined"
            :disabled="!hasTestUrl"
          >
            Проверить работы
          </BaseButton>

          <div class="widget-teacher-gradebook-filters__test-notice" role="note">
            <BaseChip variant="additional">{{ testReviewNotice }}</BaseChip>
          </div>
        </template>

        <MaterialFileList
          v-else-if="templateFiles.length > 0"
          :files="templateFiles"
          :removable="false"
        />
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import WidgetPartSelector from '@/components/widgets/WidgetPartSelector.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'
import type { LmsCourseDisplayMode } from '@/types/course'
import type {
  TeacherGradebookDifficultyLevel,
  TeacherGradebookFilterComponent,
  TeacherGradebookHomeworkHeader,
} from '@/types/teacher-gradebook'
import type { MaterialFileItem } from '@/types/file-upload'
import { TEACHER_GRADEBOOK_TEST_REVIEW_NOTICE } from '@/utils/teacher-gradebook-labels'

type TeacherGradebookDifficultyFilter = TeacherGradebookDifficultyLevel

const props = defineProps<{
  components: TeacherGradebookFilterComponent[]
  displayMode: LmsCourseDisplayMode
  activeComponent: TeacherGradebookFilterComponent | null
  hasDifficultyLevels: boolean
  selectedDifficulty: TeacherGradebookDifficultyFilter
  difficultyTabs: Array<{ id: string | number; label: string }>
  selectedLessonId: number | null
  selectedHomeworkId: number | null
  lessonOptions: BaseSelectOption[]
  homeworkOptions: BaseSelectOption[]
  homeworkHeader: TeacherGradebookHomeworkHeader | null
  templateFiles: MaterialFileItem[]
}>()

const isTestHomework = computed(() => props.homeworkHeader?.type === 'test')

const hasTestUrl = computed(() => Boolean(props.homeworkHeader?.test_url?.trim()))

const testReviewNotice = TEACHER_GRADEBOOK_TEST_REVIEW_NOTICE

const emit = defineEmits<{
  (event: 'select-component', component: { id: number | string; title: string }): void
  (event: 'update:selectedDifficulty', value: TeacherGradebookDifficultyFilter): void
  (event: 'update:selectedLessonId', value: number | null): void
  (event: 'update:selectedHomeworkId', value: number | null): void
}>()

function normalizeSelectValue(value: string | number | null): number | null {
  if (value === null || value === '') return null
  return Number(value)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-teacher-gradebook-filters';
</style>
