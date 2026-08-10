import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { adminListProducts, adminDeleteProduct } from "@/lib/adminApi"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminListProducts().then(setProducts).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const remove = async (p: Product) => {
    if (!confirm(`حذف المنتج "${p.name}"؟`)) return
    try {
      await adminDeleteProduct(p.id)
      setProducts((x) => x.filter((y) => y.id !== p.id))
      toast({ title: "تم الحذف", variant: "success" })
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">المنتجات</h2>
        <Button asChild><Link to="/admin/products/new"><Plus className="size-4" /> إضافة منتج</Link></Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-right">
              <th className="p-3 font-medium">المنتج</th>
              <th className="p-3 font-medium">الفئة</th>
              <th className="p-3 font-medium">السعر</th>
              <th className="p-3 font-medium">قابل للتخصيص</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6"><Skeleton className="h-32 w-full" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد منتجات</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} className="h-10 w-10 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3 font-semibold">{formatPrice(p.base_price)}</td>
                <td className="p-3">{p.is_designable ? <Badge variant="gold">نعم</Badge> : <Badge variant="secondary">لا</Badge>}</td>
                <td className="p-3">{p.is_active ? <Badge variant="success">فعال</Badge> : <Badge variant="outline">معطّل</Badge>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="iconSm" asChild><Link to={`/admin/products/${p.id}`}><Pencil className="size-4" /></Link></Button>
                    <Button variant="ghost" size="iconSm" onClick={() => remove(p)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
