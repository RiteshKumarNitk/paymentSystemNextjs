"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFormPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.get("title"),
                    description: formData.get("description"),
                    amount: Number(formData.get("amount") ?? 0),
                    isActive: formData.get("isActive") === "on"
                })
            });
            const data = (await res.json()) as { id?: string; error?: string };
            if (!res.ok || !data.id) throw new Error(data.error ?? "Failed to create form.");
            router.push("/admin/forms");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create form.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
            <section className="rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-semibold">Create Payment Form</h1>
                <p className="mt-1 text-sm text-slate-500">
                    This form will appear on the public dashboard for customers to pay.
                </p>

                <form action={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="title" className="mb-1 block text-sm font-medium">Form Title</label>
                        <input id="title" name="title" required placeholder="e.g. Event Registration Fee"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
                        <textarea id="description" name="description" rows={3} required
                            placeholder="Describe what this payment is for..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600 resize-none" />
                    </div>
                    <div>
                        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
                            Amount (₹) — enter <span className="font-semibold">0</span> to let the customer choose
                        </label>
                        <input id="amount" name="amount" type="number" min="0" step="1" defaultValue="0"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
                    </div>
                    <div className="flex items-center gap-3">
                        <input id="isActive" name="isActive" type="checkbox" defaultChecked
                            className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Active (visible on public dashboard)
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => router.back()}
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                            {loading ? "Creating..." : "Create Form"}
                        </button>
                    </div>
                </form>

                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </section>
        </main>
    );
}
