<!-- src/views/common/AccessDenied.vue -->
<template>
  <div class="access-denied">
    <div class="access-denied__content">
      <img
        class="access-denied__image"
        src="@/assets/images/access-denied.png"
        alt="Доступ ограничен"
      />
      <h1 class="access-denied__title">Доступ на платформу ограничен</h1>
      <p class="access-denied__text">
        Чтобы получить доступ на платформу, требуется приобрести курс. Если вы уже приобретали курс,
        но доступа по прежнему нет, свяжитесь со службой заботы
      </p>

      <div class="access-denied__actions">
        <BaseButton width="full" variant="primary" type="contained" @click="openSupport">
          Связаться со Службой Заботы
        </BaseButton>
        <BaseButton
          width="full"
          variant="secondary"
          type="contained"
          :href="potokLoginUrl"
        >
          Подобрать курс
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { getPotokLoginUrl } from '@/utils/env'

const potokLoginUrl = getPotokLoginUrl()

const openSupport = () => {
  window.open('https://t.me/atrium_customer_support', '_blank')
}
</script>

<style scoped lang="scss">
.access-denied {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $surface-default-secondary;
  padding: $m8;

  &__content {
    @include flex-center(column);
    @include border-radius();
    @include responsive-prop(padding, ($container-padding-mobile, $container-padding-tablet, null));
    gap: $m8;
    text-align: center;
    max-width: 362px;
    background-color: $surface-default-primary;
  }

  &__image {
    width: 75px;
    height: 75px;
  }

  &__title {
    @include font-titles-subheader;
    color: $text-default-primary;
  }

  &__text {
    @include font-body-text;
    color: $text-default-secondary;
  }

  &__actions {
    @include flex-center(column);
    width: 100%;
    gap: $m4;
  }
}
</style>
