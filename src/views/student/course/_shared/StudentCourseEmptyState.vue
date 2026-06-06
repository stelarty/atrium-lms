<template>
  <div class="student-course-empty-state">
    <img
      v-if="imageSrc"
      class="student-course-empty-state__image"
      :src="imageSrc"
      :alt="imageAlt"
    />

    <div class="student-course-empty-state__content">
      <h3 class="student-course-empty-state__title">{{ title }}</h3>
      <p v-if="subtitle" class="student-course-empty-state__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    imageSrc?: string
    imageAlt?: string
  }>(),
  {
    subtitle: '',
    imageSrc: '',
    imageAlt: '',
  },
)
</script>

<style scoped lang="scss">
.student-course-empty-state {
  @include flex-center(column);
  gap: $m6;
  width: 100%;
  min-height: 360px;
  text-align: center;


  &__image {
    width: 96px;
    height: 96px;
    object-fit: contain;

    @include screen-min('md') {
      width: 120px;
      height: 120px;
    }
  }

  &__content {
    @include flex-center(column);
    gap: $m2;
  }

  &__title {
    @include font-body-button;
    color: $text-default-primary;
  }

  &__subtitle {
    @include font-body-caption;
    color: $text-default-secondary;
  }
}
</style>
