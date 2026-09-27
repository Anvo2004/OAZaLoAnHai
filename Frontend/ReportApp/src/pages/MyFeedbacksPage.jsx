import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import BlobBackground from '@/components/BlobBackground'
import { api, authHeader } from '@/lib/api'

const ACCENT = 'linear-gradient(135deg,#059669 0%,#0d9488 40%,#0891b2 74%,#0ea5e9 100%)'

function formatDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

// Danh sách + trạng thái LIVE từ Cổng góp ý 1022 — thay cho lệnh #theodoi trong chat OA
// (lệnh chat dùng ID webhook OA, khác với ID OAuth ReportApp dùng để tạo phản ánh, nên
// không bao giờ khớp được các phản ánh gửi qua ReportApp — xem Backend/api/routes/public.js).
export default function MyFeedbacksPage({ accessToken, onBack }) {
  const [items, setItems] = useState(null) // null = đang tải, [] = rỗng
  const [selected, setSelected] = useState(null) // gopyId đang xem chi tiết
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/my-feedbacks', authHeader(accessToken))
      .then(res => setItems(res.data.items || []))
      .catch(() => { setItems([]); setError('Không tải được danh sách phản ánh.') })
  }, [accessToken])

  function openDetail(gopyId) {
    setSelected(gopyId)
    setDetail(null)
    setError('')
    setDetailLoading(true)
    api.get(`/my-feedbacks/${gopyId}`, authHeader(accessToken))
      .then(res => setDetail(res.data))
      .catch(err => setError(err.response?.data?.error || 'Không lấy được trạng thái mới nhất từ Cổng góp ý.'))
      .finally(() => setDetailLoading(false))
  }

  const header = (title) => (
    <div className="relative overflow-hidden mx-auto max-w-md rounded-[24px] px-5 py-5 text-white animate-fade-in mb-4" style={{ background: ACCENT, boxShadow: '0 20px 44px -16px rgba(13,148,136,0.55)' }}>
      <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={selected ? () => setSelected(null) : onBack}
          className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="font-extrabold text-lg leading-tight tracking-tight">{title}</div>
      </div>
    </div>
  )

  // Màn chi tiết — trạng thái live 1 phản ánh
  if (selected) {
    return (
      <BlobBackground className="p-4">
        {header(`Mã phản ánh ${selected}`)}
        <Card className="mx-auto max-w-md animate-fade-in" style={{ boxShadow: '0 18px 46px -22px rgba(6,95,70,0.42)' }}>
          <CardContent className="pt-6 space-y-4">
            {detailLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Đang lấy trạng thái mới nhất...
              </div>
            )}
            {!detailLoading && error && <p className="text-sm text-destructive">{error}</p>}
            {!detailLoading && detail && (
              <>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Tiêu đề</p>
                  <p className="text-sm font-semibold">{detail.title}</p>
                </div>
                {detail.address && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Địa chỉ</p>
                    <p className="text-sm">{detail.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 font-medium">Nội dung</p>
                  <p className="text-sm whitespace-pre-wrap">{detail.content}</p>
                </div>
                <div className="rounded-xl px-4 py-3 text-center" style={{ background: detail.resolved ? '#ecfdf5' : '#fffbeb' }}>
                  <p className="text-sm font-bold" style={{ color: detail.resolved ? '#0f766e' : '#b45309' }}>
                    {detail.resolved ? '✅' : '🕐'} {detail.statusLabel}
                  </p>
                </div>
                {detail.resolved && detail.resultContent && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Kết quả xử lý</p>
                    <p className="text-sm whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{detail.resultContent}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </BlobBackground>
    )
  }

  // Màn danh sách
  return (
    <BlobBackground className="p-4">
      {header('Phản ánh của tôi')}
      <Card className="mx-auto max-w-md animate-fade-in" style={{ boxShadow: '0 18px 46px -22px rgba(6,95,70,0.42)' }}>
        <CardContent className="pt-6">
          {items === null && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
            </div>
          )}
          {items !== null && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-center">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">Chưa có phản ánh nào được đồng bộ mã Cổng góp ý.</p>
            </div>
          )}
          {items && items.length > 0 && (
            <div className="divide-y divide-slate-100">
              {items.map((it) => (
                <button
                  key={it.gopyId}
                  type="button"
                  onClick={() => openDetail(it.gopyId)}
                  className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-accent/60 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{it.title}</p>
                    <p className="text-xs text-slate-400">Mã {it.gopyId} · {formatDate(it.createdAt)}</p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </BlobBackground>
  )
}
