import { useState, useCallback } from "react";
import { OrderService } from "../lib/api";
import { initiatePaystackCheckout } from "../lib/paystack";
import { initiateFlutterwaveCheckout } from "../lib/flutterwave";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import {
  CreateOrderPayload,
  Order,
  PaymentProvider,
  ShippingAddress,
} from "../types/cart";
import { koboToNaira } from "../lib/utils";

type CheckoutStep =
  | "shipping"
  | "payment"
  | "processing"
  | "confirmed"
  | "failed";

interface CheckoutState {
  step: CheckoutStep;
  order: Order | null;
  error: string | null;
  isLoading: boolean;
}

export const useCheckout = () => {
  const [state, setState] = useState<CheckoutState>({
    step: "shipping",
    order: null,
    error: null,
    isLoading: false,
  });

  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const { user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const setError = (error: string) =>
    setState((prev) => ({ ...prev, error, step: "failed" }));

  const createOrder = useCallback(
    async (
      shippingAddress: ShippingAddress,
      provider: PaymentProvider
    ): Promise<Order | null> => {
      if (!cart) return null;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const payload: CreateOrderPayload = {
          cartId: cart.id,
          shippingAddress,
          paymentProvider: provider,
          couponCode: cart.couponCode,
        };
        const order = await OrderService.createOrder(payload);
        setState((prev) => ({ ...prev, order, step: "payment" }));
        return order;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to create order";
        setError(msg);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [cart]
  );

  const submitPayment = useCallback(
    async (provider: PaymentProvider) => {
      const { order } = state;
      if (!order || !user) return;
      setState((prev) => ({ ...prev, step: "processing", isLoading: true }));

      const onSuccess = (completedOrder: Order) => {
        setState({
          step: "confirmed",
          order: completedOrder,
          error: null,
          isLoading: false,
        });
        fetchCart();
        addToast({
          type: "success",
          message: "Payment successful! Your order is confirmed.",
        });
      };

      const onCancel = () => {
        setState((prev) => ({ ...prev, step: "payment", isLoading: false }));
        addToast({ type: "info", message: "Payment cancelled." });
      };

      const onError = (err: Error) => {
        setError(err.message);
        setState((prev) => ({ ...prev, isLoading: false }));
      };

      if (provider === "PAYSTACK") {
        await initiatePaystackCheckout({
          orderId: order.id,
          email: user.email,
          amount: order.total,
          onSuccess,
          onCancel,
          onError,
        });
      } else {
        await initiateFlutterwaveCheckout({
          orderId: order.id,
          customerEmail: user.email,
          customerName: `${user.firstName} ${user.lastName}`,
          customerPhone: user.phone,
          amount: koboToNaira(order.total),
          onSuccess,
          onCancel,
          onError,
        });
      }
    },
    [state, user, fetchCart, addToast]
  );

  const reset = useCallback(() => {
    setState({
      step: "shipping",
      order: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    cart,
    createOrder,
    submitPayment,
    reset,
  };
};