import { useEffect, useState } from 'react'
import { MapPin, Loader2, Send, Pencil, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BlobBackground from '@/components/BlobBackground'
import { api } from '@/lib/api'

const ACCENT = 'linear-gradient(135deg,#059669 0%,#0d9488 40%,#0891b2 74%,#0ea5e9 100%)'

const MAX_IMAGES = 5
const MAX_SIZE = 5 * 1024 * 1024

// Lấy vị trí qua Zalo JSBridge (nếu chạy trong Zalo webview) hoặc browser geolocation.
// KHÔNG tự reverse-geocode ở đây — backend tự điền tên địa chỉ khi address rỗng
// (xem reverseGeocodeAddress() trong Backend/src/services/feedbackService.js) để tránh
// trùng lặp logic gọi Nominatim ở cả 2 nơi.
async function detectLocation() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 12000)

    const done = (lat, lng) => {
      clearTimeout(timeout)
      resolve({ lat, lng })
    }

    if (window.ZaloJSBridge) {
      window.ZaloJSBridge.invoke('getLocation', {}, (result) => {
        if (result && result.error === 0) {
          done(result.latitude, result.longitude)
        } else {
          tryBrowserGeo(done, () => { clearTimeout(timeout); reject(new Error('Không lấy được vị trí')) })
        }
      })
    } else if (navigator.geolocation) {
      tryBrowserGeo(done, () => { clearTimeout(timeout); reject(new Error('Không lấy được vị trí')) })
    } else {
      clearTimeout(timeout)
      reject(new Error('Trình duyệt không hỗ trợ GPS'))
    }
  })
}

function tryBrowserGeo(onSuccess, onError) {
  navigator.geolocation.getCurrentPosition(
    (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
    onError,
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

export default function FeedbackForm({ profile, accessToken, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [contact, setContact] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState([]) // [{file, previewUrl}]
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState(null) // { lat, lng }
  const [locationMode, setLocationMode] = useState('') // '' | 'auto' | 'manual'
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories || [])).catch(() => {})
  }, [])

  function handleAddImages(e) {
    const files = Array.from(e.target.files || [])
    const room = MAX_IMAGES - images.length
    const accepted = files.filter(f => f.size <= MAX_SIZE).slice(0, room)
    setImages(prev => [...prev, ...accepted.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))])
    e.target.value = ''
  }

  function removeImage(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleAutoLocation() {
    setLocationLoading(true)
    setError('')
    try {
      const { lat, lng } = await detectLocation()
      setCoords({ lat, lng })
      setAddress('')
      setLocationMode('auto')
    } catch (err) {
      setLocationMode('manual')
      setError('Không lấy được vị trí tự động. Vui lòng nhập tay bên dưới.')
    } finally {
      setLocationLoading(false)
    }
  }

  function handleManualMode() {
    setLocationMode('manual')
    setCoords(null)
    setAddress('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const isPhone = /^(0|\+84)[3-9]\d{8}$/.test(contact.replace(/\s/g, ''))
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
    if (!isPhone && !isEmail) {
      setError('Vui lòng nhập SĐT (VD: 0912345678) hoặc email hợp lệ')
      return
    }
    if (title.trim().length < 5) {
      setError('Tiêu đề cần ít nhất 5 ký tự')
      return
    }
    if (content.trim().length < 5) {
      setError('Nội dung phản ánh cần ít nhất 5 ký tự')
      return
    }

    const formData = new FormData()
    formData.append('accessToken', accessToken)
    formData.append('contact', contact.trim())
    formData.append('title', title.trim())
    formData.append('content', content.trim())
    if (categoryId) formData.append('categoryId', categoryId)
    if (address.trim()) formData.append('address', address.trim())
    if (coords) {
      formData.append('lat', coords.lat)
      formData.append('lng', coords.lng)
      formData.append('source', locationMode === 'auto' ? 'gps' : 'manual')
    } else if (locationMode === 'manual') {
      formData.append('source', 'manual')
    }
    images.forEach(({ file }) => formData.append('images', file))

    setSubmitting(true)
    try {
      const res = await api.post('/feedbacks', formData)
      const catObj = categories.find(c => c._id === categoryId)
      const catLabel = catObj ? `${catObj.icon ? catObj.icon + ' ' : ''}${catObj.name}` : ''
      onSuccess({
        code: res.data.code,
        pending: res.data.pending,
        title,
        contact,
        content,
        address,
        categoryName: catLabel,
        imageCount: images.length,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BlobBackground className="p-4">
      <div className="relative overflow-hidden mx-auto max-w-md rounded-[24px] px-5 py-5 text-white animate-fade-in mb-4" style={{ background: ACCENT, boxShadow: '0 20px 44px -16px rgba(13,148,136,0.55)' }}>
        <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
        <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold tracking-[1.5px] uppercase" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)' }}>
          <Sparkles className="h-3 w-3" /> Chuyển đổi số
        </div>
        <div className="relative mt-[15px]">
          <div className="font-extrabold text-xl leading-tight tracking-tight">Gửi góp ý - Phản ánh</div>
          <div className="flex items-center gap-2 mt-1 text-sm text-white/85">
            {profile.avatar && <img src={profile.avatar} alt="" className="h-6 w-6 rounded-full" />}
            <span>Xin chào, {profile.name || 'bạn'}</span>
          </div>
        </div>
      </div>

      <Card className="mx-auto max-w-md animate-fade-in" style={{ boxShadow: '0 18px 46px -22px rgba(6,95,70,0.42)' }}>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Loại phản ánh</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Chọn loại phản ánh" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.icon ? `${c.icon} ` : ''}{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Đèn đường hư tại kiệt 82 Nguyễn Văn Linh" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Số điện thoại</Label>
              <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} placeholder="Vui lòng nhập số điện thoại" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung góp ý / phản ánh</Label>
              <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Mô tả chi tiết nội dung..." required />
            </div>

            {/* Địa chỉ phản ánh */}
            <div className="space-y-2">
              <Label>Địa chỉ phản ánh</Label>
              {locationMode === '' && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleAutoLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <MapPin className="h-4 w-4" />
                    }
                    {locationLoading ? 'Đang lấy vị trí...' : 'Lấy vị trí tự động'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 gap-2" onClick={handleManualMode}>
                    <Pencil className="h-4 w-4" />
                    Nhập địa chỉ
                  </Button>
                </div>
              )}
              {locationMode !== '' && (
                <div className="space-y-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={locationMode === 'auto' && coords ? 'Địa chỉ sẽ tự động xác định từ vị trí GPS...' : 'Số nhà, tên đường, tổ/khối phố...'}
                      className="pl-9"
                    />
                  </div>
                  {coords && (
                    <p className="text-xs text-muted-foreground">
                      GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </p>
                  )}
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline"
                    onClick={() => { setLocationMode(''); setAddress(''); setCoords(null) }}
                  >
                    Xoá địa chỉ
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh minh hoạ (tối đa {MAX_IMAGES})</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent">
                    + Thêm
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
                  </label>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="relative overflow-hidden group w-full gap-2"
              size="lg"
              disabled={submitting}
              style={{ background: ACCENT, boxShadow: '0 16px 32px -14px rgba(13,148,136,0.55)' }}
            >
              {!submitting && <span aria-hidden="true" className="absolute top-0 left-0 w-[55%] h-full pointer-events-none animate-sheen" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />}
              <span className="relative inline-flex items-center gap-2">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
                ) : (
                  <><Send className="h-4 w-4 animate-plane" /> Xác nhận gửi</>
                )}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </BlobBackground>
  )
}
