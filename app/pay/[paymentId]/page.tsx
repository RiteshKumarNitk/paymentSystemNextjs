import Script from "next/script";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { razorpayPublicConfig } from "@/lib/razorpay";
import PaymentCheckoutButton from "./PaymentCheckoutButton";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function PaymentPage({ params }: PageProps) {
  const { paymentId } = await params;

  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentId }
  });

  if (!paymentRequest) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <section className="w-full rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Complete Your Payment</h1>
        <div className="mt-4 space-y-2 text-slate-700">
          <p>
            Customer: <span className="font-medium">{paymentRequest.customerName}</span>
          </p>
          <p>
            Ticket: <span className="font-medium">{paymentRequest.ticketType}</span>
          </p>
          <p className="text-lg">
            Amount: <span className="font-bold text-slate-900">INR {paymentRequest.amount}</span>
          </p>
          <p>
            Status:{" "}
            <span
              className={`font-medium ${
                paymentRequest.paymentStatus === "SUCCESS"
                  ? "text-emerald-700"
                  : paymentRequest.paymentStatus === "FAILED"
                    ? "text-red-700"
                    : "text-amber-700"
              }`}
            >
              {paymentRequest.paymentStatus}
            </span>
          </p>
        </div>

        {!paymentRequest.razorpayOrderId ? (
          <p className="mt-4 text-sm text-red-600">Razorpay order not found for this request.</p>
        ) : !razorpayPublicConfig.keyId ? (
          <p className="mt-4 text-sm text-red-600">
            Razorpay key is missing. Please set `RAZORPAY_KEY_ID` in environment variables.
          </p>
        ) : (
          <div className="mt-6">
            <PaymentCheckoutButton
              paymentRequestId={paymentRequest.id}
              razorpayOrderId={paymentRequest.razorpayOrderId}
              customerName={paymentRequest.customerName}
              customerPhone={paymentRequest.customerPhone}
              customerEmail={paymentRequest.customerEmail}
              ticketType={paymentRequest.ticketType}
              amount={paymentRequest.amount}
              razorpayKeyId={razorpayPublicConfig.keyId}
              disabled={paymentRequest.paymentStatus === "SUCCESS"}
            />
          </div>
        )}
      </section>
    </main>
  );
}

