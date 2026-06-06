// src/api/cart.ts
import { api } from '@/api/index'

/**
 * Добавить курс в корзину Потока (продление / monthly), как в личном кабинете Potok.
 * Требует сессию Auth V2 (Bearer + cookie через api client).
 */
export async function addCourseExtensionToCart(
  courseId: number,
  paymentType: 'monthly' | string = 'monthly',
): Promise<unknown> {
  try {
    const response = await api.post('courses/cart/items/add/', {
      content_type: 'course',
      object_id: courseId,
      quantity: 1,
      payment_type: paymentType,
    })
    return response.data
  } catch (error) {
    console.error('[Cart] Failed to add course extension to cart', error)
    throw error
  }
}
