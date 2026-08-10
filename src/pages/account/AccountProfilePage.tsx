import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { updateProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function AccountProfilePage() {
  const { user, profile, refreshProfile } = useAuthStore()
  const [form, setForm] = useState({ full_name: "", phone: "", university: "", college: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        university: profile.university ?? "",
        college: profile.college ?? "",
      })
    }
  }, [profile])

  if (!user) return null

  const submit = async () => {
    setSaving(true)
    try {
      await updateProfile(user.id, form)
      await refreshProfile()
      toast({ title: "تم حفظ البيانات", variant: "success" })
    } catch {
      toast({ title: "فشل الحفظ", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">البيانات الشخصية</h2>
      <div className="rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>الاسم الكامل</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>رقم الهاتف</Label><Input value={form.phone} dir="ltr" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>البريد الإلكتروني (ثابت)</Label><Input value={user.email ?? ""} disabled dir="ltr" /></div>
          <div><Label>الجامعة</Label><Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>الكلية</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
        </div>
        <Button className="mt-4" onClick={submit} disabled={saving}>
          {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  )
}
