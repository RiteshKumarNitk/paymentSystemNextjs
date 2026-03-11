import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminLogout from "@/components/admin/AdminLogout";
import RevenueChart from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

export default async function TenantAdminDashboardPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const { tenantSlug } = await params;

    // 1. Fetch Tenant context
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        include: {
            _count: {
                select: { events: true, bookings: true, members: true }
            }
        }
    });

    if (!tenant) return notFound();

    // 2. Fetch Stats
    const pendingCount = await prisma.booking.count({
        where: { tenantId: tenant.id, status: "pending_verification" }
    });

    // 3. Fetch Revenue Data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = await prisma.booking.findMany({
        where: {
            tenantId: tenant.id,
            status: "confirmed",
            createdAt: { gte: sevenDaysAgo }
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" }
    });

    const revenueMap = new Map();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        revenueMap.set(dateStr, 0);
    }

    recentBookings.forEach((b: any) => {
        const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (revenueMap.has(dateStr)) {
            revenueMap.set(dateStr, revenueMap.get(dateStr) + b.amount);
        }
    });

    const chartData = Array.from(revenueMap.entries())
        .map(([date, amount]: [any, any]) => ({ date, amount }))
        .reverse();

    const stats = [
        { label: "Our Events", value: tenant._count.events, color: "bg-indigo-600" },
        { label: "Total Bookings", value: tenant._count.bookings, color: "bg-emerald-600" },
        { label: "Community Members", value: tenant._count.members, color: "bg-violet-600" }
    ];

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl shadow-xl">
                        🏛️
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">{tenant.name}</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/${tenantSlug}`} className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition" target="_blank">
                        View Public Site ↗
                    </Link>
                    <AdminLogout />
                </div>
            </div>

            {/* Modern Bento Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {stats.map((s: any) => (
                    <div key={s.label} className="group relative overflow-hidden rounded-3xl bg-white p-7 border border-slate-100 shadow-sm transition-all hover:shadow-lg">
                        <div className={`absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 rounded-full ${s.color} opacity-[0.03] transition-transform group-hover:scale-150`}></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
                        <p className={`mt-2 text-4xl font-black text-slate-900`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Trend Section */}
            <div className="mb-10 rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Revenue Stream</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Earnings Trend (last 7 days)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600">₹{chartData.reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Period</p>
                    </div>
                </div>
                <RevenueChart data={chartData} color={tenant.brandColor || "#4F46E5"} />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                {/* Navigation Cards */}
                <Link href={`/${tenantSlug}/admin/events`}
                    className="group flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🎭</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Events</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Publish and manage attendance.</p>
                    <p className="mt-auto pt-6 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                        Dashboard <span>→</span>
                    </p>
                </Link>

                <Link href={`/${tenantSlug}/admin/bookings`}
                    className="group flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl group-hover:scale-110 transition-transform origin-left">💳</span>
                        {pendingCount > 0 && (
                            <span className="animate-pulse flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Financials</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Verify UTR and payments.</p>
                    <p className="mt-auto pt-6 text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                        Verification <span>→</span>
                    </p>
                </Link>

                <Link href={`/${tenantSlug}/admin/scanner`}
                    className="group flex flex-col rounded-3xl bg-slate-900 p-8 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-indigo-900/20">
                    <span className="text-4xl mb-4 group-hover:rotate-12 transition-transform origin-center">🔍</span>
                    <h2 className="text-xl font-bold text-white mb-2">Gate Control</h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Real-time QR verification.</p>
                    <p className="mt-auto pt-6 text-sm font-bold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                        Open Scanner <span>→</span>
                    </p>
                </Link>
            </div>

            <footer className="mt-20 border-t border-slate-200 py-10 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Global Environment Variables</p>
                <div className="flex justify-center gap-3">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-mono font-medium text-slate-500">ID: {tenant.id}</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-mono font-medium text-slate-500">VPA: {tenant.upiId}</span>
                </div>
            </footer>
        </main>
    );
}
