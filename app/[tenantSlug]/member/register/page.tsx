"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TenantMemberRegisterPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = use(params);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/${tenantSlug}/member/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password }),
            });

            if (res.ok) {
                router.push(`/${tenantSlug}/member/bookings`);
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("An error occurred during registration");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900">Join Community</h1>
                    <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-wider">{tenantSlug}</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 italic">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="10-digit number"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Security Password</label>
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
                        className="w-full rounded-2xl bg-slate-900 py-3.5 font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register Now"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already a member?{" "}
                    <Link href={`/${tenantSlug}/member/login`} className="font-bold text-indigo-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
