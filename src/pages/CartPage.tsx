import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Trash2, Minus, Plus, Pencil, ArrowLeft } from "lucide-react"
import { useCartStore } from "@/stores/cart"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SEO } from "@/components/SEO"
import { SHIPPING_FEE } from "@/lib/constants"

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const navigate = useNavigate()
  const subtotal = useCartStore((s) => s.subtotal())

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <SEO title="السلة" />
        <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">سلتك فارغة</h1>
        <p className="mt-2 text-muted-foreground">ابدأ بتصميم وشاح تخرجك وأضفه إلى السلة.</p>
        <Button asChild variant="gold" size="lg" className="mt-6">
          <Link to="/designer/scarf">صمّم وشاحك الآن</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SEO title="سلة التسوق" />
      <h1 className="mb-8 text-3xl font-bold">سلة التسوق</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row">
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-36">
                {item.previewUrl ? (
                  <img src={item.previewUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                    <ShoppingBag className="size-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5">{item.colorName || item.config.colorName || "لون"}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5">تطريز {item.config.threadName || ""}</span>
                      {item.config.graduationYear && (
                        <span className="rounded-full bg-muted px-2 py-0.5">سنة {item.config.graduationYear}</span>
                      )}
                    </div>
                    {item.config.name && (
                      <p className="mt-1.5 text-sm text-muted-foreground" dir={item.config.nameLanguage === "ar" ? "rtl" : "ltr"}>
                        الاسم: <span className="font-medium text-foreground">{item.config.name}</span>
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="حذف">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2 rounded-lg border p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded p-1 hover:bg-muted cursor-pointer" aria-label="نقصان">
                      <Minus className="size-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded p-1 hover:bg-muted cursor-pointer" aria-label="زيادة">
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/designer/scarf?edit=${item.id}`}>
                        <Pencil className="size-3.5" /> تعديل التصميم
                      </Link>
                    </Button>
                    <span className="text-lg font-bold">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button variant="ghost" onClick={() => navigate("/designer/scarf")}>
            <ArrowLeft className="size-4" /> أضف تصميمًا آخر
          </Button>
        </div>

        <div className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-20">
          <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>الشحن</span><span>{subtotal >= 500 ? "مجاني" : formatPrice(SHIPPING_FEE)}</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold"><span>الإجمالي</span><span className="text-primary">{formatPrice(subtotal >= 500 ? subtotal : subtotal + SHIPPING_FEE)}</span></div>
          </div>
          <Button asChild size="lg" variant="gold" className="mt-5 w-full">
            <Link to="/checkout">إتمام الطلب</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            سيُطلب منك إدخال بياناتك وقياساتك وبيانات التخرج في خطوة الدفع.
          </p>
        </div>
      </div>
    </div>
  )
}
