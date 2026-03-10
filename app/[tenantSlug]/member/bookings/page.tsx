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
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="glass-header border-b border-slate-200/50 py-6 mb-12 shadow-sm">
                <div className="mx-auto max-w-5xl px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <span className="text-2xl">🎟️</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Wallet & History</h1>
                            <p className="text-[10px] font-black text-[#F05A44] uppercase tracking-[0.3em]">{tenantSlug}</p>
                        </div>
                    </div>
                    <MemberLogoutButton />
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-8">
                {/* Notifications Section */}
                {notifications.length > 0 && (
                    <div className="mb-14">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</h2>
                            <span className="h-[1px] flex-grow mx-6 bg-slate-200/50"></span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {notifications.map(n => (
                                <div key={n.id} className="wowsly-card p-6 !rounded-3xl flex gap-4 items-start">
                                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-[#F05A44] shadow-[0_0_8px_rgba(240,90,68,0.5)]'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight mb-2">{n.title}</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">{n.message}</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-8 flex items-end justify-between px-2">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Your Reservations</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Verified Ticket Ledger</p>
                    </div>
                    <Link href={`/${tenantSlug}`} className="text-sm font-bold text-[#F05A44] hover:underline underline-offset-4 transition-all">
                        + Browse Events
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div className="wowsly-card py-24 text-center border-dashed border-2 bg-slate-50/50">
                        <div className="text-5xl mb-6">🎟️</div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No active reservations</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">Your future event tickets will appear here once verified.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((b) => (
                            <div key={b.id} className="wowsly-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                <div className="flex gap-6 items-center">
                                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        {b.event.category === "music" ? "🎵" : b.event.category === "sports" ? "🏀" : "🎟️"}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 leading-none mb-3 group-hover:text-[#F05A44] transition-colors">{b.event.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                                {new Date(b.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{b.event.venue}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-6 shrink-0">
                                    <div className="flex items-center gap-10">
                                        <div className="md:text-right">
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{b.amount}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-50">{b.utr || "FREE REG"}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {b.status === "confirmed" && (
                                                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-2 text-[10px] font-black uppercase text-emerald-600 tracking-widest shadow-sm shadow-emerald-50">Confirmed</div>
                                            )}
                                            {b.status === "pending_verification" && (
                                                <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-2 text-[10px] font-black uppercase text-amber-600 tracking-widest shadow-sm shadow-amber-50 animate-pulse">Verifying</div>
                                            )}
                                            {b.status === "rejected" && (
                                                <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-2 text-[10px] font-black uppercase text-red-600 tracking-widest shadow-sm shadow-red-50">Rejected</div>
                                            )}
                                            {b.status === "pending" && (
                                                <div className="rounded-2xl bg-slate-100 border border-slate-200 px-5 py-2 text-[10px] font-black uppercase text-slate-600 tracking-widest shadow-sm shadow-slate-50">Pending</div>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/${tenantSlug}/tickets/${b.id}`}
                                        className="pill-button !py-3 !px-6 bg-slate-900 text-white text-[10px] group-hover:bg-[#F05A44] transition-colors">
                                        {b.status === 'confirmed' ? '🎫 VIEW TICKET' : '📄 VIEW STATUS'}
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
