import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    paymentRequestId?: string;
    paymentId?: string;
    amount?: string;
    date?: string;
  }>;
};

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentRequestId = params.paymentRequestId ?? "";
  const paymentId = params.paymentId ?? "N/A";
  const amount = params.amount ?? "N/A";
  const paidAt = params.date ? new Date(params.date) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <section className="w-full rounded-xl border border-emerald-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-emerald-700">Payment Successful</h1>
        <div className="mt-4 space-y-2 text-slate-700">
          <p>
            Payment ID: <span className="font-medium">{paymentId}</span>
          </p>
          <p>
            Amount: <span className="font-medium">INR {amount}</span>
          </p>
          <p>
            Date:{" "}
            <span className="font-medium">
              {paidAt ? paidAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
            </span>
          </p>
        </div>
        {paymentRequestId ? (
          <div className="mt-5">
            <Link
              href={`/api/payment/receipt/${paymentRequestId}`}
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Download Receipt (PDF)
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
