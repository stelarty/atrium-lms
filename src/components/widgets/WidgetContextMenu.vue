<template>
  <div ref="rootRef" class="widget-context-menu">
    <!-- Trigger -->
    <div
      class="widget-context-menu__trigger"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="toggleMenu"
      @keydown.enter.prevent="toggleMenu"
      @keydown.space.prevent="toggleMenu"
    >
      <slot name="trigger" :opened="isOpen" />
    </div>

    <!-- Desktop: Menu -->
    <Transition name="fade">
      <div
        v-if="isOpen && isDesktop"
        class="widget-context-menu__menu"
        :class="`widget-context-menu__menu--position-${position}`"
        @click="handleMenuClick"
      >
        <!-- Приоритет: #menu-items -->
        <slot name="menu-items" v-if="$slots['menu-items']"></slot>
        <!-- Иначе — дефолт -->
        <slot v-else></slot>
      </div>
    </Transition>

    <!-- Mobile: Teleport bottom sheet -->
    <Teleport to="body">
      <transition name="context-menu-mobile">
        <div
          v-if="isOpen && isMobile"
          class="widget-context-menu__mobile-overlay"
          @click="closeMenu"
        >
          <div class="widget-context-menu__mobile-sheet" @click="handleMenuClick">
            <div class="widget-context-menu__mobile-handle">
              <div class="widget-context-menu__mobile-handle-bar"></div>
            </div>

            <div class="widget-context-menu__mobile-content">
              <slot name="menu-items" v-if="$slots['menu-items']"></slot>
              <slot v-else></slot>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

interface Props {
  position?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  position: 'left',
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const { isMobile } = useBreakpoints()
const isDesktop = computed(() => !isMobile.value)

const closeMenu = () => {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
}

const openMenu = () => {
  if (isOpen.value) return
  isOpen.value = true
  emit('open')
}

const toggleMenu = () => {
  if (isOpen.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

const handleEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!isDesktop.value || !isOpen.value || !rootRef.value) return

  const target = event.target
  if (target instanceof Node && !rootRef.value.contains(target)) {
    closeMenu()
  }
}

const handleMenuClick = (event: MouseEvent): void => {
  const target = event.target
  if (!(target instanceof Element)) return

  const clickableItem = target.closest('button, a, [role="button"], .widget-context-menu__menu-item')
  if (!clickableItem) return

  closeMenu()
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style lang="scss">
@import '@/styles/components/_widget-context-menu';
</style>
