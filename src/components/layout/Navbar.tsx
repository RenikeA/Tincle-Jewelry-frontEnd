import React, { useState, useEffect } from "react";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
];

interface NavbarProps {
  onNavigate?: (href: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openDrawer);
  const { toggleTheme, theme } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.count());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigate = (href: string) => {
    onNavigate?.(href);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-[500] h-[72px]",
          "flex items-center justify-between",
          "px-5 md:px-10 lg:px-20",
          "transition-all duration-500",
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-maroon/10"
            : "bg-transparent",
        ].join(" ")}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="font-serif text-2xl font-medium tracking-[0.12em] text-charcoal"
        >
          TINCLE<span className="text-maroon">✦</span>
        </button>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => navigate(link.href)}
                className={[
                  "text-[0.7rem] font-sans tracking-[0.2em] uppercase text-text-mid",
                  "relative pb-0.5 transition-colors hover:text-charcoal",
                  "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-maroon",
                  "after:transition-all after:duration-400 hover:after:w-full",
                ].join(" ")}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            aria-label="Wishlist"
            className="relative text-text-mid hover:text-maroon transition-colors hidden sm:block"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-maroon text-white text-[0.55rem] flex items-center justify-center font-sans">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => navigate(isAuthenticated ? "/account" : "/login")}
            aria-label="Account"
            className="text-text-mid hover:text-maroon transition-colors hidden sm:block"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label={`Cart (${cartItemCount} items)`}
            className="relative text-text-mid hover:text-maroon transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-maroon text-white text-[0.55rem] flex items-center justify-center font-sans">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-6 rounded-full relative transition-colors bg-maroon border-2 border-maroon"
>
         <span
      className={[
        "absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 bg-white",
         theme === "dark" ? "left-[18px]" : "left-0.5",
     ].join(" ")}
/>
            <span
              className={[
                "absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300",
                theme === "dark"
                  ? "left-[18px] bg-white"
                  : "left-0.5 bg-cream",
              ].join(" ")}
            />
          </button>

          {/* Hamburger */}

          <button
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="lg:hidden flex flex-col gap-[5px] w-6"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={[
                  "block h-px bg-charcoal transition-all duration-350 origin-left",
                  mobileOpen && i === 0 ? "rotate-45" : "",
                  mobileOpen && i === 1 ? "opacity-0 scale-x-0" : "",
                  mobileOpen && i === 2 ? "-rotate-45" : "",
                ].join(" ")}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={[
          "fixed inset-0 z-[498] bg-black/30 backdrop-blur-sm",
          "transition-opacity duration-400",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu */}
      <div
        className={[
          "fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-cream z-[499]",
          "flex flex-col pt-24 px-8 pb-8 shadow-2xl",
          "transition-transform duration-500",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <nav>
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className="block w-full text-left font-serif text-3xl font-light text-charcoal border-b border-cream-dark py-4 hover:text-maroon hover:pl-4 transition-all duration-300"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={() => navigate("/wishlist")}
            className="text-sm text-text-mid hover:text-maroon transition-colors text-left"
          >
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </button>
          <button
            onClick={() =>
              navigate(isAuthenticated ? "/account" : "/login")
            }
            className="text-sm text-text-mid hover:text-maroon transition-colors text-left"
          >
            {isAuthenticated ? "My Account" : "Sign In"}
          </button>
        </div>
      </div>
    </>
  );
};