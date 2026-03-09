"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { orderId: string };

export default function UtrSubmitForm({ orderId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/submit-utr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, utr: formData.get("utr") })
            });
            const data = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok || !data.success) throw new Error(data.error ?? "Failed to submit UTR.");
            router.push(`/booking-success?orderId=${encodeURIComponent(orderId)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-800">Step 3 — Submit Transaction ID (UTR)</h2>
            <p className="mt-1 text-sm text-slate-500">After paying, copy the UTR / transaction reference from your UPI app and paste it below.</p>
            <form action={handleSubmit} className="mt-4 space-y-3">
                <input name="utr" required placeholder="e.g. UTIBR20261234567"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:bg-white font-mono transition" />
                <button type="submit" disabled={loading}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit UTR & Confirm Booking"}
                </button>
            </form>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </section>
    );
}
