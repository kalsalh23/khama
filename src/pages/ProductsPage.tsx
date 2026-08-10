import { useSearchParams } from "react-router-dom"
import { SearchX } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { SEO } from "@/components/SEO"

export default function ProductsPage() {
  const { products, loading } = useProducts()
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? ""

  const filtered = query
    ? products.filter((p) =>
        `${p.name} ${p.description ?? ""} ${p.category}`.toLowerCase().includes(query.toLowerCase())
      )
    : products

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SEO title="المنتجات" description="وشاح، روب، قبعة، وطقم تخرج - كلها قابلة للتخصيص حسب ذوقك." />
      <div className="mb-10">
        <h1 className="text-3xl font-bold sm:text-4xl">منتجات التخرج</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          اختر منتجك وابدأ التصميم. كل منتج قابل للتخصيص بالكامل.
        </p>
        <div className="mt-6 max-w-md">
          <Input
            placeholder="ابحث عن منتج..."
            value={query}
            onChange={(e) => {
              if (e.target.value) setParams({ q: e.target.value })
              else setParams({})
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center">
          <SearchX className="mb-4 size-12 text-muted-foreground" />
          <p className="font-semibold">لا توجد نتائج</p>
          <p className="text-sm text-muted-foreground">جرّب كلمة بحث مختلفة.</p>
        </div>
      )}
    </div>
  )
}
