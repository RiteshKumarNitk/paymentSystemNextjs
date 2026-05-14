import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TenantAboutPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const { tenantSlug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug }
    });

    if (!tenant) return notFound();

    const brandColor = tenant.brandColor || "#4F46E5";

    return (
        <main className="min-h-screen bg-white">
            {/* Split layout: Image / Text */}
            <div className="mx-auto max-w-5xl px-6 py-16 grid gap-12 lg:grid-cols-2 items-center">
                
                {/* Visual side */}
                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-slate-50 border border-slate-100/50">
                    {tenant.logoUrl ? (
                        <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-8xl" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                            🏢
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-slate-100 text-slate-500">
                        About Us
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-4 mb-6 leading-none">
                        Welcome to the official <span style={{ color: brandColor }}>{tenant.name}</span> portal.
                    </h1>
                    
                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                        We are dedicated to hosting and organizing premium events that bring people together. Explore our catalog of live shows, workshops, or gala nights and secure your tickets with ease.
                    </p>

                    <div className="border-t border-slate-100 pt-8 mt-8 space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Get in touch</h3>
                            <p className="text-sm font-bold text-slate-800">support@{tenantSlug}.eventpass.com</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Location</h3>
                            <p className="text-sm font-bold text-slate-800">Corporate Office, main premises.</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <Link href={`/${tenantSlug}`} className="rounded-2xl px-6 py-4 text-sm font-black text-white shadow-xl transition hover:scale-105 active:scale-95 inline-block" style={{ backgroundColor: brandColor }}>
                            Browse Ongoing Events →
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}
