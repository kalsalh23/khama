import { Link } from "react-router-dom"
import { ArrowLeft, Palette, Shirt, Sparkles, Ruler, ShoppingBag, Truck, BadgeCheck, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SEO } from "@/components/SEO"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/ProductCard"
import { ScarfIllustration, RobeIllustration, CapIllustration, SetIllustration } from "@/components/illustrations/ProductIllustrations"
import { Skeleton } from "@/components/ui/skeleton"

const FEATURES = [
  {
    icon: PenTool,
    title: "صمّم بنفسك",
    desc: "اختر الألوان، أضف اسمك وعبارتك وشعاراتك في محرر تفاعلي.",
  },
  {
    icon: Sparkles,
    title: "معاينة فورية",
    desc: "شاهد التصميم النهائي على الوشاح قبل الطلب بتفاصيل دقيقة.",
  },
  {
    icon: Ruler,
    title: "قياسات دقيقة",
    desc: "نظام قياسات حقيقي مع صور توضيحية لضمان مقاس مثالي.",
  },
  {
    icon: Truck,
    title: "شحن وتتبع",
    desc: "تتبع طلبك من التصميم حتى التسليم لحظة بلحظة.",
  },
]

const STEPS = [
  { n: "01", title: "اختر المنتج", desc: "وشاح، روب، قبعة، أو طقم كامل." },
  { n: "02", title: "صمّم تخرجك", desc: "الون، اسم، خط، تطريز، شعار." },
  { n: "03", title: "أدخل قياساتك", desc: "مقاساتك بالتفصيل مع دليل مصور." },
  { n: "04", title: "اطلب وتابع", desc: "ادفع بأمان وتابع حالة الطلب." },
]

export default function HomePage() {
  const { products, loading } = useProducts()

  return (
    <div>
      <SEO
        title="مصمم التخرج الشخصي"
        description="أنشئ تصميمك الخاص لوشاح التخرج واختار الألوان وأضف اسمك وعبارتك وشاهد النتيجة قبل الطلب."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-amber-500/20 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 size-[500px] rounded-full bg-primary/30 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="space-y-6">
            <Badge className="bg-white/10 text-amber-300 hover:bg-white/10 border-amber-400/30">
              مصمم تخرج شخصي
            </Badge>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              صمّم تخرجك
              <span className="bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent"> بطريقتك</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              أنشئ تصميمك الخاص، اختر الألوان، أضف اسمك وعبارتك وشعاراتك، وشاهد النتيجة قبل الطلب.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link to="/designer/scarf">
                  صمّم الآن
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link to="/products">استكشف المنتجات</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-slate-400">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-amber-400" /> معاينة مباشرة</span>
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-amber-400" /> تطريز فاخر</span>
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-amber-400" /> شحن سريع</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <ScarfIllustration className="w-full" />
              <div className="absolute bottom-4 right-6 left-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">وشاح التخرج - تصميم مخصص</p>
                    <p className="text-xs text-slate-400">قصي الصالح • ٢٠٢٦ • تطريز ذهبي</p>
                  </div>
                  <Badge variant="gold">معاينة حية</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-3">منتجاتنا</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">اختر منتجك وابدأ التصميم</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            كل منتج قابل للتخصيص بالكامل ليناسب ذوقك وهوية جامعتك.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ProductCard
              product={{
                id: "demo-scarf",
                name: "وشاح التخرج",
                slug: "scarf",
                description: "صمّم وشاحك بنفسك بألوانك واسمك وعبارتك",
                base_price: 120,
                category: "scarf",
                is_designable: true,
                is_active: true,
                sort_order: 1,
                created_at: new Date().toISOString(),
              }}
            />
            <ProductCard
              product={{
                id: "demo-robe",
                name: "روب التخرج",
                slug: "robe",
                description: "اختر اللون والمقاس",
                base_price: 180,
                category: "robe",
                is_designable: false,
                is_active: true,
                sort_order: 2,
                created_at: new Date().toISOString(),
              }}
            />
            <ProductCard
              product={{
                id: "demo-cap",
                name: "قبعة التخرج",
                slug: "cap",
                description: "أضف اسمك أو سنة التخرج",
                base_price: 60,
                category: "cap",
                is_designable: true,
                is_active: true,
                sort_order: 3,
                created_at: new Date().toISOString(),
              }}
            />
            <ProductCard
              product={{
                id: "demo-set",
                name: "طقم التخرج",
                slug: "set",
                description: "وشاح + روب + قبعة بسعر مميز",
                base_price: 320,
                category: "set",
                is_designable: true,
                is_active: true,
                sort_order: 4,
                created_at: new Date().toISOString(),
              }}
            />
          </div>
        )}
      </section>

      {/* Categories strip */}
      <section className="border-y bg-muted/50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">اكتمل مظهر تخرجك</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ScarfIllustration, title: "وشاح", desc: "صمّم وشاحك بنفسك", to: "/products/scarf" },
              { icon: RobeIllustration, title: "روب", desc: "اختر اللون والمقاس", to: "/products/robe" },
              { icon: CapIllustration, title: "قبعة", desc: "أضف اسمك وسنتك", to: "/products/cap" },
              { icon: SetIllustration, title: "طقم", desc: "التصميم الكامل", to: "/products/set" },
            ].map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="group rounded-2xl border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 w-20">
                  <c.icon className="w-full" />
                </div>
                <h3 className="font-semibold group-hover:text-primary">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-3">كيف تعمل المنصة</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">رحلة التصميم الخاصة بك</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border bg-card p-6">
              <span className="mb-4 inline-block text-4xl font-bold text-primary/20">{s.n}</span>
              <h3 className="mb-2 font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="gold">
            <Link to="/designer/scarf">
              ابدأ تصميمك الآن
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <Badge className="mb-3 bg-white/10 text-amber-300">لماذا خاما؟</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">تجربة تصميم لا تُنسى</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <f.icon className="size-6" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-slate-900 p-10 text-center text-white sm:p-16">
          <div className="absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold sm:text-4xl">جاهز لتصميم وشاح تخرجك؟</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-200">
            انضم لآلاف الخريجين الذين صمّموا أزياء تخرجهم بأيديهم مع خاما.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="gold">
              <Link to="/designer/scarf">صمّم الآن</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/products">تصفح المنتجات</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
