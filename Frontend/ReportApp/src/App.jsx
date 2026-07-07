import { useEffect, useState } from 'react'
import ZaloLoginGate from '@/pages/ZaloLoginGate'
import FeedbackForm from '@/pages/FeedbackForm'
import SuccessScreen from '@/pages/SuccessScreen'
import { api } from '@/lib/api'

export default function App() {
  const [auth, setAuth] = useState(null) // { accessToken, profile }
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [submittedInfo, setSubmittedInfo] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    setLoadingLogin(true)
    api.post('/zalo-login', { code })
      .then(res => setAuth(res.data))
      .catch(err => setLoginError(err.response?.data?.error || 'Đăng nhập Zalo thất bại, vui lòng thử lại'))
      .finally(() => {
        setLoadingLogin(false)
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, [])

  if (!auth) {
    return <ZaloLoginGate loading={loadingLogin} error={loginError} />
  }

  if (submittedInfo) {
    return <SuccessScreen info={submittedInfo} onReset={() => setSubmittedInfo(null)} />
  }

  return (
    <FeedbackForm
      profile={auth.profile}
      accessToken={auth.accessToken}
      onSuccess={setSubmittedInfo}
    />
  )
}
