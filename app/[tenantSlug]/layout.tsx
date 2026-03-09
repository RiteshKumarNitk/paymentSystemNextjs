import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Context = {
    children: React.ReactNode,
    params: Promise<{ tenantSlug: string }>
};

export default async function TenantLayout({ children, params }: Context) {
    const { tenantSlug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug }
    });

    if (!tenant) notFound();

    // Branding variables
    const brandColor = tenant.brandColor || "#4F46E5";

    return (
        <div className="min-h-screen bg-white" style={{ "--brand-color": brandColor } as any}>
            <header className="sticky top-0 z-40 border-b border-slate-50 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href={`/${tenantSlug}`} className="flex items-center gap-3 group">
                        {tenant.logoUrl ? (
                            <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-10 rounded-xl object-cover shadow-sm bg-slate-50" />
                        ) : (
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg" style={{ backgroundColor: brandColor }}>
                                {tenant.name[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-lg font-black text-slate-900 leading-none tracking-tight group-hover:text-[var(--brand-color)] transition-colors">{tenant.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Portal</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href={`/${tenantSlug}/admin/login`} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Admin</Link>
                        <Link href={`/${tenantSlug}/member/login`} className="rounded-xl border border-slate-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition shadow-sm">
                            Member Hub
                        </Link>
                    </nav>
                </div>
            </header>

            {children}

            <footer className="border-t border-slate-100 py-12 px-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Powered by EventPass Platform</p>
            </footer>
        </div>
    );
}
