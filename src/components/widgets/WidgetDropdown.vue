<template>
  <div class="widget-dropdown" ref="dropdownRef" :class="{ 'widget-dropdown--truncate': truncate }">
    <div
      ref="triggerRef"
      class="widget-dropdown__trigger-wrapper"
      role="button"
      :class="{ 'widget-dropdown__trigger-wrapper--disabled': disabled }"
      @click="toggle"
    >
      <slot name="trigger" :opened="opened">
        <span class="widget-dropdown__value">
          {{ selectedLabel || placeholder }}
        </span>
      </slot>
    </div>

    <Teleport to="body" :disabled="!teleportPanel">
      <div
        v-if="opened"
        ref="panelRef"
        class="widget-dropdown__panel"
        :class="panelClasses"
        :style="teleportPanel ? panelPositionStyle : undefined"
        role="listbox"
      >
        <div v-if="error" class="widget-dropdown__state">
          <p>{{ error }}</p>
          <BaseButton type="text" @click="$emit('retry')"> Попробовать ещё раз </BaseButton>
        </div>

        <div v-else-if="isEmpty" class="widget-dropdown__state">Записи не найдены</div>

        <template v-else>
          <div v-for="(group, gIndex) in groups" :key="gIndex" class="widget-dropdown__group">
            <div v-if="group.caption" class="widget-dropdown__caption">
              {{ group.caption }}
            </div>

            <ul class="widget-dropdown__list">
              <li
                v-for="item in group.items"
                :key="item.id"
                class="widget-dropdown__item"
                :class="itemClasses(item)"
                @click="!item.disabled && select(item)"
              >
                <div v-if="multiple" class="widget-dropdown__checkbox-wrapper" @click.stop>
                  <BaseCheckbox
                    :checked="isSelected(item)"
                    :disabled="item.disabled"
                    @update:checked="toggleItem(item)"
                  />
                </div>

                <UiIcon v-if="item.leftIcon" :name="item.leftIcon" size="16" />

                <span class="widget-dropdown__label">
                  {{ item.label }}
                </span>

                <UiIcon
                  v-if="item.rightIcon"
                  :name="item.rightIcon"
                  size="16"
                  class="widget-dropdown__right-icon"
                />
              </li>
            </ul>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'

import '@/styles/components/_widget-dropdown.scss'

export interface DropdownItem {
  id: string | number
  label: string
  disabled?: boolean
  leftIcon?: IconName
  rightIcon?: IconName
}

export interface DropdownGroup {
  caption?: string
  items: DropdownItem[]
}

const PANEL_GAP_PX = 4
const DEFAULT_PANEL_WIDTH_PX = 225

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownItem | DropdownItem[] | null
    groups: DropdownGroup[]

    placeholder?: string
    multiple?: boolean
    disabled?: boolean
    truncate?: boolean
    error?: string | null
    position?: 'left' | 'right'
    /** Панель в body + position: fixed — для контейнеров с overflow-x. По умолчанию выключено. */
    teleportPanel?: boolean
  }>(),
  {
    placeholder: 'Выберите значение',
    multiple: false,
    disabled: false,
    truncate: false,
    error: null,
    position: 'left',
    teleportPanel: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DropdownItem | DropdownItem[]): void
  (e: 'retry'): void
}>()

const opened = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelPositionStyle = ref<Record<string, string>>({})

const panelClasses = computed(() => ({
  'widget-dropdown__panel--position-left': props.position === 'left' && !props.teleportPanel,
  'widget-dropdown__panel--position-right': props.position === 'right' && !props.teleportPanel,
  'widget-dropdown__panel--teleported': props.teleportPanel,
}))

const toggle = (): void => {
  if (props.disabled) return
  opened.value = !opened.value
}

const isSelected = (item: DropdownItem): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.some((v) => v.id === item.id)
  }
  return (props.modelValue as DropdownItem)?.id === item.id
}

const select = (item: DropdownItem): void => {
  if (item.disabled) return

  if (props.multiple) {
    const value = Array.isArray(props.modelValue) ? [...props.modelValue] : []

    const exists = value.find((v) => v.id === item.id)
    const next = exists ? value.filter((v) => v.id !== item.id) : [...value, item]

    emit('update:modelValue', next)
  } else {
    emit('update:modelValue', item)
    opened.value = false
  }
}

const toggleItem = (item: DropdownItem): void => {
  if (item.disabled) return

  const value = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const exists = value.find((v) => v.id === item.id)

  const next = exists ? value.filter((v) => v.id !== item.id) : [...value, item]

  emit('update:modelValue', next)
}

const selectedLabel = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.map((v) => v.label).join(', ')
  }
  return (props.modelValue as DropdownItem | null)?.label
})

const isEmpty = computed(() => props.groups.every((g) => g.items.length === 0))

const itemClasses = (item: DropdownItem) => ({
  'widget-dropdown__item--disabled': item.disabled,
  'widget-dropdown__item--chosen': isSelected(item),
})

async function updatePanelPosition(): Promise<void> {
  if (!props.teleportPanel || !triggerRef.value) return

  await nextTick()

  const rect = triggerRef.value.getBoundingClientRect()
  const panelWidth = panelRef.value?.offsetWidth ?? DEFAULT_PANEL_WIDTH_PX

  let left = rect.left
  if (props.position === 'right') {
    left = rect.right - panelWidth
  }

  const style: Record<string, string> = {
    top: `${rect.bottom + PANEL_GAP_PX}px`,
    left: `${left}px`,
  }

  if (props.truncate) {
    style.minWidth = `${rect.width}px`
  }

  panelPositionStyle.value = style
}

let viewportListenersAttached = false

function attachViewportListeners(): void {
  if (viewportListenersAttached) return
  window.addEventListener('resize', updatePanelPosition, { passive: true })
  window.addEventListener('scroll', updatePanelPosition, { capture: true, passive: true })
  viewportListenersAttached = true
}

function detachViewportListeners(): void {
  if (!viewportListenersAttached) return
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
  viewportListenersAttached = false
}

watch(opened, (isOpen) => {
  if (isOpen && props.teleportPanel) {
    void updatePanelPosition()
    attachViewportListeners()
    return
  }
  detachViewportListeners()
})

const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as Node
  if (!target) return
  if (dropdownRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  opened.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  detachViewportListeners()
})
</script>
