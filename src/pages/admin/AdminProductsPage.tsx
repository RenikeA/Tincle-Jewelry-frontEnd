import React, { useEffect, useState } from "react";
import { ProductSummary, ProductCategory, ProductMaterial } from "../../types/product";
import { ProductService } from "../../lib/api";
import { formatPrice, CATEGORY_LABELS, MATERIAL_LABELS } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../lib/apiClient";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface AdminProductsPageProps {
  onNavigate?: (path: string) => void;
}

// ---- DELETE CONFIRM MODAL ----
const DeleteModal: React.FC<{
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ productName, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-5">
    <div className="bg-white rounded-sm p-8 max-w-sm w-full shadow-2xl">
      <h3 className="font-serif text-xl text-charcoal mb-2">Delete Product</h3>
      <p className="text-sm text-text-mid mb-6">
        Are you sure you want to delete{" "}
        <span className="font-medium text-charcoal">"{productName}"</span>?
        This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-cream-dark text-text-mid text-xs tracking-widest uppercase rounded-sm hover:border-charcoal transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-3 bg-red-600 text-white text-xs tracking-widest uppercase rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ---- PRODUCT FORM ----
interface ProductFormData {
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory | "";
  material: ProductMaterial | "";
  basePrice: string;
  salePrice: string;
  stockQuantity: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  careInstructions: string;
  weight: string;
  images: { id: string; url: string; isPrimary: boolean }[];
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  material: "",
  basePrice: "",
  salePrice: "",
  stockQuantity: "",
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  careInstructions: "",
  weight: "",
  images:[],
};

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-transparent",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

const ProductForm: React.FC<{
  initial?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: "create" | "edit";
}> = ({ initial = EMPTY_FORM, onSubmit, onCancel, isLoading, mode }) => {
  const [form, setForm] = useState<ProductFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const set = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const toggle = (field: keyof ProductFormData) => () => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const e: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.shortDescription.trim()) e.shortDescription = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.category) e.category = "Required";
    if (!form.material) e.material = "Required";
    if (!form.basePrice || isNaN(Number(form.basePrice)))
      e.basePrice = "Valid price required (in kobo)";
    if (!form.stockQuantity || isNaN(Number(form.stockQuantity)))
      e.stockQuantity = "Valid quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) await onSubmit(form);
  };

  return (
    <div className="bg-white border border-cream-dark rounded-sm p-8">
      <h2 className="font-serif text-2xl text-charcoal mb-8">
        {mode === "create" ? "Add New Product" : "Edit Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Product Name
          </label>
          <input
            className={inputClass}
            value={form.name}
            onChange={set("name")}
            placeholder="18K Gold Diamond Ring"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Short description */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Short Description
          </label>
          <input
            className={inputClass}
            value={form.shortDescription}
            onChange={set("shortDescription")}
            placeholder="A brief one-line description"
          />
          {errors.shortDescription && (
            <p className="text-xs text-red-500">{errors.shortDescription}</p>
          )}
        </div>

        {/* Full description */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Full Description
          </label>
          <textarea
            className={[inputClass, "resize-none h-28"].join(" ")}
            value={form.description}
            onChange={set("description")}
            placeholder="Detailed product description..."
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Category
          </label>
          <select
            className={inputClass}
            value={form.category}
            onChange={set("category")}
            title="Product Category"
          >
            <option value="">Select category</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Material */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Material
          </label>
          <select
            className={inputClass}
            value={form.material}
            onChange={set("material")}
            title="Product Material"
          >
            <option value="">Select material</option>
            {Object.entries(MATERIAL_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {errors.material && (
            <p className="text-xs text-red-500">{errors.material}</p>
          )}
        </div>

        {/* Base price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Base Price (in kobo)
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.basePrice}
            onChange={set("basePrice")}
            placeholder="e.g. 5000000 = ₦50,000"
          />
          {form.basePrice && !isNaN(Number(form.basePrice)) && (
            <p className="text-xs text-maroon">
              = {formatPrice(Number(form.basePrice))}
            </p>
          )}
          {errors.basePrice && (
            <p className="text-xs text-red-500">{errors.basePrice}</p>
          )}
        </div>

        {/* Sale price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Sale Price (optional, in kobo)
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.salePrice}
            onChange={set("salePrice")}
            placeholder="Leave empty for no sale"
          />
          {form.salePrice && !isNaN(Number(form.salePrice)) && (
            <p className="text-xs text-maroon">
              = {formatPrice(Number(form.salePrice))}
            </p>
          )}
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Stock Quantity
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.stockQuantity}
            onChange={set("stockQuantity")}
            placeholder="e.g. 10"
          />
          {errors.stockQuantity && (
            <p className="text-xs text-red-500">{errors.stockQuantity}</p>
          )}
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Weight in grams (optional)
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.weight}
            onChange={set("weight")}
            placeholder="e.g. 5"
          />
        </div>

        {/* Care instructions */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-text-mid">
            Care Instructions (optional)
          </label>
          <textarea
            className={[inputClass, "resize-none h-20"].join(" ")}
            value={form.careInstructions}
            onChange={set("careInstructions")}
            placeholder="How to care for this piece..."
          />
        </div>

        {/* Flags */}
        <div className="md:col-span-2">
          <p className="text-xs tracking-widest uppercase text-text-mid mb-3">
            Product Flags
          </p>
          <div className="flex flex-wrap gap-6">
            {(
              [
                { field: "isFeatured", label: "Featured" },
                { field: "isBestSeller", label: "Best Seller" },
                { field: "isNewArrival", label: "New Arrival" },
              ] as { field: keyof ProductFormData; label: string }[]
            ).map(({ field, label }) => (
              <label
                key={field}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  onClick={toggle(field)}
                  className={[
                    "w-10 h-6 rounded-full relative transition-colors cursor-pointer",
                    form[field] ? "bg-maroon" : "bg-cream-dark",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      form[field] ? "translate-x-5" : "translate-x-1",
                    ].join(" ")}
                  />
                </div>
                <span className="text-sm text-text-mid">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="md:col-span-2 flex flex-col gap-1.5">
        <label className="text-xs tracking-widest uppercase text-text-mid">
          Product Images
        </label>
        <ImageUploader
          images={form.images}
          onChange={(imgs) =>
            setForm((prev) => ({ ...prev, images: imgs }))
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-cream-dark">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-cream-dark text-text-mid text-xs tracking-widest uppercase rounded-sm hover:border-charcoal transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 py-3 bg-maroon text-white text-xs tracking-widest uppercase rounded-sm hover:bg-maroon-dark transition-colors disabled:opacity-50"
        >
          {isLoading
            ? "Saving…"
            : mode === "create"
            ? "Create Product"
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ---- MAIN PAGE ----
export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = () => {
    setIsLoading(true);
    ProductService.list({ size: 50 })
      .then((data) => setProducts(data.content))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen pt-[72px] flex items-center justify-center">
        <p className="text-charcoal font-serif text-2xl">Access Denied</p>
      </main>
    );
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      await apiClient.post("/products", {
  ...data,
  basePrice: Number(data.basePrice),
  salePrice: data.salePrice ? Number(data.salePrice) : undefined,
  stockQuantity: Number(data.stockQuantity),
  weight: data.weight ? Number(data.weight) : undefined,
  images: data.images,
});
      fetchProducts();
      setView("list");
    } catch (err) {
      console.error("Failed to create product", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/products/${editingProduct.id}`, {
  ...data,
  basePrice: Number(data.basePrice),
  salePrice: data.salePrice ? Number(data.salePrice) : undefined,
  stockQuantity: Number(data.stockQuantity),
  weight: data.weight ? Number(data.weight) : undefined,
  images: data.images,
});
      fetchProducts();
      setView("list");
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteTarget.id}`);
      fetchProducts();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete product", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-charcoal-soft min-h-screen flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <button onClick={() => onNavigate?.("/admin")} className="text-left">
            <p className="font-serif text-xl text-cream tracking-widest">
              TINCLE<span className="text-maroon">✦</span>
            </p>
            <p className="text-xs text-text-light tracking-widest uppercase mt-0.5">
              Admin Panel
            </p>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {[
            { label: "Overview", icon: "◈", path: "/admin" },
            { label: "Products", icon: "◇", path: "/admin/products" },
            { label: "Orders", icon: "◻", path: "/admin/orders" },
            { label: "Customers", icon: "◯", path: "/admin/customers" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate?.(item.path)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans transition-colors text-left w-full",
                window.location.pathname === item.path
                  ? "bg-maroon text-white"
                  : "text-text-light hover:bg-white/5 hover:text-cream",
              ].join(" ")}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={() => onNavigate?.("/")}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-sans text-text-light hover:bg-white/5 hover:text-cream transition-colors text-left w-full"
          >
            <span>↗</span> View Store
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-cream-dark px-8 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-charcoal">Products</h1>
          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="text-xs tracking-widest uppercase bg-maroon text-white px-5 py-2.5 hover:bg-maroon-dark transition-colors rounded-sm"
            >
              + Add Product
            </button>
          )}
        </header>

        <main className="flex-1 px-8 py-8">
          {view === "create" && (
            <ProductForm
              mode="create"
              onSubmit={handleCreate}
              onCancel={() => setView("list")}
              isLoading={isSaving}
            />
          )}

          {view === "edit" && editingProduct && (
            <ProductForm
              mode="edit"
              initial={{
                name: editingProduct.name,
                shortDescription: "",
                description: "",
                category: editingProduct.category,
                material: editingProduct.material,
                basePrice: editingProduct.basePrice.toString(),
                salePrice: editingProduct.salePrice?.toString() ?? "",
                stockQuantity: editingProduct.stockQuantity.toString(),
                isFeatured: false,
                isBestSeller: editingProduct.isBestSeller,
                isNewArrival: editingProduct.isNewArrival,
                careInstructions: "",
                weight: "",
                images: [],
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setView("list");
                setEditingProduct(null);
              }}
              isLoading={isSaving}
            />
          )}

          {view === "list" && (
            <>
              {/* Search */}
              <div className="mb-6">
                <input
                  className="w-full max-w-sm border border-cream-dark rounded-sm px-4 py-3 text-sm font-sans text-charcoal bg-transparent focus:outline-none focus:border-maroon transition-colors placeholder:text-text-light"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Table */}
              <div className="bg-white border border-cream-dark rounded-sm overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-text-light text-sm">
                      {search ? "No products match your search" : "No products yet"}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setView("create")}
                        className="mt-4 text-xs text-maroon hover:underline tracking-widest uppercase"
                      >
                        Add your first product
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cream-dark">
                          {["Product", "Category", "Material", "Price", "Stock", "Flags", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-6 py-3 text-xs tracking-widest uppercase text-text-light font-sans font-normal"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-cream-dark last:border-0 hover:bg-cream/50 transition-colors"
                          >
                            {/* Product */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-sm overflow-hidden bg-cream-dark flex-shrink-0">
                                  <img
                                    src={product.primaryImage?.url ?? "/placeholder-jewelry.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-sm font-sans text-charcoal font-medium max-w-[180px] truncate">
                                  {product.name}
                                </p>
                              </div>
                            </td>
                            {/* Category */}
                            <td className="px-6 py-4 text-sm text-text-mid font-sans">
                              {CATEGORY_LABELS[product.category] ?? product.category}
                            </td>
                            {/* Material */}
                            <td className="px-6 py-4 text-sm text-text-mid font-sans">
                              {MATERIAL_LABELS[product.material] ?? product.material}
                            </td>
                            {/* Price */}
                            <td className="px-6 py-4 text-sm text-charcoal font-sans">
                              <div>
                                <p>{formatPrice(product.salePrice ?? product.basePrice)}</p>
                                {product.salePrice && (
                                  <p className="text-xs text-text-light line-through">
                                    {formatPrice(product.basePrice)}
                                  </p>
                                )}
                              </div>
                            </td>
                            {/* Stock */}
                            <td className="px-6 py-4">
                              <span
                                className={[
                                  "text-xs px-2 py-1 rounded-sm font-sans",
                                  product.stockQuantity > 5
                                    ? "bg-green-100 text-green-700"
                                    : product.stockQuantity > 0
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700",
                                ].join(" ")}
                              >
                                {product.stockQuantity > 0
                                  ? `${product.stockQuantity} left`
                                  : "Out of stock"}
                              </span>
                            </td>
                            {/* Flags */}
                            <td className="px-6 py-4">
                              <div className="flex gap-1 flex-wrap">
                                {product.isBestSeller && (
                                  <span className="text-xs bg-maroon/10 text-maroon px-1.5 py-0.5 rounded-sm">
                                    Best
                                  </span>
                                )}
                                {product.isNewArrival && (
                                  <span className="text-xs bg-charcoal/10 text-charcoal px-1.5 py-0.5 rounded-sm">
                                    New
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setView("edit");
                                  }}
                                  className="text-xs text-maroon hover:underline tracking-widest uppercase"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(product)}
                                  className="text-xs text-red-500 hover:underline tracking-widest uppercase"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          productName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};