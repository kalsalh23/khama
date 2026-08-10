import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CheckCircle2, Package } from "lucide-react"
import { fetchOrder } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SEO } from "@/components/SEO"
import { STATUS_LABELS } from "@/lib/constants"
import type { Order, OrderItem, Payment } from "@/lib/types"

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<(Order & { items: OrderItem[]; payments: Payment[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then((o) => setOrder(o as typeof order))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-20"><Skeleton className="h-96 rounded-3xl" /></div>
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><p>لم يتم العثور على الطلب</p></div>

  const payment = order.payments?.[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <SEO title={`الطلب ${order.order_number}`} noindex />
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-11 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold">تم استلام طلبك بنجاح 🎓</h1>
        <p className="mt-2 text-muted-foreground">
          رقم الطلب: <span className="font-bold text-foreground" dir="ltr">#{order.order_number}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
      </div>

      <div className="mt-10 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            {item.preview_url ? (
              <img src={item.preview_url} alt={item.product_name} className="h-24 w-24 rounded-xl object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted"><Package className="size-8 text-muted-foreground" /></div>
            )}
            <div className="flex-1">
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
              {item.design_config?.name && (
                <p className="text-sm text-muted-foreground" dir={item.design_config.nameLanguage === "ar" ? "rtl" : "ltr"}>
                  {item.design_config.name}
                </p>
              )}
            </div>
            <span className="font-bold">{formatPrice(item.total_price)}</span>
          </div>
        ))}

        <div className="rounded-2xl border bg-card p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>الإجمالي</span><span className="font-bold">{formatPrice(order.total_amount)}</span></div>
            <div className="flex justify-between items-center">
              <span>حالة الدفع</span>
              <Badge variant={payment?.status === "paid" ? "success" : payment?.status === "under_review" ? "secondary" : "outline"}>
                {payment?.status === "paid" ? "مدفوع" : payment?.status === "under_review" ? "بانتظار المراجعة" : payment?.status === "pending" ? "بانتظار الدفع" : payment?.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>حالة الطلب</span>
              <Badge variant="outline">{STATUS_LABELS[order.status] ?? order.status}</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="gold">
            <Link to={`/orders/${order.id}`}>متابعة الطلب</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/products">تصفح المنتجات</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
