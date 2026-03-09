"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm") as string;
        if (password !== confirm) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("/api/member/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    phone: formData.get("phone"),
                    email: formData.get("email"),
                    password
                })
            });
            const data = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok || !data.success) throw new Error(data.error ?? "Registration failed.");
            router.push("/member/payments");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 py-10">
            <section className="w-full rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
                <p className="mt-1 text-sm text-slate-500">Register to track your payments.</p>

                <form action={handleSubmit} className="mt-6 space-y-4">
                    {[
                        { id: "name", label: "Full Name", type: "text" },
                        { id: "phone", label: "Phone (10 digits)", type: "tel", pattern: "[0-9]{10}", maxLength: 10 },
                        { id: "email", label: "Email", type: "email" },
                        { id: "password", label: "Password (min 6 chars)", type: "password" },
                        { id: "confirm", label: "Confirm Password", type: "password" }
                    ].map(({ id, label, type, ...rest }) => (
                        <div key={id}>
                            <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
                            <input id={id} name={id} type={type} required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
                                {...rest} />
                        </div>
                    ))}
                    <button type="submit" disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

                <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link href="/member/login" className="text-indigo-600 hover:underline">Sign in</Link>
                </p>
            </section>
        </main>
    );
}
