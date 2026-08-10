import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { User, Package, Palette, Ruler, MapPin, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LINKS = [
  { to: "/account", label: "نظرة عامة", icon: User, end: true },
  { to: "/account/orders", label: "طلباتي", icon: Package },
  { to: "/account/designs", label: "تصاميمي المحفوظة", icon: Palette },
  { to: "/account/measurements", label: "قياساتي", icon: Ruler },
  { to: "/account/addresses", label: "عناويني", icon: MapPin },
  { to: "/account/profile", label: "البيانات الشخصية", icon: User },
]

export default function AccountPage() {
  const profile = useAuthStore((s) => s.profile)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="text-xl">{profile?.full_name?.slice(0, 2) || profile?.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name || "حسابي"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border bg-card p-2 lg:flex-col">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <l.icon className="size-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl border bg-card p-4 text-center">
            <p className="text-sm font-medium">جاهز لتصميم جديد؟</p>
            <Button asChild variant="gold" size="sm" className="mt-3 w-full">
              <Link to="/designer/scarf">
                صمّم الآن <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
