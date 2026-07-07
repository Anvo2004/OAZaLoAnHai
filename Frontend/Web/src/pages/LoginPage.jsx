import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2, Lock, User, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import GlobeHero from '@/components/login/GlobeHero'

// mode: 'login' | 'forgot' | 'reset'
export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [mode, setMode] = useState('login')

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [forgotUsername, setForgotUsername] = useState('')
  const [resetForm, setResetForm] = useState({ otp: '', newPassword: '', confirmPassword: '' })

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Đăng nhập thất bại'),
  })

  const forgotMutation = useMutation({
    mutationFn: () => api.post('/api/auth/forgot-password', { username: forgotUsername.trim() }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Mã OTP đã gửi qua Zalo của bạn')
      setMode('reset')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gửi OTP thất bại'),
  })

  const resetMutation = useMutation({
    mutationFn: () =>
      api.post('/api/auth/reset-password', {
        username: forgotUsername.trim(),
        otp: resetForm.otp.trim(),
        newPassword: resetForm.newPassword,
      }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      setMode('login')
      setLoginForm((f) => ({ ...f, username: forgotUsername }))
      setForgotUsername('')
      setResetForm({ otp: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Đặt lại mật khẩu thất bại'),
  })

  const handleLogin = (e) => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    loginMutation.mutate(loginForm)
  }

  const handleForgot = (e) => {
    e.preventDefault()
    if (!forgotUsername.trim()) { toast.error('Vui lòng nhập tên đăng nhập'); return }
    forgotMutation.mutate()
  }

  const handleReset = (e) => {
    e.preventDefault()
    if (!resetForm.otp.trim()) { toast.error('Vui lòng nhập mã OTP'); return }
    if (resetForm.newPassword.length < 6) { toast.error('Mật khẩu mới phải có ít nhất 6 ký tự'); return }
    if (resetForm.newPassword !== resetForm.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }
    resetMutation.mutate()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlobeHero />

      <div className="pointer-events-none relative z-[3] flex min-h-screen items-center justify-end p-6 sm:p-10 lg:px-20">
        <div className="pointer-events-auto animate-drift w-full max-w-[420px]">
          {/* Brand header — floats over the globe */}
          <div className="mb-5 flex flex-col items-center gap-2.5 text-center">
            <img
              src="/images/LogoAnHai.jpg"
              alt="Logo An Hải"
              className="h-16 w-16 rounded-full object-cover"
              style={{ boxShadow: '0 0 0 4px rgba(255,255,255,.16), 0 10px 28px rgba(0,0,0,.55)' }}
            />
            <div>
              <h1
                className="text-xl font-extrabold leading-tight text-white"
                style={{ textShadow: '0 2px 18px rgba(0,0,0,.75)' }}
              >
                UBND Phường An Hải
              </h1>
              <p
                className="mt-1 text-sm text-slate-100/90"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,.75)' }}
              >
                Tiện ích quản lý góp ý và gửi thông tin cảnh báo
              </p>
            </div>
          </div>

          <div
            className="rounded-[20px] border border-white bg-white p-9 transition-all duration-300 hover:shadow-[0_28px_70px_rgba(2,12,40,.55),0_0_0_1px_rgba(16,185,129,.3)]"
            style={{ boxShadow: '0 22px 60px rgba(2,12,40,.5)' }}
          >

            {/* ── BƯỚC 1: Đăng nhập ── */}
            {mode === 'login' && (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-slate-800">Đăng nhập</h2>
                  <p className="text-slate-400 text-sm mt-1">Dành cho cán bộ UBND Phường An Hải</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tên đăng nhập</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        autoComplete="username"
                        autoFocus
                        value={loginForm.username}
                        onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-300"
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    style={{
                      background: loginMutation.isPending ? '#6ee7b7' : 'linear-gradient(135deg, #059669, #10b981)',
                      boxShadow: loginMutation.isPending ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                    }}
                  >
                    {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-black/[0.08] pt-5">
                  {['Tiếp nhận qua Zalo', 'Quản lý góp ý', 'Gửi thông tin cảnh báo'].map((text) => (
                    <span key={text} className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f4c245] text-[11px] font-bold text-[#2a4a1a]">✓</span>
                      {text}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* ── BƯỚC 2: Nhập tên đăng nhập để nhận OTP ── */}
            {mode === 'forgot' && (
              <>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-4"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Quay lại đăng nhập
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 mb-3">
                    <KeyRound className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800">Quên mật khẩu</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Nhập tên đăng nhập. Hệ thống sẽ gửi mã OTP 6 số qua Zalo của bạn.
                  </p>
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tên đăng nhập</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập của bạn"
                        autoFocus
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-300"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: forgotMutation.isPending ? '#6ee7b7' : 'linear-gradient(135deg, #059669, #10b981)',
                      boxShadow: forgotMutation.isPending ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                    }}
                  >
                    {forgotMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {forgotMutation.isPending ? 'Đang gửi...' : 'Gửi mã OTP qua Zalo'}
                  </button>
                </form>
              </>
            )}

            {/* ── BƯỚC 3: Nhập OTP + mật khẩu mới ── */}
            {mode === 'reset' && (
              <>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-4"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Gửi lại mã
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 mb-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800">Đặt lại mật khẩu</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Nhập mã OTP 6 số đã gửi qua Zalo và mật khẩu mới của bạn.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    <span>Tài khoản:</span>
                    <span className="font-semibold">{forgotUsername}</span>
                  </div>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  {/* OTP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mã OTP (6 số)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="_ _ _ _ _ _"
                      autoFocus
                      value={resetForm.otp}
                      onChange={(e) => setResetForm((f) => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-bold tracking-[0.4em] text-slate-800 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Tối thiểu 6 ký tự"
                        value={resetForm.newPassword}
                        onChange={(e) => setResetForm((f) => ({ ...f, newPassword: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                        {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu mới"
                        value={resetForm.confirmPassword}
                        onChange={(e) => setResetForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                        className={`w-full h-11 rounded-xl border bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${resetForm.confirmPassword && resetForm.confirmPassword !== resetForm.newPassword
                            ? 'border-red-300 focus:ring-red-400/30 focus:border-red-400'
                            : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'
                          }`}
                      />
                    </div>
                    {resetForm.confirmPassword && resetForm.confirmPassword !== resetForm.newPassword && (
                      <p className="text-[11px] text-red-500">Mật khẩu xác nhận không khớp</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: resetMutation.isPending ? '#6ee7b7' : 'linear-gradient(135deg, #059669, #10b981)',
                      boxShadow: resetMutation.isPending ? 'none' : '0 4px 14px rgba(5,150,105,0.35)',
                    }}
                  >
                    {resetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {resetMutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p
            className="mt-4.5 text-center text-xs leading-relaxed text-slate-100/85"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,.75)' }}
          >
            Khu vực dành riêng cho cán bộ UBND &bull; Liên hệ quản trị để được hỗ trợ
          </p>
        </div>
      </div>
    </div>
  )
}
