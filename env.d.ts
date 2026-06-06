/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_BASE_URL?: string
  readonly VITE_LMS_BASE_URL?: string
  readonly VITE_OLYMP_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
