import { Button } from '@/components/ui/button'
import BlobBackground from '@/components/BlobBackground'

const ACCENT = 'linear-gradient(135deg,#059669 0%,#0d9488 40%,#0891b2 74%,#0ea5e9 100%)'

const ROW_DEFS = [
  { key: 'title',        label: 'Tiêu đề',       bold: true, multiline: true },
  { key: 'contact',      label: 'Liên hệ' },
  { key: 'categoryName', label: 'Loại góp ý' },
  { key: 'content',      label: 'Nội dung',      multiline: true },
  { key: 'address',      label: 'Địa chỉ' },
  { key: 'imageCount',   label: 'Hình ảnh',      format: (v) => v > 0 ? `${v} ảnh đính kèm` : 'Không có' },
]

export default function SuccessScreen({ info = {}, onReset }) {
  const { code, pending } = info

  return (
    <BlobBackground className="flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-sm animate-fade-in space-y-4">

        {/* Header xác nhận */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white text-center shadow-lg shadow-emerald-200">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="text-lg font-bold">Đã tiếp nhận phản ánh</h1>
          <p className="text-sm text-emerald-100 mt-1">
            UBND sẽ phản hồi trong vòng 5 ngày làm việc qua Zalo của bạn.
          </p>
        </div>

        {/* Mã tra cứu Cổng góp ý 1022 */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-4 py-3.5 text-center">
          {code ? (
            <>
              <p className="text-xs font-medium text-slate-400">Mã phản ánh</p>
              <p className="text-2xl font-bold text-primary mt-0.5">{code}</p>
            </>
          ) : pending ? (
            <>
              <p className="text-sm font-medium text-amber-600">⏳ Mã tra cứu đang được đồng bộ</p>
              <p className="text-xs text-slate-400 mt-1">Chúng tôi sẽ nhắn Zalo báo mã ngay khi có, không cần chờ ở màn hình này.</p>
            </>
          ) : null}
        </div>

        {/* Thông tin góp ý */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">📋 Thông tin góp ý</p>
          </div>
          <div className="divide-y divide-slate-50">
            {ROW_DEFS.map(({ key, label, bold, color, multiline, format }) => {
              const raw = info[key]
              if (raw === undefined || raw === null || raw === '') return null
              const display = format ? format(raw) : raw
              return (
                <div key={key} className={`px-4 py-3 ${multiline ? 'flex flex-col gap-0.5' : 'flex items-start justify-between gap-3'}`}>
                  <span className="text-xs text-slate-400 shrink-0 font-medium min-w-[80px]">{label}</span>
                  <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${color || 'text-slate-700'} ${multiline ? '' : 'text-right'}`}>
                    {display}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lời cảm ơn */}
        <div className="rounded-2xl px-4 py-3 text-center" style={{ background: '#ecfdf5', border: '1px solid rgba(13,148,136,0.18)' }}>
          <p className="text-sm font-medium" style={{ color: '#0f766e' }}>
            🙏 Cảm ơn bạn đã tin tưởng gởi phản ánh tới UBND phường An Hải!
          </p>
        </div>

        <Button
          className="relative overflow-hidden w-full"
          size="lg"
          onClick={onReset}
          style={{ background: ACCENT, boxShadow: '0 16px 32px -14px rgba(13,148,136,0.55)' }}
        >
          <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
          <span className="relative">Gửi phản ánh khác</span>
        </Button>
      </div>
    </BlobBackground>
  )
}
