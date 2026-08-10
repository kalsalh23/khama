import type { FontDef, ScarfDesignConfig } from "@/lib/types"

const W = 500
const H = 760

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lighten(hex: string, amt: number) {
  const h = hex.replace("#", "")
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + amt)
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + amt)
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + amt)
  return `rgb(${r}, ${g}, ${b})`
}

function darken(hex: string, amt: number) {
  const h = hex.replace("#", "")
  const r = Math.max(0, parseInt(h.slice(0, 2), 16) - amt)
  const g = Math.max(0, parseInt(h.slice(2, 4), 16) - amt)
  const b = Math.max(0, parseInt(h.slice(4, 6), 16) - amt)
  return `rgb(${r}, ${g}, ${b})`
}

function isLight(hex: string) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}

let currentFonts: FontDef[] = []

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function resolveFontFamily(config: ScarfDesignConfig, fonts: FontDef[], lang: "ar" | "en") {
  const found = fonts.find((f) => f.font_key === config.font)
  if (found) return found.css_family || fallbackFamily(found.type)
  return fallbackFamily(lang)
}

function fallbackFamily(lang: string) {
  return lang === "ar" ? "'Cairo', 'IBM Plex Sans Arabic', sans-serif" : "Montserrat, 'Segoe UI', sans-serif"
}

export function renderScarf(
  ctx: CanvasRenderingContext2D,
  config: ScarfDesignConfig,
  fonts: FontDef[] = []
) {
  currentFonts = fonts
  ctx.clearRect(0, 0, W, H)

  const scarfColor = config.color || "#1a2639"
  const thread = config.threadColor || "#d4af37"
  const dark = isLight(scarfColor)

  // background handled by caller (designer draws its own background)

  // ---------------- Stole body ----------------
  const bodyX = 60
  const bodyY = 30
  const bodyW = W - 120
  const bodyH = H - 120

  // Shadow
  ctx.save()
  roundedRect(ctx, bodyX + 8, bodyY + 10, bodyW, bodyH, 18)
  ctx.fillStyle = "rgba(0,0,0,0.18)"
  ctx.fill()
  ctx.restore()

  // Base fabric with satin gradient
  const grad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH)
  grad.addColorStop(0, lighten(scarfColor, 30))
  grad.addColorStop(0.35, scarfColor)
  grad.addColorStop(1, darken(scarfColor, 40))
  roundedRect(ctx, bodyX, bodyY, bodyW, bodyH, 18)
  ctx.fillStyle = grad
  ctx.fill()

  // Woven texture lines
  ctx.save()
  roundedRect(ctx, bodyX, bodyY, bodyW, bodyH, 18)
  ctx.clip()
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = dark ? "#000" : "#fff"
  ctx.lineWidth = 1
  for (let y = bodyY + 6; y < bodyY + bodyH; y += 5) {
    ctx.beginPath()
    ctx.moveTo(bodyX, y)
    ctx.lineTo(bodyX + bodyW, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.05
  for (let x = bodyX + 6; x < bodyX + bodyW; x += 5) {
    ctx.beginPath()
    ctx.moveTo(x, bodyY)
    ctx.lineTo(x, bodyY + bodyH)
    ctx.stroke()
  }
  // satin sheen diagonal
  const sheen = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH)
  sheen.addColorStop(0, "rgba(255,255,255,0.10)")
  sheen.addColorStop(0.4, "rgba(255,255,255,0.0)")
  sheen.addColorStop(0.65, "rgba(255,255,255,0.0)")
  sheen.addColorStop(1, "rgba(255,255,255,0.06)")
  ctx.fillStyle = sheen
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH)
  ctx.restore()

  // Border trim (double line in thread color)
  ctx.save()
  roundedRect(ctx, bodyX + 10, bodyY + 10, bodyW - 20, bodyH - 20, 12)
  ctx.strokeStyle = thread
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.9
  ctx.stroke()
  roundedRect(ctx, bodyX + 16, bodyY + 16, bodyW - 32, bodyH - 32, 9)
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.6
  ctx.stroke()
  ctx.restore()

  // ---------------- Top decorative band ----------------
  drawDecorativeBand(ctx, bodyX + 22, bodyY + 22, bodyW - 44, 52, thread, dark)

  // ---------------- Bottom decorative band ----------------
  drawDecorativeBand(ctx, bodyX + 22, bodyY + bodyH - 74, bodyW - 44, 52, thread, dark)

  // ---------------- Center medallion ----------------
  const centerX = W / 2
  const medW = 210
  const medH = 150
  const medY = bodyY + 150
  ctx.save()
  ctx.globalAlpha = 0.85
  roundedRect(ctx, centerX - medW / 2, medY, medW, medH, 10)
  ctx.strokeStyle = thread
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.7
  ctx.stroke()
  ctx.restore()

  // ---------------- Graduation Year ----------------
  if (config.yearEnabled && config.graduationYear) {
    const year = toArabicOrWestern(config.graduationYear, config.nameLanguage === "ar")
    drawEmbroideredText(ctx, year, centerX, medY - 26, 30, thread, config, "en")
    // small star separators
    ctx.save()
    ctx.fillStyle = thread
    ctx.globalAlpha = 0.8
    for (const off of [-62, 62]) {
      drawStar(ctx, centerX + off, medY - 19, 6, thread)
    }
    ctx.restore()
  }

  // ---------------- Name ----------------
  if (config.name) {
    const nameSize = config.name.length > 18 ? 30 : config.name.length > 10 ? 36 : 42
    const baseY = medY + 92
    let nx = centerX
    let ny = baseY
    if (config.namePosition === "right") {
      nx = bodyX + 60 + (bodyW - 120) / 2 + 30
    } else if (config.namePosition === "left") {
      nx = bodyX + 60 + (bodyW - 120) / 2 - 30
    } else if (config.namePosition === "custom") {
      nx = bodyX + (bodyW * (config.nameX ?? 50)) / 100
      ny = bodyY + (bodyH * (config.nameY ?? 62)) / 100
    }
    drawEmbroideredText(ctx, config.name, nx, ny, nameSize, thread, config, config.nameLanguage)
  }

  // ---------------- Custom Text ----------------
  if (config.customTextEnabled && config.customText) {
    const lines = wrapText(config.customText, 20)
    const lineHeight = 26
    const startY = medY + 250
    lines.forEach((line, i) => {
      drawEmbroideredText(ctx, line, centerX, startY + i * lineHeight, 18, thread, config, "ar")
    })
  }

  // ---------------- Logo ----------------
  if (config.logo?.url) {
    const logo = config.logo
    const logoUrl = logo.url as string
    const size = 90 * (logo.scale || 1)
    const lx = bodyX + ((bodyW - 40) * (logo.x || 50)) / 100
    const ly = bodyY + 18 + 50
    ctx.save()
    ctx.globalAlpha = logo.opacity ?? 1
    ctx.translate(lx, ly)
    ctx.rotate(((logo.rotation ?? 0) * Math.PI) / 180)
    const img = document.createElement("img")
    img.crossOrigin = "anonymous"
    img.src = logoUrl
    if (img.complete) {
      const ratio = img.width / img.height || 1
      const w = size
      const h = size / ratio
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
    }
    ctx.restore()
  }

  // ---------------- Fringe ----------------
  drawFringe(ctx, bodyX, bodyY + bodyH - 6, bodyW, thread, dark)
}

function drawDecorativeBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  thread: string,
  dark: boolean
) {
  ctx.save()
  ctx.fillStyle = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)"
  roundedRect(ctx, x, y, w, h, 6)
  ctx.fill()
  ctx.strokeStyle = thread
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.55
  roundedRect(ctx, x + 3, y + 3, w - 6, h - 6, 4)
  ctx.stroke()
  // repeating pattern: diamonds
  const step = 34
  for (let i = 0; i * step + step / 2 < w; i++) {
    const cx = x + i * step + step / 2
    ctx.globalAlpha = 0.75
    ctx.beginPath()
    ctx.moveTo(cx, y + 8)
    ctx.lineTo(cx + 9, y + h / 2)
    ctx.lineTo(cx, y + h - 8)
    ctx.lineTo(cx - 9, y + h / 2)
    ctx.closePath()
    ctx.fillStyle = thread
    ctx.fill()
  }
  ctx.restore()
}

function drawFringe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, thread: string, dark: boolean) {
  ctx.save()
  const threads = 28
  const spacing = w / threads
  for (let i = 0; i < threads; i++) {
    const tx = x + 8 + i * spacing + spacing / 2
    const len = 34 + (i % 3) * 4
    ctx.strokeStyle = thread
    ctx.globalAlpha = 0.85
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(tx, y)
    ctx.lineTo(tx + ((i % 2 === 0) ? 4 : -4), y + len)
    ctx.stroke()
    ctx.fillStyle = thread
    ctx.globalAlpha = 0.95
    ctx.beginPath()
    ctx.arc(tx + ((i % 2 === 0) ? 4 : -4), y + len + 2, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawEmbroideredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  thread: string,
  config: ScarfDesignConfig,
  lang: "ar" | "en"
) {
  const family = resolveFontFamily(config, currentFonts, lang)
  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `bold ${size}px ${family}`
  // shadow for depth
  ctx.shadowColor = "rgba(0,0,0,0.35)"
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.fillStyle = darken(thread, 50)
  ctx.fillText(text, x, y + 2)
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  // main embroidery
  const grad = ctx.createLinearGradient(x, y - size / 2, x, y + size / 2)
  grad.addColorStop(0, lighten(thread, 60))
  grad.addColorStop(0.5, thread)
  grad.addColorStop(1, darken(thread, 20))
  ctx.fillStyle = grad
  ctx.fillText(text, x, y)
  // highlight outline for "stitched" feel
  ctx.strokeStyle = lighten(thread, 40)
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 1
  ctx.strokeText(text, x, y)
  ctx.restore()
}

function toArabicOrWestern(text: string, arabic: boolean) {
  if (!arabic) return text
  const map: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
  }
  return text.replace(/[0-9]/g, (d) => map[d])
}

function wrapText(text: string, maxLen: number) {
  if (text.length <= maxLen) return [text]
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if ((current + " " + word).trim().length > maxLen) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current += " " + word
    }
  }
  if (current.trim()) lines.push(current.trim())
  return lines.slice(0, 3)
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const rad = i % 2 === 0 ? r : r * 0.4
    const px = x + Math.cos(angle) * rad
    const py = y + Math.sin(angle) * rad
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function createScarfPreview(
  config: ScarfDesignConfig,
  fonts: FontDef[] = [],
  scale = 2
): string {
  const canvas = document.createElement("canvas")
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext("2d")!
  ctx.scale(scale, scale)
  // background
  ctx.fillStyle = config.background || "#f8fafc"
  ctx.fillRect(0, 0, W, H)
  renderScarf(ctx, config, fonts)
  return canvas.toDataURL("image/webp", 0.92)
}

export const SCARF_LOGICAL = { W, H }
export const hexToRgbaFn = hexToRgba
