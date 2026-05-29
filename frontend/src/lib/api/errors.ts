import axios from 'axios'

export type ApiError = {
  message: string
  status?: number
  code?: string
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined
    const message =
      data?.detail ?? data?.message ?? error.message ?? 'Request failed. Please try again.'

    return {
      message,
      status: error.response?.status,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'An unexpected error occurred.' }
}
