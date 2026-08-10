import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { fetchBlogPost } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { SEO } from "@/components/SEO"
import NotFoundPage from "@/pages/NotFoundPage"

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<import("@/lib/types").BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchBlogPost(slug ?? "").then(setPost).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-20"><Skeleton className="h-96 rounded-3xl" /></div>
  if (!post) return <NotFoundPage />

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SEO title={post.title} description={post.excerpt ?? undefined} />
      <Link to="/blog" className="text-sm text-primary hover:underline">← العودة للمدونة</Link>
      {post.cover_url && (
        <img src={post.cover_url} alt={post.title} className="mt-6 aspect-video w-full rounded-2xl object-cover" />
      )}
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
      {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
      <div
        className="prose mt-8 max-w-none space-y-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
      />
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-primary to-slate-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">صمّم وشاح تخرجك الآن</h2>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/designer/scarf">ابدأ التصميم</Link>
        </Button>
      </div>
    </article>
  )
}
