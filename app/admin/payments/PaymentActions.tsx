"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  status: string;
};

export default function PaymentActions({ orderId, status }: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"verify" | "reject" | null>(null);
  const canModerate = status === "pending_verification";

  async function updateStatus(action: "verify" | "reject") {
    setLoadingAction(action);
    try {
      const response = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to update payment.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  }

  if (!canModerate) {
    return <span className="text-xs text-slate-400">No actions</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("verify")}
        disabled={loadingAction !== null}
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        {loadingAction === "verify" ? "Verifying..." : "Verify"}
      </button>
      <button
        onClick={() => updateStatus("reject")}
        disabled={loadingAction !== null}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        {loadingAction === "reject" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  );
}
