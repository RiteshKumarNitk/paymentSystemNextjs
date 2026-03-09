import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ orderId?: string }>;
};

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending Payment", color: "bg-amber-100 text-amber-700" },
    pending_verification: { label: "Pending Verification", color: "bg-blue-100 text-blue-700" },
    verified: { label: "Verified ✓", color: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" }
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
    const { orderId } = await searchParams;

    if (!orderId) {
        notFound();
    }

    const payment = await prisma.userPayment.findUnique({ where: { orderId } });

    if (!payment) {
        notFound();
    }

    const badge = statusLabels[payment.status] ?? { label: payment.status, color: "bg-slate-100 text-slate-700" };

    return (
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8">
            <section className="w-full rounded-xl bg-white p-8 shadow text-center">
                {/* Icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
                    ✓
                </div>

                <h1 className="text-2xl font-semibold text-slate-900">UTR Submitted!</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Your payment reference has been recorded. The admin will verify and confirm shortly.
                </p>

                {/* Payment details */}
                <div className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-left text-slate-700">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Order ID</span>
                        <span className="font-mono font-medium">{payment.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium">{payment.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium">INR {payment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Purpose</span>
                        <span className="capitalize font-medium">{payment.purpose}</span>
                    </div>
                    {payment.utr && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">UTR</span>
                            <span className="font-mono font-medium">{payment.utr}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Status</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                            {badge.label}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    <Link
                        href="/pay"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                    >
                        Make Another Payment
                    </Link>
                    <Link
                        href="/"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to Home
                    </Link>
                </div>
            </section>
        </main>
    );
}
