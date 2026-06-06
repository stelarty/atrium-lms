<!-- src/components/base/BaseModal.vue -->
<template>
  <!-- Teleport выносит модалку в конец <body>, чтобы избежать проблем с z-index и overflow -->
  <Teleport to="body">
    <!-- Transition для плавного появления/скрытия -->
    <Transition name="modal-fade">
      <div v-if="modelValue" class="base-modal__overlay" role="dialog" aria-modal="true"
        :aria-labelledby="hideHeader ? undefined : titleId" :aria-label="hideHeader ? title : undefined"
        @click.self="handleClose">
        <div class="base-modal__content"
          :class="[{ 'base-modal__content--wide': wide }, `base-modal__content--${variant}`]">
          <header v-if="!hideHeader" class="base-modal__header">
            <h3 :id="titleId" class="base-modal__title">{{ title }}</h3>
            <button type="button" class="base-modal__close-btn" @click="handleClose"
              aria-label="Закрыть модальное окно">
              <UiIcon name="close" size="20" />
            </button>
          </header>

          <div class="base-modal__body">
            <!-- Сюда родитель вставит любой контент -->
            <slot></slot>
          </div>

          <!-- Опциональный футер для кнопок действий -->
          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'

interface Props {
  modelValue: boolean
  title: string
  hint?: string
  hideHeader?: boolean
  wide?: boolean
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  hint: '',
  hideHeader: false,
  wide: false,
  variant: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

// Генерируем уникальный ID для заголовка (доступность / a11y)
const titleId = computed(() => `modal-title-${Math.random().toString(36).slice(2, 9)}`)

const handleClose = (): void => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped lang="scss">
.base-modal {
  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    @include responsive-prop(padding, ($m8, $m12, null));
    background-color: rgba(#000000, 0.3);
    backdrop-filter: blur(1px);
  }

  &__content {
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    @include responsive-prop(padding, ($m8, $m12, null));
    @include responsive-prop(border-radius, ($m8, null, $m12));
    display: flex;
    flex-direction: column;
    gap: $m8;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    scrollbar-width: none;
    -ms-overflow-style: none;


    &--secondary {
      background-color: $surface-default-secondary;
    }

    &--primary {
      background-color: $surface-default-primary;
    }

    &--wide {
      max-width: 586px;
    }
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    // padding: $m6 $m6 0;
  }

  &__title {
    @include font-titles-bodyheader();
    margin: 0;
    flex: 1;
  }

  &__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    color: $text-default-secondary;
    cursor: pointer;
    // border-radius: $m3;
    transition: background-color 0.2s;

    &:hover {
      // background-color: $surface-default-hover;
      color: $text-default-primary;
    }
  }

  &__body {
    // padding: $m6;
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}

/* Анимация появления */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
