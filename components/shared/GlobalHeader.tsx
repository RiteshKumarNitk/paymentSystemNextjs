import Link from "next/link";

export default function GlobalHeader() {
    return (
        <nav className="glass-header border-b border-slate-200/50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-[#F05A44] text-white shadow-xl shadow-red-200">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900">EventPass</span>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#explore" className="text-sm font-black text-slate-600 hover:text-[#F05A44] transition-colors uppercase tracking-widest">Directory</Link>
                    <Link href="/about" className="text-sm font-black text-slate-600 hover:text-[#F05A44] transition-colors uppercase tracking-widest">About</Link>
                    <Link href="/pricing" className="text-sm font-black text-slate-600 hover:text-[#F05A44] transition-colors uppercase tracking-widest">Pricing</Link>
                    <Link href="/blogs" className="text-sm font-black text-slate-600 hover:text-[#F05A44] transition-colors uppercase tracking-widest">Blogs</Link>
                    <Link href="/super/login" className="pill-button pill-button-primary !py-3 !px-7">
                        Partner Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}
