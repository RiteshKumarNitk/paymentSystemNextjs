import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { events: { where: { isActive: true, date: { gte: new Date() } } } }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <GlobalHeader />

      {/* Modern Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-8 grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#F05A44] text-[10px] font-black uppercase tracking-[0.3em] mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F05A44]"></span>
              </span>
              Empowering 50+ Communities
            </div>
            <h1 className="text-6xl lg:text-9xl font-black leading-[0.85] tracking-[-0.05em] mb-12 text-slate-900">
              Jaipur <br /> <span className="text-[#F05A44] italic">Fest</span> <br /> 2026.
            </h1>
            <p className="text-2xl text-slate-600 font-medium max-w-lg leading-relaxed mb-14">
              The premier destination for the pink city's most iconic celebrations. WhatsApp invites, Fast Check-in, and more...
            </p>
            <div className="flex flex-wrap gap-6">
              <Link href="#explore" className="pill-button pill-button-primary scale-110 !px-12">
                Explore Events
              </Link>
              <Link href="/pricing" className="pill-button border-2 border-slate-900 text-slate-900 !px-12 hover:bg-slate-900 hover:text-white transition-all scale-110">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square w-full max-w-lg mx-auto rounded-[4.5rem] bg-slate-900 shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F05A44]/30 to-transparent"></div>
              <div className="absolute inset-x-12 bottom-12">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                    <div className="h-8 w-8 bg-[#F05A44] rounded-xl flex items-center justify-center text-white text-xs">QR</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-full bg-white/10 rounded-2xl animate-pulse"></div>
                    <div className="h-10 w-3/4 bg-white/10 rounded-2xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Highlights */}
            <div className="absolute -top-12 -right-12 bg-white p-8 rounded-[3rem] shadow-2xl flex items-center gap-4 border border-slate-100 animate-bounce duration-[5000ms]">
              <span className="text-4xl text-[#F05A44]">💬</span>
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">WhatsApp <br /> Automated</p>
            </div>
          </div>
        </div>

        {/* Background Flourish */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[1200px] w-[1200px] bg-red-100/40 rounded-full blur-[180px]"></div>
      </section>

      {/* Feature Grid: All-in-one Solution */}
      <section className="bg-slate-900 py-32 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-8 relative z-10">
          <div className="mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">All-in-one Event Tech.</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.5em]">Scalable Solutions for any size</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: "QR Code Invites", desc: "Send automated QR invites directly on WhatsApp. No more lost emails.", icon: "📲" },
              { title: "Fast-Pass Check-in", desc: "Scan and verify thousands of guests in minutes with our high-speed mobile check-in.", icon: "⚡" },
              { title: "E-Ticketing Suite", desc: "Full digital ticketing lifecycle. Seamless payments and member wallets baked-in.", icon: "🎫" }
            ].map(f => (
              <div key={f.title} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="text-5xl mb-10 group-hover:scale-125 transition-transform duration-500 block">{f.icon}</div>
                <h3 className="text-2xl font-black mb-6 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 bg-[#F05A44]/10 rounded-full blur-[100px]"></div>
      </section>

      {/* Directory Section */}
      <main id="explore" className="mx-auto max-w-7xl px-8 py-40">
        <div className="mb-20 flex items-end justify-between">
          <div>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">Event Directory</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-6">Browse Verified Organizations</p>
          </div>
          <span className="text-8xl font-black text-slate-100 tracking-tighter leading-none hidden md:block">01</span>
        </div>

        <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant: any) => (
            <Link key={tenant.id} href={`/${tenant.slug}`} className="wowsly-card p-12 group block !rounded-[3.5rem]">
              <div className="mb-12 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-slate-50 overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-slate-200">{tenant.name[0]}</span>
                )}
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-[#F05A44] transition-colors">{tenant.name}</h3>
              <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed min-h-[5rem] line-clamp-3">
                {tenant.tagline || `Experience curated events and premium hospitality at ${tenant.name}. Organized via JaipurFest.`}
              </p>

              <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                <div className="px-6 py-2 bg-slate-50 rounded-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F05A44]">
                    {tenant._count.events} LIVE EVENTS
                  </span>
                </div>
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 transition-all group-hover:bg-[#F05A44] group-hover:translate-x-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* MEGA EVENTS TEASER */}
      <section className="bg-[#F05A44] py-32 text-white text-center px-8 relative overflow-hidden">
        <div className="mx-auto max-w-4xl relative z-10">
          <h2 className="text-6xl lg:text-9xl font-black tracking-tight uppercase leading-[0.85] mb-12">Mega <br /> Events Only.</h2>
          <p className="text-2xl font-bold opacity-80 mb-16 tracking-tight">Scale your most ambitious gatherings with enterprise-grade infrastructure.</p>
          <div className="flex justify-center flex-wrap gap-8 items-center font-black uppercase tracking-[0.4em] text-[10px]">
            <span className="flex items-center gap-2">⚡ 10k+ Attendees</span>
            <span className="flex items-center gap-2">⚡ 0.01s Scan Speed</span>
            <span className="flex items-center gap-2">⚡ White Label Tech</span>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] bg-white/10 rounded-full blur-[120px]"></div>
      </section>

      <GlobalFooter />
    </div>
  );
}
