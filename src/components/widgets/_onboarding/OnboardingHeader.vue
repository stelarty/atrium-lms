<!-- src/components/widgets/_onboarding/OnboardingHeader.vue -->
<template>
  <div class="widget-onboarding__header" @click="onToggle">
    <div class="widget-onboarding__image-wrapper" :class="{ 'widget-onboarding__image-wrapper--completed': allCompleted }">
      <img :src="headerImage" :alt="showArrow ? 'Добро пожаловать' : 'Вы прошли обучение и получили ачивку'" />
    </div>
    <div class="widget-onboarding__text">
      <h3 class="widget-onboarding__title" v-html="headerTitle"></h3>
      <p v-if="showSubtitle" class="widget-onboarding__subtitle">
        Пройдите небольшое задание,<br />чтобы получить уникальную ачивку
      </p>
    </div>

    <!-- Кнопка сворачивания -->
    <BaseIconButton v-if="showArrow" variant="secondary" type="contained"
      :ariaLabel="collapsed ? 'Развернуть онбординг' : 'Свернуть онбординг'" class="widget-onboarding__toggle">
      <UiIcon name="arrow" :direction="collapsed ? 'down' : 'up'" size="20" />
    </BaseIconButton>

    <!-- Крестик для закрытия -->
    <BaseIconButton v-if="allCompleted" variant="secondary" type="text" class="widget-onboarding__close"
      ariaLabel="Скрыть онбординг" :disabled="isClosing" @click.stop="onClose">
      <UiIcon name="close" size="20" />
    </BaseIconButton>
  </div>
</template>

<script setup lang="ts">
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

defineProps<{
  headerImage: string
  headerTitle: string
  showSubtitle: boolean
  showArrow: boolean
  allCompleted: boolean
  collapsed: boolean
  isClosing: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'close'): void
}>()

const onToggle = () => {
  emit('toggle')
}

const onClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-onboarding';
</style>
