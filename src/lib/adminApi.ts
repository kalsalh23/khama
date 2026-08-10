import { supabase } from "@/lib/supabase"
import type { BlogPost, Coupon, EmbroideryThread, Faq, FontDef, MeasurementField, Payment, PaymentMethod, Product, ProductColor, Profile } from "@/lib/types"

// ------- Products -------
export async function adminListProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), colors:product_colors(*)")
    .order("sort_order")
  if (error) throw error
  return data as unknown as Product[]
}

export async function adminSaveProduct(product: Omit<Partial<Product>, "images"> & { images?: Array<{ url: string; alt?: string }> }) {
  const { images, ...fields } = product as {
    images?: Array<{ url: string; alt?: string }>
  } & Record<string, unknown>
  if (fields.id) {
    const { data, error } = await supabase.from("products").update(fields).eq("id", fields.id).select().single()
    if (error) throw error
    return data as Product
  } else {
    const { data, error } = await supabase.from("products").insert(fields).select().single()
    if (error) throw error
    return data as Product
  }
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function adminAddProductImage(productId: string, url: string, alt?: string) {
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url, alt: alt ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteProductImage(id: string) {
  await supabase.from("product_images").delete().eq("id", id)
}

// ------- Colors -------
export async function adminListProductColors() {
  const { data, error } = await supabase.from("product_colors").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as ProductColor[]
}

export async function adminSaveColor(color: Partial<ProductColor>) {
  if (color.id) {
    const { data, error } = await supabase.from("product_colors").update(color).eq("id", color.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("product_colors").insert(color).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteColor(id: string) {
  await supabase.from("product_colors").delete().eq("id", id)
}

// ------- Fonts -------
export async function adminListFonts() {
  const { data, error } = await supabase.from("fonts").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as FontDef[]
}

export async function adminSaveFont(font: Partial<FontDef>) {
  if (font.id) {
    const { data, error } = await supabase.from("fonts").update(font).eq("id", font.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("fonts").insert(font).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteFont(id: string) {
  await supabase.from("fonts").delete().eq("id", id)
}

// ------- Threads -------
export async function adminListThreads() {
  const { data, error } = await supabase.from("embroidery_threads").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as EmbroideryThread[]
}

export async function adminSaveThread(thread: Partial<EmbroideryThread>) {
  if (thread.id) {
    const { data, error } = await supabase.from("embroidery_threads").update(thread).eq("id", thread.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("embroidery_threads").insert(thread).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteThread(id: string) {
  await supabase.from("embroidery_threads").delete().eq("id", id)
}

// ------- Measurement fields -------
export async function adminListMeasurementFields() {
  const { data, error } = await supabase.from("measurement_fields").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as MeasurementField[]
}

export async function adminSaveMeasurementField(field: Partial<MeasurementField>) {
  if (field.id) {
    const { data, error } = await supabase.from("measurement_fields").update(field).eq("id", field.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("measurement_fields").insert(field).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteMeasurementField(id: string) {
  await supabase.from("measurement_fields").delete().eq("id", id)
}

// ------- Payments -------
export async function adminListPaymentMethods() {
  const { data, error } = await supabase.from("payment_methods").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as PaymentMethod[]
}

export async function adminSavePaymentMethod(method: Partial<PaymentMethod>) {
  if (method.id) {
    const { data, error } = await supabase.from("payment_methods").update(method).eq("id", method.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("payment_methods").insert(method).select().single()
  if (error) throw error
  return data
}

export async function adminListReceipts() {
  const { data, error } = await supabase
    .from("payment_receipts")
    .select("*, payment:payments(*)")
    .order("created_at", { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as Array<Record<string, unknown> & { payment: Payment | null }>
}

export async function adminReviewReceipt(id: string, status: "approved" | "rejected", reviewedBy: string, paymentId: string) {
  await supabase
    .from("payment_receipts")
    .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
    .eq("id", id)
  if (status === "approved") {
    await supabase.from("payments").update({ status: "paid" }).eq("id", paymentId)
  } else {
    await supabase.from("payments").update({ status: "failed" }).eq("id", paymentId)
  }
}

// ------- Coupons -------
export async function adminListCoupons() {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Coupon[]
}

export async function adminSaveCoupon(coupon: Partial<Coupon>) {
  if (coupon.id) {
    const { data, error } = await supabase.from("coupons").update(coupon).eq("id", coupon.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("coupons").insert(coupon).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteCoupon(id: string) {
  await supabase.from("coupons").delete().eq("id", id)
}

// ------- Content -------
export async function adminListBlogPosts() {
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function adminSaveBlogPost(post: Partial<BlogPost>) {
  if (post.id) {
    const { data, error } = await supabase.from("blog_posts").update(post).eq("id", post.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("blog_posts").insert(post).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteBlogPost(id: string) {
  await supabase.from("blog_posts").delete().eq("id", id)
}

export async function adminListFaqs() {
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order")
  if (error) throw error
  return (data ?? []) as Faq[]
}

export async function adminSaveFaq(faq: Partial<Faq>) {
  if (faq.id) {
    const { data, error } = await supabase.from("faqs").update(faq).eq("id", faq.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("faqs").insert(faq).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteFaq(id: string) {
  await supabase.from("faqs").delete().eq("id", id)
}

export async function adminSaveSetting(key: string, value: unknown) {
  const { error } = await supabase.from("settings").upsert({ key, value }).eq("key", key)
  if (error) throw error
}

// ------- Customers -------
export async function adminListCustomers() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function adminUpdateCustomerRole(userId: string, role: Profile["role"]) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) throw error
}

// ------- Dashboard -------
export async function adminDashboardStats() {
  const { data: orders, error: oe } = await supabase.from("orders").select("id,status,total_amount,created_at,items_total")
  if (oe) throw oe
  const { count: todayCount, error: te } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
  if (te) throw te

  const rows = orders ?? []
  const paidOrders = rows.filter((o) => ["confirmed", "production", "embroidery", "ready", "shipped", "completed", "design_review"].includes(o.status))
  const sales = paidOrders.reduce((acc, o) => acc + Number(o.total_amount), 0)

  const byStatus = (s: string) => rows.filter((o) => o.status === s).length

  return {
    totalOrders: rows.length,
    todayOrders: todayCount ?? 0,
    paidOrders: paidOrders.length,
    inProduction: byStatus("production"),
    inEmbroidery: byStatus("embroidery"),
    ready: byStatus("ready"),
    totalSales: sales,
  }
}
