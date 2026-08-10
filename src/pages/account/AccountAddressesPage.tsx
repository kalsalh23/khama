import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { fetchAddresses, saveAddress, updateAddress, deleteAddress } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ShippingAddress } from "@/lib/types"

const emptyForm = { label: "", full_name: "", phone: "", city: "", region: "", detailed_address: "" }

export default function AccountAddressesPage() {
  const user = useAuthStore((s) => s.user)
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    if (!user) return
    fetchAddresses(user.id).then(setAddresses).catch(() => {})
  }
  useEffect(load, [user])

  const submit = async () => {
    if (!user) return
    if (!form.full_name || !form.phone || !form.city || !form.region || !form.detailed_address) {
      toast({ title: "بيانات ناقصة", description: "أكمل جميع الحقول المطلوبة.", variant: "destructive" })
      return
    }
    try {
      if (editingId) {
        await updateAddress(editingId, form)
        toast({ title: "تم تحديث العنوان", variant: "success" })
      } else {
        await saveAddress({ user_id: user.id, is_default: addresses.length === 0, ...form })
        toast({ title: "تم إضافة العنوان", variant: "success" })
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      load()
    } catch {
      toast({ title: "فشل الحفظ", variant: "destructive" })
    }
  }

  const startEdit = (a: ShippingAddress) => {
    setEditingId(a.id)
    setForm({ label: a.label ?? "", full_name: a.full_name, phone: a.phone, city: a.city, region: a.region, detailed_address: a.detailed_address })
    setShowForm(true)
  }

  const remove = async (id: string) => {
    if (!confirm("حذف هذا العنوان؟")) return
    await deleteAddress(id)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">عناويني</h2>
        <Button variant="outline" size="sm" onClick={() => { setShowForm((v) => !v); setEditingId(null); setForm(emptyForm) }}>
          <Plus className="size-4" /> إضافة عنوان
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">{editingId ? "تعديل العنوان" : "عنوان جديد"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>اسم العنوان (اختياري)</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="المنزل / العمل" /></div>
            <div><Label>الاسم الكامل</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>رقم الهاتف</Label><Input value={form.phone} dir="ltr" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>المدينة</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>المنطقة</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>العنوان بالتفصيل</Label><Textarea value={form.detailed_address} onChange={(e) => setForm({ ...form, detailed_address: e.target.value })} /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={submit}>{editingId ? "حفظ التعديلات" : "حفظ العنوان"}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          لا توجد عناوين محفوظة.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{a.label || a.full_name}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="iconSm" onClick={() => startEdit(a)}>تعديل</Button>
                  <Button variant="ghost" size="iconSm" onClick={() => remove(a.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.full_name} • {a.phone}</p>
              <p className="text-sm text-muted-foreground">{a.city}، {a.region}</p>
              <p className="text-sm text-muted-foreground">{a.detailed_address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
