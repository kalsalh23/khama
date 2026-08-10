import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, Palette, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { fetchOrders, fetchSavedDesigns } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import type { SavedDesign } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function AccountOverview() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; total_amount: string | number; status: string; created_at: string }>>([])
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([fetchOrders(user.id), fetchSavedDesigns(user.id)])
      .then(([o, d]) => {
        setOrders(o)
        setDesigns(d)
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">عدد الطلبات</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <Package className="size-8 text-primary/50" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">التصاميم المحفوظة</p>
              <p className="text-3xl font-bold">{designs.length}</p>
            </div>
            <Palette className="size-8 text-primary/50" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">آخر طلباتك</h3>
          <Link to="/account/orders" className="text-sm text-primary hover:underline">عرض الكل</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 4).map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                <div>
                  <p className="font-medium" dir="ltr">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatPrice(Number(o.total_amount))}</span>
                  <Button variant="ghost" size="iconSm"><ArrowRight className="size-4" /></Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
