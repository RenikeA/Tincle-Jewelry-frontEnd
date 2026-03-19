export type ProductCategory =
  | "rings"
  | "necklaces"
  | "earrings"
  | "bracelets"
  | "anklets"
  | "sets";

export type ProductMaterial =
  | "18k_gold"
  | "14k_gold"
  | "sterling_silver"
  | "rose_gold"
  | "platinum";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  material?: ProductMaterial;
  stockQuantity: number;
  additionalPrice: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  material: ProductMaterial;
  basePrice: number;
  salePrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  stockQuantity: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  weight?: number;
  dimensions?: string;
  careInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  material: ProductMaterial;
  basePrice: number;
  salePrice?: number;
  primaryImage: ProductImage;
  averageRating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  stockQuantity: number;
}

export interface PaginatedProducts {
  content: ProductSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ProductFilterParams {
  category?: ProductCategory;
  material?: ProductMaterial;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating" | "popular";
}