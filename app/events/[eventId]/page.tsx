import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/member";
import BookingForm from "./BookingForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ eventId: string }> };

const CATEGORY_COLORS: Record<string, string> = {
    music: "from-purple-500 to-violet-600", tech: "from-blue-500 to-indigo-600",
    sports: "from-emerald-500 to-green-600", food: "from-orange-500 to-amber-600",
    art: "from-pink-500 to-rose-600", comedy: "from-yellow-400 to-orange-500",
    conference: "from-slate-500 to-gray-600", workshop: "from-teal-500 to-cyan-600",
    general: "from-indigo-500 to-blue-600"
};

export default async function EventDetailPage({ params }: Props) {
    const { eventId } = await params;
    const [event, member] = await Promise.all([
        prisma.event.findUnique({
            where: { id: eventId },
            include: { _count: { select: { bookings: { where: { status: { notIn: ["rejected", "cancelled"] } } } } } }
        }),
        getCurrentMember()
    ]);

    if (!event || !event.isActive) notFound();

    const gradient = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.general;
    const booked = event._count.bookings;
    const seatsLeft = event.capacity > 0 ? event.capacity - booked : null;
    const soldOut = seatsLeft !== null && seatsLeft <= 0;

    const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero banner */}
            <div className={`bg-gradient-to-br ${gradient} pt-8 pb-16`}>
                <div className="mx-auto max-w-3xl px-4">
                    <Link href="/" className="mb-4 inline-flex items-center text-sm text-white/70 hover:text-white">← All Events</Link>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur">{event.category}</span>
                    <h1 className="mt-3 text-4xl font-extrabold text-white leading-tight">{event.title}</h1>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 -mt-8 pb-16">
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Details card */}
                    <div className="lg:col-span-3 space-y-4">
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-3">About this event</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                        </section>
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="space-y-3 text-sm text-slate-700">
                                <div className="flex gap-3"><span className="text-xl">📅</span><div><p className="font-semibold">{formatDate(event.date)}</p><p className="text-slate-500">{formatTime(event.date)}</p></div></div>
                                <div className="flex gap-3"><span className="text-xl">📍</span><div><p className="font-semibold">{event.venue}</p></div></div>
                                <div className="flex gap-3"><span className="text-xl">💰</span><div><p className="font-semibold text-indigo-700 text-lg">{event.price === 0 ? "FREE" : `₹${event.price}`}</p></div></div>
                                {seatsLeft !== null && (
                                    <div className="flex gap-3">
                                        <span className="text-xl">{soldOut ? "🔴" : "🟢"}</span>
                                        <p className={`font-semibold ${soldOut ? "text-red-600" : "text-emerald-600"}`}>
                                            {soldOut ? "Sold Out" : `${seatsLeft} of ${event.capacity} seats available`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Booking card */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-4 rounded-2xl bg-white p-6 shadow-sm">
                            {soldOut ? (
                                <div className="text-center py-6">
                                    <p className="text-4xl">😔</p>
                                    <p className="mt-2 font-bold text-red-600">This event is sold out</p>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-1 text-2xl font-extrabold text-indigo-700">
                                        {event.price === 0 ? "FREE" : `₹${event.price}`}
                                    </p>
                                    <p className="mb-4 text-sm text-slate-500">per person</p>
                                    {!member && (
                                        <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                                            <Link href="/member/login" className="underline font-medium">Sign in</Link> to track your booking
                                        </p>
                                    )}
                                    <BookingForm
                                        eventId={eventId}
                                        fixedPrice={event.price}
                                        defaultName={member?.name ?? ""}
                                        defaultPhone={member?.phone ?? ""}
                                        defaultEmail={member?.email ?? ""}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
