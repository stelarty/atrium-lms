<template>
  <div class="program__edit-section">
    <div class="program__edit-header" @click="emit('cancel')">
      <BaseIconButton type="contained" variant="secondary">
        <UiIcon name="arrow" direction="left" size="24" />
      </BaseIconButton>
      <h3>Настройки раздела</h3>
    </div>
    <WidgetSectionCard title="Основное" bordered>
      <BaseInput
        v-model="title"
        label="Название раздела"
        placeholder="Введите название"
        class="program__input"
    /></WidgetSectionCard>

    <div class="program__edit-actions">
      <BaseButton v-if="part?.id" variant="error" type="contained" @click="emit('delete')">
        Удалить раздел
      </BaseButton>

      <BaseButton variant="primary" type="contained" @click="emit('save')">
        {{ part?.id ? 'Сохранить' : 'Создать' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import type { LmsCoursePart } from '@/types/course'

defineProps<{
  part: LmsCoursePart | null
}>()

const title = defineModel<string>('title', { required: true })

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save'): void
  (event: 'delete'): void
}>()
</script>
