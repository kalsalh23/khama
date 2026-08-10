import { useEffect, useState } from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { adminListCoupons, adminSaveCoupon, adminDeleteCoupon } from "@/lib/adminApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import type { Coupon } from "@/lib/types"

const empty: Record<string, string | number | boolean | null> = { code: "", type: "percent", value: 0, min_order_amount: null, max_uses: null, is_active: true }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState<Record<string, string | number | boolean | null>>(empty)

  const load = () => {
    adminListCoupons().then(setCoupons).catch(() => {})
  }
  useEffect(load, [])

  const save = async () => {
    if (!form.code || !form.value) {
      toast({ title: "أدخل الكود والقيمة", variant: "destructive" })
      return
    }
    await adminSaveCoupon({ ...form, code: String(form.code).toUpperCase() } as unknown as Partial<Coupon>)
    setForm(empty)
    toast({ title: "تم الحفظ", variant: "success" })
    load()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الكوبونات</h2>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">كوبون جديد</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div><Label>الكود</Label><Input value={form.code as string} onChange={(e) => setForm({ ...form, code: e.target.value })} dir="ltr" placeholder="TECH25" /></div>
          <div><Label>النوع</Label>
            <Select value={form.type as string} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "amount" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">نسبة %</SelectItem>
                <SelectItem value="amount">مبلغ ثابت</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>القيمة</Label><Input type="number" value={form.value as number} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} dir="ltr" /></div>
          <div><Label>الحد الأدنى للطلب</Label><Input type="number" value={(form.min_order_amount as number) ?? ""} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value ? Number(e.target.value) : null })} dir="ltr" /></div>
          <div><Label>حد الاستخدام</Label><Input type="number" value={(form.max_uses as number) ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} dir="ltr" /></div>
          <div><Label>تاريخ النهاية</Label><Input type="date" onChange={(e) => setForm({ ...form, end_at: e.target.value ? new Date(e.target.value).toISOString() : null })} dir="ltr" /></div>
          <div className="flex items-end"><Button onClick={save}><Save className="size-4" /> حفظ الكوبون</Button></div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">الكود</th><th className="p-3 font-medium">الخصم</th><th className="p-3 font-medium">الاستخدام</th><th className="p-3 font-medium">فعال</th><th className="p-3 font-medium">تاريخ الإنشاء</th><th className="p-3 font-medium">إجراءات</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3"><Badge variant="secondary" dir="ltr">{c.code}</Badge></td>
                <td className="p-3">{c.type === "percent" ? `${c.value}%` : `${c.value} SAR`}</td>
                <td className="p-3" dir="ltr">{c.used_count}/{c.max_uses ?? "∞"}</td>
                <td className="p-3"><Switch checked={c.is_active} onCheckedChange={async (v) => { await adminSaveCoupon({ ...c, is_active: v }); load() }} /></td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                <td className="p-3"><Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteCoupon(c.id); load() }}><Trash2 className="size-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
