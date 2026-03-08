"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type Props = {
  paymentRequestId: string;
  razorpayOrderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ticketType: string;
  amount: number;
  razorpayKeyId: string;
  disabled?: boolean;
};

export default function PaymentCheckoutButton({
  paymentRequestId,
  razorpayOrderId,
  customerName,
  customerPhone,
  customerEmail,
  ticketType,
  amount,
  razorpayKeyId,
  disabled = false
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountInPaise = useMemo(() => amount * 100, [amount]);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded.");
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: amountInPaise,
        currency: "INR",
        name: "Ticket Payment",
        description: ticketType,
        order_id: razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: "#0f172a"
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentRequestId,
              ...response
            })
          });

          const data = (await verifyResponse.json()) as
            | { success: true; paymentRequestId: string; paymentId: string; amount: number }
            | { error: string };

          if (!verifyResponse.ok || "error" in data) {
            throw new Error("error" in data ? data.error : "Payment verification failed.");
          }

          const params = new URLSearchParams({
            paymentRequestId: data.paymentRequestId,
            paymentId: data.paymentId,
            amount: String(data.amount),
            date: new Date().toISOString()
          });
          router.push(`/payment-success?${params.toString()}`);
        }
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading || disabled}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Opening Checkout..." : disabled ? "Already Paid" : "Pay with Razorpay"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
