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
            router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-6">
            <h2 className="font-semibold text-slate-800">Submit UPI Transaction ID (UTR)</h2>
            <p className="mt-1 text-sm text-slate-500">After paying, enter the UTR / transaction reference from your UPI app.</p>
            <form action={handleSubmit} className="mt-3 space-y-3">
                <input name="utr" required placeholder="e.g. UTIBR20261234567"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" />
                <button type="submit" disabled={loading}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit UTR"}
                </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
    );
}
