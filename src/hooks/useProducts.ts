import { useEffect, useState } from "react"
import { fetchProducts, fetchProductBySlug } from "@/lib/api"
import type { Product } from "@/lib/types"

let cached: Product[] | null = null
let cachePromise: Promise<Product[]> | null = null

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cached) {
      setProducts(cached)
      return
    }
    if (!cachePromise) {
      cachePromise = fetchProducts(true)
        .then((data) => {
          cached = data
          return data
        })
        .catch((e) => {
          throw e
        })
    }
    cachePromise
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error, reload: async () => { cached = null; cachePromise = null } }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProductBySlug(slug)
      .then((p) => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  return { product, loading }
}
