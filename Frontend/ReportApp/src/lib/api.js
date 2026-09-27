import axios from 'axios'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api/public',
})

// Gửi access token Zalo qua header Authorization, không đặt trên URL: URL bị ghi vào log máy chủ
// và gửi kèm khi chuyển trang, nên token dễ bị lộ.
export function authHeader(accessToken) {
  return { headers: { Authorization: `Bearer ${accessToken}` } }
}

export const ZALO_APP_ID = import.meta.env.VITE_ZALO_APP_ID || ''

export function buildZaloLoginUrl() {
  const redirectUri = window.location.origin + window.location.pathname
  const params = new URLSearchParams({
    app_id: ZALO_APP_ID,
    redirect_uri: redirectUri,
    state: Math.random().toString(36).slice(2),
    scope: 'phone',
  })
  return `https://oauth.zaloapp.com/v4/permission?${params.toString()}`
}
