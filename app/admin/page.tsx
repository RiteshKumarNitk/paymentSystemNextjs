import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminLogout from "./AdminLogout";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const now = new Date();
    const [eventCount, upcomingCount, pendingCount, totalBookings] = await Promise.all([
        prisma.event.count(),
        prisma.event.count({ where: { date: { gte: now }, isActive: true } }),
        prisma.booking.count({ where: { status: "pending_verification" } }),
        prisma.booking.count()
    ]);

    const stats = [
        { label: "Total Events", value: eventCount, sub: `${upcomingCount} upcoming`, color: "from-indigo-500 to-violet-600" },
        { label: "Pending Verification", value: pendingCount, sub: "awaiting review", color: "from-amber-400 to-orange-500" },
        { label: "Total Bookings", value: totalBookings, sub: "all time", color: "from-emerald-500 to-teal-600" }
    ];

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">🎟️ EventPass Admin</h1>
                    <p className="text-sm text-slate-500">Manage events, bookings, and payments.</p>
                </div>
                <AdminLogout />
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {stats.map(s => (
                    <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white`}>
                        <p className="text-4xl font-extrabold">{s.value}</p>
                        <p className="mt-1 font-semibold">{s.label}</p>
                        <p className="text-sm opacity-80">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/events"
                    className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="text-3xl">🎭</div>
                    <h2 className="mt-3 text-lg font-bold group-hover:text-indigo-600 transition">Manage Events</h2>
                    <p className="mt-1 text-sm text-slate-500">Create, edit, and publish events for customers to book.</p>
                    <span className="mt-3 inline-block text-sm font-medium text-indigo-600">View Events →</span>
                </Link>
                <Link href="/admin/bookings"
                    className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="text-3xl">💳</div>
                    <h2 className="mt-3 text-lg font-bold group-hover:text-indigo-600 transition">Verify Bookings</h2>
                    <p className="mt-1 text-sm text-slate-500">Review UPI payment UTRs and confirm or reject bookings.</p>
                    {pendingCount > 0 && (
                        <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            {pendingCount} pending
                        </span>
                    )}
                </Link>
            </div>

            <div className="mt-6 text-right">
                <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">View Public Site →</Link>
            </div>
        </main>
    );
}
