<template>
  <div v-if="files.length > 0" class="material-file-list">
    <article
      v-for="item in files"
      :key="item.clientId"
      class="material-file-list__card"
      :class="`material-file-list__card--${item.status}`"
    >
      <a
        v-if="item.fileUrl"
        class="material-file-list__download"
        :href="item.fileUrl"
        :download="item.originalName"
        :title="item.originalName"
        @click.prevent="downloadFile(item)"
      >
        <span class="material-file-list__icon">
          {{ item.extension }}
        </span>

        <span class="material-file-list__body">
          <span class="material-file-list__title">
            {{ item.originalName }}
          </span>

          <span
            v-if="item.status === 'uploading' || item.status === 'finalizing'"
            class="material-file-list__progress"
          >
            <span class="material-file-list__progress-bar" :style="{ width: `${item.progress}%` }" />
            <span class="material-file-list__progress-label">
              {{ item.status === 'finalizing' ? 'Сохранение...' : `${item.progress}%` }}
            </span>
          </span>

          <span v-if="item.status === 'error'" class="material-file-list__error">
            {{ item.errorMessage }}
          </span>
        </span>
      </a>

      <div v-else class="material-file-list__download material-file-list__download--disabled" :title="item.originalName">
        <span class="material-file-list__icon">
          {{ item.extension }}
        </span>

        <span class="material-file-list__body">
          <span class="material-file-list__title">
            {{ item.originalName }}
          </span>

          <span
            v-if="item.status === 'uploading' || item.status === 'finalizing'"
            class="material-file-list__progress"
          >
            <span class="material-file-list__progress-bar" :style="{ width: `${item.progress}%` }" />
            <span class="material-file-list__progress-label">
              {{ item.status === 'finalizing' ? 'Сохранение...' : `${item.progress}%` }}
            </span>
          </span>

          <span v-if="item.status === 'error'" class="material-file-list__error">
            {{ item.errorMessage }}
          </span>
        </span>
      </div>

      <button
        v-if="isFileRemovable(item) && (item.status === 'done' || item.status === 'error')"
        class="material-file-list__remove"
        type="button"
        aria-label="Удалить файл"
        @click.stop="emit('removeFile', item.clientId)"
      >
        <UiIcon name="delete" size="18" color="#EE3C34"/>
      </button>
    </article>
  </div>

  <div v-else class="material-file-list__empty">
    {{ emptyText }}
  </div>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'
import type { MaterialFileItem } from '@/types/file-upload'
import { downloadRemoteFile } from '@/utils/download-file'

const props = withDefaults(
  defineProps<{
    files: MaterialFileItem[]
    emptyText?: string
    removable?: boolean
  }>(),
  {
    emptyText: 'Файлов пока нет',
    removable: true,
  },
)

const emit = defineEmits<{
  (event: 'removeFile', clientId: string): void
}>()

const isFileRemovable = (item: MaterialFileItem): boolean => item.removable ?? props.removable

async function downloadFile(item: MaterialFileItem): Promise<void> {
  if (!item.fileUrl) return
  await downloadRemoteFile(item.fileUrl, item.originalName)
}
</script>

<style scoped lang="scss">
.material-file-list {
  display: flex;
  flex-direction: column;
  gap: $m5;

  &__empty {
    @include font-body-caption();
    color: $text-default-secondary;
  }

  &__card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $m4;
    width: 100%;
    min-width: 0;

    &--error .material-file-list__icon {
      background-color: $surface-default-danger;
      color: $text-default-danger;
    }

    &--uploading,
    &--finalizing {
      opacity: 0.8;
    }
  }

  &__download {
    display: flex;
    align-items: center;
    gap: $m4;
    min-width: 0;
    flex: 1;
    color: inherit;
    text-decoration: none;
    cursor: pointer;

    &--disabled {
      cursor: default;
    }
  }

  &__icon {
    @include font-body-caption();
    @include flex-center();
    flex: 0 0 auto;
    width: 40px;
    height: 48px;
    border-radius: $m3;
    background-color: $surface-default-secondary;
    color: $text-default-secondary;
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.02em;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $m1;
    min-width: 0;
    flex: 1;
  }

  &__title {
    @include font-body-text();
    color: $text-default-primary;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow-wrap: anywhere;
  }

  &__progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $m1;
  }

  &__progress-bar {
    height: 3px;
    border-radius: 2px;
    background-color: $surface-default-primary;
    transition: width 0.2s ease;

    &::after {
      content: '';
      display: block;
      height: 100%;
      width: 100%;
      border-radius: 2px;
      background-color: $text-default-primary;
    }
  }

  &__progress-label {
    @include font-body-caption();
    color: $text-default-secondary;
    font-size: 10px;
  }

  &__error {
    @include font-body-caption();
    color: $text-default-danger;
    font-size: 10px;
    word-break: break-word;
  }

  &__remove {
    @include flex-center();
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: $m4;
    background-color: transparent;
    color: $text-default-danger;
    border: none;
    cursor: pointer;
    line-height: 1;
    transition: background-color 0.15s ease, opacity 0.15s ease;
  }
}

@include screen-min('md') {
  .material-file-list {
    flex-direction: row;
    gap: $m6;
    flex-wrap: wrap;

    &__card {
      flex-direction: column;
      align-items: center;
      gap: $m2;
      width: 84px;
      text-align: center;
    }

    &__download {
      flex-direction: column;
      gap: $m2;
      width: 100%;
    }

    &__body {
      width: 100%;
      align-items: center;
    }

    &__title {
      width: 100%;
      text-align: center;
    }

    &__remove {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: $surface-default-secondary;
      opacity: 0;

      .material-file-list__card:hover & {
        opacity: 1;
      }

      &:hover {
        background-color: $surface-default-danger;
      }
    }
  }
}
</style>
