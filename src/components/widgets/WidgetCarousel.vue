<template>
  <section class="widget-carousel">
    <header class="widget-carousel__header">
      <slot name="title">
        <h2 v-if="title" class="widget-carousel__title">{{ title }}</h2>
      </slot>

      <div v-if="hasNavigation" class="widget-carousel__nav" aria-label="Навигация карусели">
        <BaseIconButton direction="left" variant="secondary" type="text" aria-label="Предыдущий слайд" @click="prev">
          <UiIcon name="arrow" direction="left" :size="32" />
        </BaseIconButton>

        <BaseIconButton variant="secondary" type="text" aria-label="Следующий слайд" @click="next">
          <UiIcon name="arrow" direction="right" :size="32" />
        </BaseIconButton>

      </div>
    </header>

    <div v-if="items.length > 0" class="widget-carousel__viewport" aria-live="polite">
      <div ref="trackRef" class="widget-carousel__track"
        :class="{ 'widget-carousel__track--animated': isTrackAnimated && isTransitionEnabled }" :style="trackStyle"
        @transitionend="handleTransitionEnd">
        <div v-for="slide in trackSlides" :key="slide.key" class="widget-carousel__slide"
          :aria-hidden="slide.itemIndex !== activeIndex">
          <slot :item="slide.item" :index="slide.itemIndex"
            :active="slide.itemIndex === activeIndex && !slide.isClone" />
        </div>
      </div>
    </div>

    <div v-else-if="$slots.empty" class="widget-carousel__empty">
      <slot name="empty" />
    </div>
  </section>
</template>

<script setup lang="ts" generic="T">
import { computed, onMounted, ref, type CSSProperties } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useInfiniteCarousel } from '@/composables/useInfiniteCarousel'
import BaseIconButton from '../base/BaseIconButton.vue';

const props = defineProps<{
  items: T[]
  title?: string
}>()

defineSlots<{
  default(props: { item: T; index: number; active: boolean }): void
  empty(): void
  title(): void
}>()

const resolveSlideKey = (item: T, slideIndex: number): string | number => {
  if (item !== null && typeof item === 'object' && 'id' in item) {
    const id = (item as { id?: string | number }).id
    if (id !== undefined && id !== null) return id
  }

  return slideIndex
}

const {
  trackPosition,
  trackSlides,
  activeIndex,
  isTransitionEnabled,
  prev,
  next,
  onTrackTransitionEnd,
  hasNavigation,
} = useInfiniteCarousel(() => props.items, resolveSlideKey)

const trackRef = ref<HTMLElement | null>(null)
const isTrackAnimated = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isTrackAnimated.value = true
  })
})

const trackStyle = computed((): CSSProperties => ({
  transform: `translate3d(-${trackPosition.value * 100}%, 0, 0)`,
}))

const handleTransitionEnd = (event: TransitionEvent): void => {
  if (trackRef.value !== event.target) return
  onTrackTransitionEnd(event)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-carousel.scss';
</style>
