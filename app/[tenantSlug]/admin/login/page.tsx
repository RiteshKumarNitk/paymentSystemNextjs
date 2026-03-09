"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TenantAdminLoginPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = use(params);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/${tenantSlug}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push(`/${tenantSlug}/admin`);
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred during login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900">Admin Login</h1>
                    <p className="text-sm text-slate-500 font-medium bg-indigo-50 inline-block px-3 py-1 rounded-full mt-2 uppercase tracking-widest text-[#4f46e5]">
                        {tenantSlug}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 italic">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-300"
                            placeholder="you@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-200 transition hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? "Authenticating..." : "Access Dashboard →"}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                    Managed by <span className="font-bold text-indigo-600">EventPass</span> Infrastructure
                </p>
            </div>
        </div>
    );
}
