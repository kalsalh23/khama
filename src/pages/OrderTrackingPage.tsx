import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Package, Truck, Check, Clock } from "lucide-react"
import { fetchOrder } from "@/lib/api"
import { formatPrice, formatDate, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { SEO } from "@/components/SEO"
import { STATUS_LABELS } from "@/lib/constants"
import type { Order, OrderItem, Payment, Shipment } from "@/lib/types"

const TIMELINE = [
  { status: "pending", label: "تم إنشاء الطلب" },
  { status: "confirmed", label: "تم تأكيد الدفع" },
  { status: "design_review", label: "تمت مراجعة التصميم" },
  { status: "production", label: "قيد التجهيز" },
  { status: "embroidery", label: "قيد التطريز" },
  { status: "ready", label: "جاهز" },
  { status: "shipped", label: "تم الشحن" },
  { status: "completed", label: "تم التسليم" },
]

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [history, setHistory] = useState<Array<{ status: string; created_at: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then((o) => {
        if (o) {
          setOrder(o)
          setItems(o.items ?? [])
          setPayments(o.payments ?? [])
          setShipment(o.shipment ?? null)
          setHistory(o.status_history ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-20"><Skeleton className="h-96 rounded-3xl" /></div>
  if (!order) return <div className="mx-auto max-w-4xl px-4 py-20 text-center">لم يتم العثور على الطلب</div>

  const currentIdx = TIMELINE.findIndex((t) => t.status === order.status)
  const status = order.status

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SEO title={`تتبع الطلب ${order.order_number}`} noindex />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">متابعة الطلب</h1>
          <p className="mt-1 text-muted-foreground">
            رقم الطلب: <span className="font-bold" dir="ltr">#{order.order_number}</span>
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5">{STATUS_LABELS[status] ?? status}</Badge>
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="mb-6 font-semibold">مسار الطلب</h2>
        <div className="relative">
          <div className="absolute right-[15px] top-2 bottom-2 w-0.5 bg-muted sm:right-auto sm:left-[calc(50%-1px)]" />
          <div className="space-y-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:space-y-0">
            {TIMELINE.map((step, i) => {
              const done = i < currentIdx
              const active = i === currentIdx
              const cancelled = status === "cancelled"
              return (
                <div key={step.status} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
                  <div className="z-10 flex shrink-0 flex-col items-center">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2 transition-colors",
                        done ? "border-emerald-500 bg-emerald-500 text-white" :
                        active && !cancelled ? "border-amber-400 bg-amber-100 text-amber-600 ring-4 ring-amber-100" :
                        "border-muted-foreground/30 bg-background text-muted-foreground"
                      )}
                    >
                      {done ? <Check className="size-4" /> : active && !cancelled ? <Clock className="size-4" /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", done ? "text-emerald-600" : active ? "text-amber-600" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {history.find((h) => h.status === step.status)?.created_at ? formatDate(history.find((h) => h.status === step.status)!.created_at) : "—"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            {item.preview_url ? (
              <img src={item.preview_url} alt={item.product_name} className="h-20 w-20 rounded-xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted"><Package className="size-8 text-muted-foreground" /></div>
            )}
            <div className="flex-1">
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
            </div>
            <span className="font-bold">{formatPrice(item.total_price)}</span>
          </div>
        ))}
      </div>

      {/* Payment + shipment */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Package className="size-4 text-primary" /> الدفع</h3>
          {payments[0] ? (
            <div className="space-y-1.5 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">الطريقة</span><span>{payments[0].method_name}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">المبلغ</span><span className="font-semibold">{formatPrice(payments[0].amount)}</span></p>
              <p className="flex justify-between items-center"><span className="text-muted-foreground">الحالة</span>
                <Badge variant={payments[0].status === "paid" ? "success" : "outline"}>{payments[0].status}</Badge>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد دفع مسجل</p>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Truck className="size-4 text-primary" /> الشحن</h3>
          {shipment?.tracking_number ? (
            <div className="space-y-1.5 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">الشركة</span><span>{shipment.carrier ?? "—"}</span></p>
              <p className="flex justify-between" dir="ltr"><span className="text-muted-foreground">رقم التتبع</span><span className="font-mono">{shipment.tracking_number}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">الحالة</span><span>{shipment.status ?? "—"}</span></p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لم يتم الشحن بعد</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link to="/account/orders">عرض كل طلباتي</Link>
        </Button>
      </div>
    </div>
  )
}
