import React, { useState, useEffect, useCallback } from "react";
import { ProductService } from "../lib/api";
import { ProductFilterParams, PaginatedProducts } from "../types/product";
import { ProductGrid } from "../components/shop/ProductGrid";
import { FilterBar, SortDropdown } from "../components/shop/FilterBar";

const DEFAULT_FILTERS: ProductFilterParams = {
  page: 0,
  size: 12,
  sort: "newest",
};

export const ShopPage: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [filters, setFilters] =
    useState<ProductFilterParams>(DEFAULT_FILTERS);
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async (params: ProductFilterParams) => {
    setIsLoading(true);
    try {
      const result = await ProductService.list(params);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handleFilterChange = (newFilters: Partial<ProductFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const handleSort = (sort: NonNullable<ProductFilterParams["sort"]>) => {
    setFilters((prev) => ({ ...prev, sort, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = data?.totalPages ?? 0;
  const currentPage = filters.page ?? 0;

  return (
    <main className="min-h-screen pt-[72px] bg-cream">
      {/* Hero */}
      <div className="bg-charcoal-soft text-cream py-16 px-5 md:px-10 lg:px-20 text-center">
        <p className="eyebrow mb-3">Our Collection</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light">
          All Jewelry
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 md:px-10 lg:px-20 py-12">
        {/* Mobile filter row */}
        <div className="lg:hidden mb-6">
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            totalResults={data?.totalElements ?? 0}
          />
        </div>

        <div className="flex gap-12">
          {/* Desktop sidebar */}
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            totalResults={data?.totalElements ?? 0}
          />

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Sort row */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-text-light hidden lg:block">
                {data?.totalElements ?? 0} pieces
              </p>
              <SortDropdown
                value={filters.sort ?? "newest"}
                onChange={handleSort}
              />
            </div>

            <ProductGrid
              products={data?.content ?? []}
              isLoading={isLoading}
              onNavigate={(slug) => onNavigate?.(`/product/${slug}`)}
              columns={3}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="w-9 h-9 flex items-center justify-center border border-cream-dark rounded-sm text-text-mid hover:border-maroon hover:text-maroon transition-colors disabled:opacity-30"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={[
                      "w-9 h-9 flex items-center justify-center rounded-sm text-sm font-sans transition-colors",
                      i === currentPage
                        ? "bg-maroon text-white"
                        : "border border-cream-dark text-text-mid hover:border-maroon hover:text-maroon",
                    ].join(" ")}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center border border-cream-dark rounded-sm text-text-mid hover:border-maroon hover:text-maroon transition-colors disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};