import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://roadwatch-api-mrw8.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
