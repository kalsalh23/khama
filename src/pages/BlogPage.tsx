import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchBlogPosts } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { SEO } from "@/components/SEO"
import type { BlogPost } from "@/lib/types"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogPosts().then(setPosts).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SEO title="المدونة" description="نصائح وأفكار لتصميم أزياء التخرج." />
      <h1 className="mb-2 text-3xl font-bold sm:text-4xl">المدونة</h1>
      <p className="mb-10 text-muted-foreground">أفكار ونصائح لتصميم تخرجك بطريقة مميزة</p>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">لا توجد مقالات بعد.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
              {p.cover_url && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
              )}
              <div className="p-5">
                <Badge variant="secondary" className="mb-2">مقال</Badge>
                <h2 className="font-semibold group-hover:text-primary">{p.title}</h2>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
