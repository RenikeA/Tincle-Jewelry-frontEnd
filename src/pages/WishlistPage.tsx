import React, { useEffect } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import { useAuthStore } from "../store/authStore";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../lib/utils";
import { useUIStore } from "../store/uiStore";

interface WishlistPageProps {
  onNavigate?: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { items, fetchWishlist, removeItem, isLoading } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addToCart } = useCart();
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-[72px] bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal mb-2">
            Sign in to view your wishlist
          </p>
          <p className="text-sm text-text-light mb-6">
            Save pieces you love and come back to them anytime.
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
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">My Account</p>
          <h1 className="font-serif text-4xl font-light text-charcoal">
            Wishlist
          </h1>
          <p className="text-sm text-text-light mt-2">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? "piece" : "pieces"} saved`
              : `Welcome, ${user?.firstName}. Save pieces you love.`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-6xl opacity-10">♡</span>
            <p className="font-serif text-2xl text-charcoal font-light">
              Your wishlist is empty
            </p>
            <p className="text-sm text-text-light max-w-xs">
              Browse our collections and save pieces you love by clicking
              the heart icon.
            </p>
            <button
              onClick={() => onNavigate?.("/shop")}
              className="mt-2 text-xs tracking-widest uppercase border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition-colors rounded-sm"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-cream-dark rounded-sm overflow-hidden hover:border-maroon/30 hover:shadow-soft transition-all duration-300 group"
              >
                {/* Image */}
                <div
                  className="aspect-[3/4] overflow-hidden bg-cream-dark cursor-pointer relative"
                  onClick={() =>
                    onNavigate?.(`/product/${item.productSlug}`)
                  }
                >
                  <img
                    src={item.productImage ?? "/placeholder-jewelry.jpg"}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {item.productSalePrice && (
                    <span className="absolute top-3 left-3 bg-maroon text-white text-xs px-2 py-1 rounded-sm tracking-widest uppercase">
                      Sale
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3
                    className="font-serif text-lg text-charcoal mb-1 cursor-pointer hover:text-maroon transition-colors"
                    onClick={() =>
                      onNavigate?.(`/product/${item.productSlug}`)
                    }
                  >
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm font-sans text-charcoal">
                      {formatPrice(
                        item.productSalePrice ?? item.productPrice
                      )}
                    </p>
                    {item.productSalePrice && (
                      <p className="text-xs text-text-light line-through font-sans">
                        {formatPrice(item.productPrice)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(
                          {
                            id: item.productId,
                            slug: item.productSlug,
                            name: item.productName,
                            category: "rings",
                            material: "18k_gold",
                            basePrice: item.productPrice,
                            salePrice: item.productSalePrice,
                            primaryImage: {
                              id: "",
                              url: item.productImage,
                              alt: item.productName,
                              isPrimary: true,
                            },
                            averageRating: 0,
                            reviewCount: 0,
                            isBestSeller: false,
                            isNewArrival: false,
                            stockQuantity: 1,
                          },
                          { productId: item.productId, quantity: 1 }
                        );
                      }}
                      className="flex-1 py-2.5 bg-maroon text-white text-xs tracking-widest uppercase font-sans hover:bg-maroon-dark transition-colors rounded-sm"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={async () => {
                        await removeItem(item.productId);
                        addToast({
                          type: "info",
                          message: `${item.productName} removed from wishlist`,
                        });
                      }}
                      aria-label="Remove from wishlist"
                      className="w-10 h-10 flex items-center justify-center border border-cream-dark rounded-sm text-text-light hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue shopping */}
        {items.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate?.("/shop")}
              className="text-xs tracking-widest uppercase border border-cream-dark text-text-mid px-8 py-3 hover:border-maroon hover:text-maroon transition-colors rounded-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </main>
  );
};