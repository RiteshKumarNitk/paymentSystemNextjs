"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { eventId: string; fixedPrice: number; defaultName?: string; defaultPhone?: string; defaultEmail?: string };

export default function BookingForm({ eventId, fixedPrice, defaultName = "", defaultPhone = "", defaultEmail = "" }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId,
                    name: formData.get("name"),
                    phone: formData.get("phone"),
                    email: formData.get("email")
                })
            });
            const data = (await res.json()) as { bookingId?: string; orderId?: string; isFree?: boolean; status?: string; error?: string };
            if (!res.ok || !data.orderId) throw new Error(data.error ?? "Booking failed.");

            if (data.isFree) {
                router.push(`/booking-success?orderId=${data.orderId}`);
            } else {
                router.push(`/events/${eventId}/book/${data.bookingId}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            {[
                { id: "name", label: "Full Name", type: "text", defaultValue: defaultName },
                { id: "phone", label: "Phone", type: "tel", defaultValue: defaultPhone, pattern: "[0-9]{10}", maxLength: 10, inputMode: "numeric" as const },
                { id: "email", label: "Email", type: "email", defaultValue: defaultEmail }
            ].map(({ id, label, type, defaultValue, ...rest }) => (
                <div key={id}>
                    <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                    <input id={id} name={id} type={type} required defaultValue={defaultValue}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition"
                        {...rest} />
                </div>
            ))}

            <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-center font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                {loading ? "Processing..." : fixedPrice === 0 ? "Register FREE →" : `Book Now — Pay ₹${fixedPrice} via UPI →`}
            </button>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
    );
}
