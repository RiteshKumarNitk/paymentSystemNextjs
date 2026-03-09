import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import MemberLogoutButton from "./MemberLogoutButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    pending_verification: "bg-blue-100 text-blue-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-500"
};

export default async function MemberBookingsPage() {
    const member = await getCurrentMember();
    if (!member) redirect("/member/login");

    const bookings = await prisma.booking.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: "desc" },
        include: { event: { select: { title: true, date: true, venue: true } } }
    });

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                    <p className="text-sm text-slate-500">Welcome back, {member.name}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Browse Events
                    </Link>
                    <MemberLogoutButton />
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
                    <p className="text-5xl">🎟️</p>
                    <p className="mt-3 text-lg font-semibold text-slate-700">No bookings yet</p>
                    <p className="mt-1 text-sm text-slate-500">Find an event and book your spot!</p>
                    <Link href="/" className="mt-5 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((b) => (
                        <div key={b.id} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-slate-900 truncate">{b.event.title}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {b.event.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        {" · "}
                                        {b.event.venue}
                                    </p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? ""}`}>
                                    {b.status.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                <span className="font-bold text-indigo-700">{b.amount === 0 ? "FREE" : `₹${b.amount}`}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono text-xs">{b.orderId}</span>
                                {b.utr && <><span className="text-slate-300">|</span><span className="font-mono text-xs text-slate-400">UTR: {b.utr}</span></>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
