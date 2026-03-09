"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MemberLogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);
        await fetch("/api/member/logout", { method: "POST" });
        router.push("/member/login");
    }

    return (
        <button onClick={handleLogout} disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">
            {loading ? "Logging out..." : "Logout"}
        </button>
    );
}
