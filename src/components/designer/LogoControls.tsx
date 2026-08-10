import { useRef, useState } from "react"
import { Upload, Trash2, ImagePlus } from "lucide-react"
import type { LogoConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { validateImage, uploadLogo } from "@/lib/storage"
import { useAuthStore } from "@/stores/auth"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Props {
  logo?: LogoConfig
  onSet: (logo: LogoConfig) => void
  onClear: () => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{Math.round(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  )
}

export function LogoControls({ logo, onSet, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    const err = validateImage(file)
    if (err) {
      toast({ title: "خطأ", description: err, variant: "destructive" })
      return
    }
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "سجّل الدخول حتى تتمكن من رفع شعارك وحفظ التصميم.",
        variant: "destructive",
      })
      return
    }
    setUploading(true)
    try {
      const { url } = await uploadLogo(file, user.id)
      onSet({ url, x: logo?.x ?? 50, y: logo?.y ?? 20, scale: logo?.scale ?? 1, rotation: 0, opacity: 1 })
      toast({ title: "تم الرفع", description: "تم رفع الشعار بنجاح ويمكنك الآن التحكم به.", variant: "success" })
    } catch (e) {
      toast({ title: "فشل الرفع", description: (e as Error).message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ""
        }}
      />

      {!logo?.url ? (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:bg-muted disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <span className="animate-spin rounded-full border-2 border-primary border-t-transparent size-6" />
          ) : (
            <ImagePlus className="size-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">ارفع شعارك</span>
          <span className="text-xs text-muted-foreground">PNG, JPG, WEBP - حتى 5MB (يتم ضغطه تلقائيًا)</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/50 p-3">
            <img src={logo.url} alt="الشعار" className="size-14 rounded-lg border bg-white object-contain p-1" />
            <div className="flex-1 text-xs text-muted-foreground">الشعار مُرفق وسيظهر في المعاينة</div>
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="تغيير">
              <Upload className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClear} aria-label="حذف">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>

          <SliderRow label="الحجم" value={logo.scale * 100} min={20} max={250} onChange={(v) => onSet({ ...logo, scale: v / 100 })} />
          <SliderRow label="الموقع أفقي (X)" value={logo.x} min={5} max={95} onChange={(v) => onSet({ ...logo, x: v })} />
          <SliderRow label="الموقع عمودي (Y)" value={logo.y} min={5} max={60} onChange={(v) => onSet({ ...logo, y: v })} />
          <SliderRow label="الدوران" value={logo.rotation} min={-180} max={180} onChange={(v) => onSet({ ...logo, rotation: v })} />
          <SliderRow label="الشفافية" value={logo.opacity * 100} min={10} max={100} step={5} onChange={(v) => onSet({ ...logo, opacity: v / 100 })} />

          <div className="flex items-center gap-2 text-xs">
            <Label className="text-muted-foreground">المعاينة:</Label>
            <div className="flex items-center gap-1.5">
              <span className={cn("inline-block size-4 rounded-full border", "bg-white")} />
              <span className="inline-block size-4 rounded-full border" style={{ background: "#0f172a" }} />
              <span className="inline-block size-4 rounded-full border" style={{ background: "#f8fafc" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
