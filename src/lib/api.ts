import { supabase } from "@/lib/supabase"
import type {
  BlogPost,
  Coupon,
  Faq,
  FontDef,
  MeasurementField,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductColor,
  Profile,
  SavedDesign,
  ScarfDesignConfig,
  Shipment,
  ShippingAddress,
  UserMeasurement,
  MeasurementValue,
  Notification,
} from "@/lib/types"
import { generateOrderNumber } from "@/lib/utils"

// ---------------- Products ----------------

export async function fetchProducts(activeOnly = true) {
  let query = supabase
    .from("products")
    .select("*, images:product_images(*), colors:product_colors(*)")
    .order("sort_order")
  if (activeOnly) query = query.eq("is_active", true)
  const { data, error } = await query
  if (error) throw error
  return data as unknown as Product[]
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), colors:product_colors(*)")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  return data as unknown as Product | null
}

export async function fetchProductColors(productId: string) {
  const { data, error } = await supabase
    .from("product_colors")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as ProductColor[]
}

// ---------------- Fonts / Threads ----------------

export async function fetchFonts() {
  const { data, error } = await supabase
    .from("fonts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as FontDef[]
}

export async function fetchThreads() {
  const { data, error } = await supabase
    .from("embroidery_threads")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as unknown as import("@/lib/types").EmbroideryThread[]
}

// ---------------- Measurements ----------------

export async function fetchMeasurementFields() {
  const { data, error } = await supabase
    .from("measurement_fields")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as MeasurementField[]
}

export async function fetchUserMeasurements(userId: string) {
  const { data, error } = await supabase
    .from("user_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as UserMeasurement[]
}

export async function saveUserMeasurements(userId: string, values: MeasurementValue[], label?: string) {
  const { data, error } = await supabase
    .from("user_measurements")
    .insert({ user_id: userId, values: values as unknown as Record<string, unknown>, label: label ?? "قياساتي" })
    .select()
    .single()
  if (error) throw error
  return data as UserMeasurement
}

// ---------------- Saved Designs ----------------

export async function fetchSavedDesigns(userId: string) {
  const { data, error } = await supabase
    .from("saved_designs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as SavedDesign[]
}

export async function saveDesign(
  userId: string,
  config: ScarfDesignConfig,
  opts?: { productId?: string; productName?: string; previewUrl?: string }
) {
  const { data, error } = await supabase
    .from("saved_designs")
    .insert({
      user_id: userId,
      product_id: opts?.productId,
      product_name: opts?.productName,
      config: config as unknown as Record<string, unknown>,
      preview_url: opts?.previewUrl,
    })
    .select()
    .single()
  if (error) throw error
  return data as SavedDesign
}

export async function updateDesign(designId: string, config: ScarfDesignConfig, previewUrl?: string) {
  const { error } = await supabase
    .from("saved_designs")
    .update({
      config: config as unknown as Record<string, unknown>,
      preview_url: previewUrl,
    })
    .eq("id", designId)
  if (error) throw error
}

export async function deleteDesign(designId: string) {
  const { error } = await supabase.from("saved_designs").delete().eq("id", designId)
  if (error) throw error
}

// ---------------- Orders ----------------

export async function createOrder(input: {
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  university?: string
  college?: string
  department?: string
  graduation_year?: string
  items_total: number
  discount_amount: number
  shipping_fee: number
  total_amount: number
  notes?: string
  coupon_id?: string
  items: Array<{
    product_id: string | null
    product_name: string
    product_image: string | null
    quantity: number
    unit_price: number
    total_price: number
    design_config: ScarfDesignConfig
    preview_url: string | null
    measurements: MeasurementValue[] | null
  }>
  order_measurements?: Array<{ field_name: string; field_name_en: string; value: number; unit: string }>
  status?: OrderStatus
}) {
  const { data: seqData } = await supabase.rpc("get_order_sequence")
  const seq = typeof seqData === "number" ? seqData : 0
  const orderNumber = generateOrderNumber(seq)

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.user_id,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email,
      university: input.university ?? null,
      college: input.college ?? null,
      department: input.department ?? null,
      graduation_year: input.graduation_year ?? null,
      status: input.status ?? "pending",
      items_total: input.items_total,
      discount_amount: input.discount_amount,
      shipping_fee: input.shipping_fee,
      total_amount: input.total_amount,
      currency: "SAR",
      notes: input.notes ?? null,
      coupon_id: input.coupon_id ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const order = data as Order

  for (const item of input.items) {
    const { error: itemErr } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      design_config: item.design_config as unknown as Record<string, unknown>,
      preview_url: item.preview_url,
      measurements: (item.measurements ?? null) as unknown as Record<string, unknown> | null,
    })
    if (itemErr) throw itemErr
  }

  for (const m of input.order_measurements ?? []) {
    await supabase.from("order_measurements").insert({ order_id: order.id, ...m })
  }

  await logOrderStatus(order.id, order.status ?? "pending")

  if (input.coupon_id) {
    await supabase
      .from("coupon_usages")
      .insert({ coupon_id: input.coupon_id, order_id: order.id, user_id: input.user_id })
    await supabase.rpc("increment_coupon_usage", { p_coupon_id: input.coupon_id })
  }

  return order
}

export async function fetchOrders(userId?: string, asAdmin = false) {
  let query = supabase
    .from("orders")
    .select("*, items:order_items(*), payments:payments(*), shipment:shipments(*)")
    .order("created_at", { ascending: false })
  if (!asAdmin && userId) query = query.eq("user_id", userId)
  if (asAdmin) query = query.limit(200)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Array<Order & { items: OrderItem[]; payments: Payment[]; shipment: Shipment | null }>
}

export async function fetchOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), payments:payments(*), shipment:shipments(*), status_history:order_status_history(*), address:shipping_addresses(*)")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as
    | (Order & {
        items: OrderItem[]
        payments: Payment[]
        shipment: Shipment | null
        status_history: Array<{ id: string; status: string; note: string | null; changed_by: string | null; created_at: string }>
        address: ShippingAddress | null
      })
    | null
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  changedBy?: string
) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("user_id")
    .single()
  if (error) throw error
  await logOrderStatus(orderId, status, note, changedBy)
  if (data?.user_id) {
    await notifyUser(data.user_id, "تحديث حالة الطلب", `تغيرت حالة طلبك إلى "${status}".`)
  }
  return data
}

async function logOrderStatus(orderId: string, status: string, note?: string, changedBy?: string) {
  await supabase
    .from("order_status_history")
    .insert({ order_id: orderId, status, note: note ?? null, changed_by: changedBy ?? null })
}

// ---------------- Payments ----------------

export async function fetchPaymentMethods(activeOnly = true) {
  let query = supabase.from("payment_methods").select("*").order("sort_order")
  if (activeOnly) query = query.eq("is_active", true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as PaymentMethod[]
}

export async function createPayment(input: {
  order_id: string
  method_id: string
  method_name: string
  amount: number
  status: PaymentStatus
}) {
  const { data, error } = await supabase.from("payments").insert(input).select().single()
  if (error) throw error
  return data as Payment
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus, transactionId?: string) {
  const { error } = await supabase
    .from("payments")
    .update({ status, transaction_id: transactionId ?? null })
    .eq("id", paymentId)
  if (error) throw error
}

export async function attachReceipt(paymentId: string, fileUrl: string, fileKey: string) {
  const { data, error } = await supabase
    .from("payment_receipts")
    .insert({ payment_id: paymentId, file_url: fileUrl, file_key: fileKey })
    .select()
    .single()
  if (error) throw error
  await supabase.from("payments").update({ status: "under_review", receipt_url: fileUrl }).eq("id", paymentId)
  return data
}

// ---------------- Coupons ----------------

export async function fetchCouponByCode(code: string) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle()
  if (error) throw error
  return (data as Coupon) ?? null
}

// ---------------- Notifications ----------------

export async function notifyUser(userId: string, title: string, body?: string) {
  await supabase.from("notifications").insert({ user_id: userId, title, body: body ?? null })
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as Notification[]
}

export async function markNotificationsRead(userId: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
}

// ---------------- Addresses ----------------

export async function fetchAddresses(userId: string) {
  const { data, error } = await supabase
    .from("shipping_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
  if (error) throw error
  return (data ?? []) as ShippingAddress[]
}

export async function saveAddress(address: Omit<ShippingAddress, "id" | "created_at">) {
  const { data, error } = await supabase.from("shipping_addresses").insert(address).select().single()
  if (error) throw error
  return data as ShippingAddress
}

export async function updateAddress(id: string, address: Partial<ShippingAddress>) {
  const { error } = await supabase.from("shipping_addresses").update(address).eq("id", id)
  if (error) throw error
}

export async function deleteAddress(id: string) {
  await supabase.from("shipping_addresses").delete().eq("id", id)
}

// ---------------- Content ----------------

export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function fetchBlogPost(slug: string) {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle()
  if (error) throw error
  return (data as BlogPost) ?? null
}

export async function fetchFaqs() {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as Faq[]
}

// ---------------- Settings ----------------

export async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("*")
  if (error) throw error
  const map: Record<string, unknown> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return map
}

// ---------------- Profile ----------------

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) throw error
}

// ---------------- Shipping ----------------

export async function updateShipment(orderId: string, patch: Partial<Shipment>) {
  const { data, error } = await supabase
    .from("shipments")
    .upsert({ order_id: orderId, ...patch })
    .select()
    .single()
  if (error) throw error
  return data as Shipment
}
