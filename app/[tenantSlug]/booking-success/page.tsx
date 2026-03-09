import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenantBookingSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ tenantSlug: string }>;
    searchParams: Promise<{ bookingId: string }>;
}) {
    const { tenantSlug } = await params;
    const { bookingId } = await searchParams;

    if (!bookingId) return notFound();

    // 1. Fetch Booking with Tenant context
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            tenant: { slug: tenantSlug }
        },
        include: { event: true, tenant: true },
    });

    if (!booking) {
        return notFound();
    }

    const isConfirmed = booking.status === "confirmed";
    const isPendingVerification = booking.status === "pending_verification";

    return (
        <main className="min-h-screen bg-white py-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-lg text-center">
                {/* Status Indicator */}
                <div className="mb-8 flex justify-center">
                    <div className={`flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-2xl transition-all duration-700 ${isConfirmed ? "bg-emerald-500 shadow-emerald-100" :
                        isPendingVerification ? "bg-amber-500 shadow-amber-100 animate-pulse" :
                            "bg-slate-900 shadow-slate-200"
                        }`}>
                        <span className="text-4xl text-white">
                            {isConfirmed ? "✅" : isPendingVerification ? "⏳" : "📝"}
                        </span>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {isConfirmed ? "Booking Confirmed!" : "Request Submitted"}
                </h1>
                <p className="text-slate-500 font-medium text-lg mb-10 max-w-sm mx-auto">
                    {isConfirmed
                        ? `You're all set for ${booking.event.title}. We've sent the details to your email.`
                        : "We are currently verifying your payment. Your reservation status will be updated shortly."}
                </p>

                <div className="mb-10 rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black">{tenantSlug}</div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between border-b border-slate-200 pb-4">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Order ID</span>
                            <span className="text-sm font-bold text-slate-900 font-mono">#{booking.orderId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-4">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Event</span>
                            <span className="text-sm font-bold text-slate-900 truncate ml-4">{booking.event.title}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Amount Paid</span>
                            <span className="text-lg font-black text-indigo-600">₹{booking.amount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={`/${tenantSlug}/tickets/${bookingId}`}
                        className="rounded-2xl bg-indigo-600 px-8 py-4 font-black text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]">
                        View Secure Ticket
                    </Link>
                    <Link href={`/${tenantSlug}/member/bookings`}
                        className="rounded-2xl bg-white border border-slate-200 px-8 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
                        My Bookings
                    </Link>
                </div>

                <p className="mt-12 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {booking.tenant.name} • Official Receipt
                </p>
            </div>
        </main>
    );
}
