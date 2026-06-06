<template>
  <Transition name="app-cookie-notice">
    <div v-if="showBanner" class="app-cookie-notice" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <div class="app-cookie-notice__inner">
        <p class="app-cookie-notice__text">
          Мы используем
          <a
            :href="privacyUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="app-cookie-notice__link"
          >
            cookies
          </a>,
          чтобы сайт был лучше
        </p>

        <img
          :src="cookieImageUrl"
          alt=""
          class="app-cookie-notice__image"
          aria-hidden="true"
          width="87"
          height="75"
        />

        <button type="button" class="app-cookie-notice__button" @click="acceptNotice">
          Хорошо
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import cookieImageUrl from '@/assets/images/cookie.svg'

const STORAGE_KEY = 'atrium-cookie-notice-dismissed'

const route = useRoute()
const isVisible = ref(false)

const isAccessDeniedPage = computed(() => route.name === 'access-denied')

const showBanner = computed(() => isVisible.value && !isAccessDeniedPage.value)

const privacyUrl = computed(() => `${window.location.origin}/конфиденциальность.pdf`)

const acceptNotice = (): void => {
  localStorage.setItem(STORAGE_KEY, 'true')
  isVisible.value = false
}

onMounted(() => {
  isVisible.value = localStorage.getItem(STORAGE_KEY) !== 'true'
})
</script>

<style scoped lang="scss">
.app-cookie-notice {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  padding: 0;
  pointer-events: none;
}

.app-cookie-notice-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-cookie-notice-leave-active {
  transition:
    transform 0.3s ease-in,
    opacity 0.3s ease-in;
}

.app-cookie-notice-enter-from,
.app-cookie-notice-leave-to {
  transform: translateY(calc(100% + 32px));
  opacity: 0;
}

.app-cookie-notice__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  width: 100%;
  max-width: 100%;
  height: 46px;
  background-color: #282931;
  overflow: visible;
  pointer-events: all;
}

.app-cookie-notice__text {
  margin: 0;
  color: #f1f1f3;
  font-family: 'Onest', Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.02px;
  white-space: nowrap;
}

.app-cookie-notice__link {
  color: #aab2ff;
  text-decoration: none;
  cursor: pointer;
}

.app-cookie-notice__link:hover {
  color: #c4caff;
}

.app-cookie-notice__image {
  align-self: flex-end;
  flex-shrink: 0;
  display: block;
}

.app-cookie-notice__button {
  flex-shrink: 0;
  width: 84px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50px;
  background-color: #606fff;
  color: #fff;
  font-family: 'Onest', Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.15s;
}

.app-cookie-notice__button:hover {
  background-color: #7b8fff;
}

@media (max-width: 768px) {
  .app-cookie-notice__inner {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    padding: 12px 16px;
    gap: 8px;
  }

  .app-cookie-notice__text {
    white-space: normal;
    max-width: 198px;
  }

  .app-cookie-notice__image {
    position: absolute;
    width: 131px;
    height: 113px;
    bottom: 0;
  }
}
</style>
