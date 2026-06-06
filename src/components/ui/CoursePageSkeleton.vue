<template>
  <div class="course-page-skeleton" aria-label="Подготовка страницы курса">
    <header class="course-page-skeleton__header">
      <div class="container course-page-skeleton__header-inner">
        <Skeleton type="text" width="80px" height="20px" animated variant="light" />

        <div class="course-page-skeleton__header-actions">
          <Skeleton class="course-page-skeleton__course-trigger" type="button" width="112px" height="36px" animated
            variant="light" />
          <Skeleton type="circle" width="36px" height="36px" animated variant="light" />
          <Skeleton type="circle" width="36px" height="36px" animated variant="light" />
        </div>
      </div>
    </header>

    <main class="course-page-skeleton__content">
      <div class="container course-page-skeleton__inner">
        <section class="course-page-skeleton__title-block">
          <Skeleton type="title" width="220px" animated />
          <Skeleton type="text" width="150px" animated />
        </section>

        <section class="course-page-skeleton__tabs" aria-hidden="true">
          <Skeleton type="tab" width="100%" animated variant="default" />
        </section>

        <section class="course-page-skeleton__section">
          <div class="course-page-skeleton__section-top">
            <Skeleton type="title" width="140px" height="28px" animated variant="light" />
            <Skeleton class="course-page-skeleton__search" type="input" height="40px" animated variant="light" />
          </div>

          <div class="course-page-skeleton__lesson-list">
            <Skeleton v-for="item in 3" :key="item" type="rect" width="100%" height="84px" animated variant="light" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<style scoped lang="scss">
.course-page-skeleton {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $surface-default-secondary;

  @include responsive-prop(padding,
    ($container-padding-mobile, $container-padding-tablet, $container-padding-desktop));
  @include responsive-prop(gap, ($container-padding-mobile, $container-padding-tablet, null));

  &__header {
    width: 100%;
  }

  &__header-inner {
    @include flex-center(row, space-between, center);
    gap: $m8;
    padding: 16px 16px 16px 24px;
    border-radius: $m8;
    background-color: $surface-default-primary;
  }

  &__header-actions {
    display: grid;
    grid-template-columns: minmax(84px, 112px) 36px 36px;
    align-items: center;
    gap: $m4;
  }

  &__content {
    display: flex;
    flex: 1;
    width: 100%;
  }

  &__inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $m8;
  }

  &__title-block {
    @include flex-center(column);
    gap: $m4;
  }

  &__tabs {
    display: flex;
    gap: $m2;
    padding: $m2;
    @include responsive-prop(border-radius, ($m8, null, $m12));
    background-color: $surface-default-primary;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $m8;
    padding: $m8;
    border-radius: $m12;
    background-color: $surface-default-primary;
  }

  &__section-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $m6;
  }

  &__search {
    width: 100%;
    max-width: 220px;
  }

  &__lesson-list {
    display: flex;
    flex-direction: column;
    gap: $m6;
  }
}

@media (max-width: 768px) {
  .course-page-skeleton {
    &__header-actions {
      grid-template-columns: 36px 36px;

      .course-page-skeleton__course-trigger {
        display: none;
      }
    }

    &__section-top {
      align-items: stretch;
      flex-direction: column;
    }
  }
}
</style>
