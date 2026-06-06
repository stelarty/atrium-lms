import { api } from '@/api/index'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  MOCK_PROFILE,
  MOCK_STUDENT_COURSES,
  MOCK_STUDENT_PROGRAM,
  MOCK_CHAT_LINKS,
  MOCK_USEFUL_MATERIALS,
  MOCK_HOMEWORK_RESPONSE,
  MOCK_LESSON_DETAIL,
  MOCK_ONBOARDING,
} from './mockData'

interface MockResponse {
  data: unknown
  status: number
  statusText: string
  headers: Record<string, string>
  config: InternalAxiosRequestConfig
}

function buildMockResponse(config: InternalAxiosRequestConfig, data: unknown): MockResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

function resolveMockData(url: string): unknown {
  // Profile
  if (url.includes('/edspace/profile/')) return MOCK_PROFILE

  // Onboarding
  if (url.includes('/edspace/onboarding')) return MOCK_ONBOARDING

  // Student courses list (must come before singular course check)
  if (/\/edspace\/student\/lms-courses\/?$/.test(url)) return MOCK_STUDENT_COURSES

  // Student useful materials
  if (url.includes('/useful-materials/')) return MOCK_USEFUL_MATERIALS

  // Student chat links
  if (url.includes('/chat-links/')) return MOCK_CHAT_LINKS

  // Student homework
  if (url.includes('/homework/')) return MOCK_HOMEWORK_RESPONSE

  // Student course header (singular)
  if (/\/edspace\/student\/lms-courses\/\d+\/?$/.test(url)) return MOCK_STUDENT_COURSES[0]

  // Student program
  if (url.includes('/edspace/student/program/')) return MOCK_STUDENT_PROGRAM

  // Student lesson detail
  if (url.includes('/edspace/student/lms-lessons/')) return MOCK_LESSON_DETAIL

  // Default — return empty success
  return {}
}

export function setupApiMocks(): void {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<MockResponse> => {
    const url = config.url || ''
    const method = (config.method || 'get').toLowerCase()

    if (method !== 'get') {
      return buildMockResponse(config, {})
    }

    return buildMockResponse(config, resolveMockData(url))
  }
}
