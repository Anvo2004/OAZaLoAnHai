import { useEffect, useState } from 'react'
import ZaloLoginGate from '@/pages/ZaloLoginGate'
import FeedbackForm from '@/pages/FeedbackForm'
import SuccessScreen from '@/pages/SuccessScreen'
import MyFeedbacksPage from '@/pages/MyFeedbacksPage'
import PhoneConsentDialog from '@/components/PhoneConsentDialog'
import { api } from '@/lib/api'

export default function App() {
  const [auth, setAuth] = useState(null) // { accessToken, profile, consent }
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [submittedInfo, setSubmittedInfo] = useState(null)
  const [view, setView] = useState('form') // 'form' | 'history'
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    setLoadingLogin(true)
    api.post('/zalo-login', { code })
      .then(res => {
        setAuth(res.data)
        // Lần đầu (chưa đồng ý) → hiện ngay thông báo xin phép sử dụng SĐT
        if (!res.data.consent?.granted) setShowConsent(true)
      })
      .catch(err => setLoginError(err.response?.data?.error || 'Đăng nhập Zalo thất bại, vui lòng thử lại'))
      .finally(() => {
        setLoadingLogin(false)
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, [])

  function updateConsent(consent) {
    setAuth(prev => ({ ...prev, consent }))
    setShowConsent(false)
  }

  if (!auth) {
    return <ZaloLoginGate loading={loadingLogin} error={loginError} />
  }

  let page
  if (submittedInfo) {
    page = <SuccessScreen info={submittedInfo} onReset={() => setSubmittedInfo(null)} />
  } else if (view === 'history') {
    page = <MyFeedbacksPage accessToken={auth.accessToken} onBack={() => setView('form')} />
  } else {
    page = (
      <FeedbackForm
        profile={auth.profile}
        accessToken={auth.accessToken}
        consent={auth.consent}
        onRequestConsent={() => setShowConsent(true)}
        onConsentRequired={() => { updateConsent({ granted: false, phone: '', suggestedPhone: '' }); setShowConsent(true) }}
        onSuccess={setSubmittedInfo}
        onShowHistory={() => setView('history')}
      />
    )
  }

  return (
    <>
      {page}
      {showConsent && (
        <PhoneConsentDialog
          accessToken={auth.accessToken}
          consent={auth.consent}
          onGranted={updateConsent}
          onRevoked={updateConsent}
          onClose={() => setShowConsent(false)}
        />
      )}
    </>
  )
}
