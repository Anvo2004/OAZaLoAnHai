import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, User } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateShort } from '@/lib/utils'
import { toast } from 'sonner'

export default function UsersPage() {
  const { user: me } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      toast.success('Đã xóa tài khoản')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi xóa'),
  })

  const users = data?.users ?? []

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tài khoản Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} tài khoản</p>
        </div>
        <Link to="/users/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Thêm tài khoản
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tài khoản</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Họ tên</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-28">Vai trò</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">Ngày tạo</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u, i) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {u.fullName?.[0]}
                      </div>
                      <span className="font-medium">@{u.username}</span>
                      {u._id === me?.id && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">bạn</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3">
                    {u.role === 'superadmin' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" /> Quản trị viên
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        <User className="h-3 w-3" /> Nhân viên
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateShort(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to={`/users/${u._id}/edit`}>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </Link>
                      {u._id !== me?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa @${u.username}?`)) deleteMutation.mutate(u._id)
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
