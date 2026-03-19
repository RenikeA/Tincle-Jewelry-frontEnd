import React, { useEffect, useState } from "react";
import { Product } from "../types/product";
import { ProductService } from "../lib/api";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { formatPrice, calcDiscountPercent, MATERIAL_LABELS } from "../lib/utils";
import { Badge, TrustBadges } from "../components/ui";
import { ProductGrid } from "../components/shop/ProductGrid";
import { ProductSummary } from "../types/product";

interface ProductDetailsPageProps {
  slug: string;
  onNavigate?: (path: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  slug,
  onNavigate,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "reviews">("description");
  const [related, setRelated] = useState<ProductSummary[]>([]);

  const { addToCart, isLoading: cartLoading, hasItem } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    ProductService.getBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p.variants.length > 0) {
          setSelectedVariantId(p.variants[0].id);
        }
        return ProductService.getRelated(p.id);
      })
      .then(setRelated)
      .catch(() => setError("Product not found"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-[72px] bg-cream">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image skeleton */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 w-20">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-cream-dark rounded-sm animate-shimmer" />
                ))}
              </div>
              <div className="flex-1 aspect-square bg-cream-dark rounded-sm animate-shimmer" />
            </div>
            {/* Info skeleton */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="h-4 w-24 bg-cream-dark rounded animate-shimmer" />
              <div className="h-10 w-3/4 bg-cream-dark rounded animate-shimmer" />
              <div className="h-6 w-32 bg-cream-dark rounded animate-shimmer" />
              <div className="h-24 w-full bg-cream-dark rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen pt-[72px] bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal mb-4">
            {error ?? "Product not found"}
          </p>
          <button
            onClick={() => onNavigate?.("/shop")}
            className="text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
          >
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  const hasDiscount = !!product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? calcDiscountPercent(product.basePrice, product.salePrice!)
    : 0;
  const displayPrice = product.salePrice ?? product.basePrice;
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const finalPrice = displayPrice + (selectedVariant?.additionalPrice ?? 0);
  const inStock = product.stockQuantity > 0;
  const alreadyInCart = hasItem(product.id);
  const wishlisted = isWishlisted(product.id);

  const productSummary: ProductSummary = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    material: product.material,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    primaryImage: product.images.find((i) => i.isPrimary) ?? product.images[0],
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    stockQuantity: product.stockQuantity,
  };

  return (
    <main className="min-h-screen pt-[72px] bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-light mb-8 font-sans">
          <button onClick={() => onNavigate?.("/")} className="hover:text-maroon transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate?.("/shop")} className="hover:text-maroon transition-colors">Shop</button>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

          {/* Images */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex flex-col gap-3 w-20 flex-shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={[
                      "w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors",
                      selectedImage === i
                        ? "border-maroon"
                        : "border-transparent hover:border-cream-dark",
                    ].join(" ")}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 aspect-square bg-cream-dark rounded-sm overflow-hidden relative">
              <img
                src={product.images[selectedImage]?.url ?? "/placeholder-jewelry.jpg"}
                alt={product.images[selectedImage]?.alt ?? product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && <Badge variant="new" />}
                {hasDiscount && (
                  <Badge variant="sale" label={`-${discountPercent}%`} />
                )}
                {product.isBestSeller && <Badge variant="bestseller" />}
                {!inStock && <Badge variant="soldout" />}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow mb-2">
                {MATERIAL_LABELS[product.material] ?? product.material}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-charcoal mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(product.averageRating)
                            ? "text-maroon"
                            : "text-cream-dark"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-text-light font-sans">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl text-charcoal">
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-text-light line-through font-sans">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-text-mid leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div>
                <p className="text-xs tracking-widest uppercase text-text-mid mb-3 font-sans">
                  {product.variants[0].size ? "Size" : "Option"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={v.stockQuantity === 0}
                      className={[
                        "px-4 py-2 text-xs font-sans border rounded-sm transition-colors",
                        selectedVariantId === v.id
                          ? "border-maroon bg-maroon text-white"
                          : "border-cream-dark text-text-mid hover:border-charcoal",
                        v.stockQuantity === 0
                          ? "opacity-40 cursor-not-allowed line-through"
                          : "",
                      ].join(" ")}
                    >
                      {v.size ?? v.color ?? v.material}
                      {v.additionalPrice > 0 && ` (+${formatPrice(v.additionalPrice)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs tracking-widest uppercase text-text-mid mb-3 font-sans">
                Quantity
              </p>
              <div className="flex items-center border border-cream-dark rounded-sm w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-text-mid hover:text-maroon transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-sans text-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.stockQuantity, q + 1)
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center text-text-mid hover:text-maroon transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {inStock && (
                <p className="text-xs text-text-light mt-2 font-sans">
                  {product.stockQuantity} pieces available
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  addToCart(productSummary, {
                    productId: product.id,
                    variantId: selectedVariantId,
                    quantity,
                  })
                }
                disabled={cartLoading || !inStock}
                className={[
                  "flex-1 py-4 text-xs tracking-widest uppercase font-sans transition-colors rounded-sm",
                  alreadyInCart
                    ? "bg-maroon-dark text-white"
                    : "bg-maroon text-white hover:bg-maroon-dark",
                  !inStock ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {!inStock
                  ? "Out of Stock"
                  : alreadyInCart
                  ? "✓ Added to Bag"
                  : cartLoading
                  ? "Adding…"
                  : "Add to Bag"}
              </button>
              <button
                onClick={() => toggleWishlist(productSummary)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={[
                  "w-14 h-14 flex items-center justify-center border rounded-sm transition-colors",
                  wishlisted
                    ? "border-maroon bg-maroon/5 text-maroon"
                    : "border-cream-dark text-text-mid hover:border-maroon hover:text-maroon",
                ].join(" ")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? "#800020" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            <TrustBadges />

            {/* Details tabs */}
            <div className="border-t border-cream-dark pt-6">
              <div className="flex gap-6 border-b border-cream-dark mb-6">
                {(["description", "care", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "pb-3 text-xs tracking-widest uppercase font-sans transition-colors",
                      activeTab === tab
                        ? "text-maroon border-b-2 border-maroon -mb-px"
                        : "text-text-light hover:text-charcoal",
                    ].join(" ")}
                  >
                    {tab === "reviews"
                      ? `Reviews (${product.reviewCount})`
                      : tab}
                  </button>
                ))}
              </div>

              {activeTab === "description" && (
                <p className="text-sm text-text-mid leading-relaxed">
                  {product.description}
                </p>
              )}

              {activeTab === "care" && (
                <p className="text-sm text-text-mid leading-relaxed">
                  {product.careInstructions ??
                    "Store in the provided jewelry pouch away from direct sunlight. Clean gently with a soft cloth. Avoid contact with perfumes, lotions, and water."}
                </p>
              )}

              {activeTab === "reviews" && (
                <div className="flex flex-col gap-6">
                  {product.reviews.length === 0 ? (
                    <p className="text-sm text-text-light">
                      No reviews yet. Be the first to review this piece.
                    </p>
                  ) : (
                    product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-cream-dark pb-6 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-charcoal">
                              {review.userName}
                            </p>
                            {review.verified && (
                              <p className="text-xs text-maroon">
                                ✓ Verified Purchase
                              </p>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review.rating
                                    ? "text-maroon text-xs"
                                    : "text-cream-dark text-xs"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-charcoal mb-1">
                          {review.title}
                        </p>
                        <p className="text-sm text-text-mid leading-relaxed">
                          {review.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <p className="eyebrow mb-3">You May Also Like</p>
              <h2 className="font-serif text-3xl font-light text-charcoal">
                Related Pieces
              </h2>
            </div>
            <ProductGrid
              products={related}
              isLoading={false}
              columns={4}
              onNavigate={(relatedSlug) =>
                onNavigate?.(`/product/${relatedSlug}`)
              }
            />
          </section>
        )}
      </div>
    </main>
  );
};