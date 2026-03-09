import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FormActions from "./FormActions";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
    const forms = await prisma.paymentForm.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { payments: true } } }
    });

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Payment Forms</h1>
                    <p className="text-sm text-slate-500">Create and manage public payment forms.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/payments"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                        View Payments
                    </Link>
                    <Link href="/admin/forms/new"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                        + New Form
                    </Link>
                </div>
            </div>

            {forms.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow">
                    <p className="text-4xl">📋</p>
                    <p className="mt-3 font-medium text-slate-700">No forms yet</p>
                    <p className="mt-1 text-sm text-slate-500">Create your first payment form.</p>
                    <Link href="/admin/forms/new"
                        className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
                        Create Form
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {forms.map((form) => (
                        <div key={form.id} className="rounded-xl bg-white p-5 shadow">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-slate-900 truncate">{form.title}</h2>
                                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{form.description}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${form.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {form.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                <span className="font-medium text-slate-900">
                                    {form.amount === 0 ? "Variable amount" : `₹${form.amount}`}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span>{form._count.payments} payment{form._count.payments !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <FormActions formId={form.id} isActive={form.isActive} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
