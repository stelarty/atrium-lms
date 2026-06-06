import type { LmsCourseResponse } from '@/types/course'
import { useCourseStore } from '@/stores/useCourseStore'
import { useRouter } from 'vue-router'

export interface Course extends LmsCourseResponse {
  accessDate: string
  sectionTitle: string
}

export function useTeacherCourseCreation() {
  const courseStore = useCourseStore()
  const router = useRouter()

  /**
   * Создаёт локальный черновик курса и переводит пользователя на экран настройки.
   */
  const createCourse = async (courseTitle: string = 'Название курса'): Promise<Course> => {
    try {
      const currentYear = new Date().getFullYear()
      const accessDate = new Date(currentYear, 11, 31).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      const newCourse: Course = {
        title: courseTitle,
        accessDate,
        sectionTitle: 'Раздел',
        // Заполняем минимальные необходимые поля для нового курса
        id: 0,
        subject: 'mathematics',
        sales_mode: 'blocks',
        parts_count: 1,
        trial_period: false,
        program_url: '',
        display_mode: 'sales_parts',
        has_difficulty_levels: false,
        lesson_count: 0,
        start_date: '',
        end_date: '',
        materials_available_until: '',
        video_conference_url: '',
        telegram_chat_link: '',
        vk_chat_invite_link: '',
        parts: [], // Инициализируем пустым массивом
      }

      courseStore.initializeDraftCourse(courseTitle)


      // Перенаправляем на страницу нового курса без перезагрузки
      await router.push({ name: 'teacher-new-course' })

      return newCourse
    } catch (error) {
      console.error('Ошибка при создании черновика курса:', error)
      throw error
    }
  }


  return {
    createCourse,
  }
}
