import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, Shield, User, Filter, Users as UsersIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateShort, getAvatarColor } from '@/lib/utils'
import { toast } from 'sonner'

const ROLE_CONFIG = {
  superadmin:  { label: 'Admin',           icon: ShieldCheck, className: 'text-amber-700 bg-amber-50' },
  dept_leader: { label: 'Lãnh đạo phòng', icon: Shield,      className: 'text-violet-700 bg-violet-50' },
  officer:     { label: 'Cán bộ',         icon: User,        className: 'text-emerald-700 bg-emerald-50' },
  staff:       { label: 'Nhân viên',      icon: User,        className: 'text-slate-600 bg-slate-50' },
}

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.staff
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  )
}

function SelectField({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400 transition-all duration-300 cursor-pointer"
    >
      {children}
    </select>
  )
}

export default function UsersPage() {
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

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

  const allUsers = data?.users ?? []

  const categoryOptions = useMemo(() => {
    const map = new Map()
    allUsers.forEach((u) => (u.categoryIds || []).forEach((c) => map.set(c._id, c)))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allUsers])

  const users = useMemo(() => {
    return allUsers.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (categoryFilter !== 'all' && !(u.categoryIds || []).some((c) => c._id === categoryFilter)) return false
      return true
    })
  }, [allUsers, roleFilter, categoryFilter])

  const hasFilter = roleFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Tài khoản Admin</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {users.length}/{allUsers.length} tài khoản
          </p>
        </div>
        <Link to="/users/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Thêm tài khoản
          </Button>
        </Link>
      </div>

      {/* Bộ lọc theo vai trò + loại phụ trách */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Lọc:
          </div>

          <SelectField value={roleFilter} onChange={setRoleFilter}>
            <option value="all">Tất cả vai trò</option>
            {Object.entries(ROLE_CONFIG).map(([value, cfg]) => (
              <option key={value} value={value}>{cfg.label}</option>
            ))}
          </SelectField>

          <SelectField value={categoryFilter} onChange={setCategoryFilter}>
            <option value="all">Tất cả loại phụ trách</option>
            {categoryOptions.map((c) => (
              <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
            ))}
          </SelectField>

          {hasFilter && (
            <button
              onClick={() => { setRoleFilter('all'); setCategoryFilter('all') }}
              className="h-9 px-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all font-medium ml-auto"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
            <p className="text-sm text-slate-400">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UsersIcon className="h-10 w-10 text-slate-200 mb-3" />
            <p className="font-semibold text-slate-500">Không có tài khoản phù hợp</p>
            <p className="text-sm text-slate-400 mt-1">Thử đổi lại bộ lọc vai trò / loại phụ trách</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #047857, #10b981)' }}>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80 w-10">#</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80">Tài khoản</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80">Họ tên</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80">Vai trò</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80 hidden md:table-cell">Loại phụ trách</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/80 w-24">Ngày tạo</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u, i) => (
                  <tr key={u._id} className="hover:bg-emerald-50/40 transition-colors duration-300 group">
                    <td className="px-4 py-3.5 text-slate-300 text-xs font-mono">{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(u.fullName || u.username || '?')} text-white text-xs font-bold shadow-sm`}>
                          {u.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">@{u.username}</span>
                        {u._id === me?.id && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">bạn</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{u.fullName}</td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                      {u.categoryIds?.length > 0
                        ? u.categoryIds.map((c) => `${c.icon} ${c.name}`).join(', ')
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {formatDateShort(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <Link
                          to={`/users/${u._id}/edit`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300"
                        >
                          <Pencil className="h-3 w-3" />
                        </Link>
                        {u._id !== me?.id && (
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa @${u.username}?`)) deleteMutation.mutate(u._id)
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
