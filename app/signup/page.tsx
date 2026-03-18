"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlobalHeader from "@/components/shared/GlobalHeader";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        tenantName: "",
        tenantSlug: "",
        upiId: "",
        upiName: "",
        adminEmail: "",
        adminPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate slug from name if slug hasn't been manually edited much
            ...(name === 'tenantName' && prev.tenantSlug.length < 3 ? {
                tenantSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            } : {})
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect straight to their new admin dashboard
                router.push(`/${data.tenantSlug}/admin`);
            } else {
                const data = await res.json();
                setError(data.error || "Signup failed. Please try again.");
            }
        } catch (err) {
            setError("A network error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <GlobalHeader />

            <div className="flex items-center justify-center px-4 py-24">
                <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-50 blur-[80px]"></div>

                    <div className="relative z-10">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Launch Your Workspace</h1>
                            <p className="text-slate-500 font-medium">Create your organization and start selling tickets in minutes.</p>
                        </div>

                        {error && (
                            <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100 flex items-center gap-3">
                                <span className="text-xl">⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Organization Details */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">1. Organization Details</h3>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Workspace Name</label>
                                    <input
                                        type="text"
                                        name="tenantName"
                                        required
                                        value={formData.tenantName}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                                        placeholder="e.g. Acme Events"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Claim Your URL</label>
                                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                                        <span className="px-5 text-slate-400 font-medium select-none text-sm">jaipurfest.com/</span>
                                        <input
                                            type="text"
                                            name="tenantSlug"
                                            required
                                            value={formData.tenantSlug}
                                            onChange={handleChange}
                                            className="w-full bg-white px-4 py-4 focus:outline-none text-indigo-600 font-bold"
                                            placeholder="acme"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">This will be your public directory link.</p>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">2. Payment Collection</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Merchant UPI ID</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            required
                                            value={formData.upiId}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm font-mono text-sm"
                                            placeholder="merchant@upi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Banking Name</label>
                                        <input
                                            type="text"
                                            name="upiName"
                                            required
                                            value={formData.upiName}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                                            placeholder="Acme Pvt Ltd"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Admin Account */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">3. Administrator Account</h3>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        required
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                                        placeholder="founder@acme.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
                                    <input
                                        type="password"
                                        name="adminPassword"
                                        required
                                        minLength={8}
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                                        placeholder="At least 8 characters"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl bg-indigo-600 py-5 font-bold text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? "Provisioning Workspace..." : "Create Workspace"}
                                </button>
                                <p className="text-center text-xs font-medium text-slate-400 mt-6">
                                    By clicking "Create Workspace" you agree to JaipurFest's Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
