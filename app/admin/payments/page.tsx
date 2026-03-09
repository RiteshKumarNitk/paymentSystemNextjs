import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PaymentActions from "./PaymentActions";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.userPayment.findMany({
    orderBy: { createdAt: "desc" },
    include: { form: { select: { title: true } } }
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">UPI Payment Records</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/pay"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            New Payment
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3">Form</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">UTR</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                  No payment records yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="text-sm">
                  <td className="px-4 py-3 text-xs text-slate-500">{payment.form?.title ?? "-"}</td>
                  <td className="px-4 py-3">{payment.orderId}</td>
                  <td className="px-4 py-3">{payment.name}</td>
                  <td className="px-4 py-3">{payment.phone}</td>
                  <td className="px-4 py-3 capitalize">{payment.purpose}</td>
                  <td className="px-4 py-3 font-medium">INR {payment.amount}</td>
                  <td className="px-4 py-3">{payment.utr ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${payment.status === "verified"
                        ? "bg-emerald-100 text-emerald-700"
                        : payment.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : payment.status === "pending_verification"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentActions orderId={payment.orderId} status={payment.status} />
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

