import type { FontDef, EmbroideryThread } from "@/lib/types"

export const SCARF_COLORS = [
  { id: "black", name: "أسود", hex: "#1c1c1c" },
  { id: "white", name: "أبيض", hex: "#f5f5f0" },
  { id: "navy", name: "كحلي", hex: "#1a2639" },
  { id: "maroon", name: "ماروني", hex: "#6b1f2a" },
  { id: "green", name: "أخضر", hex: "#1d5c3f" },
  { id: "purple", name: "بنفسجي", hex: "#4a2c6e" },
  { id: "beige", name: "بيج", hex: "#d8c5a0" },
  { id: "gray", name: "رمادي", hex: "#8a8a8f" },
]

export const DEFAULT_FONTS: FontDef[] = [
  { id: "font-ar-classic", name: "خط عربي كلاسيكي", font_key: "font-ar-classic", type: "ar", css_family: "Amiri, serif", is_active: true, sort_order: 1 },
  { id: "font-ar-luxury", name: "خط عربي فاخر", font_key: "font-ar-luxury", type: "ar", css_family: "Reem Kufi, 'Noto Naskh Arabic', serif", is_active: true, sort_order: 2 },
  { id: "font-ar-simple", name: "خط عربي بسيط", font_key: "font-ar-simple", type: "ar", css_family: "'Cairo', 'IBM Plex Sans Arabic', sans-serif", is_active: true, sort_order: 3 },
  { id: "font-en-classic", name: "خط إنجليزي كلاسيكي", font_key: "font-en-classic", type: "en", css_family: "'Playfair Display', 'Times New Roman', serif", is_active: true, sort_order: 4 },
  { id: "font-en-modern", name: "خط إنجليزي حديث", font_key: "font-en-modern", type: "en", css_family: "Montserrat, 'Segoe UI', sans-serif", is_active: true, sort_order: 5 },
]

export const DEFAULT_THREADS: EmbroideryThread[] = [
  { id: "gold", name: "ذهبي", name_en: "Gold", hex: "#d4af37", price_adjust: 0, is_active: true, sort_order: 1 },
  { id: "silver", name: "فضي", name_en: "Silver", hex: "#c0c0c8", price_adjust: 0, is_active: true, sort_order: 2 },
  { id: "white", name: "أبيض", name_en: "White", hex: "#ffffff", price_adjust: 0, is_active: true, sort_order: 3 },
  { id: "black", name: "أسود", name_en: "Black", hex: "#111111", price_adjust: 0, is_active: true, sort_order: 4 },
  { id: "red", name: "أحمر", name_en: "Red", hex: "#b91c1c", price_adjust: 5, is_active: true, sort_order: 5 },
  { id: "blue", name: "أزرق", name_en: "Blue", hex: "#1d4ed8", price_adjust: 5, is_active: true, sort_order: 6 },
]

export const NAME_POSITIONS = [
  { id: "right", label: "الجهة اليمنى", labelEn: "Right Side" },
  { id: "left", label: "الجهة اليسرى", labelEn: "Left Side" },
  { id: "center", label: "الخلف (المنتصف)", labelEn: "Back (Center)" },
  { id: "custom", label: "موضع مخصص", labelEn: "Custom" },
]

export const THREAD_COLORS = [
  { id: "gold", name: "ذهبي", hex: "#d4af37" },
  { id: "silver", name: "فضي", hex: "#c0c0c8" },
  { id: "white", name: "أبيض", hex: "#ffffff" },
  { id: "black", name: "أسود", hex: "#111111" },
  { id: "red", name: "أحمر", hex: "#b91c1c" },
  { id: "blue", name: "أزرق", hex: "#1d4ed8" },
  { id: "green", name: "أخضر", hex: "#15803d" },
]

export const ORDER_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "pending", label: "جديد", color: "bg-slate-500" },
  { value: "confirmed", label: "تأكيد الدفع", color: "bg-blue-500" },
  { value: "design_review", label: "مراجعة التصميم", color: "bg-indigo-500" },
  { value: "production", label: "قيد التجهيز", color: "bg-purple-500" },
  { value: "embroidery", label: "قيد التطريز", color: "bg-fuchsia-500" },
  { value: "ready", label: "جاهز", color: "bg-amber-500" },
  { value: "shipped", label: "تم الشحن", color: "bg-cyan-500" },
  { value: "completed", label: "تم التسليم", color: "bg-emerald-500" },
  { value: "cancelled", label: "ملغي", color: "bg-red-500" },
]

export const PAYMENT_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "pending", label: "بانتظار الدفع", color: "bg-amber-500" },
  { value: "under_review", label: "بانتظار المراجعة", color: "bg-blue-500" },
  { value: "paid", label: "مدفوع", color: "bg-emerald-500" },
  { value: "failed", label: "فشل", color: "bg-red-500" },
  { value: "cancelled", label: "ملغي", color: "bg-slate-500" },
  { value: "refunded", label: "مسترجع", color: "bg-purple-500" },
]

export const STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "تم تأكيد الدفع",
  design_review: "مراجعة التصميم",
  production: "قيد التجهيز",
  embroidery: "قيد التطريز",
  ready: "جاهز",
  shipped: "تم الشحن",
  completed: "تم التسليم",
  cancelled: "ملغي",
}

export const SHIPPING_FEE = 40
export const FREE_SHIPPING_THRESHOLD = 500
export const CURRENCY = "SAR"
