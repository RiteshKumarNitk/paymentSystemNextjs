import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLoggedInMemberBySlug } from "@/lib/member";
import { notFound, redirect } from "next/navigation";
import MemberLogoutButton from "@/components/member/MemberLogoutButton";

export const dynamic = "force-dynamic";

export default async function TenantMemberBookingsPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const { tenantSlug } = await params;

    // 1. Authenticate member for THIS tenant
    const member = await getLoggedInMemberBySlug(tenantSlug);
    if (!member) {
        return redirect(`/${tenantSlug}/member/login`);
    }

    // 2. Fetch bookings
    const bookings = await prisma.booking.findMany({
        where: { memberId: member.id, tenant: { slug: tenantSlug } },
        include: { event: true },
        orderBy: { createdAt: "desc" },
    });

    // 3. Fetch notifications
    const notifications = await prisma.notification.findMany({
        where: { memberId: member.id, tenantId: member.tenantId },
        orderBy: { createdAt: "desc" },
        take: 5
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <header className="bg-white border-b border-slate-100 py-6 mb-8 shadow-sm">
                <div className="mx-auto max-w-4xl px-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wallet & History</h1>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tenantSlug}</p>
                    </div>
                    <MemberLogoutButton />
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4">
                {/* Notifications Section */}
                {notifications.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Recent Activity</h2>
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div key={n.id} className="group relative overflow-hidden rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex gap-4 items-start transition-all hover:shadow-md">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-indigo-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{n.title}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{n.message}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Your Reservations</h2>
                    <Link href={`/${tenantSlug}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                        + Browse more events
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div className="rounded-3xl bg-white py-16 text-center border border-slate-100 shadow-sm">
                        <p className="text-3xl mb-4">🎟️</p>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h3>
                        <p className="text-sm text-slate-500">Your future event tickets will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((b) => (
                            <div key={b.id} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                                <div className="flex gap-4 items-center">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
                                        {b.event.category === "music" ? "🎵" : b.event.category === "sports" ? "🏀" : "🎟️"}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 leading-tight">{b.event.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            {new Date(b.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {b.event.venue}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">₹{b.amount}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{b.utr || "Free Registration"}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {b.status === "confirmed" && (
                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 shadow-sm shadow-emerald-50 text-center inline-block">Confirmed</span>
                                            )}
                                            {b.status === "pending_verification" && (
                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700 shadow-sm shadow-amber-50 text-center inline-block">Verifying</span>
                                            )}
                                            {b.status === "rejected" && (
                                                <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase text-red-700 shadow-sm shadow-red-50 text-center inline-block">Rejected</span>
                                            )}
                                            {b.status === "pending" && (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-500 shadow-sm shadow-slate-50 text-center inline-block">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/${tenantSlug}/tickets/${b.id}`}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800 transition">
                                        {b.status === 'confirmed' ? '🎫 View Ticket' : '📄 View Status'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
