import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowRight, Package, Truck } from "lucide-react"
import { fetchOrder, updateOrderStatus, updateShipment } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth"
import { toast } from "@/components/ui/use-toast"
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants"
import type { Order, OrderItem, Payment, Shipment, ShippingAddress } from "@/lib/types"

type OrderFull = Order & {
  items: OrderItem[]
  payments: Payment[]
  shipment: Shipment | null
  status_history: Array<{ id: string; status: string; note: string | null; created_at: string }>
  address: ShippingAddress | null
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const profile = useAuthStore((s) => s.profile)
  const [order, setOrder] = useState<OrderFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then((o) => {
        setOrder(o as unknown as OrderFull)
        setCarrier(o?.shipment?.carrier ?? "")
        setTracking(o?.shipment?.tracking_number ?? "")
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton className="h-96 rounded-2xl" />
  if (!order) return <div className="rounded-2xl border bg-card p-10 text-center">الطلب غير موجود</div>

  const payment = order.payments?.[0]

  const changeStatus = async (status: string) => {
    try {
      await updateOrderStatus(order.id, status as Order["status"], undefined, profile?.id)
      setOrder((o) => (o ? { ...o, status: status as Order["status"] } : o))
      toast({ title: "تم تحديث الحالة", variant: "success" })
    } catch {
      toast({ title: "فشل التحديث", variant: "destructive" })
    }
  }

  const saveShipment = async () => {
    try {
      await updateShipment(order.id, { carrier, tracking_number: tracking, status: tracking ? "shipped" : "pending" })
      await updateOrderStatus(order.id, "shipped", `شحن عبر ${carrier}`, profile?.id)
      toast({ title: "تم حفظ الشحن", variant: "success" })
    } catch {
      toast({ title: "فشل الحفظ", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link to="/admin/orders"><ArrowRight className="size-4" /></Link></Button>
          <h2 className="text-xl font-bold" dir="ltr">#{order.order_number}</h2>
          <Badge variant="outline">{STATUS_LABELS[order.status] ?? order.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">تغيير الحالة:</Label>
          <Select value={order.status} onValueChange={changeStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <section className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">العميل</h3>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">الاسم: </span>{order.customer_name}</p>
            <p><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{order.customer_phone}</span></p>
            <p><span className="text-muted-foreground">البريد: </span><span dir="ltr">{order.customer_email}</span></p>
            {order.university && <p><span className="text-muted-foreground">الجامعة: </span>{order.university}</p>}
            {order.college && <p><span className="text-muted-foreground">الكلية: </span>{order.college}</p>}
            {order.department && <p><span className="text-muted-foreground">القسم: </span>{order.department}</p>}
            {order.graduation_year && <p><span className="text-muted-foreground">سنة التخرج: </span>{order.graduation_year}</p>}
            <p><span className="text-muted-foreground">الطلب في: </span>{formatDate(order.created_at)}</p>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">الدفع</h3>
          {payment ? (
            <div className="space-y-1.5 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">طريقة الدفع</span><span>{payment.method_name}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">المبلغ</span><span className="font-semibold">{formatPrice(payment.amount)}</span></p>
              <p className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة</span>
                <Badge variant={payment.status === "paid" ? "success" : payment.status === "under_review" ? "secondary" : "outline"}>
                  {payment.status === "paid" ? "مدفوع" : payment.status === "under_review" ? "بانتظار المراجعة" : payment.status}
                </Badge>
              </p>
              {payment.receipt_url && (
                <a href={payment.receipt_url} target="_blank" rel="noreferrer" className="block text-primary underline">
                  عرض إيصال الدفع
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد دفع مسجل</p>
          )}
          <Separator className="my-3" />
          <div className="space-y-1.5 text-sm">
            <p className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span>{formatPrice(order.items_total)}</p>
            <p className="flex justify-between"><span className="text-muted-foreground">الخصم</span>- {formatPrice(order.discount_amount)}</p>
            <p className="flex justify-between"><span className="text-muted-foreground">الشحن</span>{formatPrice(order.shipping_fee)}</p>
            <p className="flex justify-between text-base font-bold"><span>الإجمالي</span><span className="text-primary">{formatPrice(order.total_amount)}</span></p>
          </div>
        </section>
      </div>

      {/* Items with design */}
      <section className="space-y-4">
        <h3 className="font-semibold">المنتجات والتصاميم</h3>
        {order.items.map((item) => (
          <div key={item.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap gap-5">
              {item.preview_url && (
                <img src={item.preview_url} alt={item.product_name} className="h-48 w-40 rounded-xl object-cover" />
              )}
              <div className="min-w-[240px] flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.product_name}</p>
                  <span className="font-bold">{formatPrice(item.total_price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">الكمية: {item.quantity} × {formatPrice(item.unit_price)}</p>

                {item.design_config && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl bg-muted/50 p-3 text-sm sm:grid-cols-3">
                    {item.design_config.color && <p><span className="text-muted-foreground">لون الوشاح: </span><span className="inline-block size-3 rounded-full border align-middle" style={{ background: item.design_config.color }} /> {item.design_config.colorName ?? ""}</p>}
                    {item.design_config.name && <p className="col-span-2"><span className="text-muted-foreground">الاسم: </span>{item.design_config.name}</p>}
                    <p><span className="text-muted-foreground">الخط: </span>{item.design_config.font}</p>
                    {item.design_config.threadName && <p><span className="text-muted-foreground">لون الخيط: </span>{item.design_config.threadName}</p>}
                    {item.design_config.namePosition && <p><span className="text-muted-foreground">موضع الاسم: </span>{item.design_config.namePosition}</p>}
                    {item.design_config.graduationYear && <p><span className="text-muted-foreground">السنة: </span>{item.design_config.graduationYear}</p>}
                    {item.design_config.customText && <p className="col-span-2"><span className="text-muted-foreground">العبارة: </span>{item.design_config.customText}</p>}
                    {item.design_config.logo?.url && <p className="col-span-2"><span className="text-muted-foreground">الشعار: </span>مرفق</p>}
                  </div>
                )}

                {item.measurements && Array.isArray(item.measurements) && item.measurements.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-sm font-medium">القياسات:</p>
                    <div className="flex flex-wrap gap-2">
                      {(item.measurements as Array<{ label: string; value: number; unit: string }>).map((m, i) => (
                        <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          {m.label}: <b dir="ltr">{m.value} {m.unit}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Measurements summary */}
      {order.address && (
        <section className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">عنوان الشحن</h3>
          <p className="text-sm">{order.address.full_name} • <span dir="ltr">{order.address.phone}</span></p>
          <p className="text-sm text-muted-foreground">{order.address.city}، {order.address.region}</p>
          <p className="text-sm text-muted-foreground">{order.address.detailed_address}</p>
        </section>
      )}

      {/* Shipping */}
      <section className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Truck className="size-4 text-primary" /> الشحن</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label>شركة الشحن</Label><Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="مثال: أرامكس" /></div>
          <div><Label>رقم التتبع</Label><Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="التتبع..." dir="ltr" /></div>
          <div className="flex items-end"><Button onClick={saveShipment}><Package className="size-4" /> حفظ وتحديث الشحن</Button></div>
        </div>
      </section>

      {/* History */}
      <section className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">سجل الحالات</h3>
        <div className="space-y-3">
          {[...order.status_history].reverse().map((h) => (
            <div key={h.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <Badge variant="outline">{STATUS_LABELS[h.status] ?? h.status}</Badge>
                {h.note && <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(h.created_at)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
