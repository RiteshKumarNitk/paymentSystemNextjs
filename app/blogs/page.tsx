import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

export default function BlogsPage() {
    const posts = [
        {
            title: "How QR Codes are Revolutionizing Event Entry",
            tag: "Technology",
            date: "Mar 10, 2026",
            image: "⚡"
        },
        {
            title: "Why WhatsApp is the Ultimate Event Notification Tool",
            tag: "Growth",
            date: "Mar 8, 2026",
            image: "💬"
        },
        {
            title: "Scaling Mega Events: Lessons from Taj Hotel",
            tag: "Case Study",
            date: "Mar 5, 2026",
            image: "🏨"
        },
        {
            title: "The Future of Digital Wallets in Event Management",
            tag: "Fintech",
            date: "Feb 28, 2026",
            image: "💰"
        },
        {
            title: "5 Tips to Increase Ticket Sales for Your Next Event",
            tag: "Marketing",
            date: "Feb 20, 2026",
            image: "🚀"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <GlobalHeader />

            <main className="py-24 px-8">
                <div className="mx-auto max-w-7xl mb-20 text-center">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-8">Event-Tech <br /> <span className="text-[#F05A44]">Insights.</span></h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Discover how technology is changing the way we experience gatherings.</p>
                </div>

                <div className="mx-auto max-w-7xl grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                        <div key={post.title} className="wowsly-card p-10 group cursor-pointer hover:border-[#F05A44]/20">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-500">
                                {post.image}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#F05A44] mb-3 block">{post.tag}</span>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-8 group-hover:text-[#F05A44] transition-colors">{post.title}</h3>
                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{post.date}</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Read More →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <GlobalFooter />
        </div>
    );
}
