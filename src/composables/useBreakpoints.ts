// composables/useBreakpoints.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useBreakpoints = () => {
  const width = ref(window.innerWidth)

  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
  }
}
