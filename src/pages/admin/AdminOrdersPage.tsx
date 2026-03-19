import React, { useEffect, useState } from "react";
import { OrderService } from "../../lib/api";
import { Order, OrderSummaryDTO, OrderStatus } from "../../types/cart";
import { formatPrice, formatDate } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../lib/apiClient";

interface AdminOrdersPageProps {
  onNavigate?: (path: string) => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const StatusBadge: React.FC<{ status: string; type?: "order" | "payment" }> = ({
  status,
  type = "order",
}) => {
  const colors = type === "payment" ? paymentColors : statusColors;
  return (
    <span
      className={[
        "text-xs px-2 py-1 rounded-sm font-sans tracking-wide",
        colors[status] ?? "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
};

const OrderDetailModal: React.FC<{
  orderId: string;
  onClose: () => void;
  onStatusUpdate: () => void;
}> = ({ orderId, onClose, onStatusUpdate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    OrderService.getOrder(orderId)
      .then((o) => {
        setOrder(o);
        setNewStatus(o.status);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !order || newStatus === order.status) return;
    setIsUpdating(true);
    setUpdateError("");
    try {
      await apiClient.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
      });
      onStatusUpdate();
      onClose();
    } catch {
      setUpdateError("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const ORDER_STATUSES: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-5">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark sticky top-0 bg-white">
          <h3 className="font-serif text-xl text-charcoal">Order Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-cream-dark hover:bg-cream-dark transition-colors text-text-mid"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !order ? (
          <div className="text-center py-20">
            <p className="text-text-light text-sm">Failed to load order</p>
          </div>
        ) : (
          <div className="px-6 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 bg-cream-dark rounded-sm p-4">
              <div>
                <p className="text-xs text-text-light mb-1">Order Number</p>
                <p className="text-sm font-medium text-charcoal font-sans">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Date</p>
                <p className="text-sm text-charcoal font-sans">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Order Status</p>
                <StatusBadge status={order.status} type="order" />
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Payment</p>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Payment Method</p>
                <p className="text-sm text-charcoal font-sans">
                  {order.paymentProvider ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Reference</p>
                <p className="text-sm text-charcoal font-sans truncate">
                  {order.paymentReference ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-maroon/5 border border-maroon/20 rounded-sm p-4">
              <p className="text-xs tracking-widest uppercase text-text-mid mb-3 font-sans">
                Update Order Status
              </p>
              <div className="flex gap-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  aria-label="Order status"
                  className="flex-1 border border-cream-dark rounded-sm px-3 py-2 text-sm font-sans text-charcoal bg-white focus:outline-none focus:border-maroon transition-colors"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || newStatus === order.status}
                  className="px-5 py-2 bg-maroon text-white text-xs tracking-widest uppercase rounded-sm hover:bg-maroon-dark transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Updating…" : "Update"}
                </button>
              </div>
              {updateError && (
                <p className="text-xs text-red-500 mt-2">{updateError}</p>
              )}
            </div>

            <div>
              <h4 className="text-xs tracking-widest uppercase text-text-light mb-4 font-sans">
                Items
              </h4>
              <div className="flex flex-col gap-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-sm overflow-hidden bg-cream-dark flex-shrink-0">
                      <img
                        src={item.productImage ?? "/placeholder-jewelry.jpg"}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-charcoal font-medium">
                        {item.productName}
                      </p>
                      {item.variantLabel && (
                        <p className="text-xs text-text-light mt-0.5">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="text-xs text-text-light mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-sans text-charcoal flex-shrink-0">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs tracking-widest uppercase text-text-light mb-3 font-sans">
                Shipping Address
              </h4>
              <div className="bg-cream-dark rounded-sm p-4 text-sm text-text-mid font-sans leading-relaxed">
                <p className="font-medium text-charcoal">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}
                </p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>

            <div className="border-t border-cream-dark pt-4 flex flex-col gap-2 text-sm font-sans">
              <div className="flex justify-between text-text-mid">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-maroon">
                  <span>Discount</span>
                  <span>− {formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-text-mid">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-charcoal text-base pt-2 border-t border-cream-dark mt-1">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const fetchOrders = () => {
    setIsLoading(true);
    OrderService.getMyOrders(page, 15)
      .then((data) => {
        setOrders(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen pt-[72px] flex items-center justify-center">
        <p className="font-serif text-2xl text-charcoal">Access Denied</p>
      </main>
    );
  }

  const filtered =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const ORDER_STATUSES: (OrderStatus | "ALL")[] = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-64 flex-shrink-0 bg-charcoal-soft min-h-screen flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <button onClick={() => onNavigate?.("/admin")} className="text-left">
            <p className="font-serif text-xl text-cream tracking-widest">
              TINCLE<span className="text-maroon">✦</span>
            </p>
            <p className="text-xs text-text-light tracking-widest uppercase mt-0.5">
              Admin Panel
            </p>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {[
            { label: "Overview", icon: "◈", path: "/admin" },
            { label: "Products", icon: "◇", path: "/admin/products" },
            { label: "Orders", icon: "◻", path: "/admin/orders" },
            { label: "Customers", icon: "◯", path: "/admin/customers" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate?.(item.path)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans transition-colors text-left w-full",
                window.location.pathname === item.path
                  ? "bg-maroon text-white"
                  : "text-text-light hover:bg-white/5 hover:text-cream",
              ].join(" ")}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={() => onNavigate?.("/")}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans text-text-light hover:bg-white/5 hover:text-cream transition-colors text-left w-full"
          >
            <span>↗</span> View Store
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-cream-dark px-8 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-charcoal">Orders</h1>
          <p className="text-xs text-text-light font-sans">
            {filtered.length} orders
          </p>
        </header>

        <main className="flex-1 px-8 py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "px-3 py-1.5 text-xs tracking-widest uppercase rounded-sm font-sans transition-colors",
                  statusFilter === s
                    ? "bg-maroon text-white"
                    : "border border-cream-dark text-text-mid hover:border-maroon hover:text-maroon",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white border border-cream-dark rounded-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-light text-sm">No orders found</p>
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
                    {filtered.map((order) => (
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
                          <StatusBadge status={order.paymentStatus} type="payment" />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} type="order" />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-xs text-maroon hover:underline tracking-widest uppercase"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="w-9 h-9 flex items-center justify-center border border-cream-dark rounded-sm text-text-mid hover:border-maroon hover:text-maroon transition-colors disabled:opacity-30"
              >
                ←
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={[
                    "w-9 h-9 flex items-center justify-center rounded-sm text-sm font-sans transition-colors",
                    i === page
                      ? "bg-maroon text-white"
                      : "border border-cream-dark text-text-mid hover:border-maroon hover:text-maroon",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="w-9 h-9 flex items-center justify-center border border-cream-dark rounded-sm text-text-mid hover:border-maroon hover:text-maroon transition-colors disabled:opacity-30"
              >
                →
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdate={fetchOrders}
        />
      )}
    </div>
  );
};