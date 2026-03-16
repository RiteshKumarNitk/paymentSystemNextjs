"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TenantData {
    id: string;
    name: string;
    slug: string;
    upiId: string;
    upiName: string;
    tagline: string | null;
    brandColor: string;
    logoUrl: string | null;
    isActive: boolean;
    razorpayKeyId: string | null;
    razorpayWebhookSecret: string | null;
    _count: {
        events: number;
        bookings: number;
        members: number;
        users: number;
    }
}

export default function TenantManagementPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = use(params);
    const [tenant, setTenant] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/super/tenants/${tenantId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setTenant(data);
            })
            .catch(() => setError("Failed to load tenant details"))
            .finally(() => setLoading(false));
    }, [tenantId]);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!tenant) return;
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/super/tenants/${tenantId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tenant),
            });

            if (res.ok) {
                router.refresh();
                alert("Organization configuration updated successfully");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update tenant");
            }
        } catch (err) {
            setError("Update failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you ABSOLUTELY sure? This will delete all events, bookings, and data for this organization. This cannot be undone.")) return;
        
        try {
            const res = await fetch(`/api/super/tenants/${tenantId}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/super");
            } else {
                alert("Failed to delete tenant");
            }
        } catch (err) {
            alert("Delete operation failed");
        }
    }

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    if (error || !tenant) return (
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
            <h1 className="text-2xl font-bold text-slate-900">⚠️ {error || "Tenant not found"}</h1>
            <Link href="/super" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Back to Workspace</Link>
        </main>
    );

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/super" className="mb-2 inline-block text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-widest">
                        ← Back to Overview
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        {tenant.name}
                        {tenant.isActive ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Active</span>
                        ) : (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Suspended</span>
                        )}
                    </h1>
                    <code className="text-xs text-slate-400 mt-1 block">ID: {tenant.id}</code>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleDelete}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 active:scale-95"
                    >
                        Terminate Org
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={saving}
                        className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-black text-white shadow-xl transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Syncing..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Stats Sidebar */}
                <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Events Hosted</span>
                                <span className="text-xl font-black text-slate-900">{tenant._count.events}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Active Members</span>
                                <span className="text-xl font-black text-slate-900">{tenant._count.members}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Bookings Count</span>
                                <span className="text-xl font-black text-slate-900">{tenant._count.bookings}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-slate-500">Staff Accounts</span>
                                <span className="text-xl font-black text-slate-900">{tenant._count.users}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">
                        <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Public Branding</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                                {tenant.logoUrl ? (
                                    <img src={tenant.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold">{tenant.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[150px]">{tenant.tagline || "No tagline"}</p>
                                <p className="text-[10px] text-indigo-200">Color: {tenant.brandColor}</p>
                            </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-white transition-all duration-500" style={{ width: '100%', backgroundColor: tenant.brandColor }}></div>
                        </div>
                    </div>
                </div>

                {/* Configuration Editor */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdate} className="space-y-8">
                        {/* Core Info */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6">General Settings</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Organization Display Name</label>
                                    <input 
                                        type="text"
                                        value={tenant.name}
                                        onChange={e => setTenant({...tenant, name: e.target.value})}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Tenant Status</label>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setTenant({...tenant, isActive: !tenant.isActive})}
                                            className={`relative h-7 w-14 rounded-full transition-colors duration-200 focus:outline-none ${tenant.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <span className={`absolute left-1 top-1 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${tenant.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="text-sm font-medium text-slate-600">
                                            {tenant.isActive ? "Organization is Live" : "Organization Suspended"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Identifier</label>
                                    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-400 select-none">
                                        <code>{window.location.host}/</code>
                                        <code className="text-slate-900 font-bold">{tenant.slug}</code>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Slug cannot be changed after creation.</p>
                                </div>
                            </div>
                        </section>

                        {/* Payment Config */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                💳 Payments & Gateway
                                <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 rounded-full">Secure</span>
                            </h2>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Merchant UPI ID</label>
                                        <input 
                                            type="text"
                                            value={tenant.upiId}
                                            onChange={e => setTenant({...tenant, upiId: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name on UPI</label>
                                        <input 
                                            type="text"
                                            value={tenant.upiName}
                                            onChange={e => setTenant({...tenant, upiName: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Razorpay Integration</h4>
                                        <span className="text-[10px] text-slate-400 italic">Required for automated status</span>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Razorpay Key ID</label>
                                            <input 
                                                type="text"
                                                value={tenant.razorpayKeyId || ""}
                                                onChange={e => setTenant({...tenant, razorpayKeyId: e.target.value})}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                                                placeholder="rzp_live_..."
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Webhook Secret</label>
                                            <input 
                                                type="password"
                                                value={tenant.razorpayWebhookSecret || ""}
                                                onChange={e => setTenant({...tenant, razorpayWebhookSecret: e.target.value})}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                                                placeholder="••••••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Branding */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 font-medium">Bespoke Branding</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline / Mission</label>
                                    <input 
                                        type="text"
                                        value={tenant.tagline || ""}
                                        onChange={e => setTenant({...tenant, tagline: e.target.value})}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Essence Color</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color"
                                            value={tenant.brandColor}
                                            onChange={e => setTenant({...tenant, brandColor: e.target.value})}
                                            className="h-12 w-16 cursor-pointer rounded-xl bg-slate-100 p-1"
                                        />
                                        <input 
                                            type="text"
                                            value={tenant.brandColor}
                                            onChange={e => setTenant({...tenant, brandColor: e.target.value})}
                                            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo Asset URL</label>
                                    <input 
                                        type="url"
                                        value={tenant.logoUrl || ""}
                                        onChange={e => setTenant({...tenant, logoUrl: e.target.value})}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                                        placeholder="https://cdn.com/logo.png"
                                    />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>
            </div>
        </main>
    );
}
