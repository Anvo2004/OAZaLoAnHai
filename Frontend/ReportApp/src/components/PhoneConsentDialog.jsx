import { useState } from 'react'
import { Loader2, Phone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, authHeader } from '@/lib/api'

const ACCENT = 'linear-gradient(135deg,#059669 0%,#0d9488 40%,#0891b2 74%,#0ea5e9 100%)'

function isValidPhone(v) {
  return /^(0|\+?84)[3-9]\d{8}$/.test(v.replace(/[\s.-]/g, ''))
}

// Thông báo xin phép sử dụng SĐT — hiện lần đầu người dân vào form góp ý.
// Đồng ý → lưu vào DB (POST /phone-consent), các lần sau không hỏi lại và form tự điền SĐT.
// Mở lại từ nút "Đổi số" trên form để cập nhật SĐT hoặc thu hồi quyền.
export default function PhoneConsentDialog({ accessToken, consent, onGranted, onRevoked, onClose }) {
  const [phone, setPhone] = useState(consent?.phone || consent?.suggestedPhone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const alreadyGranted = !!consent?.granted

  async function handleAgree(e) {
    e.preventDefault()
    setError('')
    if (!isValidPhone(phone)) {
      setError('Số điện thoại không hợp lệ (VD: 0912345678)')
      return
    }
    setSaving(true)
    try {
      const res = await api.post('/phone-consent', { phone }, authHeader(accessToken))
      onGranted(res.data.consent)
    } catch (err) {
      setError(err.response?.data?.error || 'Không lưu được, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke() {
    if (!window.confirm('Thu hồi quyền sử dụng số điện thoại? Bạn sẽ cần cho phép lại khi gửi góp ý.')) return
    setSaving(true)
    try {
      const res = await api.delete('/phone-consent', authHeader(accessToken))
      onRevoked(res.data.consent)
    } catch (err) {
      setError(err.response?.data?.error || 'Không thu hồi được, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <form onSubmit={handleAgree} className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 text-white" style={{ background: ACCENT }}>
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 id="consent-title" className="text-center text-lg font-extrabold">
            {alreadyGranted ? 'Số điện thoại liên hệ' : 'Cho phép sử dụng số điện thoại'}
          </h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            <b>UBND phường An Hải</b> xin phép sử dụng số điện thoại của bạn để:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
            <li>Liên hệ, xác minh nội dung góp ý, phản ánh khi cần</li>
            <li>Gửi kèm phản ánh lên Cổng góp ý thành phố Đà Nẵng</li>
            <li>Tự động điền cho các lần gửi góp ý sau</li>
          </ul>
          <p className="text-xs text-slate-400">
            Số điện thoại chỉ dùng cho việc tiếp nhận, xử lý phản ánh và không công khai. Bạn có thể đổi số hoặc thu hồi quyền bất cứ lúc nào.
          </p>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="consent-phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="consent-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            {alreadyGranted ? 'Đóng' : 'Từ chối'}
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={saving}
            style={{ background: ACCENT }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {alreadyGranted ? 'Lưu số mới' : 'Đồng ý'}
          </Button>
        </div>

        {alreadyGranted && (
          <div className="px-5 pb-4 -mt-2 text-center">
            <button type="button" onClick={handleRevoke} disabled={saving} className="text-xs text-slate-400 underline hover:text-destructive">
              Thu hồi quyền sử dụng số điện thoại
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
