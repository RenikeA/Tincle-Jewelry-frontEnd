import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../lib/apiClient";
import { formatDate } from "../../lib/utils";

interface AdminCustomersPageProps {
  onNavigate?: (path: string) => void;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
}) => {
  const formatPrice = (kobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(kobo / 100);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-5">
      <div className="bg-white rounded-sm w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark">
          <h3 className="font-serif text-xl text-charcoal">
            Customer Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-cream-dark hover:bg-cream-dark transition-colors text-text-mid"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-maroon/10 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-xl text-maroon">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-serif text-lg text-charcoal">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-xs text-text-light">{customer.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 bg-cream-dark rounded-sm p-4">
            <div>
              <p className="text-xs text-text-light mb-1">Phone</p>
              <p className="text-sm text-charcoal font-sans">
                {customer.phone ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Role</p>
              <span
                className={[
                  "text-xs px-2 py-1 rounded-sm font-sans",
                  customer.role === "ADMIN"
                    ? "bg-maroon/10 text-maroon"
                    : "bg-green-100 text-green-700",
                ].join(" ")}
              >
                {customer.role}
              </span>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Joined</p>
              <p className="text-sm text-charcoal font-sans">
                {formatDate(customer.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Total Orders</p>
              <p className="text-sm text-charcoal font-sans">
                {customer.orderCount}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-light mb-1">Total Spent</p>
              <p className="font-serif text-xl text-charcoal">
                {formatPrice(customer.totalSpent)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 border border-cream-dark text-text-mid text-xs tracking-widest uppercase rounded-sm hover:border-charcoal transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    setIsLoading(true);
    apiClient
      .get(`/admin/customers?page=${page}&size=15`)
      .then((res) => {
        setCustomers(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page, user]);

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen pt-[72px] flex items-center justify-center">
        <p className="font-serif text-2xl text-charcoal">Access Denied</p>
      </main>
    );
  }

  const filtered = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-charcoal-soft min-h-screen flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <button
            onClick={() => onNavigate?.("/admin")}
            className="text-left"
          >
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

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-cream-dark px-8 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-charcoal">Customers</h1>
          <p className="text-xs text-text-light font-sans">
            {filtered.length} customers
          </p>
        </header>

        <main className="flex-1 px-8 py-8">
          {/* Search */}
          <div className="mb-6">
            <input
              className="w-full max-w-sm border border-cream-dark rounded-sm px-4 py-3 text-sm font-sans text-charcoal bg-transparent focus:outline-none focus:border-maroon transition-colors placeholder:text-text-light"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-cream-dark rounded-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-light text-sm">
                  {search ? "No customers match your search" : "No customers yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-dark">
                      {[
                        "Customer",
                        "Email",
                        "Phone",
                        "Joined",
                        "Orders",
                        "Role",
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
                    {filtered.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-cream-dark last:border-0 hover:bg-cream/50 transition-colors"
                      >
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-maroon/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-serif text-maroon">
                                {customer.firstName[0]}
                                {customer.lastName[0]}
                              </span>
                            </div>
                            <p className="text-sm font-sans text-charcoal font-medium">
                              {customer.firstName} {customer.lastName}
                            </p>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4 text-sm font-sans text-text-mid">
                          {customer.email}
                        </td>
                        {/* Phone */}
                        <td className="px-6 py-4 text-sm font-sans text-text-mid">
                          {customer.phone ?? "—"}
                        </td>
                        {/* Joined */}
                        <td className="px-6 py-4 text-sm font-sans text-text-mid">
                          {formatDate(customer.createdAt)}
                        </td>
                        {/* Orders */}
                        <td className="px-6 py-4 text-sm font-sans text-charcoal">
                          {customer.orderCount}
                        </td>
                        {/* Role */}
                        <td className="px-6 py-4">
                          <span
                            className={[
                              "text-xs px-2 py-1 rounded-sm font-sans",
                              customer.role === "ADMIN"
                                ? "bg-maroon/10 text-maroon"
                                : "bg-green-100 text-green-700",
                            ].join(" ")}
                          >
                            {customer.role}
                          </span>
                        </td>
                        {/* Action */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
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

          {/* Pagination */}
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

      {/* Customer detail modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};