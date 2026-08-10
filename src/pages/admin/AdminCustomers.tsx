import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { adminListCustomers, adminUpdateCustomerRole } from "@/lib/adminApi"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import type { Profile } from "@/lib/types"

const ROLES: { value: Profile["role"]; label: string }[] = [
  { value: "customer", label: "عميل" },
  { value: "manager", label: "مدير" },
  { value: "production", label: "إنتاج" },
  { value: "shipping", label: "شحن" },
  { value: "admin", label: "مشرف" },
]

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    adminListCustomers().then(setCustomers).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase()
    return !q || c.full_name?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone?.includes(q)
  })

  const changeRole = async (c: Profile, role: Profile["role"]) => {
    try {
      await adminUpdateCustomerRole(c.id, role)
      setCustomers((list) => list.map((x) => (x.id === c.id ? { ...x, role } : x)))
      toast({ title: "تم تحديث الدور", variant: "success" })
    } catch {
      toast({ title: "فشل التحديث", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">العملاء</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="الاسم، البريد، الهاتف" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 pr-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">العميل</th><th className="p-3 font-medium">الهاتف</th><th className="p-3 font-medium">الدور</th><th className="p-3 font-medium">تاريخ التسجيل</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-6"><Skeleton className="h-32 w-full" /></td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium">{c.full_name || "بدون اسم"}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{c.email}</p>
                </td>
                <td className="p-3" dir="ltr">{c.phone ?? "—"}</td>
                <td className="p-3">
                  <Select value={c.role} onValueChange={(v) => changeRole(c, v as Profile["role"])}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
