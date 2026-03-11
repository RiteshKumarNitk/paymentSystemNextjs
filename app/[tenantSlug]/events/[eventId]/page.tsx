import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TenantBookingForm from "@/components/tenant/TenantBookingForm";

export const dynamic = "force-dynamic";

export default async function TenantEventDetailPage({
    params
}: {
    params: Promise<{ tenantSlug: string, eventId: string }>
}) {
    const { tenantSlug, eventId } = await params;

    // 1. Fetch Event with Tenant context
    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            tenant: { slug: tenantSlug }
        },
        include: {
            tenant: true,
            _count: {
                select: { bookings: { where: { status: "confirmed" } } }
            }
        }
    });

    if (!event || !event.isActive) {
        return notFound();
    }

    const seatsLeft = event.capacity > 0 ? event.capacity - event._count.bookings : null;
    const isSoldOut = seatsLeft !== null && seatsLeft <= 0;

    return (
        <div className="min-h-screen bg-white">
            {/* Mini Breadcrumb Header */}
            <div className="border-b border-slate-50 bg-slate-50/50 py-3 px-4">
                <div className="mx-auto max-w-5xl flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Link href={`/${tenantSlug}`} className="hover:text-indigo-600 transition">{event.tenant.name}</Link>
                    <span>/</span>
                    <span className="text-slate-900 line-clamp-1">{event.title}</span>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-2xl shadow-indigo-100 border border-slate-100/50 aspect-video relative group">
                            {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-6xl opacity-40">🖼️</div>
                            )}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className="rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                                    {event.category}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight sm:text-5xl">{event.title}</h1>

                        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100/50">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Date</p>
                                <p className="font-bold text-slate-800 leading-tight">
                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100/50">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Venue</p>
                                <p className="font-bold text-slate-800 leading-tight truncate">{event.venue}</p>
                                <p className="text-xs text-slate-500 mt-1 font-bold text-indigo-500 cursor-pointer hover:underline">View Map ↗</p>
                            </div>
                            <div className="hidden sm:block rounded-3xl bg-slate-50 p-5 border border-slate-100/50 text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Pricing</p>
                                <p className="text-2xl font-black text-indigo-600">
                                    {event.price === 0 ? "FREE" : `₹${event.price}`}
                                </p>
                            </div>
                        </div>

                        <div className="prose max-w-none text-slate-600 leading-relaxed font-medium">
                            <h3 className="text-slate-900 font-black text-xl mb-4">About this event</h3>
                            {event.description.split('\n').map((para: string, i: number) => (
                                <p key={i} className="mb-4 whitespace-pre-wrap">{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Sticky Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-indigo-100 overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>

                            <div className="relative mb-6">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">Gate Pass</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">
                                        {event.price === 0 ? "Gratis" : `₹${event.price}`}
                                    </span>
                                    {event.price > 0 && <span className="text-sm font-medium text-slate-400">/ person</span>}
                                </div>
                            </div>

                            <div className="mb-8 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase tracking-widest">Availability</span>
                                    {isSoldOut ? (
                                        <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">SOLD OUT</span>
                                    ) : (
                                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                            {seatsLeft ? `${seatsLeft} LEFT` : "OPEN"}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-1000"
                                        style={{ width: isSoldOut ? '100%' : seatsLeft ? `${(event._count.bookings / event.capacity) * 100}%` : '20%' }}
                                    ></div>
                                </div>
                            </div>

                            {!isSoldOut && (
                                <TenantBookingForm
                                    tenantSlug={tenantSlug}
                                    eventId={event.id}
                                    price={event.price}
                                />
                            )}

                            <p className="mt-6 text-center text-[10px] text-slate-500 font-medium">
                                Secure checkout powered by <span className="font-black text-slate-400">EventPass</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
