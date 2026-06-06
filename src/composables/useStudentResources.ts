// src/composables/useStudentResources.ts
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import type { MaterialFileItem } from '@/types/file-upload'

type CourseIdSource = Ref<string | number | null | undefined> | ComputedRef<string | number | null | undefined>

const decodeHtmlEntities = (value: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

const getFileExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()
  return extension ? extension.toUpperCase().slice(0, 4) : 'FILE'
}

export function useStudentResources(courseId: CourseIdSource) {
  const studentCourseStore = useStudentCourseStore()
  const isLoading = ref(false)

  const normalizedCourseId = computed(() => {
    const value = courseId.value
    return value ? String(value) : ''
  })

  const chatLinks = computed(() => studentCourseStore.chatLinks)
  
  const materials = computed(() => {
    return [...(studentCourseStore.usefulMaterials?.useful_materials ?? [])].sort(
      (a, b) => a.order - b.order,
    )
  })
  
  const materialFileItems = computed<MaterialFileItem[]>(() => {
    return materials.value.map((material) => ({
      clientId: `useful-material-${material.id}`,
      fileId: material.id,
      originalName: material.original_file_name,
      fileUrl: material.file_url,
      extension: getFileExtension(material.original_file_name),
      progress: 100,
      status: 'done',
    }))
  })
  
  const teachers = computed(() => {
    const baseTeachers = (studentCourseStore.usefulMaterials?.teachers ?? []).map((teacher) => ({
      ...teacher,
      fullName: [teacher.last_name, teacher.first_name, teacher.patronymic].filter(Boolean).join(' '),
      achievements: teacher.achievements.map(decodeHtmlEntities),
      titles: teacher.titles.map(decodeHtmlEntities),
    }))

    // 🔥 MOCK: добавляем 2 фейковых учителя для тестирования верстки (только в дев-режиме)
    // Удалите этот блок перед деплоем в продакшен
    if (import.meta.env.DEV && baseTeachers.length > 0 && baseTeachers.length < 4) {
      const template = baseTeachers[0]
      const mockTeachers = [
        {
          id: 9991,
          first_name: 'Анна',
          last_name: 'Петрова',
          patronymic: 'Сергеевна',
          achievements: ['Победитель ВсОШ по химии', 'Призёр международной олимпиады'],
          titles: [
            'Выпускница химического факультета МГУ',
            'Преподаватель с 8-летним стажем',
            'Автор методических пособий для подготовки к олимпиадам',
          ],
          photo_url: template?.photo_url ?? null,
          subject: template?.subject ?? 'biology',
          fullName: 'Петрова Анна Сергеевна',
        },
        {
          id: 9992,
          first_name: 'Дмитрий',
          last_name: 'Соколов',
          patronymic: 'Александрович',
          achievements: ['Финалист олимпиады «Я — профессионал»', 'Победитель регионального этапа ВсОШ'],
          titles: [
            'Кандидат биологических наук',
            'Эксперт предметной комиссии ВсОШ',
            'Преподаватель Лицея ВШЭ (2021–2024)',
          ],
          photo_url: template?.photo_url ?? null,
          subject: template?.subject ?? 'biology',
          fullName: 'Соколов Дмитрий Александрович',
        },
      ]
      return [...baseTeachers, ...mockTeachers]
    }

    return baseTeachers
  })

  const loadResources = async (): Promise<void> => {
    if (!normalizedCourseId.value) return

    isLoading.value = true

    try {
      await Promise.all([
        studentCourseStore.loadChatLinks(normalizedCourseId.value),
        studentCourseStore.loadUsefulMaterials(normalizedCourseId.value),
      ])
    } finally {
      isLoading.value = false
    }
  }

  watch(
    normalizedCourseId,
    () => {
      void loadResources()
    },
    { immediate: true },
  )

  return {
    isLoading,
    chatLinks,
    materials,
    materialFileItems,
    teachers,
    loadResources,
  }
}