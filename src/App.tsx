import { useEffect, lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { useAuthStore } from "@/stores/auth"
import { AppLayout } from "@/components/layout/AppLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { PageLoader } from "@/components/ui/page-loader"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SEO } from "@/components/SEO"

const HomePage = lazy(() => import("@/pages/HomePage"))
const ProductsPage = lazy(() => import("@/pages/ProductsPage"))
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"))
const DesignerPage = lazy(() => import("@/pages/designer/DesignerPage"))
const MeasurementsPage = lazy(() => import("@/pages/MeasurementsPage"))
const CartPage = lazy(() => import("@/pages/CartPage"))
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"))
const OrderSuccessPage = lazy(() => import("@/pages/OrderSuccessPage"))
const OrderTrackingPage = lazy(() => import("@/pages/OrderTrackingPage"))
const AccountPage = lazy(() => import("@/pages/account/AccountPage"))
const AccountOverview = lazy(() => import("@/pages/account/AccountOverview"))
const SavedDesignsPage = lazy(() => import("@/pages/account/SavedDesignsPage"))
const AccountOrdersPage = lazy(() => import("@/pages/account/AccountOrdersPage"))
const AccountMeasurementsPage = lazy(() => import("@/pages/account/AccountMeasurementsPage"))
const AccountAddressesPage = lazy(() => import("@/pages/account/AccountAddressesPage"))
const AccountProfilePage = lazy(() => import("@/pages/account/AccountProfilePage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/pages/RegisterPage"))
const BlogPage = lazy(() => import("@/pages/BlogPage"))
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"))
const FaqPage = lazy(() => import("@/pages/FaqPage"))
const StaticPage = lazy(() => import("@/pages/StaticPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"))
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"))
const AdminOrderDetail = lazy(() => import("@/pages/admin/AdminOrderDetail"))
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"))
const AdminProductEdit = lazy(() => import("@/pages/admin/AdminProductEdit"))
const AdminDesignOptions = lazy(() => import("@/pages/admin/AdminDesignOptions"))
const AdminMeasurements = lazy(() => import("@/pages/admin/AdminMeasurements"))
const AdminPayments = lazy(() => import("@/pages/admin/AdminPayments"))
const AdminCoupons = lazy(() => import("@/pages/admin/AdminCoupons"))
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"))
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"))

function withLoader(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <SEO />
      <Routes>
        <Route path="/login" element={withLoader(LoginPage)} />
        <Route path="/register" element={withLoader(RegisterPage)} />

        <Route element={<AppLayout />}>
          <Route index element={withLoader(HomePage)} />
          <Route path="/products" element={withLoader(ProductsPage)} />
          <Route path="/products/:slug" element={withLoader(ProductDetailPage)} />
          <Route path="/designer/scarf" element={withLoader(DesignerPage)} />
          <Route path="/measurements" element={withLoader(MeasurementsPage)} />
          <Route path="/cart" element={withLoader(CartPage)} />
          <Route path="/checkout" element={withLoader(CheckoutPage)} />
          <Route path="/order-success/:id" element={withLoader(OrderSuccessPage)} />
          <Route path="/orders/:id" element={withLoader(OrderTrackingPage)} />
          <Route path="/blog" element={withLoader(BlogPage)} />
          <Route path="/blog/:slug" element={withLoader(BlogPostPage)} />
          <Route path="/faq" element={withLoader(FaqPage)} />
          <Route path="/page/:slug" element={withLoader(StaticPage)} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={withLoader(AccountPage)}>
              <Route index element={withLoader(AccountOverview)} />
              <Route path="designs" element={withLoader(SavedDesignsPage)} />
              <Route path="orders" element={withLoader(AccountOrdersPage)} />
              <Route path="measurements" element={withLoader(AccountMeasurementsPage)} />
              <Route path="addresses" element={withLoader(AccountAddressesPage)} />
              <Route path="profile" element={withLoader(AccountProfilePage)} />
            </Route>
          </Route>
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole={["admin", "manager", "production", "shipping"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={withLoader(AdminDashboard)} />
          <Route path="orders" element={withLoader(AdminOrders)} />
          <Route path="orders/:id" element={withLoader(AdminOrderDetail)} />
          <Route path="products" element={withLoader(AdminProducts)} />
          <Route path="products/new" element={withLoader(AdminProductEdit)} />
          <Route path="products/:id" element={withLoader(AdminProductEdit)} />
          <Route path="design-options" element={withLoader(AdminDesignOptions)} />
          <Route path="measurements" element={withLoader(AdminMeasurements)} />
          <Route path="payments" element={withLoader(AdminPayments)} />
          <Route path="coupons" element={withLoader(AdminCoupons)} />
          <Route path="content" element={withLoader(AdminContent)} />
          <Route path="customers" element={withLoader(AdminCustomers)} />
        </Route>

        <Route path="*" element={withLoader(NotFoundPage)} />
      </Routes>
    </>
  )
}
