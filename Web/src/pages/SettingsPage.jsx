import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: catsData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((r) => r.data),
  })

  const syncMutation = useMutation({
    mutationFn: (catId) => api.post(`/api/zalo-members/sync/${catId}`).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(`Đã sync ${data.synced} thành viên`)
      queryClient.invalidateQueries({ queryKey: ['zalo-members'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi sync'),
  })

  const categories = catsData?.categories ?? []

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt nhóm Zalo</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Sync danh sách thành viên từ các nhóm Zalo để phân công xử lý
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{cat.icon} {cat.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncMutation.mutate(cat._id)}
                    disabled={syncMutation.isPending}
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Sync thành viên
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Group ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{cat.zaloGroupId}</code>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3 text-sm text-blue-800">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
            <p>
              Sau khi sync, danh sách thành viên sẽ được lưu vào DB và hiển thị khi phân công phản ánh cho cán bộ.
              Sync lại khi có thành viên mới tham gia nhóm Zalo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
