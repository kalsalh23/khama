import { useEffect, useState } from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { adminListMeasurementFields, adminSaveMeasurementField, adminDeleteMeasurementField } from "@/lib/adminApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { MeasurementField } from "@/lib/types"

export default function AdminMeasurements() {
  const [fields, setFields] = useState<MeasurementField[]>([])
  const [form, setForm] = useState({ name: "", name_en: "", description: "", unit: "cm", is_required: true })

  const load = () => {
    adminListMeasurementFields().then(setFields).catch(() => {})
  }
  useEffect(load, [])

  const add = async () => {
    if (!form.name || !form.name_en) {
      toast({ title: "أدخل الاسم بالعربي والإنجليزي", variant: "destructive" })
      return
    }
    await adminSaveMeasurementField({ ...form, unit: form.unit as "cm" | "inch", is_active: true, sort_order: fields.length + 1 })
    setForm({ name: "", name_en: "", description: "", unit: "cm", is_required: true })
    toast({ title: "تمت الإضافة", variant: "success" })
    load()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">حقول القياسات</h2>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">حقل قياس جديد</h3>
        <div className="grid gap-3 sm:grid-cols-5">
          <div><Label>الاسم (عربي)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>الاسم (إنجليزي)</Label><Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" /></div>
          <div className="sm:col-span-2"><Label>الشرح</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>الوحدة</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cm">سم</SelectItem><SelectItem value="inch">بوصة</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><Switch checked={form.is_required} onCheckedChange={(v) => setForm({ ...form, is_required: v })} /> حقل إجباري</label>
        <Button className="mt-3" onClick={add}><Plus className="size-4" /> إضافة</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">الحقل</th><th className="p-3 font-medium">الوحدة</th><th className="p-3 font-medium">إجباري</th><th className="p-3 font-medium">فعال</th><th className="p-3 font-medium">إجراءات</th></tr></thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium">{f.name} <span className="text-xs text-muted-foreground" dir="ltr">{f.name_en}</span></p>
                  {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                </td>
                <td className="p-3" dir="ltr">{f.unit}</td>
                <td className="p-3"><Switch checked={f.is_required} onCheckedChange={async (v) => { await adminSaveMeasurementField({ ...f, is_required: v }); load() }} /></td>
                <td className="p-3"><Switch checked={f.is_active} onCheckedChange={async (v) => { await adminSaveMeasurementField({ ...f, is_active: v }); load() }} /></td>
                <td className="p-3">
                  <Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteMeasurementField(f.id); load() }}><Trash2 className="size-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
