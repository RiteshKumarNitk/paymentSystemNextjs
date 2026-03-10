import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <GlobalHeader />

            <main className="py-24 px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-20 text-center">
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8">Your Digital <br /> <span className="text-[#F05A44]">Event Partner.</span></h1>
                        <p className="text-2xl text-slate-500 font-medium leading-relaxed">We provide all-in-one Event Tech Solutions to help organizations create, manage, and scale their experiences with modern technology.</p>
                    </div>

                    <div className="grid gap-20 py-20 border-y border-slate-200">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">Create And Manage Events With Tech</h2>
                                <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
                                    From sending QR code invites on WhatsApp to professional E-ticketing and fast check-in systems, we handle the complexity so you can focus on the vibe.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-5 py-2 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#F05A44] shadow-sm">WhatsApp QR Invites</div>
                                    <div className="px-5 py-2 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#F05A44] shadow-sm">Fast Check-in</div>
                                    <div className="px-5 py-2 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#F05A44] shadow-sm">E-Ticketing</div>
                                </div>
                            </div>
                            <div className="wowsly-card p-12 aspect-square flex items-center justify-center bg-slate-900 text-white text-8xl">
                                ⚡
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="wowsly-card p-12 aspect-square flex items-center justify-center bg-[#F05A44] text-white text-8xl md:order-last">
                                🌍
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">Our Mission</h2>
                                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                    To empower communities and organizations worldwide with enterprise-grade event technology that is simple, scalable, and beautifully designed. We believe every gathering deserves a premium digital experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <GlobalFooter />
        </div>
    );
}
