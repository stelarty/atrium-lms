import { computed, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'

export interface CarouselTrackSlide<T> {
  key: string | number
  item: T
  itemIndex: number
  isClone: boolean
}

export function useInfiniteCarousel<T>(
  itemsSource: MaybeRefOrGetter<T[]>,
  resolveKey: (item: T, index: number) => string | number,
) {
  const items = computed(() => toValue(itemsSource))
  const length = computed(() => items.value.length)
  const isLooping = computed(() => length.value > 1)

  const trackPosition = ref(0)
  const isTransitionEnabled = ref(true)
  const isAnimating = ref(false)

  const resetTrackPosition = (): void => {
    trackPosition.value = isLooping.value ? 1 : 0
    isAnimating.value = false
  }

  watch(length, resetTrackPosition, { immediate: true })
  watch(items, resetTrackPosition)

  const activeIndex = computed(() => {
    const len = length.value
    if (len <= 1) return 0

    const position = trackPosition.value
    if (position === 0) return len - 1
    if (position === len + 1) return 0
    return position - 1
  })

  const trackSlides = computed((): CarouselTrackSlide<T>[] => {
    const list = items.value
    if (list.length === 0) return []

    if (!isLooping.value) {
      return list.map((item, index) => ({
        key: resolveKey(item, index),
        item,
        itemIndex: index,
        isClone: false,
      }))
    }

    const lastIndex = list.length - 1
    const lastItem = list[lastIndex]
    const firstItem = list[0]

    return [
      {
        key: `clone-last-${resolveKey(lastItem, lastIndex)}`,
        item: lastItem,
        itemIndex: lastIndex,
        isClone: true,
      },
      ...list.map((item, index) => ({
        key: resolveKey(item, index),
        item,
        itemIndex: index,
        isClone: false,
      })),
      {
        key: `clone-first-${resolveKey(firstItem, 0)}`,
        item: firstItem,
        itemIndex: 0,
        isClone: true,
      },
    ]
  })

  const snapWithoutTransition = (position: number): void => {
    isTransitionEnabled.value = false
    trackPosition.value = position

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitionEnabled.value = true
        isAnimating.value = false
      })
    })
  }

  const finalizeStep = (): void => {
    const len = length.value
    if (len <= 1) {
      isAnimating.value = false
      return
    }

    if (trackPosition.value === len + 1) {
      snapWithoutTransition(1)
      return
    }

    if (trackPosition.value === 0) {
      snapWithoutTransition(len)
      return
    }

    isAnimating.value = false
  }

  const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const prev = (): void => {
    if (length.value <= 1 || isAnimating.value) return

    isAnimating.value = true
    isTransitionEnabled.value = true
    trackPosition.value -= 1

    if (prefersReducedMotion()) {
      requestAnimationFrame(() => finalizeStep())
    }
  }

  const next = (): void => {
    if (length.value <= 1 || isAnimating.value) return

    isAnimating.value = true
    isTransitionEnabled.value = true
    trackPosition.value += 1

    if (prefersReducedMotion()) {
      requestAnimationFrame(() => finalizeStep())
    }
  }

  const onTrackTransitionEnd = (event: TransitionEvent): void => {
    if (event.propertyName !== 'transform') return
    finalizeStep()
  }

  return {
    trackPosition,
    trackSlides,
    activeIndex,
    isTransitionEnabled,
    isAnimating,
    isLooping,
    prev,
    next,
    onTrackTransitionEnd,
    hasNavigation: computed(() => length.value > 1),
  }
}
