import Link from "next/link";
import AdminQRScanner from "@/components/admin/AdminQRScanner";

export const dynamic = "force-dynamic";

export default async function AdminScannerPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const { tenantSlug } = await params;

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="mx-auto max-w-xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <Link href={`/${tenantSlug}/admin`} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition">
                            ← Back to HQ
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">Gate Control</h1>
                    </div>
                </div>

                <AdminQRScanner tenantSlug={tenantSlug} />

                <div className="mt-12 text-center text-slate-400">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Module: ENTRY_SCAN_v1</p>
                </div>
            </div>
        </main>
    );
}
