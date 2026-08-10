import { useEffect, useState } from "react"
import { Plus, Trash2, Check, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminListPaymentMethods, adminSavePaymentMethod,
  adminListReceipts, adminReviewReceipt,
} from "@/lib/adminApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/stores/auth"
import { toast } from "@/components/ui/use-toast"
import { formatPrice, formatDate } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/types"

export default function AdminPayments() {
  const profile = useAuthStore((s) => s.profile)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [receipts, setReceipts] = useState<Array<Record<string, unknown> & { id: string; file_url: string; status: string; payment: { id: string; amount: number; order_id: string } | null }>>([])

  const load = () => {
    adminListPaymentMethods().then(setMethods).catch(() => {})
    adminListReceipts().then(setReceipts as never).catch(() => {})
  }
  useEffect(load, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الدفع</h2>
      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">طرق الدفع</TabsTrigger>
          <TabsTrigger value="receipts">إيصالات الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">طريقة دفع جديدة</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>الاسم</Label><Input id="pmName" placeholder="تحويل بنكي" /></div>
              <div><Label>النوع</Label>
                <Select defaultValue="bank_transfer">
                  <SelectTrigger id="pmType" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online_gateway">بوابة إلكترونية</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="local">طريقة محلية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={async () => {
                  const name = (document.getElementById("pmName") as HTMLInputElement).value
                  const type = ((document.getElementById("pmType") as HTMLButtonElement).textContent ?? "bank_transfer") as PaymentMethod["type"]
                  if (!name) { toast({ title: "أدخل الاسم", variant: "destructive" }); return }
                  await adminSavePaymentMethod({ name, type, is_active: true, sort_order: methods.length + 1 })
                  toast({ title: "تمت الإضافة", variant: "success" })
                  load()
                }}><Plus className="size-4" /> إضافة</Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <div key={m.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.type}</p>
                    {m.instructions && <p className="mt-2 rounded-lg bg-muted p-2 text-xs">{m.instructions}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={m.is_active} onCheckedChange={async (v) => { await adminSavePaymentMethod({ ...m, is_active: v }); load() }} />
                    <Button variant="ghost" size="iconSm" onClick={async () => { await adminSavePaymentMethod({ ...m, is_active: false }); load() }}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-3">
          {receipts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">لا توجد إيصالات قيد المراجعة</div>
          ) : (
            receipts.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-4">
                  <a href={r.file_url} target="_blank" rel="noreferrer" className="rounded-lg border px-4 py-2 text-sm font-medium text-primary hover:bg-muted">
                    عرض الإيصال
                  </a>
                  <div>
                    <p className="text-sm font-medium">المبلغ: {formatPrice(Number((r.payment as { amount?: number })?.amount ?? 0))}</p>
                    <p className="text-xs text-muted-foreground">تاريخ الرفع: {formatDate(r.created_at as string)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "under_review" ? "secondary" : r.status === "approved" ? "success" : "destructive"}>
                    {r.status === "under_review" ? "بانتظار المراجعة" : r.status === "approved" ? "مقبول" : "مرفوض"}
                  </Badge>
                  {r.status === "under_review" && (
                    <>
                      <Button size="sm" variant="success" onClick={async () => {
                        await adminReviewReceipt(r.id, "approved", profile?.id ?? "", (r.payment as { id: string }).id)
                        load()
                      }}><Check className="size-4" /> قبول</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        await adminReviewReceipt(r.id, "rejected", profile?.id ?? "", (r.payment as { id: string }).id)
                        load()
                      }}><X className="size-4" /> رفض</Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
