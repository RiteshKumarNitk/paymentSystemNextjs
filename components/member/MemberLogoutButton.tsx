"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function MemberLogoutButton() {
    const router = useRouter();
    const params = useParams();
    const tenantSlug = params.tenantSlug as string;
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);
        try {
            const res = await fetch(`/api/${tenantSlug}/member/logout`, { method: "POST" });
            if (res.ok) {
                router.push(`/${tenantSlug}/member/login`);
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={logout}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
        >
            {loading ? "..." : "Sign Out"}
        </button>
    );
}
