"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["general", "music", "tech", "sports", "food", "art", "comedy", "conference", "workshop"];

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.get("title"),
                    description: formData.get("description"),
                    date: formData.get("date"),
                    time: formData.get("time"),
                    venue: formData.get("venue"),
                    price: Number(formData.get("price") ?? 0),
                    capacity: Number(formData.get("capacity") ?? 0),
                    category: formData.get("category"),
                    imageUrl: formData.get("imageUrl") || undefined,
                    isActive: formData.get("isActive") === "on"
                })
            });
            const data = (await res.json()) as { id?: string; error?: string };
            if (!res.ok || !data.id) throw new Error(data.error ?? "Failed to create event.");
            router.push("/admin/events");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create event.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-2xl min-h-screen px-4 py-8">
            <div className="mb-5">
                <Link href="/admin/events" className="text-sm text-slate-500 hover:text-slate-700">← Back to Events</Link>
                <h1 className="mt-2 text-2xl font-bold">Create New Event</h1>
            </div>

            <form action={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
                <div>
                    <label htmlFor="title" className="mb-1 block text-sm font-semibold">Event Title *</label>
                    <input id="title" name="title" required placeholder="e.g. Tech Summit 2026"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                </div>

                <div>
                    <label htmlFor="description" className="mb-1 block text-sm font-semibold">Description *</label>
                    <textarea id="description" name="description" rows={4} required
                        placeholder="Tell attendees about this event..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="mb-1 block text-sm font-semibold">Date *</label>
                        <input id="date" name="date" type="date" required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                    </div>
                    <div>
                        <label htmlFor="time" className="mb-1 block text-sm font-semibold">Time *</label>
                        <input id="time" name="time" type="time" required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                    </div>
                </div>

                <div>
                    <label htmlFor="venue" className="mb-1 block text-sm font-semibold">Venue *</label>
                    <input id="venue" name="venue" required placeholder="e.g. NSCI Dome, Mumbai"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="price" className="mb-1 block text-sm font-semibold">Price (₹)</label>
                        <input id="price" name="price" type="number" min="0" step="1" defaultValue="0"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                        <p className="mt-1 text-xs text-slate-400">0 = Free</p>
                    </div>
                    <div>
                        <label htmlFor="capacity" className="mb-1 block text-sm font-semibold">Capacity</label>
                        <input id="capacity" name="capacity" type="number" min="0" step="1" defaultValue="0"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                        <p className="mt-1 text-xs text-slate-400">0 = Unlimited</p>
                    </div>
                    <div>
                        <label htmlFor="category" className="mb-1 block text-sm font-semibold">Category</label>
                        <select id="category" name="category"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition capitalize">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="imageUrl" className="mb-1 block text-sm font-semibold">Banner Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input id="imageUrl" name="imageUrl" type="url" placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white transition" />
                </div>

                <div className="flex items-center gap-3">
                    <input id="isActive" name="isActive" type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                    <label htmlFor="isActive" className="text-sm font-medium">Publish immediately (visible to public)</label>
                </div>

                {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                        {loading ? "Creating..." : "Create Event"}
                    </button>
                </div>
            </form>
        </main>
    );
}
