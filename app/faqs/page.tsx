import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

export default function GenericMarketingPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <GlobalHeader />
            <main className="py-40 px-8 text-center">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-8 uppercase italic underline decoration-[#F05A44]">Coming Soon.</h1>
                    <p className="text-xl text-slate-500 font-medium">We are currently perfecting this section to provide you with the best event-tech experience. Check back in a few days!</p>
                    <div className="mt-20 py-10 border-t border-slate-200">
                        <span className="text-8xl">🏗️</span>
                    </div>
                </div>
            </main>
            <GlobalFooter />
        </div>
    );
}
