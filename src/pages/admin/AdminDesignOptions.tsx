import { useEffect, useState } from "react"
import { Palette, Type, Scissors, Plus, Trash2, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  adminListProductColors, adminSaveColor, adminDeleteColor,
  adminListFonts, adminSaveFont, adminDeleteFont,
  adminListThreads, adminSaveThread, adminDeleteThread,
} from "@/lib/adminApi"
import { adminListProducts } from "@/lib/adminApi"
import { toast } from "@/components/ui/use-toast"
import type { ProductColor, FontDef, EmbroideryThread } from "@/lib/types"
import { DEFAULT_FONTS } from "@/lib/constants"

export default function AdminDesignOptions() {
  const [colors, setColors] = useState<ProductColor[]>([])
  const [fonts, setFonts] = useState<FontDef[]>(DEFAULT_FONTS)
  const [threads, setThreads] = useState<EmbroideryThread[]>([])
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [productId, setProductId] = useState("")

  const load = () => {
    adminListProductColors().then(setColors).catch(() => {})
    adminListFonts().then(setFonts).catch(() => {})
    adminListThreads().then(setThreads).catch(() => {})
    adminListProducts().then((p) => { setProducts(p); if (p[0]) setProductId(p[0].id) }).catch(() => {})
  }
  useEffect(load, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الألوان والخطوط والتطريز</h2>
      <Tabs defaultValue="colors">
        <TabsList>
          <TabsTrigger value="colors"><Palette className="size-4" /> ألوان المنتجات</TabsTrigger>
          <TabsTrigger value="fonts"><Type className="size-4" /> الخطوط</TabsTrigger>
          <TabsTrigger value="threads"><Scissors className="size-4" /> ألوان التطريز</TabsTrigger>
        </TabsList>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 grid gap-3 sm:grid-cols-5">
              <div className="sm:col-span-2">
                <Label>المنتج</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>اسم اللون</Label><Input id="newColorName" placeholder="أسود" /></div>
              <div><Label>HEX</Label><Input id="newColorHex" type="color" defaultValue="#1c1c1c" className="h-10 w-full p-1" /></div>
              <div className="flex items-end">
                <Button className="w-full" onClick={async () => {
                  const name = (document.getElementById("newColorName") as HTMLInputElement).value
                  const hex = (document.getElementById("newColorHex") as HTMLInputElement).value
                  if (!name || !productId) { toast({ title: "أدخل الاسم واختر المنتج", variant: "destructive" }); return }
                  await adminSaveColor({ product_id: productId, name, hex, sort_order: colors.length + 1, is_available: true })
                  toast({ title: "تمت الإضافة", variant: "success" })
                  load()
                }}><Plus className="size-4" /> إضافة</Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">اللون</th><th className="p-3 font-medium">المنتج</th><th className="p-3 font-medium">المتوفر</th><th className="p-3 font-medium">إجراءات</th></tr></thead>
              <tbody>
                {colors.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        <span className="size-5 rounded-full border" style={{ background: c.hex }} />
                        {c.name} <span className="text-xs text-muted-foreground" dir="ltr">{c.hex}</span>
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{products.find((p) => p.id === c.product_id)?.name ?? "—"}</td>
                    <td className="p-3">
                      <Switch checked={c.is_available} onCheckedChange={async (v) => { await adminSaveColor({ ...c, is_available: v }); load() }} />
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteColor(c.id); load() }}><Trash2 className="size-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Fonts */}
        <TabsContent value="fonts" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">خط جديد</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><Label>اسم الخط</Label><Input id="newFontName" placeholder="خط عربي فاخر" /></div>
              <div><Label>مفتاح الخط</Label><Input id="newFontKey" placeholder="font-ar-x" dir="ltr" /></div>
              <div><Label>نوع</Label>
                <Select defaultValue="ar">
                  <SelectTrigger id="newFontType" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">عربي</SelectItem>
                    <SelectItem value="en">إنجليزي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>CSS Font Family</Label><Input id="newFontCss" placeholder="'Cairo', sans-serif" dir="ltr" /></div>
            </div>
            <Button className="mt-3" onClick={async () => {
              const name = (document.getElementById("newFontName") as HTMLInputElement).value
              const key = (document.getElementById("newFontKey") as HTMLInputElement).value
              const css = (document.getElementById("newFontCss") as HTMLInputElement).value
              const type = (document.getElementById("newFontType") as HTMLButtonElement).textContent === "عربي" ? "ar" : "en"
              if (!name || !key) { toast({ title: "أدخل الاسم والمفتاح", variant: "destructive" }); return }
              await adminSaveFont({ name, font_key: key, type: type as "ar" | "en", css_family: css, is_active: true, sort_order: fonts.length + 1 })
              toast({ title: "تمت الإضافة", variant: "success" })
              load()
            }}><Plus className="size-4" /> إضافة خط</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fonts.map((f) => (
              <div key={f.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{f.type === "ar" ? "عربي" : "إنجليزي"} • {f.font_key}</p>
                  </div>
                  <Switch checked={f.is_active} onCheckedChange={async (v) => { await adminSaveFont({ ...f, is_active: v }); load() }} />
                </div>
                <div className="mt-3 rounded-xl bg-muted/60 p-3 text-center">
                  <span className="text-2xl" style={{ fontFamily: f.css_family || undefined }}>{f.type === "ar" ? "أبجد هوز" : "ABC"}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Threads */}
        <TabsContent value="threads" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">لون خيط جديد</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><Label>الاسم</Label><Input id="newThreadName" placeholder="ذهبي" /></div>
              <div><Label>HEX</Label><Input id="newThreadHex" type="color" defaultValue="#d4af37" className="h-10 w-full p-1" /></div>
              <div><Label>سعر إضافي</Label><Input id="newThreadPrice" type="number" defaultValue={0} dir="ltr" /></div>
            </div>
            <Button className="mt-3" onClick={async () => {
              const name = (document.getElementById("newThreadName") as HTMLInputElement).value
              const hex = (document.getElementById("newThreadHex") as HTMLInputElement).value
              const price = Number((document.getElementById("newThreadPrice") as HTMLInputElement).value)
              if (!name) { toast({ title: "أدخل الاسم", variant: "destructive" }); return }
              await adminSaveThread({ name, hex, price_adjust: price, is_active: true, sort_order: threads.length + 1 })
              toast({ title: "تمت الإضافة", variant: "success" })
              load()
            }}><Plus className="size-4" /> إضافة</Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">اللون</th><th className="p-3 font-medium">السعر الإضافي</th><th className="p-3 font-medium">فعال</th><th className="p-3 font-medium">إجراءات</th></tr></thead>
              <tbody>
                {threads.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        <span className="size-5 rounded-full border" style={{ background: t.hex }} />
                        {t.name}
                      </span>
                    </td>
                    <td className="p-3" dir="ltr">{t.price_adjust} SAR</td>
                    <td className="p-3"><Switch checked={t.is_active} onCheckedChange={async (v) => { await adminSaveThread({ ...t, is_active: v }); load() }} /></td>
                    <td className="p-3"><Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteThread(t.id); load() }}><Trash2 className="size-4 text-destructive" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
