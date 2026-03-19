import apiClient, { get, post, put, patch, del } from "./apiClient";
import {
  Product,
  ProductSummary,
  PaginatedProducts,
  ProductFilterParams,
  ProductReview,
} from "../types/product";
import {
  Cart,
  AddToCartPayload,
  UpdateCartItemPayload,
  ApplyCouponPayload,
  CouponValidationResult,
  Order,
  CreateOrderPayload,
  PaginatedOrders,
} from "../types/cart";
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
  Wishlist,
  SavedAddress,
} from "../types/user";

export const AuthService = {
  login: (payload: LoginPayload) =>
    post<LoginResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) =>
    post<LoginResponse>("/auth/register", payload),
  logout: () => post<void>("/auth/logout"),
  getMe: () => get<User>("/auth/me"),
};

export const ProductService = {
  list: (params?: ProductFilterParams) =>
    get<PaginatedProducts>("/products", params as Record<string, unknown>),
  getBySlug: (slug: string) =>
    get<Product>(`/products/${slug}`),
  getFeatured: () =>
    get<ProductSummary[]>("/products/featured"),
  getBestSellers: () =>
    get<ProductSummary[]>("/products/best-sellers"),
  getNewArrivals: () =>
    get<ProductSummary[]>("/products/new-arrivals"),
  getRelated: (productId: string) =>
    get<ProductSummary[]>(`/products/${productId}/related`),
  getReviews: (productId: string) =>
    get<ProductReview[]>(`/products/${productId}/reviews`),
  submitReview: (
    productId: string,
    payload: { rating: number; title: string; body: string }
  ) => post<ProductReview>(`/products/${productId}/reviews`, payload),
};

export const CartService = {
  getCart: () => get<Cart>("/cart"),
  addItem: (payload: AddToCartPayload) =>
    post<Cart>("/cart/items", payload),
  updateItem: (payload: UpdateCartItemPayload) =>
    patch<Cart>(`/cart/items/${payload.cartItemId}`, {
      quantity: payload.quantity,
    }),
  removeItem: (cartItemId: string) =>
    del<Cart>(`/cart/items/${cartItemId}`),
  clearCart: () => del<void>("/cart"),
  applyCoupon: (payload: ApplyCouponPayload) =>
    post<CouponValidationResult>("/cart/coupon", payload),
  removeCoupon: () => del<Cart>("/cart/coupon"),
};

export const OrderService = {
  createOrder: (payload: CreateOrderPayload) =>
    post<Order>("/orders", payload),
  getOrder: (orderId: string) =>
    get<Order>(`/orders/${orderId}`),
  getMyOrders: (page = 0, size = 10) =>
    get<PaginatedOrders>("/orders/my", { page, size }),
  cancelOrder: (orderId: string) =>
    patch<Order>(`/orders/${orderId}/cancel`, {}),
};

export const UserService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    put<User>("/users/me", payload),
  changePassword: (payload: ChangePasswordPayload) =>
    put<void>("/users/me/password", payload),
  getWishlist: () => get<Wishlist>("/users/me/wishlist"),
  addToWishlist: (productId: string) =>
    post<Wishlist>("/users/me/wishlist", { productId }),
  removeFromWishlist: (productId: string) =>
    del<Wishlist>(`/users/me/wishlist/${productId}`),
  getAddresses: () => get<SavedAddress[]>("/users/me/addresses"),
  addAddress: (address: Omit<SavedAddress, "id">) =>
    post<SavedAddress>("/users/me/addresses", address),
  updateAddress: (id: string, address: Partial<SavedAddress>) =>
    put<SavedAddress>(`/users/me/addresses/${id}`, address),
  deleteAddress: (id: string) =>
    del<void>(`/users/me/addresses/${id}`),
};

export const PaymentService = {
  initializePaystack: (orderId: string) =>
    post<{ authorizationUrl: string; reference: string }>(
      "/payment/paystack/initialize",
      { orderId }
    ),
  verifyPaystack: (reference: string) =>
    post<{ success: boolean; order: Order }>(
      "/payment/paystack/verify",
      { reference }
    ),
  initializeFlutterwave: (orderId: string) =>
    post<{ paymentLink: string; transactionId: string }>(
      "/payment/flutterwave/initialize",
      { orderId }
    ),
  verifyFlutterwave: (transactionId: string) =>
    post<{ success: boolean; order: Order }>(
      "/payment/flutterwave/verify",
      { transactionId }
    ),
};

export const NewsletterService = {
  subscribe: (email: string) =>
    post<void>("/newsletter/subscribe", { email }),
};

export const UploadService = {
  uploadImage: async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string; id: string }>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};