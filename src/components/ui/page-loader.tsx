import { GraduationCap } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <GraduationCap className="size-7" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">جارٍ التحميل...</p>
    </div>
  )
}
