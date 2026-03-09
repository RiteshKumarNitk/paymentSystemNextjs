"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { formId: string; fixedAmount: number };

export default function FormPaymentForm({ formId, fixedAmount }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const amount = fixedAmount > 0 ? fixedAmount : Number(formData.get("amount") ?? 0);
            const payload = {
                formId,
                name: String(formData.get("name") ?? "").trim(),
                phone: String(formData.get("phone") ?? "").trim(),
                email: String(formData.get("email") ?? "").trim(),
                purpose: "form",
                amount
            };
            const res = await fetch("/api/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = (await res.json()) as { orderId?: string; error?: string };
            if (!res.ok || !data.orderId) throw new Error(data.error ?? "Failed to create payment.");
            router.push(`/forms/${formId}/pay/${data.orderId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="mt-6 space-y-4">
            {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                { id: "phone", label: "Phone", type: "tel", placeholder: "10-digit mobile number", pattern: "[0-9]{10}", maxLength: 10, inputMode: "numeric" as const },
                { id: "email", label: "Email", type: "email", placeholder: "your@email.com" }
            ].map(({ id, label, type, placeholder, ...rest }) => (
                <div key={id}>
                    <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
                    <input id={id} name={id} type={type} placeholder={placeholder} required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                        {...rest} />
                </div>
            ))}

            {fixedAmount === 0 && (
                <div>
                    <label htmlFor="amount" className="mb-1 block text-sm font-medium">Amount (₹)</label>
                    <input id="amount" name="amount" type="number" min="1" step="1" required
                        placeholder="Enter amount in rupees"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" />
                </div>
            )}

            <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                {loading ? "Processing..." : fixedAmount > 0 ? `Pay ₹${fixedAmount} via UPI →` : "Generate UPI QR →"}
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
    );
}
