<template>
  <div class="profile-page-skeleton" aria-label="Подготовка профиля">
    <header class="profile-page-skeleton__header">
      <div class="container profile-page-skeleton__header-inner">
        <Skeleton type="text" width="80px" height="20px" animated variant="light" />

        <div class="profile-page-skeleton__header-actions">
          <Skeleton type="button" width="112px" height="36px" animated variant="light" />
          <Skeleton type="circle" width="36px" height="36px" animated variant="light" />
        </div>
      </div>
    </header>

    <main class="profile-page-skeleton__content">
      <div class="container profile-page-skeleton__inner">
        <section class="profile-page-skeleton__profile-head">
          <div class="profile-page-skeleton__identity">
            <Skeleton type="text" width="90px" height="20px" animated />
            <Skeleton type="title" width="260px" height="40px" animated />
          </div>

          <Skeleton type="button" width="150px" height="36px" animated />
        </section>

        <section class="profile-page-skeleton__section">
          <div class="profile-page-skeleton__section-title">
            <Skeleton type="title" width="130px" height="28px" animated variant="light" />
          </div>

          <div class="profile-page-skeleton__info-grid">
            <Skeleton
              v-for="item in 3"
              :key="item"
              type="rect"
              width="100%"
              height="82px"
              animated
              variant="light"
            />
          </div>
        </section>

        <section class="profile-page-skeleton__section profile-page-skeleton__section--flat">
          <Skeleton type="title" width="110px" height="28px" animated variant="light" />

          <div class="profile-page-skeleton__achievements">
            <article v-for="item in 2" :key="item" class="profile-page-skeleton__achievement">
              <Skeleton type="rect" width="158px" height="158px" radius="8px" animated variant="light" />
              <Skeleton type="text" width="120px" height="20px" animated variant="light" />
              <Skeleton type="text" width="150px" height="36px" animated variant="light" />
            </article>
          </div>
        </section>

        <section class="profile-page-skeleton__section">
          <Skeleton type="title" width="110px" height="28px" animated variant="light" />
          <Skeleton type="rect" width="100%" height="96px" animated variant="light" />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<style scoped lang="scss">
.profile-page-skeleton {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $surface-default-secondary;

  @include responsive-prop(
    padding,
    ($container-padding-mobile, $container-padding-tablet, $container-padding-desktop)
  );
  @include responsive-prop(gap, ($container-padding-mobile, $container-padding-tablet, null));

  &__header-inner {
    @include flex-center(row, space-between, center);
    gap: $m8;
    padding: 16px 16px 16px 24px;
    border-radius: $m8;
    background-color: $surface-default-primary;
  }

  &__header-actions {
    display: flex;
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

  &__profile-head {
    @include flex-center(row, space-between, flex-start);
    gap: $m8;
    padding: $m8 0;
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: $m2;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $m8;
    padding: $m8;
    border-radius: $m12;
    background-color: $surface-default-primary;

    &--flat {
      overflow: hidden;
    }
  }

  &__section-title {
    display: flex;
    justify-content: space-between;
    gap: $m6;
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $m6;
  }

  &__achievements {
    display: flex;
    gap: $m12;
    overflow: hidden;
  }

  &__achievement {
    width: 158px;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $m5;
  }
}

@media (max-width: 768px) {
  .profile-page-skeleton {
    &__profile-head {
      flex-direction: column;
    }

    &__info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
