<template>
  <div class="program__section-content">
    <p class="program__empty">Занятий пока нет,<br />давайте добавим новое.</p>
    <BaseButton type="contained" variant="primary" :disabled="disabled" @click="emit('add-lesson')">
      <span>Добавить занятие</span>
      <UiIcon name="add" size="18" />
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  (event: 'add-lesson'): void
}>()
</script>

<style scoped lang="scss">
.program__section-content {
  @include flex-center(column);
  min-height: 260px;
  gap: $m10;
  text-align: center;
}
</style>
