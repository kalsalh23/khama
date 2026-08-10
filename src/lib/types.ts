export type NameLanguage = "ar" | "en"
export type NamePosition = "right" | "left" | "center" | "custom"

export interface LogoConfig {
  url?: string
  key?: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

export interface ScarfDesignConfig {
  product: string
  productId?: string
  color: string
  colorName?: string
  name: string
  nameLanguage: NameLanguage
  font: string
  fontId?: string
  threadColor: string
  threadName?: string
  namePosition: NamePosition
  nameX?: number
  nameY?: number
  graduationYear: string
  yearEnabled: boolean
  customText: string
  customTextEnabled: boolean
  logo?: LogoConfig
  background: string
}

export const defaultDesignConfig: ScarfDesignConfig = {
  product: "scarf",
  color: "#1a2639",
  name: "",
  nameLanguage: "ar",
  font: "font-ar-classic",
  threadColor: "#d4af37",
  threadName: "ذهبي",
  namePosition: "center",
  graduationYear: "",
  yearEnabled: true,
  customText: "",
  customTextEnabled: false,
  logo: {
    url: undefined,
    x: 50,
    y: 15,
    scale: 1,
    rotation: 0,
    opacity: 1,
  },
  background: "#f8fafc",
}

export interface DesignAsset {
  id?: string
  designId?: string
  type: "university_logo" | "college_logo" | "personal_logo" | "other"
  url: string
  key: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  created_at?: string
}

export interface MeasurementValue {
  fieldId: string
  label: string
  value: number
  unit: string
}

export interface CartItemDesign {
  productId: string
  productSlug: string
  productName: string
  productImage: string
  config: ScarfDesignConfig
  previewUrl?: string
  basePrice: number
  embroideryPrice: number
  logoPrice: number
  unitPrice: number
  colorName: string
}

export interface CartItem extends CartItemDesign {
  id: string
  quantity: number
  measurements?: MeasurementValue[]
}

export interface CheckoutData {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  region: string
  detailedAddress: string
  university: string
  college: string
  department: string
  graduationYear: string
  notes?: string
  paymentMethodId: string
  couponCode?: string
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "design_review"
  | "production"
  | "embroidery"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "under_review"

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: "customer" | "admin" | "manager" | "production" | "shipping"
  university?: string
  college?: string
  created_at: string
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  material?: string
  base_price: number
  category: "scarf" | "robe" | "cap" | "set" | "other"
  is_designable: boolean
  is_active: boolean
  sort_order: number
  images?: ProductImage[]
  colors?: ProductColor[]
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt?: string
  sort_order: number
}

export interface ProductColor {
  id: string
  product_id: string
  name: string
  hex: string
  image_url?: string
  is_available: boolean
  sort_order: number
}

export interface ProductOption {
  id: string
  product_id: string
  name: string
  type: "select" | "checkbox" | "radio"
  price_adjust: number
  is_required: boolean
}

export interface EmbroideryThread {
  id: string
  name: string
  name_en?: string
  hex: string
  price_adjust: number
  is_active: boolean
  sort_order: number
}

export interface FontDef {
  id: string
  name: string
  font_key: string
  type: "ar" | "en"
  css_family?: string
  font_file_url?: string
  preview_url?: string
  is_active: boolean
  sort_order: number
}

export interface MeasurementField {
  id: string
  name: string
  name_en: string
  description?: string
  image_url?: string
  unit: "cm" | "inch"
  is_required: boolean
  is_active: boolean
  sort_order: number
  product_ids?: string[]
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  customer_name: string
  customer_phone: string
  customer_email: string
  university?: string
  college?: string
  department?: string
  graduation_year?: string
  status: OrderStatus
  items_total: number
  discount_amount: number
  shipping_fee: number
  total_amount: number
  currency: string
  notes?: string
  coupon_id?: string
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  design_config?: ScarfDesignConfig
  preview_url?: string
  measurements?: MeasurementValue[]
}

export interface Payment {
  id: string
  order_id: string
  method_id: string
  method_name?: string
  amount: number
  status: PaymentStatus
  transaction_id?: string
  receipt_url?: string
  gateway_payload?: Record<string, unknown>
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  name_en?: string
  type: "online_gateway" | "bank_transfer" | "local" | "other"
  description?: string
  instructions?: string
  config?: Record<string, unknown>
  is_active: boolean
  sort_order: number
}

export interface OrderStatusEvent {
  id: string
  order_id: string
  status: OrderStatus
  note?: string
  changed_by?: string
  created_at: string
}

export interface SavedDesign {
  id: string
  user_id: string
  product_id?: string
  product_name?: string
  config: ScarfDesignConfig
  preview_url?: string
  created_at: string
  updated_at?: string
}

export interface Coupon {
  id: string
  code: string
  type: "percent" | "amount"
  value: number
  min_order_amount?: number
  start_at?: string
  end_at?: string
  max_uses?: number
  used_count: number
  product_ids?: string[]
  is_active: boolean
  created_at: string
}

export interface Shipment {
  id: string
  order_id: string
  carrier?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  status?: string
}

export interface ShippingAddress {
  id: string
  user_id: string
  label?: string
  full_name: string
  phone: string
  city: string
  region: string
  detailed_address: string
  is_default: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body?: string
  is_read: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  content?: string
  cover_url?: string
  is_published: boolean
  created_at: string
}

export interface Faq {
  id: string
  question: string
  answer: string
  sort_order: number
  is_active: boolean
}

export interface UserMeasurement {
  id: string
  user_id: string
  label?: string
  values: MeasurementValue[]
  created_at: string
  updated_at?: string
}
