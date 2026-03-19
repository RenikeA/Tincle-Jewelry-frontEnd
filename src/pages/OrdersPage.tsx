import React, { useEffect, useState } from "react";
import { OrderService } from "../lib/api";
import { OrderSummaryDTO, Order } from "../types/cart";
import { formatPrice, formatDate } from "../lib/utils";
import { useAuthStore } from "../store/authStore";

interface OrdersPageProps {
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

const StatusBadge: React.FC<{
  status: string;
  type?: "order" | "payment";
}> = ({ status, type = "order" }) => {
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

// ---- ORDER DETAIL MODAL ----
const OrderDetailModal: React.FC<{
  orderId: string;
  onClose: () => void;
}> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    OrderService.getOrder(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orderId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-5">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
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
            {/* Order info */}
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
              {order.estimatedDelivery && (
                <div className="col-span-2">
                  <p className="text-xs text-text-light mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-charcoal font-sans">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs tracking-widest uppercase text-text-light mb-4 font-sans">
                Items Ordered
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
                        Qty: {item.quantity} ×{" "}
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-sans text-charcoal flex-shrink-0">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
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
              </div>
            </div>

            {/* Summary */}
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

// ---- MAIN PAGE ----
export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    OrderService.getMyOrders(page, 10)
      .then((data) => {
        setOrders(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, page]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-[72px] bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal mb-2">
            Sign in to view your orders
          </p>
          <p className="text-sm text-text-light mb-6">
            You need to be logged in to see your order history.
          </p>
          <button
            onClick={() => onNavigate?.("/login")}
            className="text-xs tracking-widest uppercase bg-maroon text-white px-8 py-3 hover:bg-maroon-dark transition-colors rounded-sm"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-[72px] bg-cream">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">My Account</p>
          <h1 className="font-serif text-4xl font-light text-charcoal">
            Order History
          </h1>
          <p className="text-sm text-text-light mt-2">
            Welcome back, {user?.firstName}. Here are your orders.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-6xl opacity-10">◻</span>
            <p className="font-serif text-2xl text-charcoal font-light">
              No orders yet
            </p>
            <p className="text-sm text-text-light max-w-xs">
              When you place an order it will appear here.
            </p>
            <button
              onClick={() => onNavigate?.("/shop")}
              className="mt-2 text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Orders list */}
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-cream-dark rounded-sm p-6 hover:border-maroon/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-charcoal font-sans">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-text-light font-sans">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-text-light font-sans">
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-serif text-lg text-charcoal">
                        {formatPrice(order.total)}
                      </p>
                      <div className="flex gap-2">
                        <StatusBadge
                          status={order.paymentStatus}
                          type="payment"
                        />
                        <StatusBadge status={order.status} type="order" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-cream-dark flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="text-xs text-maroon hover:underline tracking-widest uppercase"
                    >
                      View Details
                    </button>
                    {order.status === "PENDING" && (
                      <button
                        onClick={async () => {
                          await OrderService.cancelOrder(order.id);
                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === order.id
                                ? { ...o, status: "CANCELLED" }
                                : o
                            )
                          );
                        }}
                        className="text-xs text-red-500 hover:underline tracking-widest uppercase"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
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
          </>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </main>
  );
};