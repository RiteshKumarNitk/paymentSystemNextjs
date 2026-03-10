import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

export default function MegaEventsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <GlobalHeader />
            <main className="py-40 px-8 text-center">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-20">
                        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-slate-900 mb-8 uppercase">Mega <br /> <span className="text-[#F05A44]">Events.</span></h1>
                        <p className="text-2xl text-slate-400 font-bold uppercase tracking-[0.3em]">Scalable Tech for 10k+ Attendees</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 text-left">
                        <div className="wowsly-card p-12 bg-slate-900 text-white">
                            <h3 className="text-3xl font-black mb-6">Stadium Entry</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">Advanced load balancing and local caching to ensure entry gates never slow down, even with zero internet connectivity.</p>
                        </div>
                        <div className="wowsly-card p-12 bg-white">
                            <h3 className="text-3xl font-black text-slate-900 mb-6">WhatsApp Campaigns</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">Bulk invite thousands of guests with personalized QR codes directly to their WhatsApp number.</p>
                        </div>
                    </div>
                </div>
            </main>
            <GlobalFooter />
        </div>
    );
}
