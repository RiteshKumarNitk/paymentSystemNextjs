"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TenantMemberLoginPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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
            const res = await fetch(`/api/${tenantSlug}/member/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push(`/${tenantSlug}/member/bookings`);
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
                    <h1 className="text-3xl font-extrabold text-slate-900">Member Login</h1>
                    <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-wider">{tenantSlug}</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 italic">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="alex@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link href={`/${tenantSlug}/member/register`} className="font-bold text-indigo-600 hover:underline">
                        Register Now
                    </Link>
                </p>
            </div>
        </div>
    );
}
