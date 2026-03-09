import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { date: "asc" },
        include: {
            _count: {
                select: {
                    bookings: true,
                    // confirmed bookings
                }
            }
        }
    });

    const now = new Date();

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Events</h1>
                    <p className="text-sm text-slate-500">Manage your events and their bookings.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin" className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">← Dashboard</Link>
                    <Link href="/admin/events/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                        + Create Event
                    </Link>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
                    <p className="text-5xl">🎭</p>
                    <p className="mt-3 font-semibold text-slate-700">No events yet</p>
                    <Link href="/admin/events/new" className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white">
                        Create First Event
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Event</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Price</th>
                                <th className="px-5 py-3">Capacity</th>
                                <th className="px-5 py-3">Bookings</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {events.map(event => {
                                const isPast = event.date < now;
                                return (
                                    <tr key={event.id} className={`text-sm ${isPast ? "opacity-60" : ""}`}>
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-900">{event.title}</p>
                                            <p className="text-xs capitalize text-slate-400">{event.category}</p>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {event.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            <br />
                                            <span className="text-xs text-slate-400">{event.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-indigo-700">
                                            {event.price === 0 ? "FREE" : `₹${event.price}`}
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {event.capacity === 0 ? "∞" : event.capacity}
                                        </td>
                                        <td className="px-5 py-3 font-semibold">{event._count.bookings}</td>
                                        <td className="px-5 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPast ? "bg-slate-100 text-slate-500" : event.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {isPast ? "Past" : event.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Link href={`/admin/bookings?eventId=${event.id}`}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                                View Bookings →
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
