"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["music", "tech", "sports", "food", "art", "comedy", "conference", "workshop", "general"];

export default function TenantEditEventPage({
    params
}: {
    params: Promise<{ tenantSlug: string, eventId: string }>
}) {
    const { tenantSlug, eventId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventData, setEventData] = useState<any>(null);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/${tenantSlug}/admin/events/${eventId}`);
                if (!res.ok) throw new Error("Failed to fetch event");
                const data = await res.json();
                setEventData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setFetching(false);
            }
        }
        fetchEvent();
    }, [tenantSlug, eventId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const dateStr = formData.get("date") as string;
        const timeStr = formData.get("time") as string;
        const dateTime = new Date(`${dateStr}T${timeStr}`);

        const payload = {
            title: formData.get("title"),
            description: formData.get("description"),
            date: dateTime.toISOString(),
            venue: formData.get("venue"),
            price: Number(formData.get("price") ?? 0),
            capacity: Number(formData.get("capacity") ?? 0),
            category: formData.get("category"),
            imageUrl: formData.get("imageUrl") || undefined,
            isActive: formData.get("isActive") === "on"
        };

        try {
            const res = await fetch(`/api/${tenantSlug}/admin/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update event");
            }

            router.push(`/${tenantSlug}/admin/events`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing Data...</div>;

    const defaultDate = eventData?.date ? new Date(eventData.date).toISOString().split('T')[0] : "";
    const defaultTime = eventData?.date ? new Date(eventData.date).toTimeString().split(' ')[0].slice(0, 5) : "";

    return (
        <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
            <div className="mb-10">
                <Link href={`/${tenantSlug}/admin/events`} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-widest">
                    ← Back to Events
                </Link>
                <h1 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">Edit Experience</h1>
                <p className="text-slate-500 font-medium">Modify existing event details for {tenantSlug}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-indigo-100 border border-slate-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Event Showcase Title</label>
                        <input name="title" required defaultValue={eventData?.title}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-inner" />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description & Details</label>
                        <textarea name="description" rows={5} required defaultValue={eventData?.description}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-inner resize-none font-medium" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Event Date</label>
                            <input name="date" type="date" required defaultValue={defaultDate}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Start Time</label>
                            <input name="time" type="time" required defaultValue={defaultTime}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Venue Location</label>
                        <input name="venue" required defaultValue={eventData?.venue}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Price (₹)</label>
                            <input name="price" type="number" min="0" defaultValue={eventData?.price}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-indigo-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Guest Capacity</label>
                            <input name="capacity" type="number" min="0" defaultValue={eventData?.capacity}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                            <select name="category" defaultValue={eventData?.category}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Promotional Image URL</label>
                        <input name="imageUrl" type="url" defaultValue={eventData?.imageUrl}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                    </div>

                    <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <input name="isActive" type="checkbox" defaultChecked={eventData?.isActive} className="h-6 w-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200" />
                        <div className="">
                            <p className="text-sm font-black text-slate-900 leading-tight">Publish to Global Portal</p>
                            <p className="text-xs text-slate-400 font-medium">Toggle visibility for this event in your organization portal.</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 animate-shake">
                        ⚠️ ERROR: {error}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 rounded-2xl border-2 border-slate-100 py-4 font-black text-slate-400 transition hover:bg-slate-50 active:scale-95">
                        Discard Changes
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-[2] rounded-2xl bg-slate-900 py-4 font-black text-white shadow-2xl shadow-slate-200 transition hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]">
                        {loading ? "Re-constructing..." : "Update Event Entry →"}
                    </button>
                </div>
            </form>
        </main>
    );
}
