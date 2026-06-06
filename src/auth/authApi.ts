import axios from 'axios'
import { apiBasePath } from '@/auth/authConfig'

export interface AuthUser {
  id: string
  email: string
  first_name?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface SessionResponse {
  authenticated: boolean
  user?: AuthUser
  session_id?: string
}

const refreshClient = axios.create({
  baseURL: apiBasePath,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const authClient = axios.create({
  baseURL: apiBasePath,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const postRefresh = async (): Promise<LoginResponse> => {
  const { data } = await refreshClient.post<LoginResponse>('auth/refresh/')
  return data
}

export const getSession = async (bearer?: string): Promise<SessionResponse> => {
  const headers = bearer ? { Authorization: `Bearer ${bearer}` } : undefined
  const { data } = await authClient.get<SessionResponse>('auth/session/', { headers })
  return data
}

export const postExchangeCode = async (
  code: string,
  redirectUri: string,
): Promise<LoginResponse> => {
  const { data } = await authClient.post<LoginResponse>('auth/exchange/', {
    code,
    redirect_uri: redirectUri,
  })
  return data
}
