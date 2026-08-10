export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: "customer" | "admin" | "manager" | "production" | "shipping"
          university: string | null
          college: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: "customer" | "admin" | "manager" | "production" | "shipping"
          university?: string | null
          college?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: "customer" | "admin" | "manager" | "production" | "shipping"
          university?: string | null
          college?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          material: string | null
          base_price: number
          category: "scarf" | "robe" | "cap" | "set" | "other"
          is_designable: boolean
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          material?: string | null
          base_price: number
          category?: "scarf" | "robe" | "cap" | "set" | "other"
          is_designable?: boolean
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt?: string | null
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>
      }
      product_colors: {
        Row: {
          id: string
          product_id: string
          name: string
          hex: string
          image_url: string | null
          is_available: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          hex: string
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["product_colors"]["Insert"]>
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          name: string
          type: "select" | "checkbox" | "radio"
          price_adjust: number
          is_required: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          type?: "select" | "checkbox" | "radio"
          price_adjust?: number
          is_required?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["product_options"]["Insert"]>
      }
      embroidery_threads: {
        Row: {
          id: string
          name: string
          name_en: string | null
          hex: string
          price_adjust: number
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          hex: string
          price_adjust?: number
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["embroidery_threads"]["Insert"]>
      }
      fonts: {
        Row: {
          id: string
          name: string
          font_key: string
          type: "ar" | "en"
          css_family: string | null
          font_file_url: string | null
          preview_url: string | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          font_key: string
          type?: "ar" | "en"
          css_family?: string | null
          font_file_url?: string | null
          preview_url?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["fonts"]["Insert"]>
      }
      measurement_fields: {
        Row: {
          id: string
          name: string
          name_en: string
          description: string | null
          image_url: string | null
          unit: "cm" | "inch"
          is_required: boolean
          is_active: boolean
          sort_order: number
          product_ids: string[] | null
        }
        Insert: {
          id?: string
          name: string
          name_en: string
          description?: string | null
          image_url?: string | null
          unit?: "cm" | "inch"
          is_required?: boolean
          is_active?: boolean
          sort_order?: number
          product_ids?: string[] | null
        }
        Update: Partial<Database["public"]["Tables"]["measurement_fields"]["Insert"]>
      }
      user_measurements: {
        Row: {
          id: string
          user_id: string
          label: string | null
          values: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          values: Json
        }
        Update: {
          label?: string | null
          values?: Json
        }
      }
      saved_designs: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          product_name: string | null
          config: Json
          preview_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          product_name?: string | null
          config: Json
          preview_url?: string | null
        }
        Update: {
          product_id?: string | null
          product_name?: string | null
          config?: Json
          preview_url?: string | null
        }
      }
      saved_design_assets: {
        Row: {
          id: string
          design_id: string
          type: string
          url: string
          key: string
          x: number
          y: number
          scale: number
          rotation: number
          opacity: number
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          type: string
          url: string
          key: string
          x?: number
          y?: number
          scale?: number
          rotation?: number
          opacity?: number
        }
        Update: Partial<Database["public"]["Tables"]["saved_design_assets"]["Insert"]>
      }
      carts: {
        Row: { id: string; user_id: string | null; token: string; created_at: string }
        Insert: { id?: string; user_id?: string | null; token: string }
        Update: { user_id?: string | null }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          quantity: number
          unit_price: number
          design_config: Json
          preview_url: string | null
          measurements: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity?: number
          unit_price: number
          design_config: Json
          preview_url?: string | null
          measurements?: Json | null
        }
        Update: {
          quantity?: number
          unit_price?: number
          design_config?: Json
          preview_url?: string | null
          measurements?: Json | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string
          university: string | null
          college: string | null
          department: string | null
          graduation_year: string | null
          status: string
          items_total: number
          discount_amount: number
          shipping_fee: number
          total_amount: number
          currency: string
          notes: string | null
          coupon_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email: string
          university?: string | null
          college?: string | null
          department?: string | null
          graduation_year?: string | null
          status?: string
          items_total: number
          discount_amount?: number
          shipping_fee?: number
          total_amount: number
          currency?: string
          notes?: string | null
          coupon_id?: string | null
        }
        Update: {
          status?: string
          items_total?: number
          discount_amount?: number
          shipping_fee?: number
          total_amount?: number
          notes?: string | null
          coupon_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          quantity: number
          unit_price: number
          total_price: number
          design_config: Json | null
          preview_url: string | null
          measurements: Json | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity?: number
          unit_price: number
          total_price: number
          design_config?: Json | null
          preview_url?: string | null
          measurements?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>
      }
      order_customizations: {
        Row: {
          id: string
          order_item_id: string
          key: string
          label: string
          value: string
          price_adjust: number
        }
        Insert: {
          id?: string
          order_item_id: string
          key: string
          label: string
          value: string
          price_adjust?: number
        }
        Update: Partial<Database["public"]["Tables"]["order_customizations"]["Insert"]>
      }
      order_measurements: {
        Row: {
          id: string
          order_id: string
          field_name: string
          field_name_en: string
          value: number
          unit: string
        }
        Insert: {
          id?: string
          order_id: string
          field_name: string
          field_name_en: string
          value: number
          unit: string
        }
        Update: Partial<Database["public"]["Tables"]["order_measurements"]["Insert"]>
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          note: string | null
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          note?: string | null
          changed_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["order_status_history"]["Insert"]>
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method_id: string
          method_name: string | null
          amount: number
          status: string
          transaction_id: string | null
          receipt_url: string | null
          gateway_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          method_id: string
          method_name?: string | null
          amount: number
          status?: string
          transaction_id?: string | null
          receipt_url?: string | null
          gateway_payload?: Json | null
        }
        Update: {
          status?: string
          transaction_id?: string | null
          receipt_url?: string | null
          gateway_payload?: Json | null
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          name_en: string | null
          type: "online_gateway" | "bank_transfer" | "local" | "other"
          description: string | null
          instructions: string | null
          config: Json | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          type: "online_gateway" | "bank_transfer" | "local" | "other"
          description?: string | null
          instructions?: string | null
          config?: Json | null
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database["public"]["Tables"]["payment_methods"]["Insert"]>
      }
      payment_receipts: {
        Row: {
          id: string
          payment_id: string
          file_url: string
          file_key: string
          status: "under_review" | "approved" | "rejected"
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          file_url: string
          file_key: string
          status?: "under_review" | "approved" | "rejected"
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          status?: "under_review" | "approved" | "rejected"
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
      }
      shipping_addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          full_name: string
          phone: string
          city: string
          region: string
          detailed_address: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          full_name: string
          phone: string
          city: string
          region: string
          detailed_address: string
          is_default?: boolean
        }
        Update: {
          full_name?: string
          phone?: string
          city?: string
          region?: string
          detailed_address?: string
          is_default?: boolean
        }
      }
      shipments: {
        Row: {
          id: string
          order_id: string
          carrier: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          status: string | null
          address_json: Json | null
        }
        Insert: {
          id?: string
          order_id: string
          carrier?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          status?: string | null
          address_json?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["shipments"]["Insert"]>
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: "percent" | "amount"
          value: number
          min_order_amount: number | null
          start_at: string | null
          end_at: string | null
          max_uses: number | null
          used_count: number
          product_ids: string[] | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: "percent" | "amount"
          value: number
          min_order_amount?: number | null
          start_at?: string | null
          end_at?: string | null
          max_uses?: number | null
          used_count?: number
          product_ids?: string[] | null
          is_active?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>
      }
      coupon_usages: {
        Row: {
          id: string
          coupon_id: string
          order_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          order_id: string
          user_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["coupon_usages"]["Insert"]>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          is_read?: boolean
        }
        Update: { is_read?: boolean }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          order_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          order_id?: string | null
          rating: number
          comment?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string | null
          cover_url: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content?: string | null
          cover_url?: string | null
          is_published?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          question: string
          answer: string
          sort_order?: number
          is_active?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["faqs"]["Insert"]>
      }
      admin_users: {
        Row: { id: string; user_id: string; role: string; is_active: boolean; created_at: string }
        Insert: { id?: string; user_id: string; role?: string; is_active?: boolean }
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>
      }
      admin_activity_logs: {
        Row: {
          id: string
          admin_user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Insert"]>
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: { id?: string; key: string; value: Json }
        Update: { value?: Json }
      }
    }
    Views: Record<string, never>
    Functions: {
      apply_coupon: {
        Args: { code: string; order_amount: number; product_ids?: string[] }
        Returns: Json
      }
    }
    Enums: Record<string, never>
  }
}
