import { Link } from "react-router-dom"
import { ArrowLeft, Palette as PaletteIcon } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url
  const categoryLabel: Record<string, string> = {
    scarf: "وشاح",
    robe: "روب",
    cap: "قبعة",
    set: "طقم",
    other: "منتج",
  }

  return (
    <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
            <PaletteIcon className="size-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur">
            {categoryLabel[product.category] || product.category}
          </Badge>
        </div>
        {product.is_designable && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="gold">قابل للتخصيص</Badge>
          </div>
        )}
      </Link>
      <div className="space-y-2 p-4">
        <h3 className="font-semibold leading-tight">
          <Link to={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-sm text-muted-foreground">يبدأ من </span>
            <span className="font-bold text-primary">{formatPrice(product.base_price)}</span>
          </div>
        </div>
        <Button asChild className="w-full" variant={product.is_designable ? "gold" : "default"}>
          <Link to={`/products/${product.slug}`}>
            {product.is_designable ? "صمّم الآن" : "اطلب الآن"}
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
