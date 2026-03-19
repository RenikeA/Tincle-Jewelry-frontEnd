import React from "react";
import { useUIStore } from "../../store/uiStore";

// ---- BUTTON ----
type ButtonVariant = "primary" | "secondary" | "gold" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-charcoal text-cream hover:bg-maroon-dark",
  secondary: "border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream",
  gold: "bg-maroon text-white hover:bg-maroon-dark shadow-maroon",
  ghost: "text-charcoal hover:text-maroon",
  outline: "border border-maroon text-maroon hover:bg-maroon hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-4 py-2 tracking-widest",
  md: "text-xs px-7 py-3 tracking-widest",
  lg: "text-sm px-9 py-4 tracking-widest",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...rest
}) => (
  <button
    className={[
      "inline-flex items-center justify-center gap-2 font-sans uppercase rounded-sm transition-all duration-300",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon",
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    disabled={disabled || isLoading}
    {...rest}
  >
    {isLoading ? (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      leftIcon
    )}
    {children}
    {!isLoading && rightIcon}
  </button>
);

// ---- BADGE ----
type BadgeVariant = "new" | "sale" | "bestseller" | "soldout";

const badgeConfig: Record<BadgeVariant, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-charcoal text-cream" },
  sale: { label: "Sale", classes: "bg-maroon text-white" },
  bestseller: { label: "Best Seller", classes: "bg-maroon-dark text-white" },
  soldout: { label: "Sold Out", classes: "bg-gray-400 text-white" },
};

export const Badge: React.FC<{
  variant: BadgeVariant;
  label?: string;
  className?: string;
}> = ({ variant, label, className = "" }) => {
  const { label: defaultLabel, classes } = badgeConfig[variant];
  return (
    <span
      className={[
        "inline-block text-xs font-sans tracking-widest uppercase px-2 py-1 rounded-sm",
        classes,
        className,
      ].join(" ")}
    >
      {label ?? defaultLabel}
    </span>
  );
};

// ---- GLASS CARD ----
export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = "", hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={[
      "backdrop-blur-md bg-white/55 border border-white/20 rounded-xl shadow-soft",
      hover
        ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-maroon cursor-pointer"
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </div>
);

// ---- SKELETON ----
export const Skeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={[
      "animate-shimmer bg-gradient-to-r from-cream-dark via-cream to-cream-dark bg-[length:200%_100%] rounded",
      className,
    ].join(" ")}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="w-full aspect-[3/4] rounded-sm" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-4 w-1/4" />
  </div>
);

// ---- TRUST BADGES ----
const trustItems = [
  { icon: "🔒", label: "Secure Payment" },
  { icon: "✦", label: "Ethically Sourced" },
  { icon: "🚚", label: "Free Delivery over ₦50K" },
  { icon: "↩", label: "14-Day Returns" },
];

export const TrustBadges: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={["flex flex-wrap gap-4", className].join(" ")}>
    {trustItems.map((item) => (
      <div
        key={item.label}
        className="flex items-center gap-2 text-xs text-text-light"
      >
        <span className="text-maroon">{item.icon}</span>
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

// ---- WHATSAPP BUTTON ----
export const WhatsAppButton: React.FC<{ phone: string }> = ({ phone }) => (
  <a
    href={`https://wa.me/${phone}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  </a>
);

// ---- TOAST CONTAINER ----
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "flex items-center justify-between gap-4 px-5 py-4 rounded-lg shadow-xl text-sm font-sans animate-slideUp",
            toast.type === "success"
              ? "bg-charcoal text-cream"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "warning"
              ? "bg-amber-500 text-white"
              : "bg-maroon text-white",
          ].join(" ")}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};