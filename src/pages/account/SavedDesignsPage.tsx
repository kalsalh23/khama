import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Pencil, Trash2, ShoppingBag } from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { fetchSavedDesigns, deleteDesign } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import type { SavedDesign } from "@/lib/types"

export default function SavedDesignsPage() {
  const user = useAuthStore((s) => s.user)
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!user) return
    fetchSavedDesigns(user.id)
      .then(setDesigns)
      .finally(() => setLoading(false))
  }

  useEffect(load, [user])

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصميم؟")) return
    try {
      await deleteDesign(id)
      setDesigns((d) => d.filter((x) => x.id !== id))
      toast({ title: "تم حذف التصميم", variant: "success" })
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" })
    }
  }

  if (loading) return <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>

  if (designs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="font-semibold">لا توجد تصاميم محفوظة</p>
        <p className="mt-2 text-sm text-muted-foreground">صمّم وشاحك واحفظه لتظهر هنا.</p>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/designer/scarf">صمّم الآن</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {designs.map((d) => (
        <div key={d.id} className="overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-square w-full bg-muted">
            {d.preview_url ? (
              <img src={d.preview_url} alt={d.config?.name || "تصميم"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-bold text-primary/20">
                {d.config?.name?.slice(0, 1) || "خ"}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{d.config?.name || d.product_name || "تصميم"}</h3>
            <p className="text-xs text-muted-foreground">
              {d.product_name || "وشاح التخرج"} • {formatDate(d.created_at)}
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link to={`/designer/scarf?load=${d.id}`}><Pencil className="size-3.5" /> تعديل</Link>
              </Button>
              <Button asChild size="sm" variant="gold" className="flex-1">
                <Link to="/checkout" state={{ designId: d.id }}><ShoppingBag className="size-3.5" /> طلب</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)} aria-label="حذف">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
