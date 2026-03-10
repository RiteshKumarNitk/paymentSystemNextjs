import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SuperLogout from "@/components/super/SuperLogout";

export const dynamic = "force-dynamic";

export default async function SuperDashboardPage() {
    const [tenants, totalUsers, totalEvents] = await Promise.all([
        prisma.tenant.findMany({
            include: {
                _count: {
                    select: { events: true, bookings: true, members: true }
                }
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.user.count(),
        prisma.event.count(),
    ]);

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">🌍 Global Workspace</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Platform-Wide Control Panel</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/super/tenants/new"
                        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95">
                        + New Organization
                    </Link>
                    <SuperLogout />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider text-xs">Active Tenants</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{tenants.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider text-xs">Total Users</p>
                    <p className="text-3xl font-bold text-violet-600 mt-1">{totalUsers}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider text-xs">Historical Events</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{totalEvents}</p>
                </div>
            </div>

            <h2 className="mb-4 text-xl font-bold text-slate-800">Managed Organizations</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Tenant Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">URL Slug</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Usage</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">UPI Config</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tenants.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900">{t.name}</p>
                                    <p className="text-xs text-slate-400">Created {new Date(t.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">/{t.slug}</code>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-4 text-xs">
                                        <span title="Events">🎭 {t._count.events}</span>
                                        <span title="Bookings">💳 {t._count.bookings}</span>
                                        <span title="Members">👥 {t._count.members}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-medium text-slate-700">{t.upiId}</p>
                                    <p className="text-[10px] text-slate-400 capitalize">{t.upiName}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {t.isActive ? (
                                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/super/tenants/${t.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase">Manage</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
