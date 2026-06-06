/**
 * Cross-tab auth sync (cookie watch / reload) is disabled until reliable detection is implemented.
 */

export const AUTH_SESSION_RESTORED_EVENT = 'atrium-auth-session-restored'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for call sites during reimplementation
export const pauseAuthTabSync = (_ms?: number): void => {}

export const broadcastAuthLogout = (): void => {}

export const broadcastAuthLogin = (): void => {}

export const startAuthTabSync = (): (() => void) => () => {}
