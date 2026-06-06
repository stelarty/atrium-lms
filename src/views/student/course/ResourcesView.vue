<template>
  <div class="student-resources-view">
    <section class="section student-resources-view__section student-resources-view__community">
      <div class="student-resources-view__community-content">
        <h2 class="student-resources-view__title">Сообщество в Telegram / VK</h2>

        <div class="student-resources-view__actions" aria-label="Сообщества курса">
          <BaseButton v-for="link in communityLinks" :key="link.id" type="contained" variant="secondary"
            :href="link.url" target="_blank" width="adaptive">
            {{ link.label }}
          </BaseButton>
        </div>
      </div>

      <div class="student-resources-view__duck" aria-hidden="true">
        <img class="student-resources-view__duck-image" :src="duckImage" alt="" />
      </div>
    </section>

    <section class="section student-resources-view__section">
      <h2 class="student-resources-view__title">Полезные материалы</h2>

      <MaterialFileList :files="materialFileItems" :removable="false" empty-text="Материалов пока нет" />
    </section>

    <section class="section student-resources-view__section student-resources-view__teachers">
      <WidgetCarousel :items="teachers" title="Преподаватели">
        <template #default="{ item }">
          <article class="student-resources-view__teacher">
            <div class="student-resources-view__teacher-photo" aria-hidden="true">
              <img
                v-if="item.photo_url"
                class="student-resources-view__teacher-image"
                :class="{ 'student-resources-view__teacher-image--ready': isPhotoReady(item.id) }"
                :src="item.photo_url"
                :alt="item.fullName"
                decoding="async"
                fetchpriority="high"
                @load="markPhotoReady(item.id)"
                @error="markPhotoReady(item.id)"
              />
              <span v-else>{{ getTeacherInitials(item.fullName) }}</span>
            </div>

            <div class="student-resources-view__teacher-content">
              <h3 class="student-resources-view__teacher-name">{{ item.fullName }}</h3>

              <div class="student-resources-view__chips" aria-label="Достижения преподавателя">
                <span
                  v-for="badge in item.achievements"
                  :key="badge"
                  class="student-resources-view__chip"
                >
                  <UiIcon name="teacherList" :size="19" />
                  {{ badge }}
                </span>
              </div>

              <ul class="student-resources-view__teacher-list">
                <li
                  v-for="detail in item.titles"
                  :key="detail"
                  class="student-resources-view__teacher-item"
                >
                  {{ detail }}
                </li>
              </ul>
            </div>
          </article>
        </template>

        <template #empty>
          <p class="student-resources-view__empty">Пока ничего нет</p>
        </template>
      </WidgetCarousel>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import duckImage from '@/assets/images/subscribe.png'
import { useStudentResources } from '@/composables/useStudentResources'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetCarousel from '@/components/widgets/WidgetCarousel.vue'
import { preloadImages } from '@/utils/preload-images'

interface CommunityLink {
  id: string
  label: string
  url: string
}

const props = defineProps<{
  courseId?: string | number
}>()

const currentCourseId = computed(() => props.courseId)

const { chatLinks, materialFileItems, teachers } = useStudentResources(currentCourseId)

const readyPhotoIds = reactive(new Set<number>())

watch(
  teachers,
  (list) => {
    readyPhotoIds.clear()
    preloadImages(list.map((teacher) => teacher.photo_url))

    list.forEach((teacher) => {
      if (!teacher.photo_url) return
      const probe = new Image()
      probe.src = teacher.photo_url
      if (probe.complete) {
        readyPhotoIds.add(teacher.id)
      }
    })
  },
  { immediate: true },
)

const isPhotoReady = (teacherId: number): boolean => readyPhotoIds.has(teacherId)

const markPhotoReady = (teacherId: number): void => {
  readyPhotoIds.add(teacherId)
}

const communityLinks = computed<CommunityLink[]>(() => {
  const links: CommunityLink[] = []

  if (chatLinks.value?.telegram) {
    links.push({ id: 'telegram', label: 'Telegram', url: chatLinks.value.telegram })
  }

  if (chatLinks.value?.vk) {
    links.push({ id: 'vk', label: 'Вконтакте', url: chatLinks.value.vk })
  }

  return links
})

const getTeacherInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
</script>

<style scoped lang="scss">
.student-resources-view {
  @include flex-center(column, flex-start, stretch);
  @include responsive-prop(gap, ($container-padding-mobile, $container-padding-tablet, null));

  &__section {
    @include flex-center(column, center, flex-start);
    @include responsive-prop(gap, ($m8, $m12, null));
    overflow: hidden;
  }

  &__title {
    @include font-titles-subheader;
    color: $text-default-primary;
  }

  &__community {
    position: relative;
    min-height: 0;

    @include screen-min('md') {
      min-height: 141px;
      justify-content: center;
      padding-right: 210px;
    }
  }

  &__community-content {
    @include flex-center(column, center, flex-start);
    @include responsive-prop(gap, ($m6, $m6, null));
    width: 100%;
  }

  &__actions {
    display: flex;
    @include responsive-prop(flex-direction, (column, row, null));
    @include responsive-prop(align-items, (stretch, flex-start, null));
    @include responsive-prop(gap, ($m3, $m6, null));
    width: 100%;

    @include screen-min('md') {
      width: auto;
    }
  }

  &__duck {
    position: relative;
    width: 124px;
    height: 119px;

    @include screen-min('md') {
      position: absolute;
      right: $m12;
      bottom: -$m5;
      width: 165px;
      height: 158px;
    }
  }

  &__duck-image {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 124px;
    height: auto;
    object-fit: contain;

    @include screen-min('md') {
      width: 165px;
      right: 44px;
    }
  }

  &__teacher {
    display: flex;
    @include responsive-prop(flex-direction, (column, row, null));
    @include responsive-prop(gap, ($m12, $m12, null));
    width: 100%;
  }

  &__teacher-photo {
    @include font-titles-bodyheader;
    @include flex-center(row, center, center);
    // flex: 0 0 125px;
    width: 125px;
    height: 150px;
    overflow: hidden;
    border-radius: $m4;
    background-color: $surface-default-secondary;
    color: $text-default-secondary;
  }

  &__teacher-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s ease;

    &--ready {
      opacity: 1;
    }
  }

  &__teacher-content {
    @include flex-center(column, flex-start, flex-start);
    @include responsive-prop(gap, ($m8, $m8, null));
    min-width: 0;
    flex: 1;
  }

  &__teacher-name {
    @include font-titles-bodyheader;
    color: $text-default-primary;
  }

  &__chips {
    @include flex-center(column, flex-start, flex-start);
    gap: $m2;
  }

  &__chip {
    @include font-body-text;
    display: inline-flex;
    align-items: center;
    gap: $m3;
    max-width: 100%;
    padding: $m3 $m4;
    border-radius: $m4;
    background-color: $surface-default-secondary;
    color: $text-default-primary;


  }

  &__teacher-list {
    @include flex-center(column, flex-start, stretch);
    gap: $m4;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__teacher-item {
    @include font-body-text;
    position: relative;
    padding-left: $m16;
    color: $text-default-secondary;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 20px;
      border-radius: 50px;
      border: 1px solid $text-default-accent;
      background-color: $text-default-accent;
    }
  }

  &__teachers {
    :deep(.widget-carousel__header) {
      width: 100%;
    }
  }

  &__empty {
    @include font-body-text;
    color: $text-default-label;
    margin: 0;
  }
}
</style>