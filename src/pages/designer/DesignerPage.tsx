import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ShoppingBag,
  Save,
  Palette,
  Type,
  Languages,
  TextQuote,
  Calendar,
  MapPin,
  Image as ImageIcon,
  RefreshCcw,
  Check,
} from "lucide-react"
import { useDesignerStore } from "@/stores/designer"
import { useAuthStore } from "@/stores/auth"
import { useCartStore } from "@/stores/cart"
import { DesignerPreview } from "@/components/designer/DesignerPreview"
import { LogoControls } from "@/components/designer/LogoControls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"
import { SEO } from "@/components/SEO"
import { SCARF_COLORS, DEFAULT_FONTS, DEFAULT_THREADS, NAME_POSITIONS } from "@/lib/constants"
import { fetchFonts, fetchThreads, fetchProductBySlug } from "@/lib/api"
import { uploadPreview } from "@/lib/storage"
import { saveDesign, updateDesign } from "@/lib/api"
import { createScarfPreview } from "@/lib/scarfRenderer"
import { calculateUnitPrice } from "@/lib/pricing"
import { toast } from "@/components/ui/use-toast"
import type { FontDef, EmbroideryThread, Product, ScarfDesignConfig } from "@/lib/types"

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

export default function DesignerPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { config, update, setColor, setName, setLanguage, setFont, setThread, setPosition, setYear, setCustomText, setLogo, reset } =
    useDesignerStore()
  const user = useAuthStore((s) => s.user)
  const addItem = useCartStore((s) => s.addItem)

  const [fonts, setFonts] = useState<FontDef[]>(DEFAULT_FONTS)
  const [threads, setThreads] = useState<EmbroideryThread[]>(DEFAULT_THREADS)
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFonts().then(setFonts).catch(() => setFonts(DEFAULT_FONTS))
    fetchThreads().then(setThreads).catch(() => setThreads(DEFAULT_THREADS))
  }, [])

  const productParam = params.get("product")
  const loadParam = params.get("load")
  const editParam = params.get("edit")

  // Load product config
  useEffect(() => {
    if (productParam) {
      fetchProductBySlug(productParam)
        .then((p) => {
          if (p) {
            setProduct(p)
            update({ product: p.slug, productId: p.id, color: p.colors?.[0]?.hex ?? config.color })
          }
        })
        .catch(() => {})
    } else {
      setProduct(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productParam])

  // Load saved design
  useEffect(() => {
    if (loadParam && user) {
      import("@/lib/api").then(({ fetchSavedDesigns }) =>
        fetchSavedDesigns(user.id).then((designs) => {
          const d = designs.find((x) => x.id === loadParam)
          if (d) useDesignerStore.getState().setConfig(d.config as ScarfDesignConfig)
        })
      )
    }
  }, [loadParam, user])

  // Load cart item for editing
  useEffect(() => {
    if (editParam) {
      const item = useCartStore.getState().items.find((i) => i.id === editParam)
      if (item) {
        useDesignerStore.getState().setConfig(item.config)
        if (item.productId) fetchProductBySlug(item.productSlug).then(setProduct).catch(() => {})
      }
    }
  }, [editParam])

  const price = useMemo(
    () => calculateUnitPrice(product, config, threads.find((t) => t.hex === config.threadColor) ?? null),
    [product, config, threads]
  )

  const handleSaveDesign = async () => {
    if (!user) {
      toast({
        title: "سجّل الدخول أولاً",
        description: "لحفظ تصميمك يجب أن تكون مسجلاً في المنصة.",
        variant: "destructive",
      })
      navigate("/login", { state: { from: "/designer/scarf" } })
      return
    }
    setSaving(true)
    try {
      const preview = createScarfPreview(config, fonts, 2)
      let previewUrl: string | undefined
      try {
        const res = await uploadPreview(preview, user.id)
        previewUrl = res.url
      } catch {}
      if (loadParam) {
        await updateDesign(loadParam, config, previewUrl)
        toast({ title: "تم تحديث التصميم", variant: "success" })
      } else {
        await saveDesign(user.id, config, {
          productId: product?.id,
          productName: product?.name ?? "وشاح التخرج",
          previewUrl,
        })
        toast({ title: "تم حفظ التصميم", description: "يمكنك العودة إليه لاحقاً من حسابك.", variant: "success" })
      }
    } catch (e) {
      toast({ title: "فشل الحفظ", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleAddToCart = async () => {
    if (!config.name.trim()) {
      toast({ title: "أضف اسمك", description: "اكتب اسمك ليظهر على الوشاح قبل الإضافة للسلة.", variant: "destructive" })
      return
    }
    const preview = createScarfPreview(config, fonts, 2)
    let previewUrl: string | undefined
    if (user) {
      try {
        const res = await uploadPreview(preview, user.id)
        previewUrl = res.url
      } catch {}
    }

    const thread = threads.find((t) => t.hex === config.threadColor)

    addItem({
      productId: product?.id ?? "scarf",
      productSlug: product?.slug ?? "scarf",
      productName: product?.name ?? "وشاح التخرج",
      productImage: product?.images?.[0]?.url ?? previewUrl ?? "",
      config,
      previewUrl,
      basePrice: price.basePrice,
      embroideryPrice: price.embroideryPrice,
      logoPrice: price.logoPrice,
      unitPrice: price.unitPrice,
      colorName: config.colorName ?? "",
      quantity: 1,
      measurements: undefined,
    })
    toast({ title: "أُضيف إلى السلة", description: "تصميمك جاهز في السلة.", variant: "success" })
    navigate("/cart")
  }

  const selectedThread = threads.find((t) => t.hex === config.threadColor)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <SEO
        title="مصمم الوشاح"
        description="صمّم وشاح تخرجك بنفسك - اختر الألوان، أضف اسمك وعبارتك وشعارك، وشاهد المعاينة الحية."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">مصمم الوشاح</h1>
          <p className="text-sm text-muted-foreground">خصص تصميمك وشاهد النتيجة مباشرة</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-sm">
            {formatPrice(price.unitPrice)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview (top on mobile) */}
        <div className="order-1 lg:order-2">
          <DesignerPreview
            config={config}
            fonts={fonts}
            onBackgroundChange={(bg) => update({ background: bg })}
            className="lg:sticky lg:top-20"
          />
        </div>

        {/* Controls */}
        <div className="order-2 space-y-5 lg:order-1">
          <Section icon={Palette} title="لون الوشاح">
            <div className="flex flex-wrap gap-3">
              {(product?.colors?.length ? product.colors.filter((c) => c.is_available) : SCARF_COLORS).map((c) => (
                <button
                  key={c.id ?? c.name}
                  onClick={() => setColor(c.hex, c.name)}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  aria-label={c.name}
                >
                  <span
                    className={cn(
                      "size-10 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110",
                      config.color.toLowerCase() === c.hex.toLowerCase() && "ring-2 ring-primary ring-offset-2 scale-110"
                    )}
                    style={{ background: c.hex }}
                  />
                  <span className="text-[11px] text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section icon={Type} title="الاسم">
            <Input
              placeholder="اكتب اسمك... مثال: قصي الصالح"
              value={config.name}
              onChange={(e) => setName(e.target.value)}
              dir={config.nameLanguage === "ar" ? "rtl" : "ltr"}
            />
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-muted-foreground" />
              <div className="flex rounded-lg border p-0.5">
                {(["ar", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                      config.nameLanguage === lang ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    {lang === "ar" ? "العربية" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Type} title="نوع الخط">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {fonts.filter((f) => f.is_active).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.font_key)}
                  className={cn(
                    "rounded-xl border p-3 text-center transition-all cursor-pointer",
                    config.font === f.font_key
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-muted-foreground/40"
                  )}
                >
                  <span className="block text-xs text-muted-foreground">{f.name}</span>
                  <span className="mt-1 block truncate text-lg" style={{ fontFamily: f.css_family || undefined }}>
                    {config.nameLanguage === "ar" ? "أبجد" : "A-Z"}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section icon={Palette} title="لون التطريز">
            <div className="flex flex-wrap gap-2">
              {(threads.length ? threads.filter((t) => t.is_active) : DEFAULT_THREADS).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThread(t.hex, t.name)}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all hover:bg-muted cursor-pointer"
                >
                  <span className="size-4 rounded-full border" style={{ background: t.hex }} />
                  {t.name}
                  {config.threadColor === t.hex && <Check className="size-3.5 text-primary" />}
                </button>
              ))}
            </div>
            {selectedThread && selectedThread.price_adjust > 0 && (
              <p className="text-xs text-muted-foreground">
                سعر إضافي للتطريز: {formatPrice(selectedThread.price_adjust)}
              </p>
            )}
          </Section>

          <Section icon={MapPin} title="موضع الاسم">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {NAME_POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id as ScarfDesignConfig["namePosition"])}
                  className={cn(
                    "rounded-xl border p-3 text-center text-sm transition-all cursor-pointer",
                    config.namePosition === pos.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-muted-foreground/40"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            {config.namePosition === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">الموضع الأفقي</Label>
                  <Input type="number" min={10} max={90} value={config.nameX ?? 50} onChange={(e) => update({ nameX: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">الموضع العمودي</Label>
                  <Input type="number" min={30} max={80} value={config.nameY ?? 62} onChange={(e) => update({ nameY: Number(e.target.value) })} />
                </div>
              </div>
            )}
          </Section>

          <Section icon={Calendar} title="سنة التخرج">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="مثال: 2026"
                value={config.graduationYear}
                onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                className="max-w-[160px]"
                dir="ltr"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.yearEnabled}
                  onChange={(e) => update({ yearEnabled: e.target.checked })}
                  className="accent-primary"
                />
                عرض السنة على الوشاح
              </label>
            </div>
          </Section>

          <Section icon={TextQuote} title="العبارة الخاصة (اختياري)">
            <Input
              placeholder="مثال: لروح أبي وأخي، أو الحمد لله..."
              value={config.customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.customTextEnabled}
                onChange={(e) => update({ customTextEnabled: e.target.checked })}
                className="accent-primary"
              />
              عرض العبارة على الوشاح
            </label>
          </Section>

          <Section icon={ImageIcon} title="الشعار">
            <LogoControls
              logo={config.logo}
              onSet={(logo) => setLogo(logo)}
              onClear={() => setLogo(undefined)}
            />
          </Section>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">ملخص السعر</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span>سعر المنتج</span><span>{formatPrice(price.basePrice)}</span></div>
              <div className="flex justify-between"><span>التطريز</span><span>{price.embroideryPrice ? formatPrice(price.embroideryPrice) : "مجاني"}</span></div>
              <div className="flex justify-between"><span>الشعار</span><span>{price.logoPrice ? formatPrice(price.logoPrice) : "0"}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold"><span>الإجمالي</span><span className="text-primary">{formatPrice(price.unitPrice)}</span></div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button variant="gold" size="lg" onClick={handleAddToCart} className="w-full">
                <ShoppingBag className="size-4" />
                أضف إلى السلة
              </Button>
              <Button variant="outline" size="lg" onClick={handleSaveDesign} disabled={saving} className="w-full">
                <Save className="size-4" />
                {saving ? "جارٍ الحفظ..." : "احفظ التصميم"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="mt-2 w-full text-muted-foreground"
            >
              <RefreshCcw className="size-4" />
              إعادة تعيين التصميم
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
