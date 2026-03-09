"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TenantMemberLogoutButton({ tenantSlug }: { tenantSlug: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);
        await fetch(`/api/${tenantSlug}/member/logout`, { method: "POST" });
        router.push(`/${tenantSlug}/member/login`);
    }

    return (
        <button onClick={logout} disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">
            {loading ? "..." : "Sign Out"}
        </button>
    );
}
