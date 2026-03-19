import React from "react";
import { ProductSummary } from "../../types/product";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "../ui";

interface ProductGridProps {
  products: ProductSummary[];
  isLoading?: boolean;
  skeletonCount?: number;
  onNavigate?: (slug: string) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

const EmptyState: React.FC = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
    <span className="text-5xl opacity-20">◇</span>
    <p className="font-serif text-2xl text-charcoal font-light">
      No pieces found
    </p>
    <p className="text-sm text-text-light max-w-xs text-center">
      Try adjusting your filters or exploring a different category.
    </p>
  </div>
);

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  skeletonCount = 8,
  onNavigate,
  columns = 4,
  className = "",
}) => {
  return (
    <div
      className={[
        "grid gap-x-6 gap-y-10",
        columnClasses[columns] ?? columnClasses[4],
        className,
      ].join(" ")}
    >
      {isLoading ? (
        Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            priority={idx < 4}
          />
        ))
      )}
    </div>
  );
};