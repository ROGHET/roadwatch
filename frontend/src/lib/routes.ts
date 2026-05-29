export const routes = {
  home: '/',
  map: '/map',
  complaint: '/complaint',
  dashboard: '/dashboard',
  assistant: '/assistant',
  road: (roadId: string) => `/road/${roadId}`,
} as const
