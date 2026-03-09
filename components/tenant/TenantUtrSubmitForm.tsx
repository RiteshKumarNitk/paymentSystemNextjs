"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    tenantSlug: string;
    bookingId: string;
};

export default function TenantUtrSubmitForm({ tenantSlug, bookingId }: Props) {
    const [utr, setUtr] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (utr.length !== 12) {
            setError("UTR must be exactly 12 digits");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/${tenantSlug}/submit-utr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, utr }),
            });

            if (res.ok) {
                router.push(`/${tenantSlug}/booking-success?bookingId=${bookingId}`);
            } else {
                const data = await res.json();
                setError(data.error || "Submission failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 ml-1">UPI Reference / UTR Number</label>
                <input
                    type="text"
                    required
                    maxLength={12}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-mono text-xl tracking-widest text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-inner"
                    placeholder="000000000000"
                />
            </div>

            {error && (
                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 border-dashed animate-shake">
                    ⚠️ {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading || utr.length !== 12}
                className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl transition hover:bg-slate-800 disabled:opacity-30 active:scale-95"
            >
                {loading ? "Verifying Transaction..." : "Submit for Approval →"}
            </button>
        </form>
    );
}
