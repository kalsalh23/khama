import { useEffect, useRef, useState } from "react"
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Download,
  Image as ImageIcon,
} from "lucide-react"
import type { FontDef, ScarfDesignConfig } from "@/lib/types"
import { renderScarf, SCARF_LOGICAL, createScarfPreview } from "@/lib/scarfRenderer"
import { downloadDataUrl } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const PREVIEW_BACKGROUNDS = [
  "#f8fafc",
  "#ffffff",
  "#0f172a",
  "#1c1c1c",
  "#fdf2e9",
  "#e8eef7",
  "#f0fdf4",
]

interface Props {
  config: ScarfDesignConfig
  fonts: FontDef[]
  onSavePreview?: (dataUrl: string) => void
  onBackgroundChange?: (bg: string) => void
  className?: string
}

export function DesignerPreview({ config, fonts, onSavePreview, onBackgroundChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = 2
    const w = Math.round(SCARF_LOGICAL.W * zoom * dpr)
    const h = Math.round(SCARF_LOGICAL.H * zoom * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0)
    ctx.fillStyle = config.background
    ctx.fillRect(0, 0, SCARF_LOGICAL.W, SCARF_LOGICAL.H)
    renderScarf(ctx, config, fonts)
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, fonts, zoom])

  const download = () => {
    const dataUrl = createScarfPreview(config, fonts, 3)
    downloadDataUrl(dataUrl, "khama-design-preview.webp")
    onSavePreview?.(dataUrl)
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border transition-colors",
        fullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ background: config.background }}
    >
      <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between gap-2">
        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          معاينة مباشرة
        </span>
        <div className="flex gap-1 rounded-lg bg-black/40 p-1 backdrop-blur">
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))} className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="تكبير">
            <ZoomIn className="size-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="تصغير">
            <ZoomOut className="size-4" />
          </button>
          <button onClick={() => setZoom(1)} className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="إعادة تعيين">
            <RotateCcw className="size-4" />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="ملء الشاشة">
            <Maximize className="size-4" />
          </button>
          <button onClick={download} className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="تحميل">
            <Download className="size-4" />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded p-1.5 text-white hover:bg-white/20 cursor-pointer" aria-label="الخلفية">
                <ImageIcon className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <p className="mb-2 text-xs font-medium">لون الخلفية</p>
              <div className="flex flex-wrap gap-2">
                {PREVIEW_BACKGROUNDS.map((b) => (
                  <button
                    key={b}
                    onClick={() => onBackgroundChange?.(b)}
                    className={cn(
                      "size-7 rounded-full border transition-transform hover:scale-110 cursor-pointer",
                      config.background === b && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ background: b }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="max-h-[72vh] max-w-full"
        style={{ width: SCARF_LOGICAL.W * zoom, height: SCARF_LOGICAL.H * zoom }}
      />
    </div>
  )
}
