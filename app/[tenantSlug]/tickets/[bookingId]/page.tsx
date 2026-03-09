import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TicketPage({
    params
}: {
    params: Promise<{ tenantSlug: string; bookingId: string }>;
}) {
    const { tenantSlug, bookingId } = await params;

    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            tenant: { slug: tenantSlug }
        },
        include: { event: true, tenant: true, member: true }
    });

    if (!booking) return notFound();

    const isConfirmed = booking.status === "confirmed";
    const brandColor = booking.tenant.brandColor || "#4F46E5";

    // Format the date
    const eventDate = new Date(booking.event.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const eventTime = new Date(booking.event.date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Simple QR URL (using public API for reliability without local heavy libs)
    // In production, we'd use a local lib like 'qrcode' or a signed JWT
    const qrData = JSON.stringify({
        id: booking.id,
        orderId: booking.orderId,
        tenant: tenantSlug
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=${brandColor.replace('#', '')}&bgcolor=FFFFFF`;

    return (
        <main className="min-h-screen bg-slate-900 px-6 py-12 flex flex-col items-center">
            {/* Header / Brand */}
            <div className="mb-10 text-center">
                <Link href={`/${tenantSlug}`}>
                    {booking.tenant.logoUrl ? (
                        <img src={booking.tenant.logoUrl} alt={booking.tenant.name} className="h-12 mx-auto mb-4 object-contain" />
                    ) : (
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase">{booking.tenant.name}</h1>
                    )}
                </Link>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Official Entry Pass</p>
            </div>

            {/* The Ticket Card */}
            <div className="w-full max-w-sm relative group">
                {/* Decorative cutouts */}
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-900 border border-slate-800 z-20"></div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-900 border border-slate-800 z-20"></div>

                <div className="overflow-hidden rounded-[3rem] bg-white shadow-2xl relative">
                    {/* Top Section: Event Banner */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        {booking.event.imageUrl ? (
                            <img src={booking.event.imageUrl} alt={booking.event.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-6xl">🎫</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-8 right-8">
                            <h2 className="text-2xl font-black text-white leading-tight line-clamp-2">{booking.event.title}</h2>
                        </div>
                    </div>

                    {/* Middle Section: QR Code */}
                    <div className="p-8 text-center bg-white border-b-2 border-dashed border-slate-100 relative">
                        {isConfirmed ? (
                            <div className="relative inline-block p-4 rounded-3xl bg-slate-50 border-2 border-slate-100">
                                <img src={qrUrl} alt="Ticket QR Code" className="h-48 w-48 mx-auto" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                    <span className="text-4xl font-black rotate-45">{booking.tenant.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-48 flex flex-col items-center justify-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
                                <span className="text-4xl mb-4">⏳</span>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verification Pending</p>
                            </div>
                        )}
                        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            {isConfirmed ? "Scan at Entrance" : "Review in Progress"}
                        </p>
                    </div>

                    {/* Bottom Section: Details */}
                    <div className="p-8 pt-10 grid grid-cols-2 gap-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Attendee</p>
                            <p className="text-sm font-bold text-slate-900">{booking.member?.name || booking.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order Ref</p>
                            <p className="text-sm font-bold text-slate-900 font-mono">#{booking.orderId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                            <p className="text-sm font-bold text-slate-900">{eventDate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p>
                            <p className="text-sm font-bold text-slate-900">{eventTime}</p>
                        </div>
                        <div className="col-span-2 pt-4 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: isConfirmed ? '#10b981' : '#f59e0b' }}></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Status: {booking.status}
                            </span>
                        </div>
                    </div>

                    {/* Branding accent */}
                    <div className="h-3 w-full" style={{ backgroundColor: brandColor }}></div>
                </div>
            </div>

            {/* Back to Portal */}
            <Link href={`/${tenantSlug}`} className="mt-12 text-sm font-bold text-slate-500 hover:text-white transition uppercase tracking-widest">
                ← Back to Portal
            </Link>

            <footer className="mt-auto pt-12 text-center">
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.5em]">Valid for single entry only • Non-transferable</p>
            </footer>
        </main>
    );
}
