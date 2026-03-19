import React, { useState } from "react";
import { NewsletterService } from "../../lib/api";
import { isValidEmail } from "../../lib/utils";

interface FooterProps {
  onNavigate?: (href: string) => void;
}

const FOOTER_LINKS = {
  Shop: [
    { label: "Rings", href: "/shop?category=rings" },
    { label: "Necklaces", href: "/shop?category=necklaces" },
    { label: "Earrings", href: "/shop?category=earrings" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Best Sellers", href: "/shop?filter=bestsellers" },
  ],
  Help: [
    { label: "Sizing Guide", href: "/sizing-guide" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "Our Story", href: "/about" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Press", href: "/press" },
  ],
};

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubscribe = async () => {
    if (!isValidEmail(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await NewsletterService.subscribe(email);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-charcoal-soft text-cream">
      {/* Newsletter */}
      <div className="border-b border-white/10 py-12 px-5 md:px-10 lg:px-20 text-center">
        <p className="text-[0.65rem] tracking-[0.28em] uppercase text-maroon mb-3">
          Inner Circle
        </p>
        <h3 className="font-serif text-2xl md:text-3xl font-light text-cream mb-2">
          First access to new collections
        </h3>
        <p className="text-sm text-text-light mb-6">
          Join over 12,000 discerning collectors.
        </p>
        <div
          className={[
            "flex max-w-md mx-auto rounded-sm overflow-hidden border transition-colors",
            status === "error"
              ? "border-red-400"
              : "border-maroon/30 focus-within:border-maroon",
          ].join(" ")}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            placeholder="Your email address"
            className="flex-1 bg-transparent px-5 py-3 text-sm font-sans text-cream placeholder:text-text-light outline-none"
          />
          <button
            onClick={handleSubscribe}
            disabled={status === "loading" || status === "done"}
            className={[
              "px-6 py-3 text-xs tracking-widest uppercase font-sans transition-colors",
              status === "done"
                ? "bg-green-600 text-white"
                : "bg-maroon text-white hover:bg-maroon-dark",
            ].join(" ")}
          >
            {status === "loading"
              ? "…"
              : status === "done"
              ? "✓ Joined"
              : "Join"}
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="px-5 md:px-10 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
          <div>
            <h2 className="font-serif text-2xl tracking-[0.1em] text-cream mb-3">
              TINCLE<span className="text-maroon">✦</span>
            </h2>
            <p className="text-sm text-text-light leading-relaxed max-w-xs mb-6">
              Handcrafted luxury jewelry for the modern woman. Timeless
              elegance, ethical craftsmanship.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-maroon mb-5 font-medium">
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => onNavigate?.(link.href)}
                      className="text-sm text-text-light hover:text-cream transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.07] px-5 md:px-10 lg:px-20 py-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-text-light">
          © {new Date().getFullYear()} Tincle Jewelry Ltd. All rights
          reserved.
        </p>
        <div className="flex gap-2">
          {["Paystack", "Flutterwave", "Mastercard", "Visa"].map((p) => (
            <span
              key={p}
              className="text-[0.6rem] tracking-wider text-text-light bg-white/[0.07] px-2 py-1 rounded uppercase"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};