import axios from 'axios'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api/public',
})

export const ZALO_APP_ID = import.meta.env.VITE_ZALO_APP_ID || ''

export function buildZaloLoginUrl() {
  const redirectUri = window.location.origin + window.location.pathname
  const params = new URLSearchParams({
    app_id: ZALO_APP_ID,
    redirect_uri: redirectUri,
    state: Math.random().toString(36).slice(2),
  })
  return `https://oauth.zaloapp.com/v4/permission?${params.toString()}`
}
