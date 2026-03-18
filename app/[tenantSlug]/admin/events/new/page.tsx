"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["music", "tech", "sports", "food", "art", "comedy", "conference", "workshop", "general"];
const TIMEZONES = ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"];
const VISIBILITIES = ["PUBLIC", "PRIVATE", "UNLISTED"];

type TicketTierInput = {
    id: string; // temp id for maps
    name: string;
    price: number;
    capacity: number;
};

export default function TenantNewEventPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tiers, setTiers] = useState<TicketTierInput[]>([
        { id: "1", name: "General Admission", price: 0, capacity: 100 }
    ]);

    const addTier = () => {
        setTiers([...tiers, { id: Math.random().toString(), name: "", price: 0, capacity: 0 }]);
    };

    const updateTier = (id: string, field: keyof TicketTierInput, value: string | number) => {
        setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTier = (id: string) => {
        if (tiers.length === 1) return; // Must have at least one
        setTiers(tiers.filter(t => t.id !== id));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        
        // Combine date and time
        const startStr = `${formData.get("startDate")}T${formData.get("startTime")}`;
        const endStr = `${formData.get("endDate")}T${formData.get("endTime")}`;

        const payload = {
            title: formData.get("title"),
            description: formData.get("description"),
            startDate: new Date(startStr).toISOString(),
            endDate: new Date(endStr).toISOString(),
            timezone: formData.get("timezone"),
            venue: formData.get("venue"),
            venueAddress: formData.get("venueAddress") || null,
            venueMapUrl: formData.get("venueMapUrl") || null,
            category: formData.get("category"),
            visibility: formData.get("visibility"),
            imageUrl: formData.get("imageUrl") || null,
            isActive: formData.get("isActive") === "on",
            ticketTiers: tiers.map(t => ({
                name: t.name,
                price: Number(t.price),
                capacity: Number(t.capacity)
            }))
        };

        try {
            const res = await fetch(`/api/${tenantSlug}/admin/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create event");

            router.push(`/${tenantSlug}/admin/events`);
        } catch (err: any) {
            setError(err.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
            <div className="mb-10">
                <Link href={`/${tenantSlug}/admin/events`} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-widest">
                    ← Back to Events
                </Link>
                <h1 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">Event Builder</h1>
                <p className="text-slate-500 font-medium">Design a complete event experience with advanced ticketing and scheduling.</p>
            </div>

            {error && (
                <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-center gap-3">
                    <span className="text-xl">⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* SETTING 1: BASIC INFO */}
                <section className="rounded-[2.5rem] bg-white p-10 shadow border border-slate-100">
                    <div className="mb-8 border-b border-slate-50 pb-6">
                        <h2 className="text-2xl font-black text-slate-900">1. Core Details</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">The fundamental information about your event.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Event Title</label>
                            <input name="title" required placeholder="e.g., Midnight Jazz Session"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description & Details</label>
                            <textarea name="description" rows={5} required placeholder="What makes this event special?"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-none font-medium" />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                                <select name="category" defaultValue="general"
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Promotional Image URL</label>
                                <input name="imageUrl" type="url" placeholder="https://unsplash.com/..."
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SETTING 2: DATE & LOCATION */}
                <section className="rounded-[2.5rem] bg-white p-10 shadow border border-slate-100">
                    <div className="mb-8 border-b border-slate-50 pb-6">
                        <h2 className="text-2xl font-black text-slate-900">2. Date & Venue</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">When and where is it happening?</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Start Date</label>
                                <input name="startDate" type="date" required
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Start Time</label>
                                <input name="startTime" type="time" required
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">End Date</label>
                                <input name="endDate" type="date" required
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">End Time</label>
                                <input name="endTime" type="time" required
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Timezone</label>
                            <select name="timezone" defaultValue="Asia/Kolkata"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                            </select>
                        </div>

                        <div className="h-px w-full bg-slate-100 my-8"></div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Venue Name</label>
                            <input name="venue" required placeholder="e.g., The Skyline Lounge"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Address (Optional)</label>
                                <input name="venueAddress" placeholder="Street, City, Zip"
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Google Maps URL (Optional)</label>
                                <input name="venueMapUrl" type="url" placeholder="https://maps.app.goo.gl/..."
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SETTING 3: TICKETING ENGINE */}
                <section className="rounded-[2.5rem] bg-indigo-900 p-10 shadow-xl border border-indigo-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="mb-8 border-b border-white/10 pb-6 relative z-10">
                        <h2 className="text-2xl font-black text-white">3. Ticket Tiers</h2>
                        <p className="text-sm text-indigo-200 font-medium mt-1">Configure pricing and capacity logic.</p>
                    </div>

                    <div className="space-y-4 relative z-10 w-full overflow-x-auto">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-300 px-4 min-w-[600px]">
                            <div className="col-span-5">Ticket Name</div>
                            <div className="col-span-3">Price (₹)</div>
                            <div className="col-span-3">Capacity limit</div>
                            <div className="col-span-1 text-center">Action</div>
                        </div>

                        {tiers.map((tier, index) => (
                            <div key={tier.id} className="grid grid-cols-12 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 items-center min-w-[600px] transition hover:bg-white/10">
                                <div className="col-span-5">
                                    <input required placeholder="e.g. VIP Pass" value={tier.name} onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                                        className="w-full bg-transparent text-white font-bold placeholder:text-white/30 focus:outline-none px-2 py-1" />
                                </div>
                                <div className="col-span-3 flex items-center gap-2 border-l border-white/10 pl-4">
                                    <span className="text-indigo-400 font-bold">₹</span>
                                    <input type="number" min="0" required placeholder="0" value={tier.price} onChange={(e) => updateTier(tier.id, 'price', e.target.value)}
                                        className="w-full bg-transparent text-white font-bold placeholder:text-white/30 focus:outline-none py-1" />
                                </div>
                                <div className="col-span-3 flex items-center gap-2 border-l border-white/10 pl-4">
                                    <span className="text-indigo-400 font-bold">Qty</span>
                                    <input type="number" min="0" required placeholder="100" value={tier.capacity} onChange={(e) => updateTier(tier.id, 'capacity', e.target.value)}
                                        className="w-full bg-transparent text-white font-bold placeholder:text-white/30 focus:outline-none py-1" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button type="button" onClick={() => removeTier(tier.id)} disabled={tiers.length === 1}
                                        className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-white/30 font-bold" title="Remove Tier">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addTier}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                            + Add Ticket Tier
                        </button>
                    </div>
                </section>

                {/* SETTING 4: VISIBILITY */}
                <section className="rounded-[2.5rem] bg-white p-10 shadow border border-slate-100">
                    <div className="mb-8 border-b border-slate-50 pb-6">
                        <h2 className="text-2xl font-black text-slate-900">4. Visibility & Access</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Control who can see and book this event.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2 border-b border-slate-50 pb-8">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Event Visibility</label>
                                <select name="visibility" defaultValue="PUBLIC"
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                                    {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <p className="mt-3 text-[10px] font-bold text-slate-400">PUBLIC: Found on portal. PRIVATE: Needs approval. UNLISTED: Hidden link only.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <input name="isActive" type="checkbox" defaultChecked className="h-6 w-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200" />
                            <div className="">
                                <p className="text-sm font-black text-slate-900 leading-tight">Enable Live Booking</p>
                                <p className="text-xs text-slate-400 font-medium">Turn off to hide the booking form and show "Coming Soon".</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex gap-4 sticky bottom-8 bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 rounded-2xl border-2 border-slate-100 py-4 font-black text-slate-400 transition hover:bg-slate-50 active:scale-95 text-center">
                        Discard
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:opacity-50 active:scale-[0.98] text-center">
                        {loading ? "Constructing Event..." : "Publish Event Now →"}
                    </button>
                </div>
            </form>
        </main>
    );
}
