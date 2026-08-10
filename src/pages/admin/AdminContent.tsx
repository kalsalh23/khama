import { useEffect, useState } from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminListBlogPosts, adminSaveBlogPost, adminDeleteBlogPost,
  adminListFaqs, adminSaveFaq, adminDeleteFaq,
  adminSaveSetting,
} from "@/lib/adminApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import type { BlogPost, Faq } from "@/lib/types"

export default function AdminContent() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", content: "" })
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" })
  const [settings, setSettings] = useState({ page_privacy_policy: "", page_terms: "", page_returns_policy: "", page_shipping_policy: "" })

  const load = () => {
    adminListBlogPosts().then(setPosts).catch(() => {})
    adminListFaqs().then(setFaqs).catch(() => {})
  }
  useEffect(load, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">المحتوى</h2>
      <Tabs defaultValue="blog">
        <TabsList>
          <TabsTrigger value="blog">المدونة</TabsTrigger>
          <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
          <TabsTrigger value="pages">صفحات السياسات</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">مقال جديد</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>العنوان</Label><Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></div>
              <div><Label>الرابط</Label><Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} dir="ltr" /></div>
              <div className="sm:col-span-2"><Label>الملخص</Label><Input value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>المحتوى (HTML)</Label><Textarea rows={6} value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} /></div>
            </div>
            <Button className="mt-3" onClick={async () => {
              if (!postForm.title || !postForm.slug) { toast({ title: "أدخل العنوان والرابط", variant: "destructive" }); return }
              await adminSaveBlogPost({ ...postForm, is_published: true })
              setPostForm({ title: "", slug: "", excerpt: "", content: "" })
              toast({ title: "تم النشر", variant: "success" })
              load()
            }}><Plus className="size-4" /> نشر المقال</Button>
          </div>
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.is_published} onCheckedChange={async (v) => { await adminSaveBlogPost({ ...p, is_published: v }); load() }} />
                  <Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteBlogPost(p.id); load() }}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">سؤال جديد</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>السؤال</Label><Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>الإجابة</Label><Textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} /></div>
            </div>
            <Button className="mt-3" onClick={async () => {
              if (!faqForm.question || !faqForm.answer) { toast({ title: "أدخل السؤال والإجابة", variant: "destructive" }); return }
              await adminSaveFaq({ ...faqForm, sort_order: faqs.length + 1, is_active: true })
              setFaqForm({ question: "", answer: "" })
              toast({ title: "تمت الإضافة", variant: "success" })
              load()
            }}><Plus className="size-4" /> إضافة</Button>
          </div>
          <div className="space-y-2">
            {faqs.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border bg-card p-3">
                <p className="font-medium">{f.question}</p>
                <div className="flex items-center gap-2">
                  <Switch checked={f.is_active} onCheckedChange={async (v) => { await adminSaveFaq({ ...f, is_active: v }); load() }} />
                  <Button variant="ghost" size="iconSm" onClick={async () => { await adminDeleteFaq(f.id); load() }}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">محتوى الصفحات الثابتة</h3>
            <div className="space-y-4">
              {(["privacy_policy", "terms", "returns_policy", "shipping_policy"] as const).map((key) => (
                <div key={key}>
                  <Label>{key}</Label>
                  <Textarea rows={3} value={settings[`page_${key}`] ?? ""} onChange={(e) => setSettings((s) => ({ ...s, [`page_${key}`]: e.target.value }))} />
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={async () => {
              for (const [k, v] of Object.entries(settings)) await adminSaveSetting(k, v)
              toast({ title: "تم حفظ المحتوى", variant: "success" })
            }}><Save className="size-4" /> حفظ</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
