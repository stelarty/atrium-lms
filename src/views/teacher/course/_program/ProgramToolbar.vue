<template>
  <div class="program__toolbar">
    <BaseInput
      class="program__search"
      type="search"
      placeholder="Поиск..."
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <div v-if="!isMobile" class="program__actions">
      <BaseButton type="contained" variant="primary" :disabled="disabled" @click="emit('add-lesson')">
        <span>Добавить занятие</span>
      </BaseButton>

      <BaseButton
        v-if="canEditPart"
        type="contained"
        variant="secondary"
        :disabled="disabled"
        @click="emit('edit-part')"
      >
        <span>Настройки раздела</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

defineProps<{
  canEditPart: boolean
  disabled: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'add-lesson'): void
  (event: 'edit-part'): void
  (event: 'update:modelValue', value: string): void
}>()

const { isMobile } = useBreakpoints()
</script>
