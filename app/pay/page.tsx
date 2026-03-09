"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const purposeOptions = ["ticket", "booking", "service"] as const;

export default function PayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        purpose: String(formData.get("purpose") ?? "").trim(),
        amount: Number(formData.get("amount") ?? 0)
      };

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { orderId: string } | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to create payment.");
      }

      router.push(`/pay/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <section className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Create UPI Payment</h1>
        <p className="mt-1 text-sm text-slate-600">Fill the details to generate a UPI QR code.</p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label htmlFor="purpose" className="mb-1 block text-sm font-medium">
              Purpose
            </label>
            <select
              id="purpose"
              name="purpose"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-600"
              defaultValue="ticket"
            >
              {purposeOptions.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate UPI QR"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>
    </main>
  );
}
