import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { fetchOrders } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_LABELS } from "@/lib/constants"

export default function AccountOrdersPage() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; total_amount: string | number; status: string; created_at: string; items_total: string | number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <Skeleton className="h-64 rounded-2xl" />

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="font-semibold">لا توجد طلبات بعد</p>
        <p className="mt-2 text-sm text-muted-foreground">عندما تنشئ طلبًا سيظهر هنا.</p>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/designer/scarf">صمّم الآن</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
          <div>
            <p className="font-semibold" dir="ltr">{o.order_number}</p>
            <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
          </div>
          <Badge variant="outline">{STATUS_LABELS[o.status] ?? o.status}</Badge>
          <span className="font-bold">{formatPrice(Number(o.total_amount))}</span>
          <Button asChild size="sm" variant="outline">
            <Link to={`/orders/${o.id}`}>متابعة <ArrowLeft className="size-3.5" /></Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
