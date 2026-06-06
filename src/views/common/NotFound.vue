<!-- src/views/common/NotFound.vue -->
<template>
  <div class="error-page">
    <div class="error-page__content">
      <img class="error-page__image" src="@/assets/images/img404.png" alt="ошибка 404" />
      <BaseButton variant="primary" type="contained" :to="'/'">
        Вернуться на главную
      </BaseButton>
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
    gap: $m12;
    padding: $m20 $m10;
    border-radius: $m12;
    max-width: 320px;
    background-color: $surface-default-primary;
  }
}
</style>
