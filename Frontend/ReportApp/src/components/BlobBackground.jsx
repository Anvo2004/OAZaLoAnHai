const PAGE_BG = 'linear-gradient(180deg, #f3eefc 0%, #eff1fd 55%, #f6f0fb 100%)'
const BLOB_A = 'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.5), transparent 62%)'
const BLOB_B = 'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.34), transparent 62%)'
const BLOB_C = 'radial-gradient(circle at 50% 50%, rgba(96,165,250,0.30), transparent 62%)'

// Nền gradient + 3 khối "blob" trôi nổi + lưới chấm mờ dần — dùng chung cho cả 3 màn hình
export default function BlobBackground({ children, className = '' }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: PAGE_BG }}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-[14%] -left-[20%] w-[60vw] h-[60vw] max-w-[560px] max-h-[560px] rounded-full blur-[64px] animate-blob-a" style={{ background: BLOB_A }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[18%] -right-[16%] w-[56vw] h-[56vw] max-w-[520px] max-h-[520px] rounded-full blur-[70px] animate-blob-b" style={{ background: BLOB_B }} />
      <div aria-hidden="true" className="pointer-events-none absolute top-[40%] left-[44%] w-[38vw] h-[38vw] max-w-[380px] max-h-[380px] rounded-full blur-[60px] animate-blob-c" style={{ background: BLOB_C }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 dot-grid" />
      <div className={`relative z-[1] ${className}`}>{children}</div>
    </div>
  )
}
