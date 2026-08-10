import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ruler, Save, Check, Info } from "lucide-react"
import { fetchMeasurementFields, fetchUserMeasurements, saveUserMeasurements } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { SEO } from "@/components/SEO"
import { toast } from "@/components/ui/use-toast"
import type { MeasurementField, MeasurementValue } from "@/lib/types"

const DEFAULT_FIELDS: MeasurementField[] = [
  { id: "height", name: "الطول", name_en: "Height", description: "قِس من قمة الرأس إلى الأرض", unit: "cm", is_required: true, is_active: true, sort_order: 1 },
  { id: "shoulder", name: "عرض الكتف", name_en: "Shoulder", description: "من نهاية كتف إلى الأخرى", unit: "cm", is_required: true, is_active: true, sort_order: 2 },
  { id: "chest", name: "محيط الصدر", name_en: "Chest", description: "أوسع جزء من الصدر", unit: "cm", is_required: true, is_active: true, sort_order: 3 },
  { id: "waist", name: "محيط الخصر", name_en: "Waist", description: "حول الخصر الطبيعي", unit: "cm", is_required: true, is_active: true, sort_order: 4 },
  { id: "arm", name: "طول الذراع", name_en: "Sleeve", description: "من الكتف إلى المعصم", unit: "cm", is_required: true, is_active: true, sort_order: 5 },
  { id: "body", name: "طول الجسم", name_en: "Body length", description: "من الكتف إلى الحاشية السفلية", unit: "cm", is_required: true, is_active: true, sort_order: 6 },
]

function MeasureCard({
  field,
  value,
  onChange,
}: {
  field: MeasurementField
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {field.name}
          <span className="text-xs font-normal text-muted-foreground">{field.name_en}</span>
          {field.is_required && <span className="text-xs text-destructive">*</span>}
        </CardTitle>
        <CardDescription className="flex items-start gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex cursor-help items-center gap-1">
                <Info className="size-3.5 shrink-0" />
                {field.description}
              </span>
            </TooltipTrigger>
            <TooltipContent>{field.description}</TooltipContent>
          </Tooltip>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-end gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            className="pl-10 text-center"
          />
          <span className="absolute bottom-0 left-2 top-0 flex items-center text-xs text-muted-foreground">
            {field.unit || "cm"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MeasurementsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [fields, setFields] = useState<MeasurementField[]>(DEFAULT_FIELDS)
  const [values, setValues] = useState<Record<string, string>>({})
  const [savedMeasurements, setSavedMeasurements] = useState<MeasurementValue[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMeasurementFields()
      .then((f) => {
        if (f.length) setFields(f)
        setValues((prev) => {
          const next: Record<string, string> = {}
          for (const field of f.length ? f : DEFAULT_FIELDS) next[field.id] = prev[field.id] ?? ""
          return next
        })
      })
      .catch(() => {
        const next: Record<string, string> = {}
        for (const field of DEFAULT_FIELDS) next[field.id] = ""
        setValues(next)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserMeasurements(user.id)
        .then((list) => {
          if (list[0]) {
            setSavedMeasurements(list[0].values)
          }
        })
        .catch(() => {})
    }
  }, [user])

  const applySaved = () => {
    const next: Record<string, string> = { ...values }
    for (const m of savedMeasurements) next[m.fieldId] = String(m.value ?? "")
    setValues(next)
    toast({ title: "تمت الاستعادة", description: "تم تحميل قياساتك المحفوظة.", variant: "success" })
  }

  const handleSave = async () => {
    if (!user) {
      toast({ title: "سجّل الدخول أولاً", description: "لحفظ قياساتك يجب أن تكون مسجلاً.", variant: "destructive" })
      navigate("/login", { state: { from: "/measurements" } })
      return
    }
    const missing = fields.filter((f) => f.is_required && !values[f.id])
    if (missing.length) {
      toast({ title: "قياسات ناقصة", description: `أكمل: ${missing.map((m) => m.name).join("، ")}`, variant: "destructive" })
      return
    }
    const measurements: MeasurementValue[] = fields.map((f) => ({
      fieldId: f.id,
      label: f.name,
      value: Number(values[f.id]),
      unit: f.unit || "cm",
    }))
    setSaving(true)
    try {
      await saveUserMeasurements(user.id, measurements)
      setSavedMeasurements(measurements)
      toast({ title: "تم حفظ القياسات", variant: "success" })
    } catch (e) {
      toast({ title: "فشل الحفظ", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SEO title="القياسات" description="أدخل قياساتك بدقة مع دليل مصور لضمان مقاس مثالي." />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Ruler className="size-7 text-primary" /> القياسات
          </h1>
          <p className="mt-2 text-muted-foreground">
            قياساتك تحدد مقاس روبك ووشاحك بشكل مثالي. خذ القياسات بدقة مع شريط قياس مرن.
          </p>
        </div>
        <div className="flex gap-2">
          {savedMeasurements.length > 0 && (
            <Button variant="outline" onClick={applySaved}>
              <Check className="size-4" /> استخدام قياساتي المحفوظة
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <MeasureCard
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              الوحدة الافتراضية: سم (cm). يمكنك حفظ قياساتك لاستخدامها في طلباتك القادمة.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="size-4" /> {saving ? "جارٍ الحفظ..." : "احفظ قياساتي"}
              </Button>
              <Button variant="gold" onClick={() => navigate("/designer/scarf")}>
                صمّم وشاحك الآن
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
