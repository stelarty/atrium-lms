<template>
  <div key="content" class="course-settings-general-tab">
    <CourseSettingsBasicsSection :draft-settings="draftSettings" :field-errors="fieldErrors"
      :subject-options="subjectOptions" />

    <CourseSettingsPaymentSection :draft-settings="draftSettings" :field-errors="fieldErrors"
      :payment-mode="paymentMode" :can-edit-parts-count="canEditPartsCount"
      :should-show-month-from="shouldShowMonthFrom" :parts-count-options="partsCountOptions"
      :month-options="monthOptions" :payment-tabs="paymentTabs" @payment-mode-update="handlePaymentModeUpdate" />

    <CourseSettingsMaterialsSection
      :materials="materials"
      :allowed-accept="allowedAccept"
      :is-saving="isSaving"
      :upload-error="materialsUploadError"
      @uploadFiles="uploadFiles"
      @removeFile="removeFile"
    />

    <CourseSettingsLinksSection
      :draft-settings="draftSettings"
      :field-errors="fieldErrors"
      @update-link="handleLinkUpdate"
    />

    <div class="course-settings-general-tab__actions">
      <BaseButton variant="primary" type="contained" :disabled="isSaving || hasActiveUploads" @click="handleSave">
        <UiIcon name="publish" size="18" />
        <span>{{ isSaving ? 'Сохранение...' : 'Сохранить настройки курса' }}</span>
      </BaseButton>

      <p v-if="error" class="course-settings-general-tab__submit-error">
        {{ error }}
      </p>
      <p v-else-if="hasActiveUploads" class="course-settings-general-tab__submit-error">
        Дождитесь окончания загрузки материалов
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useTeacherCourseGeneralTab } from '@/composables/useTeacherCourseSettings'
import CourseSettingsBasicsSection from './_general/CourseSettingsBasicsSection.vue'
import CourseSettingsLinksSection from './_general/CourseSettingsLinksSection.vue'
import CourseSettingsMaterialsSection from './_general/CourseSettingsMaterialsSection.vue'
import CourseSettingsPaymentSection from './_general/CourseSettingsPaymentSection.vue'

const route = useRoute()
const courseId = computed(() => Number(route.params.id))

const {
  draftSettings,
  fieldErrors,
  isSaving,
  error,
  subjectOptions,
  partsCountOptions,
  monthOptions,
  paymentMode,
  canEditPartsCount,
  shouldShowMonthFrom,
  paymentTabs,
  materials,
  materialsUploadError,
  allowedAccept,
  uploadFiles,
  removeFile,
  hasActiveUploads,
  handlePaymentModeUpdate,
  handleSave,
} = useTeacherCourseGeneralTab(courseId)

const handleLinkUpdate = (
  field: 'telegramChatLink' | 'vkChatInviteLink',
  value: string,
): void => {
  draftSettings[field] = value
}
</script>

<style scoped lang="scss">
.course-settings-general-tab {
  display: flex;
  flex-direction: column;
  gap: $m6;

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $m3;
    align-items: flex-start;
  }

  &__submit-error {
    @include font-body-caption();
    color: $text-default-danger;
  }
}

@media (max-width: 768px) {
  .course-settings-general-tab {
    &__actions :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
