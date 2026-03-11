import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TenantBookingActions from "@/components/tenant/TenantBookingActions";

export const dynamic = "force-dynamic";

export default async function TenantAdminBookingsPage({
    params,
    searchParams
}: {
    params: Promise<{ tenantSlug: string }>;
    searchParams: Promise<{ eventId?: string }>;
}) {
    const { tenantSlug } = await params;
    const { eventId } = await searchParams;

    // 1. Fetch Tenant Context
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        include: {
            events: { select: { id: true, title: true }, orderBy: { date: "desc" } }
        }
    });

    if (!tenant) return notFound();

    // 2. Fetch Bookings for this tenant
    const bookings = await prisma.booking.findMany({
        where: {
            tenantId: tenant.id,
            ...(eventId ? { eventId } : {})
        },
        include: { event: true },
        orderBy: { createdAt: "desc" },
    });

    const pendingCount = (bookings as Array<any>).filter((b: any) => b.status === "pending_verification").length;

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <Link href={`/${tenantSlug}/admin`} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-widest">
                        ← Dashboard
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                        <h1 className="text-3xl font-black text-slate-900">Financial Ledger</h1>
                        {pendingCount > 0 && (
                            <span className="animate-pulse rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest">
                                {pendingCount} Awaiting Verification
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Verify UTR and confirm reservations for {tenant.name}.</p>
                </div>

                <a href={`/api/${tenantSlug}/admin/bookings/export`}
                    className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-sm hover:shadow-md">
                    <span>📥</span> Download CSV
                </a>
            </div>

            {/* Event Filter Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Link href={`/${tenantSlug}/admin/bookings`}
                    className={`shrink-0 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${!eventId ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>
                    All Transactions
                </Link>
                {tenant.events.map((e: any) => (
                    <Link key={e.id} href={`/${tenantSlug}/admin/bookings?eventId=${e.id}`}
                        className={`shrink-0 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all max-w-[200px] truncate ${eventId === e.id ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>
                        {e.title}
                    </Link>
                ))}
            </div>

            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-100 border border-slate-100">
                {bookings.length === 0 ? (
                    <div className="py-24 text-center">
                        <span className="text-5xl mb-4 block">💳</span>
                        <h3 className="text-xl font-bold text-slate-900">No records found</h3>
                        <p className="text-slate-400 font-medium mt-1">Transactions will appear here once members start booking.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Member Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Financials</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">UPI Ref (UTR)</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bookings.map((b: any) => (
                                    <tr key={b.id} className="group hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{b.event.title}</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">#{b.orderId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{(b as any).name || (b as any).member?.name}</p>
                                            <p className="text-[10px] font-medium text-slate-500">{(b as any).email || (b as any).member?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-sm font-black ${b.amount === 0 ? "text-emerald-500" : "text-indigo-600"}`}>
                                                {b.amount === 0 ? "FREE" : `₹${b.amount}`}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400">Confirmed Method</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-600">
                                                {b.utr || "—"}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <TenantBookingActions tenantSlug={tenantSlug} bookingId={b.id} status={b.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="mt-8 text-center text-xs text-slate-300 font-bold uppercase tracking-[0.3em]">
                End of Audit Trail
            </p>
        </main>
    );
}
