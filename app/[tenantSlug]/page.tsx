import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenantPublicPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params;

    // 1. Fetch Tenant
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        include: {
            events: {
                where: { isActive: true },
                orderBy: { date: "asc" },
            }
        }
    });

    if (!tenant || !tenant.isActive) {
        return notFound();
    }

    const now = new Date();
    const upcomingEvents = (tenant.events as Array<any>).filter((e: any) => new Date(e.date) >= now);
    const pastEvents = (tenant.events as Array<any>).filter((e: any) => new Date(e.date) < now);

    return (
        <div className="bg-slate-50/50 pb-20">
            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Welcome Section */}
                <section className="mb-20">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter sm:text-7xl">Live Experiences</h1>
                    <p className="mt-6 text-xl text-slate-500 max-w-2xl font-medium leading-relaxed italic border-l-4 border-[var(--brand-color)] pl-6">
                        {tenant.tagline || "Explore our latest gatherings and secure your spot today."}
                    </p>
                </section>

                {/* Featured / Upcoming List */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.length === 0 ? (
                        <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
                            <p className="text-xl font-bold text-slate-400 italic">No upcoming events found.</p>
                            <p className="text-slate-400 text-sm mt-1">Check back soon for updates!</p>
                        </div>
                    ) : upcomingEvents.map((e: any) => (
                        <Link key={e.id} href={`/${tenantSlug}/events/${e.id}`}
                            className="group relative overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-slate-100">
                            <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                                {e.imageUrl ? (
                                    <img src={e.imageUrl} alt={e.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 text-4xl opacity-40">🖼️</div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[var(--brand-color)] transition-colors">
                                        {e.category}
                                    </span>
                                    <p className="text-lg font-black" style={{ color: 'var(--brand-color)' }}>
                                        {e.price === 0 ? "Free" : `₹${e.price}`}
                                    </p>
                                </div>
                                <h3 className="mb-2 text-2xl font-black text-slate-900 group-hover:text-[var(--brand-color)] transition line-clamp-1 tracking-tight">{e.title}</h3>
                                <div className="space-y-1.5 text-sm text-slate-500 font-medium">
                                    <p className="flex items-center gap-2">📅 {new Date(e.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    <p className="flex items-center gap-2">📍 {e.venue}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Past Events Section */}
                {pastEvents.length > 0 && (
                    <section className="mt-20">
                        <h2 className="mb-8 text-2xl font-bold text-slate-800">Past Events</h2>
                        <div className="grid gap-4 sm:grid-cols-3 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                            {pastEvents.map(e => (
                                <div key={e.id} className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{e.category}</p>
                                    <h4 className="font-bold text-slate-800 line-clamp-1">{e.title}</h4>
                                    <p className="text-xs text-slate-500 mt-2">{new Date(e.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
