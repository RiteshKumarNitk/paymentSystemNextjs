import Link from "next/link";

export default function GlobalFooter() {
    return (
        <footer className="bg-slate-900 pt-24 pb-12 text-white overflow-hidden relative">
            <div className="mx-auto max-w-7xl px-8 relative z-10">
                <div className="grid gap-16 lg:grid-cols-4 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#F05A44] text-white">
                                <span className="text-xl">⚡</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">EventPass</span>
                        </Link>
                        <p className="text-slate-400 font-medium leading-relaxed mb-8">
                            Your digital event partner. Providing all-in-one Event Tech Solutions to scale your community.
                        </p>
                        <div className="flex gap-4">
                            {['ig', 'fb', 'tw', 'yt', 'li'].map(social => (
                                <div key={social} className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#F05A44] transition-colors cursor-pointer border border-white/5">
                                    <span className="text-xs font-black uppercase">{social}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigations */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#F05A44] mb-8">Navigations</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors font-medium">About Wowsly</Link></li>
                            <li><Link href="/faqs" className="text-slate-400 hover:text-white transition-colors font-medium">FAQs</Link></li>
                            <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors font-medium">Contact Us</Link></li>
                            <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors font-medium">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Helpful Links */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#F05A44] mb-8">Helpful Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="/#explore" className="text-slate-400 hover:text-white transition-colors font-medium">Active Events</Link></li>
                            <li><Link href="/mega-events" className="text-slate-400 hover:text-white transition-colors font-medium">Mega Events</Link></li>
                            <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Our Pricing</Link></li>
                            <li><Link href="/blogs" className="text-slate-400 hover:text-white transition-colors font-medium">Event-Tech Blogs</Link></li>
                            <li><Link href="/super/login" className="text-slate-400 hover:text-white transition-colors font-medium">Partner Portal</Link></li>
                        </ul>
                    </div>

                    {/* Sales & Support */}
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#F05A44] mb-6">Support</h4>
                        <p className="text-sm text-slate-300 font-medium mb-8 leading-relaxed">
                            Need help? Our team is available for 24/7 technical assistance.
                        </p>
                        <div className="space-y-4">
                            <Link href="/support" className="pill-button bg-white text-slate-900 !py-3 !text-[10px] hover:bg-slate-100">
                                Get Support
                            </Link>
                            <Link href="/feedback" className="pill-button border border-white/20 text-white !py-3 !text-[10px] hover:bg-white/10">
                                Give Feedback
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sub-footer */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2026 EVENTPASS • ALL RIGHTS RESERVED</p>
                    <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="hover:text-[#F05A44] cursor-pointer transition-colors">Infrastructure State: Stable</span>
                        <span className="hover:text-[#F05A44] cursor-pointer transition-colors">V: 2.1.0-WOW</span>
                    </div>
                </div>
            </div>

            {/* Background Polish */}
            <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 bg-[#F05A44]/10 rounded-full blur-[100px]"></div>
        </footer>
    );
}
