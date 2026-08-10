import { useEffect } from "react"
import { useLocation } from "react-router-dom"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  type?: string
  noindex?: boolean
}

export function SEO({ title, description, image, type = "website", noindex }: SEOProps) {
  const location = useLocation()

  useEffect(() => {
    const docTitle = title ? `${title} | خاما` : "خاما | مصمم التخرج الشخصي"
    document.title = docTitle

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) metaDescription.setAttribute("content", description ?? "")

    const setMeta = (nameOrProp: string, value: string) => {
      const attr = nameOrProp.startsWith("og:") ? "property" : "name"
      const selector = `meta[${attr}="${nameOrProp}"]`
      let el = document.querySelector(selector) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attr, nameOrProp)
        document.head.appendChild(el)
      }
      el.setAttribute("content", value)
    }

    setMeta("og:title", docTitle)
    setMeta("og:description", description ?? "")
    setMeta("og:type", type)
    if (image) setMeta("og:image", image)

    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta")
        robots.setAttribute("name", "robots")
        document.head.appendChild(robots)
      }
      robots.setAttribute("content", "noindex, nofollow")
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, image, type, noindex, location.pathname])

  return null
}
