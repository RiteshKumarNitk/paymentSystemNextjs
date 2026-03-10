"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SuperLogout() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);
        try {
            const res = await fetch("/api/super/logout", { method: "POST" });
            if (res.ok) {
                router.push("/super/login");
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
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
        >
            {loading ? "..." : "Exit Workspace"}
        </button>
    );
}
