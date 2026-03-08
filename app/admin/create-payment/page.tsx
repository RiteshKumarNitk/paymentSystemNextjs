"use client";

import Link from "next/link";
import { useState } from "react";

type CreateResponse = {
  paymentId: string;
};

export default function CreatePaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setPaymentLink(null);

    try {
      const payload = {
        customerName: String(formData.get("customerName") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        ticketType: String(formData.get("ticketType") ?? ""),
        amount: Number(formData.get("amount") ?? 0)
      };

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as CreateResponse | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to create payment request.");
      }

      const fullLink = `${window.location.origin}/pay/${data.paymentId}`;
      setPaymentLink(fullLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-start justify-between">
          <h1 className="text-2xl font-semibold">Create Manual Payment</h1>
          <Link href="/admin/payments" className="text-sm text-slate-600 hover:text-slate-900">
            View Payments
          </Link>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="mb-1 block text-sm font-medium">
              Customer Name
            </label>
            <input
              id="customerName"
              name="customerName"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium">
              Phone
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="ticketType" className="mb-1 block text-sm font-medium">
              Ticket Type
            </label>
            <input
              id="ticketType"
              name="ticketType"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium">
              Amount (INR)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Payment Link"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {paymentLink ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-900">Payment link created</p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm text-emerald-800 underline"
            >
              {paymentLink}
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
