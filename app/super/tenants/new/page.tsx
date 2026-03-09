"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTenantPage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [upiId, setUpiId] = useState("");
    const [upiName, setUpiName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [tagline, setTagline] = useState("");
    const [brandColor, setBrandColor] = useState("#4F46E5");
    const [logoUrl, setLogoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/super/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug: slug.toLowerCase().replace(/\s+/g, "-"),
                    upiId,
                    upiName,
                    tagline,
                    brandColor,
                    logoUrl,
                    adminEmail,
                    adminPassword,
                }),
            });

            if (res.ok) {
                router.push("/super");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create tenant");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto min-h-screen max-w-2xl px-4 py-12">
            <Link href="/super" className="mb-6 inline-block text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
                ← Back to Workspace
            </Link>
            <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Onboard New Organization</h1>
                <p className="text-slate-500 mb-8">Setup a new tenant with its own UPI configuration and admin account.</p>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium italic">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tagline / Mission</label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="e.g., Best events in Mumbai"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Brand Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="h-12 w-20 rounded-xl border-none p-1 cursor-pointer bg-slate-50 shadow-inner"
                                />
                                <input
                                    type="text"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono uppercase"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Logo URL</label>
                            <input
                                type="url"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="https://cdn.com/logo.png"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="e.g., Grand Palace Hotel"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono text-sm"
                                placeholder="grand-palace"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            💳 UPI Configuration
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">VPA / UPI ID</label>
                                <input
                                    type="text"
                                    required
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    placeholder="merchant@vpa"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Merchant Name</label>
                                <input
                                    type="text"
                                    required
                                    value={upiName}
                                    onChange={(e) => setUpiName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    placeholder="Grand Palace Enterprises"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            👤 Primary Admin Account
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Admin Email</label>
                                <input
                                    type="email"
                                    required
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    placeholder="admin@brand.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Admin Password</label>
                                <input
                                    type="password"
                                    required
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl transition hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {loading ? "Provisioning Organization..." : (
                            <>
                                Confirm and Create Tenant
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
