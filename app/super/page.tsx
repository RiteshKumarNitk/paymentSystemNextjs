import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SuperLogout from "@/components/super/SuperLogout";

export const dynamic = "force-dynamic";

export default async function SuperDashboardPage() {
    // 1. Fetch Aggregated Data
    const [tenants, totalUsers, bookings, recentBookings] = await Promise.all([
        // Pull tenants with their _count metrics, ordered by bookings to identify "Whales"
        prisma.tenant.findMany({
            include: {
                _count: {
                    select: { events: true, bookings: true, members: true }
                }
            },
            orderBy: {
                bookings: { _count: 'desc' } // Leaderboard sorting
            }
        }),
        prisma.user.count(),
        // Pull all confirmed bookings to calculate GPV
        prisma.booking.findMany({
            where: { status: 'confirmed' },
            select: { amount: true }
        }),
        // Pull recent activity for velocity
        prisma.booking.findMany({
            where: { status: 'confirmed' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { event: { select: { title: true } }, tenant: { select: { name: true } } }
        })
    ]);

    // 2. Compute SaaS Metrics
    const grossProcessingVolume = bookings.reduce((sum: number, b: any) => sum + b.amount, 0);
    // Assuming a hypothetical platform take-rate of 5% for the metric display
    const estimatedRevenue = grossProcessingVolume * 0.05; 
    
    // Identify Stalled Onboarding (Tenants with 0 events)
    const stalledTenants = tenants.filter((t: any) => t._count.events === 0 && t.isActive).length;
    // Identify Active Velocity (Recent tenant signups within 30 days - simple proxy here)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newTenantsThisMonth = tenants.filter((t: any) => new Date(t.createdAt) > thirtyDaysAgo).length;

    // Formatting Helpers
    const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Command Center Header */}
            <div className="bg-indigo-900 text-white px-8 py-10 rounded-b-[3rem] shadow-2xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            </span>
                            Systems Operational
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">Platform Command</h1>
                        <p className="text-indigo-200 font-medium">Real-time telemetry and revenue operations.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/super/tenants/new"
                            className="rounded-2xl bg-white text-indigo-900 px-6 py-3 text-sm font-black shadow-lg transition hover:bg-indigo-50 active:scale-95">
                            + Provision Workspace
                        </Link>
                        <SuperLogout />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 space-y-10">
                
                {/* 1. Core Financial Metrics (The "Where is the money" row) */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Financial Telemetry</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 text-9xl text-indigo-500 opacity-40">₹</div>
                            <p className="text-indigo-200 font-medium text-sm mb-2 relative z-10">Gross Processing Vol. (GPV)</p>
                            <p className="text-5xl font-black tracking-tighter relative z-10">{formatINR(grossProcessingVolume)}</p>
                            <p className="text-xs text-indigo-300 font-medium mt-4 relative z-10">Total economic activity processed.</p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
                            <p className="text-slate-500 font-medium text-sm mb-2">Est. Platform Revenue</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter">{formatINR(estimatedRevenue)}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-max">
                                <span>↑ Output Healthy</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-2">Assuming 5% take-rate model.</p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-slate-500 font-medium text-sm mb-2">User Velocity</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalUsers}</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6">
                                <div className="bg-indigo-500 h-full w-[80%] rounded-full"></div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-2">Total registered accounts on platform.</p>
                        </div>
                    </div>
                </section>

                {/* 2. Operational Insights & Alerts */}
                <div className="grid lg:grid-cols-3 gap-10">
                    <section className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Workspace Activity Feed</h2>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">Live</span>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            {recentBookings.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {recentBookings.map((booking: any) => (
                                        <li key={booking.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-black">
                                                    +
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{booking.tenant?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{booking.event?.title || 'Event'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900">{formatINR(booking.amount)}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(booking.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-slate-400 font-medium">No recent transactional activity detected.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Action Alerts</h2>
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-[2rem] relative overflow-hidden group hover:bg-yellow-100 transition cursor-pointer">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition">→</div>
                                <div className="text-3xl mb-2">⏳</div>
                                <p className="font-bold text-yellow-900 text-lg">{stalledTenants} Stalled Onboards</p>
                                <p className="text-xs text-yellow-700 font-medium mt-1">Workspaces created but no events published. High churn risk.</p>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] relative overflow-hidden group hover:bg-emerald-100 transition cursor-pointer">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition">→</div>
                                <div className="text-3xl mb-2">🚀</div>
                                <p className="font-bold text-emerald-900 text-lg">{newTenantsThisMonth} New Workspaces</p>
                                <p className="text-xs text-emerald-700 font-medium mt-1">Tenant acquisition velocity over the last 30 days.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. Whale Identification Data Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Tenant Intelligence Database</h2>
                        <span className="text-xs font-bold text-slate-500">{tenants.length} Total</span>
                    </div>
                    <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Organization / Slug</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Engagement</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Routing</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Sys Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-8 py-6">
                                            <p className="font-black text-slate-900 text-sm">{t.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">jaipurfest.com/<span className="text-indigo-600 font-medium">{t.slug}</span></p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-lg font-black text-slate-900">{t._count.events}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Events</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-black text-indigo-600">{t._count.bookings}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Txns</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-black text-slate-900">{t._count.members}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Members</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-700">{t.upiId}</p>
                                            <p className="text-[10px] font-medium text-slate-400 capitalize mt-0.5">{t.upiName}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {t.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/super/tenants/${t.id}`} 
                                                className="inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm border border-slate-200 transition hover:bg-slate-50 hover:text-indigo-900 opacity-0 group-hover:opacity-100">
                                                Manage Intel
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}

