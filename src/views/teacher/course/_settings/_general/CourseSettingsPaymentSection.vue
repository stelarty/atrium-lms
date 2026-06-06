<template>
  <WidgetSectionCard
    title="Настройки по оплате"
    description="Настройте, как курс должен делиться, для удобной оплаты по частям"
  >
    <WidgetSegmentControl
      :model-value="paymentMode"
      class="course-settings-payment-section__segment"
      :tabs="paymentTabs"
      width="stretch"
      @update:model-value="emit('payment-mode-update', $event)"
    />

    <BaseSelect
      v-if="canEditPartsCount"
      v-model="draftSettings.partsCount"
      :label="paymentMode === 'months' ? 'Количество месяцев' : 'Количество блоков'"
      placeholder="Выберите количество"
      :options="partsCountOptions"
      :error="fieldErrors.partsCount"
    />

    <BaseSelect
      v-if="shouldShowMonthFrom"
      v-model="draftSettings.monthFrom"
      label="Стартовый месяц"
      placeholder="Выберите месяц"
      :options="monthOptions"
      :error="fieldErrors.monthFrom"
    />

    <BaseSwitcher
      v-model="draftSettings.allowSectionSplit"
      label="Деление на разделы"
    />

    <BaseSwitcher v-model="draftSettings.trialPeriod" label="Пробный период" />
  </WidgetSectionCard>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseSwitcher from '@/components/base/BaseSwitcher.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'
import type { CourseDraftSettings, CourseFieldErrors } from '@/types/course-draft'

type PaymentMode = 'none' | 'blocks' | 'months'

defineProps<{
  draftSettings: CourseDraftSettings
  fieldErrors: CourseFieldErrors
  paymentMode: PaymentMode
  canEditPartsCount: boolean
  shouldShowMonthFrom: boolean
  partsCountOptions: BaseSelectOption[]
  monthOptions: BaseSelectOption[]
  paymentTabs: Array<{ id: PaymentMode; label: string }>
}>()

const emit = defineEmits<{
  (event: 'payment-mode-update', value: string | number): void
}>()
</script>

<style scoped lang="scss">
.course-settings-payment-section {
  &__segment {
    align-self: flex-start;
  }
}
</style>
