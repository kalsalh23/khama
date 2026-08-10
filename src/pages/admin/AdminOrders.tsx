import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { fetchOrders } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ORDER_STATUSES } from "@/lib/constants"
import type { Order, OrderItem, Payment, Shipment } from "@/lib/types"

type OrderRow = Order & { items: OrderItem[]; payments: Payment[]; shipment: Shipment | null }

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    fetchOrders(undefined, true)
      .then((o) => setOrders(o as unknown as OrderRow[]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    const matchesStatus = status === "all" || o.status === status
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.customer_email.toLowerCase().includes(q)
    return matchesStatus && matchesQuery
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">الطلبات</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="رقم الطلب، الاسم، الهاتف، البريد"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 pr-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-right">
              <th className="p-3 font-medium">رقم الطلب</th>
              <th className="p-3 font-medium">العميل</th>
              <th className="p-3 font-medium">المنتج</th>
              <th className="p-3 font-medium">السعر</th>
              <th className="p-3 font-medium">الدفع</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6"><Skeleton className="h-40 w-full" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد طلبات مطابقة</td></tr>
            ) : (
              filtered.map((o) => {
                const payStatus = o.payments?.[0]?.status
                return (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline" dir="ltr">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{o.customer_phone}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {o.items?.map((i) => i.product_name).join("، ") || "—"}
                    </td>
                    <td className="p-3 font-semibold">{formatPrice(Number(o.total_amount))}</td>
                    <td className="p-3">
                      <Badge variant={payStatus === "paid" ? "success" : payStatus === "under_review" ? "secondary" : "outline"}>
                        {payStatus === "paid" ? "مدفوع" : payStatus === "under_review" ? "مراجعة" : payStatus === "pending" ? "بانتظار" : payStatus ?? "—"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{ORDER_STATUSES.find((s) => s.value === o.status)?.label ?? o.status}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
