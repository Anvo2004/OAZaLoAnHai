import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import BlobBackground from '@/components/BlobBackground'
import { buildZaloLoginUrl } from '@/lib/api'

const ACCENT = 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 40%,#d946ef 74%,#fb7185 100%)'

export default function ZaloLoginGate({ loading, error }) {
  return (
    <BlobBackground className="flex flex-col items-center justify-start p-4 gap-4 pt-6">
      <div
        className="relative overflow-hidden w-full max-w-sm rounded-[24px] px-5 py-6 text-center text-white animate-fade-in"
        style={{ background: ACCENT, boxShadow: '0 20px 44px -16px rgba(139,92,246,0.55)' }}
      >
        <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
        <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold tracking-[1.5px] uppercase mb-3" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)' }}>
          <Sparkles className="h-3 w-3" /> Chuyển đổi số
        </div>
        <div className="relative text-xl font-extrabold tracking-tight">UBND phường An Hải</div>
        <p className="relative text-sm text-white/85 mt-1">Góp ý - Phản ánh</p>
      </div>

      <Card className="w-full max-w-sm animate-fade-in" style={{ boxShadow: '0 18px 46px -22px rgba(90,70,170,0.42)' }}>
        <CardContent className="space-y-4 text-center pt-6">
          <p className="text-sm text-muted-foreground">
            Vui lòng đăng nhập bằng Zalo để gửi góp ý / phản ánh. Cán bộ sẽ phản hồi trực tiếp qua Zalo của bạn.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="relative overflow-hidden w-full"
            size="lg"
            disabled={loading}
            onClick={() => { window.location.href = buildZaloLoginUrl() }}
            style={{ background: ACCENT, boxShadow: '0 16px 32px -14px rgba(139,92,246,0.55)' }}
          >
            {!loading && <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />}
            <span className="relative">{loading ? 'Đang xử lý...' : 'Đăng nhập bằng Zalo'}</span>
          </Button>
        </CardContent>
      </Card>
    </BlobBackground>
  )
}
