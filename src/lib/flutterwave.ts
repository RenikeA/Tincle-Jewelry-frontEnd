/// <reference types="vite/client" />

import { PaymentService } from "./api";
import { Order } from "../types/cart";

declare global {
  interface Window {
    FlutterwaveCheckout: (
      options: FlutterwaveOptions
    ) => { close: () => void };
  }
}

interface FlutterwaveOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, unknown>;
  callback: (data: { status: string; transaction_id: string }) => void;
  onclose: () => void;
}

const loadFlutterwaveScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if ("FlutterwaveCheckout" in window) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Flutterwave SDK"));
    document.head.appendChild(script);
  });

interface FlutterwaveCheckoutOptions {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  onSuccess: (order: Order) => void;
  onCancel: () => void;
  onError: (error: Error) => void;
}

export const initiateFlutterwaveCheckout = async ({
  orderId,
  customerEmail,
  customerName,
  customerPhone,
  amount,
  onSuccess,
  onCancel,
  onError,
}: FlutterwaveCheckoutOptions): Promise<void> => {
  try {
    await loadFlutterwaveScript();
    const { transactionId } =
      await PaymentService.initializeFlutterwave(orderId);

    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: transactionId,
      amount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: customerEmail,
        phone_number: customerPhone,
        name: customerName,
      },
      customizations: {
        title: "Tincle Jewelry",
        description: "Secure payment for your order",
        logo: "/logo.png",
      },
      meta: { orderId },
      callback: async (data) => {
        if (data.status === "successful") {
          try {
            const { order } = await PaymentService.verifyFlutterwave(
              data.transaction_id
            );
            onSuccess(order);
          } catch (err) {
            onError(
              err instanceof Error ? err : new Error("Verification failed")
            );
          }
        } else {
          onError(new Error("Payment was not successful"));
        }
      },
      onclose: onCancel,
    });
  } catch (err) {
    onError(
      err instanceof Error
        ? err
        : new Error("Flutterwave initialization failed")
    );
  }
};