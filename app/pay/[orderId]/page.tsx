import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { buildUpiPaymentLink, getUpiConfig } from "@/lib/upi";
import UtrSubmitForm from "./UtrSubmitForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function PayByOrderPage({ params }: PageProps) {
  const { orderId } = await params;
  const payment = await prisma.userPayment.findUnique({
    where: { orderId }
  });

  if (!payment) {
    notFound();
  }

  let upiLink = "";
  let qrDataUrl = "";
  let upiConfigError = "";

  try {
    const { upiId, businessName } = getUpiConfig();
    upiLink = buildUpiPaymentLink({
      upiId,
      businessName,
      amount: payment.amount,
      orderId: payment.orderId
    });
    qrDataUrl = await QRCode.toDataURL(upiLink);
  } catch (error) {
    upiConfigError = error instanceof Error ? error.message : "UPI configuration error.";
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Pay via UPI</h1>
          <p className="text-sm text-slate-600">Order ID: {payment.orderId}</p>
        </div>

        <div className="space-y-1 text-sm text-slate-700">
          <p>
            Name: <span className="font-medium">{payment.name}</span>
          </p>
          <p>
            Purpose: <span className="font-medium capitalize">{payment.purpose}</span>
          </p>
          <p>
            Amount: <span className="font-semibold text-slate-900">INR {payment.amount}</span>
          </p>
          <p>
            Status: <span className="font-medium">{payment.status}</span>
          </p>
        </div>

        {upiConfigError ? (
          <p className="mt-4 text-sm text-red-600">{upiConfigError}</p>
        ) : (
          <>
            <div className="mt-5 flex justify-center">
              <Image src={qrDataUrl} alt="UPI QR code" width={220} height={220} className="rounded-lg border" />
            </div>

            <Link
              href={upiLink}
              className="mt-4 block rounded-lg bg-slate-900 px-4 py-2 text-center text-white transition hover:bg-slate-700"
            >
              Open UPI App
            </Link>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <p>1. Scan the QR or open the UPI link.</p>
              <p>2. Pay exact amount: INR {payment.amount}.</p>
              <p>3. Submit your UTR below for verification.</p>
            </div>
          </>
        )}

        <UtrSubmitForm orderId={payment.orderId} />
      </section>
    </main>
  );
}
