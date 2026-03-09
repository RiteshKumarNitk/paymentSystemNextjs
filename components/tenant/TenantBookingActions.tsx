"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    tenantSlug: string;
    bookingId: string;
    status: string
};

export default function TenantBookingActions({ tenantSlug, bookingId, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<"confirmed" | "rejected" | null>(null);

    if (status !== "pending_verification") {
        return (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                    status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-400"
                }`}>
                {status.replace(/_/g, " ")}
            </span>
        );
    }

    async function updateStatus(newStatus: "confirmed" | "rejected") {
        setLoading(newStatus);
        try {
            const res = await fetch(`/api/${tenantSlug}/admin/update-booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status: newStatus }),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (err) {
            console.error("Verification error:", err);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => updateStatus("confirmed")}
                disabled={loading !== null}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-50"
            >
                {loading === "confirmed" ? "..." : "Confirm"}
            </button>
            <button
                onClick={() => updateStatus("rejected")}
                disabled={loading !== null}
                className="rounded-xl border border-red-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
                {loading === "rejected" ? "..." : "Reject"}
            </button>
        </div>
    );
}
