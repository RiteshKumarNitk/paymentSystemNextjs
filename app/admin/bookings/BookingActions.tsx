"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { orderId: string; status: string };

export default function BookingActions({ orderId, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<"verify" | "reject" | null>(null);

    if (!["pending_verification"].includes(status)) {
        return <span className="text-xs text-slate-400 capitalize">{status.replace(/_/g, " ")}</span>;
    }

    async function act(action: "verify" | "reject") {
        setLoading(action);
        await fetch("/api/admin/verify-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, action })
        });
        router.refresh();
        setLoading(null);
    }

    return (
        <div className="flex gap-2">
            <button onClick={() => act("verify")} disabled={loading !== null}
                className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50">
                {loading === "verify" ? "..." : "✓ Verify"}
            </button>
            <button onClick={() => act("reject")} disabled={loading !== null}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50">
                {loading === "reject" ? "..." : "✗ Reject"}
            </button>
        </div>
    );
}
