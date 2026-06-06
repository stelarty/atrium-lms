<template>
  <section class="section">
    <div class="container">
      <h1>Design System — Components</h1>

      <ComponentBlock title="BaseButton">
        <BaseButton variant="primary" type="contained">Click</BaseButton>
        <BaseButton to="/profile" variant="secondary" type="contained">Router Link</BaseButton>
        <BaseButton href="https://example.com" target="_blank" variant="error" type="contained"
          >Link Blank</BaseButton
        >
        <BaseButton variant="primary" type="text">Click</BaseButton>
        <BaseButton to="/profile" variant="secondary" type="text">Router Link</BaseButton>
        <BaseButton href="https://example.com" target="_blank" variant="error" type="text"
          >Link Blank</BaseButton
        >
      </ComponentBlock>

      <ComponentBlock title="BaseIconButton">
        <BaseIconButton variant="primary"><UiIcon name="placeholder" size="24" /></BaseIconButton>
        <BaseIconButton to="/niger" variant="secondary"
          ><UiIcon name="placeholder" size="24"
        /></BaseIconButton>
        <BaseIconButton href="https://nigger.com" target="_blank" variant="error"
          ><UiIcon name="placeholder" size="24"
        /></BaseIconButton>
        <BaseIconButton variant="primary" type="text"
          ><UiIcon name="placeholder" size="24"
        /></BaseIconButton>
        <BaseIconButton to="/niger" variant="secondary" type="text"
          ><UiIcon name="placeholder" size="24"
        /></BaseIconButton>
        <BaseIconButton href="https://nigger.com" target="_blank" variant="error" type="text"
          ><UiIcon name="placeholder" size="24"
        /></BaseIconButton>
      </ComponentBlock>

      <ComponentBlock title="WidgetDropdown">
        <WidgetDropdown
          v-model="dropdownValueSingle"
          :groups="dropdownGroups"
          truncate
          placeholder="Обрезанный список"
        >
        </WidgetDropdown>
        <WidgetDropdown v-model="dropdownValueMultiple" :groups="dropdownGroups" multiple>
          <template #trigger>
            <BaseButton variant="primary" type="contained">Выбрать предмет →</BaseButton>
          </template>
        </WidgetDropdown>
      </ComponentBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ComponentBlock from '@/components/dev/ComponentBlock.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetDropdown from '@/components/widgets/WidgetDropdown.vue'
import type { DropdownGroup } from '@/components/widgets/WidgetDropdown.vue'

const dropdownValueSingle = ref(null)
const dropdownValueMultiple = ref([])

const dropdownGroups: DropdownGroup[]  = [
  {
    caption: 'Основные предметы',
    items: [
      {
        id: 1,
        label: 'Математика',
        leftIcon: 'person',
      },
      {
        id: 2,
        label: 'Русский язык',
        leftIcon: 'folder',
      },
      {
        id: 3,
        label: 'Английский язык',
        leftIcon: 'doubleArrow',
        rightIcon: 'arrow',
      },
    ],
  },
  {
    caption: 'Естественные науки',
    items: [
      {
        id: 4,
        label: 'Физика',
        leftIcon: 'placeholder',
      },
      {
        id: 5,
        label: 'Химия',
        leftIcon: 'placeholder',
        disabled: true, // disabled state
      },
      {
        id: 6,
        label: 'Биология с очень длинным названием предмета',
        leftIcon: 'placeholder',
      },
    ],
  },
  {
    caption: 'Пустая группа',
    items: [],
  },
]
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: start;

  &__block {
    display: flex;
    gap: 12px;
  }
}
</style>
