export const formatPrice = (
  amountInKobo: number,
  currency = "NGN"
): string => {
  const amount = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const koboToNaira = (kobo: number): number => kobo / 100;
export const nairaToKobo = (naira: number): number => naira * 100;

export const formatDate = (isoString: string): string =>
  new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoString));

export const calcDiscountPercent = (
  basePrice: number,
  salePrice: number
): number => Math.round(((basePrice - salePrice) / basePrice) * 100);

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidNigerianPhone = (phone: string): boolean =>
  /^(\+234|0)[789][01]\d{8}$/.test(phone.replace(/\s/g, ""));

export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const lockScroll = (): void => {
  document.body.style.overflow = "hidden";
};

export const unlockScroll = (): void => {
  document.body.style.overflow = "";
};

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove: (key: string): void => localStorage.removeItem(key),
};

export const MATERIAL_LABELS: Record<string, string> = {
  "18k_gold": "18K Gold",
  "14k_gold": "14K Gold",
  sterling_silver: "Sterling Silver",
  rose_gold: "Rose Gold",
  platinum: "Platinum",
};

export const CATEGORY_LABELS: Record<string, string> = {
  rings: "Rings",
  necklaces: "Necklaces",
  earrings: "Earrings",
  bracelets: "Bracelets",
  anklets: "Anklets",
  sets: "Sets",
};