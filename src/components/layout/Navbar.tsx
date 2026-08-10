import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  GraduationCap,
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  Package,
  Palette,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth"
import { useCartStore } from "@/stores/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/designer/scarf", label: "مصمم الوشاح" },
  { to: "/measurements", label: "القياسات" },
  { to: "/blog", label: "المدونة" },
  { to: "/faq", label: "الأسئلة الشائعة" },
]

export function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const count = useCartStore((s) => s.count())
  const items = useCartStore((s) => s.items)
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery("")
    }
  }

  const isAdmin = profile && ["admin", "manager", "production", "shipping"].includes(profile.role)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg transition-all",
        scrolled ? "shadow-sm" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">خاما</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="بحث"
          >
            <Search className="size-5" />
          </Button>

          {isAdmin && (
            <Button variant="ghost" size="icon" asChild aria-label="لوحة الإدارة">
              <Link to="/admin">
                <Settings className="size-5" />
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-full border p-0 hover:bg-muted cursor-pointer">
                  <Avatar className="size-8">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                    <AvatarFallback className="text-xs">
                      {profile?.full_name?.slice(0, 2) || user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{profile?.full_name || "حسابي"}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account"><User /> حسابي</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders"><Package /> طلباتي</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/designs"><Palette /> تصاميمي</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut()
                    navigate("/")
                  }}
                >
                  <LogOut /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <User className="size-4" />
                <span className="hidden sm:inline">دخول</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" asChild className="relative" aria-label="السلة">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <Badge className="absolute -top-1 -left-1 size-5 items-center justify-center rounded-full p-0 text-[10px]">
                  {count}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t bg-background">
          <form onSubmit={onSearch} className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن وشاح، روب، قبعة..."
                className="pl-9 pr-3"
              />
            </div>
          </form>
        </div>
      )}

      {open && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <Link to="/login" className="rounded-md px-3 py-2.5 text-sm font-medium text-primary">
                تسجيل الدخول
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
