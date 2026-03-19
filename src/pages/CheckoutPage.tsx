import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ShippingAddress, PaymentProvider } from "../types/cart";
import { formatPrice, isValidEmail, isValidNigerianPhone } from "../lib/utils";
import { TrustBadges } from "../components/ui";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
  "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs tracking-widest uppercase text-text-mid font-sans">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-transparent",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

const ShippingForm: React.FC<{
  onSubmit: (address: ShippingAddress, provider: PaymentProvider) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });
  const [provider, setProvider] = useState<PaymentProvider>("PAYSTACK");
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!isValidEmail(form.email)) e.email = "Valid email required";
    if (!isValidNigerianPhone(form.phone)) e.phone = "Valid Nigerian phone required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state) e.state = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form, provider);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif text-2xl font-light text-charcoal">
        Shipping Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName}>
          <input
            className={inputClass}
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="Adaeze"
          />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input
            className={inputClass}
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="Okonkwo"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={set("email")}
            placeholder="adaeze@email.com"
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={set("phone")}
            placeholder="08012345678"
          />
        </Field>
      </div>

      <Field label="Address Line 1" error={errors.addressLine1}>
        <input
          className={inputClass}
          value={form.addressLine1}
          onChange={set("addressLine1")}
          placeholder="12 Adeola Odeku Street"
        />
      </Field>

      <Field label="Address Line 2 (Optional)">
        <input
          className={inputClass}
          value={form.addressLine2}
          onChange={set("addressLine2")}
          placeholder="Apartment, suite, etc."
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="City" error={errors.city}>
          <input
            className={inputClass}
            value={form.city}
            onChange={set("city")}
            placeholder="Lagos"
          />
        </Field>
        <Field label="State" error={errors.state}>
          <select
            className={inputClass}
            value={form.state}
            onChange={set("state")}
            aria-label="Select Nigerian state"
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Postal Code">
          <input
            className={inputClass}
            value={form.postalCode}
            onChange={set("postalCode")}
            placeholder="100001"
          />
        </Field>
      </div>

      {/* Payment provider */}
      <div>
        <p className="text-xs tracking-widest uppercase text-text-mid mb-3 font-sans">
          Payment Method
        </p>
        <div className="flex gap-3">
          {(["PAYSTACK", "FLUTTERWAVE"] as PaymentProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={[
                "flex-1 py-3 px-4 rounded-sm border text-sm font-sans transition-colors",
                provider === p
                  ? "border-maroon bg-maroon/5 text-maroon"
                  : "border-cream-dark text-text-mid hover:border-charcoal",
              ].join(" ")}
            >
              {p === "PAYSTACK" ? "Paystack" : "Flutterwave"}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-4 bg-maroon text-white text-xs tracking-widest uppercase font-sans hover:bg-maroon-dark transition-colors rounded-sm disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Order…
          </span>
        ) : (
          "Continue to Payment"
        )}
      </button>
    </div>
  );
};

const OrderConfirmed: React.FC<{
  orderNumber: string;
  total: number;
  onContinue: () => void;
}> = ({ orderNumber, total, onContinue }) => (
  <div className="flex flex-col items-center text-center gap-6 py-12">
    <div className="w-20 h-20 rounded-full bg-maroon/10 flex items-center justify-center">
      <span className="text-maroon text-3xl">✓</span>
    </div>
    <div>
      <h2 className="font-serif text-3xl font-light text-charcoal mb-2">
        Order Confirmed
      </h2>
      <p className="text-text-light text-sm">
        Thank you for your purchase. We'll begin preparing your order shortly.
      </p>
    </div>
    <div className="bg-cream-dark rounded-sm px-8 py-5 w-full max-w-sm">
      <div className="flex justify-between text-sm font-sans mb-2">
        <span className="text-text-mid">Order Number</span>
        <span className="text-charcoal font-medium">{orderNumber}</span>
      </div>
      <div className="flex justify-between text-sm font-sans">
        <span className="text-text-mid">Total Paid</span>
        <span className="text-charcoal font-medium">{formatPrice(total)}</span>
      </div>
    </div>
    <p className="text-xs text-text-light">
      A confirmation email has been sent to your inbox.
    </p>
    <button
      onClick={onContinue}
      className="text-xs tracking-widest uppercase border border-maroon text-maroon px-8 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
    >
      Continue Shopping
    </button>
  </div>
);

export const CheckoutPage: React.FC<{
  onNavigate?: (path: string) => void;
}> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<"shipping" | "payment" | "confirmed" | "failed">("shipping");
  const [order, setOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<{ items: Array<{ id: string; product: { name: string; primaryImage?: { url: string } }; quantity: number; totalPrice: number }>; subtotal: number; discount: number; total: number } | null>(null);

  const reset = () => {
    setStep("shipping");
    setOrder(null);
    setError("");
  };

  const createOrder = async (address: ShippingAddress, provider: import("../types/cart").PaymentProvider) => {
    return true;
  };

  const submitPayment = async (provider: import("../types/cart").PaymentProvider) => {
    return true;
  };

  const handleShippingSubmit = async (
    address: ShippingAddress,
    provider: import("../types/cart").PaymentProvider
  ) => {
    const created = await createOrder(address, provider);
    if (created) await submitPayment(provider);
  };

  const handleContinueShopping = () => {
    reset();
    onNavigate?.("/shop");
  };

  return (
    <main className="min-h-screen pt-[72px] bg-cream">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-12">
        {/* Step indicator */}
        {step !== "confirmed" && (
          <div className="flex items-center gap-3 mb-10">
            {["shipping", "payment", "confirmed"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={[
                    "flex items-center gap-2",
                    step === s ? "text-charcoal" : "text-text-light",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans",
                      step === s
                        ? "bg-maroon text-white"
                        : "bg-cream-dark text-text-light",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs tracking-widest uppercase hidden sm:block">
                    {s}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-px bg-cream-dark max-w-[60px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {!user && step === "shipping" && (
  <div className="bg-maroon/5 border border-maroon/20 rounded-sm px-5 py-4 mb-8 flex items-center justify-between">
    <p className="text-sm text-text-mid">
      Already have an account?{" "}
      <button
        onClick={() => onNavigate?.("/login")}
        className="text-maroon hover:underline"
      >
        Sign in
      </button>{" "}
      for faster checkout.
    </p>
    <span className="text-xs text-text-light">Or continue as guest</span>
  </div>
)}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left */}
          <div>
            {step === "confirmed" && order ? (
              <OrderConfirmed
                orderNumber={order.orderNumber}
                total={order.total}
                onContinue={handleContinueShopping}
              />
            ) : step === "failed" ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <span className="text-5xl">✕</span>
                <h2 className="font-serif text-2xl text-charcoal">
                  Something went wrong
                </h2>
                <p className="text-sm text-text-light max-w-sm">{error}</p>
                <button
                  onClick={reset}
                  className="text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ShippingForm
                onSubmit={handleShippingSubmit}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right — Order summary */}
          {step !== "confirmed" && cart && (
            <aside className="hidden lg:block">
              <div className="bg-cream-dark rounded-sm p-6 sticky top-24">
                <h3 className="font-serif text-lg text-charcoal mb-5">
                  Order Summary
                </h3>
                <div className="flex flex-col gap-4 mb-5">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-16 rounded-sm overflow-hidden bg-cream flex-shrink-0">
                        <img
                          src={
                            item.product.primaryImage?.url ??
                            "/placeholder-jewelry.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif text-charcoal truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-text-light">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-sans text-charcoal flex-shrink-0">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream pt-4 flex flex-col gap-2 text-sm font-sans">
                  <div className="flex justify-between text-text-mid">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-maroon">
                      <span>Discount</span>
                      <span>− {formatPrice(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-charcoal text-base pt-2 border-t border-cream mt-1">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>
                <div className="mt-5">
                  <TrustBadges />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
};