import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, Users, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function CategoryMemberPanel({ cat }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ displayName: '', zaloUserId: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['zalo-members', cat._id],
    queryFn: () => api.get(`/api/zalo-members/${cat._id}`).then((r) => r.data),
    enabled: open,
  })

  const addMutation = useMutation({
    mutationFn: () => api.post(`/api/zalo-members/manual/${cat._id}`, form).then((r) => r.data),
    onSuccess: () => {
      toast.success('Đã thêm thành viên')
      setForm({ displayName: '', zaloUserId: '' })
      queryClient.invalidateQueries({ queryKey: ['zalo-members', cat._id] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi thêm'),
  })

  const deleteMutation = useMutation({
    mutationFn: (memberId) => api.delete(`/api/zalo-members/member/${memberId}`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Đã xóa')
      queryClient.invalidateQueries({ queryKey: ['zalo-members', cat._id] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi xóa'),
  })

  const syncMutation = useMutation({
    mutationFn: () => api.post(`/api/zalo-members/sync/${cat._id}`).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(`Đồng bộ xong — ${data.synced} thành viên`)
      queryClient.invalidateQueries({ queryKey: ['zalo-members', cat._id] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi đồng bộ'),
  })

  const members = data?.members ?? []

  return (
    <Card>
      <CardHeader className="pb-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between py-1 text-left"
        >
          <CardTitle className="text-base flex items-center gap-2">
            {cat.icon} {cat.name}
            <span className="text-xs font-normal text-slate-400 ml-1">
              · Group ID: <code className="bg-slate-100 px-1 rounded">{cat.zaloGroupId}</code>
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {members.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {members.length} thành viên
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); syncMutation.mutate() }}
              disabled={syncMutation.isPending}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {syncMutation.isPending
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <RefreshCw className="h-3 w-3" />}
              Đồng bộ
            </button>
            {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="pt-4 space-y-4">
          {/* Form thêm thành viên */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 space-y-3">
            <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Thêm thành viên vào nhóm này
            </p>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Họ tên</Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  className="h-9 text-sm"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Zalo User ID</Label>
                <Input
                  placeholder="123456789"
                  className="h-9 text-sm"
                  value={form.zaloUserId}
                  onChange={(e) => setForm((f) => ({ ...f, zaloUserId: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    if (!form.displayName.trim()) { toast.error('Vui lòng nhập họ tên'); return }
                    if (!form.zaloUserId.trim()) { toast.error('Vui lòng nhập Zalo User ID'); return }
                    addMutation.mutate()
                  }}
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Danh sách members */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-4 text-sm text-slate-400">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-200" />
              Chưa có thành viên nào — thêm bằng form bên trên
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
              {members.map((m) => (
                <div key={m._id} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{m.displayName || '(Không tên)'}</p>
                    <p className="text-xs text-slate-400 font-mono">ID: {m.zaloUserId}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa ${m.displayName}?`)) deleteMutation.mutate(m._id)
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function SettingsPage() {
  const { data: catsData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((r) => r.data),
  })

  const categories = catsData?.categories ?? []

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt nhóm Zalo</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quản lý danh sách cán bộ trong từng nhóm để phân công xử lý phản ánh
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <CategoryMemberPanel key={cat._id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  )
}
