<!-- src/components/widgets/WidgetOnboarding.vue -->
<template>
  <Transition name="slide">
    <div v-if="isLoaded && shouldShow" class="widget-onboarding"
      :class="{ 'widget-onboarding--collapsed': collapsed, 'widget-onboarding--completed': allCompleted }">
      <OnboardingHeader :headerImage="headerImage" :headerTitle="headerTitle" :showSubtitle="showSubtitle"
        :showArrow="showArrow" :allCompleted="allCompleted" :collapsed="collapsed" :isClosing="isClosing"
        @toggle="toggle" @close="dismissWithSeen" />

      <OnboardingTasks v-show="!collapsed" :tasks="tasks" :isNextAvailableTask="isNextAvailableTask" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import OnboardingHeader from './_onboarding/OnboardingHeader.vue'
import OnboardingTasks from './_onboarding/OnboardingTasks.vue'

const onboardingStore = useOnboardingStore()
const {
  collapsed,
  isClosing,
  tasks,
  allCompleted,
  headerImage,
  headerTitle,
  showSubtitle,
  showArrow,
  isLoaded,
  shouldShow,
} = storeToRefs(onboardingStore)

const { toggle, dismissWithSeen, isNextAvailableTask } = onboardingStore
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-onboarding';

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
