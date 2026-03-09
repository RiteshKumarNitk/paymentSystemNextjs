"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
};

export default function UtrSubmitForm({ orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        orderId,
        utr: String(formData.get("utr") ?? "")
      };

      const response = await fetch("/api/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { success: true; status: string } | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to submit UTR.");
      }

      // Redirect to success page
      router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Submit UPI Transaction ID (UTR)</h2>
      <form action={handleSubmit} className="mt-3 space-y-3">
        <input
          name="utr"
          placeholder="Enter UTR / Transaction ID"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit UTR"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

