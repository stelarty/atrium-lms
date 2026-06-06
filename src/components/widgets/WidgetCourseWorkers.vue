<!-- src/components/widgets/WidgetCourseWorkers.vue -->
<template>
  <section class="course-settings-roles-tab">
    <p v-if="actionBanner" class="course-settings-roles-tab__banner" role="alert">
      {{ actionBanner }}
    </p>

    <div class="course-settings-roles-tab__table-wrap">
      <table class="course-settings-roles-tab__table">
        <thead>
          <tr class="course-settings-roles-tab__header">
            <th class="course-settings-roles-tab__th">Фамилия и Имя</th>
            <th class="course-settings-roles-tab__th">Email</th>
            <th class="course-settings-roles-tab__th">Роль</th>
            <th class="course-settings-roles-tab__th course-settings-roles-tab__th--actions" />
          </tr>
        </thead>

        <tbody v-if="workers.length > 0">
          <tr v-for="worker in workers" :key="worker.worker_id" class="course-settings-roles-tab__row">
            <td class="course-settings-roles-tab__td course-settings-roles-tab__td--fio">
              <span class="course-settings-roles-tab__text">{{ worker.surname }} {{ worker.name }}</span>
            </td>

            <td class="course-settings-roles-tab__td course-settings-roles-tab__td--email">
              <span class="course-settings-roles-tab__text">{{ worker.email }}</span>
            </td>

            <td class="course-settings-roles-tab__td course-settings-roles-tab__td--role">
              <BaseSelect :model-value="worker.role" placeholder="Выберите роль" :options="roleOptions"
                :disabled="!canChangeRole(worker, worker.role)" teleport-panel position="right"
                @update:model-value="(newRole) => handleChangeRole(worker.worker_id, newRole as string)" />
            </td>

            <td class="course-settings-roles-tab__td course-settings-roles-tab__td--actions">
              <BaseIconButton v-if="canRemoveWorker(worker)" variant="secondary" type="contained"
                aria-label="Удалить работника" @click="handleDeleteWorker(worker.worker_id)">
                <UiIcon name="delete" size="18" />
              </BaseIconButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="workers.length === 0" class="course-settings-roles-tab__empty">
        <p>В курсе пока нет работников</p>
      </div>
    </div>

    <!-- Кнопка добавления -->
    <div class="course-settings-roles-tab__actions">
      <BaseButton variant="primary" type="contained" width="adaptive" :disabled="isLoading" @click="isModalOpen = true">
        <!-- <UiIcon name="add" size="18" /> -->
        <span>Добавить пользователя</span>
      </BaseButton>
    </div>

    <!-- Модалка добавления -->
    <BaseModal v-model="isModalOpen" title="Добавить работника" @close="resetForm">
      <form @submit.prevent="handleAddWorker" class="add-worker-form">
        <BaseSelect v-model="selectedUserId" label="Пользователь" placeholder="Выберите пользователя"
          :options="userOptions" :disabled="isLoading" required />
        <BaseSelect v-model="selectedRoleCode" label="Роль" placeholder="Выберите роль" :options="roleOptions"
          :disabled="isLoading" required />
        <p v-if="formError" class="add-worker-form__error">{{ formError }}</p>
      </form>

      <template #footer>
        <!-- <BaseButton variant="secondary" type="contained" @click="resetForm" :disabled="isLoading">
          Отмена
        </BaseButton> -->
        <BaseButton variant="primary" type="contained" @click="handleAddWorker"
          :disabled="isLoading || !selectedUserId || !selectedRoleCode">
          {{ isLoading ? 'Добавление...' : 'Добавить пользователя' }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useCourseWorkers } from '@/composables/useCourseWorkers'
import type { WorkerRoleCode } from '@/types/course-worker'

const props = defineProps<{
  courseId: number
}>()

// Инициализируем composable с курсом
const {
  workers,
  roleOptions,
  userOptions,
  isLoading,
  canRemoveWorker,
  canChangeRole,
  assignWorker,
  changeWorkerRole,
  deleteWorker,
} = useCourseWorkers(() => props.courseId)

// Состояние модалки
const isModalOpen = ref(false)
const selectedUserId = ref<string>('')
const selectedRoleCode = ref<WorkerRoleCode>('teacher')
const formError = ref<string | null>(null)
const actionBanner = ref<string | null>(null)

// Обработчик изменения роли
const handleChangeRole = async (workerId: string, newRole: string): Promise<void> => {
  try {
    formError.value = null
    actionBanner.value = null
    await changeWorkerRole(workerId, newRole as WorkerRoleCode)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка обновления роли'
    formError.value = message
    actionBanner.value = message
    console.error('[WidgetCourseWorkers] Ошибка обновления роли', err)
  }
}

// Обработчик удаления
const handleDeleteWorker = async (workerId: string): Promise<void> => {
  try {
    formError.value = null
    actionBanner.value = null
    await deleteWorker(workerId)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка удаления'
    formError.value = message
    actionBanner.value = message
    console.error('[WidgetCourseWorkers] Ошибка удаления работника', err)
  }
}

// Сброс формы
const resetForm = (): void => {
  selectedUserId.value = ''
  selectedRoleCode.value = 'teacher'
  formError.value = null
  isModalOpen.value = false
}

// Добавление работника
const handleAddWorker = async (): Promise<void> => {
  if (!selectedUserId.value || !selectedRoleCode.value) return
  try {
    formError.value = null
    actionBanner.value = null
    await assignWorker(selectedUserId.value, selectedRoleCode.value)
    resetForm()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка добавления'
    formError.value = message
    // Не закрываем модалку, чтобы пользователь мог исправить
  }
}
</script>

<style scoped lang="scss">
.course-settings-roles-tab {
  display: flex;
  flex-direction: column;
  gap: $m6;
  border-radius: $m8;
  background-color: $surface-default-primary;

  &__banner {
    @include font-body-text;
    margin: 0;
    padding: $m4 $m5;
    color: $text-default-danger;
    background-color: rgba($text-default-danger, 0.08);
    border-radius: $m4;
  }
  // @include responsive-prop(padding-inline, ($m8, $m12, null));


  &__table-wrap {
    width: calc(100% + #{$m8 * 2});
    overflow-x: auto;
    overflow-y: visible;
    margin-left: -$m8;
    margin-right: -$m8;
    @include responsive-prop(padding-inline, ($m8, $m12, null));


    @include screen-min('md') {
      width: calc(100% + #{$m12 * 2});
      margin-left: -$m12;
      margin-right: -$m12;
    }

    // @include responsive-prop(padding-inline, ($m8, $m12, null));

    // ✅ Скрываем скроллбар, но оставляем прокрутку
    &::-webkit-scrollbar {
      display: none; // Chrome, Safari, Edge (Chromium)
    }

    scrollbar-width: none; // Firefox
    -ms-overflow-style: none; // IE/Edge Legacy
  }

  &__table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: auto;
  }

  &__th {
    @include font-body-caption();
    color: $text-default-label;
    font-weight: 500;
    text-align: left;
    padding: $m4 $m6;
    white-space: nowrap;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }

  &__th--actions {
    width: 32px;
    padding-inline: $m3;
  }

  &__td {
    padding: $m4 $m6;
    box-sizing: content-box;
    vertical-align: middle;
    white-space: nowrap;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }

  &__td--fio {
    min-width: 160px;
  }

  &__td--email {
    min-width: 200px;
  }

  &__td--role {
    min-width: 180px;
  }

  &__td--actions {
    width: 32px;
    text-align: center;
  }

  &__text {
    @include font-body-text();
    color: $text-default-primary;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  &__actions {
    @include flex-center(row, center, center);
  }

  &__empty {
    text-align: center;
    padding: $m6;
    color: $text-default-secondary;
  }
}

// Стили для формы в модалке
.add-worker-form {
  display: flex;
  flex-direction: column;
  gap: $m5;

  &__error {
    @include font-body-caption();
    color: $text-default-danger;
    margin: 0;
  }
}
</style>
