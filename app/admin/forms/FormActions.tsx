"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { formId: string; isActive: boolean };

export default function FormActions({ formId, isActive }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<"toggle" | "delete" | null>(null);

    async function toggle() {
        setLoading("toggle");
        await fetch(`/api/admin/forms/${formId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive })
        });
        router.refresh();
        setLoading(null);
    }

    async function remove() {
        if (!confirm("Delete this form? All linked payments will remain.")) return;
        setLoading("delete");
        await fetch(`/api/admin/forms/${formId}`, { method: "DELETE" });
        router.refresh();
        setLoading(null);
    }

    return (
        <>
            <button onClick={toggle} disabled={loading !== null}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${isActive
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}>
                {loading === "toggle" ? "..." : isActive ? "Deactivate" : "Activate"}
            </button>
            <button onClick={remove} disabled={loading !== null}
                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50">
                {loading === "delete" ? "Deleting..." : "Delete"}
            </button>
        </>
    );
}
