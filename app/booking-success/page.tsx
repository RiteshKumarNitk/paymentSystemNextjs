import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ orderId?: string }> };

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    pending: { label: "Payment Pending", icon: "⏳", color: "text-amber-600 bg-amber-50" },
    pending_verification: { label: "Under Verification", icon: "🔍", color: "text-blue-600 bg-blue-50" },
    confirmed: { label: "Booking Confirmed!", icon: "✅", color: "text-emerald-600 bg-emerald-50" },
    rejected: { label: "Payment Rejected", icon: "❌", color: "text-red-600 bg-red-50" },
    cancelled: { label: "Booking Cancelled", icon: "🚫", color: "text-slate-600 bg-slate-50" }
};

export default async function BookingSuccessPage({ searchParams }: Props) {
    const { orderId } = await searchParams;

    const booking = orderId
        ? await prisma.booking.findUnique({
            where: { orderId },
            include: { event: { select: { title: true, date: true, venue: true } } }
        })
        : null;

    const status = booking?.status ?? "pending_verification";
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_verification;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 py-8 text-center text-white">
                        <p className="text-5xl">{cfg.icon}</p>
                        <h1 className="mt-3 text-2xl font-extrabold">{cfg.label}</h1>
                    </div>

                    {booking ? (
                        <div className="p-6 space-y-4">
                            <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Event</span>
                                    <span className="font-semibold">{booking.event.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Booking ID</span>
                                    <span className="font-mono text-xs">{booking.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Name</span>
                                    <span className="font-medium">{booking.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-bold text-indigo-700">{booking.amount === 0 ? "FREE" : `₹${booking.amount}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">UTR</span>
                                    <span className="font-mono text-xs">{booking.utr ?? "—"}</span>
                                </div>
                            </div>

                            <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${cfg.color}`}>
                                {status === "pending_verification" && "Your payment is being verified. You'll be confirmed soon."}
                                {status === "confirmed" && "Your booking is confirmed! See you at the event."}
                                {status === "rejected" && "Your payment was rejected. Please contact support."}
                                {status === "pending" && "Awaiting your payment submission."}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-sm text-slate-500">
                            UTR submitted successfully. Admin will verify your payment shortly.
                        </div>
                    )}

                    <div className="flex gap-3 p-6 pt-0">
                        <Link href="/" className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Browse Events
                        </Link>
                        <Link href="/member/bookings" className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700">
                            My Bookings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
