import type { EmbroideryThread, Product, ScarfDesignConfig } from "@/lib/types"

export interface PriceBreakdown {
  basePrice: number
  embroideryPrice: number
  logoPrice: number
  optionsPrice: number
  unitPrice: number
}

export const LOGO_PRICE = 15

export function calculateUnitPrice(
  product: Product | null | undefined,
  config: ScarfDesignConfig,
  thread?: EmbroideryThread | null
): PriceBreakdown {
  const basePrice = product?.base_price ?? 0
  const hasLogo = Boolean(config.logo?.url)
  const threadPrice = thread?.price_adjust ?? 0
  const embroideryPrice = threadPrice
  const logoPrice = hasLogo ? LOGO_PRICE : 0
  const optionsPrice = 0
  return {
    basePrice,
    embroideryPrice,
    logoPrice,
    optionsPrice,
    unitPrice: basePrice + embroideryPrice + logoPrice + optionsPrice,
  }
}

export function applyCouponDiscount(
  subtotal: number,
  coupon: { type: "percent" | "amount"; value: number; min_order_amount?: number | null } | null
): { discount: number; eligible: boolean; message?: string } {
  if (!coupon) return { discount: 0, eligible: true }
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      discount: 0,
      eligible: false,
      message: `الحد الأدنى للطلب ${coupon.min_order_amount} ريال`,
    }
  }
  const discount =
    coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal)
  return { discount, eligible: true }
}

export function computeOrderTotals(
  itemsSubtotal: number,
  shippingFee: number,
  coupon: { type: "percent" | "amount"; value: number; min_order_amount?: number | null } | null,
  freeShippingThreshold: number,
  freeShipping: boolean
) {
  const { discount } = applyCouponDiscount(itemsSubtotal, coupon)
  const effectiveShipping = freeShipping || itemsSubtotal - discount >= freeShippingThreshold ? 0 : shippingFee
  const total = itemsSubtotal - discount + effectiveShipping
  return { subtotal: itemsSubtotal, discount, shippingFee: effectiveShipping, total: Math.max(0, total) }
}
