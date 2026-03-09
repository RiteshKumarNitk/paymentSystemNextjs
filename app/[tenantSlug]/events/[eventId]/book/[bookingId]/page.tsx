import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import TenantUtrSubmitForm from "@/components/tenant/TenantUtrSubmitForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function buildUpiPaymentLink(vpa: string, name: string, amount: number, transactionId: string, note: string) {
    const params = new URLSearchParams({
        pa: vpa,
        pn: name,
        am: amount.toString(),
        tr: transactionId,
        tn: note,
        cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
}

export default async function TenantBookingQRPage({
    params
}: {
    params: Promise<{ tenantSlug: string, eventId: string, bookingId: string }>
}) {
    const { tenantSlug, eventId, bookingId } = await params;

    // 1. Fetch Booking and Event within Tenant context
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            eventId: eventId,
            tenant: { slug: tenantSlug }
        },
        include: {
            event: true,
            tenant: true
        },
    });

    if (!booking) {
        return notFound();
    }

    // Already confirmed? Redirect to success
    if (booking.status === "confirmed" || booking.status === "pending_verification") {
        return redirect(`/${tenantSlug}/booking-success?bookingId=${bookingId}`);
    }

    // Generate UPI Data using TENANT config
    const upiLink = buildUpiPaymentLink(
        booking.tenant.upiId,
        booking.tenant.upiName,
        booking.amount,
        booking.orderId,
        `Event: ${booking.event.title}`
    );

    const qrCodeDataUrl = await QRCode.toDataURL(upiLink, {
        width: 600,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="mx-auto max-w-xl">
                {/* Progress Header */}
                <div className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>1. Details</span>
                    <div className="h-0.5 w-12 bg-indigo-500"></div>
                    <span className="text-indigo-600">2. Payment</span>
                    <div className="h-0.5 w-12 bg-slate-200"></div>
                    <span>3. Confirmation</span>
                </div>

                <div className="overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-indigo-100 border border-slate-100">
                    <div className="bg-slate-900 px-8 py-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">💳</div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Checkout at {booking.tenant.name}</p>
                        <h1 className="text-3xl font-black tracking-tight">{booking.event.title}</h1>
                        <div className="mt-6 flex items-baseline gap-2">
                            <span className="text-4xl font-black">₹{booking.amount}</span>
                            <span className="text-sm font-medium text-slate-400 italic">Registration Fee</span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="mb-10 text-center">
                            <p className="mb-6 text-sm font-bold text-slate-500">Scan this QR to pay via any UPI App</p>
                            <div className="mx-auto mb-6 aspect-square max-w-[280px] rounded-3xl bg-white p-4 shadow-xl border-4 border-slate-50 relative group">
                                <img src={qrCodeDataUrl} alt="UPI QR Code" className="h-full w-full grayscale-[0.2] transition group-hover:grayscale-0" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[2px]">
                                    <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl">SECURE SCAN</span>
                                </div>
                            </div>
                            <a href={upiLink}
                                className="inline-flex h-14 items-center justify-center rounded-2xl bg-indigo-600 px-8 font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95">
                                Open in UPI App ↗
                            </a>
                        </div>

                        <div className="border-t border-slate-100 pt-10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Enter Transaction Details</h2>
                            </div>
                            <TenantUtrSubmitForm tenantSlug={tenantSlug} bookingId={booking.id} />
                            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase leading-relaxed text-center">
                                Submit the 12-digit UTR/Ref number from your payment app <br />to verify your reservation.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-xs text-slate-400 font-medium">
                    Having trouble? Contact support at <span className="text-slate-900">{booking.tenant.slug}@eventpass.io</span>
                </p>
            </div>
        </main>
    );
}
