<template>
  <div class="widget-lesson-teacher-comment">
    <BaseRichText
      v-if="showPreview"
      variant="materials-comment"
      :text="modelValue"
    />

    <BaseTextarea
      v-if="showTextarea"
      v-model="editDraft"
      :placeholder="TEACHER_COMMENT_PLACEHOLDER"
      :maxlength="maxLength"
      :disabled="disabled"
    />

    <BaseButton
      v-if="showTextarea"
      variant="primary"
      type="contained"
      width="fit"
      :disabled="disabled || !canSaveLocal"
      @click="saveLocal"
    >
      Сохранить
    </BaseButton>

    <BaseButton
      v-if="showPreview"
      variant="secondary"
      type="contained"
      width="fit"
      :disabled="disabled"
      @click="startEdit"
    >
      Редактировать
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseRichText from '@/components/base/BaseRichText.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

const TEACHER_COMMENT_MAX_LENGTH = 4000

const TEACHER_COMMENT_PLACEHOLDER =
  'В этом поле вы можете оставить как комментарии к занятию, так и ссылки на полезные материалы'

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const maxLength = TEACHER_COMMENT_MAX_LENGTH
const isEditing = ref(false)
const editDraft = ref('')

const hasContent = computed(() => props.modelValue.trim().length > 0)
const showPreview = computed(() => hasContent.value && !isEditing.value)
const showTextarea = computed(() => !hasContent.value || isEditing.value)
const canSaveLocal = computed(() => editDraft.value.trim().length > 0)

function startEdit(): void {
  editDraft.value = props.modelValue
  isEditing.value = true
}

function saveLocal(): void {
  if (!canSaveLocal.value) return

  emit('update:modelValue', editDraft.value)
  isEditing.value = false
}

watch(
  () => props.modelValue,
  (value) => {
    if (!isEditing.value) {
      editDraft.value = value
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-lesson-teacher-comment';
</style>
