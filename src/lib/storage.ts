import { supabase } from "@/lib/supabase"
import { fileToDataUrl } from "@/lib/utils"

export type BucketName =
  | "products"
  | "product-colors"
  | "design-assets"
  | "design-previews"
  | "payment-receipts"
  | "avatars"
  | "blog"

const ACCEPTED_IMAGE = ["image/png", "image/jpeg", "image/webp"]
export const MAX_IMAGE_MB = 5

export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE.includes(file.type)) {
    return "الرجاء رفع صورة بصيغة PNG أو JPG أو WEBP فقط"
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `حجم الصورة يجب ألا يتجاوز ${MAX_IMAGE_MB} ميجابايت`
  }
  return null
}

export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<Blob> {
  const dataUrl = await fileToDataUrl(file)
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = dataUrl
  })
  const scale = Math.min(1, maxWidth / img.width)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/webp", quality)
  })
}

export async function uploadToBucket(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  isPublic = true
) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })
  if (error) throw error
  if (isPublic) {
    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
  }
  return data.path
}

export async function uploadLogo(file: File, userId: string): Promise<{ url: string; key: string }> {
  const blob = await compressImage(file)
  const ext = "webp"
  const key = `${userId}/${Date.now()}-logo.${ext}`
  const url = await uploadToBucket("design-assets", key, blob, true)
  return { url, key }
}

export async function uploadReceipt(file: File, userId: string): Promise<{ url: string; key: string }> {
  const isPdf = file.type === "application/pdf"
  const blob = isPdf ? file : await compressImage(file, 1600, 0.85)
  const ext = isPdf ? "pdf" : "webp"
  const key = `receipts/${userId}/${Date.now()}-receipt.${ext}`
  const path = await uploadToBucket("payment-receipts", key, blob, false)
  const url = await getSignedUrl("payment-receipts", path)
  return { url, key: path }
}

export async function uploadPreview(dataUrl: string, userId: string): Promise<{ url: string; key: string }> {
  const blob = await (await fetch(dataUrl)).blob()
  const key = `previews/${userId}/${Date.now()}-design.webp`
  const url = await uploadToBucket("design-previews", key, blob, true)
  return { url, key }
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 600) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  return data?.signedUrl ?? path
}

export async function deleteFromBucket(bucket: BucketName, path: string) {
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}

export async function uploadProductImage(file: File, productSlug: string) {
  const blob = await compressImage(file, 1600, 0.85)
  const key = `${productSlug}/${Date.now()}-product.webp`
  const url = await uploadToBucket("products", key, blob, true)
  return { url, key }
}

export async function uploadBlogCover(file: File) {
  const blob = await compressImage(file, 1600, 0.85)
  const key = `${Date.now()}-cover.webp`
  const url = await uploadToBucket("blog", key, blob, true)
  return { url, key }
}
