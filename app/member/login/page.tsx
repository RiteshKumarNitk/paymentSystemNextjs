"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? "/member/payments";
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/member/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.get("email"),
                    password: formData.get("password")
                })
            });
            const data = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok || !data.success) throw new Error(data.error ?? "Login failed.");
            router.push(next);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
            <section className="w-full rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-semibold text-slate-900">Member Login</h1>
                <p className="mt-1 text-sm text-slate-500">Sign in to view your payment history.</p>

                <form action={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
                        <input id="email" name="email" type="email" required autoFocus
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
                        <input id="password" name="password" type="password" required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

                <p className="mt-5 text-center text-sm text-slate-500">
                    No account?{" "}
                    <Link href="/member/register" className="text-indigo-600 hover:underline">Register here</Link>
                </p>
            </section>
        </main>
    );
}

export default function MemberLoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}
