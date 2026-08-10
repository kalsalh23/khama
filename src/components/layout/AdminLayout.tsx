import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  Palette,
  Ruler,
  CreditCard,
  TicketPercent,
  Newspaper,
  Users,
  ArrowRight,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

const LINKS = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "الطلبات", icon: Package },
  { to: "/admin/products", label: "المنتجات", icon: Package },
  { to: "/admin/design-options", label: "الألوان والخطوط والتطريز", icon: Palette },
  { to: "/admin/measurements", label: "حقول القياسات", icon: Ruler },
  { to: "/admin/payments", label: "طرق الدفع", icon: CreditCard },
  { to: "/admin/coupons", label: "الكوبونات", icon: TicketPercent },
  { to: "/admin/content", label: "المحتوى", icon: Newspaper },
  { to: "/admin/customers", label: "العملاء", icon: Users },
]

export function AdminLayout() {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-background">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l bg-white dark:bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Palette className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">لوحة الإدارة</p>
            <p className="text-xs text-muted-foreground">خاما</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <link.icon className="size-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <ArrowRight className="size-4" />
            العودة للمتجر
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 lg:mr-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur dark:bg-card/80 sm:px-6">
          <h1 className="font-semibold">لوحة تحكم خاما</h1>
          <span className="text-sm text-muted-foreground">{profile?.full_name || profile?.email}</span>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
