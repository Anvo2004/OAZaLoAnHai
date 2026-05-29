import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const ROLE_OPTIONS = [
  { value: 'officer',     label: 'Cán bộ phụ trách' },
  { value: 'dept_leader', label: 'Lãnh đạo phòng' },
  { value: 'superadmin',  label: 'Lãnh đạo Ủy ban (Quản trị)' },
]

export default function UserFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({
    username: '', fullName: '', password: '', role: 'officer',
    zaloUserId: '', categoryIds: [],
  })

  const { data, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/api/users/${id}`).then((r) => r.data),
    enabled: isEdit,
  })

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((r) => r.data),
  })

  useEffect(() => {
    if (data?.user) {
      const u = data.user
      setForm({
        username: u.username,
        fullName: u.fullName,
        password: '',
        role: u.role,
        zaloUserId: u.zaloUserId || '',
        categoryIds: u.categoryIds?.map((c) => (typeof c === 'object' ? c._id : c)) || [],
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? api.put(`/api/users/${id}`, payload).then((r) => r.data)
        : api.post('/api/users', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật tài khoản' : 'Đã tạo tài khoản mới')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi xử lý'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.fullName) { toast.error('Vui lòng nhập họ tên'); return }
    if (!isEdit && !form.username) { toast.error('Vui lòng nhập tên đăng nhập'); return }
    if (!isEdit && !form.password) { toast.error('Vui lòng nhập mật khẩu'); return }

    const payload = {
      fullName: form.fullName,
      role: form.role,
      zaloUserId: form.zaloUserId,
      categoryIds: form.categoryIds,
    }
    if (!isEdit) { payload.username = form.username; payload.password = form.password }
    else if (form.password) payload.password = form.password
    mutation.mutate(payload)
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleCategory = (catId) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(catId)
        ? f.categoryIds.filter((c) => c !== catId)
        : [...f.categoryIds, catId],
    }))
  }

  if (isEdit && loadingUser) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  const categories = catsData?.categories ?? []

  return (
    <div className="space-y-4 animate-fade-in max-w-lg">
      <div className="flex items-center gap-3">
        <Link to="/users">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Quay lại</Button>
        </Link>
        <h1 className="text-xl font-bold">{isEdit ? `Sửa @${data?.user?.username}` : 'Tạo tài khoản mới'}</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{isEdit ? 'Chỉnh sửa thông tin' : 'Thông tin tài khoản'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label>Tên đăng nhập <span className="text-destructive">*</span></Label>
                <Input placeholder="vd: nguyenvana" value={form.username} onChange={set('username')} autoComplete="off" />
                <p className="text-xs text-muted-foreground">Chỉ dùng chữ thường, số, không dấu</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Họ và tên <span className="text-destructive">*</span></Label>
              <Input placeholder="vd: Nguyễn Văn A" value={form.fullName} onChange={set('fullName')} />
            </div>

            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.role}
                onChange={set('role')}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Zalo User ID (trong nhóm)</Label>
              <Input placeholder="vd: 123456789" value={form.zaloUserId} onChange={set('zaloUserId')} />
              <p className="text-xs text-muted-foreground">Dùng để tag trong thông báo Zalo</p>
            </div>

            {/* Chọn loại phản ánh phụ trách */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>Loại phản ánh phụ trách</Label>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={form.categoryIds.includes(cat._id)}
                        onChange={() => toggleCategory(cat._id)}
                      />
                      <span className="text-sm">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Mật khẩu {!isEdit && <span className="text-destructive">*</span>}</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder={isEdit ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu'}
                  className="pr-10"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isEdit && <p className="text-xs text-muted-foreground">Để trống nếu không muốn thay đổi mật khẩu</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </Button>
              <Link to="/users">
                <Button type="button" variant="outline">Hủy</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
