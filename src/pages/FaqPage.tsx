import { useEffect, useState } from "react"
import { fetchFaqs } from "@/lib/api"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { SEO } from "@/components/SEO"
import type { Faq } from "@/lib/types"

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFaqs().then(setFaqs).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SEO title="الأسئلة الشائعة" description="إجابات عن الأسئلة الشائعة حول تصميم وطلب أزياء التخرج." />
      <h1 className="mb-2 text-3xl font-bold sm:text-4xl">الأسئلة الشائعة</h1>
      <p className="mb-8 text-muted-foreground">كل ما تحتاج معرفته عن التصميم والطلب</p>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">لا توجد أسئلة مضافة بعد.</div>
      ) : (
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-start">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
