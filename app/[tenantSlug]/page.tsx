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
        <div className="bg-slate-50 min-h-screen pb-40">
            {/* Split Modern Hero */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900 text-white">
                <div className="mx-auto max-w-7xl px-8 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div
                            className="inline-block px-4 py-2 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-[0.4em]"
                            style={{ backgroundColor: tenant.brandColor + '20', color: tenant.brandColor }}
                        >
                            Exclusive Access • {tenant.name}
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-10">
                            Curated <br /> <span className="italic" style={{ color: tenant.brandColor }}>Experiences.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-12">
                            {tenant.tagline || `Join the inner circle at ${tenant.name}. Secure your spot at our upcoming exclusive gatherings.`}
                        </p>
                        <div className="flex gap-4">
                            <Link href="#events" className="pill-button !px-10" style={{ backgroundColor: tenant.brandColor }}>
                                View Events
                            </Link>
                            <Link href={`/${tenantSlug}/member/login`} className="pill-button !px-10 border border-white/20 hover:bg-white/10">
                                Member Login
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:block relative">
                        <div className="relative h-[500px] w-full rounded-[4rem] overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                            {tenant.logoUrl ? (
                                <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-6xl">✨</div>
                            )}
                            <div className="absolute bottom-12 left-12 z-20">
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Verified Host</p>
                                <h2 className="text-4xl font-black tracking-tighter">{tenant.name}</h2>
                            </div>
                        </div>
                        {/* Decorative floating sphere */}
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-50" style={{ backgroundColor: tenant.brandColor }}></div>
                    </div>
                </div>

                {/* Background flourish */}
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
            </section>

            <main id="events" className="mx-auto max-w-7xl px-8 py-24">
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Upcoming Series</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">Verified Booking Directory</p>
                </div>

                {/* Upcoming List */}
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.length === 0 ? (
                        <div className="col-span-full py-32 text-center rounded-[3rem] border-4 border-dashed border-slate-200">
                            <div className="text-6xl mb-6">📅</div>
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Quiet on the front</h3>
                            <p className="text-slate-400 font-medium">No upcoming events scheduled right now.</p>
                        </div>
                    ) : upcomingEvents.map((e: any) => (
                        <Link key={e.id} href={`/${tenantSlug}/events/${e.id}`}
                            className="wowsly-card group block overflow-hidden !rounded-[3rem]">
                            <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative">
                                {e.imageUrl ? (
                                    <img src={e.imageUrl} alt={e.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-6xl opacity-20">🖼️</div>
                                )}
                                <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                                    <p className="text-lg font-black text-slate-900">
                                        {e.price === 0 ? "FREE" : `₹${e.price}`}
                                    </p>
                                </div>
                            </div>
                            <div className="p-10">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 transition-colors">
                                        {e.category}
                                    </span>
                                </div>
                                <h3 className="mb-10 text-3xl font-black text-slate-900 group-hover:translate-x-1 transition-transform tracking-tighter leading-none">{e.title}</h3>

                                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(e.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{e.venue}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-900 group-hover:text-white"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <section className="mt-40">
                        <div className="flex items-center gap-6 mb-12">
                            <h2 className="text-xl font-black text-slate-300 uppercase tracking-[0.4em] shrink-0">Archive</h2>
                            <div className="h-[1px] w-full bg-slate-200"></div>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-700">
                            {pastEvents.map((e: any) => (
                                <div key={e.id} className="wowsly-card p-8 !rounded-[2rem]">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#F05A44] mb-2">{e.category}</p>
                                    <h4 className="font-bold text-slate-900 text-lg tracking-tight mb-4">{e.title}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(e.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
