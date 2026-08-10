import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SEO } from "@/components/SEO"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SEO title="الصفحة غير موجودة" noindex />
      <Compass className="mb-4 size-16 text-primary/40" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">الصفحة التي تبحث عنها غير موجودة.</p>
      <Button asChild className="mt-6">
        <Link to="/">العودة للرئيسية</Link>
      </Button>
    </div>
  )
}
