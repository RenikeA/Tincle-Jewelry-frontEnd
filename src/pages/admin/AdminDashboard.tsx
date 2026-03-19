import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { OrderService } from "../../lib/api";
import { OrderSummaryDTO } from "../../types/cart";
import { formatPrice, formatDate } from "../../lib/utils";

interface AdminDashboardProps {
  onNavigate?: (path: string) => void;
}

// ---- STAT CARD ----
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  trend?: string;
}> = ({ label, value, icon, trend }) => (
  <div className="bg-white border border-cream-dark rounded-sm p-6 flex items-start justify-between">
    <div>
      <p className="text-xs tracking-widest uppercase text-text-light mb-2 font-sans">
        {label}
      </p>
      <p className="font-serif text-3xl text-charcoal">{value}</p>
      {trend && (
        <p className="text-xs text-maroon mt-1 font-sans">{trend}</p>
      )}
    </div>
    <span className="text-3xl opacity-20">{icon}</span>
  </div>
);

// ---- ORDER STATUS BADGE ----
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={[
      "text-xs px-2 py-1 rounded-sm font-sans tracking-wide",
      statusColors[status] ?? "bg-gray-100 text-gray-600",
    ].join(" ")}
  >
    {status}
  </span>
);

// ---- SIDEBAR ----
const NAV_ITEMS = [
  { label: "Overview", icon: "◈", path: "/admin" },
  { label: "Products", icon: "◇", path: "/admin/products" },
  { label: "Orders", icon: "◻", path: "/admin/orders" },
  { label: "Customers", icon: "◯", path: "/admin/customers" },
];

const Sidebar: React.FC<{
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}> = ({ currentPath, onNavigate, onLogout }) => (
  <aside className="w-64 flex-shrink-0 bg-charcoal-soft min-h-screen flex flex-col">
    {/* Logo */}
    <div className="px-6 py-6 border-b border-white/10">
      <button onClick={() => onNavigate("/admin")} className="text-left">
        <p className="font-serif text-xl text-cream tracking-widest">
          TINCLE<span className="text-maroon">✦</span>
        </p>
        <p className="text-xs text-text-light tracking-widest uppercase mt-0.5">
          Admin Panel
        </p>
      </button>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          onClick={() => onNavigate(item.path)}
          className={[
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans transition-colors text-left w-full",
            currentPath === item.path
              ? "bg-maroon text-white"
              : "text-text-light hover:bg-white/5 hover:text-cream",
          ].join(" ")}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>

    {/* Bottom */}
    <div className="px-4 py-6 border-t border-white/10 flex flex-col gap-2">
      <button
        onClick={() => onNavigate("/")}
        className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans text-text-light hover:bg-white/5 hover:text-cream transition-colors text-left w-full"
      >
        <span>↗</span>
        View Store
      </button>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans text-text-light hover:bg-red-500/10 hover:text-red-400 transition-colors text-left w-full"
      >
        <span>→</span>
        Sign Out
      </button>
    </div>
  </aside>
);

// ---- MAIN DASHBOARD ----
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
}) => {
  const { user, logout } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<OrderSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    OrderService.getMyOrders(0, 8)
      .then((data) => setRecentOrders(data.content))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Redirect if not admin
  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen pt-[72px] bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal mb-2">
            Access Denied
          </p>
          <p className="text-sm text-text-light mb-6">
            You don't have permission to view this page.
          </p>
          <button
            onClick={() => onNavigate?.("/")}
            className="text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    onNavigate?.(path);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate?.("/");
  };

  const stats = [
    {
      label: "Total Orders",
      value: recentOrders.length.toString(),
      icon: "◻",
      trend: "↑ This month",
    },
    {
      label: "Revenue",
      value: formatPrice(
        recentOrders.reduce((sum, o) => sum + o.total, 0)
      ),
      icon: "₦",
      trend: "↑ From orders",
    },
    {
      label: "Pending Orders",
      value: recentOrders
        .filter((o) => o.status === "PENDING")
        .length.toString(),
      icon: "◈",
      trend: "Needs attention",
    },
    {
      label: "Delivered",
      value: recentOrders
        .filter((o) => o.status === "DELIVERED")
        .length.toString(),
      icon: "✓",
      trend: "Completed orders",
    },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-cream-dark px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-charcoal">Overview</h1>
            <p className="text-xs text-text-light font-sans">
              Welcome back, {user.firstName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate("/admin/products/new")}
              className="text-xs tracking-widest uppercase bg-maroon text-white px-5 py-2.5 hover:bg-maroon-dark transition-colors rounded-sm"
            >
              + Add Product
            </button>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Recent orders */}
          <div className="bg-white border border-cream-dark rounded-sm">
            <div className="px-6 py-4 border-b border-cream-dark flex items-center justify-between">
              <h2 className="font-serif text-lg text-charcoal">
                Recent Orders
              </h2>
              <button
                onClick={() => handleNavigate("/admin/orders")}
                className="text-xs text-maroon hover:underline tracking-widest uppercase"
              >
                View All
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-light text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-dark">
                      {[
                        "Order #",
                        "Date",
                        "Items",
                        "Total",
                        "Payment",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3 text-xs tracking-widest uppercase text-text-light font-sans font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-cream-dark last:border-0 hover:bg-cream/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-sans text-charcoal font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm font-sans text-text-mid">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-sans text-text-mid">
                          {order.itemCount}{" "}
                          {order.itemCount === 1 ? "item" : "items"}
                        </td>
                        <td className="px-6 py-4 text-sm font-sans text-charcoal">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleNavigate(
                                `/admin/orders/${order.id}`
                              )
                            }
                            className="text-xs text-maroon hover:underline tracking-widest uppercase"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
            {[
              {
                label: "Add New Product",
                desc: "List a new jewelry piece",
                path: "/admin/products/new",
                icon: "◇",
              },
              {
                label: "Manage Products",
                desc: "Edit or remove listings",
                path: "/admin/products",
                icon: "◈",
              },
              {
                label: "View All Orders",
                desc: "Track and update orders",
                path: "/admin/orders",
                icon: "◻",
              },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => handleNavigate(action.path)}
                className="bg-white border border-cream-dark rounded-sm p-6 text-left hover:border-maroon hover:shadow-maroon transition-all duration-300 group"
              >
                <span className="text-2xl text-maroon/30 group-hover:text-maroon/60 transition-colors">
                  {action.icon}
                </span>
                <p className="font-serif text-lg text-charcoal mt-3 mb-1">
                  {action.label}
                </p>
                <p className="text-xs text-text-light">{action.desc}</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};