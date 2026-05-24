import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, UserCheck, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import StatusBadge from '@/components/feedback/StatusBadge'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function FeedbackDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [replyText, setReplyText] = useState('')
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [assignedTo, setAssignedTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => api.get(`/api/feedbacks/${id}`).then((r) => r.data),
    onSuccess: (d) => {
      setStatus(d.feedback.status)
      setNote(d.feedback.note || '')
      setAssignedTo(d.feedback.assignedTo?._id || '')
      setReplyText(d.feedback.response || '')
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['feedback', id] })
    queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
  }

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/api/feedbacks/${id}`, { status, note }).then((r) => r.data),
    onSuccess: () => { toast.success('Đã cập nhật'); invalidate() },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi cập nhật'),
  })

  const replyMutation = useMutation({
    mutationFn: () => api.post(`/api/feedbacks/${id}/reply`, { response: replyText }).then((r) => r.data),
    onSuccess: () => { toast.success('Đã gửi phản hồi qua Zalo'); invalidate() },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi gửi Zalo'),
  })

  const assignMutation = useMutation({
    mutationFn: () => api.post(`/api/feedbacks/${id}/assign`, { assignedTo }).then((r) => r.data),
    onSuccess: () => { toast.success('Đã cập nhật phân công'); invalidate() },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi phân công'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/feedbacks/${id}`),
    onSuccess: () => { toast.success('Đã xóa góp ý'); navigate('/feedbacks') },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi xóa'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fb = data?.feedback
  const admins = data?.admins ?? []

  if (!fb) return <p className="text-destructive">Không tìm thấy góp ý</p>

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/feedbacks">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Chi tiết góp ý</h1>
          <p className="text-xs text-muted-foreground">{fb._id}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={fb.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left — info */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thông tin người gửi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Họ tên</p>
                  <p className="font-medium">{fb.displayName || '(Ẩn danh)'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Liên hệ</p>
                  <p className="font-medium">{fb.contact}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ngày gửi</p>
                  <p>{formatDate(fb.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phân công</p>
                  <p>{fb.assignedTo?.fullName ?? '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nội dung góp ý</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">{fb.content}</div>
              </div>

              {fb.imageUrl && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hình ảnh đính kèm</p>
                  <a href={fb.imageUrl} target="_blank" rel="noreferrer">
                    <img src={fb.imageUrl} alt="Ảnh góp ý" className="max-h-64 rounded-lg border object-cover cursor-zoom-in" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {fb.response && (
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" /> Phản hồi đã gửi qua Zalo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">{fb.response}</div>
                {fb.respondedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(fb.respondedAt)} {fb.respondedBy?.fullName && `· ${fb.respondedBy.fullName}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {fb.note && (
            <Card className="border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-yellow-700">📝 Ghi chú nội bộ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 rounded-lg p-3 text-sm whitespace-pre-wrap">{fb.note}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cập nhật */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cập nhật xử lý</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">⏳ Chờ xử lý</option>
                  <option value="processing">⚙️ Đang xử lý</option>
                  <option value="done">✅ Đã xử lý</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Ghi chú nội bộ</Label>
                <Textarea
                  rows={3}
                  placeholder="Ghi chú cho nội bộ (người gửi không thấy)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu cập nhật
              </Button>
            </CardContent>
          </Card>

          {/* Phân công */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-sky-500" /> Phân công xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">— Chưa phân công —</option>
                {admins.map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName} (@{a.username})</option>
                ))}
              </select>
              <Button variant="secondary" className="w-full" onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>
                {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cập nhật phân công
              </Button>
            </CardContent>
          </Card>

          {/* Gửi Zalo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-green-500" /> Phản hồi qua Zalo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                placeholder="Nhập nội dung phản hồi gửi cho người dân qua Zalo..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  if (!replyText.trim()) { toast.error('Vui lòng nhập nội dung phản hồi'); return }
                  if (window.confirm('Xác nhận gửi phản hồi này qua Zalo?')) replyMutation.mutate()
                }}
                disabled={replyMutation.isPending}
              >
                {replyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Gửi qua Zalo
              </Button>
            </CardContent>
          </Card>

          {/* Xóa */}
          {user?.role === 'superadmin' && (
            <Card className="border-red-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Xóa vĩnh viễn góp ý này</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { if (window.confirm('Xác nhận xóa vĩnh viễn góp ý này?')) deleteMutation.mutate() }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
