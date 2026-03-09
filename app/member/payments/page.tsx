import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import MemberLogoutButton from "./MemberLogoutButton";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    pending_verification: "bg-blue-100 text-blue-700",
    verified: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700"
};

export default async function MemberPaymentsPage() {
    const member = await getCurrentMember();
    if (!member) redirect("/member/login");

    const payments = await prisma.userPayment.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: "desc" },
        include: { form: { select: { title: true } } }
    });

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">My Payments</h1>
                    <p className="text-sm text-slate-500">Welcome, {member.name}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                        Browse Forms
                    </Link>
                    <MemberLogoutButton />
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow">
                    <p className="text-4xl">💳</p>
                    <p className="mt-3 font-medium text-slate-700">No payments yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Visit the dashboard and make your first payment.
                    </p>
                    <Link href="/"
                        className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Browse Payment Forms
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Form</th>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">UTR</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                                <tr key={p.id} className="text-sm">
                                    <td className="px-4 py-3 font-medium">{p.form?.title ?? p.purpose}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{p.orderId}</td>
                                    <td className="px-4 py-3 font-medium">₹{p.amount}</td>
                                    <td className="px-4 py-3">{p.utr ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[p.status] ?? "bg-slate-100 text-slate-700"}`}>
                                            {p.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {p.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
