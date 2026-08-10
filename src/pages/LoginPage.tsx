import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { GraduationCap, LogIn } from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { SEO } from "@/components/SEO"

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((s) => s.signIn)
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: string })?.from ?? "/"

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)
    if (error) {
      toast({ title: "فشل تسجيل الدخول", description: error, variant: "destructive" })
      return
    }
    toast({ title: "مرحباً بعودتك", variant: "success" })
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-amber-100/20 px-4 py-12">
      <SEO title="تسجيل الدخول" />
      <Link to="/" className="mb-6 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
          <GraduationCap className="size-6" />
        </div>
        <span className="text-2xl font-bold">خاما</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>ادخل لتصميم وحفظ طلباتك وتتبعها</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>كلمة المرور</FormLabel><FormControl><Input type="password" {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <LogIn className="size-4" /> {loading ? "جارٍ الدخول..." : "دخول"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="font-medium text-primary underline">أنشئ حسابًا</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
