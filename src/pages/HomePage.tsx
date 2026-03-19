import React, { useEffect, useState } from "react";
import { ProductService } from "../lib/api";
import { ProductSummary } from "../types/product";
import { ProductCard } from "../components/shop/ProductCard";

interface HomePageProps {
  onNavigate?: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {

  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductSummary[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   Promise.all([
  ProductService.getFeatured(),
  ProductService.getBestSellers(),
  ProductService.getNewArrivals(),
])
  .then(([f, b, n]) => {
    setFeatured(f);
    setBestsellers(b);
    setNewArrivals(n);
  })
  .catch(() => {})
  .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-cream via-cream to-cream-dark opacity-50" />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <p className="eyebrow">Handcrafted Luxury</p>
          <h1 className="font-serif text-6xl md:text-8xl font-light text-charcoal leading-none">
            TINCLE<span className="text-maroon">✦</span>
          </h1>
          <p className="text-text-light text-lg max-w-md leading-relaxed">
            Timeless jewelry crafted for the modern woman. Each piece tells
            a story of elegance and precision.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <button
              onClick={() => onNavigate?.("/shop")}
              className="text-xs tracking-widest uppercase bg-maroon text-white px-10 py-4 rounded-sm hover:bg-maroon-dark transition-opacity"
            >
              Explore Collection
            </button>
            <button
              onClick={() => onNavigate?.("/shop")}
              className="text-xs tracking-widest uppercase border border-charcoal text-charcoal px-10 py-4 rounded-sm hover:bg-charcoal hover:text-cream transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 md:px-10 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Browse By</p>
          <h2 className="font-serif text-4xl font-light text-charcoal">
            Collections
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Rings", icon: "◯", path: "/shop?category=rings" },
            { label: "Necklaces", icon: "◇", path: "/shop?category=necklaces" },
            { label: "Earrings", icon: "◈", path: "/shop?category=earrings" },
            { label: "Bracelets", icon: "◻", path: "/shop?category=bracelets" },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => onNavigate?.(cat.path)}
              className="bg-white border border-cream-dark rounded-sm p-8 flex flex-col items-center gap-3 hover:border-maroon hover:shadow-soft transition-all duration-300 group"
            >
              <span className="text-3xl text-maroon/30 group-hover:text-maroon/60 transition-colors">
                {cat.icon}
              </span>
              <p className="font-serif text-lg text-charcoal">{cat.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {!isLoading && featured.length > 0 && (
        <section className="px-5 md:px-10 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="eyebrow mb-3">Handpicked</p>
                <h2 className="font-serif text-4xl font-light text-charcoal">
                  Featured Pieces
                </h2>
              </div>
              <button
                onClick={() => onNavigate?.("/shop")}
                className="text-xs tracking-widest uppercase text-maroon hover:underline hidden md:block"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {!isLoading && bestsellers.length > 0 && (
        <section className="px-5 md:px-10 py-20 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-3">Most Loved</p>
              <h2 className="font-serif text-4xl font-light text-charcoal">
                Best Sellers
              </h2>
            </div>
            <button
              onClick={() => onNavigate?.("/shop")}
              className="text-xs tracking-widest uppercase text-maroon hover:underline hidden md:block"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {!isLoading && newArrivals.length > 0 && (
        <section className="px-5 md:px-10 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="eyebrow mb-3">Just In</p>
                <h2 className="font-serif text-4xl font-light text-charcoal">
                  New Arrivals
                </h2>
              </div>
              <button
                onClick={() => onNavigate?.("/shop")}
                className="text-xs tracking-widest uppercase text-maroon hover:underline hidden md:block"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Tincle */}
      <section className="px-5 md:px-10 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Why Choose Us</p>
          <h2 className="font-serif text-4xl font-light text-charcoal">
            The Tincle Promise
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "◇",
              title: "Authentic Materials",
              desc: "Every piece crafted from certified gold, silver and genuine gemstones.",
            },
            {
              icon: "◈",
              title: "Handcrafted",
              desc: "Each jewelry piece is carefully made by skilled artisans.",
            },
            {
              icon: "◯",
              title: "Free Delivery",
              desc: "Complimentary delivery on all orders above ₦50,000.",
            },
            {
              icon: "◻",
              title: "Easy Returns",
              desc: "Not satisfied? Return within 14 days for a full refund.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-4 p-6"
            >
              <span className="text-3xl text-maroon/40">{item.icon}</span>
              <h3 className="font-serif text-lg text-charcoal">{item.title}</h3>
              <p className="text-sm text-text-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-charcoal-soft px-5 py-20">
        <div className="max-w-xl mx-auto text-center flex flex-col gap-6">
          <p className="eyebrow text-text-light">Stay Connected</p>
          <h2 className="font-serif text-4xl font-light text-cream">
            Join the Tincle Circle
          </h2>
          <p className="text-text-light text-sm">
            Be first to know about new collections, exclusive offers and
            jewelry care tips.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-sm text-cream placeholder:text-text-light focus:outline-none focus:border-maroon transition-colors"
            />
            <button
              onClick={() => onNavigate?.("/shop")}
              className="px-6 py-3 bg-maroon text-white text-xs tracking-widest uppercase rounded-sm hover:bg-maroon-dark transition-opacity"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};