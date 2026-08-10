import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Save, Upload, Trash2, Plus } from "lucide-react"
import { adminListProducts, adminSaveProduct, adminAddProductImage, adminDeleteProductImage } from "@/lib/adminApi"
import { uploadProductImage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    name: "",
    slug: "",
    description: "",
    material: "",
    base_price: 0,
    category: "scarf" as Product["category"],
    is_designable: true,
    is_active: true,
    sort_order: 0,
  })
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([])
  const [colors, setColors] = useState<Array<{ id: string; name: string; hex: string }>>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) {
      adminListProducts().then((list) => {
        const p = list.find((x) => x.id === id)
        if (p) {
          setForm({ id: p.id, name: p.name, slug: p.slug, description: p.description ?? "", material: p.material ?? "", base_price: p.base_price, category: p.category, is_designable: p.is_designable, is_active: p.is_active, sort_order: p.sort_order })
          setImages(p.images ?? [])
          setColors(p.colors ?? [])
        }
      })
    }
  }, [id])

  const handleImage = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadProductImage(file, form.slug || "product")
      const saved = await adminAddProductImage(form.id!, url, form.name)
      setImages((x) => [...x, { id: saved.id, url }])
      toast({ title: "تم رفع الصورة", variant: "success" })
    } catch (e) {
      toast({ title: "فشل الرفع", description: (e as Error).message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "الاسم والرابط مطلوبان", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await adminSaveProduct({ ...form, images: images.map((i) => ({ url: i.url })) })
      toast({ title: "تم الحفظ", variant: "success" })
      navigate("/admin/products")
    } catch (e) {
      toast({ title: "فشل الحفظ", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{id ? "تعديل منتج" : "منتج جديد"}</h2>

      <div className="rounded-2xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>اسم المنتج</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>الرابط (slug)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} dir="ltr" placeholder="scarf" /></div>
          <div className="sm:col-span-2"><Label>الوصف</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>الخامة</Label><Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
          <div><Label>السعر الابتدائي (ريال)</Label><Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} dir="ltr" /></div>
          <div>
            <Label>الفئة</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Product["category"] })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scarf">وشاح</SelectItem>
                <SelectItem value="robe">روب</SelectItem>
                <SelectItem value="cap">قبعة</SelectItem>
                <SelectItem value="set">طقم</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>ترتيب العرض</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} dir="ltr" /></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_designable} onCheckedChange={(v) => setForm({ ...form, is_designable: v })} /> قابل للتخصيص</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /> فعال</label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>صور المنتج</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = "" }} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || !id}>
            <Upload className="size-4" /> {uploading ? "جارٍ الرفع..." : "رفع صورة"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative">
              <img src={img.url} alt="" className="h-24 w-24 rounded-lg object-cover" />
              <button
                className="absolute -top-2 -left-2 rounded-full bg-destructive p-1 text-white"
                onClick={async () => {
                  await adminDeleteProductImage(img.id)
                  setImages((x) => x.filter((y) => y.id !== img.id))
                }}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>الألوان المتاحة (تُدار من صفحة الألوان والخطوط)</Label>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><Plus className="size-4" /> {colors.length} لون</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <span key={c.id} className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
              <span className="size-4 rounded-full border" style={{ background: c.hex }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}><Save className="size-4" /> {saving ? "جارٍ الحفظ..." : "حفظ المنتج"}</Button>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>إلغاء</Button>
      </div>
    </div>
  )
}
