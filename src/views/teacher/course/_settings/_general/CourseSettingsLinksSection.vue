<template>
  <WidgetSectionCard title="Ссылки на сообщества в Телеграм и VK">
    <BaseInput
      :model-value="draftSettings.telegramChatLink"
      label="Ссылка на учебную группу в Телеграм"
      placeholder="https://t.me/example"
      type="url"
      :error="fieldErrors.telegramChatLink"
      @update:model-value="emit('update-link', 'telegramChatLink', $event)"
    />

    <BaseInput
      :model-value="draftSettings.vkChatInviteLink"
      label="Ссылка на учебную группу в VK"
      placeholder="https://vk.me/join/example"
      type="url"
      :error="fieldErrors.vkChatInviteLink"
      @update:model-value="emit('update-link', 'vkChatInviteLink', $event)"
    />
  </WidgetSectionCard>
</template>

<script setup lang="ts">
import BaseInput from '@/components/base/BaseInput.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import type { CourseDraftSettings, CourseFieldErrors } from '@/types/course-draft'

defineProps<{
  draftSettings: CourseDraftSettings
  fieldErrors: CourseFieldErrors
}>()

const emit = defineEmits<{
  'update-link': [field: 'telegramChatLink' | 'vkChatInviteLink', value: string]
}>()
</script>
