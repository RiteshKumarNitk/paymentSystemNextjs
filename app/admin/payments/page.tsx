import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.paymentRequest.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payment Records</h1>
        <Link
          href="/admin/create-payment"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          New Payment
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No payment records yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="text-sm">
                  <td className="px-4 py-3">{payment.customerName}</td>
                  <td className="px-4 py-3">{payment.customerPhone}</td>
                  <td className="px-4 py-3">{payment.ticketType}</td>
                  <td className="px-4 py-3 font-medium">INR {payment.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        payment.paymentStatus === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-700"
                          : payment.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {payment.paymentStatus === "SUCCESS" ? (
                      <Link
                        href={`/api/payment/receipt/${payment.id}`}
                        className="text-slate-900 underline"
                        target="_blank"
                      >
                        Download
                      </Link>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {payment.createdAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
