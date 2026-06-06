<!-- Top-of-layout student banner: VK / Telegram from store (GET …/lms-courses/:id/chat-links/). -->
<template>
    <Transition name="banner-fade">
        <div v-if="showBanner" class="widget-course-chat-banner" role="banner" aria-label="Ссылки на чаты курса">
            <div class="widget-course-chat-banner__inner">
                <p class="widget-course-chat-banner__text">
                    Перед тем как начать обучение, рекомендуем вступить в VK и Телеграм
                </p>

                <div class="widget-course-chat-banner__actions">

                    <BaseButton v-if="vkLink" :href="vkLink" target="_blank" rel="noopener noreferrer"
                        variant="secondary" type="contained" width="fit">
                        <span>Вступите в VK</span>
                    </BaseButton>

                    <BaseButton v-if="telegramLink" :href="telegramLink" target="_blank" rel="noopener noreferrer"
                        variant="secondary" type="contained" width="fit">
                        <span>Вступите в Telegram</span>
                    </BaseButton>

                    <BaseIconButton variant="secondary" type="text" aria-label="Закрыть баннер" @click="dismiss"
                        class="widget-course-chat-banner__close">
                        <UiIcon name="close" size="24" color="#fff" />
                    </BaseIconButton>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import UiIcon from '@/components/ui/UiIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'

const route = useRoute()
const studentCourseStore = useStudentCourseStore()
const { chatLinks } = storeToRefs(studentCourseStore)

/** Same course id semantics as the rest of the student shell (URL or header after redirect). */
const effectiveCourseId = computed(() => {
    const id = route.params.id
    if (typeof id === 'string' && id) return id
    if (Array.isArray(id) && id[0]) return String(id[0])

    const courseId = route.params.courseId
    if (typeof courseId === 'string' && courseId) return courseId
    if (Array.isArray(courseId) && courseId[0]) return String(courseId[0])

    const headerId = studentCourseStore.courseHeader?.id
    return headerId != null ? String(headerId) : ''
})

const vkLink = computed(() => chatLinks.value?.vk?.trim() || '')
const telegramLink = computed(() => chatLinks.value?.telegram?.trim() || '')
const hasLinks = computed(() => Boolean(vkLink.value || telegramLink.value))

const sessionDismissKey = computed(() => {
    const id = effectiveCourseId.value
    return id ? `lms:student:course-chat-top-banner:dismissed:${id}` : ''
})

const isDismissed = ref(false)

const readDismissed = (): void => {
    const key = sessionDismissKey.value
    if (!key || typeof sessionStorage === 'undefined') {
        isDismissed.value = false
        return
    }
    isDismissed.value = sessionStorage.getItem(key) === '1'
}

const dismiss = (): void => {
    const key = sessionDismissKey.value
    if (key && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, '1')
    }
    isDismissed.value = true
}

onMounted(readDismissed)
watch(sessionDismissKey, readDismissed)

watch(
    effectiveCourseId,
    (courseId) => {
        readDismissed()
        if (!courseId) return
        void studentCourseStore.loadChatLinks(courseId, false, { silent: true })
    },
    { immediate: true },
)

const showBanner = computed(
    () => hasLinks.value && Boolean(effectiveCourseId.value) && !isDismissed.value,
)
</script>

<style scoped lang="scss">
.widget-course-chat-banner {
    background-color: $surface-default-accent;
    padding: $m8;
    position: relative;
    z-index: 100;
    margin: $m8 $m8 0;
    border-radius: $m8;
    position: relative;

    &__inner {
        @include flex-center($justify: space-between);
        gap: $m6;
        @include responsive-prop(flex-wrap, (wrap, nowrap, null));
    }

    &__text {
        @include font-titles-bodyheader();
        color: $text-default-tertiary;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: $m4;
    }

    &__link {
        display: inline-flex;
        align-items: center;
        gap: $m2;
        padding: $m2 $m4;
        background-color: $surface-default-primary;
        border-radius: $m4;
        color: $text-default-primary;
        text-decoration: none;
        transition: background-color 0.2s ease;
        @include font-body-caption;

        &:hover {
            background-color: $surface-hover-primary;
        }

        &:active {
            background-color: $surface-pressed-primary;
        }
    }

    &__close {
        position: absolute;
        top: 0;
        right: 0;

        @include screen-min('md') {
            position: relative;
        }
    }
}

.banner-fade-enter-active,
.banner-fade-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.banner-fade-enter-from,
.banner-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@media (max-width: 768px) {
    .widget-course-chat-banner {
        &__inner {
            flex-direction: column;
            align-items: flex-start;
            gap: $m4;
        }

        &__text {
            width: 100%;
        }

        &__actions {
            width: 100%;
            justify-content: space-between;

            .widget-course-chat-banner__link {
                flex: 1;
                justify-content: center;
            }
        }
    }
}
</style>
