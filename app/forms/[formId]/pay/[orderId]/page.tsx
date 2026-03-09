import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { buildUpiPaymentLink, getUpiConfig } from "@/lib/upi";
import UtrSubmitForm from "./UtrSubmitForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ formId: string; orderId: string }> };

export default async function FormQrPage({ params }: Props) {
    const { orderId } = await params;
    const payment = await prisma.userPayment.findUnique({
        where: { orderId },
        include: { form: { select: { title: true, id: true } } }
    });

    if (!payment) notFound();

    let upiLink = "";
    let qrDataUrl = "";
    let upiConfigError = "";

    try {
        const { upiId, businessName } = getUpiConfig();
        upiLink = buildUpiPaymentLink({ upiId, businessName, amount: payment.amount, orderId: payment.orderId });
        qrDataUrl = await QRCode.toDataURL(upiLink);
    } catch (e) {
        upiConfigError = e instanceof Error ? e.message : "UPI configuration error.";
    }

    return (
        <main className="min-h-screen bg-slate-50 py-8">
            <div className="mx-auto max-w-lg px-4">
                <Link href={payment.form?.id ? `/forms/${payment.form.id}` : "/"}
                    className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
                    ← Back
                </Link>

                <section className="rounded-xl bg-white p-7 shadow">
                    <h1 className="text-xl font-bold text-slate-900">
                        {payment.form?.title ?? "Pay via UPI"}
                    </h1>
                    <p className="text-sm text-slate-500">Order: {payment.orderId}</p>

                    <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                        <div className="flex justify-between"><span>Name</span><span className="font-medium">{payment.name}</span></div>
                        <div className="flex justify-between"><span>Amount</span><span className="font-semibold text-indigo-700 text-base">₹{payment.amount}</span></div>
                        <div className="flex justify-between"><span>Status</span><span className="capitalize">{payment.status.replace("_", " ")}</span></div>
                    </div>

                    {upiConfigError ? (
                        <p className="mt-4 text-sm text-red-600">{upiConfigError}</p>
                    ) : (
                        <>
                            <div className="mt-5 flex justify-center">
                                <Image src={qrDataUrl} alt="UPI QR code" width={220} height={220} className="rounded-xl border-4 border-indigo-100" />
                            </div>
                            <Link href={upiLink}
                                className="mt-4 block rounded-lg bg-indigo-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-indigo-700">
                                Open UPI App
                            </Link>
                            <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 space-y-1">
                                <p>1. Scan the QR code or tap "Open UPI App"</p>
                                <p>2. Pay exactly ₹{payment.amount}</p>
                                <p>3. Copy your UTR from the app and submit below</p>
                            </div>
                        </>
                    )}

                    <UtrSubmitForm orderId={payment.orderId} />
                </section>
            </div>
        </main>
    );
}
