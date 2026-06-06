<!-- src/components/widgets/WidgetUserInfo.vue -->
<template>
  <div class="widget-user-info">
    <div class="widget-user-info__top">
      <h2 class="widget-user-info__heading">Информация</h2>
      <div v-if="!isMobile" class="widget-user-info__action">
        <BaseButton type="contained" variant="secondary" @click="$emit('change-password')">Изменить пароль</BaseButton>
        <BaseButton type="contained" variant="secondary" @click="$emit('edit')">Редактировать
          <UiIcon name="edit" />
        </BaseButton>
      </div>
    </div>
    <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
      <div v-if="profile && !isLoading" class="widget-user-info__list">
        <div class="widget-user-info__card">
          <span class="widget-user-info__label">Класс</span>
          <span class="widget-user-info__value">{{ profile.grade }}</span>
        </div>
        <div class="widget-user-info__card">
          <span class="widget-user-info__label">Номер телефона студента</span>
          <span class="widget-user-info__value">{{ profile.phone }}</span>
        </div>
        <button
          type="button"
          class="widget-user-info__card widget-user-info__card--interactive"
          aria-label="Изменить email"
          @click="$emit('change-email')"
        >
          <span class="widget-user-info__label">Email</span>
          <span class="widget-user-info__value widget-user-info__value--email">{{ profile.email }}</span>
          <UiIcon name="edit" size="24" class="widget-user-info__edit-icon" />
        </button>
      </div>
      <div v-else class="widget-user-info__list" aria-label="Подготовка информации профиля">
        <div v-for="item in 3" :key="item" class="widget-user-info__card">
          <Skeleton type="text" size="small" height="18" animated variant="default" />
          <Skeleton type="text" size="medium" height="22" animated variant="default" />
        </div>
      </div>
    </Transition>
    <div v-if="isMobile" class="widget-user-info__action">
      <BaseButton type="contained" variant="secondary" @click="$emit('change-password')">Изменить пароль</BaseButton>
      <BaseButton type="contained" variant="secondary" @click="$emit('edit')">Редактировать
        <UiIcon name="edit" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProfileData } from '@/api/types/profile'
import BaseButton from '../base/BaseButton.vue'
import UiIcon from '../ui/UiIcon.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile } = useBreakpoints()

defineProps<{
  profile: ProfileData | null
  isLoading: boolean
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'change-email'): void
  (e: 'change-password'): void
}>()
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-user-info';
</style>
