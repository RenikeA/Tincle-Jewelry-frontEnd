import React, { useEffect, Suspense } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useUIStore } from "./store/uiStore";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/cart/CartDrawer";
import { ToastContainer, WhatsAppButton } from "./components/ui";

const HomePage = React.lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const ShopPage = React.lazy(() =>
  import("./pages/ShopPage").then((m) => ({ default: m.ShopPage }))
);
const ProductDetailsPage = React.lazy(() =>
  import("./pages/ProductDetailsPage").then((m) => ({ default: m.ProductDetailsPage }))
);
const AuthPage = React.lazy(() =>
  import("./pages/AuthPage").then((m) => ({ default: m.AuthPage }))
);
const CheckoutPage = React.lazy(() =>
  import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const OrdersPage = React.lazy(() =>
  import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage }))
);
const WishlistPage = React.lazy(() =>
  import("./pages/WishlistPage").then((m) => ({ default: m.WishlistPage }))
);
const AccountPage = React.lazy(() =>
  import("./pages/AccountPage").then((m) => ({ default: m.AccountPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = React.lazy(() =>
  import("./pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const AdminDashboard = React.lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminProductsPage = React.lazy(() =>
  import("./pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage }))
);
const AdminOrdersPage = React.lazy(() =>
  import("./pages/admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminCustomersPage = React.lazy(() =>
  import("./pages/admin/AdminCustomersPage").then((m) => ({ default: m.AdminCustomersPage }))
);

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
  </div>
);

const getPath = () => window.location.pathname;

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = React.useState(getPath());
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const { theme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

 useEffect(() => {
  restoreSession().then(() => {
    fetchCart();
  });
}, [restoreSession, fetchCart]);

  useEffect(() => {
    const handlePop = () => setCurrentPath(getPath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (href: string) => {
    window.history.pushState({}, "", href);
    setCurrentPath(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    const path = currentPath.split("?")[0];

    if (path === "/shop") return <ShopPage onNavigate={navigate} />;
    if (path.startsWith("/product/")) {
  const slug = path.replace("/product/", "");
  return <ProductDetailsPage slug={slug} onNavigate={navigate} />;
}
    if (path === "/checkout") return <CheckoutPage onNavigate={navigate} />;
    if (path === "/login") return <AuthPage initialMode="login" onNavigate={navigate} />;
    if (path === "/register") return <AuthPage initialMode="register" onNavigate={navigate} />;
    if (path === "/orders") return <OrdersPage onNavigate={navigate} />;
    if (path === "/wishlist") return <WishlistPage onNavigate={navigate} />;
    if (path === "/account") return <AccountPage onNavigate={navigate} />;
    if (path === "/forgot-password") return <ForgotPasswordPage onNavigate={navigate} />;
    if (path === "/reset-password") return <ResetPasswordPage onNavigate={navigate} />;
    if (path === "/admin") return <AdminDashboard onNavigate={navigate} />;
    if (path.startsWith("/admin/products")) return <AdminProductsPage onNavigate={navigate} />;
    if (path.startsWith("/admin/orders")) return <AdminOrdersPage onNavigate={navigate} />;
    if (path.startsWith("/admin/customers")) return <AdminCustomersPage onNavigate={navigate} />;

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream overflow-x-hidden">
      <Navbar onNavigate={navigate} />
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      </div>
      <Footer onNavigate={navigate} />
      <CartDrawer onCheckout={() => navigate("/checkout")} />
      <WhatsAppButton phone={import.meta.env.VITE_WHATSAPP_NUMBER ?? "2348000000000"} />
      <ToastContainer />
    </div>
  );
};