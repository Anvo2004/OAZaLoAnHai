import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Đăng nhập thất bại')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    loginMutation.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d1b2a 0%, #1a3a5c 50%, #0d2d4a 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-600/10" />
        <div className="absolute bottom-12 -right-12 h-48 w-48 rounded-full bg-cyan-500/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-800/10" />

        <div className="relative text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-900/50 mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-white text-3xl font-extrabold mb-3 leading-tight">
            UBND Phường<br />An Hải
          </h1>
          <p className="text-blue-300/80 text-base leading-relaxed max-w-xs mx-auto">
            Hệ thống tiếp nhận & quản lý<br />góp ý, phản ánh từ người dân
          </p>

          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              'Tiếp nhận góp ý qua Zalo OA',
              'Phân công & theo dõi xử lý',
              'Phản hồi trực tiếp qua Zalo',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/30 text-cyan-400 text-[10px] font-bold">✓</span>
                <span className="text-blue-200/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg mb-3">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">UBND Phường An Hải</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-slate-800">Đăng nhập</h2>
              <p className="text-slate-400 text-sm mt-1">Dành cho cán bộ UBND Phường An Hải</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    autoFocus
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                style={{
                  background: loginMutation.isPending
                    ? '#93c5fd'
                    : 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                  boxShadow: loginMutation.isPending ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                }}
              >
                {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-300 mt-6">
              Khu vực dành riêng cho cán bộ UBND &bull; Liên hệ quản trị để được hỗ trợ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
