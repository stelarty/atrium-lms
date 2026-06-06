<!-- src/components/widgets/WidgetWelcomeCard.vue -->
<template>
  <article class="widget-welcome-card">
    <!-- Верхняя панель -->
    <div class="widget-welcome-card__header">
      <img src="/assets/images/duck.svg" alt="Приветственная утка" class="widget-welcome-card__emoji" />
      <h1 class="widget-welcome-card__title">Добро пожаловать на платформу!</h1>
      <p class="widget-welcome-card__description">
        Пройдите небольшое задание, чтобы получить уникальную ачивку
      </p>
    </div>

    <!-- Нижняя панель с ачивками -->
    <nav class="widget-welcome-card__achievements" role="navigation">
      <a href="#" class="widget-welcome-card__achieve widget-welcome-card__achieve--done">
        <UiIcon name="check" size="20" color="#fff" />
        Перейти на платформу
      </a>

      <a href="#" class="widget-welcome-card__achieve widget-welcome-card__achieve--active">
        <span class="widget-welcome-card__achieve-number">Текущее задание</span>
        В полезных материалах найти ссылки на ВК и Телеграм </a>

      <a href="#" class="widget-welcome-card__achieve widget-welcome-card__achieve--locked">
        <UiIcon name="clock" size="20" />
        Сделать своё первое домашнее задание
      </a>
    </nav>
  </article>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'
</script>

<style scoped lang="scss">
@import '@/styles/layout/_layout-features';

.widget-welcome-card {
  width: 100%;
  padding: $m12;
  background-color: $surface-default-accent;
  border-radius: $m10;
  box-shadow: $shadow-md;
  color: $text-default-tertiary;
}

.widget-welcome-card__header {
  text-align: center;
  margin-bottom: $m10;
}

.widget-welcome-card__emoji {
  max-width: 120px;
  margin-bottom: $m6;
}

.widget-welcome-card__title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: $m4;
}

.widget-welcome-card__description {
  font-size: 1rem;
  line-height: 1.5;
}

.widget-welcome-card__achievements {
  display: flex;
  flex-direction: column;
  gap: $m6;
}

.widget-welcome-card__achieve {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $m6 $m8;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: $m8;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover:not(.widget-welcome-card__achieve--locked) {
    transform: translateX(4px);
  }
}

.widget-welcome-card__achieve--done {
  color: $icon-disabled-secondary;
  cursor: pointer;
}

.widget-welcome-card__achieve--active {
  background-color: #f0f4ff;
  border: 2px solid $surface-default-colored-surface-additional;
  font-weight: 600;
  color: $text-default-accent;
}

.widget-welcome-card__achieve--locked {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.widget-welcome-card__achieve-number {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: $m2;
}
</style>