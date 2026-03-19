import React, { useEffect, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../lib/utils";
import { CartItem } from "../../types/cart";

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const CartItemRow: React.FC<{
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string, name: string) => void;
}> = ({ item, onUpdate, onRemove }) => (
  <div className="flex gap-4 py-5 border-b border-cream-dark last:border-0">
    {/* Image */}
    <div className="w-20 h-24 flex-shrink-0 rounded-sm overflow-hidden bg-cream-dark">
      <img
        src={item.product.primaryImage?.url ?? "/placeholder-jewelry.jpg"}
        alt={item.product.name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Details */}
    <div className="flex-1 flex flex-col justify-between min-w-0">
      <div>
        <h4 className="font-serif text-sm text-charcoal leading-snug truncate">
          {item.product.name}
        </h4>
        {item.variant && (
          <p className="text-xs text-text-light mt-0.5">
            {[item.variant.size, item.variant.color]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="text-xs font-sans text-charcoal mt-1">
          {formatPrice(item.unitPrice)}
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center border border-cream-dark rounded-sm">
          <button
            onClick={() => onUpdate(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center text-text-mid hover:text-maroon disabled:opacity-30 transition-colors text-lg"
          >
            −
          </button>
          <span className="w-8 text-center text-xs font-sans text-charcoal">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdate(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stockQuantity}
            className="w-7 h-7 flex items-center justify-center text-text-mid hover:text-maroon disabled:opacity-30 transition-colors text-lg"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id, item.product.name)}
          aria-label="Remove item"
          className="text-text-light hover:text-red-500 transition-colors p-1"
        >
          <TrashIcon />
        </button>
      </div>
    </div>

    {/* Total */}
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-sans text-charcoal">
        {formatPrice(item.totalPrice)}
      </p>
    </div>
  </div>
);

interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>;
  onRemove: () => void;
  appliedCode?: string;
}

const CouponInput: React.FC<CouponInputProps> = ({
  onApply,
  onRemove,
  appliedCode,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const success = await onApply(code.trim().toUpperCase());
    if (success) setCode("");
    setLoading(false);
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-maroon/5 border border-maroon/20 rounded-sm px-4 py-2.5">
        <div>
          <p className="text-xs text-text-light">Coupon applied</p>
          <p className="text-sm font-sans text-maroon font-medium">
            {appliedCode}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-text-light hover:text-red-500 transition-colors underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        placeholder="Coupon code"
        className="flex-1 border border-cream-dark rounded-sm px-3 py-2 text-xs font-sans text-charcoal placeholder:text-text-light focus:outline-none focus:border-maroon transition-colors bg-transparent"
      />
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="px-4 py-2 text-xs tracking-widest uppercase font-sans bg-charcoal text-cream hover:bg-maroon transition-colors rounded-sm disabled:opacity-50"
      >
        {loading ? "…" : "Apply"}
      </button>
    </div>
  );
};

interface CartDrawerProps {
  onCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cart,
    isDrawerOpen,
    isLoading,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    applyDiscount,
    removeCoupon,
  } = useCart();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[600]",
          "transition-opacity duration-400",
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={[
          "fixed top-0 right-0 bottom-0 z-[601]",
          "w-full max-w-md bg-cream shadow-2xl",
          "flex flex-col transition-transform duration-500",
          isDrawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark">
          <div>
            <h2 className="font-serif text-xl text-charcoal">Your Bag</h2>
            {!isEmpty && (
              <p className="text-xs text-text-light mt-0.5">
                {cart?.itemCount} {cart?.itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-cream-dark hover:bg-cream-dark transition-colors text-text-mid"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <span className="text-6xl opacity-10">◇</span>
              <p className="font-serif text-xl text-charcoal font-light">
                Your bag is empty
              </p>
              <p className="text-sm text-text-light text-center">
                Discover our handcrafted collections and find something
                beautiful.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-2 text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
              >
                Explore Collections
              </button>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-cream-dark px-6 py-5 flex flex-col gap-4">
            {/* Coupon */}
            <CouponInput
              onApply={applyDiscount}
              onRemove={removeCoupon}
              appliedCode={cart?.couponCode}
            />

            {/* Summary */}
            <div className="flex flex-col gap-1.5 text-sm font-sans">
              <div className="flex justify-between text-text-mid">
                <span>Subtotal</span>
                <span>{formatPrice(cart?.subtotal ?? 0)}</span>
              </div>
              {(cart?.discount ?? 0) > 0 && (
                <div className="flex justify-between text-maroon">
                  <span>Discount</span>
                  <span>− {formatPrice(cart?.discount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-light text-xs">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-medium text-charcoal text-base pt-2 border-t border-cream-dark mt-1">
                <span>Total</span>
                <span>{formatPrice(cart?.total ?? 0)}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-maroon text-white text-xs tracking-widest uppercase font-sans hover:bg-maroon-dark transition-colors rounded-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            <p className="text-center text-xs text-text-light">
              Secure checkout · SSL encrypted
            </p>
          </div>
        )}
      </div>
    </>
  );
};