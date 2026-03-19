import React, { useState, useCallback } from "react";
import { ProductSummary } from "../../types/product";
import { Badge } from "../ui";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useUIStore } from "../../store/uiStore";
import {
  formatPrice,
  calcDiscountPercent,
  MATERIAL_LABELS,
} from "../../lib/utils";

interface ProductCardProps {
  product: ProductSummary;
  onNavigate?: (slug: string) => void;
  priority?: boolean;
}

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "#800020" : "none"}
    stroke={filled ? "#800020" : "currentColor"}
    strokeWidth={1.5}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  priority = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { addToCart, isLoading: cartLoading, hasItem } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const openQuickView = useUIStore((s) => s.openQuickView);

  const alreadyInCart = hasItem(product.id);
  const wishlisted = isWishlisted(product.id);
  const hasDiscount =
    !!product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? calcDiscountPercent(product.basePrice, product.salePrice!)
    : 0;

  const primaryImage =
    product.primaryImage?.url ?? "/placeholder-jewelry.jpg";

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product, { productId: product.id, quantity: 1 });
    },
    [addToCart, product]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleWishlist(product);
    },
    [toggleWishlist, product]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openQuickView(product);
    },
    [openQuickView, product]
  );

  return (
    <article
      className="group relative flex flex-col cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate?.(product.slug)}
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-cream-dark rounded-sm mb-4">
        <img
          src={imageError ? "/placeholder-jewelry.jpg" : primaryImage}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onError={() => setImageError(true)}
          className={[
            "absolute inset-0 w-full h-full object-cover transition-all duration-700",
            isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100",
          ].join(" ")}
        />
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className={[
            "absolute inset-0 w-full h-full object-cover transition-all duration-700",
            isHovered ? "scale-100 opacity-100" : "scale-105 opacity-0",
          ].join(" ")}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNewArrival && <Badge variant="new" />}
          {hasDiscount && (
            <Badge variant="sale" label={`-${discountPercent}%`} />
          )}
          {product.isBestSeller && <Badge variant="bestseller" />}
          {product.stockQuantity === 0 && <Badge variant="soldout" />}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className={[
            "absolute top-3 right-3 z-10 w-9 h-9 rounded-full",
            "flex items-center justify-center",
            "bg-white/80 backdrop-blur-sm border border-white/30",
            "transition-all duration-300 hover:bg-white",
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1",
          ].join(" ")}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Actions */}
        <div
          className={[
            "absolute bottom-0 left-0 right-0 p-3 flex gap-2",
            "transition-all duration-400",
            isHovered ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
        >
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || product.stockQuantity === 0}
            className={[
              "flex-1 py-3 text-xs font-sans tracking-widest uppercase",
              "transition-colors duration-200 rounded-sm",
              alreadyInCart
                ? "bg-maroon text-white"
                : "bg-charcoal text-cream hover:bg-maroon-dark",
              product.stockQuantity === 0
                ? "opacity-50 cursor-not-allowed"
                : "",
            ].join(" ")}
          >
            {product.stockQuantity === 0
              ? "Out of Stock"
              : alreadyInCart
              ? "In Bag ✓"
              : "Add to Bag"}
          </button>
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className={[
              "w-10 h-10 rounded-sm flex items-center justify-center",
              "bg-white/80 backdrop-blur-sm border border-white/30",
              "hover:bg-white text-charcoal transition-colors",
            ].join(" ")}
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <p className="text-[0.65rem] tracking-widest uppercase text-text-light mb-1">
          {MATERIAL_LABELS[product.material] ?? product.material}
        </p>
        <h3 className="font-serif text-[1.05rem] font-normal text-charcoal mb-1.5 leading-snug">
          {product.name}
        </h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.round(product.averageRating)
                      ? "text-maroon text-xs"
                      : "text-cream-dark text-xs"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[0.65rem] text-text-light">
              ({product.reviewCount})
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-sans text-charcoal font-normal">
            {formatPrice(product.salePrice ?? product.basePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-text-light line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};