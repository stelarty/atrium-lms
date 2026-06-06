<!-- src/views/common/ServiceUnavailable.vue -->
<template>
  <div class="error-page">
    <div class="error-page__content">
      <img
        class="error-page__image"
        src="@/assets/images/img503.png"
        alt="Сервис временно недоступен"
      />
      <p class="error-page__text">
        Вернитесь на страницу через некоторое время или попробуйте перезагрузить
      </p>
      <BaseButton variant="primary" type="contained" :to="'/'"> Попробовать снова </BaseButton>
    </div>

    <RouterLink to="/" class="footer__logo">
      <UiIcon name="logo" :size="100" />
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
</script>

<style scoped lang="scss">
.error-page {
  @include responsive-prop(
    padding,
    ($container-padding-mobile, $container-padding-tablet, $container-padding-desktop)
  );
  @include flex-center(column);
  gap: $m12;
  min-height: 100vh;

  &__content {
    @include flex-center(column);
    gap: $m8;
    padding: $m20 $m10;
    border-radius: $m12;
    max-width: 320px;
    background-color: $surface-default-primary;
    text-align: center;
  }

  &__image {
    width: 100%;
  }

  &__text {
    @include font-body-caption;
    color: $text-default-primary;
    padding: 0 $m2;
  }
}
</style>
