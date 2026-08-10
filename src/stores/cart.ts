import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { CartItem, MeasurementValue } from "@/lib/types"

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => string
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateMeasurements: (id: string, measurements: MeasurementValue[]) => void
  updateDesign: (id: string, design: Partial<CartItem>) => void
  clearCart: () => void
  count: () => number
  subtotal: () => number
  syncToServer: () => Promise<void>
}

function makeId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = makeId()
        set((state) => ({ items: [...state.items, { ...item, id }] }))
        get().syncToServer()
        return id
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
        get().syncToServer()
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }))
        get().syncToServer()
      },

      updateMeasurements: (id, measurements) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, measurements } : i)),
        }))
        get().syncToServer()
      },

      updateDesign: (id, design) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...design } : i)),
        }))
        get().syncToServer()
      },

      clearCart: () => {
        set({ items: [] })
        get().syncToServer()
      },

      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),

      syncToServer: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        try {
          await supabase.from("carts").upsert({ user_id: user.id, token: user.id }).eq("user_id", user.id)
        } catch {
          // non-fatal
        }
      },
    }),
    { name: "khama-cart", partialize: (state) => ({ items: state.items }) }
  )
)
