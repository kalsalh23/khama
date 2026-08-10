import { useEffect, useState } from "react"
import { Package, Banknote, Calendar, Layers, Scissors, CheckCircle, TrendingUp, RefreshCcw } from "lucide-react"
import { adminDashboardStats } from "@/lib/adminApi"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    paidOrders: 0,
    inProduction: 0,
    inEmbroidery: 0,
    ready: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const cards = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: Package },
    { label: "طلبات اليوم", value: stats.todayOrders, icon: Calendar },
    { label: "الطلبات المدفوعة", value: stats.paidOrders, icon: Banknote },
    { label: "قيد التجهيز", value: stats.inProduction, icon: Layers },
    { label: "قيد التطريز", value: stats.inEmbroidery, icon: Scissors },
    { label: "جاهزة للشحن", value: stats.ready, icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">نظرة عامة</h2>
        <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="size-4" /> تحديث</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="gap-3">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <c.icon className="size-4 text-primary" /> {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "..." : c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-l from-emerald-600 to-emerald-700 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="size-4" /> إجمالي المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{loading ? "..." : formatPrice(stats.totalSales)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
