<!-- src/components/ui/EmptyState.vue -->
<template>
    <div class="empty-state" :class="`empty-state--${variant}`">
        <!-- Icon -->
        <div class="empty-state__icon">
            <slot name="icon">
                <UiIcon v-if="iconName" :name="iconName" size="48" />
            </slot>
        </div>

        <div class="empty-state__content">
            <!-- Title -->
            <div class="empty-state__info">
                <h3 class="empty-state__title">
                    <slot name="title">{{ title }}</slot>
                </h3>

                <!-- Subtitle -->
                <p v-if="subtitle || $slots.subtitle" class="empty-state__subtitle">
                    <slot name="subtitle">{{ subtitle }}</slot>
                </p>
            </div>

            <!-- Actions (buttons) -->
            <!-- Actions: рендерится только если родитель передал контент -->
            <div v-if="$slots.actions" class="empty-state__actions">
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'

type EmptyStateVariant = 'default' | 'compact' | 'centered'

withDefaults(defineProps<{
    iconName?: IconName
    title: string
    subtitle?: string
    variant?: EmptyStateVariant
}>(), {
    variant: 'default',
    subtitle: '',
})
</script>   

<style scoped lang="scss">
.empty-state {
    @include flex-center(column);
    @include responsive-prop(padding, ($m8, $m12, null));
    gap: $m12;
    max-width: 350px;
    margin: 0 auto;
    text-align: center;

    &--compact {
        padding: $m6;
        gap: $m4;
    }

    &--centered {
        min-height: 360px;
    }

    &__icon {
        color: $text-default-secondary;
    }


    &__content {
        @include flex-center(column);
        gap: $m8;
    }

    &__info {
        @include flex-center(column);
        gap: $m4;
    }

    &__title {
        @include font-titles-bodyheader;
        color: $text-default-primary;
        margin: 0;
    }

    &__subtitle {
        @include font-body-text;
        color: $text-default-secondary;
        margin: 0;
    }

    &__actions {
        margin-top: $m4;
    }
}
</style>