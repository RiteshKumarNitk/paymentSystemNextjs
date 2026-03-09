"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? "/admin/payments";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: formData.get("password") })
            });

            const data = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok || !data.success) {
                throw new Error(data.error ?? "Invalid password.");
            }

            router.push(next);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
            <section className="w-full rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
                <p className="mt-1 text-sm text-slate-500">Enter the admin password to continue.</p>

                <form action={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoFocus
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </section>
        </main>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
