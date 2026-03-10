import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
              <span className="text-xl">🎟️</span>
            </div>
            <span className="text-xl font-black tracking-tight">EventPass</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link href="/super/login" className="hover:text-indigo-600 transition">For Partners</Link>
            <Link href="/super/login" className="rounded-full bg-slate-900 px-6 py-2.5 text-white hover:bg-slate-800 transition shadow-xl shadow-slate-200">
              Host Your Event
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">
              Platform for modern events
            </span>
            <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              Discover <span className="text-indigo-600 italic">Experiences</span> from top brands.
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed mb-10">
              Direct access to exclusive event listings from the world's most innovative organizations. Secure UPI payments baked-in.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#explore" className="rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-indigo-200 transition hover:bg-indigo-500">
                Explore Directory
              </Link>
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-6 py-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-slate-${i * 100 + 100}`}></div>)}
                </div>
                <span className="text-xs font-bold text-slate-400">Trusted by 50+ Orgs</span>
              </div>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[800px] w-[800px] bg-indigo-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[600px] w-[600px] bg-purple-100/20 rounded-full blur-[100px]"></div>
      </section>

      {/* Tenant Directory */}
      <main id="explore" className="mx-auto max-w-7xl px-6 pb-32">
        <div className="mb-12 flex items-end justify-between border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Communities</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Verified Organization Directory</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-indigo-600 leading-none">{tenants.length}</span>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Digital Hubs</p>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map(tenant => (
            <Link key={tenant.id} href={`/${tenant.slug}`} className="group relative">
              <div className="absolute inset-0 rounded-[3rem] bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
              <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 transition-all group-hover:-translate-y-2 group-hover:shadow-2xl">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
                  {tenant.logoUrl ? (
                    <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-200">{tenant.name[0]}</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition tracking-tight">{tenant.name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 line-clamp-2 leading-relaxed">
                  {tenant.tagline || `Discover the latest events and gatherings from ${tenant.name}. Organized and managed professionally.`}
                </p>

                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {tenant._count.events} Upcoming Events
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform">Visit Hub →</span>
                </div>

                {/* Decorative Brand Color Accent */}
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rotate-45" style={{ backgroundColor: tenant.brandColor + '10' }}></div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Call to Action */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[4rem] bg-slate-900 p-16 lg:p-24 text-center text-white relative overflow-hidden">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-none">Your Brand. Your Events. <br /><span className="text-indigo-400 italic">One Platform.</span></h2>
            <p className="text-lg text-slate-400 font-medium mb-12">Join 50+ organizations already using EventPass to scale their communities and automate ticketing.</p>
            <Link href="/super/login" className="rounded-2xl bg-white px-10 py-5 text-xl font-black text-slate-900 shadow-2xl transition hover:bg-slate-100 active:scale-95">
              Get Started Today
            </Link>
          </div>
          {/* Background elements */}
          <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/2 translate-y-1/2 bg-indigo-400/10 rounded-full blur-[80px]"></div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-12 px-6 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">© 2026 EventPass Infrastructure</p>
      </footer>
    </div>
  );
}
