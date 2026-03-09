import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingActions from "./BookingActions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ eventId?: string }> };

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    pending_verification: "bg-blue-100 text-blue-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-500"
};

export default async function AdminBookingsPage({ searchParams }: Props) {
    const { eventId } = await searchParams;

    const [bookings, events] = await Promise.all([
        prisma.booking.findMany({
            where: eventId ? { eventId } : {},
            orderBy: { createdAt: "desc" },
            include: { event: { select: { title: true } } }
        }),
        prisma.event.findMany({ select: { id: true, title: true }, orderBy: { date: "desc" } })
    ]);

    const pendingCount = bookings.filter(b => b.status === "pending_verification").length;

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    {pendingCount > 0 && (
                        <p className="text-sm text-amber-600 font-medium">{pendingCount} booking{pendingCount !== 1 ? "s" : ""} pending verification</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link href="/admin" className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">← Dashboard</Link>
                </div>
            </div>

            {/* Event filter */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                <Link href="/admin/bookings"
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${!eventId ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    All Events
                </Link>
                {events.map(e => (
                    <Link key={e.id} href={`/admin/bookings?eventId=${e.id}`}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition truncate max-w-[200px] ${eventId === e.id ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {e.title}
                    </Link>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
                    <p className="text-4xl">📭</p>
                    <p className="mt-3 font-medium text-slate-700">No bookings yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">UTR</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.map(b => (
                                <tr key={b.id} className="text-sm">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{b.event.title}</p>
                                        <p className="font-mono text-xs text-slate-400">{b.orderId}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{b.name}</p>
                                        <p className="text-xs text-slate-400">{b.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-indigo-700">{b.amount === 0 ? "FREE" : `₹${b.amount}`}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{b.utr ?? "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[b.status] ?? ""}`}>
                                            {b.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {b.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <BookingActions orderId={b.orderId} status={b.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
