import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchSettings } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { SEO } from "@/components/SEO"

const DEFAULT_CONTENT: Record<string, { title: string; content: string }> = {
  "privacy-policy": {
    title: "سياسة الخصوصية",
    content: "<p>نحترم خصوصيتك ونحمي بياناتك الشخصية. تُستخدم بياناتك فقط لمعالجة طلباتك وتحسين تجربتك.</p>",
  },
  "terms": {
    title: "الشروط والأحكام",
    content: "<p>باستخدامك للمنصة فأنت توافق على شروطنا. التصاميم المخصصة تُنفذ حسب الطلب ولا تُرد إلا في الحالات المحددة في سياسة الاستبدال.</p>",
  },
  "returns-policy": {
    title: "سياسة الاستبدال",
    content: "<p>نقوم بمراجعة التصميم معك قبل التنفيذ. في حال وجود عيب تصنيعي تواصل معنا خلال 7 أيام من الاستلام.</p>",
  },
  "shipping-policy": {
    title: "سياسة الشحن",
    content: "<p>نشحن عبر شركات شحن موثوقة. مدة التجهيز والتطريز من 7-14 يوم عمل حسب التصميم.</p>",
  },
  "contact": {
    title: "تواصل معنا",
    content: "<p>لأي استفسار تواصل معنا عبر البريد الإلكتروني أو واتساب، وسنرد خلال 24 ساعة.</p>",
  },
}

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>()
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const key = `page_${slug}`
  const page = (settings[key] as { title?: string; content?: string } | undefined) ?? DEFAULT_CONTENT[slug ?? ""]

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-20"><Skeleton className="h-96 rounded-3xl" /></div>

  const title = page?.title ?? "الصفحة"
  const content = page?.content ?? "<p>هذه الصفحة قيد الإعداد.</p>"

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO title={title} />
      <h1 className="mb-6 text-3xl font-bold sm:text-4xl">{title}</h1>
      <div className="prose space-y-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
