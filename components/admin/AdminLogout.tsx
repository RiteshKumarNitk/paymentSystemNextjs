"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogout() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    async function logout() {
        setLoading(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    }
    return (
        <button onClick={logout} disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">
            {loading ? "..." : "Logout"}
        </button>
    );
}
