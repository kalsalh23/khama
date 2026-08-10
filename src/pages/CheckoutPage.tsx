import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, CreditCard, ShieldCheck, ArrowLeft, FileUp } from "lucide-react"
import { useCartStore } from "@/stores/cart"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SEO } from "@/components/SEO"
import { fetchPaymentMethods, createOrder, createPayment, attachReceipt, fetchCouponByCode, fetchMeasurementFields } from "@/lib/api"
import { uploadReceipt } from "@/lib/storage"
import { formatPrice } from "@/lib/utils"
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { computeOrderTotals, applyCouponDiscount } from "@/lib/pricing"
import { toast } from "@/components/ui/use-toast"
import type { PaymentMethod, MeasurementValue, MeasurementField } from "@/lib/types"

const schema = z.object({
  fullName: z.string().min(3, "الاسم الكامل مطلوب"),
  phone: z.string().min(9, "رقم هاتف صحيح مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  city: z.string().min(2, "المدينة مطلوبة"),
  region: z.string().min(2, "المنطقة مطلوبة"),
  address: z.string().min(5, "العنوان بالتفصيل مطلوب"),
  university: z.string().optional(),
  college: z.string().optional(),
  department: z.string().optional(),
  graduationYear: z.string().optional(),
  notes: z.string().optional(),
  paymentMethodId: z.string().min(1, "اختر طريقة الدفع"),
  couponCode: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [coupon, setCoupon] = useState<{ type: "percent" | "amount"; value: number; min_order_amount?: number | null } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState<string | null>(null)
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [measurementFields, setMeasurementFields] = useState<MeasurementField[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      email: user?.email ?? "",
      phone: profile?.phone ?? "",
      city: "",
      region: "",
      address: "",
      university: profile?.university ?? "",
      college: profile?.college ?? "",
      department: "",
      graduationYear: "",
      paymentMethodId: "",
      couponCode: "",
    },
  })

  useEffect(() => {
    fetchPaymentMethods()
      .then((m) => {
        setMethods(m)
        if (m[0]) form.setValue("paymentMethodId", m[0].id)
      })
      .catch(() => {})
    fetchMeasurementFields().then(setMeasurementFields).catch(() => {})
  }, [form])

  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0), [items])
  const totals = useMemo(
    () =>
      computeOrderTotals(subtotal, SHIPPING_FEE, coupon, FREE_SHIPPING_THRESHOLD, false),
    [subtotal, coupon]
  )

  if (items.length === 0 && !submitting && !receiptOrder) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <SEO title="إتمام الطلب" />
        <h1 className="text-2xl font-bold">سلتك فارغة</h1>
        <p className="mt-2 text-muted-foreground">أضف تصميمات إلى السلة قبل إتمام الطلب.</p>
        <Button asChild className="mt-6" variant="gold">
          <Link to="/designer/scarf">صمّم وشاحك</Link>
        </Button>
      </div>
    )
  }

  const applyCoupon = async () => {
    const code = form.getValues("couponCode")
    if (!code) return
    try {
      const c = await fetchCouponByCode(code)
      if (!c) {
        setCouponError("كود غير صالح")
        setCoupon(null)
        return
      }
      const { eligible, message } = applyCouponDiscount(subtotal, c)
      if (!eligible) {
        setCouponError(message ?? "الكوبون غير صالح لهذا الطلب")
        setCoupon(null)
        return
      }
      setCoupon(c)
      setCouponError(null)
      toast({ title: "تم تطبيق الكوبون", variant: "success" })
    } catch {
      setCouponError("تعذر التحقق من الكوبون")
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const itemsTotal = subtotal
      const { discount, shippingFee, total } = computeOrderTotals(subtotal, SHIPPING_FEE, coupon, FREE_SHIPPING_THRESHOLD, false)

      const measurementsList: MeasurementValue[] = measurementFields
        .filter((f) => measurements[f.id])
        .map((f) => ({ fieldId: f.id, label: f.name, value: Number(measurements[f.id]), unit: f.unit }))

      const method = methods.find((m) => m.id === values.paymentMethodId)
      const order = await createOrder({
        user_id: user?.id ?? null,
        customer_name: values.fullName,
        customer_phone: values.phone,
        customer_email: values.email,
        university: values.university,
        college: values.college,
        department: values.department,
        graduation_year: values.graduationYear,
        items_total: itemsTotal,
        discount_amount: discount,
        shipping_fee: shippingFee,
        total_amount: total,
        notes: values.notes,
        coupon_id: coupon ? (coupon as { id?: string }).id : undefined,
        items: items.map((i) => ({
          product_id: i.productId ?? null,
          product_name: i.productName,
          product_image: i.previewUrl ?? i.productImage ?? null,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          total_price: i.unitPrice * i.quantity,
          design_config: i.config,
          preview_url: i.previewUrl ?? null,
          measurements: i.measurements ?? measurementsList,
        })),
        order_measurements: measurementsList.map((m) => ({
          field_name: m.label,
          field_name_en: "",
          value: m.value,
          unit: m.unit,
        })),
      })

      const isBankTransfer = method?.type === "bank_transfer"
      const payment = await createPayment({
        order_id: order.id,
        method_id: method?.id ?? "unknown",
        method_name: method?.name ?? "طريقة دفع",
        amount: total,
        status: isBankTransfer ? "pending" : "pending",
      })

      if (isBankTransfer) {
        setReceiptOrder(order.id)
        setReceiptPaymentId(payment.id)
        setSubmitting(false)
        return
      }

      clearCart()
      navigate(`/order-success/${order.id}`)
    } catch (e) {
      toast({ title: "فشل إنشاء الطلب", description: (e as Error).message, variant: "destructive" })
      setSubmitting(false)
    }
  }

  const handleReceipt = async (file: File) => {
    if (!receiptPaymentId || !user) {
      toast({ title: "تسجيل الدخول مطلوب", description: "ارفع إيصالك بعد تسجيل الدخول.", variant: "destructive" })
      return
    }
    setUploadingReceipt(true)
    try {
      const { url, key } = await uploadReceipt(file, user.id)
      await attachReceipt(receiptPaymentId, url, key)
      clearCart()
      toast({ title: "تم إرفاق الإيصال", description: "سيتم مراجعة الإيصال وتأكيد الدفع.", variant: "success" })
      navigate(`/order-success/${receiptOrder}`)
    } catch (e) {
      toast({ title: "فشل رفع الإيصال", description: (e as Error).message, variant: "destructive" })
    } finally {
      setUploadingReceipt(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SEO title="إتمام الطلب" />
      <h1 className="mb-8 text-3xl font-bold">إتمام الطلب</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:col-span-3">
            {/* Customer data */}
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Building2 className="size-4 text-primary" /> بيانات العميل
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="region" render={({ field }) => (
                  <FormItem><FormLabel>المنطقة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>العنوان بالتفصيل</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Graduation data */}
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-primary" /> بيانات التخرج
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="university" render={({ field }) => (
                  <FormItem><FormLabel>الجامعة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="college" render={({ field }) => (
                  <FormItem><FormLabel>الكلية</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem><FormLabel>القسم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="graduationYear" render={({ field }) => (
                  <FormItem><FormLabel>سنة التخرج</FormLabel><FormControl><Input {...field} inputMode="numeric" dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Measurements */}
            {measurementFields.length > 0 && (
              <section className="rounded-2xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">القياسات</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {measurementFields.map((f) => (
                    <div key={f.id}>
                      <Label className="text-xs">{f.name}</Label>
                      <div className="relative mt-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={measurements[f.id] ?? ""}
                          onChange={(e) => setMeasurements((p) => ({ ...p, [f.id]: e.target.value }))}
                          dir="ltr"
                          className="pr-8"
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{f.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Payment */}
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <CreditCard className="size-4 text-primary" /> طريقة الدفع
              </h2>
              <FormField control={form.control} name="paymentMethodId" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                      {methods.map((m) => (
                        <label key={m.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value={m.id} className="mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{m.name}</p>
                            {m.description && <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>}
                            {m.instructions && <p className="mt-2 rounded-lg bg-muted p-2 text-xs">{m.instructions}</p>}
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات (اختياري)</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="أي تفاصيل إضافية عن الطلب..." /></FormControl>
              </FormItem>
            )} />

            <Button type="submit" size="lg" variant="gold" className="w-full" disabled={submitting}>
              {submitting ? "جارٍ إنشاء الطلب..." : "تأكيد الطلب والدفع"}
              <ArrowLeft className="size-4" />
            </Button>
          </form>
        </Form>

        {/* Summary */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 lg:sticky lg:top-20">
            <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.previewUrl ? (
                      <img src={item.previewUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{item.productName.slice(0, 8)}</div>
                    )}
                    <span className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.config.name || "بدون اسم"} • {item.colorName || item.config.colorName || ""}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>الخصم</span><span className="text-emerald-600">- {formatPrice(totals.discount)}</span></div>
              <div className="flex justify-between"><span>الشحن</span><span>{totals.shippingFee === 0 ? "مجاني" : formatPrice(totals.shippingFee)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold"><span>الإجمالي</span><span className="text-primary">{formatPrice(totals.total)}</span></div>
            </div>

            <div className="mt-4 flex gap-2">
              <FormField control={form.control} name="couponCode" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl><Input {...field} placeholder="كود الخصم" className="dir-ltr" dir="ltr" /></FormControl>
                </FormItem>
              )} />
              <Button type="button" variant="outline" onClick={applyCoupon}>تطبيق</Button>
            </div>
            {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
            {coupon && <Badge variant="success" className="mt-2">كوبون مفعّل: -{formatPrice(totals.discount)}</Badge>}

            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
              بياناتك آمنة وتُستخدم فقط لمعالجة طلبك.
            </p>
          </div>
        </div>
      </div>

      {/* Receipt upload dialog */}
      <Dialog open={Boolean(receiptPaymentId)} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرفاق إيصال الدفع</DialogTitle>
            <DialogDescription>
              طريقة الدفع هي تحويل بنكي. ارفع صورة الإيصال ليتم مراجعة الدفع وتأكيد الطلب.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:bg-muted">
              <FileUp className="size-10 text-muted-foreground" />
              <span className="text-sm font-medium">{uploadingReceipt ? "جارٍ الرفع..." : "اضغط لرفع الإيصال"}</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP أو PDF</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                disabled={uploadingReceipt}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleReceipt(f)
                }}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
