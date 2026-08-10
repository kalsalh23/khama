import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Check, Palette, Ruler, Shirt } from "lucide-react"
import { useProduct } from "@/hooks/useProducts"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SEO } from "@/components/SEO"
import NotFoundPage from "@/pages/NotFoundPage"
import { ScarfIllustration } from "@/components/illustrations/ProductIllustrations"

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading } = useProduct(slug ?? "")
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  if (!product) return <NotFoundPage />

  const image = product.images?.[0]?.url
  const colors = product.colors?.filter((c) => c.is_available) ?? []
  const selected = selectedColor ?? colors[0]?.hex

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SEO title={product.name} description={product.description ?? undefined} />
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">الرئيسية</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">المنتجات</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border bg-muted/40 p-8">
            {image ? (
              <img src={image} alt={product.name} className="aspect-square w-full object-cover rounded-2xl" />
            ) : (
              <ScarfIllustration className="mx-auto w-64" color={selected ?? undefined} />
            )}
            <div className="absolute top-4 right-4">
              <Badge variant="gold">{product.is_designable ? "قابل للتخصيص" : "جاهز"}</Badge>
            </div>
          </div>
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-4">
              <span className="flex w-full items-center gap-2 text-sm font-medium">
                <Palette className="size-4" /> الألوان المتاحة
              </span>
              {colors.map((c) => (
                <button
                  key={c.id}
                  title={c.name}
                  onClick={() => setSelectedColor(c.hex)}
                  className="flex items-center gap-2 rounded-full border px-2 py-1 text-xs hover:bg-muted cursor-pointer"
                >
                  <span className="size-4 rounded-full border" style={{ background: c.hex }} />
                  {c.name}
                  {selected === c.hex && <Check className="size-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.base_price)}</span>
            <Badge variant="secondary">يبدأ من</Badge>
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <Tabs defaultValue="details" className="mt-8">
            <TabsList>
              <TabsTrigger value="details"><Shirt className="size-4" /> التفاصيل</TabsTrigger>
              <TabsTrigger value="material"><Palette className="size-4" /> الخامة</TabsTrigger>
              <TabsTrigger value="sizes"><Ruler className="size-4" /> القياسات</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="rounded-xl border bg-card p-6 text-sm leading-relaxed">
              <p>
                {product.is_designable
                  ? "يمكنك تخصيص هذا المنتج بالكامل: اختر الألوان، أضف اسمك وسنة التخرج وعبارتك الخاصة، وارفع شعارك. ستشاهد معاينة حية لتصميمك قبل الطلب."
                  : "منتج جاهز بجودة عالية. اختر المقاس المناسب وسنقوم بالتجهيز."}
              </p>
            </TabsContent>
            <TabsContent value="material" className="rounded-xl border bg-card p-6 text-sm leading-relaxed">
              <p>{product.material || "خامة فاخرة عالية الجودة مع تطريز دقيق."}</p>
            </TabsContent>
            <TabsContent value="sizes" className="rounded-xl border bg-card p-6 text-sm leading-relaxed">
              <p>
                نستخدم نظام قياسات حقيقي (الطول، عرض الكتف، محيط الصدر، طول الذراع...).
                <Link to="/measurements" className="mx-1 text-primary underline">شاهد دليل القياسات</Link>
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant={product.is_designable ? "gold" : "default"} className="flex-1 sm:flex-none">
              <Link to={`/designer/${product.category === "scarf" ? "scarf" : "scarf"}?product=${product.id}`}>
                {product.is_designable ? "ابدأ التصميم" : "اطلب الآن"}
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/products">متابعة التصفح</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
