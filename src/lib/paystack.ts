import { PaymentService } from "./api";
import { Order } from "../types/cart";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string; status: string }) => void;
  onClose: () => void;
}

const loadPaystackScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Paystack SDK"));
    document.head.appendChild(script);
  });

interface PaystackCheckoutOptions {
  orderId: string;
  email: string;
  amount: number;
  onSuccess: (order: Order) => void;
  onCancel: () => void;
  onError: (error: Error) => void;
}

export const initiatePaystackCheckout = async ({
  orderId,
  email,
  amount,
  onSuccess,
  onCancel,
  onError,
}: PaystackCheckoutOptions): Promise<void> => {
  try {
    await loadPaystackScript();
    const { reference } = await PaymentService.initializePaystack(orderId);

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount,
      currency: "NGN",
      ref: reference,
      channels: ["card", "bank", "ussd", "bank_transfer"],
      metadata: { orderId },
      callback: async (response) => {
        if (response.status === "success") {
          try {
            const { order } = await PaymentService.verifyPaystack(
              response.reference
            );
            onSuccess(order);
          } catch (err) {
            onError(
              err instanceof Error ? err : new Error("Verification failed")
            );
          }
        }
      },
      onClose: onCancel,
    });

    handler.openIframe();
  } catch (err) {
    onError(
      err instanceof Error ? err : new Error("Paystack initialization failed")
    );
  }
};