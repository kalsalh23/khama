import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { fetchUserMeasurements } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import type { UserMeasurement } from "@/lib/types"

export default function AccountMeasurementsPage() {
  const user = useAuthStore((s) => s.user)
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([])

  useEffect(() => {
    if (!user) return
    fetchUserMeasurements(user.id).then(setMeasurements).catch(() => {})
  }, [user])

  const latest = measurements[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">قياساتي المحفوظة</h2>
        <Button asChild variant="outline" size="sm">
          <Link to="/measurements">تحديث القياسات</Link>
        </Button>
      </div>

      {latest ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {latest.values.map((m) => (
            <div key={m.fieldId} className="rounded-2xl border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary" dir="ltr">
                {m.value} <span className="text-sm font-normal text-muted-foreground">{m.unit}</span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <p className="font-semibold">لا توجد قياسات محفوظة</p>
          <p className="mt-2 text-sm text-muted-foreground">احفظ قياساتك لاستخدامها في الطلبات القادمة.</p>
          <Button asChild variant="gold" className="mt-4">
            <Link to="/measurements">إدخال قياساتي</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
