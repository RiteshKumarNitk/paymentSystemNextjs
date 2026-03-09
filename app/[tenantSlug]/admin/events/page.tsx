import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenantAdminEventsPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const { tenantSlug } = await params;

    // 1. Fetch Tenant and its Events
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        include: {
            events: {
                include: {
                    _count: {
                        select: { bookings: { where: { status: "confirmed" } } }
                    }
                },
                orderBy: { date: "desc" },
            }
        }
    });

    if (!tenant) return notFound();

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href={`/${tenantSlug}/admin`} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-widest">
                        ← Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 mt-2">Event Schedule</h1>
                    <p className="text-sm text-slate-500 font-medium">{tenant.name} Internal Catalog</p>
                </div>
                <Link href={`/${tenantSlug}/admin/events/new`}
                    className="rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 hover:scale-105 active:scale-95">
                    + Create Event
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tenant.events.length === 0 ? (
                    <div className="col-span-full rounded-[3rem] border-4 border-dashed border-slate-100 py-24 text-center">
                        <span className="text-5xl mb-4 block">📅</span>
                        <h3 className="text-xl font-bold text-slate-900">No events yet</h3>
                        <p className="text-slate-400 font-medium mt-1">Start your journey by creating your first event.</p>
                    </div>
                ) : (tenant.events as Array<any>).map((e: any) => (
                    <div key={e.id} className="group overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 transition-all hover:shadow-2xl">
                        <div className="aspect-[16/9] w-full bg-slate-100 relative">
                            {e.imageUrl ? (
                                <img src={e.imageUrl} alt={e.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-3xl opacity-30">🖼️</div>
                            )}
                            <div className="absolute top-4 right-4">
                                {e.isActive ? (
                                    <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest">Live</span>
                                ) : (
                                    <span className="rounded-full bg-slate-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest">Draft</span>
                                )}
                            </div>
                        </div>
                        <div className="p-7">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                    {e.category}
                                </span>
                                <p className="text-sm font-black text-slate-900">
                                    {e.price === 0 ? "Free" : `₹${e.price}`}
                                </p>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{e.title}</h3>
                            <div className="mb-6 space-y-1 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                <p>📅 {new Date(e.date).toLocaleDateString()}</p>
                                <p>📍 {e.venue}</p>
                                <p className="text-indigo-600 mt-2">✨ {e._count.bookings} / {e.capacity || "∞"} Booked</p>
                            </div>

                            <div className="flex items-center gap-2 border-t border-slate-50 pt-6">
                                <Link href={`/${tenantSlug}/admin/events/${e.id}/edit`}
                                    className="flex-1 rounded-xl bg-slate-50 py-3 text-center text-xs font-black text-slate-600 transition hover:bg-slate-100">
                                    Manage Details
                                </Link>
                                <Link href={`/${tenantSlug}/events/${e.id}`} target="_blank"
                                    className="rounded-xl border border-slate-100 p-3 text-slate-400 transition hover:text-indigo-600 hover:bg-indigo-50">
                                    ↗
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
