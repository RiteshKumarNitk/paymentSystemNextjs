"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    tenantSlug: string;
    eventId: string;
    price: number;
    defaultName?: string;
    defaultEmail?: string;
    defaultPhone?: string;
};

export default function TenantBookingForm({
    tenantSlug,
    eventId,
    price,
    defaultName = "",
    defaultEmail = "",
    defaultPhone = ""
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const payload = {
            eventId,
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            amount: price,
        };

        try {
            const res = await fetch(`/api/${tenantSlug}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed");

            if (price === 0) {
                // Free event
                router.push(`/${tenantSlug}/booking-success?bookingId=${data.bookingId}`);
            } else {
                // Paid event - go to QR
                router.push(`/${tenantSlug}/events/${eventId}/book/${data.bookingId}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                    name="name"
                    required
                    defaultValue={defaultName}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-600"
                    placeholder="e.g. Robin Banks"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    defaultValue={defaultEmail}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-600"
                    placeholder="robin@gmail.com"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={defaultPhone}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-600"
                    placeholder="10-digit mobile"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-2xl bg-indigo-500 py-4 font-black text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50"
            >
                {loading ? "Confirming..." : price === 0 ? "Get Invitation →" : `Pay ₹${price} & Book →`}
            </button>

            {error && (
                <p className="mt-4 text-center text-xs font-bold text-red-400 bg-red-400/10 py-2 rounded-xl border border-red-400/20 px-3 italic">
                    ⚠️ {error}
                </p>
            )}
        </form>
    );
}
