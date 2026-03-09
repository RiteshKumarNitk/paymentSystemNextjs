import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FormPaymentForm from "./FormPaymentForm";

type Props = { params: Promise<{ formId: string }> };

export default async function FormPage({ params }: Props) {
    const { formId } = await params;
    const form = await prisma.paymentForm.findUnique({ where: { id: formId } });

    if (!form || !form.isActive) notFound();

    return (
        <main className="min-h-screen bg-slate-50 py-8">
            <div className="mx-auto max-w-lg px-4">
                <Link href="/" className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
                    ← Back to Dashboard
                </Link>

                <section className="rounded-xl bg-white p-7 shadow">
                    {/* Form header */}
                    <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
                        <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
                        <p className="mt-1 text-sm text-slate-600">{form.description}</p>
                        {form.amount > 0 && (
                            <div className="mt-3 inline-block rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                                ₹{form.amount}
                            </div>
                        )}
                    </div>

                    <h2 className="font-semibold text-slate-800">Your Details</h2>
                    <p className="text-sm text-slate-500">Fill in your info to generate a UPI payment QR code.</p>

                    <FormPaymentForm formId={formId} fixedAmount={form.amount} />
                </section>
            </div>
        </main>
    );
}
