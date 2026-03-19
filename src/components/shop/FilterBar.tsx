import React, { useState } from "react";
import {
  ProductFilterParams,
  ProductCategory,
  ProductMaterial,
} from "../../types/product";
import { CATEGORY_LABELS, MATERIAL_LABELS } from "../../lib/utils";

type SortOption = NonNullable<ProductFilterParams["sort"]>;

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
}) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-text-light tracking-widest uppercase whitespace-nowrap">
      Sort By
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      aria-label="Sort products by"
      className={[
        "text-xs font-sans text-charcoal bg-transparent",
        "border border-cream-dark rounded-sm px-3 py-2",
        "focus:outline-none focus:border-maroon transition-colors",
        "cursor-pointer",
      ].join(" ")}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface FilterBarProps {
  filters: ProductFilterParams;
  onChange: (filters: Partial<ProductFilterParams>) => void;
  onReset: () => void;
  totalResults: number;
}

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₦50K", min: undefined, max: 5_000_000 },
  { label: "₦50K – ₦150K", min: 5_000_000, max: 15_000_000 },
  { label: "₦150K – ₦500K", min: 15_000_000, max: 50_000_000 },
  { label: "₦500K+", min: 50_000_000, max: undefined },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];
  const materials = Object.keys(MATERIAL_LABELS) as ProductMaterial[];

  const hasActiveFilters =
    !!filters.category ||
    !!filters.material ||
    !!filters.minPrice ||
    !!filters.maxPrice;

  const FilterContent = () => (
    <div className="flex flex-col gap-8">
      {/* Category */}
      <div>
        <p className="text-[0.65rem] tracking-widest uppercase text-text-light mb-3 font-medium">
          Category
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChange({ category: undefined })}
            className={[
              "text-left text-sm transition-colors py-0.5",
              !filters.category
                ? "text-maroon font-medium"
                : "text-text-mid hover:text-charcoal",
            ].join(" ")}
          >
            All Jewelry
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ category: cat })}
              className={[
                "text-left text-sm transition-colors py-0.5",
                filters.category === cat
                  ? "text-maroon font-medium"
                  : "text-text-mid hover:text-charcoal",
              ].join(" ")}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <p className="text-[0.65rem] tracking-widest uppercase text-text-light mb-3 font-medium">
          Material
        </p>
        <div className="flex flex-col gap-2">
          {materials.map((mat) => (
            <button
              key={mat}
              onClick={() =>
                onChange({
                  material: filters.material === mat ? undefined : mat,
                })
              }
              className={[
                "text-left text-sm transition-colors py-0.5",
                filters.material === mat
                  ? "text-maroon font-medium"
                  : "text-text-mid hover:text-charcoal",
              ].join(" ")}
            >
              {MATERIAL_LABELS[mat]}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[0.65rem] tracking-widest uppercase text-text-light mb-3 font-medium">
          Price Range
        </p>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range) => {
            const isActive =
              filters.minPrice === range.min &&
              filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() =>
                  onChange({ minPrice: range.min, maxPrice: range.max })
                }
                className={[
                  "text-left text-sm transition-colors py-0.5",
                  isActive
                    ? "text-maroon font-medium"
                    : "text-text-mid hover:text-charcoal",
                ].join(" ")}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={[
              "w-10 h-6 rounded-full relative transition-colors",
              filters.inStock ? "bg-maroon" : "bg-cream-dark",
            ].join(" ")}
            onClick={() => onChange({ inStock: !filters.inStock })}
          >
            <div
              className={[
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                filters.inStock ? "translate-x-5" : "translate-x-1",
              ].join(" ")}
            />
          </div>
          <span className="text-sm text-text-mid group-hover:text-charcoal transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-xs text-maroon border border-maroon px-4 py-2 rounded-sm hover:bg-maroon hover:text-white transition-colors tracking-widest uppercase"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-xl font-light">Filter</h2>
            <span className="text-xs text-text-light">
              {totalResults} pieces
            </span>
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-xs tracking-widest uppercase border border-cream-dark px-4 py-2 rounded-sm hover:border-maroon hover:text-maroon transition-colors"
        >
          Filter
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-maroon" />
          )}
        </button>
        <span className="text-xs text-text-light">
          {totalResults} pieces
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-cream z-50 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-xl">Filter</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-cream-dark hover:bg-cream-dark transition-colors"
              >
                ×
              </button>
            </div>
            <FilterContent />
          </div>
        </>
      )}
    </>
  );
};