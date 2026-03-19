/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#800020",
          light: "#C4607A",
          dark: "#5C0016",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          soft: "#3A3330",
        },
        cream: {
          DEFAULT: "#F9F5EF",
          dark: "#EDE8DF",
        },
        "text-mid": "#6B6058",
        "text-light": "#9E9186",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Jost", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 40px rgba(26,18,8,0.07)",
        maroon: "0 4px 30px rgba(128,0,32,0.2)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "pulse-wa": "pulse-wa 3s ease infinite",
        slideUp: "slideUp 0.35s ease both",
        floatCard: "floatCard 6s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-wa": {
          "0%, 100%": { boxShadow: "0 4px 20px rgba(37,211,102,0.35)" },
          "50%": { boxShadow: "0 4px 32px rgba(37,211,102,0.55)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        floatCard: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
