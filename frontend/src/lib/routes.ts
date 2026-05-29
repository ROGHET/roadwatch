export const routes = {
  home: '/',
  complaint: '/complaint',
  dashboard: '/dashboard',
  assistant: '/assistant',
  road: (roadId: string) => `/road/${roadId}`,
} as const
